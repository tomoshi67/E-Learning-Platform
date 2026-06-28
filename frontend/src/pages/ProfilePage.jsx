import { useNavigate } from "react-router-dom";

function ProfilePage() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const goToProfile = () => {
        if (role === "USER") navigate("/user/profile");
        if (role === "INSTRUCTOR") navigate("/instructor/profile");
        if (role === "ADMIN") navigate("/admin/dashboard");
    };

    const goToDetails = () => {
        if (role === "USER") navigate("/user/details");
        if (role === "INSTRUCTOR") navigate("/instructor/details");
        if (role === "ADMIN") navigate("/admin/dashboard");
    };

    const goToCourses = () => {
        if (role === "USER") navigate("/user/courses");
        if (role === "INSTRUCTOR") navigate("/instructor/courses");
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-xl grid grid-cols-12 overflow-hidden">

                <aside className="hidden md:flex md:col-span-3 bg-[#f7f7f7] p-6 flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-8">E-Learn</h1>

                        <div className="space-y-3">
                            <button
                                onClick={goToProfile}
                                className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl"
                            >
                                Profile
                            </button>

                            <button
                                onClick={goToDetails}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                Details
                            </button>

                            {role !== "ADMIN" && (
                                <button
                                    onClick={goToCourses}
                                    className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                                >
                                    Courses
                                </button>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full bg-red-500 text-white px-4 py-3 rounded-2xl"
                    >
                        Logout
                    </button>
                </aside>

                <main className="col-span-12 md:col-span-9 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Dashboard</p>
                            <h2 className="text-3xl font-bold">{role} Profile</h2>
                        </div>

                        <button
                            onClick={logout}
                            className="md:hidden bg-red-500 text-white px-4 py-2 rounded-full"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="md:hidden flex gap-2 mb-5">
                        <button
                            onClick={goToProfile}
                            className="bg-black text-white px-4 py-2 rounded-full"
                        >
                            Profile
                        </button>

                        <button
                            onClick={goToDetails}
                            className="bg-white px-4 py-2 rounded-full shadow-sm"
                        >
                            Details
                        </button>

                        {role !== "ADMIN" && (
                            <button
                                onClick={goToCourses}
                                className="bg-white px-4 py-2 rounded-full shadow-sm"
                            >
                                Courses
                            </button>
                        )}
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-8">
                            <p className="text-gray-500 mb-2">Account Overview</p>

                            <h3 className="text-4xl font-bold mb-6">
                                Welcome back.
                            </h3>

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