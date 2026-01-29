# Deployment Guide for ProjectWizard

## Option A: Vercel (Recommended)
Vercel is the easiest for Next.js projects.

1.  **Push code to GitHub** (Ensure `.env.local` is ignored).
2.  **Import to Vercel**:
    *   Go to [vercel.com](https://vercel.com) and import repo.
    *   Add the following **Environment Variables**:
        *   `AICC_API_KEY`: Your token (`sk-HpFH...`)
3.  **Deploy**: Standard settings work out of the box.

## Option B: Koyeb
1.  **Push to GitHub**.
2.  **Create Service** on Koyeb.
3.  **Build Settings**:
    *   Build command: `npm run build`
    *   Run command: `npm run start`
4.  **Environtment Variables**:
    *   Add `AICC_API_KEY`.
    *   Optional: `NODE_ENV=production`.

---

©HIMASAKTA-DEV 2026  
