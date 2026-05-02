export default function Avatar({ user, size = "" }) {
    const fallback = (user?.username?.[0] || "?").toUpperCase();

    return (
        <div className={`avatar ${size}`.trim()}>
            {user?.avatarData ? (
                <img src={user.avatarData} alt={`${user.username} profile picture`} />
            ) : (
                fallback
            )}
        </div>
    );
}
