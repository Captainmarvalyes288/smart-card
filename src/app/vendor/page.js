'use client';
import { useState, useEffect } from 'react';
import QrCodeScanner from '../components/QrCodeScanner';
import QRUploader from '../components/QRUploader';
import Image from 'next/image';
import { Html5Qrcode } from 'html5-qrcode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const VENDOR_ID = 'VEN001'; // This should be dynamic based on vendor login

export default function VendorDashboard() {
  const [mode, setMode] = useState('select'); // 'select', 'scan', 'upload', 'payment'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [description, setDescription] = useState('');
  const [vendorBalance, setVendorBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch vendor data and transactions when component mounts
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const [vendorResponse, transactionsResponse] = await Promise.all([
        fetch(`${API_URL}/vendor/${VENDOR_ID}`),
        fetch(`${API_URL}/vendor/transactions/${VENDOR_ID}`)
      ]);

      if (!vendorResponse.ok || !transactionsResponse.ok) {
        throw new Error('Failed to fetch vendor data');
      }

      const vendorData = await vendorResponse.json();
      const transactionsData = await transactionsResponse.json();

      setVendorBalance(vendorData.balance);
      setTransactions(transactionsData.transactions);
    } catch (err) {
      setError('Failed to fetch vendor data: ' + err.message);
    }
  };

  const handleQRData = async (qrData) => {
    try {
      console.log('QR Data received:', qrData); // Debug log
      const response = await fetch(`${API_URL}/student/${qrData.student_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch student data');
      }

      const data = await response.json();
      setStudentData(data);
      setMode('payment');
      setError('');
    } catch (err) {
      setError('Failed to fetch student data: ' + err.message);
      setMode('select');
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      const response = await fetch(`${API_URL}/process_student_payment`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentData.student_id,
          vendor_id: VENDOR_ID,
          amount: amount,
          description: description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process payment');
      }

      const result = await response.json();
      setSuccess(`Payment processed successfully! Student's new balance: ₹${result.student_balance}`);
      setVendorBalance(result.vendor_balance);
      await fetchVendorData();
      setStudentData(null);
      setPaymentAmount('');
      setDescription('');
      setMode('select');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create a temporary div for the scanner
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-qr-reader';
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const scanner = new Html5Qrcode('temp-qr-reader');
      
      try {
        const decodedText = await scanner.scanFile(file, true);
        await handleQRData(JSON.parse(decodedText));
      } finally {
        // Clean up
        await scanner.clear();
        document.body.removeChild(tempDiv);
      }
    } catch (err) {
      setError('Error reading QR code from file: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Dashboard</h2>
          <div className="text-lg font-semibold text-gray-700 mb-4">
            Current Balance: ₹{vendorBalance.toFixed(2)}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {mode === 'select' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('scan')}
                className="bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 flex flex-col items-center justify-center space-y-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Scan QR Code</span>
                <span className="text-sm opacity-75">Use camera to scan</span>
              </button>

              <button
                onClick={() => setMode('upload')}
                className="bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 flex flex-col items-center justify-center space-y-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload QR Code</span>
                <span className="text-sm opacity-75">Upload from device</span>
              </button>
            </div>
          )}

          {mode === 'scan' && (
            <div>
              <button
                onClick={() => setMode('select')}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <div className="max-w-sm mx-auto">
                <QrCodeScanner
                  onScanSuccess={handleQRData}
                  onError={setError}
                  scanMode="student"
                  scanOnly={true}
                />
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div>
              <button
                onClick={() => setMode('select')}
                className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <div className="max-w-sm mx-auto">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="qr-file-input"
                  />
                  <label
                    htmlFor="qr-file-input"
                    className="cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Click to upload QR code
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {mode === 'payment' && studentData && (
            <div>
              <button
                onClick={() => {
                  setMode('select');
                  setStudentData(null);
                }}
                className="mb-4 text-blue-600 hover:text-blue-800"
              >
                ← Back
              </button>
              <div className="bg-gray-50 p-4 rounded mb-4">
                <h3 className="font-semibold">Student Information</h3>
                <p>Name: {studentData.name}</p>
                <p>Balance: ₹{studentData.balance}</p>
              </div>
              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Processing...' : 'Process Payment'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.student_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 