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
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/details"
                element={
                    <ProtectedRoute>
                        <DetailsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/courses"
                element={
                    <ProtectedRoute>
                        <CoursesPage />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

export default App;