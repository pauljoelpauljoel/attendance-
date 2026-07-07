import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { saveAttendance, getAttendance } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

const SESSIONS = [
  'Break 1',
  'Lunch',
  'Break 2',
];

const DAYS = ['Day 1', 'Day 2'];

const StudentCheckin = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name');
  const regNo = searchParams.get('regNo');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      const newStatus = {};
      for (const day of DAYS) {
        for (const session of SESSIONS) {
          try {
            const data = await getAttendance(day, session);
            const isPresent = data.some(a => (a.regNo === regNo || a.reg_no === regNo) && a.status === 'Present');
            newStatus[`${day}-${session}`] = isPresent;
          } catch (e) {
            console.error(e);
          }
        }
      }
      setAttendanceStatus(newStatus);
      setLoading(false);
    };
    if (name && regNo) {
      loadAttendance();
    }
  }, [name, regNo, refreshTrigger]);

  if (!name || !regNo) {
    return (
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 className="card-title text-danger">Invalid Link</h2>
        <p>Please scan a valid student QR code.</p>
      </div>
    );
  }

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

  const handlePresent = async (day, session) => {
    if (attendanceStatus[`${day}-${session}`]) return;

    try {
      await saveAttendance({ name, regNo, status: 'Present', day, session });
      setRefreshTrigger(prev => prev + 1); // Refresh UI
      
      playNotificationSound();
      setStatusMessage(`Successfully marked present for ${day} - ${session}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error("Failed to mark present", err);
    }
  };

  const checkIsPresent = (day, session) => {
    return attendanceStatus[`${day}-${session}`] || false;
  };

  return (
    <div className="card checkin-card animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
        <ThemeToggle />
      </div>
      <div className="checkin-header" style={{ marginTop: '20px' }}>
        <div className="student-avatar">{name.charAt(0).toUpperCase()}</div>
        <h2 className="card-title" style={{ marginBottom: '4px' }}>Welcome, {name}</h2>
        <p className="student-regno">{regNo}</p>
      </div>
      
      {statusMessage && (
        <div className="status-msg status-success animate-fade-in">
          {statusMessage}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading sessions...</div>
      ) : (
        <div className="days-container">
          {DAYS.map(day => (
          <div key={day} className="day-section">
            <h3 className="day-title">{day}</h3>
            <div className="sessions-grid">
              {SESSIONS.map((session, i) => {
                const present = checkIsPresent(day, session);
                return (
                  <div 
                    key={session} 
                    className={`session-item ${present ? 'is-present' : ''}`}
                    style={{ animation: `slideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.1}s both` }}
                  >
                    <span className="session-name">{session}</span>
                    <button 
                      className={`btn ${present ? 'btn-disabled' : 'btn-primary'}`}
                      onClick={() => handlePresent(day, session)}
                      disabled={present}
                    >
                      {present ? 'Present' : 'Mark Present'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCheckin;
