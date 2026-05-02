# Demo Video Script

Use this script while recording the Phase 2 demo video. Keep the browser open at `http://localhost:3000`.

Before recording, run:

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

## Scenario A — User Activity & Following

Goal: show that a user can create messages, view them on their profile, delete one, follow another user, and see the feed change.

1. Open `/login`.
2. Say: "I will log in as Yahia."
3. Log in with:

```text
yahia@example.com / Passw0rd!
```

4. On the home page `/`, create message 1:

```text
Yahia demo message one for Scenario A.
```

5. Create message 2:

```text
Yahia demo message two for Scenario A.
```

6. Open Yahia's profile from the sidebar Profile link.
7. Say: "Both new Yahia messages appear on Yahia's profile because posts are stored in SQLite."
8. Delete one of the two new messages using the Delete button and custom confirmation modal.
9. Say: "One message remains after deletion."
10. Open `/users`.
11. Search for `abdulaziz` if needed.
12. Click `Follow` for Abdulaziz.
13. Return to the home feed `/`.
14. Say: "Yahia now follows Abdulaziz, so Abdulaziz's messages appear in the news feed."
15. Open `/users` again.
16. Search for `abdulaziz` if needed.
17. Click `Following` to unfollow Abdulaziz.
18. Return to the home feed `/`.
19. Say: "After unfollowing Abdulaziz, Abdulaziz's messages disappear from Yahia's feed. The feed still shows Yahia's own posts and posts from users Yahia follows."

## Scenario B — Cross-Account Visibility

Goal: show that another account can view Yahia's public profile and Yahia's remaining undeleted message.

1. Open the account menu in the sidebar.
2. Click `Log out`.
3. Log in as Abdulaziz:

```text
abdulaziz@example.com / Passw0rd!
```

4. Open `/users`.
5. Search for `yahia`.
6. Open Yahia's profile.
7. Say: "I am logged in as Abdulaziz, but I can still view Yahia's public profile and Yahia's remaining message."

## Scenario C — Statistics Features

Goal: show that statistics are database-backed and update after actions.

For each statistic, start on `/stats`, read the current value, perform the action, return to `/stats`, and show the updated value.

### 1. Total Users

1. Open `/stats` and read `Total users`.
2. Log out.
3. Open `/register`.
4. Register a temporary user, for example:

```text
demo_stats_user@example.com / Passw0rd!
```

5. Log in if needed and return to `/stats`.
6. Show that `Total users` increased by 1.

### 2. Total Posts

1. Open `/stats` and read `Total posts`.
2. Go to `/`.
3. Create a new post.
4. Return to `/stats`.
5. Show that `Total posts` increased.
6. Delete the post if you want to show the value decreasing.

### 3. Average Posts Per User

1. Open `/stats` and read `Average posts per user`.
2. Create or delete a post.
3. Return to `/stats`.
4. Show that the average changed.

### 4. Total Comments

1. Open `/stats` and read `Total comments`.
2. Open any post.
3. Add a comment.
4. Return to `/stats`.
5. Show that `Total comments` increased.
6. Delete the comment if you want to show the value decreasing.

### 5. Total Likes

1. Open `/stats` and read `Total likes`.
2. Like a post.
3. Return to `/stats`.
4. Show that `Total likes` increased.
5. Unlike the post if you want to show the value decreasing.

### 6. Total Follows

1. Open `/stats` and read `Total follows`.
2. Open `/users`.
3. Follow a user.
4. Return to `/stats`.
5. Show that `Total follows` increased.
6. Unfollow the same user if you want to show the value decreasing.

### 7. Average Followers Per User

1. Open `/stats` and read `Average followers per user`.
2. Follow or unfollow a user.
3. Return to `/stats`.
4. Show that the average changed.

### 8. Most Frequent Post Word

1. Open `/stats` and read `Most frequent post word`.
2. Go to `/`.
3. Create a post with a repeated unique word:

```text
orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo
```

4. Return to `/stats`.
5. Show that the most frequent word can update to `orbitdemo`.

## Closing Line

Say: "This completes the required Phase 2 scenarios. The data is stored in SQLite through Prisma, API routes call repository functions, and the statistics update from database queries."
