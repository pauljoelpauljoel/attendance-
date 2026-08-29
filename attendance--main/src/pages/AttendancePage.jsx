import React, { useState, useEffect } from 'react';
import { getAttendance, deleteAttendance, getRegisteredStudents, getSessionSettings, updateSessionSetting } from '../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

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
  const [isSessionBlocked, setIsSessionBlocked] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: null });
  const [searchQuery, setSearchQuery] = useState('');

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
  }, [attendanceData]);

  const handleDelete = (studentToDelete) => {
    setConfirmDialog({
      isOpen: true,
      title: `Are you sure you want to delete ${studentToDelete.name} from attendance?`,
      onConfirm: async () => {
        try {
          await deleteAttendance(studentToDelete);
          await refreshData();
          toast.success(`Removed ${studentToDelete.name} from attendance`);
        } catch (err) {
          console.error("Failed to delete", err);
          toast.error("Failed to remove record");
        }
      }
    });
  };

  const handleToggleBlock = async () => {
    try {
      const newStatus = !isSessionBlocked;
      await updateSessionSetting(filterDay, filterSession, newStatus);
      setIsSessionBlocked(newStatus);
      toast.success(newStatus ? 'Session Blocked' : 'Session Unblocked');
    } catch (err) {
      console.error("Failed to toggle session block", err);
      toast.error('Failed to update session settings');
    }
  };

  const downloadPDF = (type) => {
    const input = document.getElementById(`${type}-table-container`);
    if (!input) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .no-print { display: none !important; }
      #${type}-table-container { 
        background-color: #ffffff !important; 
        background-image: none !important;
        padding: 20px !important; 
        border-radius: 0 !important; 
        opacity: 1 !important;
        filter: none !important;
        backdrop-filter: none !important;
        transform: none !important;
        color: #000000 !important;
      }
      #${type}-table-container * {
        opacity: 1 !important;
        filter: none !important;
        backdrop-filter: none !important;
        transform: none !important;
        color: #000000 !important;
      }
      #${type}-table-container table { 
        background-color: #ffffff !important; 
        color: #000000 !important; 
        width: 100% !important; 
        border-collapse: collapse !important; 
        border: 1px solid #94a3b8 !important; 
      }
      #${type}-table-container th { 
        background-color: #1e293b !important; 
        color: #ffffff !important; 
        border: 1px solid #475569 !important; 
        padding: 12px !important; 
        font-weight: bold !important; 
        text-align: left !important; 
      }
      #${type}-table-container td { 
        color: #000000 !important; 
        border: 1px solid #94a3b8 !important; 
        padding: 10px !important; 
        background-color: #ffffff !important; 
      }
      #${type}-table-container .table-header { 
        color: #000000 !important; 
        background-color: #ffffff !important; 
        margin-bottom: 15px !important; 
        font-size: 1.5rem !important; 
        font-weight: bold !important; 
      }
      #${type}-table-container .text-muted { 
        color: #000000 !important; 
      }
    `;
    document.head.appendChild(style);

    const bgColor = '#ffffff';

    setTimeout(() => {
      html2canvas(input, { 
        scale: 3, 
        backgroundColor: bgColor,
        useCORS: true,
        logging: false,
        allowTaint: true
      }).then((canvas) => {
        document.head.removeChild(style);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
        pdf.save(`${type === 'present' ? 'Present' : 'Absent'}_Attendance_${filterDay}_${filterSession}.pdf`);
        toast.success("PDF Downloaded Successfully!");
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
              <th>Status</th>
              <th className="no-print" style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              students.map((student, index) => {
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: '600' }}>{student.name}</td>
                    <td>{student.regNo || student.reg_no}</td>
                    <td>
                      <div>{student.department || '-'}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                        {student.year || '-'} {student.shift ? `| ${student.shift}` : ''}
                      </div>
                    </td>
                    <td>
                      <div>{student.phone || '-'}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{student.college_email || student.collegeEmail || '-'}</div>
                    </td>
                    <td>{student.timestamp}</td>
                    <td>
                      {type === 'present' ? (
                        <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Present
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Absent
                        </span>
                      )}
                    </td>
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

  const filteredPresentStudents = presentStudents.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const searchableText = `
      ${student.name || ''} 
      ${student.regNo || student.reg_no || ''} 
      ${student.department || ''} 
      ${student.phone || ''} 
      ${student.college_email || student.collegeEmail || ''}
      ${student.year || ''}
      ${student.shift || ''}
    `.toLowerCase();

    const searchTerms = query.split(/\s+/);
    return searchTerms.every(term => searchableText.includes(term));
  });

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>Attendance Records</h2>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
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

        <div style={{ flex: 2, minWidth: '250px' }}>
          <label style={{ marginRight: '8px', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '8px' }}>Search:</label>
          <input 
            type="text" 
            placeholder="Search name, reg no, dept, phone, email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ padding: '0.75rem', width: '100%', marginBottom: 0 }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '180px', display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={`btn ${isSessionBlocked ? 'btn-success' : 'btn-danger'}`}
            style={{ padding: '10px 20px', fontWeight: 'bold', width: '100%' }}
            onClick={handleToggleBlock}
          >
            {isSessionBlocked ? '🔓 Unblock Session' : '🔒 Block Session'}
          </button>
        </div>
      </div>

      <div style={{ padding: '10px 0' }}>
        <div className="attendance-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ position: 'relative' }}>
            {renderTable(filteredPresentStudents, 'Present Students', 'present')}
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button className="btn btn-success" onClick={() => downloadPDF('present')}>
                Download Present PDF
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
