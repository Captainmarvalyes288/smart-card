"use client";
import { useState } from "react";
import axios from "axios";

export default function WalletRecharge() {
  const [amount, setAmount] = useState("");
  const [studentId, setStudentId] = useState("");

  const handleRecharge = async () => {
    try {
      const response = await axios.post("/api/createOrder", {
        amount: parseFloat(amount),
        student_id: studentId,
      });

      const options = {
        key: "rzp_test_HgL8mN0VSsIUne",
        amount: response.data.amount * 100,
        currency: "INR",
        order_id: response.data.order_id,
        handler: async function (res) {
          await axios.post("/api/verifyPayment", {
            order_id: response.data.order_id,
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_signature: res.razorpay_signature,
            student_id: studentId,
          });
          alert("Wallet Recharged Successfully!");
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Recharge Wallet</h2>
      <input type="text" placeholder="Student ID" onChange={(e) => setStudentId(e.target.value)} />
      <input type="number" placeholder="Amount" onChange={(e) => setAmount(e.target.value)} />
      <button onClick={handleRecharge}>Recharge</button>
    </div>
  );
}
