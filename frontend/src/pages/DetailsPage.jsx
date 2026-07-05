import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { Users, BookOpen, TrendingUp, Clock3, Trash2, Check, X, Shield, Mail, UserCheck } from "lucide-react";

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
            `${API_URL}/notifications/has-unread/` + encodeURIComponent(email),
            { headers: authHeaders() }
        );

        const data = await res.json();
        setHasUnread(data);
    };

    const loadChatUnread = async () => {
        if (role === "ADMIN") return;

        const res = await fetch(
            `${API_URL}/chat/has-unread/` + encodeURIComponent(email),
            { headers: authHeaders() }
        );

        const data = await res.json();
        setHasChatUnread(data);
    };

    const loadUsers = async () => {
        const res = await fetch(`${API_URL}/admin/users`, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setUsers(data);
    };

    const deleteUser = async (id) => {
        await fetch(`${API_URL}/admin/users/delete/` + id, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadUsers();
    };

    const loadAdminRequests = async () => {
        const res = await fetch(`${API_URL}/admin/admin-requests`, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setAdminRequests(data);
    };

    const approveAdminRequest = async (id) => {
        await fetch(`${API_URL}/admin/admin-requests/approve/` + id, {
            method: "POST",
            headers: authHeaders(),
        });

        await loadAdminRequests();
        await loadUsers();
    };

    const rejectAdminRequest = async (id) => {
        await fetch(`${API_URL}/admin/admin-requests/reject/` + id, {
            method: "POST",
            headers: authHeaders(),
        });

        await loadAdminRequests();
    };
    const loadUserDetailsData = async () => {
        const userEmail = localStorage.getItem("email");

        const courseRes = await fetch(`${API_URL}/courses/all`, {
            headers: authHeaders(),
        });
        const allCourses = await courseRes.json();

        const enrollRes = await fetch(
            `${API_URL}/enrollments/user/` + encodeURIComponent(userEmail),
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
            `${API_URL}/courses/instructor/` + encodeURIComponent(instructorEmail),
            { headers: authHeaders() }
        );

        const instructorCourses = await res.json();
        setCourses(instructorCourses);

        const stats = [];

        for (const course of instructorCourses) {
            const enrollRes = await fetch(
                `${API_URL}/enrollments/course/` + course.id,
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
            `${API_URL}/progress/user/` + encodeURIComponent(userEmail),
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
        <DashboardLayout activePage="Details" hasUnread={hasUnread} hasChatUnread={hasChatUnread}>
            {role === "ADMIN" ? (
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mb-4">
                                <Users size={22} />
                            </div>
                            <p className="text-gray-500 text-sm">Total accounts</p>
                            <h3 className="text-3xl font-black">{users.length}</h3>
                        </div>

                        <div className="rounded-[2rem] bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-4">
                                <Shield size={22} />
                            </div>
                            <p className="text-gray-500 text-sm">Admin requests</p>
                            <h3 className="text-3xl font-black">{adminRequests.length}</h3>
                        </div>

                        <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-white border border-green-100 p-6 shadow-sm">
                            <div className="w-12 h-12 rounded-2xl bg-green-600 text-white flex items-center justify-center mb-4">
                                <UserCheck size={22} />
                            </div>
                            <p className="text-gray-500 text-sm">Current admin</p>
                            <h3 className="text-lg font-black break-all">{email}</h3>
                        </div>
                    </div>

                    <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Admin Center</p>
                                <h3 className="text-2xl font-black">Manage Accounts</h3>
                            </div>
                        </div>

                        {users.length === 0 ? (
                            <p className="text-gray-500">No users found.</p>
                        ) : (
                            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                {users.map((user) => (
                                    <div key={user.id} className="group bg-gray-50 hover:bg-gray-100 rounded-3xl p-4 flex justify-between items-center gap-3 transition">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center font-black">
                                                {(user.username || user.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black">{user.username}</p>
                                                <p className="text-sm text-gray-500 break-all">{user.email}</p>
                                                <span className="inline-flex mt-1 text-xs font-bold bg-white border px-3 py-1 rounded-full">{user.role}</span>
                                            </div>
                                        </div>

                                        {user.email !== email && (
                                            <button onClick={() => deleteUser(user.id)} className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-2xl text-sm font-bold transition">
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-2xl font-black mb-5">Pending Admin Requests</h3>

                        {adminRequests.length === 0 ? (
                            <div className="rounded-3xl bg-gray-50 p-8 text-center text-gray-500">No pending admin requests.</div>
                        ) : (
                            <div className="space-y-3">
                                {adminRequests.map((request) => (
                                    <div key={request.id} className="bg-gray-50 rounded-3xl p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div>
                                            <p className="font-black">{request.username}</p>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                            <p className="text-xs font-bold mt-1 bg-white border px-3 py-1 rounded-full inline-flex">{request.status}</p>
                                        </div>

                                        <div className="flex gap-2">
                                            <button onClick={() => approveAdminRequest(request.id)} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-2xl text-sm font-bold transition">
                                                <Check size={16} />
                                                Approve
                                            </button>

                                            <button onClick={() => rejectAdminRequest(request.id)} className="inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-2xl text-sm font-bold transition">
                                                <X size={16} />
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
                <section className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                            <Mail className="mb-4" size={24} />
                            <p className="text-gray-500 text-sm">Email</p>
                            <p className="font-black break-all">{email}</p>
                        </div>

                        <div className="rounded-[2rem] bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-6 shadow-sm">
                            <Shield className="mb-4 text-purple-600" size={24} />
                            <p className="text-gray-500 text-sm">Role</p>
                            <p className="font-black">{role.charAt(0) + role.slice(1).toLowerCase()}</p>
                        </div>

                        {role === "USER" && (
                            <>
                                <div className="rounded-[2rem] bg-gradient-to-br from-green-50 to-white border border-green-100 p-6 shadow-sm">
                                    <TrendingUp className="mb-4 text-green-600" size={24} />
                                    <p className="text-gray-500 text-sm">Completed this week</p>
                                    <h3 className="text-3xl font-black">{weeklyCompletedCount}</h3>
                                </div>

                                <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 shadow-sm">
                                    <Clock3 className="mb-4 text-blue-600" size={24} />
                                    <p className="text-gray-500 text-sm">Last visited</p>
                                    <p className="font-black">{lastVisitedCourse}</p>
                                </div>
                            </>
                        )}

                        {role === "INSTRUCTOR" && (
                            <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border border-blue-100 p-6 shadow-sm">
                                <BookOpen className="mb-4 text-blue-600" size={24} />
                                <p className="text-gray-500 text-sm">Created courses</p>
                                <h3 className="text-3xl font-black">{courseStats.length}</h3>
                            </div>
                        )}
                    </div>

                    {role === "USER" && (
                        <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-2xl font-black mb-5">Enrolled Courses</h3>

                            {courses.length === 0 ? (
                                <div className="rounded-3xl bg-gray-50 p-8 text-center text-gray-500">You are not enrolled in any courses yet.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {courses.map((course) => (
                                        <div key={course.id} className="group rounded-3xl bg-gray-50 hover:bg-gray-100 p-5 transition">
                                            <p className="font-black text-lg">{course.title}</p>
                                            <p className="text-sm text-gray-500 mt-1">{course.category}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {role === "INSTRUCTOR" && (
                        <div className="rounded-[2rem] bg-white border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-2xl font-black mb-5">Course Performance</h3>

                            {courseStats.length === 0 ? (
                                <div className="rounded-3xl bg-gray-50 p-8 text-center text-gray-500">No courses created yet.</div>
                            ) : (
                                <div className="space-y-3">
                                    {courseStats.map((course) => (
                                        <div key={course.id} className="bg-gray-50 hover:bg-gray-100 rounded-3xl p-5 flex justify-between items-center transition">
                                            <div>
                                                <p className="font-black">{course.title}</p>
                                                <p className="text-sm text-gray-500">{course.category}</p>
                                            </div>

                                            <span className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-2xl text-sm font-black">
                                                <Users size={16} />
                                                {course.enrolledCount} enrolled
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}
        </DashboardLayout>
    );
}

export default DetailsPage;