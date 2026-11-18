import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client';
import { createBrandedPdf, addPdfFooter, drawPdfTable, drawPdfSummary, PDF_COLORS } from '../../utils/brandedPdf';

// Program-based admission (Point 22): the level (grade / class / semester), its subject group and
// electives. Only levels open for admission can be chosen; upcoming and closed ones are shown.
// Programs without levels keep the simple program-only application (value stays empty).
export function useAdmissionOptions(institutionId) {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!institutionId) return undefined;
    let alive = true;
    apiRequest(`/public/institutes/${institutionId}/admission-options`, { auth: false }).then((d) => { if (alive) setData(d); }).catch(() => { if (alive) setData(null); });
    return () => { alive = false; };
  }, [institutionId]);
  return data;
}

const STATUS = { open: 'Open for admission', upcoming: 'Upcoming', closed: 'Closed' };
const day = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

export default function AdmissionChoice({ options, programName, value, onChange }) {
  const program = options?.programs?.find((p) => p.name === programName);
  if (!program || !program.levels.length) return null;
  const level = program.levels.find((l) => l._id === value.term);
  const group = level?.groups.find((g) => g._id === value.subjectGroup);
  const set = (patch) => onChange({ ...value, ...patch });
  const electives = value.electives || [];
  return (
    <div className="admission-choice" style={{ display: 'grid', gap: 10 }}>
      <label>Class / grade / semester
        <select className="form-select" required value={value.term || ''} onChange={(e) => set({ term: e.target.value, subjectGroup: '', electives: [] })}>
          <option value="">Select…</option>
          {program.levels.map((l) => <option key={l._id} value={l._id} disabled={l.admissionStatus !== 'open'}>{l.name} — {STATUS[l.admissionStatus]}{l.admissionStatus === 'open' && l.admissionDeadline ? ` until ${day(l.admissionDeadline)}` : ''}{l.intake ? ` · ${l.intake.name}` : ''}</option>)}
        </select>
      </label>
      {level && level.groups.length > 0 && (
        <label>Subject group
          <select className="form-select" required value={value.subjectGroup || ''} onChange={(e) => set({ subjectGroup: e.target.value, electives: [] })}>
            <option value="">Select…</option>
            {level.groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
          </select>
        </label>
      )}
      {group && (
        <div className="dp-note" style={{ margin: 0 }}>
          {group.guidance && <p style={{ margin: '0 0 6px' }}>{group.guidance}</p>}
          <p style={{ margin: '0 0 6px' }}><strong>Compulsory:</strong> {group.compulsory.map((s) => s.name).join(', ') || '—'}</p>
          {group.electives.length > 0 && (
            <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontWeight: 600 }}>Choose {group.minElectives === group.maxElectives ? group.minElectives : `${group.minElectives}–${group.maxElectives}`} elective{group.maxElectives === 1 ? '' : 's'}</legend>
              {group.electives.map((s) => (
                <label key={s._id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={electives.includes(s._id)} disabled={!electives.includes(s._id) && electives.length >= group.maxElectives}
                    onChange={(e) => set({ electives: e.target.checked ? [...electives, s._id] : electives.filter((x) => x !== s._id) })} /> {s.name}
                </label>
              ))}
            </fieldset>
          )}
        </div>
      )}
    </div>
  );
}

// True when the choice is complete enough to send (the server checks it again).
export function admissionChoiceReady(options, programName, value) {
  const program = options?.programs?.find((p) => p.name === programName);
  if (!program || !program.levels.length) return true;
  const level = program.levels.find((l) => l._id === value.term);
  if (!level || level.admissionStatus !== 'open') return false;
  if (!level.groups.length) return true;
  const group = level.groups.find((g) => g._id === value.subjectGroup);
  if (!group) return false;
  const n = (value.electives || []).length;
  return n >= group.minElectives && n <= group.maxElectives;
}

// Downloadable subject-selection guide for one program: institute, program, intake, deadlines,
// each level's groups with compulsory and elective subjects, and how to apply.
export async function downloadSubjectGuide(options, programName) {
  const program = options?.programs?.find((p) => p.name === programName);
  if (!program) return;
  const { jsPDF } = await import('jspdf');
  const inst = options.institution;
  const pdf = await createBrandedPdf(jsPDF, { title: `${program.name} - Subject Guide`, subtitle: `${inst.name}${inst.city ? `, ${inst.city}` : ''}` });
  if (inst.logo) {
    try {
      const blob = await (await fetch(inst.logo)).blob();
      const data = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(blob); });
      pdf.addImage(data, 'PNG', pdf.internal.pageSize.getWidth() - 40, 40, 26, 26);
    } catch { /* the guide works without the logo */ }
  }
  const open = program.levels.filter((l) => l.admissionStatus === 'open');
  const intakes = [...new Set(program.levels.map((l) => l.intake?.name).filter(Boolean))];
  const deadlines = open.filter((l) => l.admissionDeadline).map((l) => `${l.name}: ${day(l.admissionDeadline)}`);
  let y = drawPdfSummary(pdf, [
    { label: 'Program', value: program.name + (program.department ? ` (${program.department})` : '') },
    { label: 'Intake / session', value: intakes.join(', ') || '—' },
    { label: 'Admission open for', value: open.map((l) => l.name).join(', ') || 'None at the moment' },
    { label: 'Last date to apply', value: deadlines.join('; ') || '—' }
  ], 70);
  for (const level of program.levels) {
    if (y > 240) { pdf.addPage(); y = 22; }
    pdf.setTextColor(...PDF_COLORS.forest); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12);
    pdf.text(`${level.name} - ${STATUS[level.admissionStatus]}${level.seats ? ` - ${level.seats} seats` : ''}`, 14, y + 6);
    y += 9;
    if (!level.groups.length) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(...PDF_COLORS.muted); pdf.text('No subject groups for this level: all students study the same subjects.', 14, y + 4); y += 10; continue; }
    y = drawPdfTable(pdf, {
      headers: ['Group', 'Compulsory subjects', 'Electives (choose)', 'Guidance'],
      rows: level.groups.map((g) => [g.name, g.compulsory.map((s) => s.name).join(', ') || '—', g.electives.length ? `${g.electives.map((s) => s.name).join(', ')} (${g.minElectives === g.maxElectives ? g.minElectives : `${g.minElectives}–${g.maxElectives}`})` : 'None', g.guidance || '—']),
      startY: y, widths: [28, 56, 52, 46]
    }) + 6;
  }
  if (y > 230) { pdf.addPage(); y = 22; }
  pdf.setTextColor(...PDF_COLORS.forest); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(12); pdf.text('How to apply', 14, y + 6);
  pdf.setTextColor(...PDF_COLORS.ink); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9.5);
  const steps = [
    `1. Open careerz.pk, find ${inst.name} and press "Apply for admission".`,
    `2. Choose the program "${program.name}" and the class / grade / semester that is open for admission.`,
    '3. Choose your subject group, then the elective subjects (the number allowed is shown).',
    '4. Submit. The institute reviews the application; it may set a test or an interview.',
    '5. After acceptance, pay the admission fee. Your classes and courses open once it is paid.'
  ];
  pdf.text(steps, 14, y + 13, { maxWidth: 182, lineHeightFactor: 1.6 });
  addPdfFooter(pdf);
  pdf.save(`${program.name.replace(/[^a-z0-9]+/gi, '-')}-subject-guide.pdf`);
}
