// Real client-side hand-gesture recognition for Advanced Class Control (voice/gesture/eye
// presentation control). Runs entirely in the browser via MediaPipe's Tasks Vision WASM runtime
// — same lazy-load-from-CDN pattern as src/utils/faceApi.js (the library itself is bundled via
// npm, the multi-MB model file is fetched once from Google's CDN and cached by the browser).
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let landmarkerPromise = null;
export function loadHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_URL).then((fileset) =>
      HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1
      })
    );
  }
  return landmarkerPromise;
}

// Counts extended fingers (index/middle/ring/pinky — thumb is unreliable across hand
// orientations so it's deliberately excluded) using MediaPipe's 21-point hand landmark indices:
// a finger is "extended" when its tip sits above its own middle (PIP) joint in image space.
function countExtendedFingers(landmarks) {
  const pairs = [[8, 6], [12, 10], [16, 14], [20, 18]]; // [tip, pip] per finger
  return pairs.reduce((count, [tip, pip]) => count + (landmarks[tip].y < landmarks[pip].y ? 1 : 0), 0);
}

// Classifies a single frame's detected hand into one of the gestures Advanced Class Control
// reacts to. Swipe (next/previous) is inherently a multi-frame motion, so that part is tracked
// by the caller (see wristHistory usage in the component) — this only classifies the static pose.
export function classifyHandPose(landmarks) {
  const extended = countExtendedFingers(landmarks);
  if (extended >= 4) return 'open_palm';
  if (extended === 0) return 'fist';
  return 'none';
}

export function getWristPoint(landmarks) {
  return { x: landmarks[0].x, y: landmarks[0].y };
}
