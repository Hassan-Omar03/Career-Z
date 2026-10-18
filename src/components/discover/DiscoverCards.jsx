import { Link } from 'react-router-dom';
import { FaLocationDot, FaCalendarDays, FaBriefcase, FaGraduationCap, FaBuildingColumns, FaStore, FaHandHoldingHeart, FaCircleCheck, FaBookOpen, FaUsers } from 'react-icons/fa6';

// Cards for the public homepage and "View All" pages. Each shows only fields the record actually
// has; nothing is filled in or invented when a field is missing.

const countryName = (code) => {
  try { return /^[A-Z]{2}$/.test(code || '') ? new Intl.DisplayNames(['en'], { type: 'region' }).of(code) : (code ? code.charAt(0) + code.slice(1).toLowerCase() : ''); } catch { return code || ''; }
};
export const place = (city, country) => [city, countryName(country)].filter(Boolean).join(', ');
export const dateText = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const daysLeft = (d) => (d ? Math.ceil((new Date(d) - Date.now()) / 864e5) : null);
const label = (s) => String(s || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
export const money = (amount, currency) => (amount || amount === 0 ? `${currency || ''} ${Number(amount).toLocaleString()}`.trim() : '');

function Deadline({ date }) {
  if (!date) return null;
  const left = daysLeft(date);
  return <span className={`dc-deadline${left <= 7 ? ' soon' : ''}`}><FaCalendarDays aria-hidden="true" /> Apply by {dateText(date)}{left <= 7 ? ` · ${left} day${left === 1 ? '' : 's'} left` : ''}</span>;
}

export function JobCard({ job }) {
  const salary = job.salaryMin || job.salaryMax ? `${job.currency} ${[job.salaryMin, job.salaryMax].filter(Boolean).map((n) => Number(n).toLocaleString()).join(' – ')}` : '';
  return (
    <article className="dc-card">
      <div className="dc-head">
        {job.companyLogo ? <img src={job.companyLogo} alt="" className="dc-logo" loading="lazy" /> : <span className="dc-logo dc-icon" aria-hidden="true"><FaBriefcase /></span>}
        <div><h3><Link to={`/jobs/${job._id}`}>{job.title}</Link></h3><p className="dc-sub">{job.company}{job.postedBy?.kind === 'institute' ? ' · verified institute' : job.postedBy ? ` · posted by ${job.postedBy.kind === 'agent' ? 'agent' : 'employer'} ${job.postedBy.name}` : ''}</p></div>
      </div>
      <ul className="dc-facts">
        {place(job.city, job.country) && <li><FaLocationDot aria-hidden="true" /> {place(job.city, job.country)}</li>}
        <li>{label(job.type)}{job.workMode ? ` · ${label(job.workMode)}` : ''}</li>
        {salary && <li>{salary}</li>}
        {job.experienceYears > 0 && <li>{job.experienceYears}+ years experience</li>}
      </ul>
      <div className="dc-meta"><Deadline date={job.applicationDeadline} /><span>Posted {dateText(job.postedAt)}</span>{job.verifiedPublisher && <span className="dc-verified"><FaCircleCheck aria-hidden="true" /> Verified publisher</span>}</div>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/jobs/${job._id}?action=apply`}>Apply Now</Link><Link className="btn" to={`/jobs/${job._id}`}>View Details</Link></div>
    </article>
  );
}

export function ScholarshipCard({ item }) {
  return (
    <article className="dc-card">
      <div className="dc-head"><span className="dc-logo dc-icon" aria-hidden="true"><FaGraduationCap /></span>
        <div><h3><Link to={`/scholarships/${item._id}`}>{item.title}</Link></h3><p className="dc-sub">By {item.provider?.profile ? <Link to={item.provider.profile}>{item.provider.name}</Link> : item.provider?.name}</p></div>
      </div>
      <ul className="dc-facts">
        <li><strong>{money(item.amount, item.currency)}</strong></li>
        {item.country && <li><FaLocationDot aria-hidden="true" /> {countryName(item.country)}</li>}
        {item.seatsAvailable > 0 && <li>{item.seatsAvailable} seat{item.seatsAvailable === 1 ? '' : 's'} left</li>}
      </ul>
      {item.eligibility && <p className="dc-text">{item.eligibility}</p>}
      <div className="dc-meta"><Deadline date={item.applicationDeadline} /><span>Posted {dateText(item.postedAt)}</span></div>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/scholarships/${item._id}?action=apply`}>Apply Now</Link><Link className="btn" to={`/scholarships/${item._id}`}>View Details</Link></div>
    </article>
  );
}

export function InstituteCard({ item }) {
  return (
    <article className="dc-card">
      <div className="dc-head">
        {item.logo ? <img src={item.logo} alt="" className="dc-logo" loading="lazy" /> : <span className="dc-logo dc-icon" aria-hidden="true"><FaBuildingColumns /></span>}
        <div><h3><Link to={`/institutes/${item._id}`}>{item.name}</Link></h3><p className="dc-sub">{label(item.type)}{place(item.city, item.country) ? ` · ${place(item.city, item.country)}` : ''}</p></div>
      </div>
      {item.description && <p className="dc-text">{item.description}</p>}
      {item.programs?.length > 0 && <p className="dc-tags">{item.programs.map((p) => <span key={p}>{p}</span>)}</p>}
      <div className="dc-meta"><span className="dc-verified"><FaCircleCheck aria-hidden="true" /> Verified institute</span></div>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/institutes/${item._id}`}>View Profile</Link></div>
    </article>
  );
}

export function ProductCard({ item }) {
  return (
    <article className="dc-card">
      {item.image ? <img src={item.image} alt="" className="dc-image" loading="lazy" /> : <div className="dc-image dc-icon" aria-hidden="true"><FaStore /></div>}
      <h3><Link to={`/marketplace/${item._id}`}>{item.title}</Link></h3>
      <p className="dc-sub">{label(item.category)}{item.seller ? ` · ${item.seller.name}` : ''}{item.seller?.city ? `, ${item.seller.city}` : ''}</p>
      {item.description && <p className="dc-text">{item.description}</p>}
      <div className="dc-meta"><strong>{money(item.price, item.currency)}</strong><span>{item.stock} in stock</span><span>Listed {dateText(item.postedAt)}</span></div>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/marketplace/${item._id}?action=order`}>Order</Link><Link className="btn" to={`/marketplace/${item._id}`}>View Details</Link></div>
    </article>
  );
}

export function DonorCard({ item }) {
  return (
    <article className="dc-card">
      <div className="dc-head">
        {item.logo ? <img src={item.logo} alt="" className="dc-logo" loading="lazy" /> : <span className="dc-logo dc-icon" aria-hidden="true"><FaHandHoldingHeart /></span>}
        <div><h3><Link to={`/donors/${item._id}`}>{item.name}</Link></h3><p className="dc-sub">{item.type}{place(item.city, item.country) ? ` · ${place(item.city, item.country)}` : ''}</p></div>
      </div>
      {item.about && <p className="dc-text">{item.about}</p>}
      {item.focusAreas?.length > 0 && <p className="dc-tags">{item.focusAreas.map((f) => <span key={f}>{f}</span>)}</p>}
      <div className="dc-meta"><span className="dc-verified"><FaCircleCheck aria-hidden="true" /> Verified donor</span>{item.openScholarships > 0 && <span>{item.openScholarships} open scholarship{item.openScholarships === 1 ? '' : 's'}</span>}</div>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/donors/${item._id}`}>View Profile</Link></div>
    </article>
  );
}

export function CourseCard({ item }) {
  return (
    <article className="dc-card">
      {item.image ? <img src={item.image} alt="" className="dc-image" loading="lazy" /> : <div className="dc-image dc-icon" aria-hidden="true"><FaBookOpen /></div>}
      <h3><Link to={`/courses/${item._id}`}>{item.title}</Link></h3>
      <p className="dc-sub">{[item.subject, item.level].filter(Boolean).join(' · ')}{item.teacher ? ` · by ${item.teacher.name}` : ''}{item.institution ? ` · ${item.institution.name}` : ''}</p>
      <ul className="dc-facts">
        <li>{item.institution ? 'Via admission' : item.isFree ? 'Free' : money(item.price, item.currency)}</li>
        <li>{label(item.studyMode)}</li>
        <li><FaUsers aria-hidden="true" /> {item.enrolled} enrolled</li>
      </ul>
      <div className="dc-actions"><Link className="btn btn-primary" to={`/courses/${item._id}`}>View Course</Link></div>
    </article>
  );
}

export function CardSkeleton() {
  return <div className="dc-card dc-skeleton" aria-hidden="true"><span /><span /><span /></div>;
}
