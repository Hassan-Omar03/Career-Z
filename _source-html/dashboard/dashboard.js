
// --- Added 2026-08-02 15:19:50 --- 
/* =============================================================
   CAREERZ AI — STUDENT / GENERAL USER DASHBOARD (PAGE CONTENT)
   ---------------------------------------------------------------
   This file is intentionally NOT the framework. It only powers
   the widgets specific to this particular overview page: the
   role-switcher demo label, the profile-completion progress
   ring, and the calendar widget.

   Shell-level behavior (theme toggle, language switcher, sidebar
   collapse/mobile drawer, nested menus, user menu dropdown,
   notification drawer, breadcrumb, modals, logout) lives in
   assets/js/dashboard-framework.js and is shared by every future
   role dashboard — it is loaded before this file and must not be
   duplicated here.
================================================================= */

/* =========================================================
   ROLE SWITCHER (placeholder only)
   This does NOT unlock or verify anything — it simply updates
   a demo label so future role-based dashboards have a hook to
   build on without redesigning this page.
========================================================= */
function initRoleSwitcher(){
  const select = document.getElementById('role-select');
  const banner = document.getElementById('welcome-role-label');
  if (!select) return;

  select.addEventListener('change', () => {
    if (banner) banner.textContent = select.options[select.selectedIndex].text;
    // TODO (future phase): fetch role-specific dashboard sections here
    // once real approval/verification logic exists on the backend.
  });
}

/* =========================================================
   PROFILE COMPLETION RING
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
   CALENDAR WIDGET (demo — current month, static event dots)
========================================================= */
function initCalendar(){
  const grid = document.getElementById('calendar-grid');
  const label = document.getElementById('calendar-label');
  if (!grid || !label) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const eventDays = [3, 11, 18, 24]; // demo event markers

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
   INIT — page-specific widgets only. Shell behaviors are
   initialized by dashboard-framework.js's own DOMContentLoaded
   listener, loaded before this file.
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  initRoleSwitcher();
  initProgressRing();
  initCalendar();
});

