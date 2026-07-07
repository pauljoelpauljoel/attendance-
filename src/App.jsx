import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import RegistrationPage from './pages/RegistrationPage';
import ScannerPage from './pages/ScannerPage';
import AttendancePage from './pages/AttendancePage';
import StudentCheckin from './pages/StudentCheckin';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <Routes>
          <Route path="/" element={<RegistrationPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/checkin" element={<StudentCheckin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
