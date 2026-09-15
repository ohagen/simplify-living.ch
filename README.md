# Simplify Living - Static HTML Site

Pre-rendered static HTML site with i18n support (German/English)

<br>

## 1. Project Structure

Read along to understand how the code is organised.

```
simplify-living.ch/
├── archive/                        # Original WordPress code (NOT USED AT ALL)
├── de/                             # Final HTML German pages automatically generated (DO NOT TOUCH)
├── en/                             # Final HTML English pages automatically generated (DO NOT TOUCH)
├── fonts/                          # Font files
├── images/                         # Images and logos
├── js/                             # JavaScript files
├── messages/                       # All page content in JSON
│   ├── de/                             # All German content
│   └── en/                             # All English content 
├── styles/                         # SCSS files
│   ├── base/                           # Base styles (variables, fonts, etc.)
│   ├── components/                     # Reusable component styles (navbar, hero, footer, etc.)
│   └── main.css                        # Compiled CSS output (DO NOT TOUCH)
│   └── main.css.map                    # Source map for compiled CSS (DO NOT TOUCH)
│   ├── main.scss                       # Main SCSS entry point (DO NOT TOUCH)
├── templates/                      # HTML templates with {{placeholders}}
│   ├── components/                     # Reusable partials used across multiple pages (head, navbar, footer, hero)
│   └── *.html                          # All pages on your website (Home, About, Services, etc.)
├── build.js                        # Build script - generates HTML from templates
├── google46e6b753d738807d.html     # Google Search Console domain verification
├── netlify.toml                    # Netlify build, publish, and redirect config
├── robots.txt                      # Crawler rules (what search engines may index)
├── sitemap.xml                     # URL list for search engines to crawl 
├── watch.js                        # File watcher - auto-rebuilds on template/message changes
```

<br>

## 2. How to get the code working

In Visual Studio Code, open a terminal and type the following commands.

### 1. Only once, for the first time, to install dependencies:
```bash
npm install
```

### 2. Every time you want to add/change something:

#### Step 1 – In terminal 1 type:

```bash
node watch.js
```
*Goal: watch templates/messages and auto-rebuild HTML*

#### Step 2 – In terminal 2 type:

```bash
npm run watch:css
```
*Goal: watch SCSS and auto-compile CSS*

#### Step 3 – Go to de/index.html and right click 'Open with Live Server' so you can see your page and changes in your browser

<br>

## 3. How to edit your page

0. Before starting to edit your page, you must create your own branch where you'll edit/add your new code/stuff. You can name it, for eg, `simone/simplify-living`. 
    - How? In Visual Studio Code, open a terminal and type:
      ```json
      git checkout -b simone/simplify-living
      ```
    - Check your left bottom corner and you'll see you're on your branch.

1. **Preview page in your browser:**
    - Go to `de/index.html` 
    - Right click 'Open with Live Server'
    - See your page as it is now in your browser

2. **Edit page/HTML structure:**
    - Every page and component (eg. footer) of your website lives under folder `templates/`
    - If you want to add a new section, new headings (titles), new text, you add the HTML element here (eg. an 'h1' or a 'p') - but NOT its text content. That's in step 3.

3. **Edit text content for every page:** 
    - All text content lives under folders `messages/de/` and messages/en`
    - If you change text content in German, you must change it also in English

4. **Edit the styles (CSS) of your page:** 
    - All CSS styles live under folder `styles/`
    - In `styles/base` you'll find general and shared styles for all your website
    - In `styles/components` you'll find the styles for each component (eg. cta-buttons) or each page
    - **IMPORTANT**: In `styles/components/_content.scss` lives most of the styles for headings, text and images used across all pages

5. **Add a new page:**
    - Create `templates/newpage.html` (can use partials with `{{> common/...}}`)
    - Add content to `messages/de/newpage.json` and `messages/en/newpage.json`:

      ```json
      {
        "newpage.title": "New Page",
        "newpage.description": "Page description for SEO",
        "newpage.content": "..."
      }
      ```
    - Add to `build.js` PAGES array:
      ```javascript
      {
        name: "newpage",
        template: "templates/newpage.html",
        output: "newpage/index.html",
      }
      ```
    - Run `node build.js` or use `node watch.js` for auto-rebuild

6. **Deploy/Publish changes for the world to see:**

    ```json
    git add . 

    git commit -m "Add new image to homepage" // just an example
    // These 2 steps above MUST be done with every change you make to your page
    // Ask Oskar to explain to you how Git works

    git push origin simone/simplify-living // your own branch, rmemember?
    // Then ask Oskar to merge it with Main branch on GitHub so the world can see your page latest changes
      ```

<br>

## 4. Build for production 

**What is this for?** When you're done with your changes and want to see how the page would look like if you'd publish it, this build gives you a preview of how the page will look like when you deploy/publish your changes. But doing this will not deploy/publish your page - don't worry.

```bash
# Compile SCSS to CSS
npm run build:css

# Generate all HTML pages from templates
npm run build
# or
node build.js
```

<br>

## 5. Services included in your website

### Form contact - Formspree
- Link: https://formspree.io/login
- Conditions: 
  - Free
  - 50 submissions per month limit
  - Instant email notifications on form submissions
  - Usage alerts at 50%, 75%, 90%, and 100% of monthly limit
  - Up to 2 email addresses for notifications (you can later add your personal email if you wish on your Formspree account)

### Analytics - Umami
- Link: https://cloud.umami.is/login
- Conditions:
  - Free

### Deployment - Netlify
- Link: https://app.netlify.com/login/email
- Conditions:
  - Free
  - Paired with Oskar's DNS

### Google Search Console
- Link: https://search.google.com/search-console/ownership?resource_id=https%3A%2F%2Fsimplify-living.ch%2F 
- **What it is:** A free Google tool to prove you own the site (so only you can see the data), tell Google which pages to crawl (visit and read your pages so they can show up in search results), and see how the site appears in Google Search (e.g. which search terms led to your site, how many people clicked, which pages Google has stored).
- **What was done:** The site was verified as yours (Google now knows you’re the owner) using two methods:
  1. **HTML file:** A small file `google46e6b753d738807d.html` was added to the site. As long as this file stays online at `https://simplify-living.ch/google46e6b753d738807d.html`, ownership stays verified. Do not delete it.
  2. **HTML tag:** A meta tag was added in the page header (a hidden line in the page code that only Google reads; same purpose, backup method).
- **Goal:** Nothing additional must be done. The goal is so you can submit the sitemap (a list of your pages so Google knows what to look at), see which pages Google has indexed (saved so they can appear in search results), and (optionally) view search performance (how often your site showed up on Google and how many people clicked). No ongoing action required unless you want to use those reports.

### Robots and sitemap (for search engines)

Two files in the project help search engines (like Google) understand and visit your site. You don’t need to change them unless you add or remove whole sections of the site.

- **robots.txt**  
  A short set of instructions that search engines read when they first visit your site. Ours says: “You may visit all pages” (Allow: /) and “Here is the list of pages to look at” (the sitemap). So it’s a welcome note, not a block. (Crawlers are the programs that scan the web to build search results; robots.txt tells them what they’re allowed to do on your site.)

- **sitemap.xml**  
  A list of the important pages on your site (home, about, services, contact, etc.) with their full URLs. We give this list to Google (via Google Search Console) so it knows which pages exist and can include them in search. (Indexing means Google saves and can show a page in search results.) If you add or remove a main page, this list should be updated so search engines stay in sync with your site.

<br>

## 6. Compress images and convert formats

I use this page to decrease the size of images used in this page and convert .png to .webp. It's intuitive and easy to use.                  

EVERY IMAGE YOU ADD SHOULD BE COMPRESSED (MADE SMALLER) AND HAVE BOTH .JPG/.PNG **AND** .WEBP EXTENSIONS.                 


https://squoosh.app/

