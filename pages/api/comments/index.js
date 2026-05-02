import { createComment } from "../../../lib/repositories/commentRepository.js";
import { sendMethodNotAllowed, toId } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return sendMethodNotAllowed(res, ["POST"]);
    }

    const { postId, authorId, content } = req.body || {};
    const cleanContent = String(content || "").trim();

    if (!toId(postId) || !toId(authorId)) {
        return res.status(400).json({ error: "Valid post id and author id are required." });
    }

    if (!cleanContent) {
        return res.status(400).json({ error: "Comment content is required." });
    }

    if (cleanContent.length > 220) {
        return res.status(400).json({ error: "Comment content must be 220 characters or fewer." });
    }

    const comment = await createComment({ postId, authorId, content: cleanContent });
    return res.status(201).json({ comment });
}
