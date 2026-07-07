import React, { useState, useEffect } from 'react';
import { getAttendance, deleteAttendance, getRegisteredStudents, getSessionSettings, updateSessionSetting } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SESSIONS = [
  'Morning Session',
  'Break 1',
  'Lunch',
  'Break 2',
  'Evening Session'
];

const AttendancePage = () => {
  const [filterDay, setFilterDay] = useState('Day 1');
  const [filterSession, setFilterSession] = useState('Morning Session');
  
  const [registeredStudentsMap, setRegisteredStudentsMap] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [presentStudents, setPresentStudents] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [isSessionBlocked, setIsSessionBlocked] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: null });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const regStudents = await getRegisteredStudents();
        const map = {};
        regStudents.forEach(s => map[s.reg_no || s.regNo] = s);
        setRegisteredStudentsMap(map);
      } catch (err) {
        console.error("Failed to load registered students", err);
      }
    };
    loadInitialData();
  }, []);

  const refreshData = async () => {
    try {
      const data = await getAttendance(filterDay, filterSession);
      setAttendanceData(data);
      
      const settings = await getSessionSettings();
      const currentSetting = settings.find(s => s.day === filterDay && s.session === filterSession);
      setIsSessionBlocked(currentSetting ? currentSetting.is_blocked : false);
    } catch (err) {
      console.error("Failed to load attendance", err);
      setAttendanceData([]);
      setIsSessionBlocked(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [filterDay, filterSession]);

  useEffect(() => {
    setPresentStudents(attendanceData.filter(s => s.status === 'Present'));
    setAbsentStudents(attendanceData.filter(s => s.status === 'Absent'));
  }, [attendanceData]);

  const handleDelete = (studentToDelete) => {
    setConfirmDialog({
      isOpen: true,
      title: `Are you sure you want to delete ${studentToDelete.name} from attendance?`,
      onConfirm: async () => {
        try {
          await deleteAttendance(studentToDelete);
          await refreshData();
        } catch (err) {
          console.error("Failed to delete", err);
        }
      }
    });
  };

  const handleToggleBlock = async () => {
    try {
      const newStatus = !isSessionBlocked;
      await updateSessionSetting(filterDay, filterSession, newStatus);
      setIsSessionBlocked(newStatus);
    } catch (err) {
      console.error("Failed to toggle session block", err);
    }
  };

  const downloadPDF = (type) => {
    const input = document.getElementById(`${type}-table-container`);
    if (!input) return;
    
    const style = document.createElement('style');
    style.innerHTML = '.no-print { display: none !important; }';
    document.head.appendChild(style);

    const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLightMode ? '#f8fafc' : '#020617';

    // Use a tiny timeout to ensure the DOM is ready
    setTimeout(() => {
      html2canvas(input, { scale: 2, backgroundColor: bgColor }).then((canvas) => {
        document.head.removeChild(style);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`${type === 'present' ? 'Present' : 'Absent'}_Attendance_${filterDay}_${filterSession}.pdf`);
      });
    }, 150);
  };

  const renderTable = (students, title, type) => (
    <div className="table-container" id={`${type}-table-container`}>
      <div className="table-header">{title}</div>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg No</th>
              <th>Details</th>
              <th>Phone</th>
              <th>Time</th>
              <th className="no-print" style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-muted" style={{ textAlign: 'center' }}>
                  No records found.
                </td>
              </tr>
            ) : (
              students.map((student, index) => {
                const extraDetails = registeredStudentsMap[student.regNo || student.reg_no] || {};
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{student.name}</td>
                    <td>{student.regNo || student.reg_no}</td>
                    <td>
                      <div>{extraDetails.department || '-'}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {extraDetails.year || '-'} {extraDetails.shift ? `| ${extraDetails.shift}` : ''}
                      </div>
                    </td>
                    <td>{extraDetails.phone || '-'}</td>
                    <td>{student.timestamp}</td>
                    <td className="no-print" style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDelete(student)} 
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Attendance Records</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ marginRight: '8px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Day:</label>
          <select 
            className="glass-select" 
            value={filterDay} 
            onChange={e => setFilterDay(e.target.value)}
          >
            <option value="Day 1">Day 1</option>
            <option value="Day 2">Day 2</option>
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ marginRight: '8px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Session:</label>
          <select 
            className="glass-select" 
            value={filterSession} 
            onChange={e => setFilterSession(e.target.value)}
          >
            {SESSIONS.map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px', display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={`btn ${isSessionBlocked ? 'btn-success' : 'btn-danger'}`}
            style={{ padding: '10px 20px', fontWeight: 'bold' }}
            onClick={handleToggleBlock}
          >
            {isSessionBlocked ? '🔓 Unblock Session' : '🔒 Block Session'}
          </button>
        </div>
      </div>

      <div style={{ padding: '10px 0' }}>
        <div className="attendance-grid">
          <div style={{ position: 'relative' }}>
            {renderTable(presentStudents, 'Present Students', 'present')}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button className="btn btn-success" onClick={() => downloadPDF('present')}>
                Download Present PDF
              </button>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            {renderTable(absentStudents, 'Absent Students', 'absent')}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button className="btn btn-success" onClick={() => downloadPDF('absent')}>
                Download Absent PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmDialog.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.9)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', padding: '30px 20px' }}>
            <h3 style={{ color: '#f8fafc', marginBottom: '25px', lineHeight: '1.4' }}>{confirmDialog.title}</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => {
                  if(confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, title: '', onConfirm: null });
                }} 
                className="btn btn-danger" style={{ padding: '10px 30px' }}
              >
                Yes
              </button>
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, title: '', onConfirm: null })} 
                className="btn btn-primary" style={{ padding: '10px 30px' }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
