import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
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
} from "lucide-react";

function CoursesPage() {
    const navigate = useNavigate();
    const dashboardRole = localStorage.getItem("role");
    const role = localStorage.getItem("role");

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

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
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

    const changeCourse = (e) => {
        setCourseData({
            ...courseData,
            [e.target.name]: e.target.value,
        });
    };

    const addCourse = async () => {
        const courseBody = {
            ...courseData,
            instructorEmail: localStorage.getItem("email"),
        };

        const url = editingCourseId
            ? `${API_URL}/courses/update/`+ editingCourseId
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
        const email = localStorage.getItem("email");

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

        await fetch(`${API_URL}/reviews/add`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: localStorage.getItem("email"),
                courseId: courseId,
                rating: review?.rating,
                comment: review?.comment,
            }),
        });

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
        const email = localStorage.getItem("email");

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
                userEmail: localStorage.getItem("email"),
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
            return;
        }

        window.location.assign(checkoutUrl);
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
        const email = localStorage.getItem("email");

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
                userEmail: localStorage.getItem("email"),
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

        const email = localStorage.getItem("email");

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
        const url = `${API_URL}/uploads/` + lecture.fileName;

        const res = await fetch(url);
        const blob = await res.blob();

        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = lecture.fileName;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(blobUrl);
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
    return (
        <DashboardLayout activePage="Courses" hasUnread={hasUnread}>
            {dashboardRole === "INSTRUCTOR" ? (
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-[2rem] p-6 h-fit border border-white shadow-sm hover:shadow-md transition">
                        <p className="text-gray-500 mb-2">
                            {editingCourseId ? "Edit course" : "Create course"}
                        </p>

                        <h3 className="text-2xl font-bold mb-5 flex items-center gap-2">
                            <Plus size={24} />
                            {editingCourseId ? "Update Course" : "Add Course"}
                        </h3>

                        <input
                            name="title"
                            placeholder="Course Title"
                            value={courseData.title}
                            onChange={changeCourse}
                            className="w-full bg-white border border-gray-200 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-black"
                        />

                        <input
                            name="description"
                            placeholder="Course Description"
                            value={courseData.description}
                            onChange={changeCourse}
                            className="w-full bg-white border border-gray-200 px-4 py-3 mb-3 rounded-2xl outline-none focus:border-black"
                        />

                        <input
                            name="category"
                            placeholder="Category"
                            value={courseData.category}
                            onChange={changeCourse}
                            className="w-full bg-white border border-gray-200 px-4 py-3 mb-4 rounded-2xl outline-none focus:border-black"
                        />
                        <input
                            name="price"
                            type="number"
                            min="1"
                            placeholder="Course Price"
                            value={courseData.price}
                            onChange={changeCourse}
                            className="w-full bg-white border border-gray-200 px-4 py-3 mb-4 rounded-2xl outline-none focus:border-black"
                        />

                        <button
                            onClick={addCourse}
                            className="w-full bg-black text-white px-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 hover:shadow-lg transition"
                        >
                            <Plus size={18} />
                            {editingCourseId ? "Update Course" : "Add Course"}
                        </button>
                    </div>

                    <div className="xl:col-span-2 bg-gradient-to-br from-white to-purple-50 rounded-[2rem] p-6 border border-white shadow-sm">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <p className="text-gray-500 text-sm">Instructor content</p>
                                <h3 className="text-2xl font-bold">My Courses</h3>
                            </div>
                            <p className="text-sm text-gray-500">{courses.length} course(s)</p>
                        </div>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {courses.map((course) => (
                                <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        <div>
                                            <h4 className="text-xl font-bold">{course.title}</h4>
                                            <p className="text-gray-600 mt-1">{course.description}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-3">
                                                <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{course.category}</p>
                                                <p className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
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
                                                className="w-10 h-10 bg-yellow-100 text-yellow-700 hover:bg-yellow-400 hover:text-black rounded-full text-sm flex items-center justify-center transition"
                                                title="Edit course"
                                            >
                                                <Pencil size={17} />
                                            </button>

                                            <button
                                                onClick={() => deleteCourse(course.id)}
                                                className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full text-sm flex items-center justify-center transition"
                                                title="Delete course"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "upload")}
                                            className="bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                                        >
                                            <Upload size={16} /> Upload Lecture
                                        </button>

                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "lectures")}
                                            className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                                        >
                                            <BookOpen size={16} />
                                            {activeCoursePanel[course.id] === "lectures" ? "Hide Lectures" : "Lectures"}
                                        </button>

                                        <button
                                            onClick={() => toggleCoursePanel(course.id, "reviews")}
                                            className="bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-black px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                                        >
                                            <Star size={16} />
                                            {activeCoursePanel[course.id] === "reviews" ? "Hide Reviews" : "Reviews"}
                                        </button>
                                    </div>

                                    {activeCoursePanel[course.id] === "upload" && (
                                        <div className="mt-4 bg-[#f7f7f7] rounded-3xl p-4">
                                            <h5 className="font-bold mb-3">Upload Lecture / Resource</h5>

                                            <input
                                                name="title"
                                                placeholder="Lecture Title"
                                                value={lectureData[course.id]?.title || ""}
                                                onChange={(e) => changeLecture(course.id, e)}
                                                className="w-full bg-white border border-gray-200 px-4 py-3 mb-3 rounded-2xl outline-none"
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <input
                                                    name="lectureOrder"
                                                    type="number"
                                                    min="1"
                                                    placeholder="Lecture Order"
                                                    value={lectureData[course.id]?.lectureOrder || ""}
                                                    onChange={(e) => changeLecture(course.id, e)}
                                                    className="w-full bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
                                                />

                                                <select
                                                    name="type"
                                                    value={lectureData[course.id]?.type || "VIDEO"}
                                                    onChange={(e) => changeLecture(course.id, e)}
                                                    className="w-full bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
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
                                                className="w-full bg-white border border-gray-200 px-4 py-3 mt-3 mb-3 rounded-2xl outline-none"
                                            />

                                            <button
                                                onClick={() => uploadLecture(course.id)}
                                                className="bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-800 transition"
                                            >
                                                <Upload size={18} /> Upload
                                            </button>
                                        </div>
                                    )}

                                    {activeCoursePanel[course.id] === "lectures" && (
                                        <div className="mt-4 bg-[#f7f7f7] rounded-3xl p-4">
                                            <h5 className="font-bold mb-3">Lectures</h5>

                                            {courseLectures[course.id]?.map((lecture) => (
                                                <div key={lecture.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                                    <p className="font-semibold">
                                                        {lecture.lectureOrder}. {lecture.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mb-3">{lecture.type}</p>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            defaultValue={lecture.lectureOrder}
                                                            className="bg-[#f7f7f7] border border-gray-200 px-3 py-2 rounded-xl w-24"
                                                            id={"order-" + lecture.id}
                                                        />

                                                        <button
                                                            onClick={async () => {
                                                                const newOrder = document.getElementById("order-" + lecture.id).value;
                                                                await updateLectureOrder(lecture.id, course.id, newOrder);
                                                            }}
                                                            className="bg-black text-white px-4 py-2 rounded-xl text-sm"
                                                        >
                                                            Save Order
                                                        </button>

                                                        <button
                                                            onClick={() => deleteLecture(lecture.id, course.id)}
                                                            className="bg-red-100 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition"
                                                        >
                                                            <Trash2 size={15} /> Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {activeCoursePanel[course.id] === "reviews" && (
                                        <div className="mt-4 bg-[#f7f7f7] rounded-3xl p-4">
                                            <h5 className="font-bold mb-3">Reviews</h5>

                                            {courseReviews[course.id]?.length > 0 ? (
                                                courseReviews[course.id].map((review) => (
                                                    <div key={review.id} className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
                                                        <p className="font-semibold">Rating: {review.rating}/5</p>
                                                        <p>{review.comment}</p>
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
                <section className="bg-gradient-to-br from-white to-blue-50 rounded-[2rem] p-6 border border-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
                        <div>
                            <p className="text-sm text-gray-500">User learning area</p>
                            <h3 className="text-2xl font-bold">Courses</h3>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setUserCoursePanel("all")}
                                className={
                                    userCoursePanel === "all"
                                        ? "bg-black text-white px-4 py-2 rounded-full"
                                        : "bg-white px-4 py-2 rounded-full shadow-sm"
                                }
                            >
                                All Courses
                            </button>

                            <button
                                onClick={() => setUserCoursePanel("enrolled")}
                                className={
                                    userCoursePanel === "enrolled"
                                        ? "bg-black text-white px-4 py-2 rounded-full"
                                        : "bg-white px-4 py-2 rounded-full shadow-sm"
                                }
                            >
                                My Courses
                            </button>
                        </div>
                    </div>

                    {userCoursePanel === "all" && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                <input
                                    placeholder="Search courses"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
                                />

                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
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
                                    <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">
                                        <h4 className="text-xl font-bold">{course.title}</h4>
                                        <p className="text-gray-600 mt-1">{course.description}</p>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{course.category}</p>
                                            <p className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                                                <Users size={15} />
                                                {course.enrolledCount || 0} enrolled
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <p className="text-lg font-bold text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                                <IndianRupee size={17} />
                                                {course.price || 0}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => enrollCourse(course)}
                                            disabled={isEnrolled(course.id)}
                                            className={
                                                isEnrolled(course.id)
                                                    ? "mt-4 bg-gray-300 text-white px-4 py-2 rounded-full flex items-center gap-2 cursor-not-allowed"
                                                    : "mt-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 hover:shadow-lg transition"
                                            }
                                        >
                                            <Users size={17} />
                                            {isEnrolled(course.id) ? "Enrolled" : `Enroll Now - ₹${course.price || 0}`}
                                        </button>

                                        <div className="mt-4 border-t pt-4">
                                            <h5 className="font-bold mb-3 flex items-center gap-2"><Star size={18} /> Add Review</h5>

                                            <input
                                                name="rating"
                                                type="number"
                                                min="1"
                                                max="5"
                                                placeholder="Rating 1-5"
                                                value={reviewData[course.id]?.rating || ""}
                                                onChange={(e) => changeReview(course.id, e)}
                                                className="w-full bg-[#f7f7f7] border border-gray-200 px-4 py-3 mb-3 rounded-2xl outline-none"
                                            />

                                            <input
                                                name="comment"
                                                placeholder="Write review"
                                                value={reviewData[course.id]?.comment || ""}
                                                onChange={(e) => changeReview(course.id, e)}
                                                className="w-full bg-[#f7f7f7] border border-gray-200 px-4 py-3 mb-3 rounded-2xl outline-none"
                                            />

                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => addReview(course.id)}
                                                    className="bg-green-50 text-green-700 hover:bg-green-600 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                                                >
                                                    <Star size={15} /> Submit Review
                                                </button>

                                                <button
                                                    onClick={() => toggleUserReviews(course.id)}
                                                    className="bg-gray-100 text-gray-700 hover:bg-gray-800 hover:text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transition"
                                                >
                                                    <Eye size={15} />
                                                    {courseReviews[course.id] ? "Hide Reviews" : "Show Reviews"}
                                                </button>
                                            </div>

                                            {courseReviews[course.id]?.map((review) => (
                                                <div key={review.id} className="bg-[#f7f7f7] rounded-2xl p-4 mt-3">
                                                    <p className="font-semibold">Rating: {review.rating}/5</p>
                                                    <p>{review.comment}</p>
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
                                <p className="text-gray-600">You have not enrolled in any courses yet.</p>
                            ) : (
                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {getEnrolledCourses().map((course) => (
                                        <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                <div>
                                                    <h4 className="text-xl font-bold">{course.title}</h4>
                                                    <p className="text-gray-600 mt-1">{course.description}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{course.category}</p>
                                                        <p className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full flex items-center gap-1">
                                                            <Users size={15} />
                                                            {course.enrolledCount || 0} enrolled
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full h-fit">
                                                    Progress: {getCourseProgress(course.id)}%
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    localStorage.setItem("lastVisitedCourse", course.title);
                                                    toggleUserLectures(course.id);
                                                }}
                                                className="mt-4 bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-800 hover:shadow-lg transition"
                                            >
                                                <BookOpen size={17} />
                                                {courseLectures[course.id] ? "Hide Lectures" : "Watch Lectures"}
                                            </button>

                                            <div className="mt-4 space-y-3">
                                                {courseLectures[course.id]?.map((lecture) => (
                                                    <div key={lecture.id} className="bg-[#f7f7f7] rounded-3xl p-4">
                                                        <p className="font-semibold">
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
                                                                        ? "inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm hover:bg-gray-800 transition"
                                                                        : "inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-black hover:text-white transition px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm"
                                                                }
                                                            >
                                                                <Eye size={16} />
                                                                {previewLectureId === lecture.id ? "Close Preview" : "Preview"}
                                                            </button>

                                                            <button
                                                                onClick={() => downloadResource(lecture)}
                                                                className="inline-flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition px-4 py-2 rounded-2xl text-sm font-semibold shadow-sm"
                                                            >
                                                                <Download size={16} />
                                                                Download
                                                            </button>
                                                        </div>

                                                        {previewLectureId === lecture.id && (
                                                            <div className="mt-4 bg-white rounded-3xl border border-gray-200 p-4 relative shadow-inner">
                                                                <div className="flex items-center justify-between mb-3 pr-10">
                                                                    <div>
                                                                        <p className="font-bold">{lecture.title}</p>
                                                                        <p className="text-xs text-gray-500">{lecture.type} resource preview</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={() => setPreviewLectureId(null)}
                                                                    className="absolute top-4 right-4 bg-black text-white w-8 h-8 rounded-full text-sm hover:bg-gray-800 transition"
                                                                    title="Close preview"
                                                                >
                                                                    ×
                                                                </button>

                                                                {lecture.type === "IMAGE" && (
                                                                    <img
                                                                        src={`${API_URL}/uploads/` + lecture.fileName}
                                                                        alt={lecture.title}
                                                                        className="mt-2 max-w-full rounded-2xl border"
                                                                    />
                                                                )}

                                                                {lecture.type === "VIDEO" && (
                                                                    <video controls className="mt-2 w-full max-w-3xl rounded-2xl border bg-black">
                                                                        <source src={`${API_URL}/uploads/` + lecture.fileName} />
                                                                    </video>
                                                                )}

                                                                {lecture.type === "PDF" && (
                                                                    <iframe
                                                                        src={`${API_URL}/uploads/` + lecture.fileName}
                                                                        width="100%"
                                                                        height="500"
                                                                        className="mt-2 rounded-2xl border"
                                                                    />
                                                                )}

                                                                {lecture.type === "NOTES" && (
                                                                    <iframe
                                                                        src={`${API_URL}/uploads/` + lecture.fileName}
                                                                        width="100%"
                                                                        height="400"
                                                                        className="mt-2 rounded-2xl border"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}

                                                        <label className="block mt-3 text-sm">
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
                <section className="bg-gradient-to-br from-white via-white to-slate-50 rounded-[2rem] p-6 border border-white shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500">Admin control area</p>
                            <h3 className="text-3xl font-black">Course Management</h3>
                            <p className="text-gray-500 mt-1">Choose an instructor, select a course, then manage lectures or quizzes.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-3xl bg-blue-50 px-5 py-4 border border-blue-100">
                                <p className="text-xs text-blue-600 font-bold">INSTRUCTORS</p>
                                <p className="text-2xl font-black">{instructors.length}</p>
                            </div>
                            <div className="rounded-3xl bg-purple-50 px-5 py-4 border border-purple-100">
                                <p className="text-xs text-purple-600 font-bold">COURSES</p>
                                <p className="text-2xl font-black">{adminCourses.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                        <div className="xl:col-span-1 space-y-5">
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-black">1. Choose Instructor</h4>
                                        <p className="text-xs text-gray-500">Filter courses by instructor</p>
                                    </div>
                                </div>

                                <select
                                    value={selectedInstructorEmail}
                                    onChange={(e) => loadAdminCoursesByInstructor(e.target.value)}
                                    className="w-full bg-[#f7f7f7] border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-black"
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
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                                            <BookOpen size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-black">3. Manage Content</h4>
                                            <p className="text-xs text-gray-500">Select what you want to review</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => loadAdminLectures(selectedAdminCourseId)}
                                            className={
                                                adminSection === "lectures"
                                                    ? "inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-semibold shadow-lg transition"
                                                    : "inline-flex items-center gap-2 bg-gray-100 hover:bg-black hover:text-white px-5 py-3 rounded-2xl font-semibold transition"
                                            }
                                        >
                                            <BookOpen size={17} />
                                            Lectures
                                        </button>

                                        <button
                                            onClick={() => loadAdminQuizzes(selectedAdminCourseId)}
                                            className={
                                                adminSection === "quizzes"
                                                    ? "inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl font-semibold shadow-lg transition"
                                                    : "inline-flex items-center gap-2 bg-gray-100 hover:bg-black hover:text-white px-5 py-3 rounded-2xl font-semibold transition"
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
                            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between gap-3 mb-4">
                                    <div>
                                        <h4 className="font-black text-xl">2. Choose Course</h4>
                                        <p className="text-sm text-gray-500">{selectedInstructorEmail ? selectedInstructorEmail : "Select an instructor first"}</p>
                                    </div>
                                    {selectedInstructorEmail && (
                                        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminCourses.length} course(s)
                                        </span>
                                    )}
                                </div>

                                {!selectedInstructorEmail ? (
                                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                                        Pick an instructor to view their courses.
                                    </div>
                                ) : adminCourses.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                                        No courses by this instructor.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-h-[52vh] overflow-y-auto pr-2">
                                        {adminCourses.map((course) => (
                                            <div
                                                key={course.id}
                                                className={
                                                    selectedAdminCourseId === course.id
                                                        ? "rounded-3xl p-5 bg-black text-white shadow-xl border border-black transition"
                                                        : "rounded-3xl p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
                                                }
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-lg font-black truncate">{course.title}</p>
                                                        <p className={selectedAdminCourseId === course.id ? "text-sm text-gray-300 mt-1 line-clamp-2" : "text-sm text-gray-600 mt-1 line-clamp-2"}>
                                                            {course.description || "No description"}
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteCourse(course.id)}
                                                        className="shrink-0 w-10 h-10 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
                                                        title="Delete course"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2 mt-4">
                                                    <span className={selectedAdminCourseId === course.id ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold" : "bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold"}>
                                                        {course.category || "No category"}
                                                    </span>
                                                    <span className={selectedAdminCourseId === course.id ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1" : "bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"}>
                                                        <IndianRupee size={13} />
                                                        {course.price || 0}
                                                    </span>
                                                    <span className={selectedAdminCourseId === course.id ? "bg-white/10 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1" : "bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1"}>
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
                                                            : "mt-5 w-full bg-black text-white px-4 py-3 rounded-2xl font-bold hover:bg-gray-800 transition"
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
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-xl">Manage Lectures</h4>
                                            <p className="text-sm text-gray-500">Remove invalid or unwanted lecture resources.</p>
                                        </div>
                                        <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminLectures.length} lecture(s)
                                        </span>
                                    </div>

                                    {adminLectures.length === 0 ? (
                                        <p className="text-gray-500 bg-gray-50 rounded-3xl p-6 text-center">No lectures found.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {adminLectures.map((lecture) => (
                                                <div key={lecture.id} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-4 border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
                                                            {lecture.lectureOrder || "-"}
                                                        </div>
                                                        <div>
                                                            <p className="font-black">{lecture.title}</p>
                                                            <p className="text-sm text-gray-500">{lecture.type}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteLecture(lecture.id)}
                                                        className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
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
                                <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-xl">Manage Quizzes</h4>
                                            <p className="text-sm text-gray-500">Delete quizzes linked to the selected course.</p>
                                        </div>
                                        <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                                            {adminQuizzes.length} quiz(zes)
                                        </span>
                                    </div>

                                    {adminQuizzes.length === 0 ? (
                                        <p className="text-gray-500 bg-gray-50 rounded-3xl p-6 text-center">No quizzes found.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {adminQuizzes.map((quiz) => (
                                                <div key={quiz.id} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-4 border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                                            <Star size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black">{quiz.title}</p>
                                                            <p className="text-sm text-gray-500">Quiz ID: {quiz.id}</p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => adminDeleteQuiz(quiz.id)}
                                                        className="w-10 h-10 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition"
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