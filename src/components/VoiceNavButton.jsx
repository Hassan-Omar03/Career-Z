import { useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa6';

const FILLER_WORDS = new Set(['open', 'go', 'to', 'show', 'me', 'the', 'please', 'navigate', 'take', 'kholo', 'jao', 'dikhao']);

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w && !FILLER_WORDS.has(w));
}

// Best-matching nav item for a spoken phrase — real substring/word-overlap scoring against
// whatever role's actual nav list is passed in (no hardcoded per-role phrase list, so it works
// for every workspace automatically). Spec Part 17D/14.10 "Voice Navigation".
function findBestMatch(spoken, navItems) {
  const spokenWords = normalize(spoken);
  if (spokenWords.length === 0) return null;

  let best = null, bestScore = 0;
  navItems.forEach((item) => {
    const labelWords = normalize(item.label);
    const score = spokenWords.filter((w) => labelWords.some((lw) => lw.includes(w) || w.includes(lw))).length;
    if (score > bestScore) { bestScore = score; best = item; }
  });
  return bestScore > 0 ? best : null;
}

// Real browser-native voice control (spec 15B.9/17D "Voice Navigation") — the Web Speech API
// already ships in every modern browser, so this needs no server, no model download, and no
// extra hardware beyond the microphone every phone/laptop already has.
export default function VoiceNavButton({ navItems, onNavigate }) {
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SpeechRecognition) return null; // honest: no fake mic button on unsupported browsers

  function start() {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setListening(true); setHeard(''); };
    recognition.onerror = () => { setListening(false); setHeard('Could not hear that — try again.'); };
    recognition.onend = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setHeard(`Heard: "${transcript}"`);
      const match = findBestMatch(transcript, navItems);
      if (match) {
        setHeard(`Opening ${match.label}...`);
        onNavigate?.(match.key);
      } else {
        setHeard(`Heard "${transcript}" — no matching page found.`);
      }
    };

    recognition.start();
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button" className="icon-btn" aria-label="Voice navigation"
        onClick={start} disabled={listening}
        style={listening ? { color: 'var(--rose)' } : undefined}
      >
        <FaMicrophone size={17} />
      </button>
      {(listening || heard) && (
        <div style={{ position: 'absolute', top: '110%', right: 0, background: 'var(--surface, #fff)', border: '1px solid var(--sand-line)', borderRadius: 10, padding: '8px 12px', fontSize: 12, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', zIndex: 50 }}>
          {listening ? 'Listening...' : heard}
        </div>
      )}
    </div>
  );
}
