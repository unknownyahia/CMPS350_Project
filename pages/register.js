import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Notice from "../components/Notice.js";
import { requestJson } from "../lib/client/api.js";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [notice, setNotice] = useState(null);

    function updateField(event) {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    }

    async function submitForm(event) {
        event.preventDefault();

        if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
            setNotice({ message: "Please fill in all fields.", type: "err" });
            return;
        }

        if (form.password !== form.confirmPassword) {
            setNotice({ message: "Passwords do not match.", type: "err" });
            return;
        }

        try {
            await requestJson("/api/users", {
                method: "POST",
                body: JSON.stringify({
                    username: form.username,
                    email: form.email,
                    password: form.password
                })
            });

            setNotice({ message: "Account created successfully. Redirecting to login...", type: "ok" });
            setTimeout(() => router.push("/login"), 700);
        } catch (error) {
            setNotice({ message: error.message, type: "err" });
        }
    }

    return (
        <div className="auth-shell">
            <div className="auth-card">
                <div className="auth-brand">S</div>
                <div className="auth-title">Create your account</div>
                <div className="auth-subtitle">Join the social platform</div>

                <Notice notice={notice} />

                <form onSubmit={submitForm} noValidate>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="e.g. saleh"
                        required
                        autoComplete="username"
                        value={form.username}
                        onChange={updateField}
                    />
                    <div className="field-help">Use at least 3 characters.</div>

                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        value={form.email}
                        onChange={updateField}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="8+ chars with letters and numbers"
                        required
                        autoComplete="new-password"
                        value={form.password}
                        onChange={updateField}
                    />
                    <div className="field-help">Use at least 8 characters with letters and numbers.</div>

                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        required
                        autoComplete="new-password"
                        value={form.confirmPassword}
                        onChange={updateField}
                    />

                    <div className="auth-actions">
                        <button className="btn primary" type="submit">Register</button>
                        <Link className="auth-alt" href="/login">Already have an account?</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
