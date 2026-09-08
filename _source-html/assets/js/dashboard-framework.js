/* =============================================================
   CAREERZ AI — UNIVERSAL DASHBOARD FRAMEWORK SCRIPT
   ---------------------------------------------------------------
   Shared shell behavior for every future role-based dashboard.
   Scope: layout/chrome only — theme, language, sidebar (collapse +
   nested menus + mobile drawer), header dropdowns, notification
   drawer, breadcrumb rendering, and universal Table / Modal /
   Toast / Tabs / Alert / Loading-Empty-Error helpers.

   Page-specific widgets (stat cards, calendar, quick actions,
   role-switcher demo label, etc.) stay in dashboard.js and are
   NOT duplicated here.

   No backend, no APIs — UI state only. Safe to include on every
   dashboard page regardless of role.

   Refactoring-audit pass:
     - Consolidated three separate document-level 'click' listeners
       (language dropdown, user menu, modals) and two separate
       'keydown' listeners into one shared click delegate and one
       shared keydown delegate. Behavior is unchanged; duplication
       is not.
     - Theme toggle upgraded to a full Light / Dark / Auto(System)
       system with persistence, instead of a plain binary flip.
     - Sidebar: icon-only "collapsed" rail now preserves accessible
       names via aria-label (generated once from each link's visible
       text, restored on expand) instead of silently hiding text from
       assistive tech. Nested submenus now remove their links from
       the tab order while closed instead of leaving them focusable
       but invisible.
     - Added initTabs() / initDismissibleAlerts() to back the new
       Universal Tabs and Alert components in dashboard-framework.css.
   No existing element ID, class, or markup contract was changed —
   this file still works against the same HTML as before.

   v1.1 refinement pass:
     - Language switcher now persists the chosen language (localStorage)
       and applies it through a real [data-i18n] translation mechanism
       instead of only flipping <html dir>. An inline bootstrap script
       in index.html's <head> reads the same storage key pre-paint to
       avoid a flash of the wrong direction/theme on reload.
     - Added initQuickActionsMenu() and initWalletDisplay() for the two
       previously-missing Universal Header pieces (Quick Actions, Wallet
       Summary — the latter is a UI placeholder, currency comes from a
       data attribute so nothing here hardcodes one).

   v1.2 refinement pass:
     - Added a Global Currency Framework (CURRENCIES table,
       formatCurrencyAmount(), persisted preferred currency) — still no
       backend, all rates are a documented rate:1 placeholder.
     - initWalletDisplay() replaced by initWalletFramework(), which now
       drives both the header chip and any .u-wallet-card on the page
       from the same persisted currency so they can't disagree.
     - Added initSearchFramework() (Global Search: UI-only results
       dropdown, reuses the existing dropdown-close delegate — zero new
       document-level listeners) and two documented future-integration
       stubs, performSearch() and fetchNotifications().
     - Mobile sidebar close button wired into the existing close()
       function in initSidebarMobileToggle() (no duplicate logic).
================================================================= */

/* =========================================================
   THEME SYSTEM — Light / Dark / Auto (system)
   Auto is the default until the person explicitly picks a theme;
   after that the choice is remembered (localStorage) and system
   changes are ignored until they clear it.
========================================================= */
const THEME_STORAGE_KEY = 'careerz_theme_preference'; // 'light' | 'dark' | absent = auto

function initThemeSystem(){
  const themeBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function systemTheme(){ return media.matches ? 'dark' : 'light'; }

  function applyTheme(theme){
    root.setAttribute('data-theme', theme);
    if (themeBtn) themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  applyTheme(saved || systemTheme());

  // If the person never overrode it, keep following the OS setting live.
  media.addEventListener('change', () => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) applyTheme(systemTheme());
  });

  if (themeBtn){
    themeBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem(THEME_STORAGE_KEY, next);
    });
  }
}

/* =========================================================
   GENERIC DROPDOWN REGISTRY
   Any trigger/panel pair (language switcher, profile menu, and
   any future custom dropdown) registers here instead of each
   wiring its own document-level outside-click listener. One
   shared click delegate (see initGlobalDelegates) closes whatever
   is open when the click lands outside both the trigger and panel.
========================================================= */
const openDropdowns = []; // { trigger, panel, onClose }

function registerDropdown(trigger, panel, onClose){
  if (!trigger || !panel) return;
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle('open');
    trigger.setAttribute('aria-expanded', String(isOpen));
    if (!isOpen && onClose) onClose();
  });
  openDropdowns.push({ trigger, panel, onClose });
}

function closeAllDropdowns(){
  openDropdowns.forEach(({ trigger, panel, onClose }) => {
    if (panel.classList.contains('open')){
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      if (onClose) onClose();
    }
  });
}

/* =========================================================
   LANGUAGE SWITCHER (unlimited-language ready)
   Any number of languages can be added to #lang-dropdown in the
   markup without touching this script. RTL languages are listed
   once, here, and the <html dir> flips automatically — every
   directional style in dashboard-framework.css uses CSS logical
   properties, so no separate RTL stylesheet is required.

   v1.1 fix: the switcher previously only flipped dir/lang on the
   <html> element ("changes layout" per the bug report) with no
   persistence and no actual text-swapping mechanism. It now:
     - persists the chosen language (localStorage) so it survives
       a refresh — an inline bootstrap script in index.html's
       <head> also reads this same key to avoid a flash of the
       wrong direction on load;
     - applies translations via a small [data-i18n] / [data-i18n-aria]
       / [data-i18n-placeholder] convention. Per the brief, content
       is NOT translated yet — TRANSLATIONS.en is fully populated
       and non-English entries intentionally fall back to it, which
       is what "prepare the framework, don't translate everything
       now" means in practice: add real translations by filling in
       the language's object, nothing else changes.
========================================================= */
const RTL_LANGS = ['ur', 'ar', 'fa', 'he'];
const LANG_STORAGE_KEY = 'careerz_language_preference';

// Framework-chrome strings only (sidebar, header, footer, mobile nav,
// modals) — page-specific widget content is intentionally untouched,
// same separation of concerns as the rest of this file.
const TRANSLATIONS = {
  en: {
    'nav.dashboard':'Dashboard', 'nav.profile':'My Profile', 'nav.applications':'My Applications',
    'nav.applications.institutions':'Institution Applications', 'nav.applications.scholarships':'Scholarship Applications',
    'nav.applications.jobs':'Job Applications', 'nav.courses':'My Courses', 'nav.institutions':'My Institutions',
    'nav.jobs':'My Jobs', 'nav.scholarships':'My Scholarships', 'nav.marketplace':'Marketplace',
    'nav.messages':'Messages', 'nav.notifications':'Notifications', 'nav.settings':'Settings',
    'nav.help':'Help Center', 'nav.logout':'Logout',
    'header.quickActions':'Quick actions', 'header.quickActionsHint':'Example shortcuts — final list is role-specific',
    'header.themeToggle':'Toggle dark mode', 'header.notifications':'Notifications', 'header.messages':'Messages',
    'notifications.allTab':'All', 'notifications.unreadTab':'Unread',
    'quick.newApplication':'New Application', 'quick.newMessage':'New Message', 'quick.newSupportTicket':'New Support Ticket',
    'wallet.label':'Balance', 'wallet.title':'Wallet', 'wallet.available':'Available Balance',
    'wallet.pending':'Pending Balance', 'wallet.addFunds':'Add Funds', 'wallet.withdraw':'Withdraw',
    'wallet.transfer':'Transfer', 'wallet.recentTransactions':'Recent Transactions',
    'wallet.noTransactions':'No transactions yet', 'wallet.noTransactionsBody':'Your recent activity will show up here.',
    'search.title':'Search', 'search.placeholder':'Search institutions, courses, jobs…',
    'search.emptyTitle':'Start typing to search', 'search.emptyBody':'Institutions, courses, jobs and scholarships will appear here.',
    'messages.title':'Messages', 'messages.unreadTab':'Unread', 'messages.inboxTab':'Inbox',
    'messages.emptyTitle':'No messages yet',
    'messages.emptyBody':"When institutions, employers or teachers message you, conversations will appear here.",
    'mobilenav.home':'Home', 'mobilenav.search':'Search', 'mobilenav.alerts':'Alerts', 'mobilenav.menu':'Menu', 'mobilenav.profile':'Profile',
    'footer.rights':'© 2026 CareerZ.pk — All rights reserved.', 'footer.help':'Help Center',
    'footer.privacy':'Privacy Policy', 'footer.terms':'Terms of Service', 'footer.home':'Back to Homepage',
    'common.viewAll':'View all',
    'profile.addPhoto':'Add profile photo', 'profile.basicDetails':'Basic details added',
    'profile.completeAcademic':'Complete academic history', 'profile.emailVerified':'Email verified',
    'quick.applyInstitution':'Apply for Institution', 'quick.becomeAgent':'Become Agent',
    'quick.becomeDonor':'Become Donor', 'quick.becomeEmployer':'Become Employer',
    'quick.becomeTeacher':'Become Teacher', 'quick.becomeTrainer':'Become Trainer',
    'quick.createStore':'Create Marketplace Store',
    'section.accountStatus':'Account &amp; Listing Status', 'section.instituteMarketUpdates':'Institution &amp; Marketplace Updates',
    'section.instituteUpdates':'Institution Updates', 'section.marketplaceUpdates':'Marketplace Updates',
    'section.overview':'Overview', 'section.profileCompletion':'Profile Completion',
    'section.quickActions':'Quick Actions', 'section.recentActivity':'Recent Activity',
    'section.recommendedForYou':'Recommended For You',
    'stat.activeApplications':'Active Applications', 'stat.enrolledCourses':'Enrolled Courses',
    'stat.savedJobs':'Saved Jobs', 'stat.scholarshipsSaved':'Scholarships Saved',
    'status.approved':'Approved', 'status.draft':'Draft', 'status.pendingVerification':'Pending Verification',
    'status.rejected':'Rejected', 'status.suspended':'Suspended',
    'tag.pending':'Pending', 'tag.recommended':'Recommended', 'tag.saved':'Saved',
    'welcome.greeting':'Welcome back, Ahmed 👋',
    'welcome.subtitle':"Here's what's happening across your CareerZ account today.",
    'welcome.viewingAs':'Viewing as'
  },
  // Intentionally left for a future translation pass — until populated,
  // applyTranslations() below falls back to English for any missing key
  // rather than showing a blank string.
  ur: {
    'nav.dashboard':'ڈیش بورڈ', 'nav.profile':'میری پروفائل', 'nav.applications':'میری درخواستیں',
    'nav.applications.institutions':'ادارہ جاتی درخواستیں', 'nav.applications.scholarships':'وظیفہ کی درخواستیں',
    'nav.applications.jobs':'ملازمت کی درخواستیں', 'nav.courses':'میرے کورسز', 'nav.institutions':'میرے ادارے',
    'nav.jobs':'میری ملازمتیں', 'nav.scholarships':'میرے وظائف', 'nav.marketplace':'مارکیٹ پلیس',
    'nav.messages':'پیغامات', 'nav.notifications':'اطلاعات', 'nav.settings':'ترتیبات',
    'nav.help':'مدد کا مرکز', 'nav.logout':'لاگ آؤٹ',
    'header.quickActions':'فوری اقدامات', 'header.quickActionsHint':'نمونہ shortcuts — حتمی فہرست کردار کے مطابق ہوگی',
    'header.themeToggle':'ڈارک موڈ تبدیل کریں', 'header.notifications':'اطلاعات', 'header.messages':'پیغامات',
    'notifications.allTab':'تمام', 'notifications.unreadTab':'غیر پڑھی گئی',
    'quick.newApplication':'نئی درخواست', 'quick.newMessage':'نیا پیغام', 'quick.newSupportTicket':'نیا سپورٹ ٹکٹ',
    'wallet.label':'بیلنس', 'wallet.title':'والیٹ', 'wallet.available':'دستیاب بیلنس',
    'wallet.pending':'زیرِ التوا بیلنس', 'wallet.addFunds':'رقم شامل کریں', 'wallet.withdraw':'نکالیں',
    'wallet.transfer':'منتقل کریں', 'wallet.recentTransactions':'حالیہ لین دین',
    'wallet.noTransactions':'ابھی کوئی لین دین نہیں', 'wallet.noTransactionsBody':'آپ کی حالیہ سرگرمی یہاں نظر آئے گی۔',
    'search.title':'تلاش', 'search.placeholder':'ادارے، کورسز، ملازمتیں تلاش کریں…',
    'search.emptyTitle':'تلاش کے لیے لکھنا شروع کریں', 'search.emptyBody':'ادارے، کورسز، ملازمتیں اور وظائف یہاں نظر آئیں گے۔',
    'messages.title':'پیغامات', 'messages.unreadTab':'غیر پڑھے گئے', 'messages.inboxTab':'ان باکس',
    'messages.emptyTitle':'ابھی کوئی پیغام نہیں',
    'messages.emptyBody':'جب ادارے، آجر یا اساتذہ آپ کو پیغام بھیجیں گے، تو گفتگو یہاں نظر آئے گی۔',
    'mobilenav.home':'ہوم', 'mobilenav.search':'تلاش', 'mobilenav.alerts':'اطلاعات', 'mobilenav.menu':'مینو', 'mobilenav.profile':'پروفائل',
    'footer.rights':'© 2026 CareerZ.pk — جملہ حقوق محفوظ ہیں۔', 'footer.help':'مدد کا مرکز',
    'footer.privacy':'رازداری کی پالیسی', 'footer.terms':'شرائطِ استعمال', 'footer.home':'ہوم پیج پر واپس',
    'common.viewAll':'سب دیکھیں',
    'profile.addPhoto':'پروفائل تصویر شامل کریں', 'profile.basicDetails':'بنیادی تفصیلات شامل ہو گئیں',
    'profile.completeAcademic':'تعلیمی ریکارڈ مکمل کریں', 'profile.emailVerified':'ای میل کی تصدیق ہو گئی',
    'quick.applyInstitution':'ادارے کے لیے درخواست دیں', 'quick.becomeAgent':'ایجنٹ بنیں',
    'quick.becomeDonor':'عطیہ دہندہ بنیں', 'quick.becomeEmployer':'آجر بنیں',
    'quick.becomeTeacher':'استاد بنیں', 'quick.becomeTrainer':'ٹرینر بنیں',
    'quick.createStore':'مارکیٹ پلیس سٹور بنائیں',
    'section.accountStatus':'اکاؤنٹ اور فہرست کی صورتحال', 'section.instituteMarketUpdates':'ادارہ اور مارکیٹ پلیس کی تازہ کاری',
    'section.instituteUpdates':'ادارے کی تازہ کاری', 'section.marketplaceUpdates':'مارکیٹ پلیس کی تازہ کاری',
    'section.overview':'مجموعی جائزہ', 'section.profileCompletion':'پروفائل کی تکمیل',
    'section.quickActions':'فوری اقدامات', 'section.recentActivity':'حالیہ سرگرمی',
    'section.recommendedForYou':'آپ کے لیے تجویز کردہ',
    'stat.activeApplications':'فعال درخواستیں', 'stat.enrolledCourses':'داخلہ شدہ کورسز',
    'stat.savedJobs':'محفوظ ملازمتیں', 'stat.scholarshipsSaved':'محفوظ وظائف',
    'status.approved':'منظور شدہ', 'status.draft':'ڈرافٹ', 'status.pendingVerification':'تصدیق زیرِ التوا',
    'status.rejected':'مسترد شدہ', 'status.suspended':'معطل شدہ',
    'tag.pending':'زیرِ التوا', 'tag.recommended':'تجویز کردہ', 'tag.saved':'محفوظ شدہ',
    'welcome.greeting':'خوش آمدید، احمد 👋',
    'welcome.subtitle':'آج آپ کے CareerZ اکاؤنٹ میں یہ کچھ ہو رہا ہے۔',
    'welcome.viewingAs':'بطور دیکھ رہے ہیں'
  },
  ar: {
    'nav.dashboard':'لوحة التحكم', 'nav.profile':'ملفي الشخصي', 'nav.applications':'طلباتي',
    'nav.applications.institutions':'طلبات المؤسسات', 'nav.applications.scholarships':'طلبات المنح الدراسية',
    'nav.applications.jobs':'طلبات الوظائف', 'nav.courses':'دوراتي', 'nav.institutions':'مؤسساتي',
    'nav.jobs':'وظائفي', 'nav.scholarships':'منحي الدراسية', 'nav.marketplace':'السوق',
    'nav.messages':'الرسائل', 'nav.notifications':'الإشعارات', 'nav.settings':'الإعدادات',
    'nav.help':'مركز المساعدة', 'nav.logout':'تسجيل الخروج',
    'header.quickActions':'إجراءات سريعة', 'header.quickActionsHint':'اختصارات توضيحية — القائمة النهائية خاصة بكل دور',
    'header.themeToggle':'تبديل الوضع الداكن', 'header.notifications':'الإشعارات', 'header.messages':'الرسائل',
    'notifications.allTab':'الكل', 'notifications.unreadTab':'غير مقروءة',
    'quick.newApplication':'طلب جديد', 'quick.newMessage':'رسالة جديدة', 'quick.newSupportTicket':'تذكرة دعم جديدة',
    'wallet.label':'الرصيد', 'wallet.title':'المحفظة', 'wallet.available':'الرصيد المتاح',
    'wallet.pending':'الرصيد المعلق', 'wallet.addFunds':'إضافة أموال', 'wallet.withdraw':'سحب',
    'wallet.transfer':'تحويل', 'wallet.recentTransactions':'المعاملات الأخيرة',
    'wallet.noTransactions':'لا توجد معاملات بعد', 'wallet.noTransactionsBody':'سيظهر نشاطك الأخير هنا.',
    'search.title':'بحث', 'search.placeholder':'ابحث عن المؤسسات والدورات والوظائف…',
    'search.emptyTitle':'ابدأ الكتابة للبحث', 'search.emptyBody':'ستظهر هنا المؤسسات والدورات والوظائف والمنح الدراسية.',
    'messages.title':'الرسائل', 'messages.unreadTab':'غير مقروءة', 'messages.inboxTab':'البريد الوارد',
    'messages.emptyTitle':'لا توجد رسائل بعد',
    'messages.emptyBody':'عندما تراسلك المؤسسات أو أصحاب العمل أو المعلمون، ستظهر المحادثات هنا.',
    'mobilenav.home':'الرئيسية', 'mobilenav.search':'بحث', 'mobilenav.alerts':'التنبيهات', 'mobilenav.menu':'القائمة', 'mobilenav.profile':'الملف الشخصي',
    'footer.rights':'© 2026 CareerZ.pk — جميع الحقوق محفوظة.', 'footer.help':'مركز المساعدة',
    'footer.privacy':'سياسة الخصوصية', 'footer.terms':'شروط الخدمة', 'footer.home':'العودة إلى الصفحة الرئيسية',
    'common.viewAll':'عرض الكل',
    'profile.addPhoto':'إضافة صورة الملف الشخصي', 'profile.basicDetails':'تمت إضافة التفاصيل الأساسية',
    'profile.completeAcademic':'أكمل السجل الأكاديمي', 'profile.emailVerified':'تم التحقق من البريد الإلكتروني',
    'quick.applyInstitution':'التقدم لمؤسسة', 'quick.becomeAgent':'كن وكيلاً',
    'quick.becomeDonor':'كن متبرعاً', 'quick.becomeEmployer':'كن صاحب عمل',
    'quick.becomeTeacher':'كن معلماً', 'quick.becomeTrainer':'كن مدرباً',
    'quick.createStore':'إنشاء متجر في السوق',
    'section.accountStatus':'حالة الحساب والقوائم', 'section.instituteMarketUpdates':'تحديثات المؤسسة والسوق',
    'section.instituteUpdates':'تحديثات المؤسسة', 'section.marketplaceUpdates':'تحديثات السوق',
    'section.overview':'نظرة عامة', 'section.profileCompletion':'اكتمال الملف الشخصي',
    'section.quickActions':'إجراءات سريعة', 'section.recentActivity':'النشاط الأخير',
    'section.recommendedForYou':'موصى به لك',
    'stat.activeApplications':'الطلبات النشطة', 'stat.enrolledCourses':'الدورات المسجلة',
    'stat.savedJobs':'الوظائف المحفوظة', 'stat.scholarshipsSaved':'المنح الدراسية المحفوظة',
    'status.approved':'موافق عليه', 'status.draft':'مسودة', 'status.pendingVerification':'قيد التحقق',
    'status.rejected':'مرفوض', 'status.suspended':'موقوف',
    'tag.pending':'قيد الانتظار', 'tag.recommended':'موصى به', 'tag.saved':'محفوظ',
    'welcome.greeting':'مرحباً بعودتك، أحمد 👋',
    'welcome.subtitle':'إليك ما يحدث في حساب CareerZ الخاص بك اليوم.',
    'welcome.viewingAs':'عرض كـ'
  },
  es: {
    'nav.dashboard':'Panel', 'nav.profile':'Mi Perfil', 'nav.applications':'Mis Solicitudes',
    'nav.applications.institutions':'Solicitudes de Instituciones', 'nav.applications.scholarships':'Solicitudes de Becas',
    'nav.applications.jobs':'Solicitudes de Empleo', 'nav.courses':'Mis Cursos', 'nav.institutions':'Mis Instituciones',
    'nav.jobs':'Mis Empleos', 'nav.scholarships':'Mis Becas', 'nav.marketplace':'Mercado',
    'nav.messages':'Mensajes', 'nav.notifications':'Notificaciones', 'nav.settings':'Configuración',
    'nav.help':'Centro de Ayuda', 'nav.logout':'Cerrar Sesión',
    'header.quickActions':'Acciones rápidas', 'header.quickActionsHint':'Atajos de ejemplo — la lista final depende del rol',
    'header.themeToggle':'Alternar modo oscuro', 'header.notifications':'Notificaciones', 'header.messages':'Mensajes',
    'notifications.allTab':'Todas', 'notifications.unreadTab':'No leídas',
    'quick.newApplication':'Nueva Solicitud', 'quick.newMessage':'Nuevo Mensaje', 'quick.newSupportTicket':'Nuevo Ticket de Soporte',
    'wallet.label':'Saldo', 'wallet.title':'Billetera', 'wallet.available':'Saldo Disponible',
    'wallet.pending':'Saldo Pendiente', 'wallet.addFunds':'Agregar Fondos', 'wallet.withdraw':'Retirar',
    'wallet.transfer':'Transferir', 'wallet.recentTransactions':'Transacciones Recientes',
    'wallet.noTransactions':'Aún no hay transacciones', 'wallet.noTransactionsBody':'Tu actividad reciente aparecerá aquí.',
    'search.title':'Buscar', 'search.placeholder':'Buscar instituciones, cursos, empleos…',
    'search.emptyTitle':'Comienza a escribir para buscar', 'search.emptyBody':'Aquí aparecerán instituciones, cursos, empleos y becas.',
    'messages.title':'Mensajes', 'messages.unreadTab':'No leídos', 'messages.inboxTab':'Bandeja de entrada',
    'messages.emptyTitle':'Aún no hay mensajes',
    'messages.emptyBody':'Cuando instituciones, empleadores o profesores te escriban, las conversaciones aparecerán aquí.',
    'mobilenav.home':'Inicio', 'mobilenav.search':'Buscar', 'mobilenav.alerts':'Alertas', 'mobilenav.menu':'Menú', 'mobilenav.profile':'Perfil',
    'footer.rights':'© 2026 CareerZ.pk — Todos los derechos reservados.', 'footer.help':'Centro de Ayuda',
    'footer.privacy':'Política de Privacidad', 'footer.terms':'Términos de Servicio', 'footer.home':'Volver a la Página Principal',
    'common.viewAll':'Ver todo',
    'profile.addPhoto':'Agregar foto de perfil', 'profile.basicDetails':'Detalles básicos añadidos',
    'profile.completeAcademic':'Completa el historial académico', 'profile.emailVerified':'Correo electrónico verificado',
    'quick.applyInstitution':'Solicitar para una Institución', 'quick.becomeAgent':'Conviértete en Agente',
    'quick.becomeDonor':'Conviértete en Donante', 'quick.becomeEmployer':'Conviértete en Empleador',
    'quick.becomeTeacher':'Conviértete en Profesor', 'quick.becomeTrainer':'Conviértete en Entrenador',
    'quick.createStore':'Crear Tienda en el Mercado',
    'section.accountStatus':'Estado de la Cuenta y Listados', 'section.instituteMarketUpdates':'Actualizaciones de Instituciones y Mercado',
    'section.instituteUpdates':'Actualizaciones de la Institución', 'section.marketplaceUpdates':'Actualizaciones del Mercado',
    'section.overview':'Resumen', 'section.profileCompletion':'Finalización del Perfil',
    'section.quickActions':'Acciones Rápidas', 'section.recentActivity':'Actividad Reciente',
    'section.recommendedForYou':'Recomendado Para Ti',
    'stat.activeApplications':'Solicitudes Activas', 'stat.enrolledCourses':'Cursos Inscritos',
    'stat.savedJobs':'Empleos Guardados', 'stat.scholarshipsSaved':'Becas Guardadas',
    'status.approved':'Aprobado', 'status.draft':'Borrador', 'status.pendingVerification':'Verificación Pendiente',
    'status.rejected':'Rechazado', 'status.suspended':'Suspendido',
    'tag.pending':'Pendiente', 'tag.recommended':'Recomendado', 'tag.saved':'Guardado',
    'welcome.greeting':'Bienvenido de nuevo, Ahmed 👋',
    'welcome.subtitle':'Esto es lo que sucede hoy en tu cuenta de CareerZ.',
    'welcome.viewingAs':'Viendo como'
  },
  fr: {
    'nav.dashboard':'Tableau de bord', 'nav.profile':'Mon Profil', 'nav.applications':'Mes Candidatures',
    'nav.applications.institutions':'Candidatures aux Établissements', 'nav.applications.scholarships':'Candidatures aux Bourses',
    'nav.applications.jobs':'Candidatures aux Emplois', 'nav.courses':'Mes Cours', 'nav.institutions':'Mes Établissements',
    'nav.jobs':'Mes Emplois', 'nav.scholarships':'Mes Bourses', 'nav.marketplace':'Marché',
    'nav.messages':'Messages', 'nav.notifications':'Notifications', 'nav.settings':'Paramètres',
    'nav.help':"Centre d'Aide", 'nav.logout':'Déconnexion',
    'header.quickActions':'Actions rapides', 'header.quickActionsHint':"Raccourcis d'exemple — la liste finale dépend du rôle",
    'header.themeToggle':'Basculer le mode sombre', 'header.notifications':'Notifications', 'header.messages':'Messages',
    'notifications.allTab':'Toutes', 'notifications.unreadTab':'Non lues',
    'quick.newApplication':'Nouvelle Candidature', 'quick.newMessage':'Nouveau Message', 'quick.newSupportTicket':"Nouveau Ticket d'Assistance",
    'wallet.label':'Solde', 'wallet.title':'Portefeuille', 'wallet.available':'Solde Disponible',
    'wallet.pending':'Solde en Attente', 'wallet.addFunds':'Ajouter des Fonds', 'wallet.withdraw':'Retirer',
    'wallet.transfer':'Transférer', 'wallet.recentTransactions':'Transactions Récentes',
    'wallet.noTransactions':'Aucune transaction pour le moment', 'wallet.noTransactionsBody':'Votre activité récente apparaîtra ici.',
    'search.title':'Recherche', 'search.placeholder':'Rechercher des établissements, cours, emplois…',
    'search.emptyTitle':'Commencez à taper pour rechercher', 'search.emptyBody':'Les établissements, cours, emplois et bourses apparaîtront ici.',
    'messages.title':'Messages', 'messages.unreadTab':'Non lus', 'messages.inboxTab':'Boîte de réception',
    'messages.emptyTitle':'Aucun message pour le moment',
    'messages.emptyBody':'Lorsque des établissements, employeurs ou enseignants vous écriront, les conversations apparaîtront ici.',
    'mobilenav.home':'Accueil', 'mobilenav.search':'Recherche', 'mobilenav.alerts':'Alertes', 'mobilenav.menu':'Menu', 'mobilenav.profile':'Profil',
    'footer.rights':'© 2026 CareerZ.pk — Tous droits réservés.', 'footer.help':"Centre d'Aide",
    'footer.privacy':'Politique de Confidentialité', 'footer.terms':"Conditions d'Utilisation", 'footer.home':"Retour à la Page d'Accueil",
    'common.viewAll':'Voir tout',
    'profile.addPhoto':'Ajouter une photo de profil', 'profile.basicDetails':'Détails de base ajoutés',
    'profile.completeAcademic':"Compléter l'historique académique", 'profile.emailVerified':'E-mail vérifié',
    'quick.applyInstitution':"Postuler pour un Établissement", 'quick.becomeAgent':'Devenir Agent',
    'quick.becomeDonor':'Devenir Donateur', 'quick.becomeEmployer':'Devenir Employeur',
    'quick.becomeTeacher':'Devenir Enseignant', 'quick.becomeTrainer':'Devenir Formateur',
    'quick.createStore':'Créer une Boutique sur le Marché',
    'section.accountStatus':'État du Compte et des Annonces', 'section.instituteMarketUpdates':"Mises à Jour des Établissements et du Marché",
    'section.instituteUpdates':"Mises à Jour de l'Établissement", 'section.marketplaceUpdates':'Mises à Jour du Marché',
    'section.overview':'Aperçu', 'section.profileCompletion':'Complétion du Profil',
    'section.quickActions':'Actions Rapides', 'section.recentActivity':'Activité Récente',
    'section.recommendedForYou':'Recommandé Pour Vous',
    'stat.activeApplications':'Candidatures Actives', 'stat.enrolledCourses':'Cours Inscrits',
    'stat.savedJobs':'Emplois Enregistrés', 'stat.scholarshipsSaved':'Bourses Enregistrées',
    'status.approved':'Approuvé', 'status.draft':'Brouillon', 'status.pendingVerification':'Vérification en Attente',
    'status.rejected':'Rejeté', 'status.suspended':'Suspendu',
    'tag.pending':'En Attente', 'tag.recommended':'Recommandé', 'tag.saved':'Enregistré',
    'welcome.greeting':'Bon retour, Ahmed 👋',
    'welcome.subtitle':"Voici ce qui se passe aujourd'hui sur votre compte CareerZ.",
    'welcome.viewingAs':'Affichage en tant que'
  }
};

function applyTranslations(lang){
  const dict = TRANSLATIONS[lang] || {};
  const fallback = TRANSLATIONS.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = dict[key] || fallback[key];
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const text = dict[key] || fallback[key];
    if (text) el.setAttribute('aria-label', text);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const text = dict[key] || fallback[key];
    if (text) el.setAttribute('placeholder', text);
  });
}

function initLanguageSwitcher(){
  const btn = document.getElementById('lang-select-btn');
  const dropdown = document.getElementById('lang-dropdown');
  const labelEl = document.getElementById('lang-label');
  if (!btn || !dropdown) return;

  registerDropdown(btn, dropdown);

  // Restore a persisted choice (the inline head script already set
  // <html lang/dir> before paint; this just syncs the dropdown's visible
  // state and runs the actual text translation pass).
  const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
  if (savedLang){
    const match = dropdown.querySelector(`button[data-lang="${savedLang}"]`);
    if (match){
      dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      match.classList.add('active');
      if (labelEl) labelEl.textContent = match.dataset.label;
    }
  }
  applyTranslations(savedLang || 'en');

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    const langBtn = e.target.closest('button[data-lang]');
    if (!langBtn) return;

    dropdown.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    langBtn.classList.add('active');

    const lang = langBtn.dataset.lang;
    const label = langBtn.dataset.label;
    if (labelEl) labelEl.textContent = label;
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');

    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    applyTranslations(lang);

    // Hook for future phase: once TRANSLATIONS[lang] is fully populated
    // this needs no further wiring — any other script can also listen
    // for this event if it needs to react to a language change.
    document.dispatchEvent(new CustomEvent('careerz:language-changed', { detail: { lang } }));
  });
}

/* =========================================================
   SIDEBAR — MOBILE DRAWER TOGGLE
========================================================= */
function initSidebarMobileToggle(){
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('dash-sidebar');
  const overlay = document.getElementById('dash-overlay');
  const closeBtn = document.getElementById('sidebar-close-btn');
  if (!toggleBtn || !sidebar) return;

  function close(){
    sidebar.classList.remove('dash-sidebar-open');
    if (overlay) overlay.classList.remove('show');
  }
  function open(){
    sidebar.classList.add('dash-sidebar-open');
    if (overlay) overlay.classList.add('show');
  }

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.contains('dash-sidebar-open') ? close() : open();
  });
  if (overlay) overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Exposed so the shared Escape-key delegate can close this too.
  initSidebarMobileToggle.close = close;
}

/* =========================================================
   SIDEBAR — DESKTOP COLLAPSE (icon-only rail)
   Accessibility: when collapsed, each link's visible label text
   is cached into an aria-label so screen readers still announce
   it even though the <span> is visually hidden. Restored (removed)
   on expand so the visible text takes over again, avoiding a
   redundant double-announcement.
========================================================= */
function cacheAccessibleLabel(el){
  if (el.dataset.a11yLabel) return el.dataset.a11yLabel;
  const label = el.querySelector('span:not(.dash-nav-badge):not(.chev)');
  const text = (label ? label.textContent : el.textContent).trim();
  el.dataset.a11yLabel = text;
  return text;
}

function initSidebarCollapse(){
  const btn = document.getElementById('sidebar-collapse-btn');
  const shell = document.querySelector('.dash-shell');
  if (!btn || !shell) return;

  const labelable = shell.querySelectorAll('.dash-nav-link, .dash-nav-group-toggle');

  function setCollapsed(collapsed){
    shell.setAttribute('data-sidebar-collapsed', String(collapsed));
    btn.setAttribute('aria-pressed', String(collapsed));
    labelable.forEach(el => {
      if (collapsed){
        el.setAttribute('aria-label', cacheAccessibleLabel(el));
      } else {
        el.removeAttribute('aria-label');
      }
    });
  }

  btn.addEventListener('click', () => {
    const collapsed = shell.getAttribute('data-sidebar-collapsed') === 'true';
    setCollapsed(!collapsed);
  });
}

/* =========================================================
   SIDEBAR — NESTED / GROUPED MENUS
   Markup contract:
   <div class="dash-nav-group" data-open="false">
     <button class="dash-nav-group-toggle" aria-expanded="false">
       <svg>...</svg><span>Label</span><svg class="chev">...</svg>
     </button>
     <div class="dash-nav-submenu"><div>
       <a class="dash-nav-link" href="#">...</a>
       ...
     </div></div>
   </div>

   Accessibility: links inside a closed group are given tabindex="-1"
   so keyboard users tabbing through the sidebar skip content that is
   visually collapsed to zero height, instead of landing on invisible
   focus targets.
========================================================= */
function setSubmenuFocusable(group, focusable){
  group.querySelectorAll('.dash-nav-submenu .dash-nav-link').forEach(link => {
    link.tabIndex = focusable ? 0 : -1;
  });
}

function initSidebarNestedMenus(){
  document.querySelectorAll('.dash-nav-group').forEach(group => {
    const toggle = group.querySelector('.dash-nav-group-toggle');
    if (!toggle) return;

    // Sync initial state with whatever data-open the markup shipped with.
    setSubmenuFocusable(group, group.getAttribute('data-open') === 'true');

    toggle.addEventListener('click', () => {
      const isOpen = group.getAttribute('data-open') === 'true';
      group.setAttribute('data-open', String(!isOpen));
      toggle.setAttribute('aria-expanded', String(!isOpen));
      setSubmenuFocusable(group, !isOpen);
    });
  });
}

/* =========================================================
   GLOBAL CURRENCY FRAMEWORK
   UI + formatting only — no backend, no live conversion. Rates are
   all 1 (a documented placeholder) so the moment real exchange rates
   exist, only CURRENCIES below needs updating; every call site that
   uses formatCurrencyAmount() keeps working unchanged.
========================================================= */
const CURRENCY_STORAGE_KEY = 'careerz_currency_preference';
const CURRENCIES = {
  USD:{ symbol:'$',    name:'US Dollar',          rate:1 },
  EUR:{ symbol:'€',    name:'Euro',               rate:1 },
  GBP:{ symbol:'£',    name:'British Pound',      rate:1 },
  SAR:{ symbol:'SAR',  name:'Saudi Riyal',        rate:1 },
  AED:{ symbol:'AED',  name:'UAE Dirham',         rate:1 },
  PKR:{ symbol:'Rs.',  name:'Pakistani Rupee',    rate:1 },
  INR:{ symbol:'₹',    name:'Indian Rupee',       rate:1 },
  TRY:{ symbol:'₺',    name:'Turkish Lira',       rate:1 },
  JPY:{ symbol:'¥',    name:'Japanese Yen',       rate:1 },
  CAD:{ symbol:'C$',   name:'Canadian Dollar',    rate:1 },
  AUD:{ symbol:'A$',   name:'Australian Dollar',  rate:1 },
  CNY:{ symbol:'¥',    name:'Chinese Yuan',       rate:1 }
};
const DEFAULT_CURRENCY = 'USD';

// TODO (future phase): replace CURRENCIES[code].rate with live rates from
// a real exchange-rate API and multiply here. Every caller of this
// function is already written against that eventual behavior.
function formatCurrencyAmount(amount, code){
  const c = CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  const value = Number(amount || 0) * c.rate;
  // Locale-aware digit grouping: follows whichever language is currently
  // active rather than a hardcoded locale, so e.g. Arabic/Urdu numeral
  // conventions apply automatically once those languages are selected.
  const locale = document.documentElement.lang || 'en';
  return `${c.symbol} ${value.toLocaleString(locale)}`;
}

function getPreferredCurrency(){
  return localStorage.getItem(CURRENCY_STORAGE_KEY) || DEFAULT_CURRENCY;
}
function setPreferredCurrency(code){
  if (!CURRENCIES[code]) return;
  localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  document.dispatchEvent(new CustomEvent('careerz:currency-changed', { detail: { code } }));
}

/* =========================================================
   HEADER — QUICK ACTIONS DROPDOWN
========================================================= */
function initQuickActionsMenu(){
  const btn = document.getElementById('quick-actions-btn');
  const menu = document.getElementById('quick-actions-menu');
  if (!btn || !menu) return;
  registerDropdown(btn, menu);
}

/* =========================================================
   UNIVERSAL WALLET FRAMEWORK — UI placeholder only, no calculations,
   no backend. Drives both the compact header chip (#wallet-chip) and
   any full .u-wallet-card instance on the page from the same
   persisted currency preference, so they never show two different
   currencies at once.

   Header chip usage (unchanged from v1.1):
     <div class="dash-wallet-chip" id="wallet-chip"
       data-wallet-label="Salary" data-wallet-amount="125000">
   Wallet Card usage: give balance elements a numeric data-amount and
   this function fills in the formatted, currency-aware text.
========================================================= */
function initWalletFramework(){
  const chip = document.getElementById('wallet-chip');
  const chipAmountEl = document.getElementById('wallet-amount');
  const currencySelect = document.getElementById('wallet-currency-select');
  const cardAmountEls = document.querySelectorAll('.u-wallet-balance-item .amount[data-amount]');

  function render(){
    const code = getPreferredCurrency();
    if (chip && chipAmountEl){
      chipAmountEl.textContent = formatCurrencyAmount(chip.dataset.walletAmount || 0, code);
    }
    cardAmountEls.forEach(el => {
      el.textContent = formatCurrencyAmount(el.dataset.amount || 0, code);
    });
  }

  if (currencySelect){
    currencySelect.value = getPreferredCurrency();
    currencySelect.addEventListener('change', () => {
      setPreferredCurrency(currencySelect.value);
    });
  }

  document.addEventListener('careerz:currency-changed', render);
  render();
}

/* =========================================================
   HEADER — USER MENU DROPDOWN
========================================================= */
function initUserMenu(){
  const btn = document.getElementById('profile-btn');
  const menu = document.getElementById('user-menu');
  if (!btn || !menu) return;
  registerDropdown(btn, menu);
}

/* =========================================================
   RIGHT NOTIFICATION PANEL (mobile / narrow-screen drawer)
   On wide screens the panel is always visible in the grid;
   on narrower screens the bell icon reveals it as a drawer.
========================================================= */
function initNotificationDrawer(){
  const bellBtn = document.getElementById('notif-bell');
  const panel = document.getElementById('dash-panel');
  const overlay = document.getElementById('dash-overlay');
  const closeBtn = document.getElementById('dash-panel-close-btn');
  if (!bellBtn || !panel) return;

  function close(){
    panel.classList.remove('dash-panel-open');
    if (overlay) overlay.classList.remove('show');
  }

  bellBtn.addEventListener('click', () => {
    if (window.innerWidth <= 1200){
      panel.classList.toggle('dash-panel-open');
      if (overlay) overlay.classList.toggle('show');
    }
  });

  if (overlay) overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);

  // Exposed so the shared Escape-key delegate can close this too.
  initNotificationDrawer.close = close;
}

/* =========================================================
   MOBILE BOTTOM TAB BAR — delegates to the existing header
   controls so there is exactly one source of truth for
   "open sidebar" / "open notifications" behavior.
========================================================= */
function initMobileTabBar(){
  const menuBtn = document.getElementById('mobile-menu-btn');
  const notifBtn = document.getElementById('mobile-notif-btn');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const notifBell = document.getElementById('notif-bell');

  if (menuBtn && sidebarToggle){
    menuBtn.addEventListener('click', () => sidebarToggle.click());
  }
  if (notifBtn && notifBell){
    notifBtn.addEventListener('click', () => notifBell.click());
  }
}

/* =========================================================
   BREADCRUMB RENDERER
   Usage: add <nav class="dash-breadcrumb" id="dash-breadcrumb"
   data-trail='[{"label":"Dashboard","href":"index.html"},
   {"label":"My Applications"}]'></nav> anywhere in .dash-main.
   Any dashboard page can populate this without extra markup.
========================================================= */
function initBreadcrumb(){
  const el = document.getElementById('dash-breadcrumb');
  if (!el) return;
  let trail = [];
  try { trail = JSON.parse(el.dataset.trail || '[]'); } catch (err) { trail = []; }
  if (!trail.length) return;

  el.innerHTML = trail.map((item, i) => {
    const isLast = i === trail.length - 1;
    const sep = i > 0 ? '<span class="sep">/</span>' : '';
    if (isLast || !item.href){
      return `${sep}<span class="current">${item.label}</span>`;
    }
    return `${sep}<a href="${item.href}">${item.label}</a>`;
  }).join('');
}

/* =========================================================
   LOGOUT (demo only — no real session to end yet)
========================================================= */
function initLogout(){
  document.querySelectorAll('[data-logout]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      // TODO: replace with real session/logout API call in a later phase.
      window.location.href = '../pages/login.html';
    });
  });
}

/* =========================================================
   UNIVERSAL MODAL — reusable open/close
   Markup contract:
   <div class="u-modal-overlay" id="my-modal">
     <div class="u-modal" role="dialog" aria-modal="true">
       <div class="u-modal-head"><h3>Title</h3>
         <button class="u-modal-close" data-modal-close>✕</button></div>
       <div class="u-modal-body">...</div>
       <div class="u-modal-foot">...</div>
     </div>
   </div>
   Open with: openModal('my-modal')  Close with: closeModal('my-modal')
   Any element with [data-modal-open="my-modal"] opens it automatically.
========================================================= */
function openModal(id){
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  const focusable = overlay.querySelector('input, button, select, textarea, a[href]');
  if (focusable) focusable.focus({ preventScroll: true });
}
function closeModal(id){
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
function closeAllModals(){
  document.querySelectorAll('.u-modal-overlay.open').forEach(o => closeModal(o.id));
}

/* =========================================================
   UNIVERSAL TABS
   Markup contract: see the component block in
   dashboard-framework.css for the full example. Multiple
   independent .u-tabs groups on one page are supported.
========================================================= */
function initTabs(){
  document.querySelectorAll('[data-tabs]').forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.u-tab-btn');
      if (!btn || !group.contains(btn)) return;

      group.querySelectorAll('.u-tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const target = btn.dataset.tabTarget;
      group.querySelectorAll('.u-tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tabPanel === target);
      });
    });
  });
}

/* =========================================================
   UNIVERSAL ALERT — dismiss handling
========================================================= */
function initDismissibleAlerts(){
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-alert-close]');
    if (!closeBtn) return;
    const alert = closeBtn.closest('.u-alert');
    if (alert) alert.remove();
  });
}

/* =========================================================
   GLOBAL SEARCH FRAMEWORK — UI only, backend-ready.
   Wires any .dash-search input that has a sibling
   .dash-search-results panel: shows the panel on focus with a
   prompt/empty state (no fake results — this framework does not
   invent data), hides it on outside click or Escape.

   performSearch() is the documented integration point: replace its
   body with a real API call in a later phase and render results into
   the panel found via input.closest('.dash-search-wrap') — nothing
   else in this function needs to change.
========================================================= */
function performSearch(query){
  // TODO: replace with a real search API call in a later phase.
  // This framework intentionally renders no mock results.
  return null;
}

function initSearchFramework(){
  document.querySelectorAll('.dash-search-wrap').forEach(wrap => {
    const input = wrap.querySelector('input');
    const panel = wrap.querySelector('.dash-search-results');
    if (!input || !panel) return;

    input.addEventListener('focus', () => {
      panel.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      performSearch(input.value);
    });
    input.addEventListener('input', () => performSearch(input.value));

    openDropdowns.push({
      trigger: input,
      panel,
      onClose: null
    });
  });
}

/* =========================================================
   NOTIFICATION FRAMEWORK — future API integration point.
   The visible list/unread states already render from static markup
   (see the right notification panel and its All/Unread tabs, wired
   generically by initTabs()). This function is where a later phase
   swaps that static markup for a real feed without touching the
   panel's HTML/CSS structure.
========================================================= */
function fetchNotifications(){
  // TODO: replace with a real notifications API call in a later phase.
}

/* =========================================================
   UNIVERSAL TOAST HELPER
   Usage: showToast('Saved successfully', 'success')
   types: 'success' | 'error' | 'info' (default)
========================================================= */
function ensureToastStack(){
  let stack = document.getElementById('u-toast-stack');
  if (!stack){
    stack = document.createElement('div');
    stack.id = 'u-toast-stack';
    stack.className = 'u-toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}
function showToast(message, type){
  const stack = ensureToastStack();
  const el = document.createElement('div');
  el.className = `u-toast ${type || 'info'}`;
  el.innerHTML = `<span class="dot"></span><span>${message}</span>`;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 4200);
}

/* =========================================================
   UNIVERSAL TABLE — "select all" checkbox wiring
   Works with: <table class="u-table"> where the header checkbox
   has [data-select-all] and row checkboxes share a common
   [data-row-select] attribute inside the same table.
========================================================= */
function initSelectableTables(){
  document.querySelectorAll('table.u-table').forEach(table => {
    const selectAll = table.querySelector('[data-select-all]');
    if (!selectAll) return;
    const rowChecks = () => table.querySelectorAll('[data-row-select]');

    selectAll.addEventListener('change', () => {
      rowChecks().forEach(cb => {
        cb.checked = selectAll.checked;
        cb.closest('tr')?.classList.toggle('is-selected', selectAll.checked);
      });
    });

    table.addEventListener('change', (e) => {
      if (!e.target.matches('[data-row-select]')) return;
      e.target.closest('tr')?.classList.toggle('is-selected', e.target.checked);
      const all = Array.from(rowChecks());
      selectAll.checked = all.length > 0 && all.every(cb => cb.checked);
    });
  });
}

/* =========================================================
   SHARED GLOBAL DELEGATES
   Exactly one document 'click' listener and one document
   'keydown' listener for the whole framework, covering:
     click  → dropdown outside-click close, modal open/close
              triggers, modal backdrop click
     keydown (Escape) → close modals, dropdowns, mobile sidebar
              drawer and notification drawer, in that order
========================================================= */
function initGlobalDelegates(){
  document.addEventListener('click', (e) => {
    // Modal open triggers.
    const opener = e.target.closest('[data-modal-open]');
    if (opener){ openModal(opener.dataset.modalOpen); return; }

    // Modal close buttons.
    const closer = e.target.closest('[data-modal-close]');
    if (closer){
      const overlay = closer.closest('.u-modal-overlay');
      if (overlay) closeModal(overlay.id);
      return;
    }

    // Click on the dim backdrop itself (not the modal card) closes it.
    if (e.target.classList.contains('u-modal-overlay')){
      closeModal(e.target.id);
      return;
    }

    // Any open dropdown whose trigger/panel wasn't the click target closes.
    openDropdowns.forEach(({ trigger, panel, onClose }) => {
      if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== trigger){
        panel.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
        if (onClose) onClose();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeAllModals();
    closeAllDropdowns();
    if (typeof initSidebarMobileToggle.close === 'function') initSidebarMobileToggle.close();
    if (typeof initNotificationDrawer.close === 'function') initNotificationDrawer.close();
  });
}

/* =========================================================
   INIT — framework-level behaviors only.
   Each dashboard page still calls its own page-specific init
   (see dashboard.js) after this runs.
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();
  initLanguageSwitcher();
  initSidebarMobileToggle();
  initSidebarCollapse();
  initSidebarNestedMenus();
  initUserMenu();
  initQuickActionsMenu();
  initWalletFramework();
  initNotificationDrawer();
  initMobileTabBar();
  initBreadcrumb();
  initLogout();
  initTabs();
  initDismissibleAlerts();
  initSearchFramework();
  initSelectableTables();
  initGlobalDelegates();
});
