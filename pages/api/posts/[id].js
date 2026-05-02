import { deletePost, getPostById } from "../../../lib/repositories/postRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    const id = toId(req.query.id);

    if (!id) {
        return res.status(400).json({ error: "Invalid post id." });
    }

    if (req.method === "GET") {
        const post = await getPostById(id, { viewerId: toId(req.query.viewerId) });

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        return res.status(200).json({ post });
    }

    if (req.method === "DELETE") {
        const requesterId = toId(req.body?.requesterId || req.query.requesterId);

        if (!requesterId) {
            return res.status(400).json({ error: "Requester id is required." });
        }

        const result = await deletePost({ postId: id, requesterId });

        if (result.reason === "not_found") {
            return res.status(404).json({ error: "Post not found." });
        }

        if (result.reason === "forbidden") {
            return res.status(403).json({ error: "You can only delete your own posts." });
        }

        return res.status(200).json({ deleted: true });
    }

    return sendMethodNotAllowed(res, ["GET", "DELETE"]);
}
