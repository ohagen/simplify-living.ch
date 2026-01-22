# Simplify Living - Static HTML Site

Pre-rendered static HTML site with i18n support (German/English).

## Project Structure

```
simplify-living.ch/
├── templates/          # HTML templates with {{placeholders}}
│   ├── common/         # Reusable partials (head, navbar, footer, hero)
│   └── *.html          # Page templates
├── messages/           # Content in JSON (de.json, en.json)
├── styles/             # SCSS source files
│   ├── base/           # Base styles (variables, typography, fonts)
│   ├── components/     # Component styles (navbar, hero, footer, etc.)
│   ├── main.scss       # Main SCSS entry point
│   └── main.css        # Compiled CSS output
├── build.js            # Build script - generates HTML from templates
├── watch.js            # File watcher - auto-rebuilds on template/message changes
├── de/                 # Generated German pages (gitignored)
├── en/                 # Generated English pages (gitignored)
├── js/                 # JavaScript files
├── images/             # Images
└── fonts/              # Font files
```

## How It Works

1. **Templates** (`templates/*.html`) - HTML structure with `{{placeholders}}` and `{{> partials}}`
2. **Messages** (`messages/*.json`) - All text content in JSON format
3. **Styles** (`styles/*.scss`) - SCSS source files compiled to CSS
4. **Build** (`node build.js`) - Combines templates + messages → generates HTML
5. **Output** (`de/`, `en/`) - Final HTML files with content embedded

## Workflow

1. **Edit templates** → `templates/home.html` (HTML structure)
2. **Edit content** → `messages/de.json` (text content)
3. **Build** → `node build.js`
4. **Preview** → Go to `de/index.html` and 'Open with Live Server'

## Usage

### Install dependencies (only once per machine/clone):
```bash
npm install
```

### Development workflow

```bash
# Terminal 1: Watch templates/messages and auto-rebuild HTML
node watch.js

# Terminal 2: Watch SCSS and auto-compile CSS
npm run watch:css

# Go to en/index.html and 'Open with Live Server'
```

### Build for production

```bash
# Compile SCSS to CSS
npm run build:css

# Generate all HTML pages from templates
npm run build
# or
node build.js
```

## Template Syntax

### Placeholders

```html
<!-- Full key -->
<h1>{{home.title}}</h1>

<!-- Short key (auto-prefixed with page name) -->
<h1>{{title}}</h1>  <!-- Tries: home.title, then meta.title -->

<!-- Common content -->
<a href="about/">{{common.nav.about}}</a>

<!-- Special: locale -->
<html lang="{{locale}}">

<!-- Special: year -->
<p>© {{year}}</p>  <!-- Automatically replaced with current year -->
```

### Partials (Template Includes)

```html
<!-- Include a partial template -->
{{> common/head.html}}
{{> common/navbar.html}}
{{> common/footer.html}}
{{> common/hero.html}}

<!-- Partials are resolved relative to the template directory -->
<!-- Supports nested includes (partials can include other partials) -->
```

### Placeholder Resolution Order

When using a short key like `{{title}}`, the build script tries:
1. Exact key: `title`
2. Page-prefixed: `home.title` (if on home page)
3. Common-prefixed: `common.title`
4. Meta-prefixed: `meta.title`
5. Returns original placeholder if not found

## Adding a New Page

1. Create `templates/newpage.html` (can use partials with `{{> common/...}}`)
2. Add content to `messages/de.json` and `messages/en.json`:
   ```json
   {
     "newpage.title": "New Page",
     "newpage.description": "Page description for SEO",
     "newpage.content": "..."
   }
   ```
3. Add to `build.js` PAGES array:
   ```javascript
   {
     name: "newpage",
     template: "templates/newpage.html",
     output: "newpage/index.html",
   }
   ```
4. Run `node build.js` or use `node watch.js` for auto-rebuild

## Requirements

- **Node.js** (v14+ recommended)
- **npm** (comes with Node.js)
- **Sass** (installed via `npm install`)

## Dependencies

Development dependencies (installed via `npm install`):
- `sass` - SCSS compiler
- `npm-run-all` - Run multiple npm scripts in parallel

The build system uses pure Node.js (no external dependencies), but SCSS compilation requires the `sass` package.

## Output

- Pure HTML, CSS, JavaScript - no runtime dependencies
- Static files ready to deploy to any web server
- SEO-friendly with proper meta tags, canonical URLs, and hreflang tags

## Contact Form 

### Formspree Credentials:
- Link: https://formspree.io/login
- Email: info@simplify-living.ch
- Password: SamplePassword2026@

### Conditions:
- Free
- 50 submissions per month limit
- Instant email notifications on form submissions
- Usage alerts at 50%, 75%, 90%, and 100% of monthly limit
- Up to 2 email addresses for notifications (you can later add your personal email if you wish on your Formspree account)


