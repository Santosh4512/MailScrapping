import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import EmailCard from "../components/EmailCard";
import EmailModal from "../components/EmailModal";
import SearchHistoryPanel from "../components/SearchHistoryPanel";

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState("home");
    const [searchQuery, setSearchQuery] = useState("");
    const [emails, setEmails] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const inputRef = useRef(null);

    // Redirect to landing if not authenticated and no token exists
    useEffect(() => {
        if (!authLoading && !user) {
            const token = localStorage.getItem("MailScrapping_token");
            if (!token) {
                navigate("/", { replace: true });
            }
        }
    }, [authLoading, user, navigate]);

    // Fetch search history and recent emails on mount
    useEffect(() => {
        if (user) {
            fetchHistory();
            fetchRecentEmails();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const fetchRecentEmails = async () => {
        setSearchLoading(true);
        setHasSearched(true);
        try {
            const { data } = await api.get("/api/gmail/search");
            setEmails(data.emails || []);
        } catch (err) {
            toast.error("Failed to load recent emails.");
        } finally {
            setSearchLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const { data } = await api.get("/api/history");
            setHistory(data);
        } catch {
            // silently fail
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSearch = useCallback(async (keyword) => {
        const q = (keyword || searchQuery).trim();
        if (!q) {
            toast.error("Please enter a search keyword");
            return;
        }

        setSearchLoading(true);
        setHasSearched(true);
        setEmails([]);
        setActiveSection("search");

        try {
            // Search emails
            const { data } = await api.get(`/api/gmail/search?q=${encodeURIComponent(q)}`);
            setEmails(data.emails || []);

            // Save to history
            await api.post("/api/history", { keyword: q });
            await fetchHistory();

            if ((data.emails || []).length === 0) {
                toast("No emails found matching that keyword.", { icon: "🔍" });
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to search emails. Please try again.";
            toast.error(msg);
        } finally {
            setSearchLoading(false);
        }
    }, [searchQuery]);

    const handleKeywordSelect = (keyword) => {
        setSearchQuery(keyword);
        handleSearch(keyword);
    };

    const handleNavigate = (section) => {
        setActiveSection(section);
        if (section === "home") {
            setHasSearched(false);
            setEmails([]);
            setSearchQuery("");
        }
        if (section === "search" && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

            {/* Main content — padded for fixed navbar */}
            <main className="pt-20 pb-16 max-w-3xl mx-auto px-4 sm:px-6">

                {/* Dashboard header */}
                <div className="mb-8 animate-fade-in">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">MailScrapping</h1>
                    </div>
                    <p className="text-slate-500 ml-[52px]">
                        Welcome back, <span className="font-semibold text-slate-700">{user?.name?.split(" ")[0]}</span>! 👋
                    </p>
                </div>

                {/* Search Bar */}
                <div className="card mb-6 animate-slide-up">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 block">
                        Search Your Gmail
                    </label>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <svg
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder="Search emails… e.g. &quot;invoice&quot; or &quot;Quant&quot;"
                                className="input-field pl-10"
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={searchLoading}
                            className="btn-primary flex items-center gap-2 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {searchLoading ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            <span className="hidden sm:inline">Search</span>
                        </button>
                    </div>
                </div>

                {/* Search History */}
                <div className="card mb-8 animate-slide-up">
                    <SearchHistoryPanel
                        history={history}
                        onSelectKeyword={handleKeywordSelect}
                        loading={historyLoading}
                    />
                </div>

                {/* Results */}
                {searchLoading && (
                    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
                        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Searching your Gmail inbox…</p>
                    </div>
                )}

                {!searchLoading && hasSearched && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-800">
                                {emails.length > 0
                                    ? `${emails.length} email${emails.length !== 1 ? "s" : ""} found`
                                    : "No emails found"}
                            </h2>
                            {emails.length > 0 && (
                                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                    Showing up to 20 results
                                </span>
                            )}
                        </div>

                        {emails.length > 0 ? (
                            <div className="space-y-4">
                                {emails.map((email) => (
                                    <EmailCard
                                        key={email.id}
                                        email={email}
                                        onReadMore={() => setSelectedEmail({ ...email, replyMode: false })}
                                        onReply={() => setSelectedEmail({ ...email, replyMode: true })}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <div className="text-4xl mb-4">📭</div>
                                <p className="text-slate-600 font-medium">No emails matched your search.</p>
                                <p className="text-slate-400 text-sm mt-1">Try a different keyword.</p>
                            </div>
                        )}
                    </div>
                )}

                {!searchLoading && !hasSearched && (
                    <div className="card text-center py-16 text-slate-400 animate-fade-in">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="font-medium text-slate-500">Enter a keyword above to search your Gmail inbox.</p>
                        <p className="text-sm mt-1">Results will appear here.</p>
                    </div>
                )}
            </main>

            {/* Email detail modal */}
            {selectedEmail && (
                <EmailModal email={selectedEmail} onClose={() => setSelectedEmail(null)} />
            )}
        </div>
    );
};

export default Dashboard;
