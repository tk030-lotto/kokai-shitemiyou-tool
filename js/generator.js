/**
 * generator.js - README & AIプロンプト自動生成ロジック
 */

/**
 * 入力されたソフトウェア情報から標準README.mdを生成
 */
export function generateReadme(toolName, toolType, toolDescription = '', authorName = '') {
  const name = (toolName || '').trim() || '[ツール名]';
  const desc = (toolDescription || '').trim() || '[ここにツールの概要や用途を記入してください]';
  const holder = (authorName || '').trim() || '[著作権者名]';
  const year = new Date().getFullYear();

  let usageSection = '';
  if (toolType === 'web') {
    usageSection = `## 🚀 使い方

1. 公開URLにアクセスします。
2. 画面の案内に従って操作してください。`;
  } else if (toolType === 'cli' || toolType === 'utility' || toolType === 'data') {
    usageSection = `## 🚀 使い方

\`\`\`bash
# リポジトリをクローン
git clone https://github.com/[ユーザー名]/[リポジトリ名].git

# ディレクトリへ移動
cd [リポジトリ名]

# 実行
python main.py
\`\`\``;
  } else {
    usageSection = `## 🚀 使い方

1. ファイルをダウンロードまたはクローンします。
2. お手元の環境で起動・実行してください。`;
  }

  return `# ${name}

${desc}

---

${usageSection}

---

## 🛠️ 開発環境 / 技術スタック

- 言語・環境: ${toolType === 'web' ? 'HTML5, CSS3, JavaScript' : toolType === 'cli' ? 'Python 3.x' : 'Web / Script'}
- 公開プラットフォーム: GitHub ${toolType === 'web' ? '/ GitHub Pages' : ''}

---

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) のもとで公開されています。
Copyright (c) ${year} ${holder}
`;
}

/**
 * AIにREADMEの作成を依頼するためのプロンプトを生成
 */
export function generateAiReadmePrompt(toolName, toolType, toolDescription = '') {
  const trimmedName = (toolName || '').trim();
  const trimmedDesc = (toolDescription || '').trim();

  return `自作のソフトウェア「${trimmedName || '[ツール名]'}」をGitHubで公開するための、分かりやすい \`README.md\` を作成してください。

【ツールの概要】
- ツール名: ${trimmedName || '[未入力: ツール名を記入してください]'}
- 種類: ${toolType === 'web' ? 'ブラウザで動くWebアプリ' : toolType === 'cli' ? 'Python等のスクリプト/CLIツール' : 'ソフトウェア / ツール'}
- 特徴・目的: ${trimmedDesc || '[未入力: ツールの用途や特徴を記入してください]'}

【READMEに含めてほしい項目】
1. タイトルとツールの概要
2. 主な機能（箇条書き）
3. 使い方（ステップ形式またはコードブロック）
4. 動作環境 / 技術スタック
5. ライセンス表記（例: MIT License）

GitHubで読みやすく、初めて見る人にも用途が伝わるようにMarkdown形式で出力してください。`;
}

/**
 * MITライセンス全文を生成
 */
export function generateMitLicense(authorName = '') {
  const year = new Date().getFullYear();
  const holder = (authorName || '').trim() || '[著作権者名]';
  return `MIT License

Copyright (c) ${year} ${holder}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
}
