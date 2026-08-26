# コードレビュー報告書（CODE_REVIEW_REPORT.md）

**対象プロジェクト**: 公開してみよう。ツール
**実施日**: 2026-08-26
**レビュー方式**: 全ソースコード静的精査（閲覧専用・変更なし）
**総合受入判定**: **REQUIRES FIX（要修正）※影響は限定的。仕様充足（仕様書第21条）は維持**

---

## 1. レビュー概要

### 対象ファイル（全11ファイル）

| ファイル | 行数 | 責務 |
|---|---:|---|
| `index.html` | 61 | アプリシェル・プログレス・トースト容器 |
| `js/app.js` | 209 | イベント制御・描画オーケストレーション |
| `js/state.js` | 118 | 状態管理・LocalStorage永続化 |
| `js/data.js` | 91 | クイックタグ・チェックリスト・AIプロンプト定義 |
| `js/generator.js` | 119 | README/AIプロンプト/MITライセンス生成 |
| `js/views.js` | 20 | ビューエクスポート統合 |
| `js/views_step0_3.js` | 176 | Step 0〜3 レンダラー |
| `js/views_step4_8.js` | 240 | Step 4〜8 レンダラー＋escapeHtml |
| `css/base.css` | 143 | デザイントークン・基本レイアウト |
| `css/components.css` | 284 | コンポーネント样式 |
| `css/style.css` | 2 | @import 統合 |

### レビュー観点

バグ / セキュリティ / コード品質・アーキテクチャ / UI・UX・アクセシビリティ / ドキュメント整合性

---

## 2. 検出事項一覧

| No | 分類 | 重要度 | 箇所 | 内容 |
|---|---|---|---|---|
| B1 | 🐛 バグ | **高** | `js/app.js:58` | 状態変更のたびに全再描画＋`scrollTo(0)`が走り、チェックリスト操作のたびにページ最上部へ強制スクロール＆フォーカス喪失 |
| B2 | 🐛 バグ | 中 | `js/state.js:64` | `if (desc)` ガードのため、ツール説明を一度入力すると空に戻せない |
| B3 | 🐛 バグ | 中 | `js/app.js:90-100` | Step1で説明文を入力中にクイックタグを押すと、未保存の説明文が消失する |
| B4 | 🐛 バグ | 低 | `js/state.js:27` | localStorage復元時に `currentStep` の範囲チェックがなく、改竄・破損時に「ステップ 999 / 8」等の異常表示になり得る |
| S1 | 🔒 セキュリティ | **中** | `views_step0_3.js:55,67`、`views_step4_8.js:21,31,158` | `state.toolName` / `toolDescription` / `repoName` が escapeHtml 未適用でHTML挿入（自己XSS）。AUDIT_REPORTの「エスケープ徹底」と矛盾 |
| S2 | 🔒 セキュリティ | 低 | `js/app.js:180` | `showToast` が `innerHTML` 使用（現行呼び出しは静的文字列のみ。防御的修正推奨） |
| S3 | 🔒 セキュリティ | 低 | `js/app.js:107` | 非セキュアコンテキストで `navigator.clipboard` が `undefined` の場合、同期例外となり `.catch` で拾えない |
| I1 | 💡 改善候補 | 低 | `views_step0_3.js:97` | `TROUBLE_PROMPTS.find(...)` の戻り値が `undefined` の場合にクラッシュ（nullガードなし） |
| I2 | 💡 改善候補 | 低 | `js/state.js:97-104` | `suggestRepoName` が連続ハイフン・先頭/末尾ハイフンを正規化しない |
| I3 | 💡 改善候補 | 低 | `views_step4_8.js:82` | `generateMitLicense()` が著者名なしで呼ばれ、生成LICENSEが `Copyright (c) 2026 Your Name` のままになる |
| I4 | ♿ a11y | 低 | 各所 | トーストに `role="status"` なし、クイックタグに `aria-pressed` なし、画面遷移後のフォーカス管理なし |
| I5 | ♿ a11y | 低 | css | アニメーションに `prefers-reduced-motion` 配慮なし |
| I6 | 💡 改善候補 | 低 | `index.html` | favicon未定義（GitHub Pagesで404ノイズ）／Google Fonts外部依存はオフライン時フォールバックあり |

---

## 3. 主要指摘の詳細と修正案

### 【B1・最重要】チェック操作のたびにページTopへスクロールする

**現象**: `store.setCheck()` → `notify()` → `render()` → 毎回 `window.scrollTo({ top: 0 })` が実行される。Step 2 のチェックリスト（9項目）で下段の項目にチェックを入れると即座にページ最上部へ飛ばされ、さらに `innerHTML` 全面貼り直しによりクリックしたチェックボックスのフォーカスも失われる。

**修正案（最小差分）**: スクロールを「ステップ切替時のみ」に限定する。

```js
// app.js
let lastRenderedStep = null;

function render() {
  const state = store.getState();
  const stepChanged = state.currentStep !== lastRenderedStep;

  // （中略：描画・プログレス更新）

  if (stepChanged) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  lastRenderedStep = state.currentStep;
}
```

**より完全な対応**: チェックボックスはビュー側で既に `classList.toggle('checked')` を手動実行しているため、`setCheck` / `setGithubAccountStatus` を通知なしの永続化（`persist()`＝saveStateからnotifyを分離）に変更し、再描画自体をスキップするのが理想的。

### 【B2】説明文をクリアできない

```js
// state.js 64行目（現状）
if (desc) this.state.toolDescription = desc;   // 空文字が常に無視される

// 修正案
if (desc !== undefined) this.state.toolDescription = desc;
```

### 【B3】クイックタグ押下で入力中の説明文が消える

`app.js` のクイックタグハンドラは説明テキストエリアを同期せずに `updateToolInfo`（＝再描画）を呼ぶため、DOM上のみに存在する未保存入力が破棄される。ハンドラ冒頭で `syncCurrentInputs()` を呼ぶことで防止できる（B2修正とセットで必要）。

### 【B4】localStorage復元時の currentStep 範囲チェック

```js
// state.js loadState 修正案
const merged = { ...initialState, ...JSON.parse(saved) };
merged.currentStep = Math.max(0, Math.min(8, Number(merged.currentStep) || 0));
return merged;
```

### 【S1】escapeHtml 未適用箇所（監査レポートとの矛盾）

該当箇所：

* `views_step0_3.js:55` … `value="${state.toolName}"`
* `views_step0_3.js:67` … `<textarea ...>${state.toolDescription}</textarea>`
* `views_step4_8.js:21,31` … `value="${suggestedRepo}"` および手順文中の `${suggestedRepo}`
* `views_step4_8.js:158` … `${state.repoName || '&lt;リポジトリ名&gt;'}`

入力者が本人自身であるため影響は「自己XSS」に留まるが、本ツール自身が「機密情報チェック」を謳う以上、見本として是正すべき。`AUDIT_REPORT.md:95` の「XSS対策: escapeHtmlを徹底」と実コードに乖離がある。修正は `views_step0_3.js`（import済みの `escapeHtml` を適用）と `views_step4_8.js` の該当5箇所への適用のみ。

```html
<!-- 修正例 -->
<input ... value="${escapeHtml(state.toolName)}">
<textarea ...>${escapeHtml(state.toolDescription)}</textarea>
```

### 【S2】showToast の innerHTML

現行の呼び出しはすべて固定文字列のため実害はないが、将来のメッセージ動的化時に注入経路となる。

```js
// 修正案
const icon = document.createElement('span');
icon.textContent = '✓';
const msg = document.createElement('span');
msg.textContent = message;
toast.append(icon, msg);
```

### 【S3】クリップボードAPIの安全な呼び出し

```js
// 修正案
if (navigator.clipboard && window.isSecureContext) {
  navigator.clipboard.writeText(textToCopy)
    .then(() => showToast('クリップボードにコピーしました！'))
    .catch(() => copyFallback(textToCopy));
} else {
  copyFallback(textToCopy);
}
```

---

## 4. 良い点（維持推奨）

* **責務分離**: data / state / generator / views / app の分割が明確で、全ファイル300行ルール順守（プロトコル第17条）
* **Zero-Dependency**: フレームワーク・CDNライブラリ完全排除（第16条準拠）
* **`data-copy-text` を `encodeURIComponent` 経由で属性へ格納する設計**: 属性ブレイクを構造的に回避しており秀逸
* **LocalStorage の try/catch 網羅**と `STORAGE_KEY`（`kokai_tool_state_v1`）のバージョン付き命名
* **仕様書との適合**: 第18条「実装しない機能」（API連携・自動アップロード等）を正しく遵守し、完成条件13項目に対応するフロー（Step 0〜8）を実装
* CSS変数によるデザインシステム統一（第18条準拠）、モバイル対応（640px ブレークポイント、`column-reverse` で主ボタンを親指側へ配置する配慮）

---

## 5. ドキュメント整合性

* `AUDIT_REPORT.md` は「escapeHtml徹底」（95行目）の他、行数記載にも小さなズレがある（例：`views_step4_8.js` 実質240行 vs 記載230行）。監査時点からのコード変化または検証漏れの疑いがあり、修正適用後に監査レポートの更新（証跡：該当ファイル・行番号付き）を推奨する。
* `README.md` / `仕様書.md` / `LICENSE` 間の矛盾は確認されなかった。

---

## 6. 今後の推奨アクション（優先度順）

1. **B1対応**（UX直接被害・最重要）： スクロール条件のステップ切替限定化
2. **B2・B3対応**（入力データ消失）： descガード修正＋クイックタグ時の入力同期
3. **S1対応**（監査記録との整合・防衛的堅牢化）： escapeHtml 未適用5箇所への適用
4. **B4・S2・S3対応**（低コスト堅牢化）
5. 改善候補 I1〜I6（任意・次回機能修正時の併施を推奨）

---

## 7. 総括

アーキテクチャ設計・仕様遵守・依存ゼロ構成は高水準。一方で、**状態変更ごとの全面再描画に起因するUIバグ（B1〜B3）**と、**エスケープ適用漏れ（S1）およびそれを「徹底」と記載した監査レポートの乖離**が今回の主要な指摘事項。いずれも小規模な差分修正で解消可能であり、修正後は即時公開可能な品質に達すると評価する。

