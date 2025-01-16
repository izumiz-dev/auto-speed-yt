**注意**

このプロジェクトはプロトタイプとして作成されています。<br>拡張機能を使用したことによる、予期せぬ動作や不具合が発生する可能性があります。<br>これらの問題に関して、開発者は一切の責任を負いません。<br>

## 概要

GoogleのAIモデルGeminiを使用してYouTube動画の種類を判別し、再生速度を自動調整するChrome拡張機能

| コンテンツ | 再生速度 | イメージ |
|:---|:---|:---|
| 音楽 | 等倍速 (1.0x) | ![detect-music](https://github.com/user-attachments/assets/2c678050-edd6-447d-8547-1291c4914017) |
| ポッドキャスト | 1.25倍速 | ![detect-podcast](https://github.com/user-attachments/assets/d4901276-f080-411a-9583-2d2278ab1485) |
| その他 | 倍速 | ![detect-etc-vid](https://github.com/user-attachments/assets/9f499363-3a03-4455-84ad-57b689b2a50c) |



## セットアップ

```bash
git clone https://github.com/izumiz-dev/auto-speed-yt.git
cd auto-speed-yt
pnpm install
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

### キーの登録

[https://aistudio.gemini.com](https://aistudio.google.com/apikey) からAPIのキーを取得します。
APIキーは安全に保管し、他人に教えないでください。APIキーの不正利用による損害について、開発者は責任を負いません。

Aのマークのから拡張機能を開き、取得したキーを張り付け保存します。

![api-submit](https://github.com/user-attachments/assets/a6d2b6fc-0b1c-4e9e-8da7-8a855baa0369)

API Key: Already set が表示されたら登録完了です。

Enabled Extension を有効にした状態で、動画を開いてください。

## 再生速度の自動調整

このツールは、YouTube動画のタイトルと長さに基づいて再生速度を自動的に調整します。具体的には以下のように動作します

1. 動画のタイトルと長さを取得します。
2. タイトルと長さに基づいて、動画の内容が音楽、ポッドキャスト、その他のどれに該当するかを判定します。
3. 判定結果に応じて、再生速度を以下のように設定します:
   - 音楽: 1.0倍速
   - ポッドキャスト: 1.25倍速
   - その他: 1.75倍速

## FAQ

**A. Youtubeを視聴するたびにGeminiにリクエストするか<br>**
Q. 一度問い合わせた動画はローカルに保存されるため、2回目以降にリクエストされることはありません。

**A. 種類ごとの再生速度を調節できるか<br>**
Q. 現状、UIとして設定できるありません。以下の内容をご自身で書き換えてください。
https://github.com/izumiz-dev/auto-speed-yt/blob/2ad344988f583a0754e032e851e5c89780ea59a7/src/background.ts#L140-L144

**A. 誤判定されました。結果を手動で変更したい<br>**
Q. 現状、判定を覆すことができません。 Enable Extension トグルにて無効にしてお使いください。

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。
