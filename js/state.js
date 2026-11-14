/**
 * state.js - アプリケーション状態管理
 */

const STORAGE_KEY = 'kokai_tool_state_v1';

const initialState = {
  currentStep: 0,
  toolName: '',
  toolType: 'web', // 'web' | 'cli' | 'data' | 'utility' | 'business' | 'other'
  toolDescription: '',
  authorName: '',
  hasGithubAccount: true,
  repoName: '',
  checks: {}, // { [checkId: string]: boolean }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
    this.saveErrorListeners = [];
    this.hasNotifiedSaveError = false;
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = { ...initialState, ...parsed };
        merged.currentStep = Math.max(0, Math.min(8, Number(merged.currentStep) || 0));
        merged.toolName = typeof merged.toolName === 'string' ? merged.toolName : '';
        merged.toolDescription = typeof merged.toolDescription === 'string' ? merged.toolDescription : '';
        merged.authorName = typeof merged.authorName === 'string' ? merged.authorName : '';
        merged.repoName = typeof merged.repoName === 'string' ? merged.repoName : '';
        merged.checks = merged.checks && typeof merged.checks === 'object' ? { ...merged.checks } : {};
        return merged;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return { ...initialState, checks: {} };
  }

  saveState({ notify = true } = {}) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      this.hasNotifiedSaveError = false;
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
      if (!this.hasNotifiedSaveError) {
        this.hasNotifiedSaveError = true;
        this.saveErrorListeners.forEach(listener => listener(e));
      }
    }
    if (notify) {
      this.notify();
    }
  }

  onSaveError(listener) {
    this.saveErrorListeners.push(listener);
    return () => {
      this.saveErrorListeners = this.saveErrorListeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  setStep(step) {
    this.state.currentStep = Math.max(0, Math.min(8, step));
    this.saveState();
  }

  nextStep() {
    this.setStep(this.state.currentStep + 1);
  }

  prevStep() {
    this.setStep(this.state.currentStep - 1);
  }

  updateToolInfo(name, type, desc = '', authorName = undefined, { notify = true, autoSuggestRepo = true } = {}) {
    this.state.toolName = name;
    this.state.toolType = type;
    if (desc !== undefined) this.state.toolDescription = desc;
    if (authorName !== undefined) this.state.authorName = authorName;
    if (autoSuggestRepo && !this.state.repoName && name) {
      this.state.repoName = this.suggestRepoName(name);
    }
    this.saveState({ notify });
  }

  setCheck(checkId, isChecked) {
    this.state.checks[checkId] = isChecked;
    this.saveState({ notify: false });
  }

  setGithubAccountStatus(hasAccount) {
    this.state.hasGithubAccount = hasAccount;
    this.saveState();
  }

  setRepoName(repoName, { notify = true } = {}) {
    this.state.repoName = repoName;
    this.saveState({ notify });
  }

  resetAll() {
    this.state = { ...initialState, checks: {} };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
    this.notify();
  }

  suggestRepoName(name) {
    if (!name) return '';
    return name
      .trim()
      .toLowerCase()
      .replace(/[\s_　]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const store = new StateManager();
