export function toId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function isStrongPassword(password) {
    const value = String(password || "");
    return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export function sendMethodNotAllowed(res, allowed) {
    res.setHeader("Allow", allowed);
    return res.status(405).json({ error: "Method not allowed." });
}

export function getPrismaErrorMessage(error) {
    if (error?.code === "P2002") {
        return "A record with this unique value already exists.";
    }

    if (error?.code === "P2025") {
        return "Record not found.";
    }

    return "Something went wrong.";
}
