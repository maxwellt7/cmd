# Building & running in the cloud

You can build (and optionally deploy) this repo in the cloud so you don’t need to run heavy builds locally.

---

## Option 1: Vercel (build + deploy, recommended)

Vercel builds and hosts your Next.js app. Every push to `main` can trigger a build and deploy.

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Import** the `maxwellt7/cmd` repo.
3. Configure the project (Vercel may prefill a lot of this):

   - **Root Directory:** `apps/dashboard`  
     (So the project root for this deployment is the dashboard app.)
   - **Build Command:**  
     `cd ../.. && pnpm install && pnpm build --filter=@cmd/dashboard`
   - **Output Directory:** leave default (Vercel detects `.next` inside `apps/dashboard`).
   - **Install Command:** leave default, or set to `pnpm install` and use **Root Directory** = repo root (see below).

   **Alternative (repo root as Root Directory):**

   - **Root Directory:** *(leave empty — repo root)*
   - **Install Command:** `pnpm install`
   - **Build Command:** `pnpm build --filter=@cmd/dashboard`
   - Vercel will still need to know the app lives in `apps/dashboard`; use the dashboard’s **Root Directory** in the Vercel project settings if required (e.g. set “Application directory” or similar to `apps/dashboard` depending on UI).

4. **Environment variables:** In the Vercel project, add the same vars you have in `apps/dashboard/.env.local` (e.g. `DATABASE_URL`, Clerk keys). Do **not** commit `.env.local`; use Vercel’s Environment Variables UI.
5. Deploy. Future pushes to `main` will build and deploy in the cloud.

Vercel uses its own servers for the build, so your machine doesn’t do the work.

---

## Option 2: GitHub Actions (build only, no deploy)

The workflow in `.github/workflows/build.yml` runs a full install and build in GitHub’s cloud on every push to `main` and on pull requests. It does **not** deploy; it only verifies the build and uses cloud runners so your laptop doesn’t have to.

- **View runs:** GitHub repo → **Actions** tab.
- To also deploy from the same workflow, you can add a step (e.g. Vercel, or another provider) that deploys the built output.

---

## Summary

| Goal                         | Use                          |
|-----------------------------|------------------------------|
| Build + host the app        | **Vercel** (Option 1)        |
| Just build in the cloud (CI)| **GitHub Actions** (Option 2)|

Both options run the build in the cloud so your local machine doesn’t need to run the heavy build.
