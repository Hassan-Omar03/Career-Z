// Where a notification should take the person when clicked. New notifications carry an exact
// deep link (/dashboard?ws=&tab=&sub=); older ones only say "/dashboard", so their destination is
// worked out from the title.
const JOB_STAGES = /: (Applied|Screening|Shortlisted|Interview|Final interview|Offer|Offer accepted|Joined|Completed|Not selected|Withdrawn)$/;

export function notificationLink(n) {
  const link = String(n?.link || '');
  if (link && link !== '/dashboard') return link;
  const t = String(n?.title || '');
  if (/^(Job offer|Revised job offer|Offer letter):/.test(t)) return '/dashboard?tab=jobs&sub=offers';
  if (/(Interview|Final interview) scheduled:/.test(t)) return '/dashboard?tab=jobs&sub=interviews';
  if (JOB_STAGES.test(t) || /^Application received:|is now in your account$/.test(t)) return '/dashboard?tab=jobs&sub=applications';
  if (/^(New application|New application \(guest\)|Application withdrawn|Offer (accepted|declined)|Joining confirmed|Candidate (joined|shortlisted)|Joining recorded)/.test(t)) return '/dashboard?tab=jobs';
  if (/^Message from /.test(t)) return '/dashboard?tab=jobs';
  if (/^Welcome to /.test(t)) return '/dashboard?ws=teacher&tab=summary';
  if (/^Commission generated/.test(t)) return '/dashboard?ws=education_agent&tab=commission';
  if (/recruitment|Recruitment|invoice|Invoice/.test(t)) return '/dashboard?tab=jobsHiring&sub=agents';
  return link || '';
}

// Dashboard tabs that mean the same place in another workspace (an institute's jobs live under
// "Jobs & Hiring", an employer's and an agent's under "Jobs").
// A student's fees live under "Wallet".
export const TAB_ALIASES = { jobs: ['jobs', 'jobsHiring'], jobsHiring: ['jobsHiring', 'jobs'], fees: ['fees', 'wallet'] };
