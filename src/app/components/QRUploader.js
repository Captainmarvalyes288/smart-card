'use client';
import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRUploader({ onResult }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const processFile = async (file) => {
    try {
      setLoading(true);
      setError(null);

      const html5QrCode = new Html5Qrcode("qr-reader");
      const imageFile = file;

      try {
        const decodedText = await html5QrCode.scanFile(imageFile, true);
        const data = JSON.parse(decodedText);
        
        if (data.student_id) {
          onResult(data.student_id);
        } else {
          setError('Invalid QR code format');
        }
      } catch (err) {
        setError('Could not read QR code from image');
      } finally {
        html5QrCode.clear();
      }
    } catch (err) {
      setError('Error processing file');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('image')) {
      setError('Please upload an image file');
      return;
    }

    processFile(file);
  };

  return (
    <div className="qr-uploader-container">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center w-full">
        <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white">
          <svg className="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
          </svg>
          <span className="mt-2 text-sm">
            {loading ? 'Processing...' : 'Select QR Code Image'}
          </span>
          <input
            type='file'
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
          />
        </label>
      </div>

      <div id="qr-reader" className="hidden" />

      <p className="text-center mt-4 text-gray-600">
        Upload a photo of a student's QR code
      </p>
    </div>
  );
} 