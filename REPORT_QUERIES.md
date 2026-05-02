# Report Queries

This file documents every statistic shown on `/stats`. The implementation is in `lib/repositories/statsRepository.js`, inside the `getStatistics` repository function.

## 1. Total Users

Repository function: `getStatistics`

```js
prisma.user.count()
```

What it returns: the number of rows in the `User` table.

How it changes during demo: register a new user from `/register`.

## 2. Total Posts

Repository function: `getStatistics`

```js
prisma.post.count()
```

What it returns: the number of rows in the `Post` table.

How it changes during demo: create a post from `/`, or delete one of your own posts.

## 3. Average Posts Per User

Repository function: `getStatistics`

```js
const totalUsers = await prisma.user.count();
const totalPosts = await prisma.post.count();
const averagePostsPerUser = totalUsers > 0 ? totalPosts / totalUsers : 0;
```

What it returns: total posts divided by total users.

How it changes during demo: create/delete a post or register a new user.

## 4. Total Comments

Repository function: `getStatistics`

```js
prisma.comment.count()
```

What it returns: the number of rows in the `Comment` table.

How it changes during demo: add a comment on a post, or delete your own comment.

## 5. Total Likes

Repository function: `getStatistics`

```js
prisma.like.count()
```

What it returns: the number of rows in the `Like` table.

How it changes during demo: like or unlike a post.

## 6. Total Follows

Repository function: `getStatistics`

```js
prisma.follow.count()
```

What it returns: the number of rows in the `Follow` table.

How it changes during demo: follow or unfollow another user.

## 7. Average Followers Per User

Repository function: `getStatistics`

```js
const totalUsers = await prisma.user.count();
const totalFollows = await prisma.follow.count();
const averageFollowersPerUser = totalUsers > 0 ? totalFollows / totalUsers : 0;
```

What it returns: total follow relationships divided by total users.

How it changes during demo: follow/unfollow another user or register a new user.

## 8. Most Frequent Post Word

Repository function: `getStatistics`

```js
const postContents = await prisma.post.findMany({
  select: { content: true }
});
```

What it returns: the most common non-stop-word found in post content.

Query explanation: Prisma with SQLite does not provide a simple cross-row word-frequency aggregate for free text. The repository selects only the needed `content` field, then tokenizes those strings and counts words in a helper.

How it changes during demo: create a post with a repeated unique word, for example `orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo orbitdemo`.
