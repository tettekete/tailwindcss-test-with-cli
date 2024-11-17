
- [最初に - ユーティリティー・ファースト](#最初に---ユーティリティーファースト)
	- [なぜユーティリティ・ファーストなのか](#なぜユーティリティファーストなのか)
	- [インラインスタイルに対する利点](#インラインスタイルに対する利点)
	- [ユーティリティ・ファースト な TailwindCSS の具体例](#ユーティリティファースト-な-tailwindcss-の具体例)


# 最初に - ユーティリティー・ファースト

[“Utility-First Fundamentals - Tailwind CSS”](https://tailwindcss.com/docs/utility-first)

ユーティリティー・ファーストとは TailwindCSS の設計コンセプトのこと。

ユーティリティー・ファーストにおける「ユーティリティー」とは例えば、「テキストカラーを中濃の青にする(`text-sky-500`)」とか「背景色を薄い赤にする(`bg-red-50`)」とか、「左右マージンを 1 remにする(`mx-4`)」といった小さなスタイル定義のことを指す。

この小さなスタイル定義 = ユーティリティによって全体のスタイルを構築していこうとする方法論を「ユーティリティー・ファースト」と呼ぶらしい。

## なぜユーティリティ・ファーストなのか

かつての CSS では特定の HTML 要素のスタイルを定義するために、フォントサイズやウェイト、カラー、パディング、テキストアライン、etc.. を予め一つの `.main-content` ,`sub-content` といったクラスに書いてそのクラスを HTML 要素にアサインしていた。

具体的には [“Utility-First Fundamentals - Tailwind CSS”](https://tailwindcss.com/docs/utility-first) の "Using a traditional approach where custom designs require custom CSS" で紹介されているような手法。

各スタイルに様々なスタイル定義を行う方式。この場合、HTML 構造の変化があるとそれらスタイルの継承設計が壊れるため、各スタイルの中の要素を入れ替えたり、全部書き換えになってしまったりする（これはそもそもデザインと HTML 構造を分離するという目的で生まれた CSS のスタイル継承機能が HTML の構造に依存するという致命的な矛盾の問題でもある。 CSS 内で CSS の継承が出来ればこのような方向の CSS フレームワークの必要性は低く別の未来があっただろう）。

この方法論に対し、スタイルカテゴリ毎の小さなスタイルを HTML 要素に（まるでインラインスタイルのように）適用する手法を TailwindCSS では「ユーティリティ・ファースト」と呼ぶ。

具体例としては同じく [“Utility-First Fundamentals - Tailwind CSS”](https://tailwindcss.com/docs/utility-first) の "Using utility classes to build custom designs without writing CSS" のコードを参照すると分かり易い。

長いクラスの定義がない代わりに各 HTML タグの `class` に TailwindCSS の「ユーティリティー」クラスが定義されることで同じ結果を生み出している。


## インラインスタイルに対する利点

そもそもインラインスタイル（`<div style="インラインスタイル">`）方式は ADHOC 的に使うもので、全てそれで定義してしまっては共通のスタイル適用などが面倒で保守も難しくなる。

- TailwindCSS のような制約を持った CSS を使うことでそれらの（ハードコーディングされたマジックナンバーだらけのような）問題はかなり解消される。
- TailwindCSS が提供するレスポンシブデザインシステムが使える。インラインスタイルでメディアクエリを使用することは出来無い。
- 複数の疑似クラス　`:hover` や　`:focus` 等を一緒に書ける


## ユーティリティ・ファースト な TailwindCSS の具体例

ここでは上記 [“Utility-First Fundamentals - Tailwind CSS”](https://tailwindcss.com/docs/utility-first) の HTML を引用し、使用されている TailwindCSS について解説する。その方が手っ取り早く「ユーティリティ」が何なのか理解できるからだ。

ほぼ同等の HTML は[ここ](notify-sample.html)からも確認出来る。どの様なスタイルを表現するコードなのかはそちらを参照しても良い。ソース HTML は[こちら](https://github.com/tettekete/tailwindcss-test-with-cli/blob/main/docs/notify-sample.html)


```html
<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center gap-x-4">
  <div class="shrink-0">
    <img class="size-12" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-slate-500">You have a new message!</p>
  </div>
</div>
```

**各クラスで使用されている TaiwindCSS の説明:**

| TailwindCSS      | CSS の定義                                                                           | 備考                                                                                 |
| ---------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `p-6`            | `padding: 1.5rem;`                                                                | [“Padding - Tailwind CSS”](https://tailwindcss.com/docs/padding)                   |
| `max-w-sm`       | `max-width: 24rem;`                                                               | [“Max-Width - Tailwind CSS”](https://tailwindcss.com/docs/max-width)               |
| `mx-auto`        | `margin-left: auto;`</br>`margin-right: auto;`                                    | [“Margin - Tailwind CSS”](https://tailwindcss.com/docs/margin)                     |
| `bg-white`       | `background-color: rgb(255 255 255);`                                             | [“Background Color - Tailwind CSS”](https://tailwindcss.com/docs/background-color) |
| `rounded-xl`     | `border-radius: 0.75rem;`                                                         | [“Border Radius - Tailwind CSS”](https://tailwindcss.com/docs/border-radius)       |
| `shadow-lg`      | `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);` | [“Box Shadow - Tailwind CSS”](https://tailwindcss.com/docs/box-shadow)             |
| `flex`           | `display: flex;`                                                                  | [“Flex - Tailwind CSS”](https://tailwindcss.com/docs/flex)                         |
| `items-center`   | `align-items: center;`                                                            | [“Align Items - Tailwind CSS”](https://tailwindcss.com/docs/align-items)           |
| `gap-x-4`        | `column-gap: 1rem;`                                                               | [“Gap - Tailwind CSS”](https://tailwindcss.com/docs/gap)                           |
| `shrink-0`       | `flex-shrink: 0;`                                                                 | [“Flex Shrink - Tailwind CSS”](https://tailwindcss.com/docs/flex-shrink)           |
| `size-12`        | `width: 3rem; /* 48px */ `</br>`height: 3rem; /* 48px */`                         | [“Size - Tailwind CSS”](https://tailwindcss.com/docs/size#fixed-sizes)             |
| `text-xl`        | `font-size: 1.25rem; /* 20px */`</br>`line-height: 1.75rem; /* 28px */`           | [“Font Size - Tailwind CSS”](https://tailwindcss.com/docs/font-size)               |
| `font-medium`    | `font-weight: 500;`                                                               | [“Font Weight - Tailwind CSS”](https://tailwindcss.com/docs/font-weight)           |
| `text-black`     | `color: rgb(0 0 0);`                                                              | [“Text Color - Tailwind CSS”](https://tailwindcss.com/docs/text-color)             |
| `text-slate-500` | `color: rgb(100 116 139);`                                                        | [“Text Color - Tailwind CSS”](https://tailwindcss.com/docs/text-color)             |


_※ パディングやフォントサイズ、`width` 等に使われている数字は `0.25rem` 単位、したがって `p-6` は `0.25rem` × `6` = `1.5rem` となる。ただし `border` やカラー関係の数字はまた別_

