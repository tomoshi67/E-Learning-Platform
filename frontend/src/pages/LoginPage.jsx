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

                navigate("/profile");
            } catch {
                setMessage(text);
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
                    Login
                </h1>

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

                <button
                    onClick={submit}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    Login
                </button>

                {message && (
                    <p className="text-red-600 mt-3 text-sm">
                        {message}
                    </p>
                )}

                <Link
                    to="/register"
                    className="block text-center mt-4 text-blue-600"
                >
                    Go to Register
                </Link>

            </div>
        </div>
    );
}

export default LoginPage;