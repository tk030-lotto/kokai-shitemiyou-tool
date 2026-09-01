window.KokaiApp = window.KokaiApp || {};

/**
 * views.js - UIレンダラー一覧の管理
 */
window.KokaiApp.getStepRenderers = function() {
  const app = window.KokaiApp;
  return [
    app.renderStep0,
    app.renderStep1,
    app.renderStep2,
    app.renderStep3,
    app.renderStep4,
    app.renderStep5,
    app.renderStep6,
    app.renderStep7,
    app.renderStep8
  ];
};

