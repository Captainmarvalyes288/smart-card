'use client';
import { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const qrcodeRegionId = "html5qr-code-full-region";

export default function QRScanner({ onResult }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(qrcodeRegionId);
    
    const qrCodeSuccessCallback = (decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.student_id) {
          html5QrCode.stop();
          onResult(data.student_id);
        } else {
          setError('Invalid QR code format');
        }
      } catch (err) {
        setError('Invalid QR code data');
      }
    };

    const qrCodeErrorCallback = (error) => {
      console.warn(`QR Code scanning error: ${error}`);
    };

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: 250,
      },
      qrCodeSuccessCallback,
      qrCodeErrorCallback
    );

    return () => {
      html5QrCode.stop().catch((err) => {
        console.error("Failed to stop QR Code scanner:", err);
      });
    };
  }, [onResult]);

  return (
    <div className="qr-scanner-container">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div id={qrcodeRegionId} className="qr-scanner" />
      <p className="text-center mt-4 text-gray-600">
        Point your camera at a student's QR code
      </p>
      <style jsx>{`
        .qr-scanner-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        .qr-scanner {
          width: 100%;
          min-height: 300px;
          background: #f0f0f0;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
} 