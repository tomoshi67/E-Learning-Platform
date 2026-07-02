import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
            "http://localhost:8080/chat/has-unread/" +
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
                "http://localhost:8080/courses/instructor/" +
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

        const courseRes = await fetch("http://localhost:8080/courses/all", {
            headers: authHeaders(),
        });

        const allCourses = await courseRes.json();

        const enrollRes = await fetch(
            "http://localhost:8080/enrollments/user/" +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const enrollmentData = await enrollRes.json();
        setEnrollments(enrollmentData);

        const enrolledCourses = allCourses.filter((course) =>
            enrollmentData.some((enrollment) => enrollment.courseId === course.id)
        );

        setCourses(enrolledCourses);
        loadCourseUnread(enrolledCourses);
    };

    const loadCourseUnread = async (courseList) => {
        const unreadMap = {};

        for (const course of courseList) {
            const res = await fetch(
                "http://localhost:8080/chat/has-unread/" +
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

        const res = await fetch("http://localhost:8080/chat/course/" + courseId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setMessages(data);

        await fetch(
            "http://localhost:8080/chat/seen/" +
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

        const res = await fetch("http://localhost:8080/chat/send", {
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
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-xl grid grid-cols-12 overflow-hidden">
                <aside className="hidden md:flex md:col-span-3 bg-[#f7f7f7] p-6 flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-8">E-Learn</h1>

                        <div className="space-y-3">
                            <button onClick={goToProfile} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Profile
                            </button>

                            <button onClick={goToDetails} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Details
                            </button>

                            <button onClick={goToCourses} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Courses
                            </button>

                            <button onClick={goToQuizzes} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                Quizzes
                            </button>
                            <button
                                onClick={goToChat}
                                className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl flex justify-between items-center"
                            >
                                <span>Chat</span>

                                {hasUnread && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {role === "USER" && (
                                <button onClick={goToNotifications} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                    Notifications
                                </button>
                            )}


                        </div>
                    </div>

                    <button onClick={logout} className="w-full bg-red-500 text-white px-4 py-3 rounded-2xl">
                        Logout
                    </button>
                </aside>

                <main className="col-span-12 md:col-span-9 p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-500">Dashboard</p>
                        <h2 className="text-3xl font-bold">{role} Chat</h2>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="bg-[#f7f7f7] rounded-[2rem] p-6">
                            <h3 className="text-xl font-bold mb-4">Courses</h3>

                            {courses.length === 0 ? (
                                <p className="text-gray-500">
                                    {role === "USER"
                                        ? "Enroll in a course to chat."
                                        : "Create a course to chat."}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {courses.map((course) => (
                                        <button
                                            key={course.id}
                                            onClick={() => loadMessages(course.id)}
                                            className={
                                                selectedCourseId === course.id
                                                    ? "w-full text-left bg-black text-white rounded-2xl p-4 flex justify-between items-center"
                                                    : "w-full text-left bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center"
                                            }
                                        >
                                            <span>{course.title}</span>

                                            {courseUnread[course.id] && (
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-6 flex flex-col h-[75vh]">
                            {!selectedCourseId ? (
                                <p className="text-gray-500">Select a course to open chat.</p>
                            ) : (
                                <>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                        {messages.length === 0 ? (
                                            <p className="text-gray-500">No messages yet.</p>
                                        ) : (
                                            messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={
                                                        msg.senderEmail === email
                                                            ? "bg-black text-white rounded-3xl p-4 ml-auto max-w-[75%]"
                                                            : "bg-white rounded-3xl p-4 max-w-[75%] shadow-sm"
                                                    }
                                                >
                                                    <p className="text-xs opacity-70 mb-1">
                                                        {msg.senderName} ({msg.senderRole})
                                                    </p>

                                                    <p>{msg.message}</p>

                                                    <p className="text-xs opacity-60 mt-2">
                                                        {msg.createdAt
                                                            ? msg.createdAt.replace("T", " ").slice(0, 16)
                                                            : ""}
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
                                            className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
                                        />

                                        <button
                                            onClick={sendMessage}
                                            className="bg-black text-white px-6 py-3 rounded-2xl"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default ChatPage;