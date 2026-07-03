import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProfilePage() {
    const navigate = useNavigate();
    const [hasUnread, setHasUnread] = useState(false);
    const [hasChatUnread, setHasChatUnread] = useState(false);

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const goToProfile = () => {
        if (role === "USER") navigate("/user/profile");
        if (role === "INSTRUCTOR") navigate("/instructor/profile");
        if (role === "ADMIN") navigate("/admin/profile");
    };

    const goToDetails = () => {
        if (role === "USER") navigate("/user/details");
        if (role === "INSTRUCTOR") navigate("/instructor/details");
        if (role === "ADMIN") navigate("/admin/details");
    };

    const goToCourses = () => {
        if (role === "USER") navigate("/user/courses");
        if (role === "INSTRUCTOR") navigate("/instructor/courses");
        if (role === "ADMIN") navigate("/admin/courses");
    };

    const goToQuizzes = () => {
        if (role === "USER") navigate("/user/quizzes");
        if (role === "INSTRUCTOR") navigate("/instructor/quizzes");
        if (role === "ADMIN") navigate("/admin/quizzes");
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
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login", { replace: true });
    };

    const loadUnread = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/notifications/has-unread/" +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasUnread(data);
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
            await loadUnread();
            await loadChatUnread();
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
                            <button onClick={goToProfile} className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl">
                                Profile
                            </button>

                            <button onClick={goToDetails} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Details
                            </button>
                            <button
                                onClick={goToCourses}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                {role === "ADMIN" ? "Manage" : "Courses"}
                            </button>


                            {role !== "ADMIN" && (
                                <>
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
                                            className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                        >
                                            <span>Notifications</span>
                                            {hasUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                                        </button>
                                    )}

                                </>
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
                            <h2 className="text-3xl font-bold">{role} Profile</h2>
                        </div>

                        <button onClick={logout} className="md:hidden bg-red-500 text-white px-4 py-2 rounded-full">
                            Logout
                        </button>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-8">
                            <p className="text-gray-500 mb-2">Account Overview</p>

                            <h3 className="text-4xl font-bold mb-6">Welcome back.</h3>

                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold">{email}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-semibold">{role}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f7f7f7] rounded-[2rem] p-6">
                            <h3 className="font-bold text-xl mb-4">Quick Info</h3>

                            <div className="space-y-3">
                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    Secure JWT login
                                </div>

                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    Role-based dashboard
                                </div>

                                <div className="bg-white rounded-2xl p-4 shadow-sm">
                                    Protected routes enabled
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default ProfilePage;