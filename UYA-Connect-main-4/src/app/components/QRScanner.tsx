import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from './ui/Button';
import { X, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const initScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            stopScanning();
          },
          () => {
            // Error while scanning, ignore
          }
        );

        setIsScanning(true);
      } catch (err) {
        setError('Failed to access camera. Please allow camera access.');
        console.error('Scanner error:', err);
      }
    };

    initScanner();

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setIsScanning(false);
    }
  };

  const handleClose = async () => {
    await stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            Scan Attendance QR Code
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 text-red-900 p-4 rounded-lg mb-4">
            {error}
          </div>
        ) : (
          <>
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden mb-4"
              style={{ width: '100%' }}
            ></div>

            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan the QR code displayed by the coordinator to record your attendance.
            </p>
          </>
        )}

        <Button onClick={handleClose} variant="outline" className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
