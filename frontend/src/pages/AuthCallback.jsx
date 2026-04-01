import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

/**
 * /auth/callback?token=<JWT>
 * After Google OAuth redirect, this page grabs the token from URL,
 * stores it in localStorage, fetches the user (with retry), then
 * redirects to /dashboard.
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const error = params.get("error");

        if (error || !token) {
            setErrorMsg("Google sign-in was cancelled or failed. Redirecting…");
            setTimeout(() => navigate("/", { replace: true }), 2500);
            return;
        }

        // Save token immediately so AuthContext & axios interceptor can use it
        localStorage.setItem("MailScrapping_token", token);

        // Fetch user with a single retry to handle cold-start delays on Render
        const fetchUser = async (attempt = 1) => {
            try {
                const { data } = await api.get("/api/auth/me");
                setUser(data);
                navigate("/dashboard", { replace: true });
            } catch (err) {
                if (attempt < 3) {
                    // Wait 1.5s then retry (handles Render cold-start 502)
                    setTimeout(() => fetchUser(attempt + 1), 1500);
                } else {
                    // Token saved — navigate anyway; Dashboard/AuthContext will validate
                    navigate("/dashboard", { replace: true });
                }
            }
        };

        fetchUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="text-center">
                {errorMsg ? (
                    <p className="text-red-500 font-medium text-lg">{errorMsg}</p>
                ) : (
                    <>
                        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-slate-600 font-medium text-lg">Signing you in…</p>
                        <p className="text-slate-400 text-sm mt-1">This may take a few seconds</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
