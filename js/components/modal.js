/**
 * modal.js – Reusable modal dialog for MathMind Kids
 */

/** @type {HTMLElement|null} */
let overlay = null;
let activeModal = null;

/**
 * Initialise the modal system. Must be called once after DOM ready.
 */
export function initModal() {
  overlay = document.getElementById('modal-overlay');
  if (!overlay) return;

  // Close on backdrop click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Wire close buttons inside modals
  overlay.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
}

/**
 * Open a modal by its inner element ID.
 * @param {string} modalId – id of the .modal element to show
 */
export function openModal(modalId) {
  if (!overlay) return;

  // Hide all modals inside overlay first
  overlay.querySelectorAll('.modal').forEach(m => m.classList.remove('active-modal'));

  const modal = document.getElementById(modalId);
  if (!modal) return;

  modal.classList.add('active-modal');
  overlay.classList.add('open');
  activeModal = modal;

  // Trap focus inside modal
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) firstFocusable.focus();

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Show a generic confirmation / alert modal with custom title, message, and buttons.
 * @param {object} opts
 * @param {string}   opts.title
 * @param {string}   opts.message
 * @param {string}   [opts.confirmText='OK']
 * @param {string}   [opts.cancelText='Cancel']
 * @param {boolean}  [opts.showCancel=true]
 * @param {Function} [opts.onConfirm]
 * @param {Function} [opts.onCancel]
 * @param {'success'|'warning'|'info'|'error'} [opts.type='info']
 */
export function showConfirm({
  title = 'Are you sure?',
  message = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = true,
  onConfirm = null,
  onCancel  = null,
  type      = 'info',
}) {
  const iconMap = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };

  const modal = document.getElementById('generic-modal');
  if (!modal) return;

  modal.querySelector('.modal-icon').textContent  = iconMap[type] || '❓';
  modal.querySelector('.modal-title').textContent = title;
  modal.querySelector('.modal-msg').textContent   = message;

  const confirmBtn = modal.querySelector('#modal-confirm-btn');
  const cancelBtn  = modal.querySelector('#modal-cancel-btn');

  confirmBtn.textContent = confirmText;
  cancelBtn.style.display = showCancel ? 'inline-flex' : 'none';

  // Remove stale listeners by cloning
  const newConfirm = confirmBtn.cloneNode(true);
  const newCancel  = cancelBtn.cloneNode(true);
  confirmBtn.replaceWith(newConfirm);
  cancelBtn.replaceWith(newCancel);

  newConfirm.addEventListener('click', () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  });

  newCancel.addEventListener('click', () => {
    closeModal();
    if (typeof onCancel === 'function') onCancel();
  });

  openModal('generic-modal');
}

/**
 * Close the currently open modal.
 */
export function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  if (activeModal) {
    activeModal.classList.remove('active-modal');
    activeModal = null;
  }
}
