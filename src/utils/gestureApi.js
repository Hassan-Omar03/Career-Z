// Real client-side hand-gesture recognition for Advanced Class Control (voice/gesture/eye
// presentation control). Runs entirely in the browser via MediaPipe's Tasks Vision WASM runtime
// — same lazy-load-from-CDN pattern as src/utils/faceApi.js (the library itself is bundled via
// npm, the multi-MB model file is fetched once from Google's CDN and cached by the browser).
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Keep the WASM runtime on the exact same version as the installed JS package. Mixing the old
// 0.10 runtime with the 1.x API can load without a clear error but produce unreliable video
// inference on some browsers/GPUs.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

let landmarkerPromise = null;
export function loadHandLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = FilesetResolver.forVisionTasks(WASM_URL).then((fileset) =>
      HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.35,
        minHandPresenceConfidence: 0.35,
        minTrackingConfidence: 0.35
      })
    );
  }
  return landmarkerPromise;
}

// Per-finger extended/curled state (index/middle/ring/pinky — thumb is unreliable across hand
// orientations so it's deliberately excluded) using MediaPipe's 21-point hand landmark indices:
// a finger is "extended" when its tip sits above its own middle (PIP) joint in image space.
function fingerStates(landmarks) {
  const pairs = { index: [8, 6], middle: [12, 10], ring: [16, 14], pinky: [20, 18] };
  const state = {};
  for (const name in pairs) {
    const [tip, pip] = pairs[name];
    state[name] = landmarks[tip].y < landmarks[pip].y;
  }
  return state;
}

// Classifies a single frame's detected hand into one of four static poses Advanced Class Control
// reacts to — deliberately static poses only, not motion/swipe: a held pose (index alone, index+
// middle, all four, none) is far more reliable to detect than tracking a swipe's direction, which
// was noisy enough to misfire in either direction from small, incidental hand movement.
export function classifyHandPose(landmarks) {
  const f = fingerStates(landmarks);
  const count = (f.index ? 1 : 0) + (f.middle ? 1 : 0) + (f.ring ? 1 : 0) + (f.pinky ? 1 : 0);
  if (count === 0) return 'fist';
  if (count >= 4) return 'open_palm';
  if (f.index && !f.middle && !f.ring && !f.pinky) return 'one_finger';
  if (f.index && f.middle && !f.ring && !f.pinky) return 'two_fingers';
  return 'none'; // an ambiguous in-between pose (e.g. 3 fingers) — not a recognized gesture
}

export function getWristPoint(landmarks) {
  return { x: landmarks[0].x, y: landmarks[0].y };
}
