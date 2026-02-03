# 🚀 Quick Deployment Guide

## Option 1: Netlify (Recommended - Easiest!)

### Method A: Drag & Drop (No GitHub needed)

1. **Build the project locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Go to Netlify**:
   - Visit https://app.netlify.com/drop
   - Drag the `dist` folder onto the page
   - Done! Your site is live instantly

### Method B: Connect GitHub

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Netlify**:
   - Go to https://app.netlify.com/
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select your repository
   - Build settings (auto-detected):
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Your site will be live at**: `https://random-name.netlify.app`
   - You can customize the domain in Site settings

---

## Option 2: Vercel

### Deploy with GitHub

1. **Push to GitHub** (same as above)

2. **Deploy on Vercel**:
   - Go to https://vercel.com/
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Framework Preset: **Vite** (auto-detected)
   - Click "Deploy"

3. **Your site will be live at**: `https://your-project.vercel.app`

---

## Option 3: GitHub Pages (Free!)

1. **Update `vite.config.js`**:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     base: '/number-guessing-game/', // Your repo name
   });
   ```

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to `package.json` scripts**:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to your repo Settings → Pages
   - Source: gh-pages branch
   - Your site: `https://yourusername.github.io/number-guessing-game/`

---

## Option 4: Render

1. **Push to GitHub**

2. **Deploy on Render**:
   - Go to https://render.com/
   - Click "New +" → "Static Site"
   - Connect your repository
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Click "Create Static Site"

---

## Testing Locally First

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test production build
npm run build
npm run preview
```

Open http://localhost:5173 to test!

---

## Common Issues & Fixes

### ❌ "npm: command not found"
**Fix**: Install Node.js from https://nodejs.org/

### ❌ Build fails with dependency errors
**Fix**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ Blank page after deployment
**Fix**: Check `base` in `vite.config.js` matches your URL path

### ❌ Styles not loading
**Fix**: Ensure all CSS imports are correct in `main.jsx`

---

## 🎉 You're Done!

Your game is now live and ready to share! Share the URL with friends and challenge them to beat your high score!

### Next Steps:
- 📱 Share on social media
- 🎮 Add your own features
- 🏆 Create a leaderboard
- 🌍 Add multiplayer mode

Need help? Check the main README.md for more details!
