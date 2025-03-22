'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const VENDOR_ID = 'VEN001'; // This should be dynamic based on vendor login

export default function VendorQRCode() {
  const [qrCode, setQrCode] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorQR();
  }, []);

  const fetchVendorQR = async () => {
    try {
      const response = await fetch(`${API_URL}/get_vendor_qr/${VENDOR_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor QR code');
      }

      const data = await response.json();
      setQrCode(data.qr_code);
      setVendorData({
        name: data.vendor_name,
        upi_id: data.upi_id,
        balance: data.balance
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `vendor-qr-${VENDOR_ID}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Vendor QR Code
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {qrCode && vendorData && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <img
                    src={qrCode}
                    alt="Vendor QR Code"
                    className="w-64 h-64"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Vendor Name:</span> {vendorData.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">UPI ID:</span> {vendorData.upi_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Current Balance:</span> ₹{vendorData.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              <button
                onClick={downloadQR}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Download QR Code
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>Share this QR code with parents for wallet recharge</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 