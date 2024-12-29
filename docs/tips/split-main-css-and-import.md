
**目次**:

- [TailwindCSS のメイン CSS ファイルを分割する方法](#tailwindcss-のメイン-css-ファイルを分割する方法)
  - [その前に - PostCSS モジュールの有無について](#その前に---postcss-モジュールの有無について)
  - [調査段階での各種バージョン情報](#調査段階での各種バージョン情報)
- [PostCSS パターン（Next.js）](#postcss-パターンnextjs)
  - [1. `postcss-import` モジュールのインストール](#1-postcss-import-モジュールのインストール)
  - [2. `postcss.config.mjs` の編集（または作成）](#2-postcssconfigmjs-の編集または作成)
  - [3. デフォルトの `@tailwind` による読み込みを `@import` に変更し、分割する](#3-デフォルトの-tailwind-による読み込みを-import-に変更し分割する)
    - [元の状態](#元の状態)
    - [分割後](#分割後)
- [Tailwind CLI パターン](#tailwind-cli-パターン)
  - [元ファイル](#元ファイル)
  - [分割後](#分割後-1)


# TailwindCSS のメイン CSS ファイルを分割する方法

TailwindCSS は設定する属性が多いため、`globals.css` のようなメイン CSS ファイルが大きくなりがちです。

その結果、大きくなったメイン CSS ファイルをカテゴリ別に分割したいというニーズが自然と生まれてきます。

ここでは、そのメイン CSS ファイルを分割する方法について解説します。



## その前に - PostCSS モジュールの有無について

[PostCSS](https://postcss.org/) モジュールを導入しているどうかで分割方法が若干が異なります。

ここでは `postcss` モジュールを導入しているパターンを[「PostCSS パターン」](#postcss-パターンnextjs)、純粋に Tailwind CLI だけを使っているパターンを[「Tailwind CLI パターン」](#tailwind-cli-パターン)とし、それぞれ必要な設定・手順を説明します。


## 調査段階での各種バージョン情報

- Next.js: 15.0.2
- TailwindCSS: 3.4.1
- PostCSS: 8.4.49


# PostCSS パターン（Next.js）

公式のインストール方法で言うと [“Install Tailwind CSS using PostCSS - Tailwind CSS”](https://tailwindcss.com/docs/installation/using-postcss) の手順で構築したパターンです。

また `create-next-app` で作った場合も現時点ではこのパターンになります。

このパターンでは Tailwind CLI は PostCSS のプラグインとして動作するようになっています。

_※ この分割方法の公式解説は[“Using with Preprocessors - Tailwind CSS”](https://tailwindcss.com/docs/using-with-preprocessors)にあります。_


## 1. `postcss-import` モジュールのインストール

まず `@import` ルールををインライン化する PostCSS プラグイン [`postcss-import`](https://www.npmjs.com/package/postcss-import)を導入します。

```sh
$ npm install -D postcss-import
```

## 2. `postcss.config.mjs` の編集（または作成）

`create-next-app` で作ったプロジェクトであれば最初から作られているはずです。

**`postcss.config.mjs`**:

`postcss.config.mjs` の `plugins` に `postcss-import` を加えます。

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
  },
};

export default config;

```

公式ドキュメントによれば **`plugins` の最初に加えることが重要** とのことです。

_※ というか、PostCSS の公式サンプルでは `plugins` の型はリストなのですが、`create-next-app` で作られたコンフィグではなぜかオブジェクト定義になっているのが謎ですねぇ。_


## 3. デフォルトの `@tailwind` による読み込みを `@import` に変更し、分割する

`@tailwind xxxx` 形式で記述されている TailwindCSS のベースコンポーネントの読み込み部分を、`@import` を使用した形式に書き換える必要があります。これは、`@tailwind` が TailwindCSS の独自拡張であり、`postcss` では解釈できないためです。

また分割後のファイルから `@layer base` や `@layer components` のブロックを削除する必要があります。

`@import` の順序が適切になるように注意してください。順序が正しくないと、スタイルが意図した通りに適用されない可能性があります。

具体例については、以下のサンプルコードを参照してください。

### 元の状態

**`app/globals.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* このブロックの定義は app/styles/basic.css に分割します */
  h1 {
    @apply text-3xl font-bold text-red-500 mt-6 mb-4;
  }
}

@layer components {
  /* このブロックの定義は app/styles/my-components.css に分割します */
  .slate-box {
    @apply border-solid border border-slate-200 bg-slate-100 bg-opacity-25;
  }
}
```

### 分割後

ファイル構成:

```
app
├── globals.css
└── styles
    ├── basic.css
    └── my-components.css
```

**`app/globals.css`**:

インポート順に解釈されるため順番には気をつける必要があります。

```
@import "tailwindcss/base";
@import "./styles/basic.css";

@import "tailwindcss/components";
@import "./styles/my-components.css";

@import "tailwindcss/utilities";
```

**`app/styles/basic.css`**:

`@layer base` ブロックを外した形式にする必要があります

```css
h1 {
  @apply text-3xl font-bold text-red-500 mt-6 mb-4;
}
```

**`app/styles/my-components.css`**

同様に `@layer components` ブロックを外した形式にする必要があります

```css
.slate-box {
  @apply border-solid border border-slate-200 bg-slate-100 bg-opacity-25;
}
```

これで完了です。

---

# Tailwind CLI パターン

_※ こちらは公式ドキュメントに記載が見当たらなかったため、試行錯誤の結果をまとめたものです。_

このパターンは、[“Installation - Tailwind CSS”](https://tailwindcss.com/docs/installation) の手順に従って構築したものです。PostCSS を使用せず、Tailwind CLI が直接ビルドを行うため、手順がやや簡潔です。

ただし、この場合も `@tailwind` によるデフォルトインポートを廃止し、`@import` に置き換える必要があります。

_※ Tailwind CLI は `@tailwind` を解釈できますが、`@import` で読み込んだ外部ファイルの定義が無視されます。_

一方で、PostCSS と異なり、Tailwind CLI は `@layer base` のような Tailwind の独自拡張を解釈可能です。そのため、元の定義をそのままコピー＆ペーストして移動させることができます。

具体例を提示するほうがわかりやすいため、以下のサンプルコードをご参照ください。

## 元ファイル

**`docs/globals.css`**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* この @layer base の定義は docs/styles/basic.css に分割します */
@layer base {
  h1 {
    @apply text-3xl font-bold text-red-500 mt-6 mb-4;
  }
}

/* この @layer components の定義は docs/styles/my-components.css に分割します */
@layer components {
  .slate-box {
    @apply border-solid border border-slate-200 bg-slate-100 bg-opacity-25;
  }
}
```


## 分割後

ファイル構成:

```
docs
├── globals.css
└── styles
    ├── basic.css
    └── my-components.css
```

**`app/globals.css`**:

基本的には PostCSS パターンの時と同じです。

インポート順に解釈されるため順番には気をつける必要があります。

```
@import "tailwindcss/base";
@import "./styles/basic.css";

@import "tailwindcss/components";
@import "./styles/my-components.css";

@import "tailwindcss/utilities";
```

**`app/styles/basic.css`**:

Tailwond CLI は `@layer base` を解釈するので、元の定義のままで大丈夫です。

```css
@layer base {
  h1 {
    @apply text-3xl font-bold text-red-500 mt-6 mb-4;
  }
}
```

**`app/styles/my-components.css`**

```css
@layer components {
  .slate-box {
    @apply border-solid border border-slate-200 bg-slate-100 bg-opacity-25;
  }
}
```

これで完了です。
