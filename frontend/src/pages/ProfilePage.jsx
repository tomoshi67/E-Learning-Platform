import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { User, Mail, Shield, Pencil, Save, X } from "lucide-react";

function ProfilePage() {
    const [hasUnread, setHasUnread] = useState(false);
    const [hasChatUnread, setHasChatUnread] = useState(false);
    const [username, setUsername] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);
    const [updatedUsername, setUpdatedUsername] = useState("");

    const role = sessionStorage.getItem("role");
    const email = sessionStorage.getItem("email");

    const authHeaders = () => ({
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const formatRole = (value) => {
        if (!value) return "";
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    };

    const loadProfile = async () => {
        const res = await fetch(
            `${API_URL}/auth/profile/user/` + encodeURIComponent(email),
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

        const res = await fetch(`${API_URL}/auth/profile/update`, {
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
            `${API_URL}/notifications/has-unread/` +
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
            `${API_URL}/chat/has-unread/` +
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
        <DashboardLayout activePage="Profile" hasUnread={hasUnread} hasChatUnread={hasChatUnread}>
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-7">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-7">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-indigo-500/30">
                                {(username || email || "U").charAt(0).toUpperCase()}
                            </div>

                            <div>
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Account Overview</p>
                                <h3 className="text-3xl font-black text-gray-100 mt-1">{username || "Your Profile"}</h3>
                                <p className="text-gray-400 text-sm break-all">{email}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setEditingProfile(!editingProfile)}
                            className={
                                editingProfile
                                    ? "inline-flex items-center gap-2 bg-[#1A1F2B] border border-[#232838] hover:bg-[#232838] text-gray-200 px-5 py-3 rounded-2xl font-bold transition"
                                    : "inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-5 py-3 rounded-2xl font-bold transition"
                            }
                        >
                            {editingProfile ? <X size={18} /> : <Pencil size={18} />}
                            {editingProfile ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-3xl bg-[#141822] border border-[#232838] p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Username</p>
                                    <p className="text-sm text-gray-500">Public display name</p>
                                </div>
                            </div>

                            {editingProfile ? (
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        value={updatedUsername}
                                        onChange={(e) => setUpdatedUsername(e.target.value)}
                                        className="flex-1 bg-[#0F131C] border border-[#232838] text-gray-100 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                    />

                                    <button
                                        onClick={updateProfile}
                                        className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-bold transition"
                                    >
                                        <Save size={18} />
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xl font-black text-gray-100">{username || "Not set"}</p>
                            )}
                        </div>

                        <div className="rounded-3xl bg-[#141822] border border-[#232838] p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Email</p>
                                    <p className="text-sm text-gray-500">Login identity</p>
                                </div>
                            </div>

                            <p className="text-lg font-bold text-gray-100 break-all">{email}</p>
                        </div>

                        <div className="md:col-span-2 rounded-3xl bg-[#141822] border border-[#232838] p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-11 h-11 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Role</p>
                                    <p className="text-sm text-gray-500">Your dashboard permission</p>
                                </div>
                            </div>

                            <span className="inline-flex px-4 py-2 rounded-2xl bg-[#0F131C] border border-[#232838] text-gray-100 font-black">
                                {formatRole(role)}
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}

export default ProfilePage;