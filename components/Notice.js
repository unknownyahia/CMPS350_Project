export default function Notice({ notice }) {
    if (!notice?.message) return <div aria-live="polite" />;

    return (
        <div aria-live="polite">
            <div className={`notice ${notice.type === "err" ? "err" : "ok"}`}>
                {notice.message}
            </div>
        </div>
    );
}
