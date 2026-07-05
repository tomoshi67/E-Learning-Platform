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

    const role = localStorage.getItem("role") || "USER";
    const email = localStorage.getItem("email") || "user@email.com";
    const username = localStorage.getItem("username") || email.split("@")[0];

    const basePath = role.toLowerCase();

    const goTo = (page) => {
        navigate(`/${basePath}/${page}`);
    };

    const logout = () => {
        localStorage.clear();
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
        <div className="min-h-screen bg-gradient-to-br from-[#eef3f8] via-white to-[#f7f1ff] p-4">
            <div className="min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-2xl backdrop-blur flex">
                <aside
                    className={`${collapsed ? "w-[76px]" : "w-72"} shrink-0 hidden md:flex transition-all duration-300 bg-white/90 border-r border-gray-100 flex-col justify-between`}
                >
                    <div>
                        <div className="p-5 flex items-center justify-between gap-3">
                            <button
                                onClick={() => goTo("courses")}
                                className={`${collapsed ? "justify-center" : "justify-start"} flex items-center gap-3 min-w-0`}
                            >
                                <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center shadow-lg">
                                    <LayoutDashboard size={22} />
                                </div>
                                {!collapsed && (
                                    <div className="text-left">
                                        <h1 className="text-xl font-black leading-tight">E-Learn</h1>
                                        <p className="text-xs text-gray-500">Learning dashboard</p>
                                    </div>
                                )}
                            </button>

                            {!collapsed && (
                                <button
                                    onClick={() => setCollapsed(true)}
                                    className="shrink-0 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
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
                                    className="w-full h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 transition flex items-center justify-center"
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
                                                    ? `${collapsed ? "justify-center px-0" : "justify-start px-4"} w-full min-h-[48px] flex items-center gap-3 py-3 rounded-2xl text-left bg-black text-white shadow-lg transition`
                                                    : `${collapsed ? "justify-center px-0" : "justify-start px-4 hover:translate-x-1"} w-full min-h-[48px] flex items-center gap-3 py-3 rounded-2xl text-left text-gray-700 hover:bg-gray-100 hover:text-black transition`
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
                        <div className={`${collapsed ? "hidden" : "block"} mb-3 rounded-3xl bg-gradient-to-br from-gray-50 to-blue-50 p-4 border border-gray-100`}>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <Shield size={16} />
                                {role}
                            </div>
                            <p className="text-xs text-gray-500 mt-1 truncate">{email}</p>
                        </div>

                        <button
                            onClick={logout}
                            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-bold text-white hover:bg-red-600 hover:shadow-lg transition"
                            title="Logout"
                        >
                            <LogOut size={18} className="shrink-0" />
                            {!collapsed && "Logout"}
                        </button>
                    </div>
                </aside>

                <main className="flex-1 min-w-0 bg-[#f6f8fb]">
                    <header className="sticky top-0 z-20 h-20 bg-white/90 backdrop-blur border-b border-gray-100 px-5 md:px-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="hidden md:flex w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 transition items-center justify-center"
                            >
                                <Menu size={20} />
                            </button>

                            <div>
                                <p className="text-xs font-black tracking-[0.25em] text-gray-400">DASHBOARD</p>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900">{activePage}</h2>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {role !== "ADMIN" && (
                                <button
                                    onClick={() => goTo("notifications")}
                                    className="relative w-11 h-11 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-gray-100 hover:scale-105 transition flex items-center justify-center"
                                    title="Notifications"
                                >
                                    <Bell size={20} />
                                    {hasUnread && activePage !== "Notifications" && (
                                        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={() => goTo("profile")}
                                className="flex items-center gap-3 rounded-2xl bg-white border border-gray-100 shadow-sm px-3 py-2 hover:bg-gray-100 hover:scale-[1.02] transition"
                                title="Open profile"
                            >
                                <div className="hidden sm:block text-right max-w-[180px]">
                                    <p className="text-sm font-bold truncate">{username}</p>
                                    <p className="text-xs text-gray-500 truncate">{email}</p>
                                </div>
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-black to-gray-700 text-white flex items-center justify-center font-black shadow-md">
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