import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

// Real camera-based QR scanning (spec 15B.9/9.9 "QR Code" attendance) — no dedicated hardware,
// just the camera already in any phone/laptop. Decodes locally in the browser via jsQR; only the
// decoded text is ever sent to the backend.
export default function QrScanner({ onScan, active = true, hint = "Point the camera at a student's Digital ID QR code." }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastScanRef = useRef({ text: '', at: 0 });
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setReady(true);
        tick();
      } catch {
        setError("Couldn't access the camera — check your browser's camera permission for this site.");
      }
    }

    function tick() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code?.data) {
        const now = Date.now();
        // Debounce — the same QR stays in frame for many ticks; only fire once per 2.5s per code.
        if (code.data !== lastScanRef.current.text || now - lastScanRef.current.at > 2500) {
          lastScanRef.current = { text: code.data, at: now };
          onScan(code.data);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (error) return <p className="admin-notice">{error}</p>;

  return (
    <div style={{ position: 'relative', maxWidth: 420 }}>
      <video ref={videoRef} playsInline muted style={{ width: '100%', borderRadius: 14, background: '#000' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!ready && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>Starting camera...</p>}
      {ready && <p className="text-xs" style={{ color: 'var(--ink-soft)', marginTop: 6 }}>{hint}</p>}
    </div>
  );
}
