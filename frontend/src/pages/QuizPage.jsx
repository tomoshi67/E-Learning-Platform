import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function QuizPage() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState("");

    const [questions, setQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [completedQuizzes, setCompletedQuizzes] = useState({});
    const [quizAttempts, setQuizAttempts] = useState({});

    const [quizTitle, setQuizTitle] = useState("");
    const [hasUnread, setHasUnread] = useState(false);

    const [questionData, setQuestionData] = useState({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
    });

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
        if (role === "INSTRUCTOR") navigate("/instructor/notifications");
    };
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        navigate("/login", { replace: true });
    };

    const loadQuizAttempts = async () => {
        if (role !== "USER") {
            return;
        }

        const email = localStorage.getItem("email");

        const res = await fetch(
            "http://localhost:8080/quiz-attempts/user/" + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();

        const attemptsMap = {};
        const completedMap = {};

        data.forEach((attempt) => {
            attemptsMap[attempt.quizId] = attempt;

            if (attempt.completed === true) {
                completedMap[attempt.quizId] = true;
            }
        });

        setQuizAttempts(attemptsMap);
        setCompletedQuizzes(completedMap);
    };

    const loadCourses = async () => {
        let url = "http://localhost:8080/courses/all";

        if (role === "INSTRUCTOR") {
            url =
                "http://localhost:8080/courses/instructor/" +
                encodeURIComponent(localStorage.getItem("email"));
        }

        const res = await fetch(url, {
            headers: authHeaders(),
        });

        const data = await res.json();

        if (role === "INSTRUCTOR") {
            const email = localStorage.getItem("email");
            setCourses(data.filter((course) => course.instructorEmail === email));
        } else {
            setCourses(data);
        }
    };

    const loadQuizzes = async (courseId) => {
        setSelectedCourseId(courseId);
        setSelectedQuizId("");
        setQuestions([]);
        setQuizStarted(false);
        setQuizCompleted(false);
        setScore(null);
        setReviewMode(false);
        setSelectedAnswers({});

        if (!courseId) {
            setQuizzes([]);
            return;
        }

        const res = await fetch("http://localhost:8080/quizzes/course/" + courseId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setQuizzes(data);
    };

    const addQuiz = async () => {
        if (!selectedCourseId) {
            alert("Select a course first");
            return;
        }

        if (!quizTitle.trim()) {
            alert("Enter quiz title");
            return;
        }

        await fetch("http://localhost:8080/quizzes/add", {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                courseId: selectedCourseId,
                title: quizTitle,
                instructorEmail: localStorage.getItem("email"),
            }),
        });

        alert("Quiz created successfully");
        setQuizTitle("");
        await loadQuizzes(selectedCourseId);
    };

    const deleteQuiz = async (quizId) => {
        await fetch("http://localhost:8080/quizzes/delete/" + quizId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        if (selectedQuizId === quizId) {
            setSelectedQuizId("");
            setQuestions([]);
        }

        await loadQuizzes(selectedCourseId);
    };

    const loadQuestions = async (quizId) => {
        setSelectedQuizId(quizId);
        setQuizStarted(false);
        setQuizCompleted(false);
        setScore(null);
        setReviewMode(false);
        setSelectedAnswers({});

        if (!quizId) {
            setQuestions([]);
            return;
        }

        const res = await fetch("http://localhost:8080/quiz-questions/quiz/" + quizId, {
            headers: authHeaders(),
        });

        const data = await res.json();
        setQuestions(data);
    };

    const changeQuestion = (e) => {
        setQuestionData({
            ...questionData,
            [e.target.name]: e.target.value,
        });
    };

    const addQuestion = async () => {
        if (!selectedQuizId) {
            alert("Select a quiz first");
            return;
        }

        if (
            !questionData.question ||
            !questionData.optionA ||
            !questionData.optionB ||
            !questionData.optionC ||
            !questionData.optionD ||
            !questionData.correctAnswer
        ) {
            alert("Fill all question fields");
            return;
        }

        await fetch("http://localhost:8080/quiz-questions/add", {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                ...questionData,
                quizId: selectedQuizId,
            }),
        });

        alert("Question added successfully");

        setQuestionData({
            question: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctAnswer: "",
        });

        await loadQuestions(selectedQuizId);
    };

    const deleteQuestion = async (questionId) => {
        await fetch("http://localhost:8080/quiz-questions/delete/" + questionId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadQuestions(selectedQuizId);
    };

    const startQuiz = async (quizId) => {
        await loadQuestions(quizId);
        setQuizStarted(true);
        setQuizCompleted(false);
        setScore(null);
        setReviewMode(false);
        setSelectedAnswers({});
    };

    const submitQuiz = async () => {
        if (questions.length === 0) {
            alert("This quiz has no questions");
            return;
        }

        let correct = 0;

        questions.forEach((question) => {
            if (selectedAnswers[question.id] === question.correctAnswer) {
                correct++;
            }
        });

        setScore(correct);
        setQuizCompleted(true);
        setQuizStarted(false);
        setReviewMode(false);

        await fetch("http://localhost:8080/quiz-attempts/save", {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: localStorage.getItem("email"),
                quizId: selectedQuizId,
                score: correct,
                totalQuestions: questions.length,
                completed: true,
            }),
        });

        const attemptData = {
            quizId: selectedQuizId,
            score: correct,
            totalQuestions: questions.length,
            completed: true,
        };

        setQuizAttempts({
            ...quizAttempts,
            [selectedQuizId]: attemptData,
        });

        setCompletedQuizzes({
            ...completedQuizzes,
            [selectedQuizId]: true,
        });
        await loadUnread();
    };

    const closeCompletedQuiz = () => {
        setSelectedQuizId("");
        setQuestions([]);
        setSelectedAnswers({});
        setQuizStarted(false);
        setQuizCompleted(false);
        setScore(null);
        setReviewMode(false);
    };

    const reviewSavedQuiz = async (quizId) => {
        await loadQuestions(quizId);
        setSelectedQuizId(quizId);

        const attempt = quizAttempts[quizId];

        if (attempt) {
            setScore(attempt.score);
        }

        setQuizStarted(false);
        setQuizCompleted(true);
        setReviewMode(true);
    };

    const retakeQuiz = async (quizId) => {
        await startQuiz(quizId);
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
        const initialize = async () => {
            await loadCourses();
            await loadUnread();
            await loadQuizAttempts();
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
                                className="w-full text-left bg-white px-4 py-3 rounded-2xl shadow-sm"
                            >
                                Courses
                            </button>

                            <button
                                onClick={goToQuizzes}
                                className="w-full text-left bg-black text-white px-4 py-3 rounded-2xl"
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
                            <h2 className="text-3xl font-bold">{role} Quizzes</h2>
                        </div>

                        <button
                            onClick={logout}
                            className="md:hidden bg-red-500 text-white px-4 py-2 rounded-full"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="md:hidden flex gap-2 mb-5">
                        <button onClick={goToProfile} className="bg-white px-4 py-2 rounded-full shadow-sm">
                            Profile
                        </button>

                        <button onClick={goToDetails} className="bg-white px-4 py-2 rounded-full shadow-sm">
                            Details
                        </button>

                        <button onClick={goToCourses} className="bg-white px-4 py-2 rounded-full shadow-sm">
                            Courses
                        </button>

                        <button onClick={goToQuizzes} className="bg-black text-white px-4 py-2 rounded-full">
                            Quizzes
                        </button>
                        <button
                            onClick={goToNotifications}
                            className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2"
                        >
                            Notifications

                            {hasUnread && (
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            )}
                        </button>
                    </div>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                        <div className="bg-[#f7f7f7] rounded-[2rem] p-6">
                            <h3 className="text-xl font-bold mb-4">1. Select Course</h3>

                            <select
                                value={selectedCourseId}
                                onChange={(e) => loadQuizzes(e.target.value)}
                                className="w-full bg-white border border-gray-200 px-4 py-3 rounded-2xl outline-none"
                            >
                                <option value="">Choose course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>

                            {selectedCourseId && (
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-4">2. Select Quiz</h3>

                                    {quizzes.length === 0 ? (
                                        <p className="text-gray-500">No quizzes for this course.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {quizzes.map((quiz) => (
                                                <div
                                                    key={quiz.id}
                                                    className={
                                                        selectedQuizId === quiz.id
                                                            ? "bg-black text-white rounded-2xl p-4"
                                                            : "bg-white rounded-2xl p-4 shadow-sm"
                                                    }
                                                >
                                                    <div className="flex justify-between items-center gap-3">
                                                        <div>
                                                            <p className="font-semibold">{quiz.title}</p>
                                                            {completedQuizzes[quiz.id] && (
                                                                <p className="text-sm text-green-500 font-semibold">
                                                                    Completed
                                                                </p>
                                                            )}
                                                        </div>

                                                        {role === "INSTRUCTOR" ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => loadQuestions(quiz.id)}
                                                                    className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                                                                >
                                                                    Manage
                                                                </button>

                                                                <button
                                                                    onClick={() => deleteQuiz(quiz.id)}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : completedQuizzes[quiz.id] ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => reviewSavedQuiz(quiz.id)}
                                                                    className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                                                                >
                                                                    Review
                                                                </button>

                                                                <button
                                                                    onClick={() => retakeQuiz(quiz.id)}
                                                                    className="bg-black text-white px-3 py-1 rounded-full text-sm"
                                                                >
                                                                    Retake
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => startQuiz(quiz.id)}
                                                                className="bg-gray-200 text-black px-3 py-1 rounded-full text-sm"
                                                            >
                                                                Start
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {role === "INSTRUCTOR" && selectedCourseId && (
                                <div className="mt-6 bg-white rounded-3xl p-5 shadow-sm">
                                    <h3 className="font-bold mb-3">Create New Quiz</h3>

                                    <input
                                        placeholder="Quiz Title"
                                        value={quizTitle}
                                        onChange={(e) => setQuizTitle(e.target.value)}
                                        className="w-full bg-[#f7f7f7] p-3 mb-3 rounded-2xl border outline-none"
                                    />

                                    <button
                                        onClick={addQuiz}
                                        className="w-full bg-black text-white py-3 rounded-2xl"
                                    >
                                        Add Quiz
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-2 bg-[#f7f7f7] rounded-[2rem] p-6">
                            {role === "INSTRUCTOR" ? (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Quiz Questions</h3>

                                    {!selectedQuizId ? (
                                        <p className="text-gray-500">
                                            Select a quiz to add or view questions.
                                        </p>
                                    ) : (
                                        <>
                                            <div className="bg-white rounded-3xl p-5 shadow-sm mb-5">
                                                <h4 className="font-bold mb-3">Add Question</h4>

                                                <input
                                                    name="question"
                                                    placeholder="Question"
                                                    value={questionData.question}
                                                    onChange={changeQuestion}
                                                    className="w-full bg-[#f7f7f7] p-3 mb-3 rounded-2xl border outline-none"
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        name="optionA"
                                                        placeholder="Option A"
                                                        value={questionData.optionA}
                                                        onChange={changeQuestion}
                                                        className="w-full bg-[#f7f7f7] p-3 rounded-2xl border outline-none"
                                                    />

                                                    <input
                                                        name="optionB"
                                                        placeholder="Option B"
                                                        value={questionData.optionB}
                                                        onChange={changeQuestion}
                                                        className="w-full bg-[#f7f7f7] p-3 rounded-2xl border outline-none"
                                                    />

                                                    <input
                                                        name="optionC"
                                                        placeholder="Option C"
                                                        value={questionData.optionC}
                                                        onChange={changeQuestion}
                                                        className="w-full bg-[#f7f7f7] p-3 rounded-2xl border outline-none"
                                                    />

                                                    <input
                                                        name="optionD"
                                                        placeholder="Option D"
                                                        value={questionData.optionD}
                                                        onChange={changeQuestion}
                                                        className="w-full bg-[#f7f7f7] p-3 rounded-2xl border outline-none"
                                                    />
                                                </div>

                                                <select
                                                    name="correctAnswer"
                                                    value={questionData.correctAnswer}
                                                    onChange={changeQuestion}
                                                    className="w-full bg-[#f7f7f7] p-3 mt-3 mb-3 rounded-2xl border outline-none"
                                                >
                                                    <option value="">Correct Answer</option>
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>

                                                <button
                                                    onClick={addQuestion}
                                                    className="w-full bg-black text-white py-3 rounded-2xl"
                                                >
                                                    Add Question
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {questions.length === 0 ? (
                                                    <p className="text-gray-500">
                                                        No questions added yet.
                                                    </p>
                                                ) : (
                                                    questions.map((question, index) => (
                                                        <div
                                                            key={question.id}
                                                            className="bg-white rounded-3xl p-5 shadow-sm"
                                                        >
                                                            <div className="flex justify-between gap-3">
                                                                <div>
                                                                    <p className="font-bold">
                                                                        Q{index + 1}. {question.question}
                                                                    </p>

                                                                    <p className="text-sm mt-2">A. {question.optionA}</p>
                                                                    <p className="text-sm">B. {question.optionB}</p>
                                                                    <p className="text-sm">C. {question.optionC}</p>
                                                                    <p className="text-sm">D. {question.optionD}</p>

                                                                    <p className="text-sm text-green-600 font-semibold mt-2">
                                                                        Correct Answer: {question.correctAnswer}
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    onClick={() => deleteQuestion(question.id)}
                                                                    className="bg-red-500 text-white px-3 py-1 rounded-full h-fit"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Attempt Quiz</h3>

                                    {!selectedCourseId ? (
                                        <p className="text-gray-500">Select a course first.</p>
                                    ) : !selectedQuizId ? (
                                        <p className="text-gray-500">
                                            Choose a quiz from the left and click Start.
                                        </p>
                                    ) : quizCompleted ? (
                                        <div className="bg-white rounded-3xl p-8 shadow-sm">
                                            <h3 className="text-3xl font-bold mb-3">
                                                Quiz Completed
                                            </h3>

                                            <p className="text-gray-600 mb-5">
                                                Your score is {score ?? quizAttempts[selectedQuizId]?.score} out of {questions.length || quizAttempts[selectedQuizId]?.totalQuestions}.
                                            </p>

                                            <div className="flex gap-3 mb-5">
                                                <button
                                                    onClick={() => setReviewMode(!reviewMode)}
                                                    className="bg-white border px-6 py-3 rounded-2xl"
                                                >
                                                    {reviewMode ? "Hide Review" : "Review Quiz"}
                                                </button>

                                                <button
                                                    onClick={closeCompletedQuiz}
                                                    className="bg-black text-white px-6 py-3 rounded-2xl"
                                                >
                                                    Close Quiz
                                                </button>
                                            </div>

                                            {reviewMode && (
                                                <div className="space-y-4">
                                                    {questions.map((question, index) => {
                                                        const userAnswer = selectedAnswers[question.id];
                                                        const isCorrect = userAnswer === question.correctAnswer;

                                                        return (
                                                            <div
                                                                key={question.id}
                                                                className="bg-[#f7f7f7] rounded-3xl p-5"
                                                            >
                                                                <p className="font-bold mb-3">
                                                                    Q{index + 1}. {question.question}
                                                                </p>

                                                                <p className={isCorrect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                                                    Your Answer: {userAnswer || "Not answered"}
                                                                </p>

                                                                <p className="text-green-600 font-semibold">
                                                                    Correct Answer: {question.correctAnswer}
                                                                </p>

                                                                <p className="mt-2 text-sm text-gray-600">
                                                                    A. {question.optionA}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    B. {question.optionB}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    C. {question.optionC}
                                                                </p>
                                                                <p className="text-sm text-gray-600">
                                                                    D. {question.optionD}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ) : !quizStarted ? (
                                        <p className="text-gray-500">
                                            Click Start to begin the quiz.
                                        </p>
                                    ) : questions.length === 0 ? (
                                        <p className="text-gray-500">
                                            This quiz has no questions yet.
                                        </p>
                                    ) : (
                                        <div className="space-y-4">
                                            {questions.map((question, index) => (
                                                <div
                                                    key={question.id}
                                                    className="bg-white rounded-3xl p-5 shadow-sm"
                                                >
                                                    <p className="font-bold mb-3">
                                                        Q{index + 1}. {question.question}
                                                    </p>

                                                    {["A", "B", "C", "D"].map((option) => (
                                                        <label
                                                            key={option}
                                                            className="block bg-[#f7f7f7] p-3 rounded-2xl mb-2"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={"question-" + question.id}
                                                                value={option}
                                                                checked={selectedAnswers[question.id] === option}
                                                                onChange={(e) =>
                                                                    setSelectedAnswers({
                                                                        ...selectedAnswers,
                                                                        [question.id]: e.target.value,
                                                                    })
                                                                }
                                                                className="mr-2"
                                                            />
                                                            {option}. {question["option" + option]}
                                                        </label>
                                                    ))}
                                                </div>
                                            ))}

                                            <button
                                                onClick={submitQuiz}
                                                className="bg-black text-white px-6 py-3 rounded-2xl"
                                            >
                                                Submit Quiz
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default QuizPage;