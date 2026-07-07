import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { getRegisteredStudents, saveRegisteredStudent, deleteRegisteredStudent, clearAllRegisteredStudents } from '../services/api';

const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [shift, setShift] = useState('1st Shift');
  const [year, setYear] = useState('1st Year');
  const [qrData, setQrData] = useState(null);
  const [savedStudents, setSavedStudents] = useState([]);
  const [selectedStudentForQR, setSelectedStudentForQR] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', onConfirm: null });
  const qrRef = useRef(null);

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

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!name || !regNo) return;
    
    // Encode as a URL so standard scanners will open the self-check-in page
    const checkinUrl = `${window.location.origin}/checkin?name=${encodeURIComponent(name)}&regNo=${encodeURIComponent(regNo)}&dept=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}`;
    setQrData(checkinUrl);
  };

  const handleSave = async () => {
    if (!name || !regNo) return;
    const newStudent = { 
      name, regNo, personalEmail, collegeEmail, phone, 
      department, shift, year,
      date: new Date().toLocaleDateString() 
    };
    
    try {
      await saveRegisteredStudent(newStudent);
      const updated = await getRegisteredStudents();
      setSavedStudents(updated);
      
      // Clear form for next entry
      setName('');
      setRegNo('');
      setPersonalEmail('');
      setCollegeEmail('');
      setPhone('');
      setDepartment('');
      setShift('1st Shift');
      setYear('1st Year');
      setQrData(null);
    } catch (err) {
      console.error("Failed to save student", err);
    }
  };

  const handleDelete = (index) => {
    const student = savedStudents[index];
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure you want to delete this registration?",
      onConfirm: async () => {
        try {
          await deleteRegisteredStudent(student.reg_no || student.regNo);
          const updated = await getRegisteredStudents();
          setSavedStudents(updated);
        } catch (err) {
          console.error("Failed to delete", err);
        }
      }
    });
  };

  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Are you sure you want to delete all saved registrations?",
      onConfirm: async () => {
        try {
          await clearAllRegisteredStudents();
          setSavedStudents([]);
        } catch (err) {
          console.error("Failed to clear all", err);
        }
      }
    });
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${regNo}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadSpecificQRCode = (student, svgId) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const padding = 20; // Add 20px quiet zone
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding, img.width, img.height);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim();
      const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
      downloadLink.download = `${safeName}-${safeRegNo}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const shareSpecificQRCode = (student, svgId) => {
    const svg = document.getElementById(svgId);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = async () => {
      const padding = 20; // Add 20px quiet zone
      canvas.width = img.width + padding * 2;
      canvas.height = img.height + padding * 2;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, padding, padding, img.width, img.height);
      
      canvas.toBlob(async (blob) => {
        try {
          const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9 ]/g, "").trim();
          const safeRegNo = (student.reg_no || student.regNo || 'Unknown').replace(/\//g, "-").replace(/[^a-zA-Z0-9-]/g, "");
          const file = new File([blob], `${safeName}-${safeRegNo}.png`, { type: 'image/png' });
          if (navigator.share) {
            await navigator.share({
              title: `QR Code for ${student.name}`,
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
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div>
      <div className="card" style={{ maxWidth: '850px', margin: '0 auto 30px auto' }}>
        <h2 className="card-title">Student Registration</h2>
        
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
                onChange={e => setRegNo(e.target.value)}
                placeholder="Enter register number"
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Phone Number</label>
              <input type="tel" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Personal Email</label>
              <input type="email" className="form-control" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} placeholder="Personal Email (Optional)" />
            </div>
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

        {qrData && (
          <div className="qr-container">
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', textAlign: 'center' }}>
              {name} <br/> <span style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{regNo}</span>
            </h3>
            <div className="qr-code" ref={qrRef}>
              <QRCode value={qrData} size={200} />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '10px' }}>
              <button onClick={downloadQRCode} className="btn btn-success" style={{ flex: 1 }}>
                Download
              </button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }}>
                Save to List
              </button>
            </div>
          </div>
        )}
      </div>

      {savedStudents.length > 0 && (
        <div className="table-container animate-fade-in" style={{ width: '100%', margin: '0 auto' }}>
          <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Saved Registrations ({savedStudents.length})</span>
            <button 
              onClick={handleClearAll}
              className="btn btn-danger"
              style={{ padding: '6px 12px', fontSize: '0.85rem', margin: 0 }}
            >
              Clear All
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Dept & Year</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedStudents.map((student, index) => (
                  <tr key={index}>
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
                    <td style={{ textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setSelectedStudentForQR(student)} 
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        View QR
                      </button>
                      <button 
                        onClick={() => handleDelete(index)} 
                        className="btn btn-danger"
                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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
          backdropFilter: 'blur(10px)'
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => setSelectedStudentForQR(null)}
              style={{ 
                position: 'absolute', top: '15px', right: '15px', 
                background: 'rgba(255,255,255,0.1)', border: 'none', 
                color: 'white', width: '30px', height: '30px', 
                borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              &times;
            </button>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)' }}>
              {selectedStudentForQR.name} <br/> 
              <span style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedStudentForQR.reg_no || selectedStudentForQR.regNo}</span>
            </h3>
            
            <div style={{ display: 'inline-block', background: 'white', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
              <QRCode 
                id="modal-qrcode"
                value={`${window.location.origin}/checkin?name=${encodeURIComponent(selectedStudentForQR.name)}&regNo=${encodeURIComponent(selectedStudentForQR.reg_no || selectedStudentForQR.regNo)}`} 
                size={220} 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button onClick={() => downloadSpecificQRCode(selectedStudentForQR, 'modal-qrcode')} className="btn btn-success" style={{ flex: 1 }}>
                Download
              </button>
              {navigator.share && (
                <button onClick={() => shareSpecificQRCode(selectedStudentForQR, 'modal-qrcode')} className="btn btn-primary" style={{ flex: 1 }}>
                  Share
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
