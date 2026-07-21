# Trading Journal

A single-page trading journal app. All data is stored online via JSONBin so you see the same trades and strategies from any device.

---

## How it works

- `index.html` — the app (HTML + CSS)
- `app.js` — all the JavaScript logic
- Data is saved to **JSONBin.io** (a free online JSON storage service) — no server, no database needed

---

## Setup from scratch

### 1. Create a JSONBin account

1. Go to [https://jsonbin.io](https://jsonbin.io) and sign up for free
2. Click **New Bin**
3. Paste `{"_init":true}` as the content and click **Create Bin**
4. Copy the **Bin ID** from the URL — it looks like `6a5fd787da38895dfe7ca4f7`

### 2. Get your API Key

1. In JSONBin, go to **API Keys**
2. Click **Create Key**
3. Copy the key — it starts with `$2a$10$...`

### 3. Put your credentials in app.js

Open `app.js` and find this section near the top:

```js
function jsonbinConfig() {
  return {
    key: 'YOUR_API_KEY_HERE',
    bin: 'YOUR_BIN_ID_HERE',
  };
}
```

Replace `YOUR_API_KEY_HERE` and `YOUR_BIN_ID_HERE` with your real values.

### 4. Push to GitHub

```bash
git add index.html app.js
git commit -m "setup trading journal"
git push
```

### 5. Deploy on Netlify

1. Go to [https://netlify.com](https://netlify.com) and sign up
2. Click **Add new site → Import an existing project**
3. Connect your GitHub repo
4. Leave all build settings empty (no build command needed)
5. Click **Deploy**

Netlify gives you a URL like `https://your-journal.netlify.app` — open it from any PC and your data is always in sync.

---

## Using on a second PC

No setup needed. Just open the same Netlify URL. Everything reads and writes to the same JSONBin — trades, strategies, accounts, all of it.

---

## Notes

- The free JSONBin plan gives you 10,000 requests/month — enough for years of daily use
- Your API key is in `app.js`. If your GitHub repo is public, anyone who finds it can read/write your bin. Use a private repo if that concerns you.
- Theme preference (dark/light) is saved per-browser, not synced — that's intentional
