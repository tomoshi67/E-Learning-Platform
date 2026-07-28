import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowRight, BookOpen, Lock, Mail, User, UserRoundCog } from "lucide-react";
import API_URL from "../api";

function RegisterPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [data, setData] = useState({ username: "", email: "", password: "", role: "USER" });

    useEffect(() => {
        const existingToken = sessionStorage.getItem("token");
        const existingRole = sessionStorage.getItem("role");

        if (existingToken && existingRole) {

            if (existingRole === "USER") navigate("/user/profile", { replace: true });
            else if (existingRole === "INSTRUCTOR") navigate("/instructor/profile", { replace: true });
            else if (existingRole === "ADMIN") navigate("/admin/profile", { replace: true });
        }
    }, []);

    const change = (e) => {
        setMessage("");
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const submit = async () => {
        try {
            setMessage("");

            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const text = await res.text();

            if (
                text.includes("required") ||
                text.includes("valid") ||
                text.includes("already") ||
                text.includes("least") ||
                text.includes("not") ||
                text.includes("failed")
            ) {
                setMessage(text);
                return;
            }

            if (data.role === "ADMIN") {
                setMessage(text);
                return;
            }

            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                }),
            });

            const loginData = await loginRes.json();

            sessionStorage.setItem("token", loginData.token);
            sessionStorage.setItem("role", loginData.role);
            sessionStorage.setItem("email", loginData.email);


            if (loginData.role === "USER") {
                navigate("/user/profile", { replace: true });
            } else if (loginData.role === "INSTRUCTOR") {
                navigate("/instructor/profile", { replace: true });
            } else if (loginData.role === "ADMIN") {
                navigate("/admin/profile", { replace: true });
            }

        } catch (error) {
            console.error(error);
            setMessage("Request failed. Backend may not be running.");
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0E14] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-[#0F131C] border border-[#232838] rounded-[2rem] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">
                <aside className="hidden lg:flex lg:col-span-2 bg-gradient-to-br from-[#141822] via-[#0F131C] to-[#0F1A2E] border-r border-[#1C2130] p-10 flex-col justify-between">
                    <div>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-200 font-bold">← Back to Home</Link>
                        <div className="w-14 h-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mt-10 mb-6 shadow-lg shadow-indigo-500/30"><BookOpen size={26} /></div>
                        <h1 className="text-5xl font-black mt-4 mb-5 leading-tight text-gray-100">Start your <br /> journey.</h1>
                        <p className="text-gray-400 max-w-sm leading-7">Create an account as a student or instructor and access your role-based dashboard.</p>
                    </div>

                    <div className="bg-[#141822] rounded-3xl p-5 shadow-sm border border-[#232838]">
                        <p className="text-sm text-gray-500 mb-1">E-Learning Platform</p>
                        <p className="font-black text-gray-100">Courses, quizzes, chat, progress and more.</p>
                    </div>
                </aside>

                <main className="lg:col-span-3 flex items-center justify-center p-8 lg:p-14">
                    <div className="w-full max-w-lg">
                        <div className="lg:hidden mb-6"><Link to="/" className="text-sm text-gray-500 font-bold">← Back to Home</Link></div>

                        <p className="text-xs font-black tracking-[0.25em] text-gray-500 uppercase mb-2">Register</p>
                        <h2 className="text-4xl font-black mb-3 text-gray-100">Create account</h2>
                        <p className="text-gray-400 mb-8">Fill your details to continue.</p>

                        {message && (
                            <div className="mb-5 flex gap-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-4 font-bold">
                                <AlertCircle size={20} className="shrink-0" />
                                <p>{message}</p>
                            </div>
                        )}

                        <Field icon={<User size={16} />} label="Username" name="username" value={data.username} onChange={change} />
                        <Field icon={<Mail size={16} />} label="Email" name="email" value={data.email} onChange={change} />
                        <Field icon={<Lock size={16} />} label="Password" name="password" type="password" value={data.password} onChange={change} />

                        <label className="block mb-5">
                            <span className="text-sm font-black mb-2 flex items-center gap-2 text-gray-300"><UserRoundCog size={16} /> Role</span>
                            <select name="role" value={data.role} onChange={change} className="w-full bg-[#141822] border border-[#232838] text-gray-100 px-5 py-4 rounded-2xl outline-none focus:border-indigo-500 transition">
                                <option value="USER">USER</option>
                                <option value="INSTRUCTOR">INSTRUCTOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </label>

                        <button onClick={submit} className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white py-4 rounded-2xl font-black hover:shadow-lg hover:shadow-indigo-500/30 transition inline-flex items-center justify-center gap-2">
                            Create Account <ArrowRight size={18} />
                        </button>

                        <p className="text-center mt-6 text-gray-400">Already have an account? <Link to="/login" className="text-indigo-400 font-black hover:text-indigo-300 transition">Login</Link></p>
                    </div>
                </main>
            </div>
        </div>
    );
}

function Field({ icon, label, name, value, onChange, type = "text" }) {
    return (
        <label className="block mb-4">
            <span className="text-sm font-black mb-2 flex items-center gap-2 text-gray-300">{icon} {label}</span>
            <input name={name} type={type} placeholder={label} value={value} onChange={onChange} className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-5 py-4 rounded-2xl outline-none focus:border-indigo-500 transition" />
        </label>
    );
}

export default RegisterPage;