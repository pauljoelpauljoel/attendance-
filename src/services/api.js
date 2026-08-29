const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export const saveAttendance = async (student) => {
  const response = await fetch(`${API_URL}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  if (!response.ok) throw new Error('Failed to save attendance');
  return await response.json();
};

export const getAttendance = async (day, session) => {
  if (!day || !session) return [];
  const response = await fetch(`${API_URL}/attendance?day=${encodeURIComponent(day)}&session=${encodeURIComponent(session)}`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed to fetch attendance');
  return await response.json();
};

export const deleteAttendance = async (studentToDelete) => {
  const response = await fetch(`${API_URL}/attendance`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentToDelete)
  });
  if (!response.ok) throw new Error('Failed to delete attendance');
  return await response.json();
};

// --- Registered Students ---
export const getRegisteredStudents = async () => {
  const response = await fetch(`${API_URL}/registered`, {
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed to fetch registered students');
  return await response.json();
};

export const saveRegisteredStudent = async (student) => {
  const response = await fetch(`${API_URL}/registered`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student)
  });
  if (!response.ok) throw new Error('Failed to save registered student');
  return await response.json();
};

export const deleteRegisteredStudent = async (regNo) => {
  const response = await fetch(`${API_URL}/registered?regNo=${encodeURIComponent(regNo)}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete registered student');
  return await response.json();
};

export const clearAllRegisteredStudents = async () => {
  const response = await fetch(`${API_URL}/registered`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to clear registered students');
  return await response.json();
};

// --- Session Settings ---
export const getSessionSettings = async () => {
  const response = await fetch(`${API_URL}/settings/sessions`, {
    cache: 'no-store'
  });
  if (!response.ok) return [];
  return await response.json();
};

export const updateSessionSetting = async (day, session, isBlocked) => {
  const response = await fetch(`${API_URL}/settings/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day, session, isBlocked })
  });
  if (!response.ok) throw new Error('Failed to update session setting');
  return await response.json();
};
