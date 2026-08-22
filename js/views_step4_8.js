/**
 * views_step4_8.js - Step 4 〜 Step 8 のUIレンダラー
 */

import { TROUBLE_PROMPTS } from './data.js';
import { generateReadme, generateAiReadmePrompt, generateMitLicense } from './generator.js';

export function renderStep4(state) {
  const suggestedRepo = state.repoName || 'my-tool';

  return `
    <div class="step-card">
      <div class="step-tag">Step 4 / 保管庫の作成</div>
      <h2 class="step-title">GitHubでリポジトリを作成する</h2>
      <p class="step-desc">
        リポジトリ（Repository）とは、ソフトウェアのファイルを保管・公開するフォルダのようなものです。
      </p>

      <div class="form-group">
        <label class="form-label" for="input-repo-name">リポジトリ名の候補（英数字・ハイフン）</label>
        <input type="text" id="input-repo-name" class="form-input" value="${suggestedRepo}">
        <p style="font-size: 0.8rem; color: var(--text-dim); margin-top: 4px;">
          ※ GitHub上では日本語ではなく半角英数字（小文字・ハイフン区切り）が推奨されます。
        </p>
      </div>

      <div class="guide-box">
        <h4>リポジトリ作成の手順</h4>
        <ol>
          <li><a href="https://github.com/new" target="_blank" rel="noopener" style="color: var(--primary); font-weight: bold;">GitHub New Repository 画面</a> を開きます。</li>
          <li><strong>Repository name</strong> に <code>${suggestedRepo}</code> を入力します。</li>
          <li>公開設定で <strong>Public</strong>（誰でも見られる公開設定）を選択します。</li>
          <li><strong>「Add a README file」にチェックを入れずに</strong>（または入れても可）一番下の <strong>［Create repository］</strong> ボタンを押します。</li>
        </ol>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：ファイル登録 ➔</button>
      </div>
    </div>
  `;
}

export function renderStep5() {
  return `
    <div class="step-card">
      <div class="step-tag">Step 5 / ファイルの登録</div>
      <h2 class="step-title">ファイルをGitHubに登録する</h2>
      <p class="step-desc">
        Gitコマンドを使わなくても、ブラウザ上からドラッグ＆ドロップで簡単にファイルを登録できます。
      </p>

      <div class="guide-box">
        <h4>ブラウザからの簡単アップロード手順</h4>
        <ol>
          <li>作成したリポジトリのトップ画面を開きます。</li>
          <li>画面右上または中央にある <strong>［uploading an existing file］</strong>（または <strong>［Add file］➔［Upload files］</strong>）をクリックします。</li>
          <li>公開したいファイル群（<code>index.html</code>, <code>style.css</code>, <code>app.js</code> 等）を画面の点線枠内にドラッグ＆ドロップします。</li>
          <li>一番下の <strong>［Commit changes］</strong>（緑色のボタン）を押して保存します。</li>
        </ol>
      </div>

      <div class="guide-box" style="border-left-color: var(--accent-cyan);">
        <h4>💡 Webアプリの場合のポイント</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);">
          GitHub Pagesで公開する場合、メインのHTMLファイル名は必ず <strong><code>index.html</code></strong> になっている必要があります。
        </p>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：READMEとライセンス ➔</button>
      </div>
    </div>
  `;
}

export function renderStep6(state) {
  const readmeText = generateReadme(state.toolName, state.toolType, state.toolDescription);
  const aiPrompt = generateAiReadmePrompt(state.toolName, state.toolType, state.toolDescription);
  const mitLicense = generateMitLicense();

  return `
    <div class="step-card">
      <div class="step-tag">Step 6 / ドキュメントとライセンス</div>
      <h2 class="step-title">READMEとライセンスの整備</h2>
      <p class="step-desc">
        README.mdがあると、訪れた人が「何のツールか」「どう使うのか」をすぐに理解できます。
      </p>

      <div class="guide-box">
        <h4>自動生成された README.md テンプレート</h4>
        <div class="code-container">
          <div class="code-header">
            <span>README.md</span>
            <button class="btn-copy" data-copy-text="${encodeURIComponent(readmeText)}">READMEをコピー</button>
          </div>
          <div class="code-content">${escapeHtml(readmeText)}</div>
        </div>
      </div>

      <div class="guide-box" style="margin-top: 16px;">
        <h4>AIにさらに詳しいREADMEを作ってもらう場合</h4>
        <div class="code-container">
          <div class="code-header">
            <span>AI相談用プロンプト</span>
            <button class="btn-copy" data-copy-text="${encodeURIComponent(aiPrompt)}">プロンプトをコピー</button>
          </div>
          <div class="code-content">${escapeHtml(aiPrompt)}</div>
        </div>
      </div>

      <div class="guide-box" style="margin-top: 16px;">
        <h4>ライセンス（MIT License）</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">
          自由に使ってもらいたい場合は、世界で最も標準的なMITライセンスを設定するのがおすすめです。
        </p>
        <div class="code-container">
          <div class="code-header">
            <span>LICENSE (MIT)</span>
            <button class="btn-copy" data-copy-text="${encodeURIComponent(mitLicense)}">LICENSEをコピー</button>
          </div>
          <div class="code-content">${escapeHtml(mitLicense)}</div>
        </div>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：GitHub Pagesで公開 ➔</button>
      </div>
    </div>
  `;
}

export function renderStep7(state) {
  return `
    <div class="step-card">
      <div class="step-tag">Step 7 / Webアプリの公開</div>
      <h2 class="step-title">GitHub Pagesで世界に公開する</h2>
      <p class="step-desc">
        HTML/CSS/JavaScriptで作られたWebツールの場合は、GitHub Pages機能を使って無料で誰でもアクセスできるURLを発行できます。
      </p>

      <div class="guide-box">
        <h4>GitHub Pages 有効化の手順</h4>
        <ol>
          <li>リポジトリ画面の上部メニューから <strong>［Settings］</strong>（歯車アイコン）をクリックします。</li>
          <li>左サイドバーの「Code and automation」内にある <strong>［Pages］</strong> をクリックします。</li>
          <li>「Build and deployment」の <strong>Branch</strong> 設定で、<code>None</code> から <strong><code>main</code></strong>（または <code>master</code>）を選択し、フォルダは <code>/ (root)</code> のまま <strong>［Save］</strong> をクリックします。</li>
          <li>数分待つと、画面上部に <strong>「Your site is live at https://...」</strong> という公開URLが表示されます！</li>
        </ol>
      </div>

      <div class="guide-box" style="border-left-color: var(--success);">
        <h4>🎉 公開URLの形式</h4>
        <p style="font-family: var(--font-mono); font-size: 0.9rem; color: #ffffff;">
          https://&lt;あなたのユーザー名&gt;.github.io/${state.repoName || '&lt;リポジトリ名&gt;'}/
        </p>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">戻る</button>
        <button class="btn btn-primary" id="btn-next">次へ：公開後の確認 & 完了 ➔</button>
      </div>
    </div>
  `;
}

export function renderStep8(state) {
  const promptsHtml = TROUBLE_PROMPTS.map(item => {
    const promptText = item.getPrompt(state.toolName);
    return `
      <div class="guide-box" style="margin-bottom: 16px;">
        <h4>${item.title}</h4>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px;">${item.desc}</p>
        <div class="code-container">
          <div class="code-header">
            <span>AIへの質問文</span>
            <button class="btn-copy" data-copy-text="${encodeURIComponent(promptText)}">質問文をコピー</button>
          </div>
          <div class="code-content">${escapeHtml(promptText)}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="step-card">
      <div class="step-tag" style="color: var(--success);">Step 8 / 完了 & サポート</div>
      <h2 class="step-title">🎉 公開おめでとうございます！</h2>
      <p class="step-desc">
        あなたの作ったツールが世界に届きました。<br>
        公開URLにアクセスして、ブラウザで正しく動くか確認してみましょう。
      </p>

      <div class="guide-box" style="border-left-color: var(--success); margin-bottom: 24px;">
        <h4>公開後の最終チェック</h4>
        <ul>
          <li>スマホやPCのブラウザで公開URLを開いて表示されるか</li>
          <li>ボタンや入力欄などのJavaScript機能がエラーなく動作するか</li>
          <li>画像やアイコンなどのリンク切れがないか</li>
        </ul>
      </div>

      <h3 style="font-size: 1.1rem; margin-bottom: 12px; color: #ffffff;">🤔 うまく動かない・困ったときのAI相談質問文</h3>
      <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">
        もし公開後にエラーが出たり修正したい点がある場合は、以下の質問文をAIにコピー＆ペーストして相談してみましょう。
      </p>

      ${promptsHtml}

      <div class="btn-group">
        <button class="btn btn-secondary" id="btn-prev">前のステップへ</button>
        <button class="btn btn-primary" id="btn-finish">最初に戻る</button>
      </div>
    </div>
  `;
}

export function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
