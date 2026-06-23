import { useNavigate } from "react-router-dom";

function DetailsPage() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">

                <h1 className="text-3xl font-bold mb-4">
                    {localStorage.getItem("role")} Dashboard
                </h1>

                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => navigate("/profile")}
                        className="border px-4 py-2 rounded"
                    >
                        Profile
                    </button>

                    <button
                        onClick={() => navigate("/details")}
                        className="border px-4 py-2 rounded"
                    >
                        Details
                    </button>

                    <button
                        onClick={() => navigate("/courses")}
                        className="border px-4 py-2 rounded"
                    >
                        Courses
                    </button>
                </div>

                <div className="border p-4 rounded">
                    <h2 className="font-bold mb-2">Details</h2>
                    <p>Basic account and platform information.</p>
                    <p className="mt-2">Logged in as: {localStorage.getItem("email")}</p>
                    <p>Role: {localStorage.getItem("role")}</p>
                </div>

                <button
                    onClick={logout}
                    className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>

            </div>
        </div>
    );
}

export default DetailsPage;