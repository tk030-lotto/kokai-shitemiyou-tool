window.KokaiApp = window.KokaiApp || {};

/**
 * state.js - アプリケーション状態管理
 */

const STORAGE_KEY = 'kokai_tool_state_v1';

const initialState = {
  currentStep: 0,
  toolName: '',
  toolType: 'web', // 'web' | 'cli' | 'data' | 'utility' | 'business' | 'other'
  toolDescription: '',
  hasGithubAccount: true,
  repoName: '',
  checks: {}, // { [checkId: string]: boolean }
};

class StateManager {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const merged = { ...initialState, ...JSON.parse(saved) };
        merged.currentStep = Math.max(0, Math.min(8, Number(merged.currentStep) || 0));
        return merged;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return { ...initialState };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    this.notify();
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

  updateToolInfo(name, type, desc = '') {
    this.state.toolName = name;
    this.state.toolType = type;
    if (desc !== undefined) this.state.toolDescription = desc;
    if (!this.state.repoName && name) {
      // 簡易ローマ字/英語化候補
      this.state.repoName = this.suggestRepoName(name);
    }
    this.saveState();
  }

  setCheck(checkId, isChecked) {
    this.state.checks[checkId] = isChecked;
    this.saveState();
  }

  setGithubAccountStatus(hasAccount) {
    this.state.hasGithubAccount = hasAccount;
    this.saveState();
  }

  setRepoName(repoName) {
    this.state.repoName = repoName;
    this.saveState();
  }

  resetAll() {
    this.state = { ...initialState };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('LocalStorage remove failed:', e);
    }
    this.notify();
  }

  suggestRepoName(name) {
    const sanitized = name
      .trim()
      .toLowerCase()
      .replace(/[\s_　]+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return sanitized || 'my-awesome-tool';
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

const store = new StateManager();

window.KokaiApp.StateManager = StateManager;
window.KokaiApp.store = store;

