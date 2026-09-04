/**
 * data.js - 公開してみよう。ツールのマスターデータ & テンプレート定義
 */

export const QUICK_TAGS = [
  { id: 'web-app', label: 'Webアプリ（HTML/CSS/JS）', type: 'web', desc: 'ブラウザで直接動くWebアプリ' },
  { id: 'python-cli', label: 'Pythonスクリプト・CLIツール', type: 'cli', desc: 'コマンドラインで実行するPythonツール' },
  { id: 'file-renamer', label: 'ファイル名一括変更ツール', type: 'utility', desc: '特定の命名規則でファイルを整理するツール' },
  { id: 'csv-analyzer', label: 'CSV/データ集計ツール', type: 'data', desc: '表データやログを集計・可視化するツール' },
  { id: 'business-tool', label: '業務効率化・定型作業ツール', type: 'business', desc: '日々の定型業務を自動化・短縮するツール' }
];

export const PRE_CHECK_ITEMS = [
  {
    category: '基本確認（動作・構成）',
    items: [
      { id: 'chk_works', text: '手元で実際にエラーなく動くことを確認した', required: true },
      { id: 'chk_files', text: '動かすために必要なファイル（HTML, JS, 画像, 依存一覧など）が揃っている', required: true },
      { id: 'chk_clean', text: '不要な一時ファイルやテスト用のゴミファイルを除外した', required: false }
    ]
  },
  {
    category: '文書確認（使い方・説明）',
    items: [
      { id: 'chk_readme', text: 'プロジェクト名や何をするツールかの説明がある（README.mdなど）', required: true },
      { id: 'chk_usage', text: '他の人が動かすための使い方や手順が書かれている', required: false },
      { id: 'chk_license', text: '公開用ライセンス（MIT Licenseなど）を決めている', required: false }
    ]
  },
  {
    category: 'セキュリティ・機密情報（最重要）',
    items: [
      { id: 'chk_no_apikey', text: 'APIキーやアクセストークンが含まれていない（ハードコードしていない）', required: true },
      { id: 'chk_no_pass', text: 'パスワードや秘密鍵などの認証情報が含まれていない', required: true },
      { id: 'chk_no_privacy', text: '個人情報や社内情報、自分専用のローカル絶対パスが含まれていない', required: true }
    ]
  }
];

export const TROUBLE_PROMPTS = [
  {
    id: 'gh-pages-404',
    title: 'GitHub Pagesで 404 Not Found になる',
    desc: '公開URLを開いても画面が表示されない場合の相談',
    getPrompt: (toolName) => `現在「${toolName || 'Webツール'}」をGitHub Pagesで公開しようとしていますが、公開URLにアクセスすると404エラー（Not Found）が表示されてしまいます。

【現在の状況】
- リポジトリ名: [リポジトリ名]
- ファイル構成: index.html が直下に [ある/ない]
- GitHub Pagesの「Settings > Pages」で Branch を [main / none] に設定済み

原因として考えられる点（index.htmlの配置、ブランチ設定、反映待ち時間など）と、確認・修正すべき手順を初心者向けに分かりやすく教えてください。`
  },
  {
    id: 'css-js-not-working',
    title: 'デザイン（CSS）やJSが正しく動かない',
    desc: '公開後にスタイルが崩れたりボタンが反応しない場合の相談',
    getPrompt: (toolName) => `「${toolName || 'Webツール'}」をGitHub Pagesで公開したところ、ローカルでは動いていたデザイン（CSS）や機能（JavaScript）が一部正常に動きません。

【現在の状況】
- HTMLからのCSS/JS読み込みパスの書き方: 例（./css/style.css または /css/style.css）
- ブラウザの開発者ツール（Console）でエラーが出ているか: [エラー内容または「まだ見ていない」]

GitHub Pagesで相対パスやキャッシュの問題が発生しやすい原因と、直すための確認ポイントを教えてください。`
  },
  {
    id: 'readme-update',
    title: 'READMEをよりわかりやすく書き直したい',
    desc: '公開後に説明文をブラッシュアップしたい場合の相談',
    getPrompt: (toolName) => `公開したツール「${toolName || '自作ツール'}」のREADME.mdを、初めて見る人でもひと目で魅力や使い方が伝わるように改善したいです。

【ツールの概要】
- ツール名: ${toolName || '自作ツール'}
- できること: [ツールの主な機能や特徴]
- 対象ユーザー: [どんな人に使ってほしいか]

GitHubで映える見出し構成、スクリーンショットの載せ方、使い方（Usage）の書き方を含むREADMEの修正案を作成してください。`
  },
  {
    id: 'security-audit',
    title: '公開前にコードの安全性をAIにチェックしてもらう',
    desc: '機密情報やAPIキーの漏洩がないかコード診断を依頼',
    getPrompt: (toolName) => `これから自作ツール「${toolName || 'ソフトウェア'}」をGitHubで一般公開（Public）しようとしています。
公開前にセキュリティ上のリスク（APIキー、パスワード、個人情報、非公開情報などのハードコード）がないか確認したいです。

【確認してほしいファイル】
- [ファイル名やコードをここに貼り付け]

公開して問題ないか、隠すべき情報（環境変数化など）がないかをチェックし、安全に公開するためのアドバイスをください。`
  }
];
