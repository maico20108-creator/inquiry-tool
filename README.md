# EC問い合わせ一元管理ツール

楽天市場・Yahoo!ショッピング・Amazon・Qoo10の問い合わせを1画面で管理できる社内業務ツールです。

---

## セットアップ手順

### 1. 前提条件のインストール

- [Node.js 18以上](https://nodejs.org/)
- [PostgreSQL 14以上](https://www.postgresql.org/download/)

### 2. リポジトリの準備

```bash
# このフォルダをVSCodeなどで開く
cd inquiry-tool
```

### 3. 依存パッケージのインストール

```bash
npm install
```

### 4. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を開いて以下を設定してください：

```env
# PostgreSQLの接続情報（自分の環境に合わせて変更）
DATABASE_URL="postgresql://postgres:あなたのパスワード@localhost:5432/inquiry_tool"

# NextAuthのシークレットキー（何でもOK）
NEXTAUTH_SECRET="my-secret-key-12345"
NEXTAUTH_URL="http://localhost:3000"

# Anthropic APIキー（AI提案機能を使う場合）
ANTHROPIC_API_KEY="sk-ant-..."
```

### 5. データベースの作成

PostgreSQLで `inquiry_tool` というDBを作成：

```bash
# PostgreSQL接続
psql -U postgres

# DB作成
CREATE DATABASE inquiry_tool;
\q
```

### 6. DBスキーマの適用とシードデータ投入

```bash
# スキーマを適用
npm run db:push

# サンプルデータを投入
npm run db:seed
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

---

## ログイン情報

シードデータで以下のアカウントが作られます：

| 役割 | メール | パスワード |
|------|--------|-----------|
| 管理者 | admin@example.com | admin1234 |
| スタッフ | staff1@example.com | staff1234 |
| スタッフ | staff2@example.com | staff1234 |

---

## 機能一覧

### ✅ 実装済み（MVP）

| 機能 | 説明 |
|------|------|
| 問い合わせ一覧 | モール/ステータス/種別でフィルタ、キーワード検索 |
| 問い合わせ詳細 | やり取り・注文・配送・社内メモを1画面で確認 |
| ステータス管理 | 未返信/返信済み/保留/要確認を切り替え |
| 担当者割り当て | スタッフを問い合わせに割り当て |
| テンプレート管理 | CRUD・カテゴリ分け・お気に入り・モール別設定 |
| 変数展開 | `{{customer_name}}` などを自動展開 |
| 返信プレビュー | 変数展開後の文章をプレビュー確認 |
| クリップボードコピー | 返信文をコピーしてモールに貼り付け |
| 返信記録 | 返信内容をやり取り履歴に保存 |
| 社内メモ | お客様には見えないメモを残す |
| AI提案 | Claude APIが問い合わせ種別を判定しテンプレートを提案 |
| 権限管理 | 管理者（全機能）/ スタッフ（対応・メモのみ）|
| 認証 | NextAuth + BCryptでセキュアなログイン |

### ❌ 後回し（今後の拡張）

- 楽天/Yahoo/Amazon/Qoo10 APIとの実連携
- メール実送信
- Webhook受信（リアルタイム通知）
- 統計・レポート機能
- CSVエクスポート

---

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **PostgreSQL + Prisma**
- **Tailwind CSS + shadcn/ui**
- **NextAuth.js**（認証）
- **Anthropic Claude API**（AI提案）

---

## DBスキーマ確認（Prisma Studio）

```bash
npm run db:studio
```

http://localhost:5555 でDB内容をGUIで確認できます。

---

## トラブルシューティング

**`DATABASE_URL` エラーが出る場合**
→ `.env.local` の接続情報が正しいか確認。PostgreSQLが起動しているか確認。

**`npm run db:seed` でエラーが出る場合**
→ `npm run db:push` を先に実行してからシードを実行。

**AI提案が動かない場合**
→ `.env.local` に `ANTHROPIC_API_KEY` が設定されているか確認。未設定でもAI提案ボタン以外は動作します。
