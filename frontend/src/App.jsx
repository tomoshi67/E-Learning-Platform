import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import DetailsPage from "./pages/DetailsPage";
import CoursesPage from "./pages/CoursesPage";
import QuizPage from "./pages/QuizPage";
import NotificationPage from "./pages/NotificationPage";
import ChatPage from "./pages/ChatPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/user/profile"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/details"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <DetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/user/courses"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <CoursesPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/quizzes"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <QuizPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/notifications"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <NotificationPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/user/chat"
                element={
                    <ProtectedRoute allowedRoles={["USER"]}>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/instructor/profile"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/instructor/details"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <DetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/instructor/courses"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <CoursesPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/instructor/quizzes"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <QuizPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/instructor/notifications"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <NotificationPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/instructor/chat"
                element={
                    <ProtectedRoute allowedRoles={["INSTRUCTOR"]}>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <DetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/payment-cancel" element={<PaymentCancelPage />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;