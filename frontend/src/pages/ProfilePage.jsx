import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProfilePage() {
    const navigate = useNavigate();

    const [hasUnread, setHasUnread] = useState(false);
    const [hasChatUnread, setHasChatUnread] = useState(false);
    const [username, setUsername] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [updatedUsername, setUpdatedUsername] = useState("");

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const formatRole = (value) => {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

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

    const loadProfile = async () => {
        const res = await fetch(
            "http://localhost:8080/auth/profile/user/" + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        if (!res.ok) {
            setUsername(email?.split("@")[0] || "");
            setUpdatedUsername(email?.split("@")[0] || "");
            return;
        }

        const data = await res.json();

        setUsername(data.username || "");
        setUpdatedUsername(data.username || "");
    };

    const updateProfile = async () => {
        if (!updatedUsername.trim()) {
            alert("Username cannot be empty");
            return;
        }

        const res = await fetch("http://localhost:8080/auth/profile/update", {
            method: "PUT",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                email: email,
                username: updatedUsername,
            }),
        });

        const text = await res.text();

        if (!res.ok) {
            alert(text);
            return;
        }

        alert(text);
        setUsername(updatedUsername);
        setEditingProfile(false);
    };

    const loadUnread = async () => {
        if (role !== "USER") return;

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
        if (role === "ADMIN") return;

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
            await loadProfile();
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

                            <button onClick={goToQuizzes} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Quizzes
                            </button>

                            {role !== "ADMIN" && (
                                <button
                                    onClick={goToChat}
                                    className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <span>Chat</span>

                                    {hasChatUnread && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    )}
                                </button>
                            )}

                            {role === "USER" && (
                                <button
                                    onClick={goToNotifications}
                                    className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <span>Notifications</span>
                                    {hasUnread && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    )}
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
                            <h2 className="text-3xl font-bold">{formatRole(role)} Profile</h2>
                        </div>

                        <button onClick={logout} className="md:hidden bg-red-500 text-white px-4 py-2 rounded-full">
                            Logout
                        </button>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <p className="text-gray-500 mb-2">Account Overview</p>
                                    <h3 className="text-4xl font-bold">Welcome back.</h3>
                                </div>

                                <button
                                    onClick={() => setEditingProfile(!editingProfile)}
                                    className="bg-black text-white px-5 py-2 rounded-full"
                                >
                                    {editingProfile ? "Cancel" : "Edit Profile"}
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Username</p>

                                    {editingProfile ? (
                                        <div className="flex gap-3 mt-2">
                                            <input
                                                value={updatedUsername}
                                                onChange={(e) => setUpdatedUsername(e.target.value)}
                                                className="flex-1 bg-[#f7f7f7] border border-gray-200 px-4 py-3 rounded-2xl outline-none"
                                            />

                                            <button
                                                onClick={updateProfile}
                                                className="bg-green-500 text-white px-5 py-2 rounded-2xl"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold">{username || "Not set"}</p>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold">{email}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-semibold">{formatRole(role)}</p>
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