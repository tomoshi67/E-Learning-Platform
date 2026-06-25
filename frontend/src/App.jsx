import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import DetailsPage from "./pages/DetailsPage";
import CoursesPage from "./pages/CoursesPage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

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
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <DetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;