'use client';

import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import QrCodeScanner from '../components/QrCodeScanner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function ParentDashboard() {
  const [mode, setMode] = useState('select'); // 'select', 'scan', 'upload'
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState(null);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpay = async () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        setIsRazorpayLoaded(true);
      };
      
      script.onerror = () => {
        setError('Failed to load payment system. Please try again later.');
      };
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    };

    loadRazorpay();
  }, []);

  const handleQRScan = async (vendorInfo) => {
    try {
      console.log('Vendor Info:', vendorInfo); // Debug log
      if (!vendorInfo || !vendorInfo.vendor_id) {
        throw new Error('Invalid vendor QR code');
      }

      // Fetch vendor details
      const response = await fetch(`${API_URL}/vendor/${vendorInfo.vendor_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor details');
      }

      const data = await response.json();
      setVendorData({
        vendor_id: vendorInfo.vendor_id,
        name: data.name,
        upi_id: data.upi_id
      });
      setMode('payment');
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('QR scan error:', err);
      setError('Invalid QR code or vendor not found. Please scan a valid vendor QR code.');
      setVendorData(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      
      const tempDiv = document.createElement('div');
      tempDiv.id = 'temp-qr-reader';
      document.body.appendChild(tempDiv);
      
      const scanner = new Html5Qrcode('temp-qr-reader');
      const qrCodeData = await scanner.scanFile(file, true);
      
      console.log('QR Code Data:', qrCodeData); // Debug log
      
      await scanner.clear();
      document.body.removeChild(tempDiv);
      
      const vendorInfo = JSON.parse(qrCodeData);
      await handleQRScan(vendorInfo);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Error reading QR code. Please make sure you are scanning a valid vendor QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    if (!studentId || !amount || !vendorData) {
      setError('Please fill all fields and scan vendor QR code');
      return;
    }

    if (!isRazorpayLoaded) {
      setError('Payment system is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Creating recharge order with:', { // Debug log
        student_id: studentId,
        vendor_id: vendorData.vendor_id,
        amount: parseFloat(amount)
      });

      const response = await fetch(`${API_URL}/create_recharge_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          vendor_id: vendorData.vendor_id,
          amount: parseFloat(amount)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create order response:', response.status, errorText); // Debug log
        throw new Error(`Failed to create payment order: ${errorText}`);
      }

      const data = await response.json();
      console.log('Order created successfully:', data); // Debug log

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'School Payment System',
        description: 'Wallet Recharge',
        order_id: data.id,
        handler: async function (response) {
          try {
            console.log('Payment successful, verifying...', response); // Debug log
            
            const verifyResponse = await fetch(`${API_URL}/verify_recharge_payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                student_id: studentId,
                vendor_id: vendorData.vendor_id,
                amount: amount
              }),
            });

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.text();
              console.error('Verification failed:', errorData); // Debug log
              throw new Error(`Payment verification failed: ${errorData}`);
            }

            const verificationResult = await verifyResponse.json();
            console.log('Verification successful:', verificationResult); // Debug log

            setSuccess('Payment successful! Wallet has been recharged.');
            setAmount('');
            setStudentId('');
            setVendorData(null);
            setMode('select');
          } catch (err) {
            console.error('Payment verification error:', err); // Debug log
            setError(err.message || 'Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: 'Parent',
          contact: '',
          email: ''
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Parent Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Recharge your child's wallet
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            {success}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleRecharge} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                min="1"
              />
            </div>

            {mode === 'select' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setMode('scan')}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Scan Vendor QR Code
                </button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                <div>
                  <label className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                    <span>Upload QR Code</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}

            {mode === 'scan' && (
              <div>
                <QrCodeScanner
                  onScanSuccess={handleQRScan}
                  onError={setError}
                  scanMode="vendor"
                />
                <button
                  type="button"
                  onClick={() => setMode('select')}
                  className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel Scanning
                </button>
              </div>
            )}

            {vendorData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vendor Name:</span> {vendorData.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">UPI ID:</span> {vendorData.upi_id}
                </p>
              </div>
            )}

            {vendorData && (
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 