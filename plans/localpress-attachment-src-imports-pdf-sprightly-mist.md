# localpress — 自治体情報横断プラットフォーム 実装計画

## Context

事業計画書（PDF）に基づき、全国1700超自治体の公開情報を横断検索できるサービス「localpress」のフロントエンドUIを構築する。第1段階（統合検索・自治体ページ・お知らせ詳細・イベント・入札公募）のUIモックを実装する。

## Aesthetic Stance

**data-dense**（Bloomberg Terminal / FlightRadar 系）— 情報密度が高く、機能的な色分け、少ないホワイトスペース。法人・行政ユーザーが多数の案件を効率的にスキャン・フィルタリングする用途に合致。

- **配色**: 濃紺 `#0f1e3c` をグラウンドに、オフホワイト `#f4f5f7`、アクセントは鮮やか青 `#1d6ee6`、緊急・締切近は琥珀 `#f59e0b`
- **フォント**: Noto Sans JP（日本語本文）+ DM Sans（ UI英数字・見出し）+ JetBrains Mono（日付・コード・ラベル）
- **レイアウト**: 左サイドバー固定フィルタ + 右メインコンテンツのニュースルーム型

## ファイル構成

```
src/
  App.tsx               — ルーター・シェル（更新）
  index.css             — フォント @import、テーマトークン（更新）
  components/
    Header.tsx          — 検索バー常時表示・分野メニュー・ログインボタン
    Footer.tsx          — フッターリンク群
    Breadcrumb.tsx      — パンくずナビ
    SearchBar.tsx       — 統合検索入力（オートコンプリート想定UI）
    FilterPanel.tsx     — 地域・分野・期間・状態の絞り込みパネル
    ArticleCard.tsx     — お知らせ・案件カードコンポーネント
    BadgeTag.tsx        — 分野・状態バッジ
  pages/
    TopPage.tsx         — トップ / 統合検索
    SearchPage.tsx      — 検索結果（フィルタ付き一覧）
    CityPage.tsx        — 自治体ページ（プロフィール + 新着一覧）
    ArticlePage.tsx     — お知らせ詳細
    PricingPage.tsx     — 料金・プラン
  data/
    mockData.ts         — 岩手県33自治体のリアルなモックデータ
```

## 実装詳細

### src/index.css
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
@import 'tailwindcss';

@theme inline {
  --color-background: #f4f5f7;
  --color-foreground: #0f1e3c;
  --color-card: #ffffff;
  --color-primary: #1d6ee6;
  --color-primary-foreground: #ffffff;
  --color-muted: #e8eaf0;
  --color-muted-foreground: #5a6480;
  --color-accent: #f59e0b;
  --color-border: #d1d5e0;
  --font-sans: "Helvetica Neue",Arial,"Hiragino Kaku Gothic ProN","Hiragino Sans", sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### App.tsx — ページルーティング（React state ベース、ライブラリ不要）

`page` state で TopPage / SearchPage / CityPage / ArticlePage / PricingPage を切り替え。Header の検索バー入力で SearchPage へ遷移。

### mockData.ts — 岩手県の実データベース

岩手県・盛岡市・花巻市・一関市など実在する自治体名と、リアルな案件データ（補助金、イベント、入札情報）を20件程度定義。

### TopPage — 3セクション構成
1. **ヒーロー検索**: 大きな検索窓 + 分野ショートカット（イベント・補助金・入札・募集）
2. **締切間近の案件**: 横スクロールカード列 + 残日数バッジ（琥珀色）
3. **分野別新着**: 2カラムで「イベント・生活」と「入札・公募」を並列表示

### SearchPage — 左右分割レイアウト
- 左240px: FilterPanel（地域ツリー・分野チェック・期間・状態・キーワード）
- 右: ソートバー + ArticleCard リスト（無限スクロール風ページネーション）
- カード: タイトル・自治体名・分野バッジ・締切日・状態バッジ

### CityPage — 自治体プロフィール
- ヘッダー: 自治体名・都道府県・人口・公式サイトリンク
- タブ: 新着一覧 / 補助金 / 入札・公募 / イベント

### ArticlePage — お知らせ詳細
- メタ: 分野・自治体・公開日・締切日・対象者
- 本文要約
- 元ページへのリンク（CTAボタン）
- 関連情報サイドバー

### PricingPage — 4プランカード
無料 / 個人・企業向け（低〜中額） / 法人営業向け（中〜高額） / 自治体・調査向け（個別見積）

## デザイントークンの使い方

- ヘッダー背景: `#0f1e3c`（foreground色）で濃紺固定
- カード: `bg-white border border-border` + ホバーで `shadow-md`
- 締切間近バッジ: `bg-amber-100 text-amber-700 font-mono text-xs`
- 分野バッジ: 分野別に固定色（イベント=青、補助金=緑、入札=紺、募集=紫）
- 日付・コード: `font-mono text-sm`

## 検証方法

Vite dev server（既に起動中）でプレビューパネルを確認:
1. トップページの検索窓にキーワード入力 → SearchPage に遷移
2. フィルタパネルで地域・分野を切り替え → 結果リスト更新
3. カードクリック → ArticlePage に遷移、パンくず表示
4. 自治体名リンク → CityPage に遷移
5. ヘッダーの「料金プラン」→ PricingPage に遷移
6. モバイル幅（375px）でレスポンシブ確認
