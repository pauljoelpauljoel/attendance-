import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getRegisteredStudents, saveRegisteredStudent, deleteRegisteredStudent, clearAllRegisteredStudents } from '../services/api';
import toast from 'react-hot-toast';

const Ticket = ({ student, id }) => (
  <div id={id} style={{
    width: '996px',
    height: '530px',
    backgroundColor: '#0a0a0c', // Deeper black
    position: 'relative',
    fontFamily: "'Montserrat', sans-serif",
    boxSizing: 'border-box',
    display: 'flex',
    color: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 40px 100px -20px rgba(0, 0, 0, 1), 0 0 0 1px rgba(255,255,255,0.05) inset',
    overflow: 'hidden',
    margin: '0 auto'
  }}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Montserrat:wght@300;400;500;700;900&family=Dancing+Script:wght@700&family=Orbitron:wght@700;900&family=Righteous&family=Space+Mono:wght@400;700&display=swap');
    `}</style>
    {/* Background Effects: Fluid Aurora & Dots */}
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#020617', zIndex: 0 }} />
    
    {/* Fluid Aurora Orbs */}
    <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '140%', background: 'radial-gradient(ellipse at center, rgba(56, 189, 248, 0.25) 0%, transparent 60%)', transform: 'rotate(-30deg)', zIndex: 0 }} />
    <div style={{ position: 'absolute', bottom: '-40%', right: '-10%', width: '70%', height: '140%', background: 'radial-gradient(ellipse at center, rgba(167, 139, 250, 0.2) 0%, transparent 60%)', transform: 'rotate(40deg)', zIndex: 0 }} />
    <div style={{ position: 'absolute', top: '20%', left: '40%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(232, 121, 249, 0.15) 0%, transparent 60%)', zIndex: 0 }} />
    
    {/* Micro-Dot Pattern */}
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)', 
      backgroundSize: '24px 24px', 
      zIndex: 0 
    }} />
    
    {/* Soft Vignette Overlay */}
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.8) 150%)', zIndex: 0 }} />
    
    {/* Left Section */}
    <div style={{
      flex: 1,
      padding: '40px 50px',
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Top Row: Organizers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: '#a78bfa', letterSpacing: '1px', marginBottom: '4px', fontWeight: '700' }}>
              Organized By
            </div>
            <div style={{ fontFamily: "'Righteous', cursive", fontSize: '1.1rem', color: '#fff', letterSpacing: '1px' }}>
              Dept. of Computer Applications<br/>
              <span style={{ color: '#e879f9' }}>& App Crafters Club</span>
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: '#a78bfa', letterSpacing: '1px', marginBottom: '2px', fontWeight: '700' }}>
            Conducted By
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.4rem', color: '#38bdf8', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 10px rgba(56, 189, 248, 0.6)' }}>
              404Outziders
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Details (Left) + Title (Right) */}
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', flex: 1 }}>
        
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '180px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '25px' }}>
          
          <div style={{ background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.15) 0%, transparent 100%)', borderLeft: '3px solid #a78bfa', padding: '10px 15px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: '#a78bfa', letterSpacing: '1px', fontWeight: '700', marginBottom: '2px' }}>Date</div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem', color: '#cbd5e1', fontWeight: '300', letterSpacing: '1px' }}>Sept 1 & 2</div>
          </div>

          <div style={{ background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, transparent 100%)', borderLeft: '3px solid #38bdf8', padding: '10px 15px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: '#38bdf8', letterSpacing: '1px', fontWeight: '700', marginBottom: '2px' }}>Time</div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1.1rem', color: '#cbd5e1', fontWeight: '300', letterSpacing: '1px' }}>8:30 AM -<br/>5 PM</div>
          </div>

          <div style={{ background: 'linear-gradient(90deg, rgba(232, 121, 249, 0.15) 0%, transparent 100%)', borderLeft: '3px solid #e879f9', padding: '10px 15px', borderRadius: '0 8px 8px 0' }}>
            <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: '#e879f9', letterSpacing: '1px', fontWeight: '700', marginBottom: '2px' }}>Venue</div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '1rem', color: '#cbd5e1', fontWeight: '300', lineHeight: '1.4', letterSpacing: '1px' }}>Lab 5, 1st Floor<br/>B Block</div>
          </div>

        </div>

        {/* Right Column: Title */}
        <div style={{ flex: 1, textAlign: 'center', paddingLeft: '20px' }}>
          <h1 style={{ 
            fontFamily: "'Cinzel', serif",
            fontSize: '3.1rem', 
            margin: '0 0 10px 0', 
            color: '#fff',
            fontWeight: '900',
            letterSpacing: '2px',
            lineHeight: '1.15',
            textShadow: '0 0 20px rgba(56, 189, 248, 0.4)'
          }}>
            <span style={{ color: '#38bdf8', textShadow: '0 0 20px rgba(56, 189, 248, 0.8)' }}>FLUTTER</span> MOBILE<br/>
            APPLICATION WORKSHOP
          </h1>
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'inline-block' }}>
            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1.4rem', color: '#38bdf8', letterSpacing: '6px', fontWeight: '900', marginBottom: '8px' }}>
              APPX-2026
            </div>
            <div style={{ fontFamily: "'Righteous', cursive", fontSize: '1.2rem', color: '#e879f9', letterSpacing: '2px', textTransform: 'uppercase' }}>
              FROM IDEA TO APP
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Tear-off Perforated Edge */}
    <div style={{ 
      width: '40px', 
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0'
    }}>
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{ width: '12px', height: '12px', backgroundColor: '#000', borderRadius: '50%', boxShadow: 'inset 0 4px 6px rgba(0,0,0,1), inset 0 -1px 2px rgba(255,255,255,0.1)' }} />
      ))}
      <div style={{ position: 'absolute', top: '0', bottom: '0', left: '19px', width: '2px', borderLeft: '2px dashed rgba(255,255,255,0.15)' }} />
    </div>

    {/* Right Section (Stub) */}
    <div style={{
      width: '320px',
      padding: '50px 40px',
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '30px',
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(56, 189, 248, 0.12) 100%)',
      borderLeft: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Top right corner accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle at top right, rgba(147, 51, 234, 0.5) 0%, transparent 60%)', zIndex: 0 }} />

      {/* Student ID (Moved Above QR Code) */}
      <div style={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.3rem', color: '#fff', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {student?.name || 'STUDENT NAME'}
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', color: '#38bdf8', letterSpacing: '4px', fontWeight: '400', marginTop: '5px' }}>
          {student?.reg_no || student?.regNo || 'REG NO'}
        </div>
      </div>

      {/* QR Code container */}
      <div style={{
        padding: '10px',
        background: 'linear-gradient(135deg, #a78bfa, #38bdf8, #e879f9)',
        borderRadius: '24px',
        boxShadow: '0 0 30px rgba(167, 139, 250, 0.6), 0 0 15px rgba(56, 189, 248, 0.5) inset, 0 10px 20px rgba(0,0,0,0.5)',
        zIndex: 1,
        position: 'relative'
      }}>
        {/* Creative corner accents for QR */}
        <div style={{ position: 'absolute', top: '-6px', left: '-6px', width: '25px', height: '25px', borderTop: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '6px 0 0 0', zIndex: 2 }} />
        <div style={{ position: 'absolute', top: '-6px', right: '-6px', width: '25px', height: '25px', borderTop: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 6px 0 0', zIndex: 2 }} />
        <div style={{ position: 'absolute', bottom: '-6px', left: '-6px', width: '25px', height: '25px', borderBottom: '3px solid #fff', borderLeft: '3px solid #fff', borderRadius: '0 0 0 6px', zIndex: 2 }} />
        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', width: '25px', height: '25px', borderBottom: '3px solid #fff', borderRight: '3px solid #fff', borderRadius: '0 0 6px 0', zIndex: 2 }} />

        <div style={{ padding: '12px', background: '#fff', borderRadius: '16px' }}>
          {student ? (
            <QRCode 
              value={`${window.location.origin}/checkin?name=${encodeURIComponent(student.name)}&regNo=${encodeURIComponent(student.reg_no || student.regNo)}`} 
              size={150} 
              level="H"
              fgColor="#0a0a0c"
              bgColor="#fff"
            />
          ) : (
            <div style={{ width: '150px', height: '150px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', borderRadius: '10px' }}>
              QR CODE
            </div>
          )}
        </div>
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

  const generateTicketImage = async (student, containerId, download = true) => {
    const element = document.getElementById(containerId);
    if (!element) return null;

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      if (download) {
        const imgData = canvas.toDataURL('image/png');
        const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
        const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
        
        const link = document.createElement('a');
        link.download = `Flutter_Workshop_Entry_Ticket_${safeName}_${safeRegNo}.png`;
        link.href = imgData;
        link.click();
      }
      
      return canvas;
    } catch (err) {
      console.error("Image generation failed", err);
      return null;
    }
  };

  const shareTicket = async (student, containerId) => {
    const canvas = await generateTicketImage(student, containerId, false);
    if (!canvas) return;

      canvas.toBlob(async (blob) => {
        try {
          const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_");
          const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
          const file = new File([blob], `Flutter_Workshop_Entry_Ticket_${safeName}_${safeRegNo}.png`, { type: 'image/png' });
          if (navigator.share) {
            await navigator.share({
              title: `Flutter Workshop Entry Ticket for ${student.name}`,
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
            maxWidth: '1050px', width: '100%', textAlign: 'center', position: 'relative',
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
              <button onClick={() => generateTicketImage(selectedStudentForQR, 'ticket-container', true)} className="btn btn-success" style={{ flex: 1, padding: '12px' }}>
                Download Image
              </button>
              {navigator.share && (
                <button onClick={() => shareTicket(selectedStudentForQR, 'ticket-container')} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
                  Share Image
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
