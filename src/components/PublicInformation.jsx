import { Link } from 'react-router-dom';
import { FaBookOpen, FaBuildingColumns, FaBriefcase, FaClock, FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';

export function AboutInformation() {
  return <div className="about-information">
    <section className="about-introduction"><span className="eyebrow">EDUCATION TO OPPORTUNITY</span><h2>One place to learn, connect and move forward.</h2><p>CareerZ brings students, teachers, institutions, parents, employers, agents and donors together. From joining a course to finding a career opportunity, each person has a workspace built around their role.</p></section>
    <div className="about-pillars">
      <section><FaBookOpen aria-hidden="true" /><h2>Learning that stays connected</h2><p>Follow courses, study lessons, submit assignments and join live classes. Teachers organize resources and review student work in the same platform.</p><h3>For students and families</h3><p>Keep track of your learning journey and share permitted updates with your parent or guardian.</p></section>
      <section><FaBuildingColumns aria-hidden="true" /><h2>A clearer way to run your institution</h2><p>Manage admissions, memberships, staff, classes, timetables and attendance through your institution workspace.</p><h3>Access built around responsibility</h3><p>Private records follow account roles and institution permissions, so people see the information relevant to their work.</p></section>
      <section><FaBriefcase aria-hidden="true" /><h2>Your next opportunity</h2><p>Explore jobs, internships, scholarships and education resources. Employers publish opportunities, while donors support education through their own programs.</p><h3>Support beyond the classroom</h3><p>Build your profile, prepare your CV and follow your applications as you take your next step.</p></section>
    </div>
    <section className="about-company">
      <div><h2>Who runs CareerZ</h2><p>CareerZ.pk is developed and operated by CareerZ Ecosystem (SMC-Private) Limited, based in Peshawar, Pakistan.</p><h3>The problem we set out to solve</h3><p>Admissions, classes, results, fees, scholarships and jobs usually live in separate places. CareerZ puts them in one account system, where an institution is verified before it can publish and every person only sees what their role allows.</p></div>
      <div><h3>Our mission</h3><p>Make education and opportunity easier to reach and easier to trust.</p><h3>Our vision</h3><p>A connected learning network where students, institutions, families and employers work from the same verified records.</p></div>
    </section>
    <section className="about-status" aria-labelledby="about-status-title">
      <h2 id="about-status-title">What works today and what is coming</h2>
      <div className="about-status-grid">
        <div><h3>Available today</h3><ul><li>Verified accounts for students, parents, teachers, institutions, employers, agents, donors and sellers.</li><li>Courses, lessons, assignments, exams with automatic marking, results and certificates.</li><li>Live classes with a whiteboard and screen sharing.</li><li>Institution admissions, classes, timetables, attendance, fees and staff roles.</li><li>Jobs and scholarships with application tracking.</li><li>English, Urdu and other languages.</li></ul></div>
        <div><h3>Coming next</h3><ul><li>Online card and wallet payments, now being connected and tested.</li><li>Sign-in codes by SMS.</li><li>More website templates for each type of institution.</li><li>A public news and press section.</li></ul></div>
      </div>
    </section>
    <section className="about-next-step"><div><h2>Find your place on CareerZ</h2><p>Explore what is available, or talk to us about bringing your institution or organization on board.</p></div><div><Link className="btn btn-primary" to="/signup">Create an account</Link><Link className="btn btn-outline" to="/contact">Contact our team</Link></div></section>
  </div>;
}

export function ContactInformation() {
  return <aside className="contact-information" aria-label="Contact details and support hours">
    <section><FaEnvelope aria-hidden="true" /><h2>Contact the team</h2><a href="mailto:info@careerz.pk">info@careerz.pk</a><a href="tel:+923002425623"><FaPhone aria-hidden="true" /> 0300-2425623</a></section>
    <section><FaClock aria-hidden="true" /><h2>Hours &amp; response</h2><dl><div><dt>Business hours</dt><dd>Monday–Friday, 9am–6pm</dd></div><div><dt>Time zone</dt><dd>Pakistan Standard Time (UTC+5)</dd></div><div><dt>Reply target</dt><dd>Within 1–2 working days</dd></div></dl><p>Messages received outside these hours are reviewed on the next working day. Some enquiries may need more time.</p></section>
    <section><FaLocationDot aria-hidden="true" /><h2>Our office</h2><p>Parkview Apartment, Block-6, 2nd Floor, C1, opposite Marbela Wedding Hall, Gate No. 2, Kababian Canal Road, Peshawar, Khyber Pakhtunkhwa, Pakistan.</p></section>
    <section><h2>Need help from your institute?</h2><p>For admissions, attendance, classes or results, contact your institution through its help desk.</p><Link className="btn btn-outline" to="/help">Visit Help Center</Link></section>
  </aside>;
}
