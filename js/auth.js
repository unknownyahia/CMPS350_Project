import {
    loadDB,
    saveDB,
    uid,
    setSessionUserId,
    findUserByEmail,
    findUserByUsername
} from "./storage.js";

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isStrongPassword(password) {
    if (password.length < 8) return false;

    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasLetter && hasNumber;
}

export function register({ username, email, password }) {
    const rawUsername = username ?? "";
    const rawEmail = email ?? "";
    const rawPassword = password ?? "";

    const trimmedUsername = rawUsername.trim();
    const normalizedEmail = rawEmail.trim().toLowerCase();
    const normalizedPassword = rawPassword.trim();

    if (!trimmedUsername || !normalizedEmail || !normalizedPassword) {
        return { ok: false, error: "All fields are required." };
    }

    if (trimmedUsername.length < 3) {
        return { ok: false, error: "Username must be at least 3 characters." };
    }

    if (!isValidEmail(normalizedEmail)) {
        return { ok: false, error: "Invalid email format." };
    }

    if (!isStrongPassword(normalizedPassword)) {
        return { ok: false, error: "Password must be at least 8 characters and include letters and numbers." };
    }

    const existingEmailUser = findUserByEmail(normalizedEmail);
    if (existingEmailUser) {
        return { ok: false, error: "Email already used." };
    }

    const existingUsernameUser = findUserByUsername(trimmedUsername);
    if (existingUsernameUser) {
        return { ok: false, error: "Username already taken." };
    }

    const db = loadDB();

    const newUser = {
        id: uid("user"),
        username: trimmedUsername,
        email: normalizedEmail,
        password: normalizedPassword,
        bio: "New here 👋",
        profilePic: "",
        following: []
    };

    db.users.push(newUser);
    saveDB(db);

    return { ok: true };
}

export function login({ email, password }) {
    const rawEmail = email ?? "";
    const rawPassword = password ?? "";

    const normalizedEmail = rawEmail.trim().toLowerCase();
    const normalizedPassword = rawPassword;

    if (!normalizedEmail || !normalizedPassword) {
        return { ok: false, error: "Please enter your email and password." };
    }

    const user = findUserByEmail(normalizedEmail);

    if (!user || user.password !== normalizedPassword) {
        return { ok: false, error: "Invalid email or password." };
    }

    setSessionUserId(user.id);
    return { ok: true };
}