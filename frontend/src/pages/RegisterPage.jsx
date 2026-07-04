import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
    const navigate = useNavigate();

    const [message, setMessage] = useState("");

    const [data, setData] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
    });

    const change = (e) => {
        setMessage("");
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async () => {
        try {
            const registerRes = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const registerMessage = await registerRes.text();
            setMessage(registerMessage);

            if (!registerMessage.toLowerCase().includes("success")) {
                return;
            }
            if (data.role === "ADMIN") {
                alert("Admin request submitted successfully. Please wait for approval.");
                navigate("/login");
                return;
            }
            const loginRes = await fetch("http://localhost:8080/auth/login", {
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

            localStorage.setItem("token", loginData.token);
            localStorage.setItem("role", loginData.role);
            localStorage.setItem("email", loginData.email);

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
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-5">

                <div className="hidden lg:flex lg:col-span-2 bg-[#f7f7f7] p-10 flex-col justify-between">
                    <div>
                        <Link
                            to="/"
                            className="text-sm text-gray-500"
                        >
                            ← Back to Home
                        </Link>

                        <h1 className="text-5xl font-bold mt-10 mb-5 leading-tight">
                            Create your account.
                        </h1>

                        <p className="text-gray-600 max-w-sm">
                            Join the platform to enroll in courses, upload
                            lectures, review content, and track your learning
                            journey.
                        </p>

                        <div className="mt-10 space-y-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">📚 Learn Anywhere</p>
                                <p className="text-sm text-gray-500">
                                    Access your courses from anywhere.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">🎥 Watch Lectures</p>
                                <p className="text-sm text-gray-500">
                                    Learn through videos, PDFs and notes.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">📈 Track Progress</p>
                                <p className="text-sm text-gray-500">
                                    Stay motivated with progress tracking.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">
                            E-Learning Platform
                        </p>
                        <p className="font-semibold">
                            Learn better. Teach smarter.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-3 flex items-center justify-center p-8 lg:p-14">
                    <div className="w-full max-w-lg">

                        <div className="lg:hidden mb-6">
                            <Link
                                to="/"
                                className="text-sm text-gray-500"
                            >
                                ← Back to Home
                            </Link>
                        </div>

                        <p className="text-gray-500 mb-2">
                            Create your account
                        </p>

                        <h2 className="text-4xl font-bold mb-3">
                            Register
                        </h2>

                        <p className="text-gray-500 mb-8">
                            Fill in your details to get started.
                        </p>

                        <input
                            name="username"
                            placeholder="Username"
                            value={data.username}
                            onChange={change}
                            className="w-full bg-[#f7f7f7] border border-gray-200 px-5 py-4 mb-4 rounded-2xl outline-none focus:border-black"
                        />

                        <input
                            name="email"
                            placeholder="Email"
                            value={data.email}
                            onChange={change}
                            className="w-full bg-[#f7f7f7] border border-gray-200 px-5 py-4 mb-4 rounded-2xl outline-none focus:border-black"
                        />

                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={change}
                            className="w-full bg-[#f7f7f7] border border-gray-200 px-5 py-4 mb-4 rounded-2xl outline-none focus:border-black"
                        />

                        <select
                            name="role"
                            value={data.role}
                            onChange={change}
                            className="w-full bg-[#f7f7f7] border border-gray-200 px-5 py-4 mb-5 rounded-2xl outline-none focus:border-black"
                        >
                            <option value="USER">USER</option>
                            <option value="INSTRUCTOR">INSTRUCTOR</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>

                        <button
                            onClick={submit}
                            className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                        >
                            Create Account
                        </button>

                        {message && (
                            <p className="mt-4 text-sm text-green-600">
                                {message}
                            </p>
                        )}

                        <p className="text-center mt-6 text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-black font-semibold underline"
                            >
                                Login
                            </Link>
                        </p>

                    </div>
                </div>

            </div>
        </div>
    );
}

export default RegisterPage;