import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getRegisteredStudents, saveRegisteredStudent, deleteRegisteredStudent, clearAllRegisteredStudents } from '../services/api';
import toast from 'react-hot-toast';

const Ticket = ({ student, id }) => (
  <div id={id} style={{
    width: '900px',
    height: '300px',
    backgroundColor: '#0a0a0a',
    position: 'relative',
    fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    boxSizing: 'border-box',
    display: 'flex',
    overflow: 'hidden',
    color: '#ffffff',
    border: '2px solid #222',
    borderRadius: '12px',
    margin: '0 auto'
  }}>
    {/* Bokeh Background Effect */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: `
        radial-gradient(circle at 15% 25%, rgba(212, 175, 55, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 85% 15%, rgba(255, 255, 255, 0.08) 0%, transparent 35%),
        radial-gradient(circle at 40% 75%, rgba(212, 175, 55, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 75% 80%, rgba(255, 215, 0, 0.12) 0%, transparent 45%),
        radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.05) 0%, transparent 60%)
      `,
      zIndex: 0
    }} />
    
    {/* Floating bokeh circles */}
    {[...Array(15)].map((_, i) => (
      <div key={i} style={{
        position: 'absolute',
        width: `${(i * 3 % 20) + 5}px`,
        height: `${(i * 3 % 20) + 5}px`,
        backgroundColor: i % 3 === 0 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(212, 175, 55, 0.15)',
        borderRadius: '50%',
        top: `${(i * 17) % 100}%`,
        left: `${(i * 23) % 100}%`,
        filter: `blur(${(i % 2) + 1}px)`,
        zIndex: 0
      }} />
    ))}

    {/* Main Middle Section */}
    <div style={{
      flex: 1,
      padding: '25px 40px',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(212, 175, 55, 0.5)',
      margin: '15px 0 15px 15px',
      borderRadius: '8px',
      borderRight: 'none',
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ fontSize: '0.75rem', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span>Flutter Workshop Presents</span>
        <span style={{ color: '#6b7280' }}>|</span>
        <span style={{ color: '#e5e7eb' }}>Organized by <span style={{ color: 'white', fontWeight: 'bold' }}>CODERS</span> III-BCA-B</span>
      </div>
      
      <h1 style={{ 
        fontSize: '6rem', 
        margin: 0, 
        color: '#ffd700',
        textShadow: '0 0 10px rgba(255, 215, 0, 0.4), 2px 2px 0px #b8860b, 4px 4px 0px #5c4021',
        fontWeight: '900',
        letterSpacing: '2px',
        lineHeight: '1'
      }}>
        VIP
      </h1>
      
      <h2 style={{ 
        fontSize: '2.5rem', 
        margin: '0 0 15px 0', 
        fontWeight: 'bold',
        letterSpacing: '3px'
      }}>
        ACCESS PASS
      </h2>

      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', fontSize: '0.8rem', color: '#e5e7eb', marginTop: 'auto', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
          {student?.name || 'STUDENT NAME'} • {student?.reg_no || student?.regNo || 'REG NO'}
        </div>
        <div style={{ color: '#d4af37' }}>|</div>
        <div style={{ letterSpacing: '1px', color: '#fcd34d' }}>
          DATE: SEP 1 & 2, 2026
        </div>
        <div style={{ color: '#d4af37' }}>|</div>
        <div style={{ letterSpacing: '1px' }}>
          TIME: 08:30 AM - 04:30 PM
        </div>
      </div>
    </div>

    {/* Right Stub (Scan Here) */}
    <div style={{
      width: '230px',
      padding: '25px',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(212, 175, 55, 0.5)',
      margin: '15px 15px 15px 0',
      borderRadius: '8px',
      borderLeft: '2px dashed rgba(212, 175, 55, 0.5)',
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '2px', color: '#ffffff' }}>
        SCAN HERE
      </div>

      <div style={{
        padding: '15px',
        border: '1px solid #d4af37',
        background: '#ffffff',
        borderRadius: '4px',
        position: 'relative'
      }}>
        {/* Frame corners */}
        <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '12px', height: '12px', borderTop: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '12px', height: '12px', borderTop: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '12px', height: '12px', borderBottom: '3px solid #d4af37', borderLeft: '3px solid #d4af37' }} />
        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '12px', height: '12px', borderBottom: '3px solid #d4af37', borderRight: '3px solid #d4af37' }} />

        {student && (
          <QRCode 
            value={`${window.location.origin}/checkin?name=${encodeURIComponent(student.name)}&regNo=${encodeURIComponent(student.reg_no || student.regNo)}`} 
            size={135} 
            level="H"
            fgColor="#000000"
            bgColor="transparent"
          />
        )}
      </div>
    </div>
  </div>
);
const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [shift, setShift] = useState('1st Shift');
  const [year, setYear] = useState('1st Year');
  const [savedStudents, setSavedStudents] = useState([]);
  const [selectedStudentForQR, setSelectedStudentForQR] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: null });
  const [duplicateError, setDuplicateError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const saved = await getRegisteredStudents();
        setSavedStudents(saved);
      } catch (err) {
        console.error("Failed to load registered students", err);
      }
    };
    loadStudents();
  }, []);

  const handleRegNoChange = (e) => {
    const val = e.target.value;
    setRegNo(val);
    if (val) {
      setCollegeEmail(`${val}@srcas.ac.in`);
    } else {
      setCollegeEmail('');
    }
  };

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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!name || !regNo) return;
    
    // Duplicate Check
    const isDuplicate = savedStudents.some(s => (s.reg_no === regNo || s.regNo === regNo));
    if (isDuplicate) {
      playNotificationSound();
      toast.error('Duplicate Register Number!');
      setDuplicateError(true);
      setTimeout(() => setDuplicateError(false), 4000);
      return;
    }

    // Auto-save logic
    const newStudent = { 
      name, regNo, collegeEmail, phone, 
      department, shift, year,
      date: new Date().toLocaleDateString() 
    };
    
    try {
      await saveRegisteredStudent(newStudent);
      const updated = await getRegisteredStudents();
      setSavedStudents(updated);
      toast.success('Registration Saved Successfully!');
      
      // Clear form
      setName('');
      setRegNo('');
      setCollegeEmail('');
      setPhone('');
      setDepartment('');
      setShift('1st Shift');
      setYear('1st Year');
      
    } catch (err) {
      console.error("Failed to save student", err);
    }
  };

  const handleDelete = (student) => {
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure you want to delete this registration?",
      onConfirm: async () => {
        try {
          await deleteRegisteredStudent(student.reg_no || student.regNo);
          const updated = await getRegisteredStudents();
          setSavedStudents(updated);
          toast.success('Registration Deleted!');
        } catch (err) {
          console.error("Failed to delete", err);
        }
      }
    });
  };

  const downloadPDF = () => {
    if (savedStudents.length === 0) return;
    const input = document.getElementById('saved-registrations-table');
    if (!input) return;
    
    const style = document.createElement('style');
    style.innerHTML = `
      .no-print { display: none !important; }
      #saved-registrations-table { 
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
      #saved-registrations-table * {
        opacity: 1 !important;
        filter: none !important;
        backdrop-filter: none !important;
        transform: none !important;
        color: #000000 !important;
      }
      #saved-registrations-table table { 
        background-color: #ffffff !important; 
        color: #000000 !important; 
        width: 100% !important; 
        border-collapse: collapse !important; 
        border: 1px solid #94a3b8 !important; 
      }
      #saved-registrations-table th { 
        background-color: #1e293b !important; 
        color: #ffffff !important; 
        border: 1px solid #475569 !important; 
        padding: 12px !important; 
        font-weight: bold !important; 
        text-align: left !important; 
      }
      #saved-registrations-table td { 
        color: #000000 !important; 
        border: 1px solid #94a3b8 !important; 
        padding: 10px !important; 
        background-color: #ffffff !important; 
      }
      #saved-registrations-table .table-header { 
        color: #000000 !important; 
        background-color: #ffffff !important; 
        margin-bottom: 15px !important; 
        font-size: 1.5rem !important; 
        font-weight: bold !important; 
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      html2canvas(input, { 
        scale: 3, 
        backgroundColor: '#ffffff',
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
        pdf.save('Saved_Registrations.pdf');
      });
    }, 150);
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure you want to delete all saved registrations?",
      onConfirm: async () => {
        try {
          await clearAllRegisteredStudents();
          setSavedStudents([]);
          toast.success('All Registrations Cleared!');
        } catch (err) {
          console.error("Failed to clear all", err);
        }
      }
    });
  };

  const generateTicketPDF = async (student, containerId, download = true) => {
    const element = document.getElementById(containerId);
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 200; // slightly wider for better quality
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      if (download) {
        const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
        const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
        pdf.save(`Flutter_Workshop_VIP_Access_Pass_${safeName}_${safeRegNo}.pdf`);
      }
      
      return canvas;
    } catch (err) {
      console.error("PDF generation failed", err);
      return null;
    }
  };

  const shareTicket = async (student, containerId) => {
    const canvas = await generateTicketPDF(student, containerId, false);
    if (!canvas) return;

      canvas.toBlob(async (blob) => {
        try {
          const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
          const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
          const file = new File([blob], `Flutter_Workshop_VIP_Access_Pass_${safeName}_${safeRegNo}.png`, { type: 'image/png' });
          if (navigator.share) {
            await navigator.share({
              title: `Flutter Workshop VIP Access Pass for ${student.name}`,
              files: [file]
            });
        } else {
          alert('Sharing is not supported on this device/browser.');
        }
      } catch (err) {
        console.error("Share failed", err);
      }
    }, 'image/png');
  };

  const filteredStudents = savedStudents.filter(student => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    
    const searchableText = `
      ${student.name || ''} 
      ${student.reg_no || student.regNo || ''} 
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
      <div className="card" style={{ maxWidth: '850px', margin: '0 auto 30px auto' }}>
        <h2 className="card-title">Flutter Workshop Registration</h2>
        
        {duplicateError && (
          <div className="status-msg status-error animate-fade-in" style={{ marginBottom: '20px' }}>
            ⚠️ Already Stored/Registered! This Register Number is a duplicate.
          </div>
        )}

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Student Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Register Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={regNo}
                onChange={handleRegNoChange}
                placeholder="Enter register number"
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Phone Number</label>
              <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} pattern="[0-9]{10}" maxLength="10" title="Please enter exactly 10 digits" placeholder="Phone Number" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>College Email</label>
              <input type="email" className="form-control" value={collegeEmail} onChange={e => setCollegeEmail(e.target.value)} placeholder="College Email" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department</label>
              <input type="text" className="form-control" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Department" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Shift</label>
              <select className="glass-select" style={{ padding: '0.75rem', marginTop: '4px' }} value={shift} onChange={e => setShift(e.target.value)}>
                <option value="1st Shift">1st Shift</option>
                <option value="2nd Shift">2nd Shift</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Year</label>
              <select className="glass-select" style={{ padding: '0.75rem', marginTop: '4px' }} value={year} onChange={e => setYear(e.target.value)}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary btn-block">
            Generate QR
          </button>
        </form>
      </div>

      {savedStudents.length > 0 && (
        <div className="table-container animate-fade-in" id="saved-registrations-table" style={{ width: '100%', margin: '0 auto' }}>
          <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <span>Saved Registrations ({filteredStudents.length})</span>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="no-print">
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ width: '200px', padding: '6px 12px', fontSize: '0.9rem', marginBottom: 0 }}
              />
              <button 
                onClick={downloadPDF}
                className="btn btn-success"
                style={{ padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
              >
                Download PDF
              </button>
              <button 
                onClick={handleClearAll}
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
              >
                Clear All
              </button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Dept & Year</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th className="no-print" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>{index + 1}</td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{student.name || 'Student'}</span>
                        </div>
                      </td>
                      <td>{student.reg_no || student.regNo}</td>
                      <td>
                        <div>{student.department || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {student.year || '-'} {student.shift ? `| ${student.shift}` : ''}
                        </div>
                      </td>
                      <td>
                        <div>{student.phone || '-'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{student.collegeEmail || student.college_email || '-'}</div>
                      </td>
                      <td>{student.date}</td>
                      <td className="no-print" style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => setSelectedStudentForQR(student)} 
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          View Ticket
                        </button>
                        <button 
                          onClick={() => handleDelete(student)} 
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStudentForQR && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(2, 6, 23, 0.9)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(10px)',
          overflowY: 'auto',
          padding: '20px'
        }}>
          <div className="card animate-fade-in" style={{ 
            maxWidth: '900px', width: '100%', textAlign: 'center', position: 'relative',
            background: 'transparent', border: 'none', boxShadow: 'none' 
          }}>
            <button 
              onClick={() => setSelectedStudentForQR(null)}
              style={{ 
                position: 'absolute', top: '-25px', right: '0px', 
                background: 'rgba(255,255,255,0.2)', border: 'none', 
                color: 'white', width: '35px', height: '35px', 
                borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', zIndex: 10,
                backdropFilter: 'blur(5px)'
              }}
            >
              &times;
            </button>
            
            <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '15px' }}>
              <Ticket student={selectedStudentForQR} id="ticket-container" />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px', maxWidth: '400px', margin: '20px auto 0' }}>
              <button onClick={() => generateTicketPDF(selectedStudentForQR, 'ticket-container', true)} className="btn btn-success" style={{ flex: 1, padding: '12px' }}>
                Download Ticket
              </button>
              {navigator.share && (
                <button onClick={() => shareTicket(selectedStudentForQR, 'ticket-container')} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Share Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

export default RegistrationPage;
