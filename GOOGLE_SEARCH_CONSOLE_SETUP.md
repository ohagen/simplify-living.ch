# Google Search Console Setup Guide

## Important: You DON'T need a Google-hosted email!

Any email address works for Google Search Console (including info@simplify-living.ch). You just need to:
1. Sign up at https://search.google.com/search-console
2. Verify ownership of your website
3. Use any email address you have access to

## Verification Methods

Google Search Console offers several verification methods. We'll use the **HTML file upload** method since you already have the file structure set up.

## Step-by-Step Setup

### 1. Sign Up for Google Search Console

1. Go to https://search.google.com/search-console
2. Click "Start now" or "Add property"
3. Enter your website URL: `https://simplify-living.ch`
4. Click "Continue"

### 2. Choose Verification Method

Select **"HTML file upload"** method.

### 3. Get Your Verification Code

Google will show you:
- A filename (e.g., `google46e6b753d738807d.html`)
- A verification code (a long string like `46e6b753d738807d...`)

### 4. Update Your Files

Once you have the verification code from Google, you need to update:

#### A. Update the verification HTML file

The file `google46e6b753d738807d.html` should contain ONLY the verification code that Google provides. It should look like:

```
google-site-verification: YOUR_ACTUAL_VERIFICATION_CODE_HERE
```

**NOT** the filename, but the actual code Google gives you.

#### B. Update the meta tag (optional - for alternative verification)

If you prefer using the meta tag method instead, update the verification code in:
- `messages/de/common.json`
- `messages/en/common.json`

Change:
```json
"google-verification-code": "google46e6b753d738807d.html"
```

To:
```json
"google-verification-code": "YOUR_ACTUAL_VERIFICATION_CODE_HERE"
```

### 5. Deploy and Verify

1. Build your site: `npm run build`
2. Deploy the updated files to your server
3. Go back to Google Search Console
4. Click "Verify"
5. Once verified, you can submit your sitemap

### 6. Submit Your Sitemap

After verification:
1. Go to "Sitemaps" in the left menu
2. Enter: `sitemap.xml`
3. Click "Submit"

## Current Status

✅ **Ready:**
- `robots.txt` - correctly configured
- `sitemap.xml` - correctly configured
- Verification file structure - ready (needs actual code)

❌ **Needs Action:**
- Get verification code from Google Search Console
- Update `google46e6b753d738807d.html` with actual code
- Deploy and verify

## Alternative: Meta Tag Method

If you prefer the meta tag method (easier, no file upload needed):

1. In Google Search Console, choose "HTML tag" method
2. Copy the `content` value from the meta tag Google shows you
3. Update `messages/de/common.json` and `messages/en/common.json`:
   ```json
   "google-verification-code": "paste-the-code-here"
   ```
4. Rebuild: `npm run build`
5. Deploy and verify

The meta tag is already in your `head.html` template, so this method will work immediately once you update the code.

## Need Help?

If you're stuck:
1. Make sure the verification file is accessible at: `https://simplify-living.ch/google46e6b753d738807d.html`
2. Check that the file contains ONLY the verification code (no HTML, no extra text)
3. Try the meta tag method if file upload doesn't work
