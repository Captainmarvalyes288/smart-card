'use client';

import { useState, useEffect, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QrCodeScanner({ onScanSuccess, onError, scanOnly = false, scanMode = 'vendor' }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [cameras, setCameras] = useState([]);
  const readerDivId = 'qr-reader';

  // Stop scanning
  const stopScanning = useCallback(async () => {
    if (!scanner) return;
    
    try {
      if (isScanning) {
        await scanner.stop();
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
      setIsScanning(false);
    }
  }, [scanner, isScanning]);

  // Process vendor QR code
  const processVendorQR = useCallback(async (decodedText) => {
    try {
      const parsedData = JSON.parse(decodedText);
      console.log('Parsed vendor QR data:', parsedData);

      if (!parsedData.vendor_id) {
        throw new Error('Invalid vendor QR code');
      }

      await stopScanning();
      onScanSuccess(parsedData);
    } catch (err) {
      console.error('Vendor QR code processing error:', err);
      onError('Invalid vendor QR code format. Please scan a valid vendor QR code.');
    }
  }, [onScanSuccess, onError, stopScanning]);

  // Process student QR code
  const processStudentQR = useCallback(async (decodedText) => {
    try {
      const parsedData = JSON.parse(decodedText);
      console.log('Parsed student QR data:', parsedData);

      if (!parsedData.student_id) {
        throw new Error('Invalid student QR code');
      }

      await stopScanning();
      onScanSuccess(parsedData);
    } catch (err) {
      console.error('Student QR code processing error:', err);
      onError('Invalid student QR code format. Please scan a valid student QR code.');
    }
  }, [onScanSuccess, onError, stopScanning]);

  // Process scanned QR code
  const processQrCode = useCallback(async (decodedText) => {
    console.log('Raw QR code data:', decodedText); // Debug log

    try {
      // Try to parse as JSON first
      const parsedData = JSON.parse(decodedText);
      console.log('Parsed QR code data:', parsedData);

      // Route to appropriate processor based on scan mode
      if (scanMode === 'vendor') {
        await processVendorQR(decodedText);
      } else if (scanMode === 'student') {
        await processStudentQR(decodedText);
      }
    } catch (err) {
      console.error('QR code processing error:', err);
      onError(`Invalid QR code format. Please scan a valid ${scanMode} QR code.`);
    }
  }, [scanMode, processVendorQR, processStudentQR, onError]);

  // Start scanning
  const startScanning = useCallback(async (cameraId = selectedCamera) => {
    if (!scanner || !cameraId) return;

    try {
      await scanner.start(
        { deviceId: cameraId },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        processQrCode,
        (errorMessage) => {
          console.debug('QR Scanning:', errorMessage);
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error('Error starting scanner:', err);
      onError('Failed to start camera scanning. Please try again.');
      setIsScanning(false);
    }
  }, [scanner, selectedCamera, processQrCode, onError]);

  // Handle camera selection
  const handleCameraChange = async (event) => {
    const newCameraId = event.target.value;
    setSelectedCamera(newCameraId);
    if (isScanning) {
      try {
        await stopScanning();
        await startScanning(newCameraId);
      } catch (err) {
        console.error('Camera switch error:', err);
      }
    }
  };

  // Handle scan button click
  const handleScanButtonClick = async () => {
    try {
      if (isScanning) {
        await stopScanning();
      } else {
        await startScanning();
      }
    } catch (err) {
      console.error('Scan button error:', err);
      onError('Failed to toggle scanning. Please try again.');
    }
  };

  // Initialize scanner
  useEffect(() => {
    let mounted = true;

    const initScanner = async () => {
      try {
        const newScanner = new Html5Qrcode(readerDivId);
        if (mounted) {
          setScanner(newScanner);
          // Get available cameras
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length && mounted) {
            setCameras(devices);
            setSelectedCamera(devices[0].id);
          }
        }
      } catch (err) {
        console.error('Error initializing scanner:', err);
        if (mounted) {
          onError && onError('Failed to initialize camera. Please make sure you have granted camera permissions.');
        }
      }
    };

    initScanner();

    // Cleanup function
    return () => {
      mounted = false;
      if (scanner) {
        const cleanup = async () => {
          try {
            if (isScanning) {
              await scanner.stop();
            }
            await scanner.clear();
          } catch (err) {
            console.error('Cleanup error:', err);
          }
        };
        cleanup();
      }
    };
  }, [onError]);

  return (
    <div className="space-y-4">
      {cameras.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Camera
          </label>
          <select
            value={selectedCamera}
            onChange={handleCameraChange}
            disabled={isScanning}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div 
        id={readerDivId} 
        className="w-full max-w-sm mx-auto border-2 border-gray-300 rounded-lg overflow-hidden"
        style={{ minHeight: '300px' }}
      ></div>

      <button
        onClick={handleScanButtonClick}
        className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isScanning
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
        }`}
      >
        {isScanning ? 'Stop Scanning' : 'Start Scanning'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Position the {scanMode} QR code within the camera view
      </p>
    </div>
  );
} 