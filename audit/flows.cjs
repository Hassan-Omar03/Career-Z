// Use a staged backend when testing changes before applying them to the sibling project.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const root = process.env.CAREERZ_AUDIT_BACKEND_ROOT
  ? path.resolve(process.env.CAREERZ_AUDIT_BACKEND_ROOT)
  : path.resolve(__dirname, '../../backend');
const backend = createRequire(path.join(root, 'package.json'));
const express = backend('express');
const mongoose = backend('mongoose');
const jwt = backend('jsonwebtoken');
const { MongoMemoryReplSet } = backend('mongodb-memory-server');
process.env.NODE_ENV = 'production';
process.env.JWT_ACCESS_SECRET = 'isolated-audit-secret';
process.env.JWT_REFRESH_SECRET = 'isolated-audit-refresh';
process.env.SMTP_HOST = '';
process.env.STRIPE_SECRET_KEY = '';
process.env.PADDLE_API_KEY = '';
const requireBackend = (name) => backend(`./src/${name}`);
// No email, paid provider, filesystem backup, or production DB access in this audit.
const email = requireBackend('services/email.service');
email.sendEmail = async () => {};
const notifications = requireBackend('services/notification.service');
notifications.notify = async () => {};
notifications.notifyAdmins = async () => {};
notifications.notifyParentsOfStudent = async () => {};
const otp = requireBackend('services/otp.service');
const issuedCodes = new Map();
otp.issueOtp = async (user, purpose) => { issuedCodes.set(`${user.id}:${purpose}`, '123456'); };
otp.verifyOtp = async (user, purpose, code) => issuedCodes.get(`${user.id}:${purpose}`) === code;
const models = {};
for (const file of fs.readdirSync(path.join(root, 'src/models'))) {
  if (file.endsWith('.js')) models[file.slice(0, -3)] = requireBackend(`models/${file}`);
}
const mounts = [...fs.readFileSync(path.join(root, 'src/routes/index.js'), 'utf8')
  .matchAll(/router\.use\('([^']+)', require\('\.\/([^']+)'\)\)/g)].map((match) => ({ prefix: match[1], file: match[2] }));
const app = express();
app.use(express.json());
const routes = [];
for (const mount of mounts) {
  const router = requireBackend(`routes/${mount.file}`);
  app.use(`/api${mount.prefix === '/' ? '' : mount.prefix}`, router);
  for (const layer of router.stack) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      routes.push({ method: method.toUpperCase(), path: `${mount.prefix === '/' ? '' : mount.prefix}${layer.route.path === '/' ? '' : layer.route.path}` || '/', module: mount.file });
    }
  }
}
app.use(requireBackend('middleware/errorHandler').notFound);
app.use(requireBackend('middleware/errorHandler').errorHandler);
const results = { target: root, date: new Date().toISOString(), routes, smoke: [], journeys: [], contracts: [], externalSkipped: [] };
if (process.argv.includes('--journeys-only')) {
  const previous = JSON.parse(fs.readFileSync(path.join(__dirname, 'flow-results.json'), 'utf8'));
  results.smoke = previous.smoke;
  results.externalSkipped = previous.externalSkipped;
}
const users = {}, tokens = {};
let base, server, database;
const missingId = '000000000000000000000001';
async function request(method, route, role, body) {
  const res = await fetch(`${base}/api${route}`, {
    method, headers: { 'Content-Type': 'application/json', ...(role ? { Authorization: `Bearer ${tokens[role] || role}` } : {}) },
    ...(method !== 'GET' ? { body: JSON.stringify(body || {}) } : {}), signal: AbortSignal.timeout(10000)
  });
  const payload = await res.json().catch(() => ({}));
  return { status: res.status, data: payload.data, message: payload.message };
}
async function check(name, method, route, role, body, expected = [200, 201], inspect) {
  try {
    const response = await request(method, route, role, body);
    const passed = expected.includes(response.status) && (!inspect || inspect(response.data));
    results.journeys.push({ name, method, route, role: role || 'anonymous', expected, status: response.status, passed: Boolean(passed), message: response.message });
    return response.data;
  } catch (error) {
    results.journeys.push({ name, passed: false, error: error.message });
  }
}
async function phase(name, work) {
  try { await work(); } catch (error) { results.journeys.push({ name: `${name} setup/continuation`, passed: false, error: error.message }); }
}
async function main() {
  database = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(database.getUri());
  await Promise.all(Object.values(models).map((model) => model.init()));
  const roles = requireBackend('config/rbac').ROLES;
  const passwordHash = await models.User.hashPassword('AuditPassword123!');
  for (const role of roles) {
    users[role] = await models.User.create({ fullName: `Audit ${role}`, email: `${role}@audit.test`, passwordHash, roles: role === 'student' ? ['student'] : ['student', role], emailVerified: true });
    tokens[role] = jwt.sign({ sub: users[role].id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
    if (requireBackend('config/rbac').APPROVAL_REQUIRED_ROLES.includes(role)) {
      await models.RoleRequest.create({ user: users[role]._id, requestedRole: role, status: 'approved' });
    }
  }
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  console.log(`Auditing ${routes.length} actual backend route declarations across ${mounts.length} modules.`);

  // Every declared route receives an anonymous request. Every GET also receives
  // each role's request. IDs intentionally miss: this checks routing/auth/errors,
  // not populated-record authorization (covered separately by journeys below).
  for (const route of process.argv.includes('--journeys-only') ? [] : routes) {
    if (/\/backups|\/sync$/.test(route.path)) { results.externalSkipped.push(route); continue; }
    const url = route.path.replace(/:[A-Za-z]+/g, missingId);
    const personas = route.method === 'GET' ? [null, ...roles] : [null];
    for (const role of personas) {
      try {
        const response = await request(route.method, url, role);
        results.smoke.push({ ...route, role: role || 'anonymous', status: response.status, message: response.message });
      } catch (error) { results.smoke.push({ ...route, role: role || 'anonymous', status: 0, message: error.message }); }
    }
  }
  console.log(`Finished ${results.smoke.length} route/auth smoke requests.`);

  await phase('Authentication', async () => {
    const register = await check('Register student', 'POST', '/auth/register', null, { fullName: 'New Student', email: 'new@audit.test', password: 'AuditPassword123!' });
    tokens.new = register.accessToken;
    await check('Email verification', 'POST', '/auth/verify-email', 'new', { code: '123456' });
    await check('Duplicate registration', 'POST', '/auth/register', null, { fullName: 'Duplicate', email: 'new@audit.test', password: 'AuditPassword123!' }, [409]);
    await check('Wrong password rejected', 'POST', '/auth/login', null, { email: 'new@audit.test', password: 'wrong' }, [401]);
    await check('Login immediately after register', 'POST', '/auth/login', null, { email: 'new@audit.test', password: 'AuditPassword123!' });
    await check('Self-elevate to admin blocked', 'POST', '/roles/request', 'new', { requestedRole: 'admin' }, [403]);
    const role = await check('Teacher role request', 'POST', '/roles/request', 'new', { requestedRole: 'teacher' });
    await check('Unverified teacher cannot create course', 'POST', '/courses', 'new', { title: 'Blocked' }, [403]);
    await check('Admin approves teacher', 'PATCH', `/roles/${role.request._id}/review`, 'super_admin', { decision: 'approved' });
    await check('Approved teacher creates course', 'POST', '/courses', 'new', { title: 'Approved course' });
    await check('Token refresh immediately after register/login', 'POST', '/auth/refresh', null, { refreshToken: register.refreshToken });
  });

  let course, lesson, assignment;
  await phase('Learning', async () => {
    course = await check('Teacher creates course', 'POST', '/courses', 'teacher', { title: 'Audit course' });
    lesson = await check('Teacher adds lesson', 'POST', `/courses/${course._id}/lessons`, 'teacher', { title: 'Lesson 1', content: 'PRIVATE LESSON CONTENT' });
    await check('Owning teacher can read draft lesson', 'GET', `/courses/${course._id}`, 'teacher', null, [200], (data) => data.lessons.length === 1);
    assignment = await check('Teacher creates assignment', 'POST', `/courses/${course._id}/assignments`, 'teacher', { title: 'Assignment', maxMarks: 100 });
    await check('Unenrolled student cannot read assignments', 'GET', `/courses/${course._id}/assignments`, 'parent', null, [403, 404]);
    await check('Teacher publishes course', 'PATCH', `/courses/${course._id}`, 'teacher', { published: true });
    await check('Anonymous cannot read protected lesson content', 'GET', `/courses/${course._id}`, null, null, [200, 403, 404], (data) => !data?.lessons?.length);
    await check('Student enrolls', 'POST', `/courses/${course._id}/enroll`, 'student');
    await check('Duplicate enrollment rejected', 'POST', `/courses/${course._id}/enroll`, 'student', null, [409]);
    const submission = await check('Student submits assignment', 'POST', `/courses/assignments/${assignment._id}/submit`, 'student', { text: 'Answer' });
    await check('Teacher grades submission', 'PATCH', `/courses/submissions/${submission._id}/grade`, 'teacher', { marksObtained: 85, feedback: 'Good' });
    await check('Student sees graded submission', 'GET', '/students/me/submissions', 'student', null, [200], (data) => data.some((item) => item.marksObtained === 85));
    await check('Student completes lesson', 'PATCH', `/courses/lessons/${lesson._id}/complete`, 'student');
    await check('Paid course configured', 'PATCH', `/courses/${course._id}`, 'teacher', { isFree: false, price: 10 });
    await check('Paid enrollment requires checkout', 'POST', `/courses/${course._id}/enroll`, 'parent', null, [402]);
  });

  let institution, fee;
  await phase('Institution and parent', async () => {
    institution = await models.Institution.create({ owner: users.institution_owner._id, name: 'Audit School', slug: 'audit-school', type: 'school', country: 'US', verificationStatus: 'approved', staff: [{ user: users.institution_staff._id, role: 'representative', permissions: [] }] });
    await models.StudentProfile.findOneAndUpdate({ user: users.student._id }, { primaryInstitution: institution._id }, { upsert: true });
    await check('Unlinked parent denied results', 'GET', `/parents/children/${users.student.id}/results`, 'parent', null, [403]);
    const link = await check('Parent requests child link', 'POST', '/parents/link-requests', 'parent', { studentEmail: users.student.email, relationship: 'mother' });
    await check('Student approves parent', 'PATCH', `/parents/link-requests/${link._id}/respond`, 'student', { decision: 'approved' });
    await check('Linked parent sees results', 'GET', `/parents/children/${users.student.id}/results`, 'parent');
    await models.Attendance.create({ course: course._id, markedBy: users.teacher._id, date: new Date(), records: [{ student: users.student._id, status: 'present' }, { student: users.donor._id, status: 'absent' }] });
    await check('Student attendance excludes classmates', 'GET', '/students/me/attendance', 'student', null, [200], (data) => !JSON.stringify(data).includes(users.donor.id));
    await check('Parent attendance excludes unrelated children', 'GET', `/parents/children/${users.student.id}/attendance`, 'parent', null, [200], (data) => !JSON.stringify(data).includes(users.donor.id));
    const book = await check('Institution adds library book', 'POST', `/institution-ops/${institution.id}/books`, 'institution_owner', { title: 'Book', copies: 1 });
    await check('Unrelated user denied library management', 'PATCH', `/institution-ops/books/${book._id}`, 'employer', { title: 'Changed' }, [403]);
    await check('Representative without permissions cannot change library', 'PATCH', `/institution-ops/books/${book._id}`, 'institution_staff', { title: 'Unauthorized change' }, [403]);
    await check('Owner lists library', 'GET', `/institution-ops/${institution.id}/books`, 'institution_owner');
    fee = await models.Fee.create({ student: users.student._id, institution: institution._id, recordedBy: users.institution_owner._id, title: 'Tuition', amount: 100 });
    await check('Student cannot mark card fee paid without gateway', 'PATCH', `/students/me/fees/${fee.id}/pay`, 'student', { paymentMethod: 'card' }, [400, 403, 422, 503]);
  });

  await phase('Marketplace', async () => {
    const product = await check('Verified seller submits product', 'POST', '/marketplace/products', 'marketplace_seller', { title: 'Audit Book', category: 'books', price: 10, stock: 3 });
    await check('Unapproved listing hidden publicly', 'GET', `/marketplace/products/${product._id}`, null, null, [403, 404]);
    await check('Admin approves listing', 'PATCH', `/marketplace/products/${product._id}/moderate`, 'super_admin', { decision: 'approved', status: 'active' });
    await check('Buyer places order', 'POST', `/marketplace/products/${product._id}/orders`, 'student', { quantity: 1 });
    await check('Buyer order history', 'GET', '/marketplace/orders/mine', 'student');
    await check('Seller order history', 'GET', '/marketplace/orders/selling', 'marketplace_seller');
  });

  await phase('Personal records', async () => {
    const goal = await check('Student creates goal', 'POST', '/students/me/goals', 'student', { title: 'Learn mathematics', category: 'academic' });
    await check('Other student cannot edit goal', 'PATCH', `/students/me/goals/${goal._id}`, 'parent', { title: 'Changed' }, [403, 404]);
    await check('Student deletes own goal', 'DELETE', `/students/me/goals/${goal._id}`, 'student');
    await check('Student document list', 'GET', '/students/me/documents', 'student');
    await check('Resume read', 'GET', '/resumes/me', 'student');
    await check('Notifications read', 'GET', '/notifications/mine', 'student');
    await check('Messages read', 'GET', '/messages/conversations', 'student');
  });

  await phase('Recruitment', async () => {
    const job = await check('Employer publishes job', 'POST', '/jobs', 'employer', { title: 'Math teacher', company: 'Audit School', country: 'US', status: 'active' });
    await check('Job searchable publicly', 'GET', '/jobs', null, null, [200], (data) => data.some((item) => item._id === job._id));
    const application = await check('Student applies for job', 'POST', `/jobs/${job._id}/apply`, 'student', { coverLetter: 'Interested' });
    await check('Duplicate job application rejected', 'POST', `/jobs/${job._id}/apply`, 'student', {}, [409]);
    await check('Unrelated agent cannot view applicants', 'GET', `/jobs/${job._id}/applicants`, 'education_agent', null, [403]);
    await check('Employer shortlists applicant', 'PATCH', `/jobs/applications/${application._id}/status`, 'employer', { status: 'shortlisted' });
    await check('Student saves job', 'POST', `/jobs/${job._id}/save`, 'student');
    await check('Student unsaves job', 'DELETE', `/jobs/${job._id}/save`, 'student');
    await check('Agent posts job', 'POST', '/jobs', 'education_agent', { title: 'Tutor', company: 'Agency', country: 'US', status: 'active' });
    const expired = await models.Job.create({ title: 'Expired job', company: 'Audit', country: 'US', postedBy: users.employer._id, status: 'active', applicationDeadline: new Date('2000-01-01') });
    await check('Expired job rejects applications', 'POST', `/jobs/${expired.id}/apply`, 'student', {}, [400, 422]);
    const alert = await check('Student creates job alert', 'POST', '/job-alerts', 'student', { title: 'Teaching alerts', keywords: 'teacher' });
    if (alert?._id) await check('Student deletes job alert', 'DELETE', `/job-alerts/${alert._id}`, 'student');
  });

  await phase('Scholarships and funding', async () => {
    const scholarship = await check('Donor creates scholarship', 'POST', '/scholarships', 'donor', { title: 'Audit Scholarship', amount: 100, seatsAvailable: 1 });
    const application = await check('Student applies for scholarship', 'POST', `/scholarships/${scholarship._id}/apply`, 'student', { statement: 'Please consider' });
    await check('Donor approves scholarship application', 'PATCH', `/scholarships/applications/${application._id}/status`, 'donor', { status: 'approved' });
    await check('Approval creates sponsorship', 'GET', '/scholarships/mine/sponsorships', 'donor', null, [200], (data) => data.length === 1);
    const second = await check('Second student applies for single-seat scholarship', 'POST', `/scholarships/${scholarship._id}/apply`, 'parent', { statement: 'Second applicant' });
    await check('Scholarship approval enforces seat limit', 'PATCH', `/scholarships/applications/${second._id}/status`, 'donor', { status: 'approved' }, [400, 409, 422]);
    const funding = await check('Student creates funding request', 'POST', '/funding-requests', 'student', { requestType: 'student', category: 'course_fee', title: 'Tuition support', requiredAmount: 100 });
    await check('Unverified request cannot receive donations', 'POST', `/funding-requests/${funding._id}/donate`, 'donor', { amount: 10 }, [403]);
    await check('Admin verifies funding request', 'PATCH', `/funding-requests/${funding._id}/verify`, 'super_admin', { verificationStatus: 'verified' });
    await check('Donor saves funding request', 'POST', `/funding-requests/${funding._id}/save`, 'donor');
    await check('Donor removes saved funding request', 'DELETE', `/funding-requests/${funding._id}/save`, 'donor');
  });

  await phase('Admissions and representative', async () => {
    const application = await check('Student starts admission application', 'POST', '/institution-applications', 'student', { institution: institution.id, program: 'Science' });
    await check('Student submits admission application', 'PATCH', `/institution-applications/${application._id}/submit`, 'student');
    await check('Unrelated user denied admission records', 'GET', `/institution-applications/institution/${institution.id}`, 'employer', null, [403]);
    await check('Owner accepts admission', 'POST', `/institution-applications/${application._id}/accept`, 'institution_owner', {});
    await check('Accepted application cannot be reset to submitted by applicant', 'PATCH', `/institution-applications/${application._id}/submit`, 'student', {}, [400, 409, 422]);
    const meeting = await check('Representative schedules consultation', 'POST', '/meetings', 'institution_staff', { institution: institution.id, student: users.student.id, scheduledDate: '2030-01-01T10:00:00Z' });
    await check('Student sees scheduled consultation', 'GET', '/meetings/mine', 'student', null, [200], (data) => data.some((item) => item._id === meeting._id));
    await check('Unrelated user cannot cancel meeting', 'PATCH', `/meetings/${meeting._id}/status`, 'employer', { status: 'cancelled' }, [403]);
    await check('Representative completes meeting', 'PATCH', `/meetings/${meeting._id}/status`, 'institution_staff', { status: 'completed' });
  });

  await phase('Community and messaging', async () => {
    const group = await check('Student creates study group', 'POST', '/study-groups', 'student', { name: 'Math group' });
    await check('Nonmember cannot read group posts', 'GET', `/study-groups/${group._id}/posts`, 'parent', null, [403]);
    await check('Member posts discussion', 'POST', `/study-groups/${group._id}/posts`, 'student', { text: 'Hello group' });
    await check('Another user joins group', 'POST', `/study-groups/${group._id}/join`, 'parent');
    await check('Joined member reads posts', 'GET', `/study-groups/${group._id}/posts`, 'parent', null, [200], (data) => data.length === 1);
    await check('Member leaves group', 'POST', `/study-groups/${group._id}/leave`, 'parent');
    await check('Former member cannot read posts', 'GET', `/study-groups/${group._id}/posts`, 'parent', null, [403]);
    await check('Student sends private message', 'POST', '/messages', 'student', { to: users.teacher.id, text: 'Private question' });
    await check('Recipient reads private message', 'GET', `/messages/with/${users.student.id}`, 'teacher', null, [200], (data) => data.length === 1);
    await check('Third party cannot read private message', 'GET', `/messages/with/${users.student.id}`, 'employer', null, [200], (data) => data.length === 0);
    await check('Recipient marks conversation read', 'PATCH', `/messages/with/${users.student.id}/read`, 'teacher');
  });

  await phase('Administration and content', async () => {
    const complaint = await check('Student submits complaint', 'POST', '/complaints', 'student', { subject: 'Audit concern', description: 'Please investigate' });
    await check('Ordinary student cannot list all complaints', 'GET', '/complaints', 'student', null, [403]);
    await check('Staff without support department denied complaints', 'GET', '/complaints', 'platform_staff', null, [403]);
    await check('Admin resolves complaint', 'PATCH', `/complaints/${complaint._id}`, 'admin', { status: 'resolved', resolutionNotes: 'Resolved' });
    await check('Student sees complaint resolution', 'GET', '/complaints/mine', 'student', null, [200], (data) => data.some((item) => item.status === 'resolved'));
    const page = await check('Admin creates draft CMS page', 'POST', '/pages', 'admin', { title: 'Audit page', slug: 'audit-page', content: 'Page body' });
    await check('Draft CMS page hidden from public', 'GET', '/pages/audit-page', null, null, [404]);
    await check('Admin publishes CMS page', 'PATCH', `/pages/${page._id}`, 'admin', { status: 'published' });
    await check('Published CMS page accessible', 'GET', '/pages/audit-page', null);
    await check('Unassigned platform staff cannot read finance', 'GET', '/admin/finance', 'platform_staff', null, [403]);
    await check('Admin reads finance', 'GET', '/admin/finance', 'admin');
    await check('Admin cannot manage super-admin staff list', 'GET', '/admin/staff', 'admin', null, [403]);
    await check('Super admin reads staff list', 'GET', '/admin/staff', 'super_admin');
  });

  await phase('Exams and attendance', async () => {
    const exam = await check('Teacher creates exam', 'POST', `/courses/${course._id}/exams`, 'teacher', {
      title: 'Quiz', questions: [{ text: '2 + 2?', type: 'mcq', options: ['3', '4'], correctOption: 1, marks: 10 }]
    });
    await check('Teacher publishes exam', 'PATCH', `/courses/exams/${exam._id}/publish`, 'teacher');
    await check('Student exam response hides answer key', 'GET', `/courses/${course._id}/exams`, 'student', null, [200], (data) => data.every((item) => item.questions.every((question) => question.correctOption === undefined)));
    await check('Duplicate answer indexes cannot inflate score', 'POST', `/courses/exams/${exam._id}/submit`, 'student', {
      answers: [{ questionIndex: 0, selectedOption: 1 }, { questionIndex: 0, selectedOption: 1 }]
    }, [400, 422]);
    await check('Teacher cannot mark unrelated student without a course', 'POST', '/teachers/me/attendance', 'teacher', {
      date: '2030-01-02', records: [{ student: users.employer.id, status: 'absent' }]
    }, [400, 403, 422]);
    await check('Teacher records own course attendance', 'POST', '/teachers/me/attendance', 'teacher', {
      course: course._id, date: '2030-01-02', records: [{ student: users.student.id, status: 'present' }]
    });
    const certificate = await check('Institution issues certificate', 'POST', `/institutions/${institution.id}/certificates`, 'institution_owner', { student: users.student.id, title: 'Completion', course: course._id });
    await check('Public certificate verification', 'GET', `/certificates/verify/${certificate.verifyCode}`, null);
    await check('Student receives certificate', 'GET', '/students/me/certificates', 'student', null, [200], (data) => data.some((item) => item._id === certificate._id));
  });

  await phase('Campus communication', async () => {
    const newsletter = await check('Owner creates newsletter', 'POST', '/newsletters', 'institution_owner', { institution: institution.id, title: 'Campus news', content: 'News body' });
    await check('Owner publishes newsletter', 'PATCH', `/newsletters/${newsletter._id}/publish`, 'institution_owner');
    await check('Enrolled student receives newsletter', 'GET', '/newsletters/published', 'student', null, [200], (data) => data.some((item) => item._id === newsletter._id));
    const poll = await check('Owner creates poll', 'POST', '/polls', 'institution_owner', { institution: institution.id, question: 'Favorite subject?', options: ['Math', 'Science'] });
    await check('Enrolled student votes', 'POST', `/polls/${poll._id}/vote`, 'student', { optionIndex: 0 });
    await check('Repeat vote rejected', 'POST', `/polls/${poll._id}/vote`, 'student', { optionIndex: 1 }, [400, 409]);
    await check('Owner closes poll', 'PATCH', `/polls/${poll._id}/close`, 'institution_owner');
    const magazine = await check('Student submits magazine article', 'POST', '/magazine', 'student', { title: 'My article', content: 'Article body', type: 'article' });
    await check('Owner selects magazine article', 'PATCH', `/magazine/${magazine._id}/review`, 'institution_owner', { status: 'selected' });
    await check('Owner publishes magazine article', 'PATCH', `/magazine/${magazine._id}/publish`, 'institution_owner');
    const question = await check('Student asks anonymous question', 'POST', '/anonymous-questions', 'student', { question: 'How do I study?' });
    await check('Institution cannot see anonymous asker identity', 'GET', `/anonymous-questions/institution?institutionId=${institution.id}`, 'institution_owner', null, [200], (data) => data.every((item) => !item.student));
    await check('Owner answers anonymous question', 'PATCH', `/anonymous-questions/${question._id}/answer`, 'institution_owner', { answer: 'Study regularly' });
    const fair = await check('Representative creates virtual fair', 'POST', '/virtual-fairs', 'institution_staff', { institution: institution.id, title: 'Open day', scheduledDate: '2030-01-01T10:00:00Z' });
    await check('Student registers for virtual fair', 'POST', `/virtual-fairs/${fair._id}/register`, 'student');
    await check('Student sees registered fair', 'GET', '/virtual-fairs/mine/registered', 'student', null, [200], (data) => data.some((item) => item._id === fair._id));
    await check('Student sends institution inquiry', 'POST', '/inquiries', 'student', { institution: institution.id, interestedProgram: 'Science' });
    await check('Representative sees institution inquiries', 'GET', `/inquiries/institution/${institution.id}`, 'institution_staff');
  });

  await phase('Institution operations', async () => {
    const room = await check('Owner creates hostel room', 'POST', `/institution-ops/${institution.id}/hostel-rooms`, 'institution_owner', { roomNumber: 'A1', capacity: 1 });
    await check('Owner allocates hostel room', 'POST', `/institution-ops/hostel-rooms/${room._id}/allocate`, 'institution_owner', { student: users.student.id });
    await check('Full hostel room rejects additional occupant', 'POST', `/institution-ops/hostel-rooms/${room._id}/allocate`, 'institution_owner', { student: users.parent.id }, [400]);
    await check('Owner removes hostel occupant', 'DELETE', `/institution-ops/hostel-rooms/${room._id}/occupants/${users.student.id}`, 'institution_owner');
    const vehicle = await check('Owner creates transport vehicle', 'POST', `/institution-ops/${institution.id}/vehicles`, 'institution_owner', { vehicleNumber: 'AUDIT-1', capacity: 10 });
    await check('Owner assigns transport', 'POST', `/institution-ops/vehicles/${vehicle._id}/assign`, 'institution_owner', { student: users.student.id });
    await check('Owner removes transport assignment', 'DELETE', `/institution-ops/vehicles/${vehicle._id}/students/${users.student.id}`, 'institution_owner');
    const inventory = await check('Owner creates inventory item', 'POST', `/institution-ops/${institution.id}/inventory`, 'institution_owner', { name: 'Projector', quantity: 1 });
    await check('Owner updates inventory', 'PATCH', `/institution-ops/inventory/${inventory._id}`, 'institution_owner', { quantity: 2 });
    await check('Unrelated user denied health records', 'GET', `/institution-ops/students/${users.student.id}/health`, 'employer', null, [403]);
    await check('Parent updates child health', 'PATCH', `/parents/children/${users.student.id}/health`, 'parent', { bloodGroup: 'O+', medicalNotes: 'Audit health note' });
    await check('Unassigned representative cannot read student health', 'GET', `/institution-ops/students/${users.student.id}/health`, 'institution_staff', null, [403]);
    const event = await check('Owner creates campus event', 'POST', `/institution-ops/${institution.id}/events`, 'institution_owner', { title: 'Science fair', startDate: '2030-01-01', type: 'seminar' });
    await check('Student RSVPs to event', 'POST', `/institution-ops/events/${event._id}/rsvp`, 'student');
    const ticket = await check('Student submits institution help ticket', 'POST', `/institution-ops/${institution.id}/tickets`, 'student', { category: 'academic', subject: 'Need help', description: 'Please help' });
    await check('Owner resolves help ticket', 'PATCH', `/institution-ops/tickets/${ticket._id}`, 'institution_owner', { status: 'resolved' });
  });

  await phase('Account recovery and configuration', async () => {
    const account = await models.User.create({ fullName: 'Recovery test', email: 'recovery@audit.test', passwordHash, roles: ['student'] });
    const pair = await requireBackend('services/token.service').issueTokenPair(account);
    await check('Forgot-password starts recovery', 'POST', '/auth/forgot-password', null, { email: account.email });
    await check('Wrong recovery code denied', 'POST', '/auth/reset-password', null, { email: account.email, code: '000000', newPassword: 'ChangedPassword123!' }, [400]);
    await check('Correct recovery code resets password', 'POST', '/auth/reset-password', null, { email: account.email, code: '123456', newPassword: 'ChangedPassword123!' });
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await check('Password reset revokes old refresh token', 'POST', '/auth/refresh', null, { refreshToken: pair.refreshToken }, [401]);
    await models.User.updateOne({ _id: account._id }, { status: 'suspended' });
    const suspendedPair = await requireBackend('services/token.service').issueTokenPair(account);
    await new Promise((resolve) => setTimeout(resolve, 1100));
    await check('Suspended account cannot refresh session', 'POST', '/auth/refresh', null, { refreshToken: suspendedPair.refreshToken }, [401, 403]);
    await check('Suspended account cannot use access token', 'GET', '/auth/me', suspendedPair.accessToken, null, [403]);
    await check('Super admin creates country', 'POST', '/config/countries', 'super_admin', { name: 'Audit Country', code: 'ZZ' });
    await check('Ordinary admin denied global configuration writes', 'POST', '/config/countries', 'admin', { name: 'Blocked', code: 'YY' }, [403]);
    await check('Public country config reflects update', 'GET', '/config/public', null, null, [200], (data) => data.countries.some((item) => item.code === 'ZZ'));
    await check('Super admin can read security log', 'GET', '/security/login-attempts', 'super_admin');
    await check('Student denied security log', 'GET', '/security/login-attempts', 'student', null, [403]);
    await check('No configured AI provider fails explicitly', 'POST', '/ai/chat', 'student', { message: 'Hello' }, [503, 422, 404]);
  });

  // Check frontend literal/template API calls against backend route patterns.
  function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]); }
  const routePatterns = routes.map((route) => ({ ...route, regex: new RegExp('^' + route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z]+/g, '[^/]+') + '/?$') }));
  for (const file of files(path.resolve(__dirname, '../src')).filter((file) => /\.(js|jsx)$/.test(file))) {
    const source = fs.readFileSync(file, 'utf8');
    for (const match of source.matchAll(/apiRequest\(\s*(['"`])([^'"`]+)\1/g)) {
      const raw = match[2];
      if (!raw.startsWith('/')) continue;
      const url = raw.replace(/\$\{[^}]+\}/g, 'AUDIT_VALUE').split('?')[0];
      const found = routePatterns.filter((route) => route.regex.test(url));
      if (!found.length) results.contracts.push({ file: path.relative(path.resolve(__dirname, '..'), file), line: source.slice(0, match.index).split('\n').length, path: raw, note: 'No static route match; inspect dynamic path fragments before treating as a defect.' });
    }
  }
  const dashboard = fs.readFileSync(path.resolve(__dirname, '../src/pages/Dashboard.jsx'), 'utf8');
  const workspaceText = dashboard.slice(dashboard.indexOf('const WORKSPACES ='), dashboard.indexOf('const WORKSPACE_PRIORITY'));
  results.navigation = [...workspaceText.matchAll(/^  (\w+): \{([\s\S]*?)(?=^  \w+: \{|^};)/gm)].map((match) => ({
    workspace: match[1], tabs: [...match[2].matchAll(/key: '([^']+)', label: '([^']+)'/g)].map((tab) => ({ key: tab[1], label: tab[2] }))
  }));
  results.navigationFindings = [
    { name: 'Admin Global Settings is intercepted by shared Settings tab', evidence: "SHARED_TABS includes settings, so AdminWorkspace's settings branch is never rendered." },
    { name: 'Platform staff has no dashboard workspace mapping', evidence: 'Backend supports platform_staff departments but no WORKSPACES entry admits platform_staff.' },
    { name: 'Paid-course enrollment has no checkout path', evidence: 'Enrollment returns 402 for paid courses; payment routes cover fees and wallet top-ups only.' },
    { name: 'Global search and several AI/classroom screens remain placeholders', evidence: 'Header search is unconnected; AI Creative Teacher, Advanced Class Control, cover letters and admin AI insights explicitly remain unfinished.' }
  ];
}
main().catch((error) => { results.fatal = error.stack; console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
  await mongoose.disconnect();
  if (database) await database.stop();
  fs.writeFileSync(path.join(__dirname, 'flow-results.json'), JSON.stringify(results, null, 2));
  const failures = results.journeys.filter((item) => !item.passed);
  console.log(JSON.stringify({ smokeRequests: results.smoke.length, unexpectedServerErrors: results.smoke.filter((item) => item.status === 500 || item.status === 0), journeyChecks: results.journeys.length, failures, unmatchedFrontendPaths: results.contracts }, null, 2));
});
