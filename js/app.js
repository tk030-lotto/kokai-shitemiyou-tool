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

function initApp() {
  const container = document.getElementById('step-container');
  const progressSection = document.getElementById('progress-section');
  const progressLabel = document.getElementById('progress-step-label');
  const progressPercent = document.getElementById('progress-percent');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const globalResetBtn = document.getElementById('btn-global-reset');

  let lastRenderedStep = null;

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
      store.nextStep();
      return;
    }

    // Next button
    if (e.target.closest('#btn-next')) {
      syncCurrentInputs();
      store.nextStep();
      return;
    }

    // Prev button
    if (e.target.closest('#btn-prev')) {
      syncCurrentInputs();
      store.prevStep();
      return;
    }

    // Finish button
    if (e.target.closest('#btn-finish')) {
      store.setStep(0);
      return;
    }

    // Quick tag button
    const tagBtn = e.target.closest('.quick-tag-btn');
    if (tagBtn) {
      syncCurrentInputs();
      const type = tagBtn.dataset.tagType;
      const label = tagBtn.dataset.tagLabel;
      const nameInput = document.getElementById('input-tool-name');
      const descInput = document.getElementById('input-tool-desc');
      const currentDesc = descInput ? descInput.value : store.getState().toolDescription;
      let finalName = nameInput ? nameInput.value : '';
      if (!finalName.trim()) {
        finalName = label;
      }
      store.updateToolInfo(finalName, type, currentDesc);
      return;
    }

    // Copy button
    const copyBtn = e.target.closest('.btn-copy');
    if (copyBtn) {
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

  // Checkbox change
  container.addEventListener('change', (e) => {
    if (e.target.classList.contains('checklist-checkbox')) {
      const checkId = e.target.dataset.checkId;
      const isChecked = e.target.checked;
      store.setCheck(checkId, isChecked);
      const parentLabel = e.target.closest('.checklist-item');
      if (parentLabel) {
        parentLabel.classList.toggle('checked', isChecked);
      }
    }

    if (e.target.name === 'github_acc') {
      store.setGithubAccountStatus(e.target.value === 'yes');
    }
  });

  // Input change sync
  function syncCurrentInputs() {
    const nameInput = document.getElementById('input-tool-name');
    const descInput = document.getElementById('input-tool-desc');
    const repoInput = document.getElementById('input-repo-name');

    if (nameInput || descInput) {
      const state = store.getState();
      store.updateToolInfo(
        nameInput ? nameInput.value : state.toolName,
        state.toolType,
        descInput ? descInput.value : state.toolDescription
      );
    }

    if (repoInput) {
      store.setRepoName(repoInput.value.trim());
    }
  }

  // Global reset
  if (globalResetBtn) {
    globalResetBtn.addEventListener('click', () => {
      if (confirm('入力内容と進捗を初期化して最初に戻りますか？')) {
        store.resetAll();
        showToast('リセットしました。');
      }
    });
  }

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
