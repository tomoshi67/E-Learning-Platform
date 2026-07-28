import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    BookOpen,
    ChevronLeft,
    Info,
    LayoutDashboard,
    LogOut,
    Menu,
    MessageCircle,
    Shield,
    User,
    ClipboardList,
} from "lucide-react";

function DashboardLayout({ activePage, children, hasUnread = false }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const role = sessionStorage.getItem("role") || "USER";
    const email = sessionStorage.getItem("email") || "user@email.com";
    const username = sessionStorage.getItem("username") || email.split("@")[0];

    const basePath = role.toLowerCase();

    const goTo = (page) => {
        navigate(`/${basePath}/${page}`);
    };

    const logout = () => {
        sessionStorage.clear();
        navigate("/login", { replace: true });
    };

    const navItems = [
        { label: "Profile", page: "profile", icon: User, show: true },
        { label: "Details", page: "details", icon: Info, show: true },
        { label: role === "ADMIN" ? "Manage" : "Courses", page: "courses", icon: BookOpen, show: true },
        { label: "Quizzes", page: "quizzes", icon: ClipboardList, show: role !== "ADMIN" },
        { label: "Chat", page: "chat", icon: MessageCircle, show: role !== "ADMIN" },
        { label: "Notifications", page: "notifications", icon: Bell, show: role !== "ADMIN" },
    ];

    return (
        <div className="min-h-screen bg-[#0B0E14] p-4">
            <div className="min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-[#232838] bg-[#0F131C] shadow-2xl flex">
                <aside
                    className={`${collapsed ? "w-[76px]" : "w-72"} shrink-0 hidden md:flex transition-all duration-300 bg-[#0F131C] border-r border-[#1C2130] flex-col justify-between`}
                >
                    <div>
                        <div className="p-5 flex items-center justify-between gap-3">
                            <button
                                onClick={() => goTo("courses")}
                                className={`${collapsed ? "justify-center" : "justify-start"} flex items-center gap-3 min-w-0`}
                            >
                                <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <LayoutDashboard size={22} />
                                </div>
                                {!collapsed && (
                                    <div className="text-left">
                                        <h1 className="text-xl font-black leading-tight text-gray-100">E-Learn</h1>
                                        <p className="text-xs text-gray-500">Learning dashboard</p>
                                    </div>
                                )}
                            </button>

                            {!collapsed && (
                                <button
                                    onClick={() => setCollapsed(true)}
                                    className="shrink-0 w-9 h-9 rounded-xl bg-[#1A1F2B] hover:bg-[#232838] transition flex items-center justify-center text-gray-300"
                                    title="Collapse sidebar"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                            )}
                        </div>

                        {collapsed && (
                            <div className="px-4 mb-3">
                                <button
                                    onClick={() => setCollapsed(false)}
                                    className="w-full h-11 rounded-2xl bg-[#1A1F2B] hover:bg-[#232838] transition flex items-center justify-center text-gray-300"
                                    title="Open sidebar"
                                >
                                    <Menu size={19} />
                                </button>
                            </div>
                        )}

                        <div className={`${collapsed ? "px-3" : "px-4"} mt-3 space-y-2`}>
                            {navItems
                                .filter((item) => item.show)
                                .map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activePage === item.label || (activePage === "Courses" && item.page === "courses");

                                    return (
                                        <button
                                            key={item.page}
                                            onClick={() => goTo(item.page)}
                                            className={
                                                isActive
                                                    ? `${collapsed ? "justify-center px-0" : "justify-start px-4"} w-full min-h-[48px] flex items-center gap-3 py-3 rounded-2xl text-left bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 transition`
                                                    : `${collapsed ? "justify-center px-0" : "justify-start px-4 hover:translate-x-1"} w-full min-h-[48px] flex items-center gap-3 py-3 rounded-2xl text-left text-gray-400 hover:bg-[#1A1F2B] hover:text-gray-100 transition`
                                            }
                                            title={item.label}
                                        >
                                            <Icon size={20} className="shrink-0" />
                                            {!collapsed && <span className="font-semibold whitespace-nowrap">{item.label}</span>}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    <div className={`${collapsed ? "p-3" : "p-4"}`}>
                        <div className={`${collapsed ? "hidden" : "block"} mb-3 rounded-3xl bg-[#141822] p-4 border border-[#232838]`}>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
                                <Shield size={16} className="text-indigo-400" />
                                {role}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 font-bold text-red-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25 transition"
                            title="Logout"
                        >
                            <LogOut size={18} className="shrink-0" />
                            {!collapsed && "Logout"}
                        </button>
                    </div>
                </aside>

                <main className="flex-1 min-w-0 bg-[#0B0E14]">
                    <header className="sticky top-0 z-20 h-20 bg-[#0F131C]/95 backdrop-blur border-b border-[#1C2130] px-5 md:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex w-10 h-10 rounded-2xl bg-[#1A1F2B] hover:bg-[#232838] transition items-center justify-center text-gray-300"
                            >
                                <Menu size={20} />
                            </button>

                            <div>
                                <p className="text-xs font-black tracking-[0.25em] text-gray-500">DASHBOARD</p>
                                <h2 className="text-xl md:text-2xl font-black text-gray-100">{activePage}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {role !== "ADMIN" && (
                                <button
                                    onClick={() => goTo("notifications")}
                                    className="relative w-11 h-11 rounded-2xl bg-[#141822] border border-[#232838] hover:bg-[#1A1F2B] hover:scale-105 transition flex items-center justify-center text-gray-300"
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                    {hasUnread && activePage !== "Notifications" && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-[#0F131C] shadow-[0_0_6px_rgba(239,68,68,0.8)]"></span>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => goTo("profile")}
                                className="flex items-center gap-3 rounded-2xl bg-[#141822] border border-[#232838] px-3 py-2 hover:bg-[#1A1F2B] hover:scale-[1.02] transition"
                                title="Open profile"
                            >
                                <div className="hidden sm:block text-right max-w-[180px]">
                                    <p className="text-sm font-bold truncate text-gray-100">{username}</p>
                                    <p className="text-xs text-gray-500 truncate">{email}</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-500/30">
                                    {email.charAt(0).toUpperCase()}
                                </div>
                            </button>
                        </div>
                    </header>

                    <div className="p-5 md:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;