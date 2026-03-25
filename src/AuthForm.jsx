import React, { useState } from "react";
import "./AuthForm.css";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * AuthForm — modal for login and registration.
 *
 * Props:
 *   onSuccess(token, email, displayName, role) — called after successful auth
 *   onClose() — called when the user dismisses the modal
 */
export default function AuthForm({ onSuccess, onClose }) {
    const [mode, setMode] = useState("login"); // "login" | "register"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const endpoint =
                mode === "login"
                    ? `${API_URL}/api/auth/login`
                    : `${API_URL}/api/auth/register`;

            const body =
                mode === "login"
                    ? { email, password }
                    : { email, password, displayName };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            onSuccess(data.token, data.email, data.displayName, data.role);
        } catch {
            setError("Could not connect to the server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="btn-auth-close" onClick={onClose} aria-label="Close">
                    ✕
                </button>

                <h2 className="auth-modal-title">
                    {mode === "login" ? "Sign in" : "Create account"}
                </h2>

                <form onSubmit={handleSubmit} noValidate>
                    {mode === "register" && (
                        <div className="auth-field">
                            <label htmlFor="displayName">Display name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name (optional)"
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-field">
                        <label htmlFor="auth-email">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="auth-password">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={
                                mode === "register" ? "At least 8 characters" : "Your password"
                            }
                            required
                            autoComplete={
                                mode === "login" ? "current-password" : "new-password"
                            }
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        type="submit"
                        className="btn-auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait…"
                            : mode === "login"
                            ? "Sign in"
                            : "Create account"}
                    </button>
                </form>

                <p className="auth-toggle">
                    {mode === "login" ? (
                        <>
                            No account?{" "}
                            <button onClick={() => { setMode("register"); setError(""); }}>
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button onClick={() => { setMode("login"); setError(""); }}>
                                Sign in
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
