window.KokaiApp = window.KokaiApp || {};

/**
 * views_step0_3.js - Step 0 〜 Step 3 のUIレンダラー
 */

function renderStep0() {
  return `
    <div class="step-card">
      <div class="step-tag">Step 0 / はじめに</div>
      <h2 class="step-title">公開してみよう。</h2>
      <p class="step-desc">
        AIを使って作ったソフトウェア、動いたならぜひ世界に見せてみませんか？<br>
        Gitやコマンドの知識がなくても大丈夫。Webブラウザから順番に進めていくだけで、あなたの作品をGitHubやGitHub Pagesで安全に公開できます。
      </p>

      <div class="guide-box">
        <h4>✨ このツールでできること</h4>
        <ul>
          <li>公開前の安全・品質セルフチェック（機密情報の漏洩防止）</li>
          <li>GitHubアカウントの準備とリポジトリの作成手順案内</li>
          <li>ブラウザからのドラッグ＆ドロップによる簡単ファイル登録</li>
          <li>見栄えの良い <code>README.md</code> の自動生成</li>
          <li>Webアプリの GitHub Pages 無料公開手順</li>
        </ul>
      </div>

      <div class="btn-group">
        <button class="btn btn-primary" id="btn-start">
          <span>🚀 公開ガイドを始める</span>
        </button>
      </div>
    </div>
  `;
}

function renderStep1(state) {
  const quickTags = window.KokaiApp.QUICK_TAGS || [];
  const escapeHtml = window.KokaiApp.escapeHtml || ((s) => s);

  const quickTagsHtml = quickTags.map(tag => `
    <button type="button" class="quick-tag-btn ${state.toolType === tag.type ? 'active' : ''}" data-tag-type="${tag.type}" data-tag-label="${tag.label}" aria-pressed="${state.toolType === tag.type ? 'true' : 'false'}">
      ${tag.label}
    </button>
  `).join('');

  return `
    <div class="step-card">
      <div class="step-tag">Step 1 / 対象の選択</div>
      <h2 class="step-title">何を公開しますか？</h2>
      <p class="step-desc">
        今回公開したいツールやソフトウェアについて教えてください。入力内容は後ほどREADMEやAI質問文の生成に活用されます。
      </p>

      <div class="form-group">
        <label class="form-label" for="input-tool-name">ソフトウェア名 / ツール名</label>
        <input type="text" id="input-tool-name" class="form-input" placeholder="例: ファイル名一括変更ツール、便利カレンダーWeb" value="${escapeHtml(state.toolName)}">
      </div>

      <div class="form-group">
        <label class="form-label">クイック選択（または一番近い種類を選択）</label>
        <div class="quick-tags-container">
          ${quickTagsHtml}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="input-tool-desc">どんなツールですか？（簡単な説明）</label>
        <textarea id="input-tool-desc" class="form-textarea" placeholder="例: 選択したフォルダ内の連番ファイルを指定した名前に一括リネームできるWebツールです。">${escapeHtml(state.toolDescription)}</textarea>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：公開前チェック ➔</button>
      </div>
    </div>
  `;
}

function renderStep2(state) {
  const preCheckItems = window.KokaiApp.PRE_CHECK_ITEMS || [];
  const troublePrompts = window.KokaiApp.TROUBLE_PROMPTS || [];
  const escapeHtml = window.KokaiApp.escapeHtml || ((s) => s);

  let checklistHtml = '';
  preCheckItems.forEach(cat => {
    checklistHtml += `<div class="checklist-category"><div class="category-title">${cat.category}</div>`;
    cat.items.forEach(item => {
      const isChecked = !!state.checks[item.id];
      checklistHtml += `
        <label class="checklist-item ${isChecked ? 'checked' : ''}">
          <input type="checkbox" class="checklist-checkbox" data-check-id="${item.id}" ${isChecked ? 'checked' : ''}>
          <span class="checklist-label">
            ${item.text}
            ${item.required ? '<span class="badge-required">必須</span>' : ''}
          </span>
        </label>
      `;
    });
    checklistHtml += `</div>`;
  });

  const securityPromptObj = troublePrompts.find(p => p.id === 'security-audit');
  const securityPrompt = securityPromptObj ? securityPromptObj.getPrompt(state.toolName) : '';

  return `
    <div class="step-card">
      <div class="step-tag">Step 2 / 安全・品質確認</div>
      <h2 class="step-title">公開前チェック</h2>
      <p class="step-desc">
        一度公開すると世界中からアクセスできるようになります。特にAPIキーやパスワードなどの機密情報が含まれていないか必ず確認しましょう。
      </p>

      ${checklistHtml}

      <div class="guide-box" style="margin-top: 20px;">
        <h4>💡 不安な場合はAIにコードを診断してもらおう</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
          以下のプロンプトをコピーして、お使いのAI（Claude, ChatGPTなど）にコードを貼り付けて確認してもらうと安心です。
        </p>
        <div class="code-container">
          <div class="code-header">
            <span>AIセキュリティ診断用プロンプト</span>
            <button class="btn-copy" data-copy-text="${encodeURIComponent(securityPrompt)}">コピー</button>
          </div>
          <div class="code-content">${escapeHtml(securityPrompt)}</div>
        </div>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：GitHubの準備 ➔</button>
      </div>
    </div>
  `;
}

function renderStep3(state) {
  return `
    <div class="step-card">
      <div class="step-tag">Step 3 / アカウント準備</div>
      <h2 class="step-title">GitHubの準備</h2>
      <p class="step-desc">
        ソフトウェアを公開するには、無料のGitHubアカウントが必要です。
      </p>

      <div class="guide-box">
        <h4>アカウントをお持ちですか？</h4>
        <div style="display: flex; gap: 12px; margin-top: 12px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="github_acc" value="yes" ${state.hasGithubAccount ? 'checked' : ''}> すでに持っている
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
            <input type="radio" name="github_acc" value="no" ${!state.hasGithubAccount ? 'checked' : ''}> まだ持っていない
          </label>
        </div>
      </div>

      ${!state.hasGithubAccount ? `
        <div class="guide-box" style="border-left-color: var(--accent-cyan);">
          <h4>新規登録の手順（無料）</h4>
          <ol>
            <li><a href="https://github.com/signup" target="_blank" rel="noopener" style="color: var(--accent-cyan); font-weight: bold;">GitHub サインアップ画面（外部サイト）</a> を開きます。</li>
            <li>メールアドレス、パスワード、ユーザー名を入力します。</li>
            <li>届いた認証コードを入力してアカウント作成を完了させます。</li>
          </ol>
        </div>
      ` : `
        <div class="guide-box" style="border-left-color: var(--success);">
          <h4>準備完了！</h4>
          <p style="font-size: 0.9rem; color: var(--text-muted);">
            <a href="https://github.com" target="_blank" rel="noopener" style="color: var(--success); font-weight: bold;">GitHub.com</a> にログインした状態で次のステップへ進みましょう。
          </p>
        </div>
      `}

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：リポジトリの作成 ➔</button>
      </div>
    </div>
  `;
}

window.KokaiApp.renderStep0 = renderStep0;
window.KokaiApp.renderStep1 = renderStep1;
window.KokaiApp.renderStep2 = renderStep2;
window.KokaiApp.renderStep3 = renderStep3;

