import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import jsQR from 'jsqr';
import { saveAttendance, getAttendance } from '../services/api';
import toast from 'react-hot-toast';

const SESSIONS = [
  'Morning Session',
  'Break 1',
  'Lunch',
  'Break 2',
  'Evening Session'
];

const ScannerPage = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [scannedStudent, setScannedStudent] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState(''); // 'success' or 'error'
  const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);
  const [isInvalidQR, setIsInvalidQR] = useState(false);

  const processQRText = async (decodedText) => {
    if (scannedStudent || isAlreadyMarked) return;
    try {
      let studentData = null;
      if (decodedText.includes('/checkin?')) {
        const url = new URL(decodedText);
        const name = url.searchParams.get('name');
        const regNo = url.searchParams.get('regNo');
        if (name && regNo) {
          studentData = { name, regNo };
        }
      } else {
        try {
          studentData = JSON.parse(decodedText);
        } catch (e) {
          if (decodedText.length < 50) {
            studentData = { regNo: decodedText };
          } else {
            throw new Error("Invalid QR code format");
          }
        }
      }

      if (studentData && studentData.regNo) {
        const attendanceData = await getAttendance(selectedDay, selectedSession);
        const alreadyMarked = attendanceData.some(
          a => a.regNo === studentData.regNo || a.reg_no === studentData.regNo
        );
        setIsAlreadyMarked(alreadyMarked);
        
        setScannedStudent({
          name: studentData.name || 'Unknown',
          regNo: studentData.regNo
        });
        
        playNotificationSound();
        if (!alreadyMarked) {
          toast.success('Valid QR Code Scanned');
        } else {
          toast.error('Already marked for this session!');
        }
      } else {
        throw new Error("Invalid QR code format");
      }
    } catch (error) {
      setIsInvalidQR(true);
      playNotificationSound();
      toast.error('Invalid QR Code');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && code.data) {
        processQRText(code.data);
      } else {
        setIsInvalidQR(true);
        playNotificationSound();
        toast.error('Could not detect QR code in image. Make sure it is clear.');
      }
    };
    img.src = URL.createObjectURL(file);
    e.target.value = ''; // reset input
  };

  useEffect(() => {
    if (!selectedDay || !selectedSession || scannedStudent || isInvalidQR) return;
    
    // Clean up any existing scanner instance if it exists before creating a new one
    const scannerId = "reader";
    
    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      { 
        fps: 10, 
        qrbox: { width: 300, height: 300 },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    html5QrcodeScanner.render(
      (decodedText) => {
        processQRText(decodedText).finally(() => {
          html5QrcodeScanner.clear().catch(() => {});
        });
      },
      (error) => {}
    );

    return () => {
      html5QrcodeScanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner on unmount", error);
      });
    };
  }, [selectedDay, selectedSession, scannedStudent]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleAttendance = async (status) => {
    if (!scannedStudent) return;
    
    try {
      await saveAttendance({ 
        ...scannedStudent, 
        status, 
        day: selectedDay, 
        session: selectedSession 
      });
      
      playNotificationSound();
      setStatusMessage(`Successfully marked ${scannedStudent.name} as ${status}`);
      setStatusType("success");
      toast.success(`Marked ${scannedStudent.name} as ${status}`);
    } catch (err) {
      setStatusMessage("Failed to save attendance");
      setStatusType("error");
      toast.error("Failed to save attendance");
    }
    
    // Reset scanner after 1.5 seconds
    setTimeout(() => {
      setScannedStudent(null);
      setStatusMessage(null);
    }, 1500);
  };

  const resetSelection = () => {
    setSelectedDay(null);
    setSelectedSession(null);
    setSelectedSession(null);
    setScannedStudent(null);
    setStatusMessage(null);
    setIsAlreadyMarked(false);
    setIsInvalidQR(false);
  };

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="card-title" style={{ marginBottom: 0 }}>QR Scanner</h2>
        {(selectedDay || selectedSession) && (
          <button className="btn" onClick={resetSelection} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
            Change Session
          </button>
        )}
      </div>
      
      {statusMessage && (
        <div className={`status-msg status-${statusType}`}>
          {statusMessage}
        </div>
      )}

      {!selectedDay ? (
        <div className="selection-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Select Day</h3>
          <button className="btn btn-primary" onClick={() => setSelectedDay('Day 1')}>Day 1</button>
          <button className="btn btn-primary" onClick={() => setSelectedDay('Day 2')}>Day 2</button>
        </div>
      ) : !selectedSession ? (
        <div className="selection-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3>Select Session for {selectedDay}</h3>
          {SESSIONS.map(session => (
            <button 
              key={session} 
              className="btn btn-primary" 
              onClick={() => setSelectedSession(session)}
            >
              {session}
            </button>
          ))}
        </div>
      ) : isInvalidQR ? (
        <div className="scanned-result">
          <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', position: 'relative' }}>
            <button 
              onClick={() => setIsInvalidQR(false)}
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h3 style={{ color: '#f87171', marginBottom: '10px', fontSize: '1.3rem' }}>⚠️ Invalid QR Code</h3>
            <p style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.05rem' }}>
              It is not a valid QR code. This image is not recognized by the system.
            </p>
            
            <button 
              className="btn btn-danger btn-block" 
              onClick={() => setIsInvalidQR(false)}
            >
              OK (Back to Scanner)
            </button>
          </div>
        </div>
      ) : !scannedStudent ? (
        <div className="scanner-container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <div className="scanner-overlay"></div>
            <h4 style={{ textAlign: 'center', padding: '1rem', marginBottom: 0, background: 'rgba(2, 6, 23, 0.9)', color: '#38bdf8' }}>
              Scanning for: {selectedDay} - {selectedSession}
            </h4>
            <div id="reader"></div>
          </div>
          
          <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(2, 6, 23, 0.5)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ marginBottom: '15px', color: '#e5e7eb' }}>Or upload a ticket image</h4>
            <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-block', padding: '12px 24px', fontSize: '1.1rem' }}>
              Upload Ticket File
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload} 
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="scanned-result">
          <div className="scanned-name">{scannedStudent.name}</div>
          <div className="scanned-reg">{scannedStudent.regNo}</div>
          
          {isAlreadyMarked ? (
            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', position: 'relative' }}>
              <button 
                onClick={() => { setScannedStudent(null); setIsAlreadyMarked(false); }}
                style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', border: 'none', color: '#f87171', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
              <h3 style={{ color: '#f87171', marginBottom: '10px', fontSize: '1.3rem' }}>⚠️ Already Registered</h3>
              <p style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.05rem' }}>
                This student is already present in the table for {selectedSession}.
              </p>
              
              <button 
                className="btn btn-danger btn-block" 
                onClick={() => { setScannedStudent(null); setIsAlreadyMarked(false); }}
              >
                OK (Back to Scanner)
              </button>
            </div>
          ) : !statusMessage && (
            <div className="action-buttons">
              <button 
                className="btn btn-success"
                onClick={() => handleAttendance('Present')}
              >
                Present
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScannerPage;
