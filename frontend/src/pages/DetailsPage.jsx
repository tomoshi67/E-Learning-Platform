import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function DetailsPage() {
    const navigate = useNavigate();

    const [hasUnread, setHasUnread] = useState(false);
    const [hasChatUnread, setHasChatUnread] = useState(false);
    const [users, setUsers] = useState([]);
    const [adminRequests, setAdminRequests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [courseStats, setCourseStats] = useState([]);
    const [weeklyCompletedCount, setWeeklyCompletedCount] = useState(0);
    const [lastVisitedCourse, setLastVisitedCourse] = useState("");

    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const goToProfile = () => {
        if (role === "USER") navigate("/user/profile");
        if (role === "INSTRUCTOR") navigate("/instructor/profile");
        if (role === "ADMIN") navigate("/admin/profile");
    };

    const goToDetails = () => {
        if (role === "USER") navigate("/user/details");
        if (role === "INSTRUCTOR") navigate("/instructor/details");
        if (role === "ADMIN") navigate("/admin/details");
    };

    const goToCourses = () => {
        if (role === "USER") navigate("/user/courses");
        if (role === "INSTRUCTOR") navigate("/instructor/courses");
        if (role === "ADMIN") navigate("/admin/courses");
    };

    const goToQuizzes = () => {
        if (role === "USER") navigate("/user/quizzes");
        if (role === "INSTRUCTOR") navigate("/instructor/quizzes");
        if (role === "ADMIN") navigate("/admin/quizzes");
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
        if (role !== "USER") return;

        const res = await fetch(
            "http://localhost:8080/notifications/has-unread/" + encodeURIComponent(email),
            { headers: authHeaders() }
        );

        const data = await res.json();
        setHasUnread(data);
    };

    const loadChatUnread = async () => {
        if (role === "ADMIN") return;

        const res = await fetch(
            "http://localhost:8080/chat/has-unread/" + encodeURIComponent(email),
            { headers: authHeaders() }
        );

        const data = await res.json();
        setHasChatUnread(data);
    };

    const loadUsers = async () => {
        const res = await fetch("http://localhost:8080/admin/users", {
            headers: authHeaders(),
        });

        const data = await res.json();
        setUsers(data);
    };

    const deleteUser = async (id) => {
        await fetch("http://localhost:8080/admin/users/delete/" + id, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadUsers();
    };

    const loadAdminRequests = async () => {
        const res = await fetch("http://localhost:8080/admin/admin-requests", {
            headers: authHeaders(),
        });

        const data = await res.json();
        setAdminRequests(data);
    };

    const approveAdminRequest = async (id) => {
        await fetch("http://localhost:8080/admin/admin-requests/approve/" + id, {
            method: "POST",
            headers: authHeaders(),
        });

        await loadAdminRequests();
        await loadUsers();
    };

    const rejectAdminRequest = async (id) => {
        await fetch("http://localhost:8080/admin/admin-requests/reject/" + id, {
            method: "POST",
            headers: authHeaders(),
        });

        await loadAdminRequests();
    };
    const loadUserDetailsData = async () => {
        const userEmail = localStorage.getItem("email");

        const courseRes = await fetch("http://localhost:8080/courses/all", {
            headers: authHeaders(),
        });
        const allCourses = await courseRes.json();

        const enrollRes = await fetch(
            "http://localhost:8080/enrollments/user/" + encodeURIComponent(userEmail),
            { headers: authHeaders() }
        );
        const enrollmentData = await enrollRes.json();

        setEnrollments(enrollmentData);

        const enrolledCourses = allCourses.filter((course) =>
            enrollmentData.some((enrollment) => enrollment.courseId === course.id)
        );

        setCourses(enrolledCourses);
    };

    const loadInstructorDetailsData = async () => {
        const instructorEmail = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/courses/instructor/" + encodeURIComponent(instructorEmail),
            { headers: authHeaders() }
        );

        const instructorCourses = await res.json();
        setCourses(instructorCourses);

        const stats = [];

        for (const course of instructorCourses) {
            const enrollRes = await fetch(
                "http://localhost:8080/enrollments/course/" + course.id,
                { headers: authHeaders() }
            );

            const courseEnrollments = await enrollRes.json();

            stats.push({
                ...course,
                enrolledCount: courseEnrollments.length,
            });
        }

        setCourseStats(stats);
    };
    const loadUserPerformance = async () => {
        const userEmail = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/progress/user/" + encodeURIComponent(userEmail),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        const completedThisWeek = data.filter((progress) => {
            if (!progress.completed || !progress.completedAt) return false;

            const completedDate = new Date(progress.completedAt);
            return completedDate >= sevenDaysAgo && completedDate <= now;
        });

        setWeeklyCompletedCount(completedThisWeek.length);
        setLastVisitedCourse(localStorage.getItem("lastVisitedCourse") || "No course visited yet");
    };
    useEffect(() => {
        const initialize = async () => {
            if (role === "ADMIN") {
                await loadUsers();
                await loadAdminRequests();
            } else {
                await loadChatUnread();
                await loadUnread();
            }
            if (role === "USER") {
                await loadUserDetailsData();
                await loadUserPerformance();
            }

            if (role === "INSTRUCTOR") {
                await loadInstructorDetailsData();
            }
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

                            <button onClick={goToDetails} className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl">
                                Details
                            </button>

                            <button onClick={goToCourses} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                {role === "ADMIN" ? "Manage" : "Courses"}
                            </button>

                            {role !== "ADMIN" && (
                                <>
                                    <button onClick={goToQuizzes} className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm">
                                        Quizzes
                                    </button>

                                    <button
                                        onClick={goToChat}
                                        className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                    >
                                        <span>Chat</span>
                                        {hasChatUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                                    </button>
                                </>
                            )}

                            {role === "USER" && (
                                <button
                                    onClick={goToNotifications}
                                    className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <span>Notifications</span>
                                    {hasUnread && <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>}
                                </button>
                            )}
                        </div>
                    </div>

                    <button onClick={logout} className="w-full bg-red-500 text-white px-4 py-3 rounded-2xl">
                        Logout
                    </button>
                </aside>

                <main className="col-span-12 md:col-span-9 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Dashboard</p>
                            <h2 className="text-3xl font-bold">
                                {role === "ADMIN" ? "Admin Management" : `${role} Details`}
                            </h2>
                        </div>

                        <button onClick={logout} className="md:hidden bg-red-500 text-white px-4 py-2 rounded-full">
                            Logout
                        </button>
                    </div>

                    {role === "ADMIN" ? (
                        <section className="bg-[#f7f7f7] rounded-[2rem] p-6">
                            <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
                                <h4 className="text-xl font-bold mb-4">Manage Accounts</h4>

                                {users.length === 0 ? (
                                    <p className="text-gray-500">No users found.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {users.map((user) => (
                                            <div
                                                key={user.id}
                                                className="bg-[#f7f7f7] rounded-2xl p-4 flex justify-between items-center gap-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">{user.username}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-sm font-semibold">{user.role}</p>
                                                </div>

                                                {user.email !== email && (
                                                    <button
                                                        onClick={() => deleteUser(user.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-full text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-white rounded-3xl p-5 shadow-sm">
                                <h4 className="text-xl font-bold mb-4">Pending Admin Requests</h4>

                                {adminRequests.length === 0 ? (
                                    <p className="text-gray-500">No pending admin requests.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {adminRequests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="bg-[#f7f7f7] rounded-2xl p-4 flex justify-between items-center gap-3"
                                            >
                                                <div>
                                                    <p className="font-semibold">{request.username}</p>
                                                    <p className="text-sm text-gray-500">{request.email}</p>
                                                    <p className="text-sm font-semibold">{request.status}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => approveAdminRequest(request.id)}
                                                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() => rejectAdminRequest(request.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-full text-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : (
                        <section className="bg-[#f7f7f7] rounded-[2rem] p-8">
                            <p className="text-gray-500 mb-2">Account Details</p>

                            <h3 className="text-4xl font-bold mb-6">
                                {role === "USER" ? "Your Learning Summary" : "Instructor Summary"}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-semibold break-all">{email}</p>
                                </div>

                                <div className="bg-white rounded-2xl p-5 shadow-sm">
                                    <p className="text-sm text-gray-500">Role</p>
                                    <p className="font-semibold">
                                        {role.charAt(0) + role.slice(1).toLowerCase()}
                                    </p>
                                </div>
                            </div>
                            {role === "USER" && (
                                <div className="bg-white rounded-3xl p-5 shadow-sm">
                                    <h4 className="text-xl font-bold mb-4">
                                        This Week Performance
                                    </h4>

                                    <div className="space-y-3">
                                        <div className="bg-[#f7f7f7] rounded-2xl p-4">
                                            <p className="text-sm text-gray-500">
                                                Lectures completed this week
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {weeklyCompletedCount}
                                            </p>
                                        </div>

                                        <div className="bg-[#f7f7f7] rounded-2xl p-4">
                                            <p className="text-sm text-gray-500">
                                                Last visited course
                                            </p>
                                            <p className="font-semibold">
                                                {lastVisitedCourse}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {role === "USER" && (


                                <div className="bg-white rounded-3xl p-5 shadow-sm">
                                    <h4 className="text-xl font-bold mb-4">
                                        Enrolled Courses
                                    </h4>

                                    {courses.length === 0 ? (
                                        <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {courses.map((course) => (
                                                <div key={course.id} className="bg-[#f7f7f7] rounded-2xl p-4">
                                                    <p className="font-semibold">{course.title}</p>
                                                    <p className="text-sm text-gray-500">{course.category}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            )}

                            {role === "INSTRUCTOR" && (
                                <div className="bg-white rounded-3xl p-5 shadow-sm">
                                    <h4 className="text-xl font-bold mb-4">
                                        Course Performance
                                    </h4>

                                    {courseStats.length === 0 ? (
                                        <p className="text-gray-500">No courses created yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {courseStats.map((course) => (
                                                <div key={course.id} className="bg-[#f7f7f7] rounded-2xl p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold">{course.title}</p>
                                                        <p className="text-sm text-gray-500">{course.category}</p>
                                                    </div>

                                                    <p className="text-sm font-bold">
                                                        {course.enrolledCount} enrolled
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default DetailsPage;