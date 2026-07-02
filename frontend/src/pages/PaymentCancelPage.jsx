import { useNavigate } from "react-router-dom";

function PaymentCancelPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#ededed]">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <h1 className="text-3xl font-bold mb-4">Payment Cancelled</h1>
                <button
                    onClick={() => navigate("/user/courses")}
                    className="bg-black text-white px-6 py-3 rounded-2xl"
                >
                    Back to Courses
                </button>
            </div>
        </div>
    );
}

export default PaymentCancelPage;