#!/usr/bin/env node
/**
 * Simple pre-renderer for static HTML site
 * Generates HTML files with content from JSON files
 * Pure Node.js - no dependencies required
 */

const fs = require("fs");
const path = require("path");

// Configuration
const LOCALES = ["de", "en"];
const PAGES = [
  { name: "home", template: "templates/home.html", output: "index.html" },
  {
    name: "about",
    template: "templates/about.html",
    output: "about/index.html",
  },
  {
    name: "contact",
    template: "templates/contact.html",
    output: "contact/index.html",
  },
  {
    name: "gallery",
    template: "templates/gallery.html",
    output: "gallery/index.html",
  },
  {
    name: "services",
    template: "templates/services.html",
    output: "services/index.html",
  },
  {
    name: "method",
    template: "templates/method.html",
    output: "method/index.html",
  },
];

/**
 * Load translation messages for a locale
 */
function loadMessages(locale) {
  const filePath = `messages/${locale}.json`;
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return {};
  }
}

/**
 * Include partial templates recursively: head (meta, title, description, keywords), navbar, footer
 */
function includePartials(html, templateDir, locale, pageName, messages, indexContext = null) {
  // Remove Handlebars comments {{!-- ... --}} before processing includes
  // This prevents includes inside comments from being processed
  html = html.replace(/\{\{!--[\s\S]*?--\}\}/g, '');
  
  // Match {{> path/to/partial.html}} or {{> path/to/partial.html index=0}} syntax
  const includePattern = /\{\{>\s*([^\}]+)\s*\}\}/g;
  let match;
  while ((match = includePattern.exec(html)) !== null) {
    const includeContent = match[1].trim();
    // Parse include path and optional parameters
    const parts = includeContent.split(/\s+/);
    const partialPath = parts[0];
    let includeIndex = null;
    
    // Check for index parameter (e.g., "index=0")
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('index=')) {
        includeIndex = parseInt(parts[i].split('=')[1], 10);
        break;
      }
    }
    
    // Resolve path relative to template directory
    const fullPath = path.resolve(templateDir, partialPath);
    
    if (fs.existsSync(fullPath)) {
      let partialContent = fs.readFileSync(fullPath, "utf8");
      // Create index context for this partial if index is specified
      const newIndexContext = includeIndex !== null ? includeIndex : indexContext;
      // Recursively process includes in the partial
      partialContent = includePartials(partialContent, path.dirname(fullPath), locale, pageName, messages, newIndexContext);
      // Process placeholders with index context
      partialContent = replacePlaceholders(partialContent, locale, pageName, messages, newIndexContext);
      // Replace the include directive with the partial content
      html = html.replace(match[0], partialContent);
      // Reset regex lastIndex to continue searching from the beginning
      includePattern.lastIndex = 0;
    } else {
      console.warn(`Warning: Partial not found: ${fullPath}`);
    }
  }
  
  return html;
}

/**
 * Replace placeholders in template with optional index context for array lookups
 */
function replacePlaceholders(html, locale, pageName, messages, indexContext = null) {
  // Replace {{key}} placeholders
  // Supports both full keys ({{home.title}}) and short keys ({{title}})
  // Also supports dashes in key names ({{home.how-it-works.title}})
  // Supports nested keys like {{hero.title}} which resolves to {{pageName}}.hero.title
  // Supports array lookups when indexContext is provided (e.g., before-after.images[0].before.image)
  return html.replace(/\{\{([\w-]+(?:\.[\w-]+)*)\}\}/g, (match, key) => {
    // Special case: {{locale}} -> replace with actual locale
    if (key === "locale") {
      return locale;
    }

    // If indexContext is provided and key starts with a known array prefix, try array lookup first
    if (indexContext !== null) {
      // Check for before-after array pattern
      if (key.startsWith('before-after.')) {
        const arrayKey = `before-after.images`;
        if (arrayKey in messages && Array.isArray(messages[arrayKey])) {
          const images = messages[arrayKey];
          if (images[indexContext]) {
            // Extract the sub-key (e.g., "before.image" from "before-after.before.image")
            const subKey = key.replace('before-after.', '');
            const keys = subKey.split('.');
            let value = images[indexContext];
            for (const k of keys) {
              if (value && typeof value === 'object' && k in value) {
                value = value[k];
              } else {
                value = null;
                break;
              }
            }
            if (value !== null) {
              return value;
            }
          }
        }
      }
    }

    // Try exact key first (e.g., "home.title", "common.nav.home")
    if (key in messages) {
      return messages[key];
    }

    // Try with pageName prefix (e.g., {{title}} -> "home.title")
    const prefixedKey = `${pageName}.${key}`;
    if (prefixedKey in messages) {
      return messages[prefixedKey];
    }

    // Try with common prefix (e.g., {{nav.home}} -> "common.nav.home")
    const commonKey = `common.${key}`;
    if (commonKey in messages) {
      return messages[commonKey];
    }

    // Try with meta prefix (e.g., {{title}} -> "meta.title")
    const metaKey = `meta.${key}`;
    if (metaKey in messages) {
      return messages[metaKey];
    }

    // Return original if not found
    return match;
  });
}

/**
 * Replace placeholders in template
 */
function renderTemplate(templatePath, locale, pageName) {
  if (!fs.existsSync(templatePath)) {
    return null;
  }

  let html = fs.readFileSync(templatePath, "utf8");
  const messages = loadMessages(locale);
  const templateDir = path.dirname(templatePath);
  
  // Process partial includes first (before placeholder replacement)
  html = includePartials(html, templateDir, locale, pageName, messages);

  // Replace remaining placeholders
  html = replacePlaceholders(html, locale, pageName, messages);

  // Remove empty elements (elements that only contain whitespace or unresolved placeholders)
  // This handles cases where optional content like {{hero.alert}} is empty or not found
  html = html.replace(/<p[^>]*class="hero__alert"[^>]*>\s*({{[^}]+}})?\s*<\/p>/gi, '');

  // Update lang attribute (remove duplicates first, then set)
  html = html.replace(/<html([^>]*)>/i, (match, attrs) => {
    // Remove existing lang attribute if present
    attrs = attrs.replace(/\s+lang="[^"]*"/i, "");
    return `<html lang="${locale}"${attrs}>`;
  });

  // Update title - try page title, then meta title
  const title =
    messages[`${pageName}.title`] ||
    messages["meta.title"] ||
    "Simplify Living";
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);

  // Update meta description - try page description, then meta description
  const description =
    messages[`${pageName}.description`] || messages["meta.description"] || "";
  if (description) {
    if (html.includes('name="description"')) {
      html = html.replace(
        /<meta\s+name="description"[^>]*>/i,
        `<meta name="description" content="${description.replace(
          /"/g,
          "&quot;"
        )}">`
      );
    } else {
      // Insert after viewport meta tag
      html = html.replace(
        /(<meta\s+name="viewport"[^>]*>)/i,
        `$1\n    <meta name="description" content="${description.replace(
          /"/g,
          "&quot;"
        )}">`
      );
    }
  }

  // Update canonical URL
  const baseUrl = "https://simplify-living.ch";
  const canonicalPath =
    pageName === "home"
      ? `${baseUrl}/${locale}/`
      : `${baseUrl}/${locale}/${pageName}/`;

  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${canonicalPath}">`
    );
  }

  // Update hreflang tags
  const hreflangDe = `${baseUrl}/de/${
    pageName === "home" ? "" : pageName + "/"
  }`;
  const hreflangEn = `${baseUrl}/en/${
    pageName === "home" ? "" : pageName + "/"
  }`;

  if (html.includes("hreflang")) {
    html = html.replace(
      /<link\s+rel="alternate"\s+hreflang="de"[^>]*>/i,
      `<link rel="alternate" hreflang="de" href="${hreflangDe}">`
    );
    html = html.replace(
      /<link\s+rel="alternate"\s+hreflang="en"[^>]*>/i,
      `<link rel="alternate" hreflang="en" href="${hreflangEn}">`
    );
  }

  // Replace {{year}} placeholder with current year
  html = injectYear(html);

  return html;
}

/**
 * Update year placeholder automatically
 */
function injectYear(text) {
  const year = new Date().getFullYear();
  return text.replace(/{{year}}/g, year);
}

/**
 * Build all pages for all locales
 */
function build() {
  let successCount = 0;
  let errorCount = 0;

  LOCALES.forEach((locale) => {
    PAGES.forEach(({ name, template, output }) => {
      const html = renderTemplate(template, locale, name);

      if (html) {
        const outputPath = `${locale}/${output}`;
        const outputDir = path.dirname(outputPath);

        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, html, "utf8");
        successCount++;
      } else {
        errorCount++;
      }
    });
  });

  // Simple summary
  if (errorCount > 0) {
    console.log(`Built ${successCount} files, ${errorCount} failed`);
  } else {
    console.log(`✓ Built ${successCount} files`);
  }
}

// Run build
build();
