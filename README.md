# Social Media Platform

A front-end social media platform built for **CMPS 350 – Web Development Fundamentals** using **HTML, CSS, and Vanilla JavaScript**.  
The project simulates the core experience of a modern social media app, with browser-based persistence using `localStorage`.

---

## Overview

This project is a multi-page social media web application that allows users to:

- register and log in
- create and delete posts
- like and comment on posts
- search for users
- follow and unfollow other users
- view profile pages
- use the app across different screen sizes with responsive behavior
- experience automatic light/dark mode based on browser or system theme

Since this is a Phase 1 front-end project, all data is stored locally in the browser using `localStorage` in JSON format.

---

## Features

### Authentication
- User registration
- User login
- Local session management
- Account menu with logout option

### Feed and Posts
- Home feed page
- Create new posts
- Delete own posts
- View single post page
- Like posts
- Comment on posts

### User Features
- Search users
- View user profiles
- Follow users
- Unfollow users

### UI and UX
- Responsive X-inspired layout
- Persistent left navigation bar
- Compact sidebar behavior on smaller screens
- Automatic light/dark theme
- Realistic homepage and sidebar sections

### Data Persistence
- Users, posts, comments, likes, and session data are stored in browser `localStorage`
- Data remains available after refresh unless storage is manually cleared

---

## Technologies Used

- **HTML5**
- **CSS3**
- **Vanilla JavaScript (ES6+)**
- **localStorage**
- **JSON**

---

## Project Structure

```text
.
├── index.html
├── login.html
├── register.html
├── users.html
├── profile.html
├── post.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── storage.js
│   ├── ui.js
│   ├── users.js
│   ├── profile.js
│   ├── post.js
│   └── accountMenu.js
