import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CoursesPage() {
    const navigate = useNavigate();
    const dashboardRole = localStorage.getItem("role");
    const role = localStorage.getItem("role");

    const [editingCourseId, setEditingCourseId] = useState(null);
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        category: "",
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

    const goToQuizzes = () => {
        if (role === "USER") navigate("/user/quizzes");
        if (role === "INSTRUCTOR") navigate("/instructor/quizzes");
    };
    const goToNotifications = () => {
        if (role === "USER") navigate("/user/notifications");
        if (role === "INSTRUCTOR") navigate("/instructor/notifications");
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login", { replace: true });
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
            ? "http://localhost:8080/courses/update/" + editingCourseId
            : "http://localhost:8080/courses/add";

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
            setCourses([...courses, savedCourse]);
        }

        setCourseData({
            title: "",
            description: "",
            category: "",
        });
    };

    const loadInstructorCourses = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/courses/instructor/" + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setCourses(data);
    };

    const deleteCourse = async (id) => {
        await fetch("http://localhost:8080/courses/delete/" + id, {
            method: "DELETE",
            headers: authHeaders(),
        });

        setCourses(courses.filter((course) => course.id !== id));
    };

    const changeLecture = (courseId, e) => {
        setLectureData({
            ...lectureData,
            [courseId]: {
                ...lectureData[courseId],
                [e.target.name]: e.target.value,
            },
        });
    };

    const changeLectureFile = (courseId, e) => {
        setLectureData({
            ...lectureData,
            [courseId]: {
                ...lectureData[courseId],
                file: e.target.files[0],
            },
        });
    };

    const uploadLecture = async (courseId) => {
        const lecture = lectureData[courseId];

        if (!lecture || !lecture.title || !lecture.file) {
            alert("Please fill lecture title and choose a file.");
            return;
        }

        const formData = new FormData();
        formData.append("title", lecture.title);
        formData.append("type", lecture.type || "VIDEO");
        formData.append("lectureOrder", lecture.lectureOrder);
        formData.append("file", lecture.file);

        await fetch("http://localhost:8080/lectures/upload/" + courseId, {
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
        await fetch("http://localhost:8080/lectures/delete/" + lectureId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadLectures(courseId);
    };

    const loadLectures = async (courseId) => {
        const res = await fetch("http://localhost:8080/lectures/course/" + courseId, {
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
            "http://localhost:8080/lectures/update-order/" + lectureId + "?lectureOrder=" + newOrder,
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

        await fetch("http://localhost:8080/reviews/add", {
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
        const res = await fetch("http://localhost:8080/reviews/course/" + courseId, {
            headers: authHeaders(),
        });
        const data = await res.json();

        setCourseReviews({
            ...courseReviews,
            [courseId]: data,
        });
    };

    const loadAllCourses = async () => {
        const res = await fetch("http://localhost:8080/courses/all", {
            headers: authHeaders(),
        });
        const data = await res.json();
        setCourses(data);
    };

    const loadUserEnrollments = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/enrollments/user/" + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setEnrollments(data);
    };

    const enrollCourse = async (courseId) => {
        const res = await fetch("http://localhost:8080/enrollments/enroll", {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: localStorage.getItem("email"),
                courseId: courseId,
            }),
        });

        const text = await res.text();
        alert(text);

        await loadUserEnrollments();
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
            "http://localhost:8080/progress/user/" + encodeURIComponent(email),
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
        await fetch("http://localhost:8080/progress/update", {
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
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/notifications/has-unread/" +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasUnread(data);
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
        <div className="min-h-screen bg-[#ededed] p-4">
            <div className="min-h-[calc(100vh-2rem)] bg-white rounded-[2rem] shadow-xl grid grid-cols-12 overflow-hidden">
                <aside className="hidden md:flex md:col-span-3 bg-[#f7f7f7] p-6 flex-col justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-8">E-Learn</h1>

                        <div className="space-y-3">
                            <button
                                onClick={goToProfile}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                Profile
                            </button>

                            <button
                                onClick={goToDetails}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                Details
                            </button>

                            <button
                                onClick={goToCourses}
                                className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl"
                            >
                                Courses
                            </button>
                            <button
                                onClick={goToQuizzes}
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                Quizzes
                            </button>
                            {role === "USER" && (
                                <button
                                    onClick={goToNotifications}
                                    className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm flex justify-between items-center"
                                >
                                    <span>Notifications</span>

                                    {hasUnread && (
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    )}
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
                            <h2 className="text-3xl font-bold">{dashboardRole} Courses</h2>
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
                            className="bg-white px-4 py-2 rounded-full shadow-sm"
                        >
                            Profile
                        </button>

                        <button
                            onClick={goToDetails}
                            className="bg-white px-4 py-2 rounded-full shadow-sm"
                        >
                            Details
                        </button>

                        <button
                            onClick={goToCourses}
                            className="bg-black text-white px-4 py-2 rounded-full"
                        >
                            Courses
                        </button>
                        <button
                            onClick={goToQuizzes}
                            className="bg-white px-4 py-2 rounded-full shadow-sm"
                        >
                            Quizzes
                        </button>
                        {role === "USER" && (
                            <button
                                onClick={goToNotifications}
                                className="bg-white px-4 py-2 rounded-full shadow-sm flex items-center gap-2"
                            >
                                Notifications

                                {hasUnread && (
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                        )}

                    </div>

                    {dashboardRole === "INSTRUCTOR" ? (
                        <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                            <div className="bg-[#f7f7f7] rounded-[2rem] p-6 h-fit">
                                <p className="text-gray-500 mb-2">
                                    {editingCourseId ? "Edit course" : "Create course"}
                                </p>

                                <h3 className="text-2xl font-bold mb-5">
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

                                <button
                                    onClick={addCourse}
                                    className="w-full bg-black text-white px-4 py-3 rounded-2xl font-semibold"
                                >
                                    {editingCourseId ? "Update Course" : "Add Course"}
                                </button>
                            </div>

                            <div className="xl:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-6">
                                <div className="flex justify-between items-center mb-5">
                                    <div>
                                        <p className="text-gray-500 text-sm">Instructor content</p>
                                        <h3 className="text-2xl font-bold">My Courses</h3>
                                    </div>
                                    <p className="text-sm text-gray-500">{courses.length} course(s)</p>
                                </div>

                                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                    {courses.map((course) => (
                                        <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                                <div>
                                                    <h4 className="text-xl font-bold">{course.title}</h4>
                                                    <p className="text-gray-600 mt-1">{course.description}</p>
                                                    <p className="text-sm text-gray-500 mt-2">{course.category}</p>
                                                </div>

                                                <div className="flex gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCourseId(course.id);
                                                            setCourseData({
                                                                title: course.title,
                                                                description: course.description,
                                                                category: course.category,
                                                            });
                                                        }}
                                                        className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() => deleteCourse(course.id)}
                                                        className="bg-red-500 text-white px-4 py-2 rounded-full text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-4 border-t pt-4">
                                                <button
                                                    onClick={() => toggleCoursePanel(course.id, "upload")}
                                                    className="bg-purple-500 text-white px-4 py-2 rounded-full text-sm"
                                                >
                                                    Upload Lecture
                                                </button>

                                                <button
                                                    onClick={() => toggleCoursePanel(course.id, "lectures")}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm"
                                                >
                                                    {activeCoursePanel[course.id] === "lectures" ? "Hide Lectures" : "Lectures"}
                                                </button>

                                                <button
                                                    onClick={() => toggleCoursePanel(course.id, "reviews")}
                                                    className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm"
                                                >
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
                                                        onChange={(e) => changeLectureFile(course.id, e)}
                                                        className="w-full bg-white border border-gray-200 px-4 py-3 mt-3 mb-3 rounded-2xl outline-none"
                                                    />

                                                    <button
                                                        onClick={() => uploadLecture(course.id)}
                                                        className="bg-black text-white px-5 py-3 rounded-2xl"
                                                    >
                                                        Upload
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
                                                                    className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm"
                                                                >
                                                                    Delete
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
                        <section className="bg-[#f7f7f7] rounded-[2rem] p-6">
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
                                            <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm">
                                                <h4 className="text-xl font-bold">{course.title}</h4>
                                                <p className="text-gray-600 mt-1">{course.description}</p>
                                                <p className="text-sm text-gray-500 mt-2">{course.category}</p>

                                                <button
                                                    onClick={() => enrollCourse(course.id)}
                                                    disabled={isEnrolled(course.id)}
                                                    className={
                                                        isEnrolled(course.id)
                                                            ? "mt-4 bg-gray-400 text-white px-4 py-2 rounded-full"
                                                            : "mt-4 bg-black text-white px-4 py-2 rounded-full"
                                                    }
                                                >
                                                    {isEnrolled(course.id) ? "Enrolled" : "Enroll"}
                                                </button>

                                                <div className="mt-4 border-t pt-4">
                                                    <h5 className="font-bold mb-3">Add Review</h5>

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
                                                            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm"
                                                        >
                                                            Submit Review
                                                        </button>

                                                        <button
                                                            onClick={() => toggleUserReviews(course.id)}
                                                            className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm"
                                                        >
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
                                                <div key={course.id} className="bg-white rounded-3xl p-5 shadow-sm">
                                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                        <div>
                                                            <h4 className="text-xl font-bold">{course.title}</h4>
                                                            <p className="text-gray-600 mt-1">{course.description}</p>
                                                            <p className="text-sm text-gray-500 mt-2">{course.category}</p>
                                                        </div>

                                                        <p className="text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full h-fit">
                                                            Progress: {getCourseProgress(course.id)}%
                                                        </p>
                                                    </div>

                                                    <button
                                                        onClick={() => toggleUserLectures(course.id)}
                                                        className="mt-4 bg-black text-white px-4 py-2 rounded-full"
                                                    >
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
                                                                    <a
                                                                        href={"http://localhost:8080/uploads/" + lecture.fileName}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="text-blue-600 underline text-sm"
                                                                    >
                                                                        Open Resource
                                                                    </a>

                                                                    <a
                                                                        href={"http://localhost:8080/uploads/" + lecture.fileName}
                                                                        download
                                                                        className="text-green-600 underline text-sm"
                                                                    >
                                                                        Download Resource
                                                                    </a>
                                                                </div>

                                                                {lecture.type === "IMAGE" && (
                                                                    <img
                                                                        src={"http://localhost:8080/uploads/" + lecture.fileName}
                                                                        alt={lecture.title}
                                                                        className="mt-2 max-w-sm rounded-2xl border"
                                                                    />
                                                                )}

                                                                {lecture.type === "VIDEO" && (
                                                                    <video controls className="mt-2 w-full max-w-lg rounded-2xl">
                                                                        <source
                                                                            src={"http://localhost:8080/uploads/" + lecture.fileName}
                                                                        />
                                                                        Your browser does not support video playback.
                                                                    </video>
                                                                )}

                                                                {lecture.type === "PDF" && (
                                                                    <iframe
                                                                        src={"http://localhost:8080/uploads/" + lecture.fileName}
                                                                        width="100%"
                                                                        height="400"
                                                                        className="mt-2 rounded-2xl border"
                                                                    />
                                                                )}

                                                                {lecture.type === "NOTES" && (
                                                                    <p className="text-sm text-gray-600 mt-2">
                                                                        Open or download the notes using the resource links above.
                                                                    </p>
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
                        <section className="bg-[#f7f7f7] rounded-[2rem] p-8">
                            <h3 className="text-2xl font-bold mb-2">Admin Courses</h3>
                            <p className="text-gray-600">Monitor all platform courses here.</p>
                        </section>
                    )}
                </main>
            </div>
        </div>
    );
}

export default CoursesPage;