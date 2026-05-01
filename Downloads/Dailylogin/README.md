# 90-Day Mastery Tracker

Static single-page tracker: daily logs, weekly reviews, skills checklist, JSON export/import. Deploy anywhere static files are served.

## Deploy on Vercel

1. Create a Git repository and push this folder (include `index.html` at the repo root).
2. Sign in at [vercel.com](https://vercel.com) and choose **Add New Project**.
3. Import the Git repository. Use the default settings; Vercel serves `index.html` automatically for static projects.
4. After deploy, open the production URL on your phone or laptop.

You do **not** need a legacy `vercel.json` with `@vercel/static` builds for a single HTML file at the root.

## Data storage and “sync”

- Logs are stored in the browser’s **localStorage** for that device and browser only.
- Opening the same site on another device **does not** copy your data. Use **Data & export → Export JSON**, move the file (Drive, iCloud, email), then **Import** on the other device.
- Export regularly so you do not lose data if you clear site data or switch browsers.

## Local preview

Open `index.html` in a browser, or from this directory run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Edit the app

Change `index.html` in Cursor (or the GitHub web editor), commit, and push. Vercel will redeploy on push if the project is connected to Git.
