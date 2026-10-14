// Teacher types (master spec 9.2), as the backend stores them, with the labels people read.
export const TEACHER_CATEGORIES = [
  ['school_teacher', 'School Teacher'], ['college_lecturer', 'College Lecturer'], ['university_professor', 'University Professor'],
  ['madrasa_teacher', 'Madrasa Teacher'], ['academy_teacher', 'Academy Teacher'], ['tuition_teacher', 'Tuition Teacher'],
  ['online_instructor', 'Online Instructor'], ['corporate_trainer', 'Corporate Trainer'], ['vocational_trainer', 'Vocational Trainer'],
  ['language_teacher', 'Language Teacher'], ['freelance_teacher', 'Freelance Teacher'], ['guest_lecturer', 'Guest Lecturer']
];
export const categoryLabel = (key) => TEACHER_CATEGORIES.find(([k]) => k === key)?.[1] || key;
export const MODE_LABEL = { online: 'Online', in_person: 'In person' };

// Intro videos are links (YouTube, Vimeo or an uploaded .mp4); turn them into something playable.
export function videoEmbed(url) {
  const u = String(url || '').trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i);
  if (yt) return { kind: 'iframe', src: `https://www.youtube-nocookie.com/embed/${yt[1]}` };
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return { kind: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (/^https:\/\/\S+\.(mp4|webm|mov)(\?\S*)?$/i.test(u) || /^https:\/\/res\.cloudinary\.com\/\S+\/video\/upload\//i.test(u)) return { kind: 'video', src: u };
  return null;
}

export const BADGE_COLOR = { bronze: '#b0703c', silver: '#8a96a3', gold: '#c99a1e', expert: '#1b8a63' };
