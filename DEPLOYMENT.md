
# 🚀 Deployment Guide — Form Genie Pro

This guide outlines how to deploy **Form Genie Pro** using the industry-standard stack:
- **Frontend**: Vercel (Fast, Global CDN)
- **Backend**: Render (Reliable Node.js hosting)

## 🔐 1. Secrets Management

**NEVER commit your `.env` file to GitHub.**
The project is configured to ignore `.env` files. You will set secrets manually in the Vercel/Render dashboards.

---

## 🐙 2. GitHub Repository

1.  Create a **Private** repository named `Form-Genie-Pro` on [GitHub](https://github.com/new).
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of Form Genie Pro"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/Form-Genie-Pro.git
    git push -u origin main
    ```

---

## 🌐 3. Backend Deployment (Render)

We will deploy the `server` folder to **Render**.

1.  **Create Web Service** on [Render Dashboard](https://dashboard.render.com/):
    - Connect your repo `Form-Genie-Pro`.
    - **Name**: `form-genie-server`
    - **Root Directory**: `server` (Important!)
    - **Environment**: `Node`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`
    - **Env Vars**: Add **ALL** values from your `server/.env` file.
      - `ENCRYPTION_KEY`, `SUPABASE_URL`, `JWT_SECRET`, etc.

2.  **Copy URL**: Once live, copy the URL (e.g., `https://form-genie-server.onrender.com`).

---

## 🎨 4. Frontend Deployment (Vercel)

We will deploy the `client` folder to **Vercel**.

1.  **Import Project** on [Vercel Dashboard](https://vercel.com/dashboard):
    - Import `Form-Genie-Pro` from GitHub.

2.  **Configure Project**:
    - **Framework Preset**: `Vite`
    - **Root Directory**: Click `Edit` and select `client`.

3.  **Environment Variables**:
    - Add the following variable:
        - **Name**: `VITE_API_URL`
        - **Value**: Your Render Backend URL (e.g., `https://form-genie-server.onrender.com`)
          - *Note: Do not add a trailing slash `/`.*

4.  **Deploy**: Click **Deploy**.

---

## ✅ 5. Final Verification

1.  Open your Vercel URL (e.g., `https://form-genie-pro.vercel.app`).
2.  **Register a new user**: Verify email sends and user appears in DB.
3.  **Login as Admin**: Verify admin dashboard loads.
4.  **Test Automation**: Run a form automation to ensure credits deduct correctly.

---

## 🛠 Troubleshooting

- **Server fails to start?**
  - Check Render logs. Ensure `ENCRYPTION_KEY` matches your local one.
  - Ensure `package.json` in `server` has `"type": "module"`.

- **Frontend API errors?**
  - Check `VITE_API_URL` in Vercel settings.
  - Ensure CORS is allowed on the server (it is configured to allow all origins by default in `index.ts`).
