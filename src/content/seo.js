// Search engine text for every fixed public page: title (under ~60 characters), description
// (~150 characters) and the keywords people in Pakistan actually search for. Used by PageSeo in
// the browser and by scripts/public-seo.mjs, which writes a ready HTML file for each page at build
// time. Detail pages (a job, course, institute…) get their own text from the server (seo.service).

export const SITE_URL = 'https://careerz.pk';
const Y = new Date().getFullYear();

export const BASE_KEYWORDS = ['CareerZ', 'CareerZ.pk', 'education platform Pakistan', 'jobs in Pakistan', 'scholarships in Pakistan', 'online courses Pakistan', 'admissions'];

export const PAGE_SEO = {
  '/': {
    title: 'CareerZ.pk – Jobs, Scholarships, Admissions & Online Courses in Pakistan',
    description: `CareerZ.pk: find jobs in Pakistan, scholarships ${Y}, school and university admissions, online courses with certificates, tutors and a student marketplace in one place.`,
    keywords: [`jobs in Pakistan ${Y}`, `scholarships ${Y}`, `admissions ${Y}`, 'online courses with certificate', 'teacher jobs', 'school management system Pakistan', 'student portal', 'parent portal', 'AI career guidance', 'education ecosystem', 'study abroad', 'overseas jobs'],
    h1: 'CareerZ: jobs, scholarships, admissions and courses in Pakistan',
    text: 'CareerZ connects students, parents, teachers, institutes, employers, education agents and donors on one verified platform. Search jobs in Pakistan and abroad, apply for scholarships, compare schools, colleges and universities, take online courses with certificates and buy or sell books and notes safely.'
  },
  '/jobs': {
    title: `Jobs in Pakistan ${Y} – Latest Teacher, Government & Private Jobs`,
    description: `Latest jobs in Pakistan ${Y} from verified employers and institutes: teacher jobs, government jobs, private jobs, internships, remote and overseas jobs with visa sponsorship. Apply online.`,
    keywords: [`jobs in Pakistan ${Y}`, 'latest jobs', 'teacher jobs', 'government jobs', 'private jobs', 'jobs in Lahore', 'jobs in Karachi', 'jobs in Islamabad', 'jobs in Rawalpindi', 'jobs in Faisalabad', 'internships in Pakistan', 'remote jobs Pakistan', 'overseas jobs', 'jobs in Dubai for Pakistani', 'visa sponsorship jobs', 'fresh graduate jobs', 'part time jobs for students'],
    h1: 'Jobs in Pakistan and abroad',
    text: 'Open jobs from verified institutes, employers and education agents. Filter by city, category, job type, work mode and experience, then apply with your CareerZ CV.'
  },
  '/scholarships': {
    title: `Scholarships ${Y} for Pakistani Students – Fully Funded & Need Based`,
    description: `Scholarships ${Y} for Pakistani students: fully funded, need-based and merit scholarships for school, college, university and study abroad. Check eligibility and deadlines and apply.`,
    keywords: [`scholarships ${Y}`, 'scholarships in Pakistan', 'scholarships for Pakistani students', 'fully funded scholarships', 'need based scholarships', 'merit scholarships', 'study abroad scholarships', 'undergraduate scholarships', 'masters scholarships', 'PhD scholarships', 'scholarships for girls Pakistan', 'matric inter scholarships'],
    h1: `Scholarships ${Y} for Pakistani students`,
    text: 'Open scholarships funded by verified donors and organizations. See the amount, seats, eligibility and deadline of each scholarship and apply online.'
  },
  '/institutes': {
    title: `Schools, Colleges & Universities in Pakistan – Admissions ${Y}`,
    description: `Verified schools, colleges, universities, academies and tuition centers in Pakistan. Compare programs and fee structure, check admissions ${Y} and apply online on CareerZ.`,
    keywords: [`admissions ${Y}`, 'schools in Pakistan', 'colleges in Pakistan', 'universities in Pakistan', 'best schools in Lahore', 'best schools in Karachi', 'schools in Islamabad', 'academies', 'tuition centers', 'madrasa', 'fee structure', 'university admissions', 'college admissions', 'online admission form'],
    h1: 'Schools, colleges, universities and academies in Pakistan',
    text: 'Schools, colleges, universities and academies verified by CareerZ. Compare programs and fees, read reviews and apply for admission online.'
  },
  '/courses': {
    title: 'Online Courses in Pakistan with Certificate – Free & Paid',
    description: 'Online courses in Pakistan from verified teachers and institutes: free and paid courses with certificates in IT, English, Quran, skills, matric, FSc and university subjects.',
    keywords: ['online courses Pakistan', 'free online courses with certificate', 'online classes', 'IT courses', 'computer courses', 'English language course', 'spoken English', 'online Quran classes', 'matric tuition', 'FSc online classes', 'skill development courses', 'freelancing course', 'online tutor'],
    h1: 'Online courses with certificates',
    text: 'Published courses from verified teachers and institutes, online, on campus, recorded or self-paced. Enroll, learn and earn a verifiable certificate.'
  },
  '/marketplace': {
    title: 'Student Marketplace – Buy & Sell Books, Notes and Uniforms',
    description: 'Buy and sell used books, notes, school uniforms, stationery and electronics in Pakistan. Safe payment held by CareerZ until delivery, verified sellers and buyer reviews.',
    keywords: ['buy sell books Pakistan', 'used books', 'second hand books', 'notes for sale', 'matric notes', 'FSc notes', 'school uniforms', 'stationery', 'student marketplace', 'buy books online Pakistan', 'past papers'],
    h1: 'Student marketplace',
    text: 'Books, notes, uniforms, stationery and services from verified sellers. Your payment is held by CareerZ and released to the seller only after delivery.'
  },
  '/donors': {
    title: 'Education Donors & Scholarship Sponsors in Pakistan',
    description: 'Verified individual and organization donors funding scholarships and education in Pakistan. See their open scholarships or sponsor a student through CareerZ.',
    keywords: ['education donors Pakistan', 'scholarship sponsors', 'donate for education', 'sponsor a student', 'education charity Pakistan', 'zakat for education'],
    h1: 'Education donors and sponsors',
    text: 'Verified donors and organizations who chose to share a public profile, with the scholarships they fund.'
  },
  '/visa': {
    title: 'Visa & Overseas Jobs Center – Work Visa Rules by Country',
    description: 'Work visa, work permit and labour rules for UAE, Saudi Arabia, Qatar, UK and more, verified visa consultants and an AI assistant. CareerZ is not a visa agency.',
    keywords: ['work visa', 'overseas jobs', 'UAE work visa', 'Saudi work visa', 'Qatar work permit', 'UK skilled worker visa', 'visa consultants in Pakistan', 'OEP licensed agents', 'Protector of Emigrants', 'visa requirements for Pakistani'],
    h1: 'Visa and recruitment support center',
    text: 'Work permit, visa and labour rules by country, verified visa consultants and an AI assistant that gives information only. Government visa fees are paid only on official portals.'
  },
  '/blog': {
    title: 'Education & Career Blog – Scholarships, Admissions and Jobs Guides',
    description: 'CareerZ blog: scholarship guides, admission updates, study tips, career advice, CV and interview tips for students, parents and teachers in Pakistan.',
    keywords: ['education blog Pakistan', 'scholarship guide', 'admission updates', 'career advice', 'CV tips', 'interview tips', 'study tips', 'exam preparation'],
    h1: 'CareerZ blog'
  },
  '/about': { title: 'About CareerZ – Education, Jobs and Careers Platform', description: 'CareerZ is a Pakistani AI-powered education and career platform connecting students, parents, teachers, institutes, employers, agents and donors.', keywords: ['about CareerZ', 'education technology Pakistan', 'edtech Pakistan'] },
  '/contact': { title: 'Contact CareerZ – Support, Partnerships and Help', description: 'Contact CareerZ by email at info@careerz.pk or call 0300-2425623 for support, partnerships, institute onboarding and advertising.', keywords: ['contact CareerZ', 'CareerZ helpline', 'CareerZ support'] },
  '/faq': { title: 'CareerZ FAQ – Accounts, Admissions, Jobs and Payments', description: 'Answers to common questions about CareerZ accounts, verification, admissions, jobs, scholarships, payments, refunds and safety.', keywords: ['CareerZ FAQ', 'how to apply online', 'how to verify account'] },
  '/help': { title: 'Help Center – How to Use CareerZ', description: 'Step-by-step help for students, parents, teachers, institutes, employers, agents and donors using CareerZ.', keywords: ['CareerZ help', 'how to use CareerZ'] },
  '/careers': { title: 'Careers at CareerZ – Work With Us', description: 'Join the CareerZ team and help build the education and career platform for Pakistan and beyond.', keywords: ['CareerZ careers', 'edtech jobs Pakistan'] },
  '/partnership': { title: 'Partner With CareerZ – Institutes, Employers and NGOs', description: 'Partner with CareerZ as an institute, employer, NGO or brand to reach students, parents and job seekers across Pakistan.', keywords: ['education partnership', 'institute partnership', 'campus recruitment'] },
  '/advertise': { title: 'Advertise on CareerZ – Reach Students and Parents', description: 'Advertise your school, academy, course or brand to students, parents, teachers and job seekers on CareerZ.', keywords: ['advertise to students Pakistan', 'education advertising'] },
  '/press': { title: 'Press & Media – CareerZ News and Brand Assets', description: 'Press releases, media contacts and brand information about CareerZ.', keywords: ['CareerZ press', 'CareerZ news'] },
  '/news': { title: 'CareerZ News and Platform Updates', description: 'Latest CareerZ news, new features and platform updates for students, institutes and employers.', keywords: ['CareerZ news', 'education news Pakistan'] },
  '/agent-program': { title: 'Education Agent Program – Post Jobs and Scholarships', description: 'Join CareerZ as a verified education agent or recruitment agency: post jobs and scholarships, earn employer-paid commission and manage candidates.', keywords: ['education agent', 'recruitment agency Pakistan', 'OEP agents', 'overseas employment promoter'] },
  '/donor-program': { title: 'Donor Program – Fund Scholarships Safely', description: 'Fund scholarships and sponsor students through CareerZ with verified applicants, bank transfer receipts and progress updates.', keywords: ['sponsor a student', 'scholarship donor', 'donate for education Pakistan'] },
  '/become-a-seller': { title: 'Become a Seller – Sell Books, Notes and Courses', description: 'Sell books, notes, uniforms, digital products and courses to students on CareerZ with escrow payments and seller ratings.', keywords: ['sell books online Pakistan', 'sell notes online', 'sell courses online'] },
  '/privacy': { title: 'Privacy Policy', description: 'How CareerZ collects, uses, stores and protects personal data of students, parents, teachers and other users.', keywords: ['CareerZ privacy policy'] },
  '/terms': { title: 'Terms & Conditions', description: 'The terms and conditions for using CareerZ services, accounts, payments and content.', keywords: ['CareerZ terms'] },
  '/cookies': { title: 'Cookie Policy', description: 'How CareerZ uses cookies and similar technologies.', keywords: ['CareerZ cookies'] },
  '/refund': { title: 'Refund Policy', description: 'When and how payments made on CareerZ can be refunded.', keywords: ['CareerZ refund policy'] },
  '/cancellation': { title: 'Cancellation Policy', description: 'How to cancel orders, enrollments and subscriptions on CareerZ.', keywords: ['CareerZ cancellation policy'] },
  '/community-guidelines': { title: 'Community Guidelines', description: 'Rules that keep CareerZ safe and respectful for students, teachers, parents and everyone else.', keywords: ['CareerZ community guidelines'] },
  '/code-of-conduct': { title: 'Code of Conduct', description: 'The standard of behaviour expected from everyone using CareerZ.', keywords: ['CareerZ code of conduct'] },
  '/accessibility': { title: 'Accessibility', description: 'How CareerZ works to be usable by everyone, including people with disabilities.', keywords: ['CareerZ accessibility'] },
  '/sitemap': { title: 'Sitemap – All CareerZ Pages', description: 'Every public page on CareerZ: jobs, scholarships, institutes, courses, marketplace, blog, policies and help.', keywords: ['CareerZ sitemap'] }
};

export const seoFor = (path) => PAGE_SEO[path] || null;

// Urdu (/ur/…) title, description, heading and keywords for the main fixed pages. Pages without an
// entry here still open in Urdu (the app translates them), but are not listed for search engines.
export const PAGE_SEO_UR = {
  '/': { title: 'پاکستان میں نوکریاں، اسکالرشپس، داخلے اور آن لائن کورسز', description: `CareerZ.pk: پاکستان میں نوکریاں، اسکالرشپس ${Y}، اسکول اور یونیورسٹی داخلے، سرٹیفکیٹ والے آن لائن کورسز، ٹیوٹرز اور طلبہ کی مارکیٹ پلیس، سب ایک جگہ۔`, h1: 'CareerZ: پاکستان میں نوکریاں، اسکالرشپس، داخلے اور کورسز', text: 'CareerZ طلبہ، والدین، اساتذہ، تعلیمی اداروں، آجروں، ایجنٹس اور ڈونرز کو ایک تصدیق شدہ پلیٹ فارم پر جوڑتا ہے۔ نوکریاں تلاش کریں، اسکالرشپ کے لیے اپلائی کریں، اسکول، کالج اور یونیورسٹیوں کا موازنہ کریں اور آن لائن کورسز کریں۔', keywords: [`پاکستان میں نوکریاں ${Y}`, `اسکالرشپ ${Y}`, `داخلہ ${Y}`, 'آن لائن کورسز', 'ٹیچر کی نوکری', 'سرکاری نوکریاں', 'بیرون ملک نوکریاں'] },
  '/jobs': { title: `پاکستان میں نوکریاں ${Y} – ٹیچر، سرکاری اور پرائیویٹ نوکریاں`, description: `پاکستان میں تازہ ترین نوکریاں ${Y}: ٹیچر کی نوکریاں، سرکاری نوکریاں، پرائیویٹ نوکریاں، انٹرن شپ، ریموٹ اور ویزا اسپانسرشپ والی بیرون ملک نوکریاں۔ آن لائن اپلائی کریں۔`, h1: 'پاکستان اور بیرون ملک نوکریاں', text: 'تصدیق شدہ اداروں، آجروں اور ایجنٹس کی کھلی نوکریاں۔ شہر، کیٹیگری اور تجربے کے مطابق تلاش کریں اور اپنی CareerZ سی وی کے ساتھ اپلائی کریں۔', keywords: [`پاکستان میں نوکریاں ${Y}`, 'تازہ ترین نوکریاں', 'ٹیچر کی نوکری', 'سرکاری نوکریاں', 'لاہور میں نوکریاں', 'کراچی میں نوکریاں', 'اسلام آباد میں نوکریاں', 'دبئی میں نوکریاں', 'طلبہ کے لیے پارٹ ٹائم نوکری'] },
  '/scholarships': { title: `پاکستانی طلبہ کے لیے اسکالرشپس ${Y}`, description: `پاکستانی طلبہ کے لیے اسکالرشپس ${Y}: فلی فنڈڈ، نیڈ بیسڈ اور میرٹ اسکالرشپس، اسکول، کالج، یونیورسٹی اور بیرون ملک تعلیم کے لیے۔ اہلیت اور آخری تاریخ دیکھیں۔`, h1: `پاکستانی طلبہ کے لیے اسکالرشپس ${Y}`, text: 'تصدیق شدہ ڈونرز اور اداروں کی اسکالرشپس۔ ہر اسکالرشپ کی رقم، سیٹیں، اہلیت اور آخری تاریخ دیکھیں اور آن لائن اپلائی کریں۔', keywords: [`اسکالرشپ ${Y}`, 'پاکستان میں اسکالرشپس', 'فلی فنڈڈ اسکالرشپ', 'نیڈ بیسڈ اسکالرشپ', 'بیرون ملک تعلیم کی اسکالرشپ', 'لڑکیوں کے لیے اسکالرشپ'] },
  '/institutes': { title: `پاکستان کے اسکول، کالج اور یونیورسٹیاں – داخلے ${Y}`, description: `پاکستان کے تصدیق شدہ اسکول، کالج، یونیورسٹیاں، اکیڈمیاں اور ٹیوشن سینٹرز۔ پروگرامز اور فیس کا موازنہ کریں، داخلے ${Y} دیکھیں اور آن لائن اپلائی کریں۔`, h1: 'پاکستان کے اسکول، کالج، یونیورسٹیاں اور اکیڈمیاں', text: 'CareerZ کے تصدیق شدہ تعلیمی ادارے۔ پروگرامز اور فیس کا موازنہ کریں، ریویوز پڑھیں اور آن لائن داخلے کے لیے اپلائی کریں۔', keywords: [`داخلہ ${Y}`, 'پاکستان کے اسکول', 'لاہور کے بہترین اسکول', 'کراچی کے بہترین اسکول', 'یونیورسٹی داخلہ', 'فیس اسٹرکچر', 'آن لائن داخلہ فارم'] },
  '/courses': { title: 'سرٹیفکیٹ کے ساتھ آن لائن کورسز – مفت اور پیڈ', description: 'پاکستان میں تصدیق شدہ اساتذہ اور اداروں کے آن لائن کورسز: آئی ٹی، انگلش، قرآن، اسکلز، میٹرک اور ایف ایس سی کے مفت اور پیڈ کورسز سرٹیفکیٹ کے ساتھ۔', h1: 'سرٹیفکیٹ کے ساتھ آن لائن کورسز', text: 'آن لائن، کیمپس پر، ریکارڈڈ یا اپنی رفتار سے کورسز۔ داخلہ لیں، سیکھیں اور تصدیق شدہ سرٹیفکیٹ حاصل کریں۔', keywords: ['آن لائن کورسز', 'مفت آن لائن کورسز سرٹیفکیٹ کے ساتھ', 'آن لائن کلاسز', 'کمپیوٹر کورس', 'اسپوکن انگلش', 'آن لائن قرآن کلاسز', 'فری لانسنگ کورس'] },
  '/marketplace': { title: 'اسٹوڈنٹ مارکیٹ پلیس – کتابیں، نوٹس اور یونیفارم خریدیں اور بیچیں', description: 'پاکستان میں پرانی کتابیں، نوٹس، اسکول یونیفارم اور اسٹیشنری خریدیں اور بیچیں۔ ڈیلیوری تک رقم CareerZ کے پاس محفوظ رہتی ہے۔', h1: 'اسٹوڈنٹ مارکیٹ پلیس', text: 'تصدیق شدہ بیچنے والوں کی کتابیں، نوٹس، یونیفارم اور سروسز۔ آپ کی ادائیگی ڈیلیوری کے بعد ہی بیچنے والے کو ملتی ہے۔', keywords: ['پرانی کتابیں', 'نوٹس برائے فروخت', 'میٹرک نوٹس', 'ایف ایس سی نوٹس', 'اسکول یونیفارم', 'آن لائن کتابیں خریدیں'] },
  '/visa': { title: 'ویزا اور بیرون ملک نوکریوں کا سینٹر – ملک وار ورک ویزا قوانین', description: 'یو اے ای، سعودی عرب، قطر، برطانیہ اور دیگر ممالک کے ورک ویزا، ورک پرمٹ اور لیبر قوانین، تصدیق شدہ ویزا کنسلٹنٹس اور اے آئی اسسٹنٹ۔ CareerZ ویزا ایجنسی نہیں ہے۔', h1: 'ویزا اور ریکروٹمنٹ سپورٹ سینٹر', text: 'ملک وار ورک پرمٹ، ویزا اور لیبر قوانین، تصدیق شدہ ویزا کنسلٹنٹس اور معلومات دینے والا اے آئی اسسٹنٹ۔ سرکاری ویزا فیس صرف سرکاری پورٹل پر ادا کی جاتی ہے۔', keywords: ['ورک ویزا', 'بیرون ملک نوکریاں', 'دبئی ورک ویزا', 'سعودی ورک ویزا', 'ویزا کنسلٹنٹ', 'او ای پی لائسنس یافتہ ایجنٹ'] },
  '/blog': { title: 'تعلیم اور کیریئر بلاگ – اسکالرشپس، داخلے اور نوکریوں کی رہنمائی', description: 'CareerZ بلاگ: اسکالرشپ گائیڈز، داخلوں کی خبریں، پڑھائی کے طریقے، کیریئر مشورے، سی وی اور انٹرویو ٹپس۔', h1: 'CareerZ بلاگ', keywords: ['تعلیمی بلاگ', 'اسکالرشپ گائیڈ', 'داخلوں کی خبریں', 'کیریئر مشورے', 'سی وی ٹپس', 'انٹرویو ٹپس'] },
  '/donors': { title: 'پاکستان میں تعلیمی ڈونرز اور اسکالرشپ اسپانسرز', description: 'پاکستان میں تعلیم اور اسکالرشپس کے لیے فنڈنگ کرنے والے تصدیق شدہ ڈونرز اور ادارے۔ ان کی اسکالرشپس دیکھیں یا کسی طالب علم کی کفالت کریں۔', h1: 'تعلیمی ڈونرز اور اسپانسرز', keywords: ['تعلیمی ڈونر', 'طالب علم کی کفالت', 'تعلیم کے لیے عطیہ', 'زکوٰۃ برائے تعلیم'] },
  '/about': { title: 'CareerZ کے بارے میں – تعلیم، نوکریاں اور کیریئر پلیٹ فارم', description: 'CareerZ ایک پاکستانی اے آئی تعلیمی اور کیریئر پلیٹ فارم ہے جو طلبہ، والدین، اساتذہ، اداروں، آجروں، ایجنٹس اور ڈونرز کو جوڑتا ہے۔', keywords: ['CareerZ کے بارے میں', 'پاکستان ایڈٹیک'] },
  '/contact': { title: 'CareerZ سے رابطہ کریں', description: 'سپورٹ، شراکت داری اور اشتہارات کے لیے info@careerz.pk پر ای میل کریں یا 0300-2425623 پر کال کریں۔', keywords: ['CareerZ رابطہ', 'CareerZ ہیلپ لائن'] },
  '/faq': { title: 'CareerZ عمومی سوالات – اکاؤنٹ، داخلے، نوکریاں اور ادائیگیاں', description: 'CareerZ اکاؤنٹس، تصدیق، داخلوں، نوکریوں، اسکالرشپس، ادائیگیوں، ریفنڈ اور حفاظت کے بارے میں عام سوالات کے جوابات۔', keywords: ['CareerZ سوالات', 'آن لائن اپلائی کیسے کریں'] }
};
export const seoForUr = (path) => PAGE_SEO_UR[path] || null;
