# hotel-reservation-system-frontend

ホテル予約システムのユーザー向け画面です。

## Features

- 宿泊条件による空室・プラン検索
- プラン・客室選択と予約登録
- 予約番号とメールアドレスによる予約照会
- 宿泊条件、プラン、客室、代表者・宿泊者情報の変更
- 予約キャンセル
- DBトランザクションと行ロックによるオーバーブッキング防止

## Stack

- Bun
- TypeScript
- React
- Next.js App Router
- Tailwind CSS

## Documentation

- [テーブル設計](docs/database-design.md)
- [システム図（クラス図・アクティビティ図・ユースケース図・コラボレーション図）](docs/system-diagrams.md)
- [ドメイン分析](docs/domain-analysis.md)
- [要求分析](docs/requirements-analysis.md)
- [システム分析](docs/system-analysis.md)
- [アーキテクチャ設計](docs/architecture-design.md)

## Getting Started

### 前提条件

- mise（開発ツールバージョン管理）
- Node.js 24.x（.node-version / .mise.toml を参照）
- Bun（mise で自動インストール）

### セットアップ

```bash
# mise が未インストールの場合
curl https://mise.run | sh

# プロジェクトのツールをインストール（.mise.toml を使用）
mise install

# 依存関係をインストール
bun install

# 環境変数を作成し、Supabaseの接続情報を設定
cp .env.example .env

# マイグレーションとseedをリンク済みSupabaseへ適用
bunx supabase db push --include-seed
```

### 開発サーバー起動

```bash
bun run dev
```

http://localhost:3000 を開いて確認してください。
