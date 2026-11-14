/**
 * app.js - メインアプリケーション制御
 */

import { store } from './state.js';
import {
  renderStep0,
  renderStep1,
  renderStep2,
  renderStep3,
  renderStep4,
  renderStep5,
  renderStep6,
  renderStep7,
  renderStep8
} from './views.js';

const stepRenderers = [
  renderStep0,
  renderStep1,
  renderStep2,
  renderStep3,
  renderStep4,
  renderStep5,
  renderStep6,
  renderStep7,
  renderStep8
];

const TRANSITION_LOCK_MS = 500;

function validateRepoName(rawValue) {
  if (!rawValue || !rawValue.trim()) {
    return 'リポジトリ名を入力してください。';
  }
  if (rawValue === '.' || rawValue === '..') {
    return '「.」や「..」だけのリポジトリ名は使用できません。';
  }
  if (rawValue.length > 100) {
    return 'リポジトリ名は100文字以内で入力してください。';
  }
  if (/[^A-Za-z0-9._-]/.test(rawValue)) {
    return '使用できる文字は半角英数字、.（ピリオド）、_（アンダースコア）、-（ハイフン）のみです（日本語や空白は使用できません）。';
  }
  return '';
}

function initApp() {
  const container = document.getElementById('step-container');
  const progressSection = document.getElementById('progress-section');
  const progressLabel = document.getElementById('progress-step-label');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const globalResetBtn = document.getElementById('btn-global-reset');
  const resetDialogBackdrop = document.getElementById('reset-dialog-backdrop');
  const resetDialog = document.getElementById('reset-dialog');
  const resetCancelBtn = document.getElementById('btn-reset-cancel');
  const resetConfirmBtn = document.getElementById('btn-reset-confirm');

  let lastRenderedStep = null;
  let lastTransitionAt = 0;

  function canTransition() {
    return Date.now() - lastTransitionAt >= TRANSITION_LOCK_MS;
  }

  function markTransition() {
    lastTransitionAt = Date.now();
  }

  function setRepoNameError(message) {
    const repoInput = document.getElementById('input-repo-name');
    const errorEl = document.getElementById('repo-name-error');
    if (!repoInput || !errorEl) return;

    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      repoInput.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
      repoInput.removeAttribute('aria-invalid');
    }
  }

  function openResetDialog() {
    if (!resetDialogBackdrop || !resetDialog) return;
    resetDialogBackdrop.hidden = false;
    resetDialog.focus();
  }

  function closeResetDialog() {
    if (!resetDialogBackdrop || resetDialogBackdrop.hidden) return;
    resetDialogBackdrop.hidden = true;
    if (globalResetBtn) {
      globalResetBtn.focus();
    }
  }

  function render() {
    const state = store.getState();
    const currentStep = state.currentStep;
    const stepChanged = currentStep !== lastRenderedStep;

    // Render step view
    const renderer = stepRenderers[currentStep] || renderStep0;
    container.innerHTML = renderer(state);

    // Update Progress
    if (currentStep === 0) {
      progressSection.style.display = 'none';
    } else {
      progressSection.style.display = 'block';
      const percent = Math.round((currentStep / 8) * 100);
      progressLabel.textContent = `ステップ ${currentStep} / 8`;
      progressPercent.textContent = `${percent}%`;
      progressBarFill.style.width = `${percent}%`;
    }

    // Scroll to top and set focus on step change
    if (stepChanged) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const stepCard = container.querySelector('.step-card');
      if (stepCard) {
        stepCard.setAttribute('tabindex', '-1');
        stepCard.focus({ preventScroll: true });
      }
    }
    lastRenderedStep = currentStep;
  }

  // Event Delegation for Container
  container.addEventListener('click', (e) => {
    // Start button
    if (e.target.closest('#btn-start')) {
      if (!canTransition()) return;
      markTransition();
      store.nextStep();
      return;
    }

    // Next button
    if (e.target.closest('#btn-next')) {
      if (!canTransition()) return;
      if (store.getState().currentStep === 4) {
        const repoInput = document.getElementById('input-repo-name');
        if (repoInput) {
          const errorMsg = validateRepoName(repoInput.value);
          if (errorMsg) {
            setRepoNameError(errorMsg);
            repoInput.focus();
            return;
          }
          setRepoNameError('');
        }
      }
      syncCurrentInputs({ notify: false, autoSuggestRepo: true });
      markTransition();
      store.nextStep();
      return;
    }

    // Prev button
    if (e.target.closest('#btn-prev')) {
      if (!canTransition()) return;
      syncCurrentInputs({ notify: false, autoSuggestRepo: true });
      markTransition();
      store.prevStep();
      return;
    }

    // Finish button
    if (e.target.closest('#btn-finish')) {
      if (!canTransition()) return;
      markTransition();
      store.setStep(0);
      return;
    }

    // Quick tag button
    const tagBtn = e.target.closest('.quick-tag-btn');
    if (tagBtn) {
      syncCurrentInputs({ notify: false, autoSuggestRepo: false });
      const type = tagBtn.dataset.tagType;
      const label = tagBtn.dataset.tagLabel;
      const nameInput = document.getElementById('input-tool-name');
      const descInput = document.getElementById('input-tool-desc');
      const authorInput = document.getElementById('input-author-name');
      const state = store.getState();
      const currentDesc = descInput ? descInput.value : state.toolDescription;
      const currentAuthor = authorInput ? authorInput.value : state.authorName;
      let finalName = nameInput ? nameInput.value : '';
      if (!finalName.trim()) {
        finalName = label;
      }
      store.updateToolInfo(finalName, type, currentDesc, currentAuthor, {
        notify: true,
        autoSuggestRepo: true
      });
      return;
    }

    // Copy button
    const copyBtn = e.target.closest('.btn-copy');
    if (copyBtn) {
      const copyType = copyBtn.dataset.copyType;
      if ((copyType === 'readme' || copyType === 'license') && !(store.getState().authorName || '').trim()) {
        showToast('著作権者名をStep 1で入力してください');
        return;
      }

      const textToCopy = decodeURIComponent(copyBtn.dataset.copyText || '');
      if (textToCopy) {
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('クリップボードにコピーしました！');
          }).catch(() => {
            copyFallback(textToCopy);
          });
        } else {
          copyFallback(textToCopy);
        }
      }
      return;
    }
  });

  // Real-time auto-save for text inputs without full re-render
  container.addEventListener('input', (e) => {
    const id = e.target.id;
    if (id === 'input-tool-name' || id === 'input-tool-desc' || id === 'input-author-name') {
      syncCurrentInputs({ notify: false, autoSuggestRepo: false });
      return;
    }

    if (id === 'input-repo-name') {
      store.setRepoName(e.target.value, { notify: false });
      const preview = document.getElementById('repo-name-preview');
      if (preview) {
        preview.textContent = e.target.value || '<リポジトリ名>';
      }
      if (e.target.getAttribute('aria-invalid') === 'true') {
        const errorMsg = validateRepoName(e.target.value);
        setRepoNameError(errorMsg);
      }
    }
  });

  // Checkbox & Radio change
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('checklist-checkbox')) {
      const checkId = e.target.dataset.checkId;
      const isChecked = e.target.checked;
      store.setCheck(checkId, isChecked);
      const parentLabel = e.target.closest('.checklist-item');
      if (parentLabel) {
        parentLabel.classList.toggle('checked', isChecked);
      }
      return;
    }

    if (e.target.name === 'github_acc') {
      const selectedValue = e.target.value;
      store.setGithubAccountStatus(selectedValue === 'yes');
      const nextRadio = container.querySelector(`input[name="github_acc"][value="${selectedValue}"]`);
      if (nextRadio) {
        nextRadio.focus({ preventScroll: true });
      }
    }
  });

  // Input change sync
  function syncCurrentInputs({ notify = false, autoSuggestRepo = true } = {}) {
    const nameInput = document.getElementById('input-tool-name');
    const descInput = document.getElementById('input-tool-desc');
    const authorInput = document.getElementById('input-author-name');
    const repoInput = document.getElementById('input-repo-name');

    if (nameInput || descInput || authorInput) {
      const state = store.getState();
      store.updateToolInfo(
        nameInput ? nameInput.value : state.toolName,
        state.toolType,
        descInput ? descInput.value : state.toolDescription,
        authorInput ? authorInput.value : state.authorName,
        { notify, autoSuggestRepo }
      );
    }

    if (repoInput) {
      store.setRepoName(repoInput.value.trim(), { notify });
    }
  }

  // Global reset dialog
  if (globalResetBtn) {
    globalResetBtn.addEventListener('click', () => {
      openResetDialog();
    });
  }

  if (resetCancelBtn) {
    resetCancelBtn.addEventListener('click', () => {
      closeResetDialog();
    });
  }

  if (resetConfirmBtn) {
    resetConfirmBtn.addEventListener('click', () => {
      store.resetAll();
      closeResetDialog();
      showToast('リセットしました。');
    });
  }

  if (resetDialogBackdrop) {
    resetDialogBackdrop.addEventListener('click', (e) => {
      if (e.target === resetDialogBackdrop) {
        closeResetDialog();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (resetDialogBackdrop && !resetDialogBackdrop.hidden && e.key === 'Escape') {
      e.preventDefault();
      closeResetDialog();
    }
  });

  // Notify once if storage saving fails
  store.onSaveError(() => {
    showToast('このブラウザ環境では入力内容を自動保存できません。');
  });

  // Subscribe to store updates
  store.subscribe(() => {
    render();
  });

  // Initial render
  render();
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = document.createElement('span');
  icon.textContent = '✓';
  const msg = document.createElement('span');
  msg.textContent = message;
  toast.appendChild(icon);
  toast.appendChild(msg);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2200);
}

function copyFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('クリップボードにコピーしました！');
  } catch (err) {
    showToast('コピーに失敗しました。');
  }
  document.body.removeChild(textarea);
}

document.addEventListener('DOMContentLoaded', initApp);
