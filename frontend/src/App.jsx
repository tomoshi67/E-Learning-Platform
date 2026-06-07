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
                                                                onClick={() => {
                                                                    const newOrder = document.getElementById("order-" + lecture.id).value;
                                                                    updateLectureOrder(lecture.id, course.id, newOrder);
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : dashboardRole === "USER" ? (
                                <p>View enrolled courses here.</p>
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