"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function StudentWallet({ params }) {
  const { studentId } = params;
  const [student, setStudent] = useState(null);

  useEffect(() => {
    axios.get(`/api/getStudentDetails/${studentId}`).then((res) => setStudent(res.data));
  }, [studentId]);

  return (
    <div>
      <h2>Student Wallet</h2>
      {student ? (
        <div>
          <p>Name: {student.name}</p>
          <p>Wallet Balance: ₹{student.wallet_balance}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
