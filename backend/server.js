const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const connectionString = 'postgresql://postgres.vmrakfpmjwhwnekfjapf:Pauljoel@@2007@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

// Helper to sanitize table names (e.g. Day 1 -> Day1)
const getTableName = (day, session) => {
  if (!day || !session) return 'attendance_data_misc';
  return `attendance_${day.replace(/\s+/g, '')}_${session.replace(/\s+/g, '')}`;
};

// --- INITIALIZE TABLES ---
const initializeTables = async () => {
  try {
    // 1. Registered Students
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registered_students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        reg_no VARCHAR(100) UNIQUE,
        personal_email VARCHAR(255),
        college_email VARCHAR(255),
        phone VARCHAR(50),
        department VARCHAR(100),
        shift VARCHAR(50),
        year VARCHAR(50),
        date VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Attendance Tables (as requested: separate tables for every day/session)
    const days = ['Day 1', 'Day 2'];
    const sessions = ['Morning Session', 'Break 1', 'Lunch', 'Break 2', 'Evening Session'];

    for (let day of days) {
      for (let session of sessions) {
        const tableName = getTableName(day, session);
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            "regNo" VARCHAR(100),
            day VARCHAR(50),
            session VARCHAR(100),
            status VARCHAR(50),
            timestamp VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      }
    }

    // 3. Session Settings (for blocking/unblocking sessions)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session_settings (
        id SERIAL PRIMARY KEY,
        day VARCHAR(50),
        session VARCHAR(100),
        is_blocked BOOLEAN DEFAULT false,
        UNIQUE(day, session)
      )
    `);

    console.log("✅ All tables created/verified successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

initializeTables();

// --- ROUTES ---

// Get all registered students
app.get('/api/registered', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM registered_students ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a registered student
app.post('/api/registered', async (req, res) => {
  const { name, regNo, personalEmail, collegeEmail, phone, department, shift, year, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO registered_students (name, reg_no, personal_email, college_email, phone, department, shift, year, date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       ON CONFLICT (reg_no) DO UPDATE SET 
       name=EXCLUDED.name, personal_email=EXCLUDED.personal_email, college_email=EXCLUDED.college_email, 
       phone=EXCLUDED.phone, department=EXCLUDED.department, shift=EXCLUDED.shift, year=EXCLUDED.year
       RETURNING *`,
      [name, regNo, personalEmail, collegeEmail, phone, department, shift, year, date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a registered student or ALL registered students
app.delete('/api/registered', async (req, res) => {
  try {
    const regNo = req.query.regNo;
    if (regNo) {
      await pool.query('DELETE FROM registered_students WHERE reg_no = $1', [regNo]);
    } else {
      await pool.query('TRUNCATE TABLE registered_students');
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for a specific session
app.get('/api/attendance', async (req, res) => {
  const { day, session } = req.query;
  const tableName = getTableName(day, session);
  try {
    // Only query if table exists (avoids crashes on invalid table names)
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    res.json(result.rows);
  } catch (err) {
    res.json([]); // Return empty if table doesn't exist yet
  }
});

// Save attendance for a specific session
app.post('/api/attendance', async (req, res) => {
  const { name, regNo, status, day, session } = req.body;
  const tableName = getTableName(day, session);
  const timestamp = new Date().toLocaleString();
  
  try {
    // Ensure table exists just in case it's a new day/session not in the array
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        "regNo" VARCHAR(100),
        day VARCHAR(50),
        session VARCHAR(100),
        status VARCHAR(50),
        timestamp VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if already present to prevent duplicate inserts
    const existing = await pool.query(`SELECT * FROM ${tableName} WHERE "regNo" = $1 AND status = $2`, [regNo, 'Present']);
    if (existing.rows.length > 0) {
      return res.json(existing.rows[0]);
    }
    
    const result = await pool.query(
      `INSERT INTO ${tableName} (name, "regNo", day, session, status, timestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, regNo, day, session, status, timestamp]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete attendance record
app.delete('/api/attendance', async (req, res) => {
  const { day, session, regNo } = req.body;
  const tableName = getTableName(day, session);
  try {
    await pool.query(`DELETE FROM ${tableName} WHERE "regNo" = $1`, [regNo]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SESSION SETTINGS (BLOCK/UNBLOCK) ---

app.get('/api/settings/sessions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM session_settings');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/sessions', async (req, res) => {
  const { day, session, isBlocked } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO session_settings (day, session, is_blocked) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (day, session) DO UPDATE SET 
       is_blocked = EXCLUDED.is_blocked
       RETURNING *`,
      [day, session, isBlocked]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
