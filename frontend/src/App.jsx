import { useState } from "react";

function App() {
    const [login, setLogin] = useState(false)
    const [data, setData] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
    });

    const change = (e) =>
        setData({ ...data, [e.target.name]: e.target.value });

    const submit = async () => {
        const url = login ? "/auth/login" : "/auth/register";

        const body = login
            ? { email: data.email, password: data.password }
            : data;

        const res = await fetch("http://localhost:8080" + url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        alert(await res.text());
    };

    return (

        <div className="min-h-screen flex items-center justify-center">
            <div className="w-96 p-6 border rounded-lg shadow">
                <h1 className="text-2xl font-bold mb-4">
                    {login ? "Login" : "Signup"}
                </h1>

                {!login && (
                    <input name="username" placeholder="Username" onChange={change}
                           className="w-full border p-2 mb-3" />
                )}

                <input name="email" placeholder="Email" onChange={change}
                       className="w-full border p-2 mb-3" />

                <input name="password" type="password" placeholder="Password" onChange={change}
                       className="w-full border p-2 mb-3" />

                {!login && (
                    <select name="role" onChange={change}
                            className="w-full border p-2 mb-3">
                        <option value="USER">USER</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                )}

                <button onClick={submit}
                        className="w-full bg-blue-500 text-white p-2 rounded">
                    {login ? "Login" : "Register"}
                </button>

                <button onClick={() => setLogin(!login)}
                        className="w-full mt-4 text-blue-600">
                    {login ? "Go to Signup" : "Go to Login"}
                </button>
            </div>
        </div>
    );
}

export default App;