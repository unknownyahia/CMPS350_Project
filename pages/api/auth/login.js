import { loginUser } from "../../../lib/repositories/userRepository.js";
import { sendMethodNotAllowed } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return sendMethodNotAllowed(res, ["POST"]);
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await loginUser({ email, password });

    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.status(200).json({ user });
}
