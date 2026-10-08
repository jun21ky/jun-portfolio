# Jun Portfolio

ITエンジニアJunのポートフォリオサイト。個人開発のiOSアプリと、開発中のNeskを紹介しています。

**公開サイト:** https://junhayashii0.github.io/jun-portfolio/

## 内容

- 8本のiOSアプリと、開発中のデスクトップアプリNesk
- アプリの詳細、スクリーンショット、検索、リスト・グリッド表示
- コードと連動して角の丸さを変えられる小さなUIデモ
- プロフィール、App Store、X、お問い合わせフォーム
- ヘッダーの子犬アイコン（マウスやタップで一度ウインク）
- スマホ対応と、動きを減らす設定への対応

## ローカルで開く

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

http://127.0.0.1:4173/ を開きます。ビルドやパッケージのインストールは不要です。

## GitHub Pages

公開元は `main` ブランチの `/ (root)` です。サイトを修正してmainへプッシュすると更新されます。

## 編集するファイル

- `index.html`: ページの構成と紹介文
- `style.css`: デザインとレスポンシブ表示
- `content.js`: アプリの情報とプロフィールのリンク
- `app.js`: アプリの検索、表示切り替え、詳細画面
- `playground.js`: ヒーローのUIデモ
- `assets/`: アプリアイコン、スクリーンショット、プロフィール画像

## 素材

アプリのアイコンと画面画像はJun自身のApp Store掲載情報から使用しています。紹介文は公開情報の要約です。プロフィール画像はJunが提供したものです。

- App Store: https://apps.apple.com/us/developer/jun-hayashi/id6800836117
- X: https://x.com/jun21ky

フォントはGoogle FontsのZen Maru Gothicを使用しています。

ヘッダーの子犬はJunが提供したアイコンをもとに、背景透過とサイトに合わせた茶色への変更を行っています。元のアイコンの形を保ち、通常とウインクの2枚を使用しています。
