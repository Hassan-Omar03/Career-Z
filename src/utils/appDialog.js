const DIALOG_EVENT = 'careerz:dialog';

function requestDialog(options) {
  return new Promise((resolve) => {
    window.dispatchEvent(new CustomEvent(DIALOG_EVENT, { detail: { ...options, resolve } }));
  });
}

export function showConfirm(message, options = {}) {
  return requestDialog({ type: 'confirm', title: options.title || 'Please confirm', message, confirmLabel: options.confirmLabel || 'Confirm', danger: Boolean(options.danger) });
}

export function showPrompt(message, options = {}) {
  return requestDialog({ type: 'prompt', title: options.title || 'Add details', message, placeholder: options.placeholder || '', initialValue: options.initialValue || '', confirmLabel: options.confirmLabel || 'Continue', required: Boolean(options.required), danger: Boolean(options.danger) });
}

export { DIALOG_EVENT };
