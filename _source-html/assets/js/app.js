/* =============================================================
   CAREERZ AI — SHARED APPLICATION SCRIPT
   Extracted from index.html — powers theme toggle, navigation,
   search, i18n, ticker, stats, AI console, carousels, toasts,
   currency system, data-driven section rendering, and FAQ.
   Depends on DOM elements present in index.html (and shared
   markup partials used across other platform pages).
================================================================= */

/* =========================================================
   I18N (English / Urdu)
========================================================= */
const i18n = {
  en: {
    heroH1: 'The Complete <em>AI-Powered</em> Education Ecosystem',
    heroLead: "CareerZ.pk connects students, parents, teachers, institutions, employers, agents and donors — guided by AI, from admission to career. Built for students, institutions and educators worldwide."
  },
  ur: {
    heroH1: 'مکمل <em>AI-پاورڈ</em> تعلیمی ایکو سسٹم',
    heroLead: 'CareerZ.pk طلباء، والدین، اساتذہ، اداروں، آجرین، ایجنٹس اور ڈونرز کو ایک ساتھ جوڑتا ہے — داخلے سے کیریئر تک، AI کی رہنمائی میں۔'
  }
};

/* =========================================================
   MULTILINGUAL GLOBE SELECTOR
========================================================= */
(function(){
  const btn = document.getElementById('lang-select-btn');
  const dropdown = document.getElementById('lang-dropdown');
  const labelEl = document.getElementById('lang-label');

  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', ()=>{
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  dropdown.addEventListener('click', (e)=>{
    e.stopPropagation();
    const langBtn = e.target.closest('button[data-lang]');
    if(!langBtn) return;
    dropdown.querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    langBtn.classList.add('active');
    const lang = langBtn.dataset.lang;
    const label = langBtn.dataset.label;
    labelEl.textContent = label;
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    // Apply RTL for Arabic, Urdu, Persian, Hebrew
    const rtlLangs = ['ur','ar','fa','he'];
    document.documentElement.lang = lang;
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    // Update hero text for supported i18n keys
    if(i18n[lang]){
      const heroH1 = document.querySelector('.hero h1');
      const heroLead = document.querySelector('.hero p.lead');
      if(heroH1) heroH1.innerHTML = i18n[lang].heroH1;
      if(heroLead) heroLead.textContent = i18n[lang].heroLead;
    }
  });
})();

document.querySelector('.mobile-toggle').addEventListener('click', ()=>{
  document.querySelector('.nav-links').classList.toggle('mobile-open');
});

/* =========================================================
   DARK / LIGHT TOGGLE
========================================================= */
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', ()=>{
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';
  root.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '☀️' : '🌙';
});

/* =========================================================
   SCROLL PROGRESS
========================================================= */
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';
});

/* =========================================================
   REVEAL ON SCROLL
========================================================= */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); } });
},{threshold:0.12});
function observeReveals(){ document.querySelectorAll('.reveal').forEach(el=>revealObserver.observe(el)); }

/* =========================================================
   GLOBAL COUNTRY / CITY / CURRENCY DATA
========================================================= */
const countryCityData = {
  'Saudi Arabia': ['Riyadh','Jeddah','Dammam','Mecca','Medina'],
  'United Arab Emirates': ['Dubai','Abu Dhabi','Sharjah','Ajman'],
  'Pakistan': ['Lahore','Karachi','Islamabad','Faisalabad','Rawalpindi'],
  'India': ['Mumbai','Delhi','Bangalore','Hyderabad','Chennai'],
  'United Kingdom': ['London','Manchester','Birmingham','Edinburgh'],
  'United States': ['New York','Los Angeles','Chicago','Houston'],
  'Canada': ['Toronto','Vancouver','Montreal','Calgary'],
  'Australia': ['Sydney','Melbourne','Brisbane','Perth'],
  'Germany': ['Berlin','Munich','Frankfurt','Hamburg'],
  'France': ['Paris','Lyon','Marseille','Toulouse'],
  'Egypt': ['Cairo','Alexandria','Giza','Luxor'],
  'Nigeria': ['Lagos','Abuja','Ibadan','Kano'],
  'South Africa': ['Johannesburg','Cape Town','Durban','Pretoria'],
  'Kenya': ['Nairobi','Mombasa','Kisumu'],
  'China': ['Beijing','Shanghai','Shenzhen','Guangzhou'],
  'Japan': ['Tokyo','Osaka','Yokohama','Nagoya'],
  'Singapore': ['Singapore'],
  'Malaysia': ['Kuala Lumpur','Penang','Johor Bahru'],
  'Indonesia': ['Jakarta','Surabaya','Bandung'],
  'Brazil': ['São Paulo','Rio de Janeiro','Brasília'],
  'Turkey': ['Istanbul','Ankara','Izmir']
};
const countryCurrencyCode = {
  'Saudi Arabia':'SAR','United Arab Emirates':'AED','Pakistan':'PKR','India':'INR',
  'United Kingdom':'GBP','United States':'USD','Canada':'CAD','Australia':'AUD',
  'Germany':'EUR','France':'EUR','Egypt':'EGP','Nigeria':'NGN','South Africa':'ZAR',
  'Kenya':'KES','China':'CNY','Japan':'JPY','Singapore':'SGD','Malaysia':'MYR',
  'Indonesia':'IDR','Brazil':'BRL','Turkey':'TRY'
};
const CURRENCY = {
  PKR:{symbol:'Rs.', rate:1},
  SAR:{symbol:'SAR', rate:1/78},
  AED:{symbol:'AED', rate:1/80},
  USD:{symbol:'$', rate:1/278},
  GBP:{symbol:'£', rate:1/354},
  CAD:{symbol:'C$', rate:1/205},
  AUD:{symbol:'A$', rate:1/185},
  INR:{symbol:'₹', rate:1/3.35},
  EUR:{symbol:'€', rate:1/300},
  EGP:{symbol:'E£', rate:1/5.7},
  NGN:{symbol:'₦', rate:1/0.24},
  ZAR:{symbol:'R', rate:1/15.2},
  KES:{symbol:'KSh', rate:1/2.15},
  CNY:{symbol:'¥', rate:1/38.4},
  JPY:{symbol:'¥', rate:1/1.87},
  SGD:{symbol:'S$', rate:1/207},
  MYR:{symbol:'RM', rate:1/59},
  IDR:{symbol:'Rp', rate:4.4},
  BRL:{symbol:'R$', rate:1/54.6},
  TRY:{symbol:'₺', rate:1/8.4}
};
// Default currency is a neutral, internationally recognized reference (USD)
// until the visitor picks a country — no currency is hardcoded to any one nation.
const DEFAULT_CURRENCY = 'USD';
let activeCurrency = DEFAULT_CURRENCY;
function money(baseAmount){
  const c = CURRENCY[activeCurrency] || {symbol:'', rate:1};
  const val = Math.round(baseAmount * c.rate);
  return (c.symbol ? c.symbol + ' ' : '') + val.toLocaleString('en-US');
}
function moneyRange(minBase, maxBase, suffix){
  return money(minBase) + ' – ' + money(maxBase) + (suffix||'');
}

const countrySelect = document.getElementById('search-country');
const citySelect = document.getElementById('search-city');
if(countrySelect){
  countrySelect.innerHTML = '<option value="">All Countries</option>' +
    Object.keys(countryCityData).map(c=>`<option value="${c}">${c}</option>`).join('');
  countrySelect.addEventListener('change', ()=>{
    const country = countrySelect.value;
    if(country && countryCityData[country]){
      citySelect.innerHTML = '<option value="">All Cities</option>' +
        countryCityData[country].map(city=>`<option value="${city}">${city}</option>`).join('');
      activeCurrency = countryCurrencyCode[country] || DEFAULT_CURRENCY;
    } else {
      citySelect.innerHTML = '<option value="">All Cities</option>';
      activeCurrency = DEFAULT_CURRENCY;
    }
    refreshCurrencyDisplays();
  });
}

/* =========================================================
   LIVE TICKER CONTENT
========================================================= */
function buildTickerItems(){
  return [
    'Ayesha K. admitted to FAST-NU Lahore',
    'Punjab Group of Colleges awarded 12 new scholarships',
    'Systems Limited posted 8 new internship roles',
    `Bilal H. earned ${money(4200)} commission as Education Agent`,
    'LUMS Open House scheduled for next month',
    'Sara M. completed AI-recommended IELTS prep course',
    `NUST announces merit scholarship pool of ${money(5000000)}`,
    'Coca-Cola hiring management trainees via CareerZ'
  ];
}
const trackEl = document.getElementById('ticker-track');
function renderTicker(){
  const doubled = [...buildTickerItems(), ...buildTickerItems()];
  trackEl.innerHTML = doubled.map(t=>`<span>${t}</span>`).join('');
}
renderTicker();

/* =========================================================
   ANIMATED STAT COUNTERS
========================================================= */
const stats = [
  {label:'Verified Institutions', value:1280, suffix:'+'},
  {label:'Students', value:185000, suffix:'+'},
  {label:'Teachers', value:9600, suffix:'+'},
  {label:'Courses', value:3400, suffix:'+'},
  {label:'Employers', value:740, suffix:'+'},
  {label:'Education Agents', value:1200, suffix:'+'},
  {label:'Cities', value:62, suffix:''},
  {label:'Scholarships Awarded', value:8200, suffix:'+'}
];
const statGrid = document.getElementById('stat-grid');
statGrid.innerHTML = stats.map((s,i)=>`
  <div class="stat-item reveal">
    <div class="num"><span data-target="${s.value}" data-suffix="${s.suffix}">0</span></div>
    <div class="label">${s.label}</div>
  </div>`).join('');

function formatNum(n){ return n.toLocaleString('en-US'); }
function animateCounter(el){
  const target = parseInt(el.dataset.target,10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now){
    const progress = Math.min((now-start)/duration, 1);
    const eased = 1 - Math.pow(1-progress, 3);
    el.textContent = formatNum(Math.floor(eased*target)) + suffix;
    if(progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('[data-target]').forEach(animateCounter);
      statObserver.unobserve(e.target);
    }
  });
},{threshold:0.3});
statObserver.observe(document.getElementById('stats'));

/* =========================================================
   AI HERO CONSOLE — typed responses
========================================================= */
function getConsolePrompts(){
  return [
    {q:'"Suggest universities for me"', a:`Based on your interests in Computer Science and a budget under ${money(400000)}/year, I'd suggest FAST-NU, COMSATS Islamabad, and Bahria University — all offer strong CS programs with active CareerZ admission support.`},
    {q:'"Find scholarships for me"', a:'You may qualify for the National Need-Based Scholarship and 3 institution-specific merit awards. I can auto-fill your application using your saved academic profile.'},
    {q:'"Recommend courses for me"', a:'For a career in Data Science, I recommend: Python for Beginners → Statistics Foundations → Machine Learning Essentials, all available through verified CareerZ instructors.'},
    {q:'"Give me career advice"', a:'Given your strengths in design and communication, UX Research and Digital Marketing are strong-fit paths. Want a 6-month skill roadmap?'},
    {q:'"Help me with admission guidance"', a:"Your target university's deadline is in 21 days. Required documents: academic transcript, national ID, 2 photos. I can track your application status automatically."}
  ];
}
let consolePrompts = getConsolePrompts();
const consoleQ = document.getElementById('console-q');
const consoleA = document.getElementById('console-a');
function typeConsole(idx){
  const item = consolePrompts[idx];
  consoleQ.textContent = 'Ask CareerZ AI: ' + item.q;
  consoleA.innerHTML = '';
  let i = 0;
  const speed = 14;
  function type(){
    if(i <= item.a.length){
      consoleA.innerHTML = item.a.slice(0,i) + '<span class="caret"></span>';
      i++;
      setTimeout(type, speed);
    }
  }
  type();
}
document.querySelectorAll('.console-prompts button[data-prompt]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.console-prompts button[data-prompt]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    typeConsole(parseInt(btn.dataset.prompt,10));
  });
});
typeConsole(0);

/* AI LIVE DEMO (separate section) */
document.querySelectorAll('.console-prompts button[data-demo]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.console-prompts button[data-demo]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const idx = parseInt(btn.dataset.demo,10);
    const item = consolePrompts[idx];
    document.getElementById('demo-q').textContent = 'You asked: ' + item.q;
    const a = document.getElementById('demo-a');
    a.innerHTML = '';
    let i=0;
    function type(){ if(i<=item.a.length){ a.innerHTML = item.a.slice(0,i)+'<span class="caret"></span>'; i++; setTimeout(type,12); } }
    type();
  });
});

/* =========================================================
   SEARCH TABS
========================================================= */
document.querySelectorAll('.search-tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.search-tabs button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* =========================================================
   DATA-DRIVEN SECTION RENDERERS
========================================================= */
const colorPairs = ['#0E4D3C','#1B8A63','#E3A23C','#C75C4D','#0A3A2D','#22A876'];
function pickColor(i){ return colorPairs[i % colorPairs.length]; }
function initials(name){ return name.split(' ').map(w=>w[0]).slice(0,2).join(''); }

// Institutions
const institutions = [
  {name:'FAST-NU Lahore', type:'University · Lahore', tags:['Verified','CS Top Ranked']},
  {name:'Beaconhouse School System', type:'School Network · Multi-city', tags:['Verified','O/A Levels']},
  {name:'Khalifa University', type:'University · Abu Dhabi', tags:['Verified','Engineering']},
  {name:'COMSATS Islamabad', type:'University · Islamabad', tags:['Verified','Engineering']},
  {name:'The City School', type:'School Network · Karachi', tags:['Verified','Matric']},
  {name:'NUST', type:'University · Islamabad', tags:['Verified','Top Ranked']},
  {name:'Aptech Learning', type:'Academy · Multi-city', tags:['Verified','IT Skills']},
  {name:'LUMS', type:'University · Lahore', tags:['Verified','Business']}
];
document.getElementById('institutions-grid').innerHTML = institutions.map((it,i)=>`
  <div class="card inst-card reveal">
    <div class="logo-circle" style="color:${pickColor(i)}">${initials(it.name)}</div>
    <h4>${it.name}</h4>
    <div class="meta">${it.type}</div>
    <div class="tag-row">${it.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
  </div>`).join('');

// AI Features
const aiFeatures = [
  {ic:'🎯', t:'AI Admission Matching', d:'Matches students to institutions based on grades, budget and goals.'},
  {ic:'📊', t:'Smart Analytics', d:'Institutions get real-time dashboards on enrollment and performance.'},
  {ic:'🗣️', t:'AI Career Counseling', d:"Personalized guidance for every student's career path."},
  {ic:'🛡️', t:'Risk Detection', d:'Flags at-risk students early so teachers can intervene sooner.'}
];
document.getElementById('ai-features-grid').innerHTML = aiFeatures.map(f=>`
  <div class="card feature-card reveal"><div class="ic">${f.ic}</div><h4>${f.t}</h4><p>${f.d}</p></div>`).join('');

// Portals
const portals = [
  {role:'Student', items:[['🎓','Apply to institutions'],['🤖','AI Tutor & study planner'],['💼','Browse jobs & internships']]},
  {role:'Parent', items:[['📈','Track child progress'],['📋','Performance reports'],['💬','Direct teacher messaging']]},
  {role:'Teacher', items:[['📝','AI lesson & quiz generator'],['🏫','Classroom management'],['📊','Student insights']]},
  {role:'Institution', items:[['🏢','Admissions management'],['💰','Fee & finance tools'],['📉','Academic analytics']]},
  {role:'Employer', items:[['📨','Post jobs & internships'],['🔎','Search verified graduates'],['📁','Manage applicants']]},
  {role:'Agent', items:[['🤝','Track referrals'],['💵','Commission dashboard'],['📤','Withdraw earnings']]},
  {role:'Donor', items:[['🎁','Sponsor students directly'],['🏆','Fund scholarship pools'],['📊','Impact tracking']]}
];
document.getElementById('portal-tabs').innerHTML = portals.map((p,i)=>`<button class="${i===0?'active':''}" data-portal="${i}">${p.role}</button>`).join('');
document.getElementById('portal-panels').innerHTML = portals.map((p,i)=>`
  <div class="portal-panel grid g3 ${i===0?'active':''}" data-panel="${i}">
    ${p.items.map(it=>`<div class="card feature-card reveal"><div class="ic">${it[0]}</div><h4>${it[1]}</h4></div>`).join('')}
  </div>`).join('');
document.getElementById('portal-tabs').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  document.querySelectorAll('#portal-tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.portal-panel').forEach(p=>p.classList.remove('active'));
  document.querySelector(`.portal-panel[data-panel="${btn.dataset.portal}"]`).classList.add('active');
  observeReveals();
});

// Institution Modules
const modules = [
  {ic:'📝',t:'Admissions',d:'Online applications, document verification and merit lists.'},
  {ic:'💳',t:'Fee Management',d:'Automated invoicing, online payments and reminders.'},
  {ic:'🗓️',t:'Attendance',d:'Biometric and manual attendance tracking for staff and students.'},
  {ic:'📑',t:'Examinations',d:'Online and offline exam scheduling, grading and report cards.'}
];
document.getElementById('modules-grid').innerHTML = modules.map(m=>`
  <div class="card feature-card reveal"><div class="ic">${m.ic}</div><h4>${m.t}</h4><p>${m.d}</p></div>`).join('');

// Courses
const courses = [
  {t:'Programming', sub:'Web & App Development', students:'24,000+'},
  {t:'AI & Machine Learning', sub:'Beginner to Advanced', students:'18,500+'},
  {t:'Graphic Design', sub:'Adobe & Figma Mastery', students:'12,300+'},
  {t:'English Language', sub:'Spoken & Written', students:'31,000+'},
  {t:'IELTS Preparation', sub:'Band 7+ Track', students:'27,800+'},
  {t:'Business Studies', sub:'Management & Finance', students:'9,400+'},
  {t:'Engineering Foundations', sub:'Entry Test Prep', students:'15,600+'},
  {t:'Medical Entry Prep', sub:'MDCAT Focused', students:'21,200+'}
];
document.getElementById('courses-grid').innerHTML = courses.map((c,i)=>`
  <div class="card course-card reveal">
    <div class="thumb" style="background:${pickColor(i)}">🎓</div>
    <div class="body">
      <h4>${c.t}</h4>
      <div class="meta-sub" style="font-size:13px; color:var(--ink-soft);">${c.sub}</div>
      <div class="meta"><span>${c.students} enrolled</span><span>⭐ 4.${7+(i%3)}</span></div>
    </div>
  </div>`).join('');

// Teachers
function peopleCards(containerId, list){
  document.getElementById(containerId).innerHTML = list.map((p,i)=>`
    <div class="card people-card reveal">
      <div class="avatar" style="background:${pickColor(i)}">${initials(p.name)}</div>
      <h4>${p.name}</h4>
      <div class="role">${p.role}</div>
      <div class="stat-row">
        <div><strong>${p.exp}</strong>Experience</div>
        <div><strong>${p.rating}</strong>Rating</div>
        <div><strong>${p.taught}</strong>Taught</div>
      </div>
    </div>`).join('');
}
peopleCards('teachers-grid', [
  {name:'Ahmed Raza', role:'Mathematics', exp:'12 yrs', rating:'4.9★', taught:'3,200'},
  {name:'Sana Iqbal', role:'English Literature', exp:'9 yrs', rating:'4.8★', taught:'2,750'},
  {name:'Bilal Tariq', role:'Physics', exp:'15 yrs', rating:'4.9★', taught:'4,100'},
  {name:'Hira Shaikh', role:'Computer Science', exp:'7 yrs', rating:'4.7★', taught:'1,900'}
]);
peopleCards('trainers-grid', [
  {name:'Omar Farooq', role:'Soft Skills Trainer', exp:'10 yrs', rating:'4.8★', taught:'2,300'},
  {name:'Mariam Yousuf', role:'IELTS Trainer', exp:'8 yrs', rating:'4.9★', taught:'5,600'},
  {name:'Faisal Mahmood', role:'IT Skills Trainer', exp:'11 yrs', rating:'4.8★', taught:'3,400'},
  {name:'Zainab Ali', role:'Business Trainer', exp:'6 yrs', rating:'4.7★', taught:'1,500'}
]);

// Academies
const academies = [
  {name:'KIPS Academy', type:'Entry Test Prep · Lahore'},
  {name:'Star Academy', type:'O/A Levels · Karachi'},
  {name:'Ilmkidunya Coaching', type:'Board Exams · Multi-city'},
  {name:'British Council Partner Academy', type:'IELTS & TOEFL · Islamabad'}
];
document.getElementById('academies-grid').innerHTML = academies.map((a,i)=>`
  <div class="card inst-card reveal">
    <div class="logo-circle" style="color:${pickColor(i)}">${initials(a.name)}</div>
    <h4>${a.name}</h4><div class="meta">${a.type}</div>
  </div>`).join('');

// Jobs
const jobs = [
  {role:'Junior Frontend Developer', org:'Systems Limited · Lahore', payMin:80000, payMax:120000, unit:'/mo', tags:['Full-time','On-site']},
  {role:'Marketing Intern', org:'Coca-Cola · Dubai', payMin:30000, payMax:null, unit:'/mo', tags:['Internship','Hybrid']},
  {role:'Academic Coordinator', org:'Beaconhouse · Islamabad', payMin:60000, payMax:90000, unit:'/mo', tags:['Full-time','On-site']},
  {role:'Data Analyst', org:'NayaTel · Lahore', payMin:100000, payMax:140000, unit:'/mo', tags:['Full-time','Remote']},
  {role:'Content Writer', org:'Daraz · Karachi', payMin:50000, payMax:null, unit:'/mo', tags:['Contract','Remote']},
  {role:'School Admin Officer', org:'The City School · London', payMin:45000, payMax:null, unit:'/mo', tags:['Full-time','On-site']}
];
function renderJobs(){
  document.getElementById('jobs-grid').innerHTML = jobs.map(j=>`
  <div class="card job-card reveal">
    <div class="top"><div><h4>${j.role}</h4><div class="org">${j.org}</div></div></div>
    <div class="pay">${j.payMax ? moneyRange(j.payMin, j.payMax, j.unit) : money(j.payMin) + j.unit}</div>
    <div class="tag-row">${j.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
  </div>`).join('');
  document.querySelectorAll('#jobs-grid .reveal').forEach(el=>revealObserver.observe(el));
}
renderJobs();

// Employers
const employers = ['Systems Limited','Coca-Cola','Daraz.pk','NayaTel','Jazz','Engro Corporation','Bank Alfalah','Netsol Technologies'];
document.getElementById('employers-grid').innerHTML = employers.map((e,i)=>`
  <div class="card inst-card reveal"><div class="logo-circle" style="color:${pickColor(i)}">${initials(e)}</div><h4>${e}</h4><div class="meta">Hiring on CareerZ</div></div>`).join('');

// Scholarships
const scholarships = [
  {name:'National Need-Based Scholarship', amountBase:200000, unit:'/year', deadline:'Closes in 18 days'},
  {name:'CareerZ Merit Award', amountBase:100000, unit:'', deadline:'Closes in 32 days'},
  {name:'Punjab Group Talent Scholarship', amountBase:null, unit:'', deadline:'Closes in 9 days', flatText:'Full tuition waiver'}
];
function renderScholarships(){
  document.getElementById('scholarships-grid').innerHTML = scholarships.map(s=>`
  <div class="card feature-card reveal"><div class="ic">🎓</div><h4>${s.name}</h4><p>${s.flatText ? s.flatText : 'Up to ' + money(s.amountBase) + s.unit}</p><p style="color:var(--gold); font-weight:600; margin-top:8px;">${s.deadline}</p></div>`).join('');
  document.querySelectorAll('#scholarships-grid .reveal').forEach(el=>revealObserver.observe(el));
}
renderScholarships();

// Marketplace preview
const marketItems = [
  {ic:'📚', t:'Used Textbooks Bundle', priceBase:1500},
  {ic:'📝', t:'MDCAT Complete Notes', priceBase:800},
  {ic:'🗂️', t:'5 Years Past Papers', priceBase:600},
  {ic:'📐', t:'CS Assignment Templates', priceBase:400},
  {ic:'💡', t:'Final Year Project Kit', priceBase:2200},
  {ic:'🎨', t:'Presentation Template Pack', priceBase:350},
  {ic:'🎬', t:'Recorded Course: Excel Mastery', priceBase:1200},
  {ic:'🧰', t:'Study Planner Tool', priceBase:250}
];
function renderMarket(){
  document.getElementById('market-grid').innerHTML = marketItems.map((m,i)=>`
  <div class="card market-card reveal">
    <div class="thumb" style="background:${pickColor(i)}1A;">${m.ic}</div>
    <div class="body"><h5>${m.t}</h5><div class="price">${money(m.priceBase)}</div></div>
  </div>`).join('');
  document.querySelectorAll('#market-grid .reveal').forEach(el=>revealObserver.observe(el));
}
renderMarket();

// Sellers
const sellers = [
  {ic:'🎓',t:'Student Seller', items:['Sell notes & past papers','Sell study guides','Build your seller profile']},
  {ic:'👩‍🏫',t:'Teacher Seller', items:['Sell your own courses','License lesson plans','Earn recurring royalties']},
  {ic:'🏫',t:'Institution Seller', items:['Sell prospectuses & kits','Offer official study material','Bulk licensing to students']}
];
document.getElementById('seller-grid').innerHTML = sellers.map(s=>`
  <div class="card seller-card reveal">
    <div class="ic">${s.ic}</div><h4>${s.t}</h4>
    <ul>${s.items.map(it=>`<li>${it}</li>`).join('')}</ul>
    <button class="btn btn-primary" style="width:100%;">Start Selling</button>
  </div>`).join('');

// Success stories
const stories = [
  {name:'Areeba Noor', tag:'Admission Success', quote:'CareerZ AI matched me with FAST-NU within minutes — I got admitted with a partial scholarship.'},
  {name:'Hamza Sheikh', tag:'Scholarship Success', quote:'I found and applied for a national scholarship directly through CareerZ. The tracking made everything stress-free.'},
  {name:'Komal Rauf', tag:'Job Success', quote:'After finishing my CareerZ-recommended course, I landed an internship that turned into a full-time role.'}
];
document.getElementById('story-track').innerHTML = stories.map((s,i)=>`
  <div class="story-slide">
    <div class="story-card">
      <div class="avatar-lg" style="background:${pickColor(i)}">${initials(s.name)}</div>
      <div>
        <span class="tag">${s.tag}</span>
        <blockquote style="margin-top:14px;">"${s.quote}"</blockquote>
        <div class="who">${s.name}</div>
      </div>
    </div>
  </div>`).join('');
document.getElementById('story-dots').innerHTML = stories.map((_,i)=>`<button class="${i===0?'active':''}" data-dot="${i}"></button>`).join('');
let storyIdx = 0;
function showStory(i){
  storyIdx = i;
  document.getElementById('story-track').style.transform = `translateX(-${i*100}%)`;
  document.querySelectorAll('#story-dots button').forEach((b,bi)=>b.classList.toggle('active', bi===i));
}
document.getElementById('story-dots').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  showStory(parseInt(btn.dataset.dot,10));
});
setInterval(()=>{ showStory((storyIdx+1) % stories.length); }, 5000);

// Blog
const blogPosts = [
  {tag:'Admissions', t:'How to choose the right university abroad', date:'Jun 12, 2026'},
  {tag:'Scholarships', t:'5 scholarships every student should know about', date:'Jun 5, 2026'},
  {tag:'Careers', t:'In-demand careers for 2027 graduates', date:'May 28, 2026'},
  {tag:'Study Tips', t:'Using AI tools to study smarter, not harder', date:'May 19, 2026'}
];
document.getElementById('blog-grid').innerHTML = blogPosts.map((b,i)=>`
  <div class="card blog-card reveal">
    <div class="thumb" style="background:${pickColor(i)}"></div>
    <div class="body"><span class="tag">${b.tag}</span><h4>${b.t}</h4><div class="meta">${b.date} · 4 min read</div></div>
  </div>`).join('');

// Events
const events = [
  {day:'14',mon:'JUL',t:'Admissions Open — Fall 2026',meta:'Worldwide · All institutions'},
  {day:'22',mon:'JUL',t:'CareerZ Education Expo',meta:'Lahore Expo Center'},
  {day:'05',mon:'AUG',t:'AI in Education Seminar',meta:'Online · Free registration'},
  {day:'18',mon:'AUG',t:'IELTS Prep Workshop',meta:'Karachi · British Council Partner'}
];
document.getElementById('events-grid').innerHTML = events.map(e=>`
  <div class="card event-card reveal">
    <div class="event-date"><span class="day">${e.day}</span><span class="mon">${e.mon}</span></div>
    <div><h4>${e.t}</h4><div class="meta">${e.meta}</div></div>
  </div>`).join('');

// AI Ecosystem tabs
const aiEco = {
  'Teacher AI': ['AI Lesson Planner','AI Lecture Generator','AI Quiz Generator','AI Assignment Generator','AI Homework Generator','AI MCQ Generator','AI Exam Paper Generator','AI Presentation Generator','AI Classroom Assistant'],
  'Student AI': ['Ask AI Questions','AI Tutor','Personalized Learning','AI Study Planner','AI Practice Tests','AI Exam Preparation'],
  'Parent AI': ['Child Progress Insights','Performance Reports','Improvement Suggestions'],
  'Institution AI': ['Academic Analytics','Performance Dashboard','Teacher Insights','Student Risk Detection','Smart Reports']
};
const ecoKeys = Object.keys(aiEco);
document.getElementById('ai-eco-tabs').innerHTML = ecoKeys.map((k,i)=>`<button class="${i===0?'active':''}" data-eco="${i}">${k}</button>`).join('');
document.getElementById('ai-eco-panels').innerHTML = ecoKeys.map((k,i)=>`
  <div class="ai-eco-grid ${i===0?'active':''}" data-ecopanel="${i}">
    ${aiEco[k].map(item=>`<div class="ai-chip">${item}</div>`).join('')}
  </div>`).join('');
document.getElementById('ai-eco-tabs').addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  document.querySelectorAll('#ai-eco-tabs button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ai-eco-grid').forEach(p=>p.classList.remove('active'));
  document.querySelector(`.ai-eco-grid[data-ecopanel="${btn.dataset.eco}"]`).classList.add('active');
});

// Why choose us
const whyItems = [
  {ic:'🤖',t:'AI Guidance',d:'Every decision supported by intelligent recommendations.'},
  {ic:'✅',t:'Verified Network',d:'Every institution and employer is manually verified.'},
  {ic:'🌍',t:'Global Reach',d:'Active across 62+ cities worldwide, designed for the global education ecosystem.'},
  {ic:'🔗',t:'One Ecosystem',d:'Admissions, jobs, scholarships and marketplace — unified.'}
];
document.getElementById('why-grid').innerHTML = whyItems.map(w=>`
  <div class="card feature-card reveal"><div class="ic">${w.ic}</div><h4>${w.t}</h4><p>${w.d}</p></div>`).join('');

// Partner logos
const partnerLogos = ['FAST-NU','Beaconhouse','COMSATS','NUST','LUMS','Systems Ltd','Daraz','Jazz','KIPS Academy','The City School','Punjab Group','NetSol'];
const doubledLogos = [...partnerLogos, ...partnerLogos];
document.getElementById('logo-track').innerHTML = doubledLogos.map(l=>`<span class="lg">${l}</span>`).join('');

// FAQ
const faqs = [
  {q:'Is CareerZ.pk free for students?', a:'Yes, core features like searching institutions, applying for admissions and using the AI assistant are free for students.'},
  {q:'How are institutions verified?', a:'Every institution submits documentation that is manually reviewed by the CareerZ team before being listed.'},
  {q:'Where can I buy or sell educational products?', a:'The marketplace preview shows what is available — the full buying and selling experience is powered by Sovaad.com.'},
  {q:'How does the Education Agent Program work?', a:'Agents help students find suitable institutions and earn a commission for every successful, verified admission.'},
  {q:'Can institutions manage admissions on CareerZ?', a:'Yes, institutions get a full admissions, fee, attendance and exam management suite.'}
];
document.getElementById('faq-list').innerHTML = faqs.map(f=>`
  <div class="faq-item reveal">
    <div class="faq-q"><span>${f.q}</span><span class="plus">+</span></div>
    <div class="faq-a"><p>${f.a}</p></div>
  </div>`).join('');
document.querySelectorAll('.faq-item').forEach(item=>{
  item.querySelector('.faq-q').addEventListener('click', ()=>{
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>{ i.classList.remove('open'); i.querySelector('.faq-a').style.maxHeight = null; });
    if(!wasOpen){
      item.classList.add('open');
      const a = item.querySelector('.faq-a');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

/* =========================================================
   FLOATING LIVE NOTIFICATIONS (toast)
========================================================= */
const toastMessages = [
  {dot:true, html:'<strong>Ahmed S.</strong> just got admitted to NUST'},
  {dot:true, html:'<strong>Scholarship</strong> awarded to a student in Multan'},
  {dot:true, html:'<strong>New job</strong> posted by Engro Corporation'},
  {dot:true, html:'<strong>Sara T.</strong> enrolled in IELTS Prep course'}
];
let toastIdx = 0;
function showToast(){
  const stack = document.getElementById('toast-stack');
  const msg = toastMessages[toastIdx % toastMessages.length];
  toastIdx++;
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span class="dot"></span><span>${msg.html}</span>`;
  stack.appendChild(el);
  requestAnimationFrame(()=> el.classList.add('show'));
  setTimeout(()=>{
    el.classList.remove('show');
    setTimeout(()=> el.remove(), 400);
  }, 4200);
}
setInterval(showToast, 7000);
setTimeout(showToast, 1800);

/* =========================================================
   CURRENCY REFRESH — re-render all price-bearing sections
========================================================= */
function refreshCurrencyDisplays(){
  renderTicker();
  renderJobs();
  renderScholarships();
  renderMarket();
  consolePrompts = getConsolePrompts();
  const activeBtn = document.querySelector('.console-prompts button[data-prompt].active');
  typeConsole(activeBtn ? parseInt(activeBtn.dataset.prompt,10) : 0);
  observeReveals();
}

/* =========================================================
   INIT
========================================================= */
observeReveals();
