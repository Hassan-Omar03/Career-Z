import * as faceapi from '@vladmandic/face-api';

// Real client-side face detection/recognition (spec 15B.9/9.9 "Face Recognition" attendance) —
// runs entirely in the browser via TensorFlow.js. Model weights are not bundled into this app
// (they're several MB of binary files) — they're fetched once from a public CDN the first time
// this is used, then cached by the browser like any other static asset.
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

let loadPromise = null;
export function loadFaceModels() {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
  }
  return loadPromise;
}

export async function computeDescriptorFromImageUrl(imageUrl) {
  await loadFaceModels();
  const img = await faceapi.fetchImage(imageUrl);
  const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection) throw new Error("Couldn't find a clear face in that photo — try a front-facing photo with good lighting.");
  return Array.from(detection.descriptor);
}

export { faceapi };
