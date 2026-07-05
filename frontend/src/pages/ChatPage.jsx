import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { MessageCircle, Send, BookOpen, Users, Circle } from "lucide-react";

function ChatPage() {
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState("");
    const [courseUnread, setCourseUnread] = useState({});
    const [hasUnread, setHasUnread] = useState(false);

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const goToProfile = () => {
        if (role === "USER") navigate("/user/profile");
        if (role === "INSTRUCTOR") navigate("/instructor/profile");
    };

    const goToDetails = () => {
        if (role === "USER") navigate("/user/details");
        if (role === "INSTRUCTOR") navigate("/instructor/details");
    };

    const goToCourses = () => {
        if (role === "USER") navigate("/user/courses");
        if (role === "INSTRUCTOR") navigate("/instructor/courses");
    };

    const goToQuizzes = () => {
        if (role === "USER") navigate("/user/quizzes");
        if (role === "INSTRUCTOR") navigate("/instructor/quizzes");
    };

    const goToNotifications = () => {
        if (role === "USER") navigate("/user/notifications");
    };

    const goToChat = () => {
        if (role === "USER") navigate("/user/chat");
        if (role === "INSTRUCTOR") navigate("/instructor/chat");
    };

    const logout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    const loadUnread = async () => {
        const res = await fetch(

            `${API_URL}/chat/has-unread/`+
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasUnread(data);
    };

    const loadCourses = async () => {
        if (role === "INSTRUCTOR") {
            const res = await fetch(
                `${API_URL}/courses/instructor/`+
                encodeURIComponent(email),
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();
            setCourses(data);
            loadCourseUnread(data);
            return;
        }

        const enrollRes = await fetch(
            `${API_URL}/enrollments/user/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const enrollmentData = await enrollRes.json();

        const courseRes = await fetch(`${API_URL}/courses/all`, {
            headers: authHeaders(),
        });

        const allCourses = await courseRes.json();

        const enrolledCourses = allCourses.filter((course) =>
            enrollmentData.some((enrollment) => enrollment.courseId === course.id)
        );

        setCourses(enrolledCourses);
        await loadCourseUnread(enrolledCourses);
    };

    const loadCourseUnread = async (courseList) => {
        const unreadMap = {};

        for (const course of courseList) {
            const res = await fetch(
                `${API_URL}/chat/has-unread/` +
                course.id +
                "/" +
                encodeURIComponent(email),
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();
            unreadMap[course.id] = data;
        }

        setCourseUnread(unreadMap);
    };

    const loadMessages = async (courseId) => {
        setSelectedCourseId(courseId);

        const res = await fetch(`${API_URL}/chat/course/` + courseId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setMessages(data);

        await fetch(
            `${API_URL}/chat/seen/` +
            courseId +
            "/" +
            encodeURIComponent(email),
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        setCourseUnread({
            ...courseUnread,
            [courseId]: false,
        });

        await loadUnread();
    };

    const sendMessage = async () => {
        if (!selectedCourseId) {
            alert("Select a course first");
            return;
        }

        if (!messageText.trim()) {
            return;
        }

        const res = await fetch(`${API_URL}/chat/send`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                courseId: selectedCourseId,
                senderEmail: email,
                senderRole: role,
                message: messageText,
            }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            alert("Message send failed: " + errorText);
            return;
        }

        setMessageText("");
        await loadMessages(selectedCourseId);
    };

    useEffect(() => {
        const initialize = async () => {
            await loadCourses();
            await loadUnread();
        };

        initialize();

    }, []);

    return (
        <DashboardLayout activePage="Chat" hasChatUnread={hasUnread}>
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Channels</p>
                            <h3 className="text-xl font-black">Courses</h3>
                        </div>
                    </div>

                    {courses.length === 0 ? (
                        <div className="rounded-3xl bg-gray-50 p-8 text-center text-gray-500">
                            {role === "USER" ? "Enroll in a course to chat." : "Create a course to chat."}
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => loadMessages(course.id)}
                                    className={
                                        selectedCourseId === course.id
                                            ? "w-full text-left bg-black text-white rounded-3xl p-4 flex justify-between items-center shadow-lg transition"
                                            : "w-full text-left bg-gray-50 hover:bg-gray-100 rounded-3xl p-4 flex justify-between items-center transition"
                                    }
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={selectedCourseId === course.id ? "w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center" : "w-10 h-10 rounded-2xl bg-white border flex items-center justify-center"}>
                                            <MessageCircle size={18} />
                                        </div>
                                        <div>
                                            <p className="font-black">{course.title}</p>
                                            <p className={selectedCourseId === course.id ? "text-xs text-white/60" : "text-xs text-gray-500"}>{course.category || "Course chat"}</p>
                                        </div>
                                    </div>

                                    {courseUnread[course.id] && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="xl:col-span-2 rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6 flex flex-col h-[78vh]">
                    {!selectedCourseId ? (
                        <div className="flex-1 rounded-3xl bg-gray-50 flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 rounded-3xl bg-black text-white flex items-center justify-center mb-4">
                                <MessageCircle size={28} />
                            </div>
                            <h3 className="text-2xl font-black">Open a course chat</h3>
                            <p className="text-gray-500 mt-2">Select a course from the left to start messaging.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Live Discussion</p>
                                    <h3 className="text-xl font-black">Course Chat</h3>
                                </div>
                                <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-2xl text-sm font-bold">
                                    <Circle size={10} fill="currentColor" />
                                    Active
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 bg-gray-50 rounded-3xl p-4">
                                {messages.length === 0 ? (
                                    <p className="text-gray-500 text-center mt-8">No messages yet.</p>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={
                                                msg.senderEmail === email
                                                    ? "bg-black text-white rounded-3xl p-4 ml-auto max-w-[78%] shadow-md"
                                                    : "bg-white rounded-3xl p-4 max-w-[78%] shadow-sm border border-gray-100"
                                            }
                                        >
                                            <p className="text-xs opacity-70 mb-1 font-bold">
                                                {msg.senderName} ({msg.senderRole})
                                            </p>

                                            <p>{msg.message}</p>

                                            <p className="text-xs opacity-60 mt-2">
                                                {msg.createdAt ? msg.createdAt.replace("T", " ").slice(0, 16) : ""}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <input
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            sendMessage();
                                        }
                                    }}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-black"
                                />

                                <button onClick={sendMessage} className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-black transition">
                                    <Send size={18} />
                                    Send
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}

export default ChatPage;