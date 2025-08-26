# ALSOK IoT騒音監視システム Web管理画面

## プロジェクト概要

ALSOKとの共同プロジェクトで開発された、集合住宅向けIoT騒音監視システムのWeb管理画面です。リアルタイムでの騒音レベル監視、アラート管理、データ分析機能を提供します。

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **State Management**: React Hooks
- **Icons**: Lucide React
- **Date**: date-fns
- **Form Validation**: React Hook Form + Zod
- **Deployment**: Vercel

## 主要機能

- 🔐 **認証システム**: ロールベースのアクセス制御
- 📊 **ダッシュボード**: リアルタイムの統計とグラフ表示
- 📈 **データ分析**: 騒音レベルとアラートの詳細分析
- 🏢 **企業管理**: 契約企業情報の管理
- 🏠 **物件管理**: 物件情報と図面管理
- 📡 **デバイス管理**: IoTセンサーの監視と設定
- 🔔 **アラート管理**: 騒音アラートの確認と対応
- 👥 **ユーザー管理**: システムユーザーの権限管理

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/haudi-development/iot-noise-monitoring-system.git
cd iot-noise-monitoring-system
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてアクセスしてください。

### 4. ビルド

```bash
npm run build
```

### 5. プロダクション環境での実行

```bash
npm run start
```

## 認証情報

テスト用の認証情報:

- **管理者**
  - ユーザー名: `admin`
  - パスワード: `admin123`

- **オペレーター**
  - ユーザー名: `operator`
  - パスワード: `operator123`

## プロジェクト構成

```
iot-noise-monitoring-system/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   │   └── login/         # ログインページ
│   ├── (dashboard)/       # メインアプリケーション
│   │   ├── layout.tsx     # サイドバーレイアウト
│   │   ├── dashboard/     # ダッシュボード
│   │   ├── analytics/     # データ分析
│   │   ├── companies/     # 企業管理
│   │   ├── properties/    # 物件管理
│   │   ├── devices/       # デバイス管理
│   │   ├── alerts/        # アラート管理
│   │   ├── users/         # ユーザー管理
│   │   └── settings/      # システム設定
│   └── api/               # APIルート（モック）
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # レイアウトコンポーネント
├── lib/
│   ├── auth.ts            # 認証関数
│   ├── types.ts           # TypeScript型定義
│   ├── utils.ts           # ユーティリティ関数
│   └── data/
│       └── dummy-data.ts  # ダミーデータ生成
├── public/                # 静的ファイル
└── docs/                  # 開発ドキュメント
```

## 開発のヒント

### ダミーデータの更新

`lib/data/dummy-data.ts` ファイルでダミーデータを生成しています。デバイスの騒音レベルは15秒ごとに自動的に更新されます。

### テーマカスタマイズ

カラーパレットは `tailwind.config.ts` で定義されています。ALSOKブランドカラー:
- Primary Blue: `#0066CC`
- Accent Yellow: `#FFB800`

### コンポーネントの追加

新しいUIコンポーネントが必要な場合は、shadcn/ui を使用してください:

```bash
npx shadcn-ui@latest add [component-name]
```

## スクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクション用にビルド
- `npm run start` - プロダクションサーバーを起動
- `npm run lint` - ESLintでコードをチェック

## ブラウザサポート

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## ライセンス

このプロジェクトは非公開プロジェクトです。ALSOKおよび関係者のみが使用可能です。

## サポート

問題が発生した場合は、GitHubのIssueを作成するか、開発チームまでお問い合わせください。

## 更新履歴

- v1.0.0 (2024/08/26) - 初回リリース