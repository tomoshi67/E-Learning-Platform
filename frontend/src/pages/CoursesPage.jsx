import { useEffect, useRef, useState } from "react";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import ReactMarkdown from "react-markdown";

const aiMarkdownComponents = {
    p: (props) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
    strong: (props) => <strong className="font-bold" {...props} />,
    em: (props) => <em className="italic" {...props} />,
    ul: (props) => <ul className="list-disc list-inside space-y-1 mb-2 ml-1" {...props} />,
    ol: (props) => <ol className="list-decimal list-inside space-y-1 mb-2 ml-1" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    code: (props) => <code className="bg-[#1A1F2B] px-1.5 py-0.5 rounded-md text-xs font-mono text-indigo-300" {...props} />,
    h1: (props) => <h3 className="font-black text-base mt-3 mb-1 text-gray-100" {...props} />,
    h2: (props) => <h3 className="font-black text-base mt-3 mb-1 text-gray-100" {...props} />,
    h3: (props) => <h4 className="font-bold text-sm mt-2 mb-1 text-gray-200" {...props} />,
};

import {
    BookOpen,
    Download,
    Eye,
    IndianRupee,
    Pencil,
    Plus,
    Star,
    Trash2,
    Upload,
    Users,
    Sparkles,
    Wand2,
    MessageCircleQuestion,
    Send,
} from "lucide-react";

function CoursesPage() {
    const dashboardRole = sessionStorage.getItem("role");
    const role = sessionStorage.getItem("role");

    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        category: "",
        price: "",
    });
    const [courses, setCourses] = useState([]);
    const [courseLectures, setCourseLectures] = useState({});
    const [lectureData, setLectureData] = useState({});
    const [reviewData, setReviewData] = useState({});
    const [courseReviews, setCourseReviews] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [enrollments, setEnrollments] = useState([]);
    const [userCoursePanel, setUserCoursePanel] = useState("all");
    const [progressList, setProgressList] = useState([]);
    const [activeCoursePanel, setActiveCoursePanel] = useState({});
    const [hasUnread, setHasUnread] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [selectedInstructorEmail, setSelectedInstructorEmail] = useState("");
    const [adminCourses, setAdminCourses] = useState([]);
    const [selectedAdminCourseId, setSelectedAdminCourseId] = useState("");
    const [adminSection, setAdminSection] = useState("");
    const [adminLectures, setAdminLectures] = useState([]);
    const [adminQuizzes, setAdminQuizzes] = useState([]);
    const [previewLectureId, setPreviewLectureId] = useState(null);
    const [lectureSummaries, setLectureSummaries] = useState({});
    const [summarizing, setSummarizing] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [doubtPanelCourseId, setDoubtPanelCourseId] = useState(null);
    const [doubtMessages, setDoubtMessages] = useState({});
    const [doubtInput, setDoubtInput] = useState({});
    const [doubtLoading, setDoubtLoading] = useState({});
    const doubtScrollRefs = useRef({});

    const authHeaders = () => ({
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const sortNewestFirst = (list) => {
        return [...list].sort((a, b) => b.id - a.id);
    };

    const getLectureAccept = (type) => {
        if (type === "VIDEO") return ".mp4,.mov,.mkv,.avi,.webm";
        if (type === "PDF") return ".pdf";
        if (type === "IMAGE") return ".jpg,.jpeg,.png,.gif,.webp";
        if (type === "NOTES") return ".txt,.doc,.docx,.ppt,.pptx,.pdf";
        return "";
    };

    const isValidLectureFile = (type, fileName) => {
        const lowerName = fileName.toLowerCase();

        if (type === "VIDEO") {
            return lowerName.endsWith(".mp4") || lowerName.endsWith(".mov") || lowerName.endsWith(".mkv") || lowerName.endsWith(".avi") || lowerName.endsWith(".webm");
        }

        if (type === "PDF") {
            return lowerName.endsWith(".pdf");
        }

        if (type === "IMAGE") {
            return lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg") || lowerName.endsWith(".png") || lowerName.endsWith(".gif") || lowerName.endsWith(".webp");
        }

        if (type === "NOTES") {
            return lowerName.endsWith(".txt") || lowerName.endsWith(".doc") || lowerName.endsWith(".docx") || lowerName.endsWith(".ppt") || lowerName.endsWith(".pptx") || lowerName.endsWith(".pdf");
        }

        return false;
    };

    const toggleCoursePanel = async (courseId, panelName) => {
        const isAlreadyOpen = activeCoursePanel[courseId] === panelName;

        if (isAlreadyOpen) {
            setActiveCoursePanel({
                ...activeCoursePanel,
                [courseId]: "",
            });
            return;
        }

        setActiveCoursePanel({
            ...activeCoursePanel,
            [courseId]: panelName,
        });

        if (panelName === "lectures") {
            await loadLectures(courseId);
        }

        if (panelName === "reviews") {
            await loadReviews(courseId);
        }
    };

    const toggleUserReviews = async (courseId) => {
        if (courseReviews[courseId]) {
            setCourseReviews({
                ...courseReviews,
                [courseId]: null,
            });
            return;
        }

        await loadReviews(courseId);
    };

    const toggleUserLectures = async (courseId) => {
        if (courseLectures[courseId]) {
            setCourseLectures({
                ...courseLectures,
                [courseId]: null,
            });
            return;
        }

        await loadLectures(courseId);
    };

    const toggleDoubtPanel = async (courseId) => {
        if (doubtPanelCourseId === courseId) {
            setDoubtPanelCourseId(null);
            return;
        }

        setDoubtPanelCourseId(courseId);

        if (!doubtMessages[courseId]) {
            await loadDoubtHistory(courseId);
        }
    };

    const loadDoubtHistory = async (courseId) => {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/doubts/course/` + courseId + "/user/" + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();

        setDoubtMessages({
            ...doubtMessages,
            [courseId]: data,
        });
    };

    const changeDoubtInput = (courseId, value) => {
        setDoubtInput({
            ...doubtInput,
            [courseId]: value,
        });
    };

    const askDoubt = async (courseId) => {
        const question = doubtInput[courseId];

        if (!question || !question.trim()) {
            return;
        }

        setDoubtInput({
            ...doubtInput,
            [courseId]: "",
        });

        const tempId = "temp-" + Date.now();
        const optimisticMessage = {
            id: tempId,
            sender: "STUDENT",
            message: question,
        };

        setDoubtMessages({
            ...doubtMessages,
            [courseId]: [...(doubtMessages[courseId] || []), optimisticMessage],
        });

        setDoubtLoading({ ...doubtLoading, [courseId]: true });

        try {
            const res = await fetch(`${API_URL}/doubts/ask`, {
                method: "POST",
                headers: authJsonHeaders(),
                body: JSON.stringify({
                    courseId: courseId,
                    userEmail: sessionStorage.getItem("email"),
                    question: question,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("Couldn't get an answer: " + errText);
                return;
            }

            const newMessages = await res.json();

            setDoubtMessages((prev) => ({
                ...prev,
                [courseId]: [
                    ...(prev[courseId] || []).filter((m) => m.id !== tempId),
                    ...newMessages,
                ],
            }));
        } catch (err) {
            alert("Couldn't get an answer: " + err.message);
        } finally {
            setDoubtLoading({ ...doubtLoading, [courseId]: false });
        }
    };

    const changeCourse = (e) => {
        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value,
        });
    };

    const addCourse = async () => {
        const courseBody = {
            ...courseData,
            instructorEmail: sessionStorage.getItem("email"),
        };

        const url = editingCourseId
            ? `${API_URL}/courses/update/` + editingCourseId
            : `${API_URL}/courses/add`;

        const method = editingCourseId ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: authJsonHeaders(),
            body: JSON.stringify(courseBody),
        });

        const savedCourse = await res.json();

        if (editingCourseId) {
            setCourses(
                courses.map((course) =>
                    course.id === editingCourseId ? savedCourse : course
                )
            );
            setEditingCourseId(null);
        } else {
            setCourses([savedCourse, ...courses]);
        }

        setCourseData({
            title: "",
            description: "",
            category: "",
            price: "",
        });
    };

    const loadInstructorCourses = async () => {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/courses/instructor/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();

        const coursesWithCounts = await Promise.all(
            data.map(async (course) => {
                try {
                    const enrollRes = await fetch(`${API_URL}/enrollments/course/` + course.id, {
                        headers: authHeaders(),
                    });

                    if (!enrollRes.ok) {
                        return course;
                    }

                    const courseEnrollments = await enrollRes.json();

                    return {
                        ...course,
                        enrolledCount: courseEnrollments.length,
                    };
                } catch {
                    return course;
                }
            })
        );

        setCourses(sortNewestFirst(coursesWithCounts));
    };

    const deleteCourse = async (id) => {
        await fetch(`${API_URL}/courses/delete/` + id, {
            method: "DELETE",
            headers: authHeaders(),
        });

        setCourses(courses.filter((course) => course.id !== id));
    };

    const changeLecture = (courseId, e) => {
        const updatedLecture = {
            ...lectureData[courseId],
            [e.target.name]: e.target.value,
        };

        if (e.target.name === "type") {
            updatedLecture.file = null;
        }

        setLectureData({
            ...lectureData,
            [courseId]: updatedLecture,
        });
    };

    const changeLectureFile = (courseId, e) => {
        const file = e.target.files[0];
        const selectedType = lectureData[courseId]?.type || "VIDEO";

        if (!file) {
            return;
        }

        if (!isValidLectureFile(selectedType, file.name)) {
            alert("Selected file does not match the lecture type: " + selectedType);
            e.target.value = "";
            return;
        }

        setLectureData({
            ...lectureData,
            [courseId]: {
                ...lectureData[courseId],
                file: file,
            },
        });
    };

    const uploadLecture = async (courseId) => {
        const lecture = lectureData[courseId];

        if (!lecture || !lecture.title || !lecture.file) {
            alert("Please fill lecture title and choose a file.");
            return;
        }

        const selectedType = lecture.type || "VIDEO";

        if (!isValidLectureFile(selectedType, lecture.file.name)) {
            alert("Selected file does not match the lecture type: " + selectedType);
            return;
        }

        const formData = new FormData();
        formData.append("title", lecture.title);
        formData.append("type", selectedType);
        formData.append("lectureOrder", lecture.lectureOrder);
        formData.append("file", lecture.file);

        await fetch(`${API_URL}/lectures/upload/` + courseId, {
            method: "POST",
            headers: authHeaders(),
            body: formData,
        });

        alert("Lecture uploaded successfully");
        await loadLectures(courseId);

        setLectureData({
            ...lectureData,
            [courseId]: {
                title: "",
                lectureOrder: "",
                type: "VIDEO",
                file: null,
            },
        });
    };

    const deleteLecture = async (lectureId, courseId) => {
        await fetch(`${API_URL}/lectures/delete/` + lectureId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadLectures(courseId);
    };

    const loadLectures = async (courseId) => {
        const res = await fetch(`${API_URL}/lectures/course/` + courseId, {
            headers: authHeaders(),
        });
        const data = await res.json();

        setCourseLectures({
            ...courseLectures,
            [courseId]: data,
        });
    };

    const updateLectureOrder = async (lectureId, courseId, newOrder) => {
        await fetch(
            `${API_URL}/lectures/update-order/` + lectureId + "?lectureOrder=" + newOrder,
            {
                method: "PUT",
                headers: authHeaders(),
            }
        );

        await loadLectures(courseId);
    };

    const changeReview = (courseId, e) => {
        setReviewData({
            ...reviewData,
            [courseId]: {
                ...reviewData[courseId],
                [e.target.name]: e.target.value,
            },
        });
    };

    const addReview = async (courseId) => {
        const review = reviewData[courseId];
        const rating = Number(review?.rating);

        if (!review?.rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            alert("Rating must be a whole number between 1 and 5");
            return;
        }

        const res = await fetch(`${API_URL}/reviews/add`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: sessionStorage.getItem("email"),
                courseId: courseId,
                rating: rating,
                comment: review?.comment,
            }),
        });

        if (!res.ok) {
            const errText = await res.text();
            alert("Couldn't add review: " + errText);
            return;
        }

        alert("Review added successfully");
        await loadReviews(courseId);

        setReviewData({
            ...reviewData,
            [courseId]: {
                rating: "",
                comment: "",
            },
        });
    };

    const loadReviews = async (courseId) => {
        const res = await fetch(`${API_URL}/reviews/course/` + courseId, {
            headers: authHeaders(),
        });
        const data = await res.json();

        setCourseReviews({
            ...courseReviews,
            [courseId]: data,
        });
    };

    const loadAllCourses = async () => {
        const res = await fetch(`${API_URL}/courses/all`, {
            headers: authHeaders(),
        });

        const data = await res.json();

        const coursesWithCounts = await Promise.all(
            data.map(async (course) => {
                try {
                    const enrollRes = await fetch(
                        `${API_URL}/enrollments/course/` + course.id,
                        {
                            headers: authHeaders(),
                        }
                    );

                    if (!enrollRes.ok) {
                        return {
                            ...course,
                            enrolledCount: 0,
                        };
                    }

                    const enrollments = await enrollRes.json();

                    return {
                        ...course,
                        enrolledCount: enrollments.length,
                    };
                } catch {
                    return {
                        ...course,
                        enrolledCount: 0,
                    };
                }
            })
        );

        setCourses(sortNewestFirst(coursesWithCounts));
    };

    const loadUserEnrollments = async () => {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/enrollments/user/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setEnrollments(data);
    };

    const enrollCourse = async (course) => {
        const res = await fetch(`${API_URL}/payments/create-checkout-session`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: sessionStorage.getItem("email"),
                courseId: course.id,
                amount: course.price,
            }),
        });

        console.log("PAYMENT STATUS:", res.status);

        const checkoutUrl = await res.text();
        console.log("PAYMENT RESPONSE:", checkoutUrl);

        if (checkoutUrl === "ALREADY_PAID") {
            alert("You already paid for this course.");
            await loadUserEnrollments();
            await loadRecommendations();
            return;
        }

        window.location.assign(checkoutUrl);
    };

    const loadRecommendations = async () => {
        const email = sessionStorage.getItem("email");

        setLoadingRecommendations(true);

        try {
            const res = await fetch(
                `${API_URL}/courses/recommendations/` + encodeURIComponent(email),
                {
                    headers: authHeaders(),
                }
            );

            if (!res.ok) {
                setRecommendations([]);
                return;
            }

            const data = await res.json();
            setRecommendations(data);
        } catch {
            setRecommendations([]);
        } finally {
            setLoadingRecommendations(false);
        }
    };

    const isEnrolled = (courseId) => {
        return enrollments.some((enrollment) => enrollment.courseId === courseId);
    };

    const getEnrolledCourses = () => {
        return courses.filter((course) => isEnrolled(course.id));
    };

    const categories = [
        "All",
        ...new Set(courses.map((course) => course.category).filter(Boolean)),
    ];

    const filteredCourses = courses.filter((course) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
            (course.title || "").toLowerCase().includes(search) ||
            (course.description || "").toLowerCase().includes(search) ||
            (course.category || "").toLowerCase().includes(search);

        const matchesCategory =
            selectedCategory === "All" || course.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const loadUserProgress = async () => {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/progress/user/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setProgressList(data);
    };

    const isLectureCompleted = (lectureId) => {
        return progressList.some(
            (progress) =>
                progress.lectureId === lectureId && progress.completed === true
        );
    };

    const updateProgress = async (lectureId, completed) => {
        await fetch(`${API_URL}/progress/update`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: sessionStorage.getItem("email"),
                lectureId: lectureId,
                completed: completed,
            }),
        });

        await loadUserProgress();
    };

    const getCourseProgress = (courseId) => {
        if (!courseLectures[courseId] || courseLectures[courseId].length === 0) {
            return 0;
        }

        const completedCount = courseLectures[courseId].filter((lecture) =>
            isLectureCompleted(lecture.id)
        ).length;

        return Math.round((completedCount / courseLectures[courseId].length) * 100);
    };

    const loadUnread = async () => {
        if (role !== "USER") return;

        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/notifications/has-unread/` +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasUnread(data);
    };

    const loadInstructors = async () => {
        const res = await fetch(`${API_URL}/admin/instructors`, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setInstructors(data);
    };

    const loadAdminCoursesByInstructor = async (email) => {
        setSelectedInstructorEmail(email);
        setSelectedAdminCourseId("");
        setAdminSection("");
        setAdminLectures([]);
        setAdminQuizzes([]);

        if (!email) {
            setAdminCourses([]);
            return;
        }

        const res = await fetch(
            `${API_URL}/admin/courses/instructor/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setAdminCourses(sortNewestFirst(data));
    };

    const loadAdminLectures = async (courseId) => {
        setSelectedAdminCourseId(courseId);
        setAdminSection("lectures");

        const res = await fetch(`${API_URL}/lectures/course/` + courseId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setAdminLectures(data);
    };

    const loadAdminQuizzes = async (courseId) => {
        setSelectedAdminCourseId(courseId);
        setAdminSection("quizzes");

        const res = await fetch(`${API_URL}/quizzes/course/` + courseId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setAdminQuizzes(data);
    };

    const adminDeleteCourse = async (courseId) => {
        await fetch(`${API_URL}/admin/courses/delete/` + courseId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadAdminCoursesByInstructor(selectedInstructorEmail);
    };

    const adminDeleteLecture = async (lectureId) => {
        await fetch(`${API_URL}/admin/lectures/delete/` + lectureId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadAdminLectures(selectedAdminCourseId);
    };

    const adminDeleteQuiz = async (quizId) => {
        await fetch(`${API_URL}/admin/quizzes/delete/` + quizId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadAdminQuizzes(selectedAdminCourseId);
    };

    const downloadResource = async (lecture) => {
        const response = await fetch(lecture.filePath);
        const blob = await response.blob();

        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = lecture.fileName;

        document.body.appendChild(a);
        a.click();
        a.remove();

        window.URL.revokeObjectURL(blobUrl);
    };

    const summarizeLecture = async (lecture) => {
        if (lectureSummaries[lecture.id]) {
            setLectureSummaries({
                ...lectureSummaries,
                [lecture.id]: null,
            });
            return;
        }

        setSummarizing({ ...summarizing, [lecture.id]: true });

        try {
            const res = await fetch(`${API_URL}/lectures/summarize/` + lecture.id, {
                headers: authHeaders(),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("Couldn't generate summary: " + errText);
                return;
            }

            const data = await res.json();
            setLectureSummaries({
                ...lectureSummaries,
                [lecture.id]: data.summary,
            });
        } catch (err) {
            alert("Couldn't generate summary: " + err.message);
        } finally {
            setSummarizing({ ...summarizing, [lecture.id]: false });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (dashboardRole === "INSTRUCTOR") {
                await loadInstructorCourses();
            }

            if (dashboardRole === "USER") {
                await loadAllCourses();
                await loadUserEnrollments();
                await loadUserProgress();
                await loadRecommendations();
            }
            if (dashboardRole === "ADMIN") {
                await loadInstructors();
            }
        };

        loadData();
    }, [dashboardRole]);

    useEffect(() => {
        const initializeUnread = async () => {
            await loadUnread();
        };

        initializeUnread();
    }, []);

    useEffect(() => {
        if (doubtPanelCourseId && doubtScrollRefs.current[doubtPanelCourseId]) {
            const el = doubtScrollRefs.current[doubtPanelCourseId];
            el.scrollTop = el.scrollHeight;
        }
    }, [doubtMessages, doubtPanelCourseId, doubtLoading]);

    return (
        <DashboardLayout activePage="Courses" hasUnread={hasUnread}>
            {dashboardRole === "INSTRUCTOR" ? (
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Create / Edit Course Card */}
                    <div className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6 h-fit">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <Plus size={22} />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">
                                    {editingCourseId ? "Edit" : "Create"}
                                </p>
                                <h3 className="text-xl font-black text-gray-100">
                                    {editingCourseId ? "Update Course" : "Add Course"}
                                </h3>
                            </div>
                        </div>

                        <input
                            name="title"
                            placeholder="Course Title"
                            value={courseData.title}
                            onChange={changeCourse}
                            className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                        />

                        <input
                            name="description"
                            placeholder="Course Description"
                            value={courseData.description}
                            onChange={changeCourse}
                            className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                        />

                        <input
                            name="category"
                            placeholder="Category"
                            value={courseData.category}
                            onChange={changeCourse}
                            className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                        />

                        <input
                            name="price"
                            type="number"
                            min="1"
                            placeholder="Course Price"
                            value={courseData.price}
                            onChange={changeCourse}
                            className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-4 rounded-2xl outline-none focus:border-indigo-500 transition"
                        />

                        <button
                            onClick={addCourse}
                            className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white py-3 rounded-2xl font-black transition"
                        >
                            <Plus size={18} />
                            {editingCourseId ? "Update Course" : "Add Course"}
                        </button>
                    </div>

                    {/* My Courses List */}
                    <div className="xl:col-span-2 rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Instructor content</p>
                                <h3 className="text-2xl font-black text-gray-100">My Courses</h3>
                            </div>
                            <p className="text-sm text-gray-500">{courses.length} course(s)</p>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="bg-[#141822] border border-[#232838] rounded-3xl p-5 hover:bg-[#1A1F2B] transition"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div>
                                            <h4 className="text-xl font-black text-gray-100">{course.title}</h4>
                                            <p className="text-gray-400 mt-1">{course.description}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <p className="text-sm text-gray-400 bg-[#1A1F2B] border border-[#232838] px-3 py-1 rounded-full">
                                                    {course.category}
                                                </p>
                                                <p className="text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                                                    <Users size={15} />
                                                    {course.enrolledCount || 0} enrolled
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <button
                                                onClick={() => {
                                                    setEditingCourseId(course.id);
                                                    setCourseData({
                                                        title: course.title,
                                                        description: course.description,
                                                        category: course.category,
                                                        price: course.price,
                                                    });
                                                }}
                                                className="w-10 h-10 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500 hover:text-black rounded-full text-sm flex items-center justify-center transition"
                                                title="Edit course"
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                onClick={() => deleteCourse(course.id)}
                                                className="w-10 h-10 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full text-sm flex items-center justify-center transition"
                                                title="Delete course"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4 border-t border-[#232838] pt-4">
                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "upload")}
                                            className="bg-violet-500/10 text-violet-300 hover:bg-violet-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition border border-violet-500/20"
                                        >
                                            <Upload size={16} /> Upload Lecture
                                        </button>

                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "lectures")}
                                            className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition border border-emerald-500/20"
                                        >
                                            <BookOpen size={16} />
                                            {activeCoursePanel[course.id] === "lectures" ? "Hide Lectures" : "Lectures"}
                                        </button>

                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "reviews")}
                                            className="bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-full text-sm flex items-center gap-2 transition border border-yellow-500/20"
                                        >
                                            <Star size={16} />
                                            {activeCoursePanel[course.id] === "reviews" ? "Hide Reviews" : "Reviews"}
                                        </button>
                                    </div>

                                    {activeCoursePanel[course.id] === "upload" && (
                                        <div className="mt-4 bg-[#0F131C] border border-[#232838] rounded-3xl p-4">
                                            <h5 className="font-black text-gray-100 mb-3">Upload Lecture / Resource</h5>

                                            <input
                                                name="title"
                                                placeholder="Lecture Title"
                                                value={lectureData[course.id]?.title || ""}
                                                onChange={(e) => changeLecture(course.id, e)}
                                                className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    name="lectureOrder"
                                                    type="number"
                                                    min="1"
                                                    placeholder="Lecture Order"
                                                    value={lectureData[course.id]?.lectureOrder || ""}
                                                    onChange={(e) => changeLecture(course.id, e)}
                                                    className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                                />

                                                <select
                                                    name="type"
                                                    value={lectureData[course.id]?.type || "VIDEO"}
                                                    onChange={(e) => changeLecture(course.id, e)}
                                                    className="w-full bg-[#141822] border border-[#232838] text-gray-100 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                                >
                                                    <option value="VIDEO">VIDEO</option>
                                                    <option value="PDF">PDF</option>
                                                    <option value="NOTES">NOTES</option>
                                                    <option value="IMAGE">IMAGE</option>
                                                </select>
                                            </div>

                                            <input
                                                type="file"
                                                accept={getLectureAccept(lectureData[course.id]?.type || "VIDEO")}
                                                onChange={(e) => changeLectureFile(course.id, e)}
                                                className="w-full bg-[#141822] border border-[#232838] text-gray-300 px-4 py-3 mt-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                            />

                                            <button
                                                onClick={() => uploadLecture(course.id)}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-5 py-3 rounded-2xl font-black transition"
                                            >
                                                <Upload size={18} /> Upload
                                            </button>
                                        </div>
                                    )}

                                    {activeCoursePanel[course.id] === "lectures" && (
                                        <div className="mt-4 bg-[#0F131C] border border-[#232838] rounded-3xl p-4">
                                            <h5 className="font-black text-gray-100 mb-3">Lectures</h5>

                                            {courseLectures[course.id]?.map((lecture) => (
                                                <div
                                                    key={lecture.id}
                                                    className="bg-[#141822] border border-[#232838] rounded-2xl p-4 mb-3"
                                                >
                                                    <p className="font-semibold text-gray-100">
                                                        {lecture.lectureOrder}. {lecture.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mb-3">{lecture.type}</p>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            defaultValue={lecture.lectureOrder}
                                                            className="bg-[#1A1F2B] border border-[#232838] text-gray-100 px-3 py-2 rounded-xl w-24 outline-none focus:border-indigo-500"
                                                            id={"order-" + lecture.id}
                                                        />

                                                        <button
                                                            onClick={async () => {
                                                                const newOrder = document.getElementById("order-" + lecture.id).value;
                                                                await updateLectureOrder(lecture.id, course.id, newOrder);
                                                            }}
                                                            className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-xl text-sm font-bold"
                                                        >
                                                            Save Order
                                                        </button>

                                                        <button
                                                            onClick={() => deleteLecture(lecture.id, course.id)}
                                                            className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
                                                        >
                                                            <Trash2 size={15} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeCoursePanel[course.id] === "reviews" && (
                                        <div className="mt-4 bg-[#0F131C] border border-[#232838] rounded-3xl p-4">
                                            <h5 className="font-black text-gray-100 mb-3">Reviews</h5>

                                            {courseReviews[course.id]?.length > 0 ? (
                                                courseReviews[course.id].map((review) => (
                                                    <div
                                                        key={review.id}
                                                        className="bg-[#141822] border border-[#232838] rounded-2xl p-4 mb-3"
                                                    >
                                                        <p className="font-semibold text-gray-100">Rating: {review.rating}/5</p>
                                                        <p className="text-gray-300">{review.comment}</p>
                                                        <p className="text-sm text-gray-500 mt-1">By: {review.userEmail}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">No reviews loaded yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ) : dashboardRole === "USER" ? (
                <section className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">User learning area</p>
                            <h3 className="text-2xl font-black text-gray-100">Courses</h3>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setUserCoursePanel("all")}
                                className={
                                    userCoursePanel === "all"
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-indigo-500/25"
                                        : "bg-[#141822] border border-[#232838] text-gray-300 px-4 py-2 rounded-full hover:bg-[#1A1F2B] transition"
                                }
                            >
                                All Courses
                            </button>

                            <button
                                onClick={() => setUserCoursePanel("enrolled")}
                                className={
                                    userCoursePanel === "enrolled"
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-indigo-500/25"
                                        : "bg-[#141822] border border-[#232838] text-gray-300 px-4 py-2 rounded-full hover:bg-[#1A1F2B] transition"
                                }
                            >
                                My Courses
                            </button>
                        </div>
                    </div>

                    {userCoursePanel === "all" && (
                        <div>
                            {(loadingRecommendations || recommendations.length > 0) && (
                                <div className="mb-6 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-3xl p-5 border border-indigo-500/20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Wand2 size={20} className="text-indigo-400" />
                                        <h4 className="font-black text-gray-100">Recommended for You</h4>
                                    </div>

                                    {loadingRecommendations ? (
                                        <p className="text-sm text-gray-500">Finding courses that fit your interests...</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {recommendations.map((rec) => (
                                                <div
                                                    key={rec.course.id}
                                                    className="bg-[#141822] border border-[#232838] rounded-2xl p-4"
                                                >
                                                    <p className="font-bold text-gray-100">{rec.course.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1 mb-2">{rec.course.category}</p>
                                                    <p className="text-sm text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2 mb-3">
                                                        {rec.reason}
                                                    </p>

                                                    <button
                                                        onClick={() => enrollCourse(rec.course)}
                                                        className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-4 py-2 rounded-full text-sm font-bold transition"
                                                    >
                                                        <Users size={15} />
                                                        Enroll Now - ₹{rec.course.price || 0}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <input
                                    placeholder="Search courses"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                />

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-[#141822] border border-[#232838] text-gray-100 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-sm text-gray-500 mb-4">
                                Showing {filteredCourses.length} course(s)
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                                {filteredCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        className="bg-[#141822] border border-[#232838] rounded-3xl p-5 hover:bg-[#1A1F2B] transition"
                                    >
                                        <h4 className="text-xl font-black text-gray-100">{course.title}</h4>
                                        <p className="text-gray-400 mt-1">{course.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <p className="text-sm text-gray-400 bg-[#1A1F2B] border border-[#232838] px-3 py-1 rounded-full">
                                                {course.category}
                                            </p>
                                            <p className="text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Users size={15} />
                                                {course.enrolledCount || 0} enrolled
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <p className="text-lg font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                                                <IndianRupee size={17} />
                                                {course.price || 0}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => enrollCourse(course)}
                                            disabled={isEnrolled(course.id)}
                                            className={
                                                isEnrolled(course.id)
                                                    ? "mt-4 bg-[#1A1F2B] text-gray-500 border border-[#232838] px-4 py-2 rounded-full flex items-center gap-2 cursor-not-allowed"
                                                    : "mt-4 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition"
                                            }
                                        >
                                            <Users size={17} />
                                            {isEnrolled(course.id) ? "Enrolled" : `Enroll Now - ₹${course.price || 0}`}
                                        </button>

                                        <div className="mt-4 border-t border-[#232838] pt-4">
                                            <h5 className="font-black text-gray-100 mb-3 flex items-center gap-2">
                                                <Star size={18} /> Add Review
                                            </h5>

                                            <input
                                                name="rating"
                                                type="number"
                                                min="1"
                                                max="5"
                                                placeholder="Rating 1-5"
                                                value={reviewData[course.id]?.rating || ""}
                                                onChange={(e) => changeReview(course.id, e)}
                                                className="w-full bg-[#0F131C] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                            />

                                            <input
                                                name="comment"
                                                placeholder="Write review"
                                                value={reviewData[course.id]?.comment || ""}
                                                onChange={(e) => changeReview(course.id, e)}
                                                className="w-full bg-[#0F131C] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                            />

                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => addReview(course.id)}
                                                    className="bg-emerald-500/10 text-emerald-300 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition border border-emerald-500/20"
                                                >
                                                    <Star size={15} /> Submit Review
                                                </button>

                                                <button
                                                    onClick={() => toggleUserReviews(course.id)}
                                                    className="bg-[#1A1F2B] text-gray-300 hover:bg-[#232838] hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition border border-[#232838]"
                                                >
                                                    <Eye size={15} />
                                                    {courseReviews[course.id] ? "Hide Reviews" : "Show Reviews"}
                                                </button>
                                            </div>

                                            {courseReviews[course.id]?.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="bg-[#0F131C] border border-[#232838] rounded-2xl p-4 mt-3"
                                                >
                                                    <p className="font-semibold text-gray-100">Rating: {review.rating}/5</p>
                                                    <p className="text-gray-300">{review.comment}</p>
                                                    <p className="text-sm text-gray-500">By: {review.userEmail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {userCoursePanel === "enrolled" && (
                        <div>
                            {getEnrolledCourses().length === 0 ? (
                                <p className="text-gray-400">You have not enrolled in any courses yet.</p>
                            ) : (
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {getEnrolledCourses().map((course) => (
                                        <div
                                            key={course.id}
                                            className="bg-[#141822] border border-[#232838] rounded-3xl p-5 hover:bg-[#1A1F2B] transition"
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                <div>
                                                    <h4 className="text-xl font-black text-gray-100">{course.title}</h4>
                                                    <p className="text-gray-400 mt-1">{course.description}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        <p className="text-sm text-gray-400 bg-[#1A1F2B] border border-[#232838] px-3 py-1 rounded-full">
                                                            {course.category}
                                                        </p>
                                                        <p className="text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                                                            <Users size={15} />
                                                            {course.enrolledCount || 0} enrolled
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-indigo-300 font-semibold bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full h-fit">
                                                    Progress: {getCourseProgress(course.id)}%
                                                </p>
                                            </div>

                                            <div className="mt-4 flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => {
                                                        sessionStorage.setItem("lastVisitedCourse", course.title);
                                                        toggleUserLectures(course.id);
                                                    }}
                                                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-4 py-2 rounded-full flex items-center gap-2 transition"
                                                >
                                                    <BookOpen size={17} />
                                                    {courseLectures[course.id] ? "Hide Lectures" : "Watch Lectures"}
                                                </button>

                                                <button
                                                    onClick={() => toggleDoubtPanel(course.id)}
                                                    className={
                                                        doubtPanelCourseId === course.id
                                                            ? "bg-indigo-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-700 transition"
                                                            : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition"
                                                    }
                                                >
                                                    <MessageCircleQuestion size={17} />
                                                    {doubtPanelCourseId === course.id ? "Close Doubt Chat" : "Ask a Doubt"}
                                                </button>
                                            </div>

                                            {doubtPanelCourseId === course.id && (
                                                <div className="mt-4 bg-[#0F131C] border border-[#232838] rounded-3xl p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <MessageCircleQuestion size={18} className="text-indigo-400" />
                                                        <p className="font-bold text-sm text-gray-100">
                                                            Ask a question about {course.title}
                                                        </p>
                                                    </div>

                                                    <div
                                                        ref={(el) => (doubtScrollRefs.current[course.id] = el)}
                                                        className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-3"
                                                    >
                                                        {(!doubtMessages[course.id] || doubtMessages[course.id].length === 0) ? (
                                                            <p className="text-sm text-gray-500 text-center py-4">
                                                                No questions asked yet. Ask anything about this course!
                                                            </p>
                                                        ) : (
                                                            doubtMessages[course.id].map((msg) => (
                                                                <div
                                                                    key={msg.id}
                                                                    className={
                                                                        msg.sender === "STUDENT"
                                                                            ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-2xl p-3 ml-auto max-w-[85%] text-sm"
                                                                            : "bg-[#141822] border border-indigo-500/20 rounded-2xl p-3 max-w-[85%] text-sm"
                                                                    }
                                                                >
                                                                    {msg.sender !== "STUDENT" && (
                                                                        <p className="text-xs font-bold text-indigo-400 mb-1">AI Tutor</p>
                                                                    )}
                                                                    {msg.sender === "STUDENT" ? (
                                                                        <p className="whitespace-pre-wrap">{msg.message}</p>
                                                                    ) : (
                                                                        <ReactMarkdown components={aiMarkdownComponents}>
                                                                            {msg.message}
                                                                        </ReactMarkdown>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}

                                                        {doubtLoading[course.id] && (
                                                            <div className="bg-[#141822] border border-indigo-500/20 rounded-2xl p-3 max-w-[85%] text-sm">
                                                                <p className="text-xs font-bold text-indigo-400 mb-1">AI Tutor</p>
                                                                <p className="text-gray-500">Thinking...</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <input
                                                            value={doubtInput[course.id] || ""}
                                                            onChange={(e) => changeDoubtInput(course.id, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    askDoubt(course.id);
                                                                }
                                                            }}
                                                            placeholder="Type your question..."
                                                            className="flex-1 bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 px-4 py-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition"
                                                        />

                                                        <button
                                                            onClick={() => askDoubt(course.id)}
                                                            disabled={doubtLoading[course.id]}
                                                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                                                        >
                                                            <Send size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-4 space-y-3">
                                                {courseLectures[course.id]?.map((lecture) => (
                                                    <div
                                                        key={lecture.id}
                                                        className="bg-[#0F131C] border border-[#232838] rounded-3xl p-4"
                                                    >
                                                        <p className="font-semibold text-gray-100">
                                                            {lecture.lectureOrder}. {lecture.title}
                                                        </p>

                                                        <p className="text-sm text-gray-500 mb-3">{lecture.type}</p>

                                                        <div className="flex gap-3 flex-wrap mb-3">
                                                            <button
                                                                onClick={() =>
                                                                    setPreviewLectureId(
                                                                        previewLectureId === lecture.id ? null : lecture.id
                                                                    )
                                                                }
                                                                className={
                                                                    previewLectureId === lecture.id
                                                                        ? "inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm transition"
                                                                        : "inline-flex items-center gap-2 bg-[#141822] border border-[#232838] text-gray-200 hover:bg-[#1A1F2B] transition px-4 py-2 rounded-2xl text-sm font-semibold"
                                                                }
                                                            >
                                                                <Eye size={16} />
                                                                {previewLectureId === lecture.id ? "Close Preview" : "Preview"}
                                                            </button>

                                                            <button
                                                                onClick={() => downloadResource(lecture)}
                                                                className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition px-4 py-2 rounded-2xl text-sm font-semibold"
                                                            >
                                                                <Download size={16} />
                                                                Download
                                                            </button>

                                                            {(lecture.type === "PDF" || lecture.type === "NOTES") && (
                                                                <button
                                                                    onClick={() => summarizeLecture(lecture)}
                                                                    disabled={summarizing[lecture.id]}
                                                                    className={
                                                                        lectureSummaries[lecture.id]
                                                                            ? "inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
                                                                            : "inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition px-4 py-2 rounded-2xl text-sm font-semibold disabled:opacity-50"
                                                                    }
                                                                >
                                                                    <Sparkles size={16} />
                                                                    {summarizing[lecture.id]
                                                                        ? "Summarizing..."
                                                                        : lectureSummaries[lecture.id]
                                                                            ? "Hide Summary"
                                                                            : "AI Summary"}
                                                                </button>
                                                            )}
                                                        </div>

                                                        {lectureSummaries[lecture.id] && (
                                                            <div className="mb-3 bg-[#141822] border border-indigo-500/20 rounded-3xl p-4">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Sparkles size={16} className="text-indigo-400" />
                                                                    <p className="font-bold text-sm text-indigo-300">AI Revision Summary</p>
                                                                </div>
                                                                <div className="text-sm text-gray-300">
                                                                    <ReactMarkdown components={aiMarkdownComponents}>
                                                                        {lectureSummaries[lecture.id]}
                                                                    </ReactMarkdown>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {previewLectureId === lecture.id && (
                                                            <div className="mt-4 bg-[#141822] border border-[#232838] rounded-3xl p-4 relative">
                                                                <div className="flex items-center justify-between mb-3 pr-10">
                                                                    <div>
                                                                        <p className="font-bold text-gray-100">{lecture.title}</p>
                                                                        <p className="text-xs text-gray-500">{lecture.type} resource preview</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setPreviewLectureId(null)}
                                                                    className="absolute top-4 right-4 bg-[#1A1F2B] hover:bg-[#232838] text-gray-300 w-8 h-8 rounded-full text-sm transition"
                                                                    title="Close preview"
                                                                >
                                                                    ×
                                                                </button>

                                                                {lecture.type === "IMAGE" && (
                                                                    <img
                                                                        src={lecture.filePath}
                                                                        alt={lecture.title}
                                                                        className="mt-2 max-w-full rounded-2xl border border-[#232838]"
                                                                    />
                                                                )}

                                                                {lecture.type === "VIDEO" && (
                                                                    <video
                                                                        controls
                                                                        className="mt-2 w-full max-w-3xl rounded-2xl border border-[#232838] bg-black"
                                                                        src={lecture.filePath}
                                                                    />
                                                                )}

                                                                {lecture.type === "PDF" && (
                                                                    <iframe
                                                                        src={lecture.filePath}
                                                                        width="100%"
                                                                        height="500"
                                                                        className="mt-2 rounded-2xl border border-[#232838]"
                                                                    />
                                                                )}

                                                                {lecture.type === "NOTES" && (
                                                                    <iframe
                                                                        src={lecture.filePath}
                                                                        width="100%"
                                                                        height="400"
                                                                        className="mt-2 rounded-2xl border border-[#232838]"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <label className="block mt-3 text-sm text-gray-300">
                                                            <input
                                                                type="checkbox"
                                                                checked={isLectureCompleted(lecture.id)}
                                                                onChange={(e) =>
                                                                    updateProgress(lecture.id, e.target.checked)
                                                                }
                                                                className="mr-2"
                                                            />
                                                            Mark as completed
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            ) : (
                /* ADMIN SECTION */
                <section className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Admin control area</p>
                            <h3 className="text-3xl font-black text-gray-100">Course Management</h3>
                            <p className="text-gray-400 mt-1">
                                Choose an instructor, select a course, then manage lectures or quizzes.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-3xl bg-indigo-500/10 border border-indigo-500/20 px-5 py-4">
                                <p className="text-xs text-indigo-400 font-bold">INSTRUCTORS</p>
                                <p className="text-2xl font-black text-gray-100">{instructors.length}</p>
                            </div>
                            <div className="rounded-3xl bg-violet-500/10 border border-violet-500/20 px-5 py-4">
                                <p className="text-xs text-violet-400 font-bold">COURSES</p>
                                <p className="text-2xl font-black text-gray-100">{adminCourses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div className="xl:col-span-1 space-y-5">
                            <div className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-100">1. Choose Instructor</h4>
                                        <p className="text-xs text-gray-500">Filter courses by instructor</p>
                                    </div>
                                </div>

                                <select
                                    value={selectedInstructorEmail}
                                    onChange={(e) => loadAdminCoursesByInstructor(e.target.value)}
                                    className="w-full bg-[#0F131C] border border-[#232838] text-gray-100 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                                >
                                    <option value="">Select instructor</option>

                                    {instructors.map((instructor) => (
                                        <option key={instructor.id} value={instructor.email}>
                                            {instructor.username} - {instructor.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedAdminCourseId && (
                                <div className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-100">3. Manage Content</h4>
                                            <p className="text-xs text-gray-500">Select what you want to review</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => loadAdminLectures(selectedAdminCourseId)}
                                            className={
                                                adminSection === "lectures"
                                                    ? "inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-500/25 transition"
                                                    : "inline-flex items-center gap-2 bg-[#1A1F2B] border border-[#232838] text-gray-300 hover:bg-[#232838] px-5 py-3 rounded-2xl font-semibold transition"
                                            }
                                        >
                                            <BookOpen size={17} />
                                            Lectures
                                        </button>

                                        <button
                                            onClick={() => loadAdminQuizzes(selectedAdminCourseId)}
                                            className={
                                                adminSection === "quizzes"
                                                    ? "inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-500/25 transition"
                                                    : "inline-flex items-center gap-2 bg-[#1A1F2B] border border-[#232838] text-gray-300 hover:bg-[#232838] px-5 py-3 rounded-2xl font-semibold transition"
                                            }
                                        >
                                            <Star size={17} />
                                            Quizzes
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="xl:col-span-2 space-y-5">
                            <div className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="font-black text-xl text-gray-100">2. Choose Course</h4>
                                        <p className="text-sm text-gray-500">
                                            {selectedInstructorEmail ? selectedInstructorEmail : "Select an instructor first"}
                                        </p>
                                    </div>
                                    {selectedInstructorEmail && (
                                        <span className="bg-[#1A1F2B] border border-[#232838] text-gray-300 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminCourses.length} course(s)
                                        </span>
                                    )}
                                </div>

                                {!selectedInstructorEmail ? (
                                    <div className="rounded-3xl border border-dashed border-[#232838] bg-[#0F131C] p-8 text-center text-gray-500">
                                        Pick an instructor to view their courses.
                                    </div>
                                ) : adminCourses.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-[#232838] bg-[#0F131C] p-8 text-center text-gray-500">
                                        No courses by this instructor.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[52vh] overflow-y-auto pr-2">
                                        {adminCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className={
                                                    selectedAdminCourseId === course.id
                                                        ? "rounded-3xl p-5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/25 border border-transparent transition"
                                                        : "rounded-3xl p-5 bg-[#0F131C] border border-[#232838] hover:bg-[#1A1F2B] transition"
                                                }
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-lg font-black truncate">{course.title}</p>
                                                        <p
                                                            className={
                                                                selectedAdminCourseId === course.id
                                                                    ? "text-sm text-indigo-100 mt-1 line-clamp-2"
                                                                    : "text-sm text-gray-400 mt-1 line-clamp-2"
                                                            }
                                                        >
                                                            {course.description || "No description"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteCourse(course.id)}
                                                        className="shrink-0 w-10 h-10 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
                                                        title="Delete course"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                                    <span
                                                        className={
                                                            selectedAdminCourseId === course.id
                                                                ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold"
                                                                : "bg-[#1A1F2B] text-gray-400 px-3 py-1 rounded-full text-xs font-bold border border-[#232838]"
                                                        }
                                                    >
                                                        {course.category || "No category"}
                                                    </span>
                                                    <span
                                                        className={
                                                            selectedAdminCourseId === course.id
                                                                ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                                                                : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                                                        }
                                                    >
                                                        <IndianRupee size={13} />
                                                        {course.price || 0}
                                                    </span>
                                                    <span
                                                        className={
                                                            selectedAdminCourseId === course.id
                                                                ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                                                                : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"
                                                        }
                                                    >
                                                        <Users size={13} />
                                                        {course.enrolledCount || 0}
                                                    </span>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedAdminCourseId(course.id);

                                                        if (adminSection === "lectures") {
                                                            loadAdminLectures(course.id);
                                                        }

                                                        if (adminSection === "quizzes") {
                                                            loadAdminQuizzes(course.id);
                                                        }
                                                    }}
                                                    className={
                                                        selectedAdminCourseId === course.id
                                                            ? "mt-5 w-full bg-white text-black px-4 py-3 rounded-2xl font-bold hover:bg-gray-100 transition"
                                                            : "mt-5 w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-4 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition"
                                                    }
                                                >
                                                    {selectedAdminCourseId === course.id ? "Selected" : "Select Course"}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {adminSection === "lectures" && (
                                <div className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-xl text-gray-100">Manage Lectures</h4>
                                            <p className="text-sm text-gray-500">Remove invalid or unwanted lecture resources.</p>
                                        </div>
                                        <span className="bg-violet-500/10 text-violet-300 border border-violet-500/20 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminLectures.length} lecture(s)
                                        </span>
                                    </div>

                                    {adminLectures.length === 0 ? (
                                        <p className="text-gray-500 bg-[#0F131C] border border-[#232838] rounded-3xl p-6 text-center">
                                            No lectures found.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {adminLectures.map((lecture) => (
                                                <div
                                                    key={lecture.id}
                                                    className="bg-[#0F131C] border border-[#232838] rounded-3xl p-4 flex justify-between items-center hover:bg-[#1A1F2B] transition"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-violet-500/10 text-violet-300 flex items-center justify-center font-black border border-violet-500/20">
                                                            {lecture.lectureOrder || "-"}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-100">{lecture.title}</p>
                                                            <p className="text-sm text-gray-500">{lecture.type}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteLecture(lecture.id)}
                                                        className="w-10 h-10 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
                                                        title="Delete lecture"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {adminSection === "quizzes" && (
                                <div className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-xl text-gray-100">Manage Quizzes</h4>
                                            <p className="text-sm text-gray-500">Delete quizzes linked to the selected course.</p>
                                        </div>
                                        <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminQuizzes.length} quiz(zes)
                                        </span>
                                    </div>

                                    {adminQuizzes.length === 0 ? (
                                        <p className="text-gray-500 bg-[#0F131C] border border-[#232838] rounded-3xl p-6 text-center">
                                            No quizzes found.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {adminQuizzes.map((quiz) => (
                                                <div
                                                    key={quiz.id}
                                                    className="bg-[#0F131C] border border-[#232838] rounded-3xl p-4 flex justify-between items-center hover:bg-[#1A1F2B] transition"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-300 flex items-center justify-center border border-indigo-500/20">
                                                            <Star size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-100">{quiz.title}</p>
                                                            <p className="text-sm text-gray-500">Quiz ID: {quiz.id}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteQuiz(quiz.id)}
                                                        className="w-10 h-10 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
                                                        title="Delete quiz"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </DashboardLayout>
    );
}

export default CoursesPage;