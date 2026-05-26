# Tournament Hub - Serverless Next.js App

A serverless Next.js application with Supabase backend and Vercel deployment.

## Tech Stack

- **Frontend & Backend**: Next.js 16+ with TypeScript
- **Database & Auth**: Supabase
- **Deployment**: Vercel
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## Setup

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account for deployment

### Environment Variables

The `.env.local` file is already configured with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kulepxnymckttanefiql.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_rUEUGpCmveUZKsxOEmJIWw_9bSIcSc3
```

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

```bash
npm run build
npm start
```

## Project Structure

```
tournament-hub/
├── app/
│   ├── api/              # Serverless API routes
│   │   └── health/       # Example health check endpoint
│   ├── page.tsx          # Home page
│   └── layout.tsx        # Root layout
├── lib/
│   ├── supabase-client.ts # Browser-side Supabase client
│   └── supabase-server.ts # Server-side Supabase client
├── public/               # Static assets
├── .env.local            # Environment variables
├── next.config.js        # Next.js configuration
├── vercel.json           # Vercel deployment configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies
```

## API Routes (Serverless Functions)

API routes in `app/api/` are automatically converted to serverless functions when deployed to Vercel.

### Example: Health Check

- **Endpoint**: `GET /api/health`
- **Response**: `{ message: "API is healthy", timestamp: "..." }`

## Database Integration

Supabase clients are configured in the `lib/` directory:

- **Browser Client** (`lib/supabase-client.ts`): For client-side operations
- **Server Client** (`lib/supabase-server.ts`): For server-side operations and authentication

## Authentication (Coming Soon)

Supabase Auth is configured and ready to use. Next steps:
1. Enable auth providers in Supabase dashboard
2. Create auth components in the app
3. Set up protected routes

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy!

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
