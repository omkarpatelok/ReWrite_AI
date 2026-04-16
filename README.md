# ✦ ReWriteAI — AI Content Rewriter

A minimal, beautiful AI-powered content rewriter. Paste robotic-sounding text → get natural human output.

---

## 🚀 Quick Start

### 1. Get a Free API Key
Go to [Google AI Studio](https://aistudio.google.com/app/apikey) and create a free Gemini API key.

### 2. Setup the Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env and paste your API key
node index.js
```

### 3. Setup the Frontend

```bash
cd client
npm install
npm run dev
```

### 4. Open in Browser
Visit: `http://localhost:5173`

---

## 📁 Project Structure

```
ai-rewriter/
 ├── client/          # React frontend (Vite)
 │   ├── src/
 │   │   ├── App.jsx  # Main UI component
 │   │   ├── main.jsx
 │   │   └── index.css
 │   └── index.html
 └── server/          # Express backend
     ├── index.js     # API server
     └── .env.example # Environment template
```

---

## ✨ Features

- **4 tone modes**: Natural, Formal, Casual, Academic
- **10,000 character limit** with live counter
- **Copy to clipboard** button
- **Loading skeleton** animation
- **Error handling** for API failures

---

## 🚢 Deploy

**Frontend → Vercel**
```bash
cd client
npm run build
# Upload dist/ to Vercel or connect GitHub repo
```

**Backend → Render**
- Create a new Web Service on render.com
- Set `API_KEY` as an environment variable
- Deploy the `/server` folder

---

## 🔮 Next Steps

- [ ] Add Firebase login
- [ ] Add usage limits per user
- [ ] Add Razorpay payment integration
- [ ] Support longer text with chunking
