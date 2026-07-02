import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentSuccessPage() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("Confirming payment...");

    const authHeaders = () => ({
        Authorization: "Bearer " + localStorage.getItem("token"),
    });

    useEffect(() => {
        const confirmPayment = async () => {
            const params = new URLSearchParams(window.location.search);
            const sessionId = params.get("session_id");

            if (!sessionId) {
                setMessage("Payment session not found.");
                return;
            }

            const res = await fetch(
                "http://localhost:8080/payments/confirm?sessionId=" + sessionId,
                {
                    method: "POST",
                    headers: authHeaders(),
                }
            );

            const text = await res.text();
            setMessage(text);

            setTimeout(() => {
                navigate("/user/courses");
            }, 1500);
        };

        confirmPayment();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#ededed]">
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
                <h1 className="text-3xl font-bold mb-4">Payment Status</h1>
                <p>{message}</p>
            </div>
        </div>
    );
}

export default PaymentSuccessPage;