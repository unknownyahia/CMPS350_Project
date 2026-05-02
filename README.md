# CMPS350 Social Platform - Phase 2

## Project Description

This is a Phase 2 social media platform for CMPS350. The original frontend-only project was upgraded into a Next.js + React application with Prisma, SQLite, API routes, a repository layer, seed data, and a database-backed statistics page.

Users can register, log in, create posts/messages, like posts, comment, delete their own posts/comments, follow/unfollow users, search users, view public profiles, edit their own profile, upload a profile image, and view statistics.

## Technologies Used

- Next.js
- React
- Prisma
- SQLite
- JavaScript
- CSS
- Next.js API routes
- Repository layer

## Important Notes

- Do not open this project by double-clicking HTML files.
- This is a Next.js project and must be run with Node.js.
- All real application data is stored in SQLite through Prisma.
- localStorage is not used as the database. It only stores the current logged-in user id for the simple browser session.
- `node_modules` is not included in the submitted folder. Run `npm install` first.

## Setup From Zero

1. Install Node.js if it is not already installed.
2. Unzip the project folder.
3. Open a terminal in the project folder.
4. Install dependencies:

```bash
npm install
```

5. Create/rebuild the SQLite database from the Prisma migration:

```bash
npm run migrate
```

6. Populate the database with demo users, posts, comments, likes, and follows:

```bash
npm run seed
```

7. Run the development server:

```bash
npm run dev
```

8. Open this URL in the browser:

```text
http://localhost:3000
```

## Exact Command Sequence

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

## Seeded Demo Data

The seed script creates:

- 10 users
- 30 posts/messages
- 45 comments
- 98 likes
- 23 follow relationships

Yahia does not follow Abdulaziz at the start. This makes the follow/unfollow feed demo clear: Abdulaziz's posts appear after Yahia follows him and disappear after Yahia unfollows him.

## Test Accounts

All seeded users use the password `Passw0rd!`.

```text
yahia@example.com / Passw0rd!
abdulaziz@example.com / Passw0rd!
noura@example.com / Passw0rd!
saleh@example.com / Passw0rd!
reem@example.com / Passw0rd!
hamad@example.com / Passw0rd!
maryam@example.com / Passw0rd!
omar@example.com / Passw0rd!
layla@example.com / Passw0rd!
khalid@example.com / Passw0rd!
```

## Important Pages

- `/`
- `/login`
- `/register`
- `/users`
- `/profile/[id]`
- `/post/[id]`
- `/stats`

## API Routes

- `POST /api/auth/login`
- `GET /api/users`
- `GET /api/users/[id]`
- `POST /api/users`
- `PUT /api/users/[id]`
- `GET /api/posts`
- `GET /api/posts/[id]`
- `POST /api/posts`
- `DELETE /api/posts/[id]`
- `POST /api/comments`
- `DELETE /api/comments/[id]`
- `POST /api/likes`
- `DELETE /api/likes`
- `POST /api/follows`
- `DELETE /api/follows`
- `GET /api/stats`

## Statistics Page

The `/stats` page shows demo-friendly database statistics:

- Total users
- Total posts
- Average posts per user
- Total comments
- Total likes
- Total follows
- Average followers per user
- Most frequent post word

Each statistic includes a short note explaining which action can change it during the demo video.

## Demo Video

Use `DEMO_SCRIPT.md` for the required video scenarios:

- Scenario A: User activity and following
- Scenario B: Cross-account visibility
- Scenario C: Statistics features changing after actions

## Submission Notes

Do not submit:

- `node_modules`
- `.next`
- `.DS_Store`
- `__MACOSX`
- `.idea`
- `.git`
