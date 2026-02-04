# Apollo Foundation

This repo and NPM package contain the design tokens for Xplor's [Apollo UI framework](https://github.com/xplor/apollo). Design tokens are low-level variables such as color values, fonts/typefaces, and text styles that help to ensure visual consistency across interfaces and products. **Tokens are built per brand and per platform** — the package supports the **Apollo** and **Field Edge** brands and outputs CSS, SCSS, JavaScript/TypeScript, Android, and iOS artifacts.

While Xplor recommends the use of Apollo components whenever possible, you may also use Apollo Foundation's design tokens directly in your UI for more custom development. The sections below describe how to install the package and set up tokens for each platform.

## Installation

```bash
npm install @xplortech/apollo-foundation
```

The package publishes a pre-built `build/` directory. Import paths are **brand-based**: use `apollo` or `field-edge` in the path depending on which brand you use.

## Usage

### Web (CSS)

Use CSS variables in stylesheets or link them in HTML. Variables are namespaced with `--xpl-` (kebab-case) to avoid conflicts.

**Option A — Link in HTML**

```html
<link rel="stylesheet" href="node_modules/@xplortech/apollo-foundation/build/apollo/css/variables.css">
```

**Option B — Import in CSS**

```css
@import "@xplortech/apollo-foundation/apollo/css/variables.css";
```

For brands with light/dark mode (e.g. Apollo), two files are built:

- **`variables.css`** — Class-based: `:root` for light and `.dark { ... }` for dark. Add a `.dark` class on a parent (e.g. `<html>`) to switch.
- **`variables-media.css`** — Media-query based: uses `@media (prefers-color-scheme: dark)`. Use this if you prefer system-driven dark mode.

Use the same paths with `field-edge` for the Field Edge brand (e.g. `field-edge/css/variables.css`).

### Web (SCSS)

Import the SCSS variables into your Sass/SCSS. For brands with light/dark mode you get `_variables.scss` (class-based) and `_variables-media.scss` (media-query).

```scss
// Class-based light/dark (use .dark on a parent to toggle)
@import "@xplortech/apollo-foundation/apollo/scss/variables";

// Or media-query based
@import "@xplortech/apollo-foundation/apollo/scss/variables-media";
```

Then use the variables in your styles:

```scss
.my-component {
  background: $xpl-color-background-primary;
  padding: $xpl-size-spacing-md;
}
```

For Field Edge, use `field-edge/scss` in the import path (e.g. `@import "@xplortech/apollo-foundation/field-edge/scss/variables";`).

### Web (JavaScript / TypeScript)

Import color and font token objects from the brand’s JS build. TypeScript declarations (`.d.ts`) are included.

```js
import { color } from "@xplortech/apollo-foundation/apollo/js/colors.js";
import { font } from "@xplortech/apollo-foundation/apollo/js/font.js";
```

With light/dark mode, color tokens expose `value.light` and `value.dark`:

```js
// Single value (no mode)
const spacing = font.size.spacing.md.value;

// With mode (e.g. background primary)
const bgLight = color.background.primary.value.light;
const bgDark = color.background.primary.value.dark;
```

For Field Edge, use `field-edge/js` in the import path (e.g. `@xplortech/apollo-foundation/field-edge/js/colors.js`).

### Android (Apollo brand)

The Apollo brand builds Android resources and a Kotlin theme. Output is under `build/apollo/android/` (not exposed as a package export; use the path inside `node_modules` or copy the files).

**Setup:**

1. Copy (or link) the built files from `node_modules/@xplortech/apollo-foundation/build/apollo/android/` into your app:
   - **`colors.xml`** → `app/src/main/res/values/colors.xml`
   - **`values-night/colors.xml`** → `app/src/main/res/values-night/colors.xml` (dark mode)
   - **`dimens.xml`** → `app/src/main/res/values/dimens.xml`
   - **`Theme.kt`** → your Kotlin source (e.g. `com.xplor.apollo.design` package)

2. In your app theme, reference the color and dimension resources (e.g. `@color/xpl_*`, `@dimen/xpl_*`) or use `Theme.kt` (e.g. `ApolloTheme.colors.backgroundPrimary`) in code.

Field Edge does not produce Android output (it targets React Native); use the web or iOS outputs for Field Edge.

### iOS (Apollo and Field Edge)

The build outputs Swift files under `build/{brand}/ios/`. Apollo also gets legacy `StyleDictionaryColor.swift` and `StyleDictionaryFont.swift`; all brands get **`Theme.swift`** with a nested token structure and light/dark support.

**Setup:**

1. Copy the Swift files from `node_modules/@xplortech/apollo-foundation/build/apollo/ios/` (or `build/field-edge/ios/`) into your Xcode project.
2. Add the files to your app target so they compile with your project.
3. Use the `Theme` enum (and, for Apollo, `StyleDictionaryColor` / `StyleDictionarySize`) in Swift:

```swift
// Theme (all brands)
view.backgroundColor = Theme.color.background.primary.value

// Apollo legacy
label.textColor = StyleDictionaryColor.red700
```

## Variable naming

CSS and SCSS variables use the prefix `--xpl-` (or `$xpl-` in SCSS) and kebab-case. The pattern is `--xpl-{category}-{path}`, e.g. `--xpl-color-background-primary`, `--xpl-size-spacing-md`. For full token semantics and structure, see the [Figma documentation](https://www.figma.com/file/qRzFFgT4Fy8p9GpUmV0g5E/Apollo-Foundation?node-id=2609%3A67938).

## For contributors

### Scripts

- **`npm run build`** — Build all tokens for all brands and platforms.
- **`npm run dev`** — Watch `src/tokens` and rebuild on changes.
- **`npm run clean`** — Remove the `build/` directory.
- **`npm run test`** — Run tests.
- **`npm run test:coverage`** — Run tests with coverage.

### Token source layout

- **`src/tokens/global/`** — Shared tokens (color palettes, font, size, etc.) used across brands.
- **`src/tokens/brands/{brand}/`** — Brand-specific tokens (e.g. `apollo/color/light`, `apollo/color/dark`, `apollo/font`). Light/dark directories under `color` enable mode-specific CSS/SCSS/JS and native outputs.
- **`src/tokens/platforms/{platform}/`** — Platform-specific overrides or additions (e.g. `css/`, `scss/`, `js/`, `android/`, `ios/`).

The builder uses [Style Dictionary](https://style-dictionary.io/) and runs once per brand and per platform; mode detection (light/dark) is inferred from the presence of `brands/{brand}/color/light` and `color/dark`.

## More info

Design tokens in this package align with the [Apollo Foundation Figma documentation](https://www.figma.com/file/qRzFFgT4Fy8p9GpUmV0g5E/Apollo-Foundation?node-id=2609%3A67938).
