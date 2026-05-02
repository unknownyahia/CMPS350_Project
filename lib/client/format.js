export function fmtTime(value) {
    const diffMs = Date.now() - new Date(value).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));

    if (mins < 60) return `${mins}m`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return new Date(value).toLocaleDateString();
}

export function plural(value, label) {
    return `${value} ${label}${Number(value) === 1 ? "" : "s"}`;
}
