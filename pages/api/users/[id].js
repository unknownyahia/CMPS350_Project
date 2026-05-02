import { getUserById, updateUser } from "../../../lib/repositories/userRepository.js";
import {
    getPrismaErrorMessage,
    sendMethodNotAllowed,
    toId
} from "../../../lib/api/validation.js";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "4mb"
        }
    }
};

export default async function handler(req, res) {
    const id = toId(req.query.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid user id." });
    }

    if (req.method === "GET") {
        const user = await getUserById(id, { viewerId: toId(req.query.viewerId) });

        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        return res.status(200).json({ user });
    }

    if (req.method === "PUT") {
        const { requesterId, username, bio, avatarData } = req.body || {};

        if (toId(requesterId) !== id) {
            return res.status(403).json({ error: "You can only edit your own profile." });
        }

        if (username !== undefined && String(username || "").trim().length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters." });
        }

        try {
            const user = await updateUser(id, { username, bio, avatarData });
            return res.status(200).json({ user });
        } catch (error) {
            const status = error?.code === "P2002" ? 409 : 400;
            return res.status(status).json({ error: getPrismaErrorMessage(error) });
        }
    }

    return sendMethodNotAllowed(res, ["GET", "PUT"]);
}
