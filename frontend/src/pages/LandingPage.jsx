import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] overflow-hidden shadow-xl grid grid-cols-12">

                {/* Left Branding Panel */}
                <aside className="col-span-3 bg-[#f7f7f7] p-6 hidden md:flex flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-4">E-Learn</h1>
                        <p className="text-gray-500 text-sm">
                            A modern learning platform for students and instructors.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2">
                            Learning made simple
                        </p>
                        <p className="font-semibold">
                            Enroll, watch, review and track your progress.
                        </p>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="col-span-12 md:col-span-9 p-6 flex flex-col">
                    <nav className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-gray-500 text-sm">Welcome to</p>
                            <h2 className="text-2xl font-bold">E-Learning Platform</h2>
                        </div>

                        <div className="flex gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2 rounded-full bg-black text-white text-sm"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="px-5 py-2 rounded-full border text-sm"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </nav>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-8 flex flex-col justify-between">
                            <div>
                                <p className="text-gray-500 mb-3">
                                    Modern online learning
                                </p>

                                <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-5">
                                    Learn better. <br />
                                    Teach smarter.
                                </h1>

                                <p className="text-gray-600 max-w-xl">
                                    A simple platform where instructors manage courses
                                    and students enroll, watch lectures, leave reviews,
                                    and track learning progress.
                                </p>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Link
                                    to="/register"
                                    className="bg-black text-white px-6 py-3 rounded-full"
                                >
                                    Get Started
                                </Link>

                                <Link
                                    to="/login"
                                    className="bg-white px-6 py-3 rounded-full shadow-sm"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>

                        <div className="bg-[#f7f7f7] rounded-[2rem] p-6">
                            <h3 className="text-xl font-bold mb-4">Features</h3>

                            <div className="space-y-3">
                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                    <p className="font-semibold">📚 Course CRUD</p>
                                    <p className="text-sm text-gray-500">
                                        Create and manage courses
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                    <p className="font-semibold">🎥 Lectures</p>
                                    <p className="text-sm text-gray-500">
                                        Upload videos, PDFs and notes
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                    <p className="font-semibold">⭐ Reviews</p>
                                    <p className="text-sm text-gray-500">
                                        Ratings and feedback
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-2xl shadow-sm">
                                    <p className="font-semibold">📈 Progress</p>
                                    <p className="text-sm text-gray-500">
                                        Track completed lectures
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default LandingPage;