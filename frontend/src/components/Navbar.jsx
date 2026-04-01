import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Navbar = ({ onNavigate, activeSection }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="font-bold text-slate-900 text-lg tracking-tight">MailScrapping</span>
                </div>

                {/* Nav links */}
                <div className="hidden sm:flex items-center gap-1">
                    {["home", "search"].map((section) => (
                        <button
                            key={section}
                            onClick={() => onNavigate(section)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-150 ${activeSection === section
                                    ? "bg-brand-50 text-brand-700"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                }`}
                        >
                            {section}
                        </button>
                    ))}
                </div>

                {/* User + Logout */}
                <div className="flex items-center gap-3">
                    {user && (
                        <div className="hidden sm:flex items-center gap-2.5">
                            {user.profilePicture ? (
                                <img
                                    src={user.profilePicture}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full border-2 border-slate-100"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
                                    {user.name[0]}
                                </div>
                            )}
                            <span className="text-slate-700 text-sm font-medium">{user.name}</span>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-all duration-150"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
