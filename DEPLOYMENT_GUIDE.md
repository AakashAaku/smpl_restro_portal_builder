# VenzoSmart Hosting & Deployment Guide

Your application is now **Production Ready**. Here are the steps to host it in your cafe:

## Option 1: Local Hosting (Recommended for Cafe Internal Use)

To run this in your cafe's local network so staff can access it via tablets/phones:

1.  **Build the Project:**
    ```bash
    npm run build
    ```
2.  **Start the Production Server:**
    ```bash
    npm run start
    ```
3.  **Access inside Cafe:**
    - Find your computer's local IP (e.g., `192.168.1.10`).
    - Other devices can connect via `http://192.168.1.10:8080`.

## Option 2: Production Hosting (Cloud)

### Prerequisites
- A PostgreSQL database (e.g., Supabase, Railway, or Render).
- Your `.env` file updated with the `DATABASE_URL`.

### Deployment Steps (e.g., on Render or Railway)
1.  **Build Command:** `npm install && npm run build`
2.  **Start Command:** `npm run start`
3.  **Environment Variables:**
    - `DATABASE_URL`: Your production DB link.
    - `JWT_SECRET`: A strong random string.
    - `VITE_API_URL`: `/api` (for same-origin hosting).

## Post-Deployment Setup
- Run the seed command once on your production database to set up the admin account:
  ```bash
  npx prisma db seed
  ```

> [!TIP]
> **VenzoSmart** is optimized for high-performance Node.js environments. For the best "Organic" feel, serve over HTTPS.
