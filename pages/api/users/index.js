import { createUser, getUsers } from "../../../lib/repositories/userRepository.js";
import {
    getPrismaErrorMessage,
    isStrongPassword,
    isValidEmail,
    sendMethodNotAllowed,
    toId
} from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const users = await getUsers({
            query: req.query.q || "",
            viewerId: toId(req.query.viewerId)
        });

        return res.status(200).json({ users });
    }

    if (req.method === "POST") {
        const { username, email, password } = req.body || {};
        const cleanUsername = String(username || "").trim();

        if (!cleanUsername || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required." });
        }

        if (cleanUsername.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters." });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        if (!isStrongPassword(password)) {
            return res.status(400).json({ error: "Password must be at least 8 characters and include letters and numbers." });
        }

        try {
            const user = await createUser({ username: cleanUsername, email, password });
            return res.status(201).json({ user });
        } catch (error) {
            return res.status(409).json({ error: getPrismaErrorMessage(error) });
        }
    }

    return sendMethodNotAllowed(res, ["GET", "POST"]);
}
