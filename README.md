# DragonMates

A roommate-matching web app built by Drexel students, for Drexel students.

Last updated: 5/4/2026

## Features

- **Profile creation** — academic year, major, GPA, hometown, social links
- **Living style matching** — sleep/wake times, noise level, cleanliness, temperature, music preferences
- **Interests** — display your hobbies and interests
- **Explore** — search through other students' profiles
- **Likes & matches** — users are able to like profiles (a mutual like creates a match)
- **Notifications** — real-time alerts for likes and mutual matches between users

## Tech Stack

- [Next.js](https://nextjs.org) 16
- [React](https://react.dev) 19
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) 4
- [Supabase](https://supabase.com) (auth + database)

## Prerequisites

- **Node.js** v22+
- **npm** v10+
- A Supabase project (for auth and database)

## Getting Started

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd dragonmates
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the dev server**

   ```bash
   npm run dev
   ```

5. **Open the app** at [http://localhost:3000](http://localhost:3000)

## Scripts

| Command         | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start the dev server       |
| `npm run build` | Create a production build  |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint                 |

## Project Structure

```
app/
  (protected)/        # Authenticated routes
    dashboard/        # Profile overview
    explore/          # Browse all users
    matches/          # Mutual matches
    my-profile/       # Edit your profile
    notifications/    # Likes & match alerts
    profile/create/   # Profile setup wizard
    user/[user_id]/   # Public user profile + like button
  api/                # Route handlers
    auth/login/
    likes/
    matches/
    notifications/
    profiles/
    users/register/
  login/
  register/
  signup/
```
