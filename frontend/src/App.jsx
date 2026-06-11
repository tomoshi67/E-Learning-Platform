import { useEffect, useState } from "react";

function App() {
    const [login, setLogin] = useState(false);
    const [message, setMessage] = useState("");
    const [dashboardRole, setDashboardRole] = useState("");
    const [section, setSection] = useState("profile");
    const [editingCourseId, setEditingCourseId] = useState(null);
    const [data, setData] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER",
    });
    const [courseData, setCourseData] = useState({
        title: "",
        description: "",
        category: "",
    });
    const [courses, setCourses] = useState([]);
    const [courseLectures, setCourseLectures] = useState({});
    const [lectureData, setLectureData] = useState({});
    useEffect(() => {
        const savedRole = localStorage.getItem("role");

        if (savedRole) {
            setDashboardRole(savedRole);
        }
    }, []);
    const [reviewData, setReviewData] = useState({});
    const [courseReviews, setCourseReviews] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [enrollments, setEnrollments] = useState([]);
    const [userCoursePanel, setUserCoursePanel] = useState("all");

    const change = (e) => {
        setMessage("");
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!login && data.username.trim() === "") {
            return "Username is required";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(data.email)) {
            return "Enter a valid email address";
        }

        if (data.password.length < 6) {
            return "Password must be at least 6 characters long";
        }

        return "";
    };

    const submit = async () => {
        const error = validate();

        if (error) {
            setMessage(error);
            return;
        }

        const url = login ? "/auth/login" : "/auth/register";

        const body = login
            ? { email: data.email, password: data.password }
            : data;

        try {
            const res = await fetch("http://localhost:8080" + url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (login) {
                const text = await res.text();

                try {
                    const result = JSON.parse(text);

                    localStorage.setItem("token", result.token);
                    localStorage.setItem("role", result.role);
                    localStorage.setItem("email", result.email);

                    setMessage(result.message + " as " + result.role);
                    setDashboardRole(result.role);
                } catch {
                    setMessage(text);
                }
            } else {
                const text = await res.text();
                setMessage(text);
            }

        } catch (error) {
            console.error(error);
            setMessage("Request failed. Please check if backend is running.");
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
            instructorEmail: localStorage.getItem("email"),
        };

        const url = editingCourseId
            ? "http://localhost:8080/courses/update/" + editingCourseId
            : "http://localhost:8080/courses/add";

        const method = editingCourseId ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify(courseBody),
        });

        const savedCourse = await res.json();

        if (editingCourseId) {
            setCourses(
                courses.map(course =>
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
            "http://localhost:8080/courses/instructor/" + encodeURIComponent(email)
        );

        const data = await res.json();
        setCourses(data);
    };
    const deleteCourse = async (id) => {

        await fetch(
            "http://localhost:8080/courses/delete/" + id,
            {
                method: "DELETE",
            }
        );

        setCourses(
            courses.filter(course => course.id !== id)
        );
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

        const formData = new FormData();

        formData.append("title", lecture.title);
        formData.append("type", lecture.type || "VIDEO");
        formData.append("lectureOrder", lecture.lectureOrder);
        formData.append("file", lecture.file);

        await fetch("http://localhost:8080/lectures/upload/" + courseId, {
            method: "POST",
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
        });

        await loadLectures(courseId);
    };
    const loadLectures = async (courseId) => {
        const res = await fetch("http://localhost:8080/lectures/course/" + courseId);
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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userEmail: localStorage.getItem("email"),
                courseId: courseId,
                rating: review.rating,
                comment: review.comment,
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
        const res = await fetch("http://localhost:8080/reviews/course/" + courseId);
        const data = await res.json();

        setCourseReviews({
            ...courseReviews,
            [courseId]: data,
        });
    };

    const loadAllCourses = async () => {
        const res = await fetch("http://localhost:8080/courses/all");
        const data = await res.json();
        setCourses(data);
    };

    const loadUserEnrollments = async () => {
        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/enrollments/user/" + encodeURIComponent(email)
        );

        const data = await res.json();
        setEnrollments(data);
    };

    const enrollCourse = async (courseId) => {
        const res = await fetch("http://localhost:8080/enrollments/enroll", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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

    if (dashboardRole) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
                    <h1 className="text-3xl font-bold mb-4">
                        {dashboardRole} Dashboard
                    </h1>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setSection("profile")}
                            className="border px-4 py-2 rounded"
                        >
                            Profile
                        </button>

                        <button
                            onClick={() => setSection("details")}
                            className="border px-4 py-2 rounded"
                        >
                            Details
                        </button>

                        <button
                            onClick={async () => {
                                setSection("courses");

                                if (dashboardRole === "INSTRUCTOR") {
                                    await loadInstructorCourses();
                                }

                                if (dashboardRole === "USER") {
                                    await loadAllCourses();
                                    await loadUserEnrollments();
                                }
                            }}
                            className="border px-4 py-2 rounded"
                        >
                            Courses
                        </button>
                    </div>
                    {section === "profile" && (
                        <div className="border p-4 rounded">
                            <h2 className="font-bold mb-2">Profile</h2>
                            <p>Role: {dashboardRole}</p>
                            <p>Email: {localStorage.getItem("email")}</p>
                        </div>
                    )}

                    {section === "details" && (
                        <div className="border p-4 rounded">
                            <h2 className="font-bold mb-2">Details</h2>
                            <p>Basic account and platform information.</p>
                        </div>
                    )}

                    {section === "courses" && (
                        <div className="border p-4 rounded">
                            <h2 className="font-bold mb-3">Courses</h2>

                            {dashboardRole === "INSTRUCTOR" ? (
                                <div>
                                    <h3 className="font-bold mb-2">Add Course</h3>

                                    <input
                                        name="title"
                                        placeholder="Course Title"
                                        value={courseData.title}
                                        onChange={changeCourse}
                                        className="w-full border p-2 mb-3 rounded"
                                    />

                                    <input
                                        name="description"
                                        placeholder="Course Description"
                                        value={courseData.description}
                                        onChange={changeCourse}
                                        className="w-full border p-2 mb-3 rounded"
                                    />

                                    <input
                                        name="category"
                                        placeholder="Category"
                                        value={courseData.category}
                                        onChange={changeCourse}
                                        className="w-full border p-2 mb-3 rounded"
                                    />

                                    <button
                                        onClick={addCourse}
                                        className="bg-blue-500 text-white px-4 py-2 rounded"
                                    >
                                        {editingCourseId ? "Update Course" : "Add Course"}
                                    </button>

                                    <div className="mt-4">
                                        <h3 className="font-bold mb-2">My Courses</h3>

                                        {courses.map((course) => (
                                            <div key={course.id} className="border p-3 rounded mb-2">
                                                <h4 className="font-bold">{course.title}</h4>
                                                <p>{course.description}</p>
                                                <p className="text-sm text-gray-600">{course.category}</p>

                                                <button
                                                    onClick={() => {
                                                        setEditingCourseId(course.id);
                                                        setCourseData({
                                                            title: course.title,
                                                            description: course.description,
                                                            category: course.category,
                                                        });
                                                    }}
                                                    className="mt-2 mr-2 bg-yellow-500 text-white px-3 py-1 rounded"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => deleteCourse(course.id)}
                                                    className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
                                                >
                                                    Delete
                                                </button>

                                                <div className="mt-3 border-t pt-3">
                                                    <h5 className="font-bold mb-2">Upload Lecture / Resource</h5>

                                                    <input
                                                        name="title"
                                                        placeholder="Lecture Title"
                                                        value={lectureData[course.id]?.title || ""}
                                                        onChange={(e) => changeLecture(course.id, e)}
                                                        className="w-full border p-2 mb-2 rounded"
                                                    />
                                                    <input
                                                        name="lectureOrder"
                                                        type="number"
                                                        min="1"
                                                        placeholder="Lecture Order"
                                                        value={lectureData[course.id]?.lectureOrder || ""}
                                                        onChange={(e) => changeLecture(course.id, e)}
                                                        className="w-full border p-2 mb-2 rounded"
                                                    />
                                                    <select
                                                        name="type"
                                                        value={lectureData[course.id]?.type || "VIDEO"}
                                                        onChange={(e) => changeLecture(course.id, e)}
                                                        className="w-full border p-2 mb-2 rounded"
                                                    >
                                                        <option value="VIDEO">VIDEO</option>
                                                        <option value="PDF">PDF</option>
                                                        <option value="NOTES">NOTES</option>
                                                    </select>

                                                    <input
                                                        type="file"
                                                        onChange={(e) => changeLectureFile(course.id, e)}
                                                        className="w-full border p-2 mb-2 rounded"
                                                    />

                                                    <button
                                                        onClick={() => uploadLecture(course.id)}
                                                        className="bg-purple-500 text-white px-3 py-1 rounded"
                                                    >
                                                        Upload
                                                    </button>
                                                    <button
                                                        onClick={() => loadLectures(course.id)}
                                                        className="ml-2 bg-green-500 text-white px-3 py-1 rounded"
                                                    >
                                                        Show Lectures
                                                    </button>
                                                </div>
                                                <div className="mt-3">
                                                    {courseLectures[course.id]?.map((lecture) => (
                                                        <div key={lecture.id} className="border p-2 rounded mb-2">
                                                            <p className="font-semibold">{lecture.title}</p>

                                                            <p className="text-sm text-gray-600 mb-2">
                                                                {lecture.type}
                                                            </p>

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                defaultValue={lecture.lectureOrder}
                                                                className="border p-1 rounded mr-2 w-24"
                                                                id={"order-" + lecture.id}
                                                            />

                                                            <button
                                                                onClick={async () => {
                                                                    const newOrder = document.getElementById("order-" + lecture.id).value;
                                                                    await updateLectureOrder(lecture.id, course.id, newOrder);
                                                                }}
                                                                className="bg-blue-500 text-white px-3 py-1 rounded"
                                                            >
                                                                Save Order
                                                            </button>
                                                            <button
                                                                onClick={() => deleteLecture(lecture.id, course.id)}
                                                                className="ml-2 bg-red-500 text-white px-3 py-1 rounded"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 border-t pt-3">
                                                    <h5 className="font-bold mb-2">Reviews</h5>

                                                    <button
                                                        onClick={() => loadReviews(course.id)}
                                                        className="bg-gray-600 text-white px-3 py-1 rounded mb-2"
                                                    >
                                                        Show Reviews
                                                    </button>

                                                    {courseReviews[course.id]?.map((review) => (
                                                        <div key={review.id} className="border p-2 rounded mb-2">
                                                            <p>Rating: {review.rating}/5</p>
                                                            <p>{review.comment}</p>
                                                            <p className="text-sm text-gray-600">
                                                                By: {review.userEmail}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : dashboardRole === "USER" ? (
                                <div>
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setUserCoursePanel("all")}
                                            className={
                                                userCoursePanel === "all"
                                                    ? "bg-blue-600 text-white px-3 py-1 rounded"
                                                    : "bg-blue-500 text-white px-3 py-1 rounded"
                                            }
                                        >
                                            All Courses
                                        </button>

                                        <button
                                            onClick={() => setUserCoursePanel("enrolled")}
                                            className={
                                                userCoursePanel === "enrolled"
                                                    ? "bg-green-600 text-white px-3 py-1 rounded"
                                                    : "bg-green-500 text-white px-3 py-1 rounded"
                                            }
                                        >
                                            My Enrolled Courses
                                        </button>
                                    </div>

                                    {userCoursePanel === "all" && (
                                        <div>
                                            <h3 className="font-bold mb-2">Browse Courses</h3>

                                            <button
                                                onClick={loadAllCourses}
                                                className="bg-blue-500 text-white px-3 py-1 rounded mb-3"
                                            >
                                                Load Courses
                                            </button>

                                            <input
                                                placeholder="Search courses by title, description, or category"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full border p-2 mb-3 rounded"
                                            />

                                            <select
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                className="w-full border p-2 mb-3 rounded"
                                            >
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
                                                    </option>
                                                ))}
                                            </select>

                                            <p className="text-sm text-gray-600 mb-3">
                                                Showing {filteredCourses.length} course(s)
                                            </p>

                                            {filteredCourses.map((course) => (
                                                <div key={course.id} className="border p-3 rounded mb-3">
                                                    <h4 className="font-bold">{course.title}</h4>
                                                    <p>{course.description}</p>
                                                    <p className="text-sm text-gray-600">{course.category}</p>

                                                    <button
                                                        onClick={() => enrollCourse(course.id)}
                                                        disabled={isEnrolled(course.id)}
                                                        className={
                                                            isEnrolled(course.id)
                                                                ? "mt-2 bg-gray-400 text-white px-3 py-1 rounded"
                                                                : "mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                                                        }
                                                    >
                                                        {isEnrolled(course.id) ? "Enrolled" : "Enroll"}
                                                    </button>

                                                    <div className="mt-3 border-t pt-3">
                                                        <h5 className="font-bold mb-2">Add Review</h5>

                                                        <input
                                                            name="rating"
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            placeholder="Rating 1-5"
                                                            value={reviewData[course.id]?.rating || ""}
                                                            onChange={(e) => changeReview(course.id, e)}
                                                            className="w-full border p-2 mb-2 rounded"
                                                        />

                                                        <input
                                                            name="comment"
                                                            placeholder="Write review"
                                                            value={reviewData[course.id]?.comment || ""}
                                                            onChange={(e) => changeReview(course.id, e)}
                                                            className="w-full border p-2 mb-2 rounded"
                                                        />

                                                        <button
                                                            onClick={() => addReview(course.id)}
                                                            className="bg-green-500 text-white px-3 py-1 rounded"
                                                        >
                                                            Submit Review
                                                        </button>

                                                        <button
                                                            onClick={() => loadReviews(course.id)}
                                                            className="ml-2 bg-gray-600 text-white px-3 py-1 rounded"
                                                        >
                                                            Show Reviews
                                                        </button>

                                                        {courseReviews[course.id]?.map((review) => (
                                                            <div key={review.id} className="border p-2 rounded mt-2">
                                                                <p>Rating: {review.rating}/5</p>
                                                                <p>{review.comment}</p>
                                                                <p className="text-sm text-gray-600">
                                                                    By: {review.userEmail}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {userCoursePanel === "enrolled" && (
                                        <div>
                                            <h3 className="font-bold mb-2">My Enrolled Courses</h3>

                                            {getEnrolledCourses().length === 0 ? (
                                                <p className="text-gray-600">
                                                    You have not enrolled in any courses yet.
                                                </p>
                                            ) : (
                                                getEnrolledCourses().map((course) => (
                                                    <div key={course.id} className="border p-3 rounded mb-3">
                                                        <h4 className="font-bold">{course.title}</h4>
                                                        <p>{course.description}</p>
                                                        <p className="text-sm text-gray-600">{course.category}</p>

                                                        <button
                                                            onClick={() => loadLectures(course.id)}
                                                            className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                                                        >
                                                            Watch Lectures
                                                        </button>

                                                        <div className="mt-3">
                                                            {courseLectures[course.id]?.map((lecture) => (
                                                                <div key={lecture.id} className="border p-2 rounded mb-2">
                                                                    <p className="font-semibold">
                                                                        {lecture.lectureOrder}. {lecture.title}
                                                                    </p>

                                                                    <p className="text-sm text-gray-600">
                                                                        {lecture.type}
                                                                    </p>

                                                                    <p className="text-sm">
                                                                        File: {lecture.fileName}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p>Monitor all platform courses here.</p>
                            )}
                        </div>
                    )}

                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            localStorage.removeItem("email");
                            setDashboardRole("");
                            setMessage("");
                        }}
                        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-96 p-6 border rounded-lg shadow bg-white">
                <h1 className="text-2xl font-bold mb-4">
                    {login ? "Login" : "Signup"}
                </h1>

                {!login && (
                    <input
                        name="username"
                        placeholder="Username"
                        onChange={change}
                        className="w-full border p-2 mb-3 rounded"
                    />
                )}

                <input
                    name="email"
                    placeholder="Email"
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={change}
                    className="w-full border p-2 mb-3 rounded"
                />

                {!login && (
                    <select
                        name="role"
                        onChange={change}
                        className="w-full border p-2 mb-3 rounded"
                    >
                        <option value="USER">USER</option>
                        <option value="INSTRUCTOR">INSTRUCTOR</option>
                        <option value="ADMIN">ADMIN</option>
                    </select>
                )}

                <button
                    onClick={submit}
                    className="w-full bg-blue-500 text-white p-2 rounded"
                >
                    {login ? "Login" : "Register"}
                </button>

                {message && (
                    <p
                        className={
                            message.includes("Successful") ||
                            message.includes("Token:")
                                ? "text-green-600 mt-3 text-sm"
                                : "text-red-600 mt-3 text-sm"
                        }
                    >
                        {message}
                    </p>
                )}

                <button
                    onClick={() => {
                        setLogin(!login);
                        setMessage("");
                    }}
                    className="w-full mt-4 text-blue-600"
                >
                    {login ? "Go to Signup" : "Go to Login"}
                </button>
            </div>
        </div>
    );
}

export default App;