
# FutureLove AI Partner Generator

Generate unique AI partner images by blending reference photos using Google’s Gemini API. Upload images of people you admire (with their permission!) and see what your future AI crush could look like.

Live Demo
👉 www.futurelove.tech

![App Screenshot](public/images/faces.png)


## Features

- **AI Image Generation:** Upload 2-5 images and generate a blended face using Google Gemini.
- **Free & Paid Credits:** 1 free credit on sign up, purchase more via Stripe.
- **Redo Generations:** Up to 3 free redos per generation.
- **Download Results:** Download your generated images.
- **Authentication:** Secure Google login via NextAuth.
- **Rate Limiting:** Prevents abuse with per-user request limits.
- **No Permanent Storage:** Uploaded images are not stored permanently.

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **AI:** Google Gemini API (`@google/genai`)
- **Auth:** NextAuth.js with Google provider
- **Payments:** Stripe Checkout
- **Rate Limiting:** Upstash Redis
- **Deployment:** Vercel (recommended)

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/gemini-image-gen-site.git
cd gemini-image-gen-site
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env` and `.env.local` files with the following (see `.env.example` if available):

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_KEY_2=your-backup-gemini-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
```

### 4. Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Create Page:** Upload 2-5 images, agree to the disclaimer, and generate your AI partner image.
- **Buy Credits:** Click "Buy More Credits" to purchase via Stripe.
- **Redo:** Use the "Redo" button for up to 3 free re-generations per set.
- **Download:** Download your generated image directly.

## Project Structure

```
src/
  app/           # Next.js app directory (routes, pages, API)
  components/    # Reusable React components
  lib/           # Utility libraries (auth, rate limiting, etc.)
  prisma/        # Prisma schema and migrations
  public/        # Static assets (images, icons)
```

## FAQ

See the [FAQ page](https://your-deployment-url/faq) in the app for more details.

---

**Note:** This project is for educational and entertainment purposes. Please use responsibly and only upload images with explicit consent.
