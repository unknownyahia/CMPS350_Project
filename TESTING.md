# Manual Testing Notes

Run these steps after:

```bash
npm install
npm run migrate
npm run seed
npm run dev
```

Open `http://localhost:3000`.

Each test includes an Actual Result and Pass/Fail placeholder for the final report.

## Scenario A — User Activity and Following

Steps:

1. Log in as `yahia@example.com / Passw0rd!`.
2. Create message 1 from `/`.
3. Create message 2 from `/`.
4. Open Yahia's profile.
5. Confirm both new messages appear.
6. Delete one new message.
7. Open `/users`.
8. Follow Abdulaziz.
9. Open `/`.
10. Confirm Abdulaziz's messages appear in Yahia's feed.
11. Open `/users`.
12. Unfollow Abdulaziz.
13. Open `/`.
14. Confirm Abdulaziz's messages disappear from Yahia's feed.

Expected result: Yahia's own posts appear in Yahia's feed and profile. Abdulaziz's posts appear only while Yahia follows Abdulaziz.

Actual result: ______________________________

Pass/Fail: ______________________________

## Scenario B — Cross-Account Visibility

Steps:

1. Log out.
2. Log in as `abdulaziz@example.com / Passw0rd!`.
3. Open `/users`.
4. Search for `yahia`.
5. Open Yahia's profile.
6. Confirm Yahia's remaining undeleted message is visible.

Expected result: Abdulaziz can view Yahia's public profile posts.

Actual result: ______________________________

Pass/Fail: ______________________________

## Scenario C — Statistics Features Changing

Steps:

1. Open `/stats`.
2. Record the current value for each statistic.
3. Register a new user and confirm `Total users` changes.
4. Create a post and confirm `Total posts` and `Average posts per user` change.
5. Add a comment and confirm `Total comments` changes.
6. Like a post and confirm `Total likes` changes.
7. Follow a user and confirm `Total follows` and `Average followers per user` change.
8. Create a post containing `orbitdemo` repeated several times and confirm `Most frequent post word` can change.

Expected result: each displayed statistic updates after its matching database action.

Actual result: ______________________________

Pass/Fail: ______________________________

## Register User

Steps:

1. Open `/register`.
2. Enter a new username, email, and password.
3. Submit the form.

Expected result: the account is created in SQLite and the app redirects to `/login`.

Actual result: ______________________________

Pass/Fail: ______________________________

## Login User

Steps:

1. Open `/login`.
2. Use `yahia@example.com / Passw0rd!`.

Expected result: login succeeds and redirects to `/`.

Actual result: ______________________________

Pass/Fail: ______________________________

## Create and Delete Post

Steps:

1. Log in.
2. Create a post from `/`.
3. Confirm it appears.
4. Delete it with the custom modal.

Expected result: the post is added to and removed from the database.

Actual result: ______________________________

Pass/Fail: ______________________________

## Add and Delete Comment

Steps:

1. Open a post.
2. Add a comment.
3. Delete the comment with the custom modal.

Expected result: the comment is added to and removed from the database.

Actual result: ______________________________

Pass/Fail: ______________________________

## Like and Unlike Post

Steps:

1. Click the heart icon on a post.
2. Click it again.

Expected result: the like count updates, and the `Like` table allows only one like per user per post.

Actual result: ______________________________

Pass/Fail: ______________________________

## Follow and Unfollow User

Steps:

1. Open `/users`.
2. Follow a user.
3. Click `Following` to unfollow.

Expected result: the follow relationship is created and removed in the database.

Actual result: ______________________________

Pass/Fail: ______________________________

## Edit Profile and Upload Image

Steps:

1. Open your profile.
2. Edit username or bio.
3. Upload a profile image under 2 MB.
4. Save changes.
5. Refresh the page.

Expected result: profile text and image persist because they are stored in SQLite.

Actual result: ______________________________

Pass/Fail: ______________________________

## Persistence After Refresh

Steps:

1. Create a post or edit a profile.
2. Refresh the browser.

Expected result: changes remain because they are stored in SQLite, not localStorage.

Actual result: ______________________________

Pass/Fail: ______________________________
