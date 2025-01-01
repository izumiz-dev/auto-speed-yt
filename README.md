# auto-speed-yt

> [!IMPORTANT]  
> このプロジェクトはプロトタイプとして作成されました。

> [!WARNING]  
> 現在、キャッシュ機構が存在しないため、動画を開くたびに Gemini のリクエストが発生します。

## 概要

Geminiを使ってYouTube動画の種類を判別し、再生速度を自動調整するChrome拡張機能。

## 使い方

1. セットアップ手順に従って拡張機能をインストールします。
2. YouTubeのウェブサイトを開きます。
3. 動画を再生すると、タイトルと長さに基づいて自動的に再生速度が調整されます。特に設定を行う必要はありません。

## セットアップ

以下のコマンドを使用してセットアップ:

```bash
git clone https://github.com/izumiz-dev/auto-speed-yt.git
cd auto-speed-yt
pnpm install
```

### APIキーの登録

[https://aistudio.gemini.com](https://aistudio.google.com/apikey) からAPIのキーを取得します。

`src/backgrount.ts` の `your-api-key` に張り付けてください。

APIキーは安全に保管し、他人に教えないでください。APIキーの不正利用による損害について、開発者は責任を負いません。

```ts
const geminiApiKey: string = 'your-api-key'; // your-api-key を置き換える
```

### ビルド

以下のコマンドでビルド:

```
pnpm build
```

### 拡張機能の読み込み

Chrome拡張機能として利用するために、以下の手順を実行してください:

1. Chromeブラウザを開き、`chrome://extensions/`にアクセスします。
2. 右上の「デベロッパーモード」をオンにします。
3. 「パッケージ化されていない拡張機能を読み込む」をクリックし、`auto-speed-yt`のビルドした生成物がある`dist`ディレクトリを選択します。

これで、Youtubeのウェブサイトを開くことで利用可能になります


## 再生速度の自動調整

このツールは、YouTube動画のタイトルと長さに基づいて再生速度を自動的に調整します。具体的には以下のように動作します

1. 動画のタイトルと長さを取得します。
2. タイトルと長さに基づいて、動画の内容が音楽、ポッドキャスト、その他のどれに該当するかを判定します。
3. 判定結果に応じて、再生速度を以下のように設定します:
   - 音楽: 1.0倍速
   - ポッドキャスト: 1.25倍速
   - その他: 1.75倍速

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。