import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();

    const [message, setMessage] = useState("");

    const [data, setData] = useState({
        email: "",
        password: "",
    });

    useEffect(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
    }, []);

    const change = (e) => {
        setMessage("");
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const submit = async () => {
        try {
            const res = await fetch("http://localhost:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const text = await res.text();

            try {
                const result = JSON.parse(text);

                localStorage.setItem("token", result.token);
                localStorage.setItem("role", result.role);
                localStorage.setItem("email", result.email);

                if (result.role === "USER") navigate("/user/profile");
                if (result.role === "INSTRUCTOR") navigate("/instructor/profile");
                if (result.role === "ADMIN") navigate("/admin/profile");
            } catch {
                setMessage(text);
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
                        <Link to="/" className="text-sm text-gray-500">
                            ← Back to Home
                        </Link>

                        <h1 className="text-5xl font-bold mt-10 mb-5 leading-tight">
                            Welcome <br /> back.
                        </h1>

                        <p className="text-gray-600 max-w-sm">
                            Login to continue learning, manage your dashboard,
                            view courses, and track your progress.
                        </p>

                        <div className="mt-10 space-y-4">
                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">📚 Continue Courses</p>
                                <p className="text-sm text-gray-500">
                                    Access enrolled courses and lectures.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">📈 Track Progress</p>
                                <p className="text-sm text-gray-500">
                                    Resume from where you stopped.
                                </p>
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <p className="font-semibold">⭐ Review Courses</p>
                                <p className="text-sm text-gray-500">
                                    Share feedback after learning.
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
                            <Link to="/" className="text-sm text-gray-500">
                                ← Back to Home
                            </Link>
                        </div>

                        <p className="text-gray-500 mb-2">
                            Login to your account
                        </p>

                        <h2 className="text-4xl font-bold mb-3">
                            Welcome back
                        </h2>

                        <p className="text-gray-500 mb-8">
                            Enter your email and password to continue.
                        </p>

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
                            className="w-full bg-[#f7f7f7] border border-gray-200 px-5 py-4 mb-5 rounded-2xl outline-none focus:border-black"
                        />

                        <button
                            onClick={submit}
                            className="w-full bg-black text-white py-4 rounded-2xl font-semibold hover:opacity-90 transition"
                        >
                            Login
                        </button>

                        {message && (
                            <p className="text-red-600 mt-4 text-sm">
                                {message}
                            </p>
                        )}

                        <p className="text-center mt-6 text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-black font-semibold underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default LoginPage;