const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const LandingPage = () => {
    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/api/auth/google`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
            {/* Decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600 rounded-full opacity-10 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-600 rounded-full opacity-10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500 rounded-full opacity-5 blur-3xl" />
            </div>

            {/* Navbar */}
            <header className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">MailScrapping</span>
                </div>
                <button
                    onClick={handleGoogleLogin}
                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                    Sign In →
                </button>
            </header>

            {/* Hero */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-6">
                <div className="text-center max-w-3xl mx-auto animate-fade-in">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 text-blue-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        Gmail-powered email search
                    </div>

                    {/* Heading */}
                    <h1 className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                        Search your inbox
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            like a pro.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-xl leading-relaxed max-w-xl mx-auto mb-10">
                        <strong className="text-slate-200">MailScrapping</strong> connects to your Gmail account and lets you search
                        any keyword across your entire inbox — instantly, securely, and without leaving the browser.
                    </p>

                    {/* CTA */}
                    <button
                        onClick={handleGoogleLogin}
                        className="group inline-flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Privacy note */}
                    <p className="text-slate-500 text-sm mt-5">
                        🔒 We only request read-only access to your Gmail. Your emails stay private.
                    </p>
                </div>
            </main>

            {/* Features row */}
            <section className="relative z-10 pb-16 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: "🔍", title: "Keyword Search", desc: "Find any email by typing a keyword." },
                        { icon: "⚡", title: "Instant Results", desc: "Gmail API returns results in real time." },
                        { icon: "📜", title: "Search History", desc: "Your past searches saved automatically." },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 text-left"
                        >
                            <span className="text-2xl mb-3 block">{f.icon}</span>
                            <h3 className="text-white font-semibold mb-1">{f.title}</h3>
                            <p className="text-slate-400 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
