import { likePost, unlikePost } from "../../../lib/repositories/likeRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    const userId = toId(req.body?.userId || req.query.userId);
    const postId = toId(req.body?.postId || req.query.postId);

    if (!userId || !postId) {
        return res.status(400).json({ error: "Valid user id and post id are required." });
    }

    if (req.method === "POST") {
        await likePost({ userId, postId });
        return res.status(200).json({ liked: true });
    }

    if (req.method === "DELETE") {
        await unlikePost({ userId, postId });
        return res.status(200).json({ liked: false });
    }

    return sendMethodNotAllowed(res, ["POST", "DELETE"]);
}
