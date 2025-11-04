Merge local CSS referenced by HTML files
======================================

This small tool scans the workspace for HTML files, finds local (non-remote) stylesheet links,
merges them into a single CSS file (preserving order and avoiding exact duplicate lines), and
optionally updates the HTML files to reference the merged stylesheet.

Usage
-----


Run a dry-run to see what would be done:

```powershell
python tools\merge_css.py . --output assets/merged-styles.css
```

New options
-----------
- `--include-unreferenced`: include CSS files not referenced by HTML (useful to consolidate plugin/theme CSS for offline review). These files are often plugin assets — check before removing.
- `--split-outputs`: write two merged files: one for referenced CSS (default), and one for unreferenced CSS. The unreferenced file will be named by appending `.unreferenced.css` to the output path.
- Watermark detection: the script heuristically flags files that may contain "watermark" or vendor/template comments (e.g., "powered by", "template"). It only reports them in dry-run; you should manually review any detected files before deletion.

Examples
--------
Dry-run and show unreferenced files (no changes):

```powershell
python tools\merge_css.py . --output assets/merged-styles.css --show-unreferenced
```

Dry-run including unreferenced CSS and split outputs:

```powershell
python tools\merge_css.py . --output assets/merged-styles.css --include-unreferenced --split-outputs
```

Apply changes and write both merged files:

```powershell
python tools\merge_css.py . --output assets/merged-styles.css --include-unreferenced --split-outputs --apply
```

Apply and delete originals (dangerous — recommended to backup first):

```powershell
python tools\merge_css.py . --output assets/merged-styles.css --include-unreferenced --split-outputs --apply --delete-originals
```

Notes and limitations
---------------------
- The script is conservative and does not perform full CSS parsing. It deduplicates by exact line
  matches and preserves @import rules at the top.
- Remote CSS (http(s):// or //) and data: URIs are ignored and left untouched in HTML.
- A backup of each updated HTML file is created with the `.bak` extension.

Next steps
----------
- Review the dry-run output and check the merged CSS visually.
- Optionally run `--apply` and test the site in a browser.
- If further CSS cleanup is desired (dead selector removal, minification), consider using a CSS
  optimizer or build tool (postcss, purgecss) after merging.
