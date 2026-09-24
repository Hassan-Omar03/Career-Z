// Real client-side eye-gaze tracking for Advanced Class Control, via WebGazer.js — the only
// mature free/open-source browser gaze-tracking library. Same lazy-import-on-first-use pattern
// as faceApi.js/gestureApi.js so its (sizeable) webcam+regression code never loads for a teacher
// who never opens this panel.
//
// Honesty note (do not remove): webcam eye-tracking is inherently much less precise than a
// dedicated eye-tracker. It needs a well-lit face, a still head, and a real calibration pass, and
// even then it is only reliable enough for coarse "look left / look right" dwell zones — never
// pixel-precise pointing. Advanced Class Control treats it that way (two large dwell zones, not a
// cursor) and always keeps manual controls available alongside it.
let webgazerPromise = null;
export function loadWebgazer() {
  if (!webgazerPromise) webgazerPromise = import('webgazer').then((m) => m.default || m);
  return webgazerPromise;
}

export async function startGazeTracking(onGaze) {
  const webgazer = await loadWebgazer();
  webgazer.params.showVideoPreview = true;
  webgazer.params.showPredictionPoints = false;
  webgazer.params.showFaceOverlay = false;
  webgazer.setRegression('ridge');
  webgazer.setGazeListener((data) => {
    if (data) onGaze({ x: data.x, y: data.y });
  });
  await webgazer.begin();
  return webgazer;
}

export async function stopGazeTracking() {
  const webgazer = await loadWebgazer();
  webgazer.end();
}

// Records one calibration click at a known screen point — WebGazer's own click listener already
// does this automatically for real user clicks; this lets the calibration overlay register a
// point explicitly (used for the 9-dot grid, which fires this on every dot click).
export async function recordCalibrationClick(x, y) {
  const webgazer = await loadWebgazer();
  webgazer.recordScreenPosition(x, y, 'click');
}
