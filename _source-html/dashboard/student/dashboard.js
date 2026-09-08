/* =============================================================
   CAREERZ AI — STUDENT DASHBOARD (PAGE CONTENT)
   ---------------------------------------------------------------
   This file is intentionally NOT the framework. It implements the
   Student Module content that sits on top of the Universal
   Dashboard Framework: Academic Overview, My Classes, My Courses +
   Resources, Assignments & Tests, Applications, My Institutions,
   Marketplace (buy/sell) and Fees/Payments.

   Everything below is demo/mock data clearly separated from logic,
   structured the way a future API response would look, so wiring
   a real backend later means replacing the DATA arrays only — the
   render functions and markup contracts stay the same.

   Reused from the framework (not duplicated here):
     - openModal() / closeModal()      — dashboard-framework.js
     - showToast()                     — dashboard-framework.js
     - formatCurrencyAmount() / getPreferredCurrency() — dashboard-framework.js
     - .u-table, .dash-pill, .dash-list, .u-tabs, .u-modal, .card,
       .inst-card / .market-card / .job-card / .tag (shared style.css)

   Shell-level behavior (theme, language, sidebar, header dropdowns,
   notification drawer, breadcrumb, generic modal/dropdown plumbing)
   lives in assets/js/dashboard-framework.js, loaded before this file.
================================================================= */

/* =========================================================
   ROLE SWITCHER (placeholder only — unchanged from the framework
   scaffold; does not unlock or verify anything)
========================================================= */
function initRoleSwitcher(){
  const select = document.getElementById('role-select');
  const banner = document.getElementById('welcome-role-label');
  if (!select) return;
  select.addEventListener('change', () => {
    if (banner) banner.textContent = select.options[select.selectedIndex].text;
  });
}

/* =========================================================
   PROFILE COMPLETION RING (unchanged)
========================================================= */
function initProgressRing(){
  const ring = document.getElementById('profile-ring-fg');
  if (!ring) return;
  const percent = parseInt(ring.getAttribute('data-percent') || '0', 10);
  const radius = ring.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  ring.style.strokeDasharray = `${circumference}`;
  ring.style.strokeDashoffset = `${circumference}`;
  requestAnimationFrame(() => {
    const offset = circumference - (percent / 100) * circumference;
    ring.style.strokeDashoffset = `${offset}`;
  });
}

/* =========================================================
   CALENDAR WIDGET (unchanged — deliberately a static UI
   placeholder per the Student Module spec, not a functioning
   calendar; real date-navigation/backend comes in a later phase)
========================================================= */
function initCalendar(){
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-label');
  if (!grid || !label) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const eventDays = [3, 11, 18, 24];

  label.textContent = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = now.getDate();

  let html = '';
  ['S','M','T','W','T','F','S'].forEach(d => { html += `<div class="dow">${d}</div>`; });
  for (let i = firstDay; i > 0; i--){
    html += `<div class="dash-calendar-day muted">${daysInPrevMonth - i + 1}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++){
    const classes = ['dash-calendar-day'];
    if (d === today) classes.push('today');
    if (eventDays.includes(d)) classes.push('event');
    html += `<div class="${classes.join(' ')}">${d}</div>`;
  }
  const totalCells = firstDay + daysInMonth;
  const trailing = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= trailing; d++){
    html += `<div class="dash-calendar-day muted">${d}</div>`;
  }
  grid.innerHTML = html;
}

/* =========================================================
   SIDEBAR — Notifications link opens the same panel as the
   header bell, instead of duplicating that logic here.
========================================================= */
function initSidebarNotifLink(){
  const link = document.getElementById('sidebar-notif-link');
  const bell = document.getElementById('notif-bell');
  if (!link || !bell) return;
  link.addEventListener('click', (e) => { e.preventDefault(); bell.click(); });
}

/* =========================================================
   DEMO DATA
   Every array below is placeholder content only — structured the
   way a future API response would look. Nothing here is meant to
   be permanent; replacing these arrays with real fetched data is
   the entire integration surface for a later backend phase.
========================================================= */
const academicOverview = {
  institution: 'FAST-NU Lahore',
  classGrade: 'BS Computer Science — Semester 4',
  program: 'BS Computer Science',
  subjects: ['Data Structures', 'Operating Systems', 'Linear Algebra', 'Technical Writing'],
  attendance: '92%',
  term: 'Fall 2026'
};

const currentClass = {
  subject: 'Data Structures — Lecture 12',
  teacher: 'Dr. Bilal Tariq',
  institution: 'FAST-NU Lahore',
  startTime: '2:00 PM', endTime: '3:15 PM',
  classroomType: 'internal' // internal | external_video | external_audio — provider decided by backend later
};

const upcomingClasses = [
  { subject: 'Technical Writing — Workshop', teacher: 'Sana Iqbal', institution: 'FAST-NU Lahore', day: 'Tomorrow', time: '10:00 AM' },
  { subject: 'IELTS Speaking Practice', teacher: 'Mariam Yousuf', institution: 'British Council Partner Academy', day: 'Wed', time: '5:30 PM' },
  { subject: 'Linear Algebra — Tutorial', teacher: 'Ahmed Raza', institution: 'FAST-NU Lahore', day: 'Thu', time: '11:00 AM' }
];

const myCourses = [
  {
    id: 'c1', name: 'Data Structures & Algorithms', provider: 'FAST-NU Lahore',
    currentLesson: 'Balanced Binary Trees', progress: 62, completedLessons: 8, totalLessons: 13,
    resources: [
      { type: 'video', name: 'Lecture 8 — Balanced Trees', meta: '48 min' },
      { type: 'pdf', name: 'Week 8 Lecture Notes', meta: '1.2 MB' },
      { type: 'doc', name: 'Assignment 3 Brief', meta: '340 KB' }
    ]
  },
  {
    id: 'c2', name: 'IELTS Preparation — Band 7+', provider: 'British Council Partner Academy',
    currentLesson: 'Speaking: Part 2 Practice', progress: 40, completedLessons: 6, totalLessons: 15,
    resources: [
      { type: 'audio', name: 'Listening Practice Set 6', meta: '22 min' },
      { type: 'pdf', name: 'Speaking Cue Cards Pack', meta: '860 KB' }
    ]
  },
  {
    id: 'c3', name: 'Intro to Data Science', provider: 'CareerZ Academy (Self-paced)',
    currentLesson: 'Pandas: DataFrames', progress: 18, completedLessons: 2, totalLessons: 11,
    resources: [
      { type: 'video', name: 'Lesson 2 — DataFrames', meta: '35 min' },
      { type: 'doc', name: 'Practice Dataset (CSV)', meta: '90 KB' }
    ]
  }
];

const RESOURCE_ICON = { video: '🎬', audio: '🎧', pdf: '📄', doc: '📝' };

const assignments = [
  { course: 'Data Structures', type: 'Assignment', title: 'Assignment 3 — AVL Trees', due: 'Aug 14, 2026', status: 'available', grade: null },
  { course: 'Data Structures', type: 'Quiz', title: 'Quiz 4 — Tree Traversal', due: 'Aug 10, 2026', status: 'submitted', grade: null },
  { course: 'IELTS Preparation', type: 'Test', title: 'Mock Speaking Test 2', due: 'Aug 9, 2026', status: 'graded', grade: 'Band 7.0' },
  { course: 'Intro to Data Science', type: 'Assignment', title: 'Assignment 1 — Data Cleaning', due: 'Aug 20, 2026', status: 'upcoming', grade: null },
  { course: 'Data Structures', type: 'Assignment', title: 'Assignment 2 — Hash Maps', due: 'Jul 30, 2026', status: 'graded', grade: 'A' }
];

const applications = [
  { type: 'Institution', title: 'Admission Application', target: 'NUST Islamabad — MS Computer Science', submitted: 'Aug 1, 2026', status: 'in_review' },
  { type: 'Scholarship', title: 'National Need-Based Scholarship', target: 'HEC Pakistan', submitted: 'Jul 28, 2026', status: 'pending' },
  { type: 'Job', title: 'Junior Frontend Developer', target: 'Systems Limited — Lahore', submitted: 'Jul 20, 2026', status: 'approved' },
  { type: 'Course', title: 'Advanced Machine Learning', target: 'CareerZ Academy', submitted: 'Jul 15, 2026', status: 'completed' }
];

const myInstitutions = [
  { name: 'FAST-NU Lahore', type: 'University · Primary Institution', tags: ['Verified', 'BS Computer Science'] },
  { name: 'British Council Partner Academy', type: 'Academy · IELTS & TOEFL', tags: ['Verified', 'IELTS Prep'] },
  { name: 'CareerZ Academy', type: 'Online Academy · Self-paced', tags: ['Verified', 'Data Science'] }
];

const marketListings = [
  { ic: '📚', name: 'Data Structures Notes Bundle', priceBase: 800, status: 'active' },
  { ic: '🗂️', name: 'FAST-NU Past Papers (3 yrs)', priceBase: 450, status: 'active' },
  { ic: '📐', name: 'IELTS Speaking Cue Cards Set', priceBase: 300, status: 'draft' }
];

const marketOrders = [
  { ic: '🎬', name: 'Excel Mastery — Recorded Course', seller: 'CareerZ Academy', priceBase: 1200, status: 'completed' },
  { ic: '📝', name: 'MDCAT Complete Notes', seller: 'Ilmkidunya Coaching', priceBase: 800, status: 'processing' }
];

const fees = [
  { name: 'Semester 4 Tuition — FAST-NU', dueDate: 'Aug 15, 2026', amountBase: 95000, status: 'pending' },
  { name: 'IELTS Prep — Monthly Fee', dueDate: 'Aug 5, 2026', amountBase: 8000, status: 'overdue' },
  { name: 'Semester 3 Tuition — FAST-NU', dueDate: 'Jul 1, 2026', amountBase: 95000, status: 'paid' }
];

const certificates = [
  { name: 'Semester 3 Completion Certificate', institution: 'FAST-NU Lahore', issued: 'Jul 5, 2026' },
  { name: 'IELTS Preparation — Level 2', institution: 'British Council Partner Academy', issued: 'Jun 20, 2026' },
  { name: 'Excel Mastery — Recorded Course', institution: 'CareerZ Academy', issued: 'May 30, 2026' }
];

// Browsable scholarships/jobs are distinct from the Applications tracker
// above: these are open opportunities the student can discover and apply
// to; Applications shows the status of ones already submitted.
const browsableScholarships = [
  { name: 'National Need-Based Scholarship', provider: 'HEC Pakistan', amountBase: 200000, unit: '/year', deadline: 'Closes in 18 days' },
  { name: 'CareerZ Merit Award', provider: 'CareerZ Foundation', amountBase: 100000, unit: '', deadline: 'Closes in 32 days' },
  { name: 'Punjab Group Talent Scholarship', provider: 'Punjab Group of Colleges', flatText: 'Full tuition waiver', deadline: 'Closes in 9 days' }
];

const browsableJobs = [
  { role: 'Junior Frontend Developer', org: 'Systems Limited · Lahore', payMin: 80000, payMax: 120000, unit: '/mo', tags: ['Full-time', 'On-site'] },
  { role: 'Data Analyst Intern', org: 'NayaTel · Lahore', payMin: 30000, payMax: null, unit: '/mo', tags: ['Internship', 'Hybrid'] },
  { role: 'Content Writer', org: 'Daraz · Karachi', payMin: 50000, payMax: null, unit: '/mo', tags: ['Contract', 'Remote'] }
];

// Tutors/tuition centers are a separate marketplace from school/institution
// enrollment (see My Institutions above) — a student can have any number
// of tutors simultaneously with their primary school. Platform commission
// (if/when tuition payments run through CareerZ) is a backend-controlled
// rate applied to tutor.pricing.amountBase; the frontend does not compute
// or display a commission breakdown to the student — that belongs to the
// future Teacher/Tutor earnings view, out of scope here.
const tutors = [
  {
    id: 'tu1', name: 'Zainab Qureshi', type: 'tutor', verified: true,
    subjects: ['Mathematics', 'Physics'], gradesTaught: 'O/A Levels', qualification: 'MSc Physics — LUMS',
    experienceYears: 6, languages: ['English', 'Urdu'], mode: 'online', format: 'individual',
    location: 'Lahore, Pakistan', rating: 4.9, reviews: 87,
    intro: 'Focused, exam-oriented tutoring for O/A Level Maths and Physics — six years helping students move up a full grade boundary.',
    pricing: { amountBase: 1500, unit: 'hour' }
  },
  {
    id: 'tu2', name: 'Ahmed Bilal', type: 'tutor', verified: true,
    subjects: ['Chemistry', 'Biology'], gradesTaught: 'Matric · O Levels', qualification: 'BS Biochemistry — FAST-NU',
    experienceYears: 3, languages: ['English', 'Urdu'], mode: 'offline', format: 'individual',
    location: 'DHA, Lahore', rating: 4.7, reviews: 34,
    intro: 'Home-visit tuition for Matric and O Level Chemistry/Biology, with a focus on practical/lab-style understanding.',
    pricing: { negotiable: true }
  },
  {
    id: 'tu3', name: 'Hina Sadiq', type: 'tutor', verified: false,
    subjects: ['English', 'IELTS'], gradesTaught: 'All levels', qualification: 'MPhil English Literature',
    experienceYears: 8, languages: ['English', 'Urdu'], mode: 'online', format: 'group',
    location: 'Karachi, Pakistan', rating: 4.6, reviews: 51,
    intro: 'Small-group IELTS and spoken English classes, capped at 6 students per batch for more speaking practice time.',
    pricing: { contactForPrice: true }
  },
  {
    id: 'tu4', name: 'Ilmkidunya Coaching', type: 'institution', verified: true,
    subjects: ['Board Exams', 'Entry Test Prep'], gradesTaught: 'Matric · Intermediate', qualification: 'Registered Coaching Center',
    experienceYears: 12, languages: ['English', 'Urdu'], mode: 'both', format: 'group',
    location: 'Multiple cities', rating: 4.5, reviews: 212,
    intro: 'Group coaching batches for board exams and entry tests, with both in-center and online sections available.',
    pricing: { amountBase: 12000, unit: 'month' }
  }
];

const myTuition = [
  { tutor: 'Zainab Qureshi', subject: 'Mathematics', status: 'accepted', next: 'Tomorrow · 5:00 PM' },
  { tutor: 'Ahmed Bilal', subject: 'Chemistry', status: 'pending', next: 'Awaiting tutor response' }
];

/* =========================================================
   SHARED HELPERS
========================================================= */
function statusLabel(status){
  const map = {
    upcoming: 'Upcoming', available: 'Available', submitted: 'Submitted', graded: 'Graded',
    pending: 'Pending', in_review: 'In Review', approved: 'Approved', rejected: 'Rejected', completed: 'Completed',
    active: 'Active', draft: 'Draft', processing: 'Processing', paid: 'Paid', overdue: 'Overdue',
    accepted: 'Accepted', cancelled: 'Cancelled'
  };
  return map[status] || status;
}
function statusPillClass(status){
  const map = {
    upcoming: 'draft', available: 'approved', submitted: 'pending', graded: 'approved',
    pending: 'pending', in_review: 'pending', approved: 'approved', rejected: 'rejected', completed: 'approved',
    active: 'approved', draft: 'draft', processing: 'pending', paid: 'approved', overdue: 'rejected',
    accepted: 'approved', cancelled: 'rejected'
  };
  return map[status] || 'draft';
}
// Maps each status value to its prepared dashboard-framework.js i18n key
// (status.* namespace). Every status pill() renders now carries the
// matching data-i18n attribute, so switching language translates them
// via the existing applyTranslations() mechanism — no new i18n system.
const STATUS_I18N_KEY = {
  upcoming: 'status.upcoming', available: 'status.available', submitted: 'status.submitted', graded: 'status.graded',
  pending: 'status.pendingWork', in_review: 'status.inReview', approved: 'status.approved', rejected: 'status.rejected',
  completed: 'status.completed', active: 'status.active', draft: 'status.draft', processing: 'status.processing',
  paid: 'status.paid', overdue: 'status.overdue', accepted: 'status.accepted', cancelled: 'status.cancelled'
};
function pill(status){
  const key = STATUS_I18N_KEY[status];
  return `<span class="dash-pill ${statusPillClass(status)}"${key ? ` data-i18n="${key}"` : ''}>${statusLabel(status)}</span>`;
}
function money(amountBase){
  // Reuses the framework's global currency helpers instead of a parallel
  // formatter — see careerz:currency-changed re-render at the bottom.
  if (typeof formatCurrencyAmount === 'function' && typeof getPreferredCurrency === 'function'){
    return formatCurrencyAmount(amountBase, getPreferredCurrency());
  }
  return String(amountBase);
}
function notifyNotWiredYet(message){
  if (typeof showToast === 'function') showToast(message, 'info');
}

/* =========================================================
   ACADEMIC OVERVIEW
========================================================= */
function renderAcademicOverview(){
  const el = document.getElementById('academic-overview-grid');
  if (!el) return;
  const a = academicOverview;
  el.innerHTML = `
    <div class="academic-item"><div class="label" data-i18n="academic.institution">Institution</div><div class="value">${a.institution}</div></div>
    <div class="academic-item"><div class="label" data-i18n="academic.classProgram">Class / Program</div><div class="value">${a.classGrade}</div></div>
    <div class="academic-item"><div class="label" data-i18n="academic.attendance">Attendance</div><div class="value">${a.attendance}</div></div>
    <div class="academic-item"><div class="label" data-i18n="academic.term">Term</div><div class="value">${a.term}</div></div>
    <div class="academic-item" style="grid-column:1/-1;"><div class="label" data-i18n="academic.subjects">Current Subjects</div><div class="value subjects">${a.subjects.join(' · ')}</div></div>
  `;
}

/* =========================================================
   MY CLASSES
========================================================= */
function renderClasses(){
  const liveSlot = document.getElementById('current-class-slot');
  const upcomingList = document.getElementById('upcoming-classes-list');
  if (liveSlot){
    if (currentClass){
      liveSlot.innerHTML = `
        <div class="card class-card-live reveal in">
          <div class="meta">
            <span class="live-badge"><span class="dot"></span><span data-i18n="class.inProgress">Class in Progress</span></span>
            <h4>${currentClass.subject}</h4>
            <div class="provider">${currentClass.teacher} · ${currentClass.institution}</div>
            <div class="time">${currentClass.startTime} – ${currentClass.endTime}</div>
          </div>
          <button class="btn btn-primary" id="join-class-btn" type="button" data-i18n="class.joinClass">Join Class</button>
        </div>`;
      const joinBtn = document.getElementById('join-class-btn');
      if (joinBtn){
        joinBtn.addEventListener('click', () => notifyNotWiredYet('Classroom link will be available once classroom integration is connected.'));
      }
    } else {
      liveSlot.innerHTML = `<div class="u-empty" style="padding:32px 16px;"><div class="u-empty-ic">📭</div><h4>No class in progress</h4><p>Your next session appears below once it's about to start.</p></div>`;
    }
  }
  if (upcomingList){
    if (!upcomingClasses.length){
      upcomingList.innerHTML = `<div class="u-empty"><div class="u-empty-ic">🗓️</div><h4 data-i18n="class.noUpcoming">No upcoming classes scheduled.</h4></div>`;
    } else {
      upcomingList.innerHTML = upcomingClasses.map(c => `
        <div class="class-row">
          <span class="class-icon">
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          </span>
          <div class="class-meta">
            <h5>${c.subject}</h5>
            <div class="provider">${c.teacher} · ${c.institution}</div>
          </div>
          <div class="when">${c.day} · <span data-i18n="class.starts">Starts</span> ${c.time}</div>
        </div>`).join('');
    }
  }
}

/* =========================================================
   MY COURSES + RESOURCES
========================================================= */
function renderCourses(){
  const grid = document.getElementById('mycourses-grid');
  if (!grid) return;
  grid.innerHTML = myCourses.map(c => `
    <div class="card mycourse-card reveal in">
      <div class="top">
        <div>
          <h4>${c.name}</h4>
          <div class="provider">${c.provider}</div>
        </div>
      </div>
      <div>
        <div class="progress-label"><span>${c.completedLessons}/${c.totalLessons} lessons</span><span>${c.progress}%</span></div>
        <div class="progress-bar"><div class="progress-bar-fill" style="width:${c.progress}%;"></div></div>
      </div>
      <div class="lesson-now">Current lesson: <strong>${c.currentLesson}</strong></div>
      <div class="foot-row">
        <button class="btn btn-outline" style="padding:9px 16px; font-size:13px;" type="button" onclick="notifyNotWiredYet('Course player will open once LMS integration is connected.')" data-i18n="course.continue">Continue Course</button>
        <button class="btn-ghost" style="font-size:13px;" type="button" data-resources-for="${c.id}"><span data-i18n="course.viewResources">Resources</span> (${c.resources.length}) →</button>
      </div>
    </div>`).join('');

  grid.querySelectorAll('[data-resources-for]').forEach(btn => {
    btn.addEventListener('click', () => openResourcesModal(btn.dataset.resourcesFor));
  });
}

/* =========================================================
   CERTIFICATES (reuses the existing .dash-mini-card component —
   same card used for "Recommended For You" — instead of a new one)
========================================================= */
function renderCertificates(){
  const grid = document.getElementById('certificates-grid');
  if (!grid) return;
  grid.innerHTML = certificates.map(c => `
    <div class="card dash-mini-card reveal in">
      <div class="mini-top">
        <span class="dash-mini-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="5.2"/><path d="M8.5 13.5 7 21l5-2.6L17 21l-1.5-7.5"/></svg></span>
        <div><h4>${c.name}</h4><div class="meta">${c.institution} · Issued ${c.issued}</div></div>
      </div>
      <div class="bottom-row">
        <span class="tag">Verified</span>
        <button type="button" class="link-muted" style="font-size:12.5px; background:none; border:none; cursor:pointer;" onclick="notifyNotWiredYet('Certificate download will be available once document generation is connected.')">Download →</button>
      </div>
    </div>`).join('');
}

function openResourcesModal(courseId){
  const course = myCourses.find(c => c.id === courseId);
  const titleEl = document.getElementById('resources-modal-title');
  const bodyEl = document.getElementById('resources-modal-body');
  if (!course || !titleEl || !bodyEl) return;

  // The title has a static translatable prefix + the dynamic course name;
  // setting titleEl.textContent directly would wipe out any data-i18n
  // attribute on the prefix, so only the course-name sub-span is touched.
  const nameEl = titleEl.querySelector('#resources-modal-course-name');
  if (nameEl) nameEl.textContent = '— ' + course.name;

  bodyEl.innerHTML = `<div class="dash-list">${course.resources.map(r => `
    <div class="dash-list-item">
      <span class="dash-list-icon c-forest">${RESOURCE_ICON[r.type] || '📎'}</span>
      <div class="dash-list-body"><div class="title">${r.name}</div><div class="desc">${r.meta}</div></div>
      <div class="resource-actions">
        <button type="button" onclick="notifyNotWiredYet('File streaming/download will be available once storage integration is connected.')" data-i18n="${r.type === 'video' || r.type === 'audio' ? 'resources.play' : 'resources.view'}">${r.type === 'video' || r.type === 'audio' ? 'Play' : 'View'}</button>
        <button type="button" onclick="notifyNotWiredYet('File streaming/download will be available once storage integration is connected.')" data-i18n="resources.download">Download</button>
      </div>
    </div>`).join('')}</div>`;

  if (typeof applyTranslations === 'function') applyTranslations(document.documentElement.lang || 'en');
  if (typeof openModal === 'function') openModal('course-resources-modal');
}

/* =========================================================
   ASSIGNMENTS & TESTS
========================================================= */
function renderAssignments(){
  const body = document.getElementById('assignments-table-body');
  if (!body) return;
  body.innerHTML = assignments.map(a => `
    <tr>
      <td>${a.title}</td>
      <td>${a.course}</td>
      <td>${a.type}</td>
      <td>${a.due}</td>
      <td>${pill(a.status)}</td>
      <td>${a.grade || '—'}</td>
    </tr>`).join('');
}

/* =========================================================
   APPLICATIONS (+ status summary reusing the existing
   dash-status-grid pattern instead of a second, duplicate
   summary component)
========================================================= */
function renderApplications(){
  const summaryEl = document.getElementById('applications-status-grid');
  const body = document.getElementById('applications-table-body');

  if (summaryEl){
    const counts = { pending: 0, in_review: 0, approved: 0, rejected: 0 };
    applications.forEach(a => {
      const key = a.status === 'completed' ? 'approved' : a.status;
      if (counts[key] !== undefined) counts[key]++;
    });
    const tiles = [
      { key: 'pending', label: 'Pending', cls: 'status-pending' },
      { key: 'in_review', label: 'In Review', cls: 'status-pending' },
      { key: 'approved', label: 'Approved / Completed', cls: 'status-approved' },
      { key: 'rejected', label: 'Rejected', cls: 'status-rejected' }
    ];
    summaryEl.innerHTML = tiles.map(t => `
      <div class="card dash-status-card ${t.cls} reveal in">
        <span class="dash-status-dot"></span>
        <div><div class="label">${t.label}</div><div class="count">${counts[t.key] || 0} item${(counts[t.key] || 0) === 1 ? '' : 's'}</div></div>
      </div>`).join('');
  }

  if (body){
    body.innerHTML = applications.map(a => `
      <tr>
        <td>${a.title}<div style="font-size:11.5px;color:var(--ink-soft);margin-top:2px;">${a.type} Application</div></td>
        <td>${a.target}</td>
        <td>${a.submitted}</td>
        <td>${pill(a.status)}</td>
      </tr>`).join('');
  }
}

/* =========================================================
   SCHOLARSHIPS & JOBS — BROWSING (discovery views, distinct from
   the Applications tracker above which shows submitted status.
   Reuses .feature-card and .job-card from the shared style.css —
   same components the homepage uses — instead of new ones.)
========================================================= */
function renderScholarshipsBrowse(){
  const grid = document.getElementById('scholarships-browse-grid');
  if (!grid) return;
  grid.innerHTML = browsableScholarships.map(s => `
    <div class="card feature-card reveal in">
      <div class="ic">🎓</div>
      <h4>${s.name}</h4>
      <p>${s.provider} · ${s.flatText ? s.flatText : `Up to <span class="money" data-price-base="${s.amountBase}">${money(s.amountBase)}</span>${s.unit}`}</p>
      <div class="bottom-row" style="margin-top:14px; display:flex; align-items:center; justify-content:space-between;">
        <span style="color:var(--gold); font-weight:600; font-size:12.5px;">${s.deadline}</span>
        <button type="button" class="link-muted" style="font-size:12.5px; background:none; border:none; cursor:pointer;" onclick="notifyNotWiredYet('Scholarship application will be available once the applications backend is connected.')">Apply →</button>
      </div>
    </div>`).join('');
}

function renderJobsBrowse(){
  const grid = document.getElementById('jobs-browse-grid');
  if (!grid) return;
  grid.innerHTML = browsableJobs.map(j => `
    <div class="card job-card reveal in">
      <div class="top"><div><h4>${j.role}</h4><div class="org">${j.org}</div></div></div>
      <div class="pay">${j.payMax
        ? `<span class="money" data-price-base="${j.payMin}">${money(j.payMin)}</span> – <span class="money" data-price-base="${j.payMax}">${money(j.payMax)}</span>${j.unit}`
        : `<span class="money" data-price-base="${j.payMin}">${money(j.payMin)}</span>${j.unit}`}</div>
      <div class="tag-row">${j.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="bottom-row" style="margin-top:10px; display:flex; gap:8px;">
        <button type="button" class="btn btn-outline" style="padding:8px 14px; font-size:12.5px;" onclick="notifyNotWiredYet('Job saving will be available once the applications backend is connected.')">Save</button>
        <button type="button" class="btn btn-primary" style="padding:8px 14px; font-size:12.5px;" onclick="notifyNotWiredYet('Job application will be available once the applications backend is connected.')">Apply</button>
      </div>
    </div>`).join('');
}

/* =========================================================
   FIND A TUTOR (separate marketplace from school/institution
   enrollment — reuses .people-card/.tag/.card, no new component)
========================================================= */
const TUTOR_COLORS = ['#0E4D3C', '#1B8A63', '#E3A23C', '#C75C4D'];

function tutorPriceDisplay(t){
  if (t.pricing.negotiable) return `<span data-i18n="tutor.priceNegotiable">Price Negotiable</span>`;
  if (t.pricing.contactForPrice) return `<span data-i18n="tutor.contactForPrice">Contact for Price</span>`;
  return `<span class="money" data-price-base="${t.pricing.amountBase}">${money(t.pricing.amountBase)}</span> / ${t.pricing.unit}`;
}

function initTutorFilters(){
  const subjectSelect = document.getElementById('tutor-filter-subject');
  if (!subjectSelect) return;
  const subjects = [...new Set(tutors.flatMap(t => t.subjects))].sort();
  subjectSelect.innerHTML = '<option value="">All Subjects</option>' + subjects.map(s => `<option value="${s}">${s}</option>`).join('');

  ['tutor-filter-subject', 'tutor-filter-mode', 'tutor-filter-format'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', renderTutors);
  });
}

function renderTutors(){
  const grid = document.getElementById('tutors-grid');
  if (!grid) return;

  const subject = document.getElementById('tutor-filter-subject')?.value || '';
  const mode = document.getElementById('tutor-filter-mode')?.value || '';
  const format = document.getElementById('tutor-filter-format')?.value || '';

  const filtered = tutors.filter(t =>
    (!subject || t.subjects.includes(subject)) &&
    (!mode || t.mode === mode || t.mode === 'both') &&
    (!format || t.format === format)
  );

  if (!filtered.length){
    grid.innerHTML = `<div class="u-empty" style="grid-column:1/-1;"><div class="u-empty-ic">🔍</div><h4>No tutors match these filters</h4><p>Try a different subject, mode or format.</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((t, i) => `
    <div class="card people-card reveal in" style="text-align:left; padding:22px;">
      <div style="display:flex; gap:14px; align-items:flex-start;">
        <div class="avatar" style="background:${TUTOR_COLORS[i % TUTOR_COLORS.length]}; margin:0; flex-shrink:0;">${t.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
        <div style="flex:1; min-width:0;">
          <h4 style="text-align:left;">${t.name}${t.verified ? ` <span class="tag" data-i18n="tutor.verified">Verified</span>` : ''}</h4>
          <div class="role" style="text-align:left; margin:2px 0 0;">${t.subjects.join(', ')} · ${t.gradesTaught}</div>
        </div>
      </div>
      <p style="font-size:13px; color:var(--ink-soft); margin:12px 0;">${t.intro}</p>
      <div class="tag-row">
        <span class="tag">${t.mode === 'both' ? 'Online + Offline' : t.mode === 'online' ? 'Online' : 'Offline'}</span>
        <span class="tag">${t.format === 'individual' ? 'Individual' : 'Group'}</span>
        <span class="tag">${t.experienceYears} yrs experience</span>
      </div>
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:14px;">
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:14px; color:var(--forest);">${tutorPriceDisplay(t)}</span>
        <span style="font-size:12.5px; color:var(--ink-soft);">⭐ ${t.rating} (${t.reviews})</span>
      </div>
      <button class="btn btn-primary" style="width:100%; margin-top:14px;" type="button" data-request-tutor="${t.id}" data-i18n="tutor.requestTuition">Request Tuition</button>
    </div>`).join('');

  grid.querySelectorAll('[data-request-tutor]').forEach(btn => {
    btn.addEventListener('click', () => openTutorRequestModal(btn.dataset.requestTutor));
  });
  if (typeof applyTranslations === 'function') applyTranslations(document.documentElement.lang || 'en');
}

function openTutorRequestModal(tutorId){
  const tutor = tutors.find(t => t.id === tutorId);
  const titleEl = document.getElementById('tutor-request-title');
  const subjectSelect = document.getElementById('tutor-request-subject');
  const submitBtn = document.getElementById('tutor-request-submit');
  if (!tutor || !titleEl || !subjectSelect) return;

  titleEl.textContent = `Request Tuition — ${tutor.name}`;
  subjectSelect.innerHTML = tutor.subjects.map(s => `<option value="${s}">${s}</option>`).join('');

  if (submitBtn){
    submitBtn.onclick = () => notifyNotWiredYet('Tuition requests will reach the tutor once the messaging/booking backend is connected.');
  }
  if (typeof openModal === 'function') openModal('tutor-request-modal');
}

/* =========================================================
   MY TUITION (status of tuition requests/relationships — kept
   separate from Applications and My Courses; private tuition is
   not a school enrollment)
========================================================= */
function renderMyTuition(){
  const el = document.getElementById('my-tuition-list');
  if (!el) return;
  if (!myTuition.length){
    el.innerHTML = `<div class="u-empty"><div class="u-empty-ic">🧑‍🏫</div><h4>No active tuition yet</h4><p>Requests you send to tutors will appear here once sent.</p></div>`;
    return;
  }
  el.innerHTML = myTuition.map(t => `
    <div class="dash-list-item">
      <span class="dash-list-icon c-forest"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></svg></span>
      <div class="dash-list-body"><div class="title">${t.subject} with ${t.tutor}</div><div class="desc">${t.next}</div></div>
      ${pill(t.status)}
    </div>`).join('');
}

/* =========================================================
   MY INSTITUTIONS (reuses the homepage's existing .inst-card
   component from the shared style.css instead of a new one)
========================================================= */
function renderInstitutions(){
  const grid = document.getElementById('my-institutions-grid');
  if (!grid) return;
  const colors = ['#0E4D3C', '#1B8A63', '#E3A23C'];
  grid.innerHTML = myInstitutions.map((inst, i) => `
    <div class="card inst-card reveal in">
      <div class="logo-circle" style="color:${colors[i % colors.length]}">${inst.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
      <h4>${inst.name}</h4>
      <div class="meta">${inst.type}</div>
      <div class="tag-row">${inst.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>`).join('');
}

/* =========================================================
   MARKETPLACE — BUY & SELL (Student is both buyer and seller)
========================================================= */
function renderMarketplace(){
  const listingsEl = document.getElementById('my-listings-grid');
  const ordersEl = document.getElementById('my-orders-list');

  if (listingsEl){
    listingsEl.innerHTML = marketListings.map(m => `
      <div class="card market-card reveal in">
        <div class="thumb" style="background:${m.status === 'draft' ? 'var(--sand)' : 'rgba(27,138,99,.12)'};">${m.ic}</div>
        <div class="body">
          <h5>${m.name}</h5>
          <div class="price money" data-price-base="${m.priceBase}">${money(m.priceBase)}</div>
          <div style="margin-top:8px;">${pill(m.status)}</div>
        </div>
      </div>`).join('');
  }
  if (ordersEl){
    ordersEl.innerHTML = marketOrders.map(o => `
      <div class="myorder-row">
        <div class="thumb">${o.ic}</div>
        <div class="body"><div class="name">${o.name}</div><div class="meta">Sold by ${o.seller}</div></div>
        <div class="money" data-price-base="${o.priceBase}" style="font-family:'JetBrains Mono',monospace; font-size:13px; font-weight:700;">${money(o.priceBase)}</div>
        ${pill(o.status)}
      </div>`).join('');
  }
}

/* =========================================================
   FEES & PAYMENTS (Wallet section — CareerZ payment marked as
   the recommended option, never claimed as guaranteed/secure
   beyond what's actually implemented)
========================================================= */
function renderFees(){
  const el = document.getElementById('fees-list');
  if (!el) return;
  el.innerHTML = fees.map(f => `
    <div class="fee-row">
      <div>
        <div class="name">${f.name}</div>
        <div class="due">Due ${f.dueDate} · <span class="money" data-price-base="${f.amountBase}">${money(f.amountBase)}</span></div>
      </div>
      <div class="actions">
        ${pill(f.status)}
        ${f.status !== 'paid' ? `
          <button class="btn btn-primary" style="padding:8px 14px; font-size:12.5px;" type="button" onclick="notifyNotWiredYet('CareerZ payment will be available once payment integration is connected.')">
            <span data-i18n="payment.payWithCareerz">Pay with CareerZ</span> <span class="tag tag-recommended" style="margin-inline-start:4px;" data-i18n="payment.recommended">Recommended</span>
          </button>
          <button class="btn btn-outline" style="padding:8px 14px; font-size:12.5px;" type="button" onclick="notifyNotWiredYet('Challan download will be available once billing integration is connected.')" data-i18n="payment.viewChallan">View Challan</button>
        ` : `<button class="btn btn-outline" style="padding:8px 14px; font-size:12.5px;" type="button" onclick="notifyNotWiredYet('Receipt download will be available once billing integration is connected.')" data-i18n="payment.receipt">Receipt</button>`}
      </div>
    </div>`).join('');
}

/* =========================================================
   CURRENCY RE-RENDER
   Fees and Marketplace prices reformat whenever the person
   changes their preferred currency — same event the Wallet
   card already listens for, so nothing here can disagree with it.
========================================================= */
function refreshMoneyDisplays(){
  document.querySelectorAll('.money[data-price-base]').forEach(el => {
    el.textContent = money(Number(el.dataset.priceBase));
  });
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initRoleSwitcher();
  initProgressRing();
  initCalendar();
  initSidebarNotifLink();

  renderAcademicOverview();
  renderClasses();
  renderCourses();
  renderCertificates();
  renderAssignments();
  renderApplications();
  renderScholarshipsBrowse();
  renderJobsBrowse();
  renderInstitutions();
  initTutorFilters();
  renderTutors();
  renderMyTuition();
  renderMarketplace();
  renderFees();

  // Dynamic content above is injected after the framework's own initial
  // applyTranslations() pass already ran at DOMContentLoaded, so without
  // this it would stay untranslated until the next manual language
  // switch. Reuses the existing function — no second i18n mechanism.
  if (typeof applyTranslations === 'function'){
    applyTranslations(document.documentElement.lang || 'en');
  }

  document.addEventListener('careerz:currency-changed', refreshMoneyDisplays);
});
