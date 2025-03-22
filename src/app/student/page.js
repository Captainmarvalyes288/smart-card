'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const API_URL = 'http://127.0.0.1:8000';
const STUDENT_ID = 'STU001'; // Replace with actual student ID from login/context

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student data
        const studentResponse = await fetch(`${API_URL}/student/${STUDENT_ID}`);
        if (!studentResponse.ok) throw new Error('Failed to fetch student data');
        const studentInfo = await studentResponse.json();
        setStudentData(studentInfo);

        // Fetch student QR code
        const qrResponse = await fetch(`${API_URL}/get_student_qr/${STUDENT_ID}`);
        if (!qrResponse.ok) throw new Error('Failed to fetch QR code');
        const qrData = await qrResponse.json();
        setQrCode(qrData.qr_code);

        // Fetch transactions
        const transactionsResponse = await fetch(`${API_URL}/student/transactions/${STUDENT_ID}`);
        if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions');
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `student-qr-${STUDENT_ID}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Student Dashboard</h1>

      {/* Student Info */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Student Information</h2>
        <p className="text-lg mb-2">Name: {studentData?.name}</p>
        <p className="text-lg mb-4">ID: {studentData?.student_id}</p>
        <p className="text-2xl font-bold text-green-600">
          Balance: ₹{studentData?.balance}
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Payment QR Code</h2>
        <div className="flex flex-col items-center">
          {qrCode && (
            <div className="cursor-pointer hover:opacity-90 transition-opacity" onClick={downloadQRCode}>
              <img
                src={qrCode}
                alt="Student QR Code"
                className="w-64 h-64 border-2 border-gray-200 rounded-lg"
              />
            </div>
          )}
          <p className="text-center mt-4 text-gray-600">
            Click on the QR code to download it
          </p>
          <button
            onClick={downloadQRCode}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Download QR Code
          </button>
        </div>
        <p className="text-center mt-4 text-gray-600">
          Show this QR code to vendors for payments
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Vendor</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(transaction._id.toString()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{transaction.vendor_id}</td>
                  <td className="px-4 py-2">₹{transaction.amount}</td>
                  <td className="px-4 py-2">{transaction.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 