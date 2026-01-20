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
 * Loads common.json and page-specific JSON files, then merges them
 */
function loadMessages(locale, pageName = null) {
  const messages = {};
  
  // Always load common messages first (nav, footer, meta, etc.)
  const commonPath = `messages/${locale}/common.json`;
  if (fs.existsSync(commonPath)) {
    try {
      const commonMessages = JSON.parse(fs.readFileSync(commonPath, "utf8"));
      Object.assign(messages, commonMessages);
    } catch (error) {
      console.warn(`Warning: Could not load ${commonPath}:`, error.message);
    }
  }
  
  // Load shared component message files (used across multiple pages)
  // These files contain data for reusable components (e.g., before-after slider)
  // Component files should be named after the component, not a page
  // home.json is included because method-icons component uses home.how-it-works data
  const sharedComponentFiles = ['before-after.json', 'home.json'];
  sharedComponentFiles.forEach(fileName => {
    const sharedPath = `messages/${locale}/${fileName}`;
    if (fs.existsSync(sharedPath)) {
      try {
        const sharedMessages = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
        Object.assign(messages, sharedMessages);
      } catch (error) {
        console.warn(`Warning: Could not load ${sharedPath}:`, error.message);
      }
    }
  });
  
  // Load page-specific messages if pageName is provided
  if (pageName) {
    const pagePath = `messages/${locale}/${pageName}.json`;
    if (fs.existsSync(pagePath)) {
      try {
        const pageMessages = JSON.parse(fs.readFileSync(pagePath, "utf8"));
        Object.assign(messages, pageMessages);
      } catch (error) {
        console.warn(`Warning: Could not load ${pagePath}:`, error.message);
      }
    }
  }
  
  // Fallback: try loading from old flat structure for backward compatibility
  if (Object.keys(messages).length === 0) {
    const legacyPath = `messages/${locale}.json`;
    if (fs.existsSync(legacyPath)) {
      try {
        return JSON.parse(fs.readFileSync(legacyPath, "utf8"));
      } catch (error) {
        console.warn(`Warning: Could not load ${legacyPath}:`, error.message);
      }
    }
  }
  
  return messages;
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
 * Process Handlebars #each loops for arrays
 * processEachLoops generates the HTML; 
 * AOS then scans that HTML for data-aos attributes. ,
 * Without this function, dynamic content wouldn't exist for AOS to animate.
 */
function processEachLoops(html, locale, pageName, messages) {
  // Match {{#each array.path}}...{{/each}} patterns
  const eachPattern = /\{\{#each\s+([\w-]+(?:\.[\w-]+)*)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  let match;
  
  while ((match = eachPattern.exec(html)) !== null) {
    const arrayKey = match[1];
    const template = match[2];
    let result = '';
    
    // Get the array from messages
    let array = null;
    
    // First try exact key match
    if (arrayKey in messages && Array.isArray(messages[arrayKey])) {
      array = messages[arrayKey];
    } else {
      // Try nested path resolution (e.g., "home.testimonials.items" or "testimonials.items")
      const keys = arrayKey.split('.');
      let value = messages;
      
      // Try direct nested path first
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          value = null;
          break;
        }
      }
      
      if (Array.isArray(value)) {
        array = value;
      } else {
        // Try with pageName prefix (e.g., "home.testimonials.items")
        const prefixedKey = `${pageName}.${arrayKey}`;
        const prefixedKeys = prefixedKey.split('.');
        value = messages;
        for (const k of prefixedKeys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            value = null;
            break;
          }
        }
        if (Array.isArray(value)) {
          array = value;
        }
      }
    }
    
    if (array) {
      const arrayLength = array.length;
      // Process each item in the array
      array.forEach((item, index) => {
        let itemHtml = template;
        // Replace {{property}} or {{nested.property}} or {{@index}} with item.property or item.nested.property
        // Note: @index is handled as a special case
        itemHtml = itemHtml.replace(/\{\{(@?[\w-]+(?:\.[\w-]+)*)\}\}/g, (m, prop) => {
          // Handle special variables first
          if (prop === '@index') {
            return index;
          }
          
          // Handle nested properties (e.g., "home.testimonials.items.length")
          if (prop.includes('.')) {
            // Check if it's an array length reference first
            if (prop.endsWith('.length')) {
              const baseKey = prop.replace('.length', '');
              if (baseKey === arrayKey || baseKey.endsWith(arrayKey.split('.').pop())) {
                return arrayLength;
              }
            }
            
            // Otherwise, try to resolve nested property from item
            const propKeys = prop.split('.');
            let value = item;
            for (const k of propKeys) {
              if (value && typeof value === 'object' && k in value) {
                value = value[k];
              } else {
                return m; // Return original if not found
              }
            }
            return value !== undefined && value !== null ? String(value) : m;
          } else {
            // Handle simple properties from item object
            if (item && typeof item === 'object' && prop in item) {
              const value = item[prop];
              return value !== undefined && value !== null ? String(value) : m;
            }
            return m;
          }
        });
        result += itemHtml;
      });
    }
    
    html = html.replace(match[0], result);
    // Reset regex to search from beginning
    eachPattern.lastIndex = 0;
  }
  
  return html;
}

/**
 * Generate navbar link path based on page depth
 */
function getNavLink(targetPage, currentPage) {
  if (currentPage === "home") {
    // From home page: links go to subdirectories
    return targetPage === "home" ? "index.html" : `${targetPage}/index.html`;
  } else {
    // From subdirectory pages: links go up one level
    return targetPage === "home" ? "../index.html" : `../${targetPage}/index.html`;
  }
}

/**
 * Generate language selector HTML with two separate links
 */
function getLangSelector(locale, pageName) {
  const otherLocale = locale === "en" ? "de" : "en";
  
  // Determine relative path based on page depth
  // Home page: ../{otherLocale}/index.html
  // Other pages: ../../{otherLocale}/{page}/index.html
  const otherPath = pageName === "home" 
    ? `../${otherLocale}/index.html`
    : `../../${otherLocale}/${pageName}/index.html`;
  
  // Current page path (for the active language link - just current page)
  const currentPath = pageName === "home"
    ? `index.html`
    : `${pageName}/index.html`;
  
  const currentLang = locale.toUpperCase();
  const otherLang = otherLocale.toUpperCase();
  
  // Generate paths for both languages - always use full paths to avoid confusion
  const enPath = pageName === "home" 
    ? "../en/index.html"
    : `../../en/${pageName}/index.html`;
  
  const dePath = pageName === "home"
    ? "../de/index.html"
    : `../../de/${pageName}/index.html`;
  
  const enActive = locale === "en" ? " navbar__lang-button--active" : "";
  const deActive = locale === "de" ? " navbar__lang-button--active" : "";
  
  return `<span class="navbar__lang-buttons">
    <a href="${dePath}" class="navbar__lang-button${deActive}"${locale === "de" ? ' aria-current="page"' : ''}>DE</a>
    <span class="navbar__lang-separator">•</span>
    <a href="${enPath}" class="navbar__lang-button${enActive}"${locale === "en" ? ' aria-current="page"' : ''}>EN</a>
  </span>`;
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
  return html.replace(/\{\{([\w-]+(?:\.[\w-]+|:[\w-]+)*)\}\}/g, (match, key) => {
    // Special case: {{locale}} -> replace with actual locale
    if (key === "locale") {
      return locale;
    }
    
    // Special case: {{base-path}} -> relative path to root (../ for home, ../../ for subdirs)
    if (key === "base-path") {
      return pageName === "home" ? "../" : "../../";
    }
    
    // Special case: {{lang-switcher}} -> generate language selector HTML with two separate links
    if (key === "lang-switcher") {
      return getLangSelector(locale, pageName);
    }
    
    // Special case: {{nav-link:pageName}} -> generate navbar link path
    if (key.startsWith("nav-link:")) {
      const targetPage = key.replace("nav-link:", "");
      return getNavLink(targetPage, pageName);
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
              // If this is an image path, prepend base-path and remove leading ../
              if ((keys[keys.length - 1] === 'image' || keys[keys.length - 1] === 'imageWebP') && typeof value === 'string') {
                const basePath = pageName === "home" ? "../" : "../../";
                // Remove leading ../ if present and prepend base-path
                const cleanPath = value.replace(/^\.\.\//, '');
                return basePath + cleanPath;
              }
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
  const messages = loadMessages(locale, pageName);
  const templateDir = path.dirname(templatePath);
  
  // Process partial includes first (before placeholder replacement)
  html = includePartials(html, templateDir, locale, pageName, messages);

  // Process #each loops before placeholder replacement
  html = processEachLoops(html, locale, pageName, messages);

  // Replace remaining placeholders
  html = replacePlaceholders(html, locale, pageName, messages);

  // Remove empty elements (elements that only contain whitespace or unresolved placeholders)
  // This handles cases where optional content like {{hero.alert}} or {{hero.subtitle}} is empty or not found
  html = html.replace(/<p[^>]*class="hero__alert-text"[^>]*>\s*({{[^}]+}})?\s*<\/p>/gi, '');
  html = html.replace(/<p[^>]*class="hero__subtitle"[^>]*>\s*({{[^}]+}})?\s*<\/p>/gi, '');
  // Remove alert wrapper if it contains empty alert
  html = html.replace(/<div[^>]*class="hero__alert-wrapper"[^>]*>\s*<div[^>]*class="hero__alert"[^>]*>\s*<div[^>]*class="hero__alert-icon"[^>]*><\/div>\s*<\/div>\s*<\/div>/gi, '');

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
