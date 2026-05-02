import { getStatistics } from "../../../lib/repositories/statsRepository.js";
import { sendMethodNotAllowed } from "../../../lib/api/validation.js";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return sendMethodNotAllowed(res, ["GET"]);
    }

    const stats = await getStatistics();
    return res.status(200).json({ stats });
}
