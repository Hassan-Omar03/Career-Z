// Single shared Paddle.js loader — used by every Paddle checkout button in the app (Fee payment,
// Wallet top-up, etc.). Having more than one independent loader risked appending the same
// <script src="paddle.js"> tag twice, which can silently hang (the second tag's onload never
// fires because the browser reuses the in-flight/cached resource).
let paddleLoadPromise = null;
let activeCheckoutHandler = null; // only one Paddle.Checkout can be open at a time

export function loadPaddle(clientToken, environment) {
  if (window.Paddle) return Promise.resolve(window.Paddle);
  if (paddleLoadPromise) return paddleLoadPromise;
  paddleLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.onload = () => {
      if (environment === 'sandbox') window.Paddle.Environment.set('sandbox');
      window.Paddle.Initialize({
        token: clientToken,
        eventCallback(data) {
          if (data.name === 'checkout.completed' || data.name === 'checkout.closed') activeCheckoutHandler?.();
        }
      });
      resolve(window.Paddle);
    };
    script.onerror = () => { paddleLoadPromise = null; reject(new Error('Failed to load Paddle.js — check your internet connection.')); };
    document.head.appendChild(script);
  });
  return paddleLoadPromise;
}

export function setActiveCheckoutHandler(fn) {
  activeCheckoutHandler = fn;
}
