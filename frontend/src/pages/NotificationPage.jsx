import { useEffect, useState } from "react";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Bell, RefreshCcw, Clock3, Inbox } from "lucide-react";

function NotificationPage() {
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const [hasChatUnread, setHasChatUnread] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
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
    };

    useEffect(() => {
        const initialize = async () => {
            await loadNotifications();
            await loadChatUnread();
            await markAllRead();
        };

        initialize();
    }, []);

    return (
        <DashboardLayout activePage="Notifications" hasUnread={false} hasChatUnread={hasChatUnread}>
            <section className="space-y-6">
                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-black text-white flex items-center justify-center shadow-lg">
                            <Bell size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Updates</p>
                            <h3 className="text-2xl font-black">Latest Notifications</h3>
                            <p className="text-gray-500 text-sm">New course, quiz, and learning updates appear here.</p>
                        </div>
                    </div>

                    <button onClick={refreshPage} className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-2xl font-black transition">
                        <RefreshCcw size={18} />
                        Refresh
                    </button>
                </div>

                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6">
                    {notifications.length === 0 ? (
                        <div className="rounded-3xl bg-gray-50 p-12 text-center">
                            <div className="w-16 h-16 rounded-3xl bg-white border mx-auto flex items-center justify-center mb-4">
                                <Inbox size={28} />
                            </div>
                            <h3 className="text-xl font-black">No notifications yet</h3>
                            <p className="text-gray-500 mt-2">You’re all caught up.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {notifications.map((notification) => (
                                <div key={notification.id} className="group bg-gray-50 hover:bg-gray-100 rounded-3xl p-5 transition">
                                    <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-11 h-11 rounded-2xl bg-white border flex items-center justify-center group-hover:bg-black group-hover:text-white transition">
                                                <Bell size={18} />
                                            </div>
                                            <div>
                                                <p className="font-black">{notification.message}</p>
                                                <span className="inline-flex mt-2 text-xs font-bold bg-white border px-3 py-1 rounded-full">
                                                    {notification.type}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="inline-flex items-center gap-2 text-sm text-gray-400">
                                            <Clock3 size={15} />
                                            {notification.createdAt ? notification.createdAt.replace("T", " ").slice(0, 16) : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}

export default NotificationPage;