# 概要

TailwindCSS 各スタイルの動作確認や構築テストのためのリポジトリ。

あくまで個人的な確認やメモのためのリポジトリであり、その正確性や網羅性は担保してません。

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

起動していない場合、確認したい `docs/` 下のファイルを直接ブラウザで開く。

GitHub に `push` 済みならば [GitHub Pages](https://tettekete.github.io/tailwindcss-test-with-cli/) からも確認可能（というかそのためにパブリックリポジトリにしている）。

デフォルトでは機械的に生成した index.html が表示される。

日本語でカテゴリ分けされたリンク集ページは[こちら](https://tettekete.github.io/tailwindcss-test-with-cli/manual-index.html)。

