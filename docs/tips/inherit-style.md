# TailwindCSS では CSS の継承に近いことが出来る。

```css
/* tailwind.css */
@layer utilities {
  .parent-css {
    @apply text-lg font-bold text-gray-800; /* 共通スタイル */
  }

  .child-css {
    @apply parent-css; /* 親クラスのスタイルを適用 */
    @apply text-blue-500; /* 子クラス固有のスタイルを追加 */
  }
}
```

HTML

```html
<div class="parent-css">親要素のスタイル</div>
<div class="child-css">子要素のスタイル</div>
```

