# 概要

TailwindCSS 各スタイルの動作確認や構築テストのためのリポジトリ。

## USAGE

### 1. TailwindCSS のビルダーを常駐させる

```sh
$ npm run dev
```

### 2. docker で httpd を起動させる（オプション）

起動しなくても確認は可能だが Apache の `Indexies` によるファイル一覧が見られるのでいちいちリンクページを保守しなくて済む。

```sh
$ docker compose up
```

### 3. ブラウザで開く

`httpd`(Apache) を起動している場合 [localhost](http://localhost/) にアクセスする。

起動していない場合、確認したい `src/` 下のファイルを直接ブラウザで開く。

