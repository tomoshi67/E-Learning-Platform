import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ children }) {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (!token || !role || !email) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}

export default ProtectedRoute;