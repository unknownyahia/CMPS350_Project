import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Notice from "../components/Notice.js";
import { requestJson } from "../lib/client/api.js";
import { setCurrentUserId } from "../lib/client/session.js";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [notice, setNotice] = useState(null);

    async function submitForm(event) {
        event.preventDefault();

        if (!email.trim() || !password) {
            setNotice({ message: "Please enter your email and password.", type: "err" });
            return;
        }

        try {
            const { user } = await requestJson("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            setCurrentUserId(user.id);
            router.push("/");
        } catch (error) {
            setNotice({ message: error.message, type: "err" });
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand">S</div>
                <div className="auth-title">Sign in to Social Platform</div>

                <Notice notice={notice} />

                <form onSubmit={submitForm} noValidate>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Your password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />

                    <div className="auth-actions">
                        <button className="btn primary" type="submit">Login</button>
                        <Link className="auth-alt" href="/register">Create account</Link>
                    </div>
                </form>

                <div className="seed-note">
                    <strong>Testing accounts:</strong>
                    <br />
                    <b>yahia@example.com</b> / <b>Passw0rd!</b>
                    <br />
                    <b>abdulaziz@example.com</b> / <b>Passw0rd!</b>
                </div>
            </div>
        </div>
    );
}
