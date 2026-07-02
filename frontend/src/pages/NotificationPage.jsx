import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationPage() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const [hasChatUnread, setHasChatUnread] = useState(false);

    const [notifications, setNotifications] = useState([]);

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const goToProfile = () => {
        if (role === "USER") navigate("/user/profile");
        if (role === "INSTRUCTOR") navigate("/instructor/profile");
    };

    const goToDetails = () => {
        if (role === "USER") navigate("/user/details");
        if (role === "INSTRUCTOR") navigate("/instructor/details");
    };

    const goToCourses = () => {
        if (role === "USER") navigate("/user/courses");
        if (role === "INSTRUCTOR") navigate("/instructor/courses");
    };

    const goToQuizzes = () => {
        if (role === "USER") navigate("/user/quizzes");
        if (role === "INSTRUCTOR") navigate("/instructor/quizzes");
    };

    const goToNotifications = () => {
        if (role === "USER") navigate("/user/notifications");
        if (role === "INSTRUCTOR") navigate("/instructor/notifications");
    };
    const goToChat = () => {
        if (role === "USER") navigate("/user/chat");
        if (role === "INSTRUCTOR") navigate("/instructor/chat");
    };

    const logout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    const loadNotifications = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/notifications/user/" +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setNotifications(data);
    };
    const loadChatUnread = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/chat/has-unread/" +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasChatUnread(data);
    };
    useEffect(() => {
        const initialize = async () => {
            await loadNotifications();
            await loadChatUnread();

            const email = localStorage.getItem("email");

            await fetch(
                "http://localhost:8080/notifications/mark-all-read/" +
                encodeURIComponent(email),
                {
                    method: "PUT",
                    headers: authHeaders(),
                }
            );
        };

        initialize();

    }, []);

    return (
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-xl grid grid-cols-12 overflow-hidden">

                <aside className="hidden md:flex md:col-span-3 bg-[#f7f7f7] p-6 flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-8">E-Learn</h1>

                        <div className="space-y-3">
                            <button onClick={goToProfile} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Profile
                            </button>

                            <button onClick={goToDetails} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Details
                            </button>

                            <button onClick={goToCourses} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Courses
                            </button>

                            <button onClick={goToQuizzes} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Quizzes
                            </button>
                            <button
                                onClick={goToChat}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                            >
                                <span>Chat</span>

                                {hasChatUnread && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {role === "USER" && (
                                <button
                                    onClick={goToNotifications}
                                    className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl"
                                >
                                    Notifications
                                </button>
                            )}

                        </div>
                    </div>

                    <button onClick={logout} className="w-full bg-red-500 text-white px-4 py-3 rounded-2xl">
                        Logout
                    </button>
                </aside>

                <main className="col-span-12 md:col-span-9 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Dashboard</p>
                            <h2 className="text-3xl font-bold">Notifications</h2>
                        </div>

                        <button
                            onClick={loadNotifications}
                            className="bg-black text-white px-5 py-2 rounded-full"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="md:hidden flex gap-2 mb-5 flex-wrap">
                        <button onClick={goToProfile} className="bg-white px-4 py-2 rounded-full shadow-sm">Profile</button>
                        <button onClick={goToDetails} className="bg-white px-4 py-2 rounded-full shadow-sm">Details</button>
                        <button onClick={goToCourses} className="bg-white px-4 py-2 rounded-full shadow-sm">Courses</button>
                        <button onClick={goToQuizzes} className="bg-white px-4 py-2 rounded-full shadow-sm">Quizzes</button>
                        <button onClick={goToNotifications} className="bg-black text-white px-4 py-2 rounded-full">Notifications</button>
                    </div>

                    <section className="bg-[#f7f7f7] rounded-[2rem] p-6">
                        <h3 className="text-xl font-bold mb-4">Latest Updates</h3>

                        {notifications.length === 0 ? (
                            <p className="text-gray-500">No notifications yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="bg-white rounded-3xl p-5 shadow-sm">
                                        <div className="flex justify-between gap-4">
                                            <div>
                                                <p className="font-semibold">
                                                    {notification.message}
                                                </p>

                                                <p className="text-sm text-gray-500 mt-1">
                                                    Type: {notification.type}
                                                </p>
                                            </div>

                                            <p className="text-sm text-gray-400">
                                                {notification.createdAt
                                                    ? notification.createdAt.replace("T", " ").slice(0, 16)
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default NotificationPage;
