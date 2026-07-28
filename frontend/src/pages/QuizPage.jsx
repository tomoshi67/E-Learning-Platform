import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, ListChecks, Plus, Trash2, Play, RotateCcw, Eye, Send, CheckCircle2, HelpCircle, Pencil, Sparkles, Upload, Save } from "lucide-react";

function QuizPage() {
    const navigate = useNavigate();
    const role = sessionStorage.getItem("role");

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
    const [hasChatUnread, setHasChatUnread] = useState(false);

    const [questionData, setQuestionData] = useState({
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "",
    });


    const [aiFile, setAiFile] = useState(null);
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState([]);
    const [aiSaving, setAiSaving] = useState(false);

    const authHeaders = () => ({
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem("token"),
    });

    const loadQuizAttempts = async () => {
        if (role !== "USER") {
            return;
        }

        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/quiz-attempts/user/` + encodeURIComponent(email),
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
        if (role === "INSTRUCTOR") {
            const res = await fetch(
                `${API_URL}/courses/instructor/` + encodeURIComponent(sessionStorage.getItem("email")),
                {
                    headers: authHeaders(),
                }
            );

            const data = await res.json();
            const email = sessionStorage.getItem("email");
            setCourses(data.filter((course) => course.instructorEmail === email));
            return;
        }


        const email = sessionStorage.getItem("email");

        const enrollRes = await fetch(
            `${API_URL}/enrollments/user/` + encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const enrollmentData = await enrollRes.json();

        const courseRes = await fetch(`${API_URL}/courses/all`, {
            headers: authHeaders(),
        });

        const allCourses = await courseRes.json();

        const enrolledCourses = allCourses.filter((course) =>
            enrollmentData.some((enrollment) => enrollment.courseId === course.id)
        );

        setCourses(enrolledCourses);
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
        setAiGeneratedQuestions([]);
        setAiFile(null);

        if (!courseId) {
            setQuizzes([]);
            return;
        }

        const res = await fetch(`${API_URL}/quizzes/course/` + courseId, {
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

        const res = await fetch(`${API_URL}/quizzes/add`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                courseId: selectedCourseId,
                title: quizTitle,
                instructorEmail: sessionStorage.getItem("email"),
            }),
        });

        const newQuiz = await res.json();

        setQuizTitle("");
        await loadQuizzes(selectedCourseId);

        await loadQuestions(newQuiz.id);
    };

    const deleteQuiz = async (quizId) => {
        await fetch(`${API_URL}/quizzes/delete/` + quizId, {
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
        setAiGeneratedQuestions([]);
        setAiFile(null);

        if (!quizId) {
            setQuestions([]);
            return;
        }

        const res = await fetch(`${API_URL}/quiz-questions/quiz/` + quizId, {
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

        await fetch(`${API_URL}/quiz-questions/add`, {
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
        await fetch(`${API_URL}/quiz-questions/delete/` + questionId, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await loadQuestions(selectedQuizId);
    };


    const generateFromFile = async () => {
        if (!selectedQuizId) {
            alert("Select a quiz first");
            return;
        }

        if (!aiFile) {
            alert("Choose a photo or PDF first");
            return;
        }

        setAiGenerating(true);

        try {
            const formData = new FormData();
            formData.append("file", aiFile);

            const res = await fetch(`${API_URL}/quizzes/generate-ai`, {
                method: "POST",
                headers: authHeaders(),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("AI generation failed: " + errText);
                return;
            }

            const data = await res.json();

            if (data.length === 0) {
                alert("No questions could be extracted from this file. Try a clearer photo/PDF.");
                return;
            }

            setAiGeneratedQuestions(data);
        } catch (err) {
            alert("AI generation failed: " + err.message);
        } finally {
            setAiGenerating(false);
        }
    };

    const updateGeneratedQuestion = (index, field, value) => {
        const updated = [...aiGeneratedQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setAiGeneratedQuestions(updated);
    };

    const removeGeneratedQuestion = (index) => {
        setAiGeneratedQuestions(aiGeneratedQuestions.filter((_, i) => i !== index));
    };

    const saveAllGeneratedQuestions = async () => {
        if (!selectedQuizId) {
            alert("Select a quiz first");
            return;
        }

        if (aiGeneratedQuestions.length === 0) {
            return;
        }

        setAiSaving(true);

        try {
            const payload = aiGeneratedQuestions.map((q) => ({
                ...q,
                quizId: selectedQuizId,
            }));

            const res = await fetch(`${API_URL}/quiz-questions/add-bulk`, {
                method: "POST",
                headers: authJsonHeaders(),
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errText = await res.text();
                alert("Saving questions failed: " + errText);
                return;
            }

            alert(aiGeneratedQuestions.length + " questions saved successfully");
            setAiGeneratedQuestions([]);
            setAiFile(null);
            await loadQuestions(selectedQuizId);
        } finally {
            setAiSaving(false);
        }
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

        await fetch(`${API_URL}/quiz-attempts/save`, {
            method: "POST",
            headers: authJsonHeaders(),
            body: JSON.stringify({
                userEmail: sessionStorage.getItem("email"),
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

            if (attempt.answers) {
                try {
                    const parsedAnswers = typeof attempt.answers === "string"
                        ? JSON.parse(attempt.answers)
                        : attempt.answers;
                    setSelectedAnswers(parsedAnswers || {});
                } catch {
                    setSelectedAnswers({});
                }
            } else {
                setSelectedAnswers({});
            }
        }

        setQuizStarted(false);
        setQuizCompleted(true);
        setReviewMode(true);
    };

    const retakeQuiz = async (quizId) => {
        await startQuiz(quizId);
    };
    const loadUnread = async () => {
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
    const loadChatUnread = async () => {
        const email = sessionStorage.getItem("email");

        const res = await fetch(
            `${API_URL}/chat/has-unread/` +
            encodeURIComponent(email),
            {
                headers: authHeaders(),
            }
        );

        const data = await res.json();
        setHasChatUnread(data);
    };
    useEffect(() => {
        const initialize = async () => {
            await loadCourses();
            await loadUnread();
            await loadQuizAttempts();
            await loadChatUnread();
        };

        initialize();
    }, []);

    return (
        <DashboardLayout activePage="Quizzes" hasUnread={hasUnread} hasChatUnread={hasChatUnread}>
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6 h-fit">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Step 1</p>
                            <h3 className="text-xl font-black text-gray-100">Select Course</h3>
                        </div>
                    </div>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => loadQuizzes(e.target.value)}
                        className="w-full bg-[#141822] border border-[#232838] text-gray-100 px-4 py-3 rounded-2xl outline-none focus:border-indigo-500 transition"
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
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center">
                                    <ListChecks size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Step 2</p>
                                    <h3 className="text-lg font-black text-gray-100">Select Quiz</h3>
                                </div>
                            </div>

                            {quizzes.length === 0 ? (
                                <div className="rounded-3xl bg-[#141822] border border-[#232838] p-6 text-gray-500 text-center">No quizzes for this course.</div>
                            ) : (
                                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                    {quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className={
                                                selectedQuizId === quiz.id
                                                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-3xl p-4 shadow-lg shadow-indigo-500/25"
                                                    : "bg-[#141822] hover:bg-[#1A1F2B] border border-[#232838] rounded-3xl p-4 transition"
                                            }
                                        >
                                            <div className="flex justify-between items-center gap-3">
                                                <div>
                                                    <p className="font-black">{quiz.title}</p>
                                                    {completedQuizzes[quiz.id] && (
                                                        <p className="text-xs text-green-400 font-black mt-1">Completed</p>
                                                    )}
                                                </div>

                                                {role === "INSTRUCTOR" ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => loadQuestions(quiz.id)} className="bg-white/10 hover:bg-white/20 text-current px-3 py-2 rounded-2xl text-sm font-bold hover:scale-105 transition">
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button onClick={() => deleteQuiz(quiz.id)} className="bg-red-500 text-white px-3 py-2 rounded-2xl text-sm font-bold hover:scale-105 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : completedQuizzes[quiz.id] ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => reviewSavedQuiz(quiz.id)} className="bg-white/10 hover:bg-white/20 text-current px-3 py-2 rounded-2xl text-sm font-bold">
                                                            <Eye size={16} />
                                                        </button>

                                                        <button onClick={() => retakeQuiz(quiz.id)} className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-2xl text-sm font-bold">
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => startQuiz(quiz.id)} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-current px-4 py-2 rounded-2xl text-sm font-black hover:scale-105 transition">
                                                        <Play size={16} />
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
                        <div className="mt-6 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-3xl p-5 border border-indigo-500/20">
                            <h3 className="font-black mb-3 text-gray-100">Create New Quiz</h3>

                            <input
                                placeholder="Quiz Title"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                className="w-full bg-[#141822] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition"
                            />

                            <button onClick={addQuiz} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white py-3 rounded-2xl font-black transition">
                                <Plus size={18} />
                                Add Quiz
                            </button>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-2 rounded-[2rem] bg-[#0F131C] border border-[#232838] shadow-sm p-6">
                    {role === "INSTRUCTOR" ? (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Question Bank</p>
                                    <h3 className="text-2xl font-black text-gray-100">Quiz Questions</h3>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-[#141822] border border-[#232838] p-10 text-center text-gray-500">
                                Click the pencil icon on a quiz, or create a new one, to manage its questions in a popup.
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-5">
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Student Quiz</p>
                                <h3 className="text-2xl font-black text-gray-100">Attempt Quiz</h3>
                            </div>

                            {!selectedCourseId ? (
                                <div className="rounded-3xl bg-[#141822] border border-[#232838] p-10 text-center text-gray-500">Select a course first.</div>
                            ) : !selectedQuizId ? (
                                <div className="rounded-3xl bg-[#141822] border border-[#232838] p-10 text-center text-gray-500">Choose a quiz from the left and click Start.</div>
                            ) : quizCompleted ? (
                                <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl p-8 border border-green-500/20">
                                    <CheckCircle2 className="text-green-400 mb-3" size={40} />
                                    <h3 className="text-3xl font-black mb-3 text-gray-100">Quiz Completed</h3>
                                    <p className="text-gray-400 mb-5">Your score is {score ?? quizAttempts[selectedQuizId]?.score} out of {questions.length || quizAttempts[selectedQuizId]?.totalQuestions}.</p>

                                    <div className="flex gap-3 mb-5">
                                        <button onClick={() => setReviewMode(!reviewMode)} className="inline-flex items-center gap-2 bg-[#141822] border border-[#232838] text-gray-200 px-6 py-3 rounded-2xl font-bold hover:bg-[#1A1F2B] transition">
                                            <Eye size={18} />
                                            {reviewMode ? "Hide Review" : "Review Quiz"}
                                        </button>

                                        <button onClick={closeCompletedQuiz} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition">
                                            Close Quiz
                                        </button>
                                    </div>

                                    {reviewMode && (
                                        <div className="space-y-4">
                                            {questions.map((question, index) => {
                                                const userAnswer = selectedAnswers[question.id];
                                                const hasSavedAnswer = Boolean(userAnswer);
                                                const isCorrect = userAnswer === question.correctAnswer;

                                                return (
                                                    <div key={question.id} className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                                        <p className="font-black mb-3 text-gray-100">Q{index + 1}. {question.question}</p>
                                                        {hasSavedAnswer ? (
                                                            <p className={isCorrect ? "text-green-400 font-black" : "text-red-400 font-black"}>
                                                                Your Answer: {userAnswer}
                                                            </p>
                                                        ) : (
                                                            <p className="text-gray-500 font-semibold">
                                                                Previous selected answer was not saved by the backend.
                                                            </p>
                                                        )}
                                                        <p className="text-green-400 font-black">Correct Answer: {question.correctAnswer}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : !quizStarted ? (
                                <div className="rounded-3xl bg-[#141822] border border-[#232838] p-10 text-center text-gray-500">Click Start to begin the quiz.</div>
                            ) : questions.length === 0 ? (
                                <div className="rounded-3xl bg-[#141822] border border-[#232838] p-10 text-center text-gray-500">This quiz has no questions yet.</div>
                            ) : (
                                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="bg-[#141822] border border-[#232838] rounded-3xl p-5">
                                            <p className="font-black mb-3 text-gray-100">Q{index + 1}. {question.question}</p>

                                            {["A", "B", "C", "D"].map((option) => (
                                                <label key={option} className="block bg-[#1A1F2B] hover:bg-[#20263A] text-gray-200 p-3 rounded-2xl mb-2 cursor-pointer transition">
                                                    <input type="radio" name={"question-" + question.id} value={option} checked={selectedAnswers[question.id] === option} onChange={(e) => setSelectedAnswers({ ...selectedAnswers, [question.id]: e.target.value })} className="mr-2" />
                                                    {option}. {question["option" + option]}
                                                </label>
                                            ))}
                                        </div>
                                    ))}

                                    <button onClick={submitQuiz} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white px-6 py-3 rounded-2xl font-black transition">
                                        <Send size={18} />
                                        Submit Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {selectedQuizId && role === "INSTRUCTOR" && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0F131C] border border-[#232838] rounded-[2rem] p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-500 uppercase">Question Bank</p>
                                <h3 className="text-2xl font-black text-gray-100">Quiz Questions</h3>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedQuizId("");
                                    setQuestions([]);
                                }}
                                className="bg-[#1A1F2B] hover:bg-[#232838] text-gray-300 w-10 h-10 rounded-full flex items-center justify-center transition"
                                title="Close"
                            >
                                &times;
                            </button>
                        </div>

                        {/* ---------- AI Quiz Generator ---------- */}
                        <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-3xl p-5 border border-indigo-500/20 mb-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={20} className="text-indigo-400" />
                                <h4 className="font-black text-gray-100">Generate Questions with AI</h4>
                            </div>

                            <p className="text-sm text-gray-500 mb-3">
                                Upload a photo or PDF of a question paper and AI will extract the questions for you to review.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => setAiFile(e.target.files[0])}
                                    className="flex-1 bg-[#141822] border border-[#232838] text-gray-300 p-3 rounded-2xl outline-none focus:border-indigo-500 text-sm transition"
                                />

                                <button
                                    onClick={generateFromFile}
                                    disabled={aiGenerating}
                                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-black transition"
                                >
                                    <Upload size={18} />
                                    {aiGenerating ? "Generating..." : "Generate"}
                                </button>
                            </div>

                            {aiGeneratedQuestions.length > 0 && (
                                <div className="mt-5 space-y-4">
                                    <p className="text-sm font-bold text-gray-400">
                                        Review and edit before saving ({aiGeneratedQuestions.length} question{aiGeneratedQuestions.length > 1 ? "s" : ""}):
                                    </p>

                                    {aiGeneratedQuestions.map((q, index) => (
                                        <div key={index} className="bg-[#141822] rounded-3xl p-4 border border-[#232838]">
                                            <div className="flex justify-between items-start gap-3 mb-3">
                                                <input
                                                    value={q.question}
                                                    onChange={(e) => updateGeneratedQuestion(index, "question", e.target.value)}
                                                    className="flex-1 bg-[#1A1F2B] border border-[#232838] text-gray-100 p-3 rounded-2xl outline-none focus:border-indigo-500 font-bold transition"
                                                />
                                                <button
                                                    onClick={() => removeGeneratedQuestion(index)}
                                                    className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-2xl transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                <input value={q.optionA} onChange={(e) => updateGeneratedQuestion(index, "optionA", e.target.value)} className="bg-[#1A1F2B] border border-[#232838] text-gray-200 p-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition" />
                                                <input value={q.optionB} onChange={(e) => updateGeneratedQuestion(index, "optionB", e.target.value)} className="bg-[#1A1F2B] border border-[#232838] text-gray-200 p-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition" />
                                                <input value={q.optionC} onChange={(e) => updateGeneratedQuestion(index, "optionC", e.target.value)} className="bg-[#1A1F2B] border border-[#232838] text-gray-200 p-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition" />
                                                <input value={q.optionD} onChange={(e) => updateGeneratedQuestion(index, "optionD", e.target.value)} className="bg-[#1A1F2B] border border-[#232838] text-gray-200 p-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition" />
                                            </div>

                                            <select
                                                value={q.correctAnswer}
                                                onChange={(e) => updateGeneratedQuestion(index, "correctAnswer", e.target.value)}
                                                className="bg-[#1A1F2B] border border-[#232838] text-gray-200 p-2 rounded-2xl outline-none focus:border-indigo-500 text-sm transition"
                                            >
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                    ))}

                                    <button
                                        onClick={saveAllGeneratedQuestions}
                                        disabled={aiSaving}
                                        className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 text-white py-3 rounded-2xl font-black transition"
                                    >
                                        <Save size={18} />
                                        {aiSaving ? "Saving..." : `Save All ${aiGeneratedQuestions.length} Questions`}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-[#141822] rounded-3xl p-5 border border-[#232838] mb-5">
                            <h4 className="font-black mb-3 text-gray-100">Add Question</h4>

                            <input name="question" placeholder="Question" value={questionData.question} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input name="optionA" placeholder="Option A" value={questionData.optionA} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 rounded-2xl outline-none focus:border-indigo-500 transition" />
                                <input name="optionB" placeholder="Option B" value={questionData.optionB} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 rounded-2xl outline-none focus:border-indigo-500 transition" />
                                <input name="optionC" placeholder="Option C" value={questionData.optionC} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 rounded-2xl outline-none focus:border-indigo-500 transition" />
                                <input name="optionD" placeholder="Option D" value={questionData.optionD} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 placeholder:text-gray-600 p-3 rounded-2xl outline-none focus:border-indigo-500 transition" />
                            </div>

                            <select name="correctAnswer" value={questionData.correctAnswer} onChange={changeQuestion} className="w-full bg-[#1A1F2B] border border-[#232838] text-gray-100 p-3 mt-3 mb-3 rounded-2xl outline-none focus:border-indigo-500 transition">
                                <option value="">Correct Answer</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>

                            <button onClick={addQuestion} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white py-3 rounded-2xl font-black transition">
                                <Plus size={18} />
                                Add Question
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                            {questions.length === 0 ? (
                                <p className="text-gray-500">No questions added yet.</p>
                            ) : (
                                questions.map((question, index) => (
                                    <div key={question.id} className="bg-[#141822] hover:bg-[#1A1F2B] border border-[#232838] rounded-3xl p-5 transition">
                                        <div className="flex justify-between gap-3">
                                            <div>
                                                <p className="font-black text-gray-100">Q{index + 1}. {question.question}</p>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-400">
                                                    <p>A. {question.optionA}</p>
                                                    <p>B. {question.optionB}</p>
                                                    <p>C. {question.optionC}</p>
                                                    <p>D. {question.optionD}</p>
                                                </div>
                                                <p className="text-sm text-green-400 font-black mt-3">Correct Answer: {question.correctAnswer}</p>
                                            </div>

                                            <button onClick={() => deleteQuestion(question.id)} className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 rounded-2xl h-fit transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default QuizPage;