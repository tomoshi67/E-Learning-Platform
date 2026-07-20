import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../api";
import DashboardLayout from "../components/DashboardLayout";
import { BookOpen, ListChecks, Plus, Trash2, Play, RotateCcw, Eye, Send, CheckCircle2, HelpCircle, Pencil, Sparkles, Upload, Save } from "lucide-react";

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
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const authJsonHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    const loadQuizAttempts = async () => {
        if (role !== "USER") {
            return;
        }

        const email = localStorage.getItem("email");

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
        let url = `${API_URL}/courses/all`;

        if (role === "INSTRUCTOR") {
            url =
                `${API_URL}/courses/instructor/` +
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

        await fetch(`${API_URL}/quizzes/add`, {
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
                body: formData,
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
    const loadChatUnread = async () => {
        const email = localStorage.getItem("email");

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
                <div className="rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6 h-fit">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
                            <BookOpen size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Step 1</p>
                            <h3 className="text-xl font-black">Select Course</h3>
                        </div>
                    </div>

                    <select
                        value={selectedCourseId}
                        onChange={(e) => loadQuizzes(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl outline-none focus:border-black transition"
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
                                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center">
                                    <ListChecks size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Step 2</p>
                                    <h3 className="text-lg font-black">Select Quiz</h3>
                                </div>
                            </div>

                            {quizzes.length === 0 ? (
                                <div className="rounded-3xl bg-gray-50 p-6 text-gray-500 text-center">No quizzes for this course.</div>
                            ) : (
                                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                    {quizzes.map((quiz) => (
                                        <div
                                            key={quiz.id}
                                            className={
                                                selectedQuizId === quiz.id
                                                    ? "bg-black text-white rounded-3xl p-4 shadow-lg"
                                                    : "bg-gray-50 hover:bg-gray-100 rounded-3xl p-4 transition"
                                            }
                                        >
                                            <div className="flex justify-between items-center gap-3">
                                                <div>
                                                    <p className="font-black">{quiz.title}</p>
                                                    {completedQuizzes[quiz.id] && (
                                                        <p className="text-xs text-green-500 font-black mt-1">Completed</p>
                                                    )}
                                                </div>

                                                {role === "INSTRUCTOR" ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => loadQuestions(quiz.id)} className="bg-white text-black px-3 py-2 rounded-2xl text-sm font-bold hover:scale-105 transition">
                                                            <Pencil size={16} />
                                                        </button>

                                                        <button onClick={() => deleteQuiz(quiz.id)} className="bg-red-500 text-white px-3 py-2 rounded-2xl text-sm font-bold hover:scale-105 transition">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ) : completedQuizzes[quiz.id] ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => reviewSavedQuiz(quiz.id)} className="bg-white text-black px-3 py-2 rounded-2xl text-sm font-bold">
                                                            <Eye size={16} />
                                                        </button>

                                                        <button onClick={() => retakeQuiz(quiz.id)} className="bg-purple-600 text-white px-3 py-2 rounded-2xl text-sm font-bold">
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => startQuiz(quiz.id)} className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black hover:scale-105 transition">
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
                        <div className="mt-6 bg-gradient-to-br from-purple-50 to-white rounded-3xl p-5 border border-purple-100">
                            <h3 className="font-black mb-3">Create New Quiz</h3>

                            <input
                                placeholder="Quiz Title"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                className="w-full bg-white p-3 mb-3 rounded-2xl border border-gray-200 outline-none focus:border-black"
                            />

                            <button onClick={addQuiz} className="w-full inline-flex justify-center items-center gap-2 bg-black hover:bg-gray-800 text-white py-3 rounded-2xl font-black transition">
                                <Plus size={18} />
                                Add Quiz
                            </button>
                        </div>
                    )}
                </div>

                <div className="xl:col-span-2 rounded-[2rem] bg-white border border-gray-100 shadow-sm p-6">
                    {role === "INSTRUCTOR" ? (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Question Bank</p>
                                    <h3 className="text-2xl font-black">Quiz Questions</h3>
                                </div>
                            </div>

                            {!selectedQuizId ? (
                                <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">Select a quiz to add or view questions.</div>
                            ) : (
                                <>
                                    {/* ---------- AI Quiz Generator ---------- */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-5 border border-indigo-100 mb-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={20} className="text-indigo-600" />
                                            <h4 className="font-black">Generate Questions with AI</h4>
                                        </div>

                                        <p className="text-sm text-gray-500 mb-3">
                                            Upload a photo or PDF of a question paper and AI will extract the questions for you to review.
                                        </p>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={(e) => setAiFile(e.target.files[0])}
                                                className="flex-1 bg-white p-3 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm"
                                            />

                                            <button
                                                onClick={generateFromFile}
                                                disabled={aiGenerating}
                                                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl font-black transition"
                                            >
                                                <Upload size={18} />
                                                {aiGenerating ? "Generating..." : "Generate"}
                                            </button>
                                        </div>

                                        {aiGeneratedQuestions.length > 0 && (
                                            <div className="mt-5 space-y-4">
                                                <p className="text-sm font-bold text-gray-600">
                                                    Review and edit before saving ({aiGeneratedQuestions.length} question{aiGeneratedQuestions.length > 1 ? "s" : ""}):
                                                </p>

                                                {aiGeneratedQuestions.map((q, index) => (
                                                    <div key={index} className="bg-white rounded-3xl p-4 border border-gray-100">
                                                        <div className="flex justify-between items-start gap-3 mb-3">
                                                            <input
                                                                value={q.question}
                                                                onChange={(e) => updateGeneratedQuestion(index, "question", e.target.value)}
                                                                className="flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-200 outline-none focus:border-black font-bold"
                                                            />
                                                            <button
                                                                onClick={() => removeGeneratedQuestion(index)}
                                                                className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-2xl transition"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                                            <input value={q.optionA} onChange={(e) => updateGeneratedQuestion(index, "optionA", e.target.value)} className="bg-gray-50 p-2 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm" />
                                                            <input value={q.optionB} onChange={(e) => updateGeneratedQuestion(index, "optionB", e.target.value)} className="bg-gray-50 p-2 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm" />
                                                            <input value={q.optionC} onChange={(e) => updateGeneratedQuestion(index, "optionC", e.target.value)} className="bg-gray-50 p-2 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm" />
                                                            <input value={q.optionD} onChange={(e) => updateGeneratedQuestion(index, "optionD", e.target.value)} className="bg-gray-50 p-2 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm" />
                                                        </div>

                                                        <select
                                                            value={q.correctAnswer}
                                                            onChange={(e) => updateGeneratedQuestion(index, "correctAnswer", e.target.value)}
                                                            className="bg-gray-50 p-2 rounded-2xl border border-gray-200 outline-none focus:border-black text-sm"
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
                                                    className="w-full inline-flex justify-center items-center gap-2 bg-black hover:bg-gray-800 disabled:opacity-50 text-white py-3 rounded-2xl font-black transition"
                                                >
                                                    <Save size={18} />
                                                    {aiSaving ? "Saving..." : `Save All ${aiGeneratedQuestions.length} Questions`}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-5 border border-gray-100 mb-5">
                                        <h4 className="font-black mb-3">Add Question</h4>

                                        <input name="question" placeholder="Question" value={questionData.question} onChange={changeQuestion} className="w-full bg-white p-3 mb-3 rounded-2xl border border-gray-200 outline-none focus:border-black" />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input name="optionA" placeholder="Option A" value={questionData.optionA} onChange={changeQuestion} className="w-full bg-white p-3 rounded-2xl border border-gray-200 outline-none focus:border-black" />
                                            <input name="optionB" placeholder="Option B" value={questionData.optionB} onChange={changeQuestion} className="w-full bg-white p-3 rounded-2xl border border-gray-200 outline-none focus:border-black" />
                                            <input name="optionC" placeholder="Option C" value={questionData.optionC} onChange={changeQuestion} className="w-full bg-white p-3 rounded-2xl border border-gray-200 outline-none focus:border-black" />
                                            <input name="optionD" placeholder="Option D" value={questionData.optionD} onChange={changeQuestion} className="w-full bg-white p-3 rounded-2xl border border-gray-200 outline-none focus:border-black" />
                                        </div>

                                        <select name="correctAnswer" value={questionData.correctAnswer} onChange={changeQuestion} className="w-full bg-white p-3 mt-3 mb-3 rounded-2xl border border-gray-200 outline-none focus:border-black">
                                            <option value="">Correct Answer</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>

                                        <button onClick={addQuestion} className="w-full inline-flex justify-center items-center gap-2 bg-black text-white py-3 rounded-2xl font-black hover:bg-gray-800 transition">
                                            <Plus size={18} />
                                            Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                                        {questions.length === 0 ? (
                                            <p className="text-gray-500">No questions added yet.</p>
                                        ) : (
                                            questions.map((question, index) => (
                                                <div key={question.id} className="bg-gray-50 hover:bg-gray-100 rounded-3xl p-5 transition">
                                                    <div className="flex justify-between gap-3">
                                                        <div>
                                                            <p className="font-black">Q{index + 1}. {question.question}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">
                                                                <p>A. {question.optionA}</p>
                                                                <p>B. {question.optionB}</p>
                                                                <p>C. {question.optionC}</p>
                                                                <p>D. {question.optionD}</p>
                                                            </div>
                                                            <p className="text-sm text-green-600 font-black mt-3">Correct Answer: {question.correctAnswer}</p>
                                                        </div>

                                                        <button onClick={() => deleteQuestion(question.id)} className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-2 rounded-2xl h-fit transition">
                                                            <Trash2 size={16} />
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
                            <div className="mb-5">
                                <p className="text-xs font-bold tracking-[0.25em] text-gray-400 uppercase">Student Quiz</p>
                                <h3 className="text-2xl font-black">Attempt Quiz</h3>
                            </div>

                            {!selectedCourseId ? (
                                <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">Select a course first.</div>
                            ) : !selectedQuizId ? (
                                <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">Choose a quiz from the left and click Start.</div>
                            ) : quizCompleted ? (
                                <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 border border-green-100">
                                    <CheckCircle2 className="text-green-600 mb-3" size={40} />
                                    <h3 className="text-3xl font-black mb-3">Quiz Completed</h3>
                                    <p className="text-gray-600 mb-5">Your score is {score ?? quizAttempts[selectedQuizId]?.score} out of {questions.length || quizAttempts[selectedQuizId]?.totalQuestions}.</p>

                                    <div className="flex gap-3 mb-5">
                                        <button onClick={() => setReviewMode(!reviewMode)} className="inline-flex items-center gap-2 bg-white border px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 transition">
                                            <Eye size={18} />
                                            {reviewMode ? "Hide Review" : "Review Quiz"}
                                        </button>

                                        <button onClick={closeCompletedQuiz} className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition">
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
                                                    <div key={question.id} className="bg-white rounded-3xl p-5">
                                                        <p className="font-black mb-3">Q{index + 1}. {question.question}</p>
                                                        {hasSavedAnswer ? (
                                                            <p className={isCorrect ? "text-green-600 font-black" : "text-red-600 font-black"}>
                                                                Your Answer: {userAnswer}
                                                            </p>
                                                        ) : (
                                                            <p className="text-gray-500 font-semibold">
                                                                Previous selected answer was not saved by the backend.
                                                            </p>
                                                        )}
                                                        <p className="text-green-600 font-black">Correct Answer: {question.correctAnswer}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : !quizStarted ? (
                                <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">Click Start to begin the quiz.</div>
                            ) : questions.length === 0 ? (
                                <div className="rounded-3xl bg-gray-50 p-10 text-center text-gray-500">This quiz has no questions yet.</div>
                            ) : (
                                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                                    {questions.map((question, index) => (
                                        <div key={question.id} className="bg-gray-50 rounded-3xl p-5">
                                            <p className="font-black mb-3">Q{index + 1}. {question.question}</p>

                                            {["A", "B", "C", "D"].map((option) => (
                                                <label key={option} className="block bg-white hover:bg-gray-100 p-3 rounded-2xl mb-2 cursor-pointer transition">
                                                    <input type="radio" name={"question-" + question.id} value={option} checked={selectedAnswers[question.id] === option} onChange={(e) => setSelectedAnswers({ ...selectedAnswers, [question.id]: e.target.value })} className="mr-2" />
                                                    {option}. {question["option" + option]}
                                                </label>
                                            ))}
                                        </div>
                                    ))}

                                    <button onClick={submitQuiz} className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-2xl font-black transition">
                                        <Send size={18} />
                                        Submit Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}

export default QuizPage;