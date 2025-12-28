# Deployment Guide for DiviLauncher

## ⚠️ Important: Bluehost Shared Hosting Limitation

**Bluehost shared hosting does NOT support Node.js/Next.js applications.** Shared hosting is designed for PHP/WordPress sites, not Node.js apps.

## Your Options

### Option 1: Vercel (RECOMMENDED - Easiest & Free) ⭐

Vercel is made by the creators of Next.js and is the easiest way to deploy.

**Pros:**
- ✅ Free tier (perfect for starting out)
- ✅ Automatic deployments from GitHub
- ✅ Built specifically for Next.js
- ✅ Automatic SSL certificates
- ✅ Global CDN
- ✅ Environment variables management
- ✅ Zero configuration needed

**Steps:**

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/DiviLauncher.git
   git push -u origin main
   ```

2. **Sign up for Vercel:**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables:**
   In Vercel dashboard, go to Settings → Environment Variables and add:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   ```

4. **Deploy:**
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your site will be live in ~2 minutes!

**Your site will be at:** `https://your-project.vercel.app`

---

### Option 2: Netlify (Also Great & Free)

Similar to Vercel, also excellent for Next.js.

**Steps:**
1. Push code to GitHub
2. Go to https://netlify.com
3. Sign up and connect GitHub
4. Import repository
5. Add environment variables
6. Deploy!

---

### Option 3: Railway (Good for Full-Stack Apps)

**Pros:**
- ✅ Free tier available
- ✅ Easy PostgreSQL setup
- ✅ Good for apps with databases
- ✅ Simple deployment

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Deploy from GitHub
5. Add PostgreSQL database (or use your Supabase)
6. Add environment variables
7. Deploy!

---

### Option 4: Bluehost VPS/Dedicated Server (If You Have It)

If you have Bluehost VPS or dedicated server with root access, you can deploy there.

**Requirements:**
- VPS or dedicated server with root access
- Node.js 18+ installed
- PM2 (process manager) installed
- Nginx (reverse proxy)

**Steps:**

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js (if not installed):**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Clone your repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DiviLauncher.git
   cd DiviLauncher
   ```

5. **Install dependencies:**
   ```bash
   npm install
   ```

6. **Build the application:**
   ```bash
   npm run build
   ```

7. **Set up environment variables:**
   ```bash
   nano .env.production
   ```
   Add:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT.supabase.co:5432/postgres
   NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   NODE_ENV=production
   ```

8. **Start with PM2:**
   ```bash
   pm2 start npm --name "divilauncher" -- start
   pm2 save
   pm2 startup
   ```

9. **Set up Nginx reverse proxy:**
   ```bash
   sudo nano /etc/nginx/sites-available/divilauncher
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/divilauncher /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

11. **Set up SSL (Let's Encrypt):**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

---

### Option 5: Render (Good Alternative)

**Pros:**
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Good documentation

**Steps:**
1. Go to https://render.com
2. Sign up
3. Create new Web Service
4. Connect GitHub repository
5. Add environment variables
6. Deploy!

---

## Recommended: Use Vercel

For a Next.js app, **Vercel is the best choice** because:
- It's made by the Next.js team
- Zero configuration needed
- Free tier is generous
- Automatic deployments
- Built-in CDN and SSL

## Before Deploying

1. **Update environment variables for production:**
   - Make sure `DATABASE_URL` points to your Supabase database
   - Update `NEXT_PUBLIC_SOLANA_RPC_URL` if needed
   - Never commit `.env` files to GitHub

2. **Test the build locally:**
   ```bash
   npm run build
   npm start
   ```
   Visit `http://localhost:3000` to make sure everything works.

3. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

## Quick Start with Vercel (5 minutes)

1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables
5. Deploy!

That's it! Your site will be live.

---

## Need Help?

If you need help with any of these options, let me know which one you'd like to use and I can provide more detailed instructions!

