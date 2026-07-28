import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, LineChart, PlayCircle, Sparkles, Star } from "lucide-react";

function LandingPage() {
    return (
        <div className="min-h-screen bg-[#0B0E14] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-[#0F131C] border border-[#232838] rounded-[2rem] overflow-hidden shadow-2xl">
                <nav className="h-20 border-b border-[#232838] px-6 lg:px-10 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-100">E-Learn</h1>
                            <p className="text-xs text-gray-500">Learning dashboard</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-5 py-2.5 rounded-2xl bg-[#141822] border border-[#232838] text-gray-200 hover:bg-[#1A1F2B] transition font-bold text-sm"
                        >
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-500/30 transition font-bold text-sm"
                        >
                            Sign Up
                        </Link>
                    </div>
                </nav>

                <main className="p-6 lg:p-10 grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <section className="xl:col-span-8 rounded-[2rem] bg-gradient-to-br from-[#141822] via-[#0F131C] to-[#1A1230] border border-[#232838] p-8 lg:p-12 shadow-sm min-h-[560px] flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full font-black text-sm mb-8">
                                <Sparkles size={16} />
                                Modern online learning
                            </div>

                            <h2 className="text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6 text-gray-100">
                                Learn better. <br />
                                Teach smarter.
                            </h2>

                            <p className="text-gray-400 text-lg max-w-2xl leading-8">
                                A clean learning platform where instructors create courses, upload resources, manage quizzes, and students enroll, learn, review, chat, and track progress.
                            </p>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-4 rounded-2xl font-black hover:shadow-lg hover:shadow-indigo-500/30 transition"
                            >
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 bg-[#141822] border border-[#232838] text-gray-200 px-6 py-4 rounded-2xl font-black hover:bg-[#1A1F2B] transition"
                            >
                                Continue Learning
                            </Link>
                        </div>
                    </section>

                    <aside className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
                        <FeatureCard
                            icon={<GraduationCap size={22} />}
                            title="Course Management"
                            text="Create, edit, publish, and organize courses."
                        />
                        <FeatureCard
                            icon={<PlayCircle size={22} />}
                            title="Lectures & Resources"
                            text="Upload videos, PDFs, images, and notes."
                        />
                        <FeatureCard
                            icon={<Star size={22} />}
                            title="Reviews & Ratings"
                            text="Students can leave useful feedback."
                        />
                        <FeatureCard
                            icon={<LineChart size={22} />}
                            title="Progress Tracking"
                            text="Track completed lectures and activity."
                        />
                    </aside>
                </main>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, text }) {
    return (
        <div className="rounded-[2rem] bg-[#141822] border border-[#232838] p-6 hover:bg-[#1A1F2B] hover:-translate-y-1 transition">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/20">
                {icon}
            </div>
            <h3 className="font-black text-lg mb-2 text-gray-100">{title}</h3>
            <p className="text-gray-500 text-sm leading-6">{text}</p>
        </div>
    );
}

export default LandingPage;