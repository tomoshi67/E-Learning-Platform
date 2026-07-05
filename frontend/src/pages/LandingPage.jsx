import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, LineChart, MessageCircle, PlayCircle, ShieldCheck, Sparkles, Star, Users } from "lucide-react";

function LandingPage() {
    return (
        <div className="min-h-screen bg-[#eef1f5] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] overflow-hidden shadow-xl">
                <nav className="h-20 border-b border-gray-100 px-6 lg:px-10 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black">E-Learn</h1>
                            <p className="text-xs text-gray-500">Learning dashboard</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link to="/login" className="px-5 py-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-100 transition font-bold text-sm">
                            Login
                        </Link>
                        <Link to="/register" className="px-5 py-2.5 rounded-2xl bg-black text-white hover:bg-gray-800 transition font-bold text-sm">
                            Sign Up
                        </Link>
                    </div>
                </nav>

                <main className="p-6 lg:p-10 grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <section className="xl:col-span-8 rounded-[2rem] bg-gradient-to-br from-white via-gray-50 to-purple-50 border border-gray-100 p-8 lg:p-12 shadow-sm min-h-[560px] flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white border border-purple-100 text-purple-700 px-4 py-2 rounded-full font-black text-sm mb-8 shadow-sm">
                                <Sparkles size={16} />
                                Modern online learning
                            </div>

                            <h2 className="text-5xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-6">
                                Learn better. <br />
                                Teach smarter.
                            </h2>

                            <p className="text-gray-600 text-lg max-w-2xl leading-8">
                                A clean learning platform where instructors create courses, upload resources, manage quizzes, and students enroll, learn, review, chat, and track progress.
                            </p>
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-row gap-3">
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-black hover:bg-gray-800 hover:shadow-lg transition">
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 px-6 py-4 rounded-2xl font-black hover:bg-gray-100 transition">
                                Continue Learning
                            </Link>
                        </div>
                    </section>

                    <aside className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-5">
                        <FeatureCard icon={<GraduationCap size={22} />} title="Course Management" text="Create, edit, publish, and organize courses." tone="from-blue-50 to-white" />
                        <FeatureCard icon={<PlayCircle size={22} />} title="Lectures & Resources" text="Upload videos, PDFs, images, and notes." tone="from-purple-50 to-white" />
                        <FeatureCard icon={<Star size={22} />} title="Reviews & Ratings" text="Students can leave useful feedback." tone="from-yellow-50 to-white" />
                        <FeatureCard icon={<LineChart size={22} />} title="Progress Tracking" text="Track completed lectures and activity." tone="from-green-50 to-white" />
                    </aside>
                    
                </main>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, text, tone }) {
    return (
        <div className={`rounded-[2rem] bg-gradient-to-br ${tone} border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition`}>
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-5">
                {icon}
            </div>
            <h3 className="font-black text-lg mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-6">{text}</p>
        </div>
    );
}

function MiniStat({ icon, value, label }) {
    return (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-sm hover:shadow-lg transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="font-black">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}

export default LandingPage;