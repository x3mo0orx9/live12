
# ITAM Live — GitHub Pages Starter

This folder is ready to upload to **GitHub** and publish with **GitHub Pages**.

## 1) Create a GitHub repository
- Go to https://github.com/new
- **Repository name:** `itam-live` (or any name)
- Choose **Public** (or Private if you prefer)
- Click **Create repository**

## 2) Upload these files (web UI, no git needed)
- Click **"Add file" → "Upload files"**
- Drag & drop the two files from this folder:
  - `index.html`
  - `.nojekyll`
- Click **Commit changes**

## 3) Enable GitHub Pages
- In your repo: **Settings → Pages**
- **Source:** "Deploy from a branch"
- **Branch:** `main` and **/ (root)**
- Click **Save**
- Wait 1–2 minutes, then open the site link shown there (something like `https://<yourname>.github.io/itam-live/`).

## 4) Connect to your Supabase (one time per browser)
- On the website, click the black **"Connect DB"** button (bottom-right).
- Paste your **Supabase URL** and **Anon public key** → **Save**.
- Enter your Supabase **email/password** → **Login**.
- Done. Your **Assets** tab is live.

## 5) Update site later
- Any time you want to update, upload a new `index.html` to the repo (Commit changes). GitHub Pages auto-updates.

### Notes
- Keys are safe because we use the **public anon key** and **Row Level Security** (RLS) in Supabase.
- If you need a custom domain later, add a `CNAME` file and set it in **Settings → Pages**.
