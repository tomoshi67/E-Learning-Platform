import { useEffect, useState } from "react";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Bell, RefreshCcw, Clock3, Inbox, ChevronLeft, ChevronRight } from "lucide-react";

const NOTIFICATIONS_PER_PAGE = 10;

function NotificationPage() {
    const role = sessionStorage.getItem("role");
    const email = sessionStorage.getItem("email");

    const [hasChatUnread, setHasChatUnread] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const authHeaders = () => ({
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const loadNotifications = async () => {
        const res = await fetch(
            `${API_URL}/notifications/user/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setNotifications(data);
    };

    const markAllRead = async () => {
        await fetch(
            `${API_URL}/notifications/mark-all-read/` + encodeURIComponent(email),
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );
    };

    const loadChatUnread = async () => {
        if (role === "ADMIN") return;

        const res = await fetch(
            `${API_URL}/chat/has-unread/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasChatUnread(data);
    };

    const refreshPage = async () => {
        await loadNotifications();
        await markAllRead();
        setCurrentPage(1);
    };

    useEffect(() => {
        const initialize = async () => {
            await loadNotifications();
            await loadChatUnread();
            await markAllRead();
        };

        initialize();
    }, []);

    const totalPages = Math.max(1, Math.ceil(notifications.length / NOTIFICATIONS_PER_PAGE));

    const pageStart = (currentPage - 1) * NOTIFICATIONS_PER_PAGE;
    const pageNotifications = notifications.slice(pageStart, pageStart + NOTIFICATIONS_PER_PAGE);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) {
            return;
        }
        setCurrentPage(page);
    };

    return (
        <DashboardLayout activePage="Notifications" hasUnread={false} hasChatUnread={hasChatUnread}>
            <section className="space-y-6">
                <div className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Bell size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Updates</p>
                            <h3 className="text-2xl font-black text-gray-100">Latest Notifications</h3>
                            <p className="text-gray-500 text-sm">New course, quiz, and learning updates appear here.</p>
                        </div>
                    </div>

                    <button onClick={refreshPage} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-5 py-3 rounded-2xl font-black transition">
                        <RefreshCcw size={18} />
                        Refresh
                    </button>
                </div>

                <div className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6">
                    {notifications.length === 0 ? (
                        <div className="rounded-3xl bg-[#141822] border border-[#232838] p-12 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-[#1A1F2B] border border-[#232838] mx-auto flex items-center justify-center mb-4 text-gray-400">
                                <Inbox size={28} />
                            </div>
                            <h3 className="text-xl font-black text-gray-100">No notifications yet</h3>
                            <p className="text-gray-500 mt-2">You’re all caught up.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {pageNotifications.map((notification) => (
                                    <div key={notification.id} className="group bg-[#141822] hover:bg-[#1A1F2B] border border-[#232838] rounded-3xl p-5 transition">
                                        <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-11 h-11 rounded-2xl bg-[#1A1F2B] border border-[#232838] flex items-center justify-center text-gray-400 group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-violet-600 group-hover:text-white group-hover:border-transparent transition">
                                                    <Bell size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-100">{notification.message}</p>
                                                    <span className="inline-flex mt-2 text-xs font-bold bg-[#1A1F2B] border border-[#232838] text-gray-300 px-3 py-1 rounded-full">
                                                        {notification.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="inline-flex items-center gap-2 text-sm text-gray-500">
                                                <Clock3 size={15} />
                                                {notification.createdAt ? notification.createdAt.replace("T", " ").slice(0, 16) : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#232838]">
                                    <p className="text-sm text-gray-500">
                                        Page {currentPage} of {totalPages} &middot; {notifications.length} total
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center gap-1 bg-[#1A1F2B] border border-[#232838] text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-violet-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:hover:bg-[#1A1F2B] disabled:hover:text-gray-300 px-4 py-2 rounded-2xl text-sm font-bold transition"
                                        >
                                            <ChevronLeft size={16} />
                                            Prev
                                        </button>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center gap-1 bg-[#1A1F2B] border border-[#232838] text-gray-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-violet-600 hover:text-white hover:border-transparent disabled:opacity-40 disabled:hover:bg-[#1A1F2B] disabled:hover:text-gray-300 px-4 py-2 rounded-2xl text-sm font-bold transition"
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}

export default NotificationPage;