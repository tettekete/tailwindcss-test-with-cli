
- [HTML タグのカスタマイズと TailwindCSS を使ったカスタムスタイルの定義](#html-タグのカスタマイズと-tailwindcss-を使ったカスタムスタイルの定義)
	- [HTML タグのカスタマイズは必須](#html-タグのカスタマイズは必須)
	- [どこでカスタマイズするのか](#どこでカスタマイズするのか)
		- [HTML タグのカスタマイズサンプル](#html-タグのカスタマイズサンプル)
	- [独自スタイルを TailwindCSS で定義する](#独自スタイルを-tailwindcss-で定義する)


# HTML タグのカスタマイズと TailwindCSS を使ったカスタムスタイルの定義

## HTML タグのカスタマイズは必須

TailwindCSS を導入するとほぼ全てのタグにデフォルトで適用されているスタイルが削除された状態になる。

どういうことかというと `h1` タグだろうと `h4` タグだろうと、あるいは `p` タグであろうと、それらのタグで囲った文字列は全て同じ大きさ・フォントウェイトになり、`body` を含め全てのブロックやインラインタグのパディングもマージンも 0 に設定される。

もちろん `ul` や `ol` で `li` を使ったアウトラインにもマークすら付かない。

したがって、カスタマイズを行っていない状態でブラウザプレビューすると、どこに何のタグが適用されているのかも分からない状態になる。

`h1` タグが出てくる度に `text-3xl font-bold text-black` などとクラス指定をしなくてはいけないとすればそれは CSS フレームワーク導入も本末転倒となる。

したがってスタイルを伴うべき HTML タグの基本的なカスタマイズは必須となる。


## どこでカスタマイズするのか

いわゆる `global.css` 的な:

```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

が書き込まれた CSS でカスタマイズを行う。

ちなみに `@tailwind base;` は HTML タグに関する TailwindCSS のインポート文で、`components` 独自のコンポーネントスタイルやカスタムクラスのインポート文、`utilities` は小さなスタイル単位（`mt-4`、`text-center`、`bg-blue-500` など）をインポートする。

したがって、**HTML タグ関係は `base` に** 対してカスタマイズ指定し、一般的な**スタイルのカスタム定義は `components` に** 対して行う。

HTML タグ、スタイル、いずれのカスタマイズも同じファイルで定義する事になる。



### HTML タグのカスタマイズサンプル

**h1〜h4 のスタイルをデフォルトに近いスタイルにするサンプル**

```
@layer base {
  h1 {
    @apply text-3xl font-bold text-black;
  }
  h2 {
    @apply text-2xl font-semibold text-gray-800;
  }
  h3 {
    @apply text-lg font-medium text-black;
  }
  h4 {
    @apply text-base font-medium text-black;
  }
}
```

**`ul`,`ol` 内の `li` それぞれ中点とナンバリングを付与するサンプル**

```
@layer base {
	...
  ol {
	@apply list-decimal list-inside
  }
  ul {
	@apply list-disc list-inside
  }
  ...
}
```

詳細は公式ドキュメントを参照:

- [“List Style Type - Tailwind CSS”](https://tailwindcss.com/docs/list-style-type#setting-the-list-style-type)
- [“List Style Position - Tailwind CSS”](https://tailwindcss.com/docs/list-style-position)


## 独自スタイルを TailwindCSS で定義する

**スタイルチェック用にブロックのボーダーラインと背景色を適用する独自クラスのサンプル**

```
@layer components {
  .visible-div {
    @apply border-solid border border-black bg-slate-50;
  }
}
```

