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
            const res = await fetch("http://localhost:8080/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const text = await res.text();
            setMessage(text);

            if (text.toLowerCase().includes("success")) {
                setTimeout(() => {
                    navigate("/login", { replace: true });
                }, 1000);
            }
        } catch (error) {
            console.error(error);
            setMessage("Request failed. Backend may not be running.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-96 p-6 border rounded-lg shadow bg-white">

                <h1 className="text-2xl font-bold mb-4">
                    Register
                </h1>

                <input
                    name="username"
                    placeholder="Username"
                    value={data.username}
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={data.email}
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={data.password}
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                />

                <select
                    name="role"
                    value={data.role}
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                >
                    <option value="USER">USER</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>

                <button
                    onClick={submit}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Register
                </button>

                {message && (
                    <p className="mt-3 text-sm text-green-600">
                        {message}
                    </p>
                )}

                <Link
                    to="/login"
                    className="block text-center mt-4 text-blue-600"
                >
                    Go to Login
                </Link>

            </div>
        </div>
    );
}

export default RegisterPage;