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
                const result = await res.json();

                localStorage.setItem("token", result.token);
                localStorage.setItem("role", result.role);
                localStorage.setItem("email", result.email);

                setMessage(result.message + " as " + result.role);
                setDashboardRole(result.role);
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
                            onClick={() => {
                                setSection("courses");

                                if (dashboardRole === "INSTRUCTOR") {
                                    loadInstructorCourses();
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