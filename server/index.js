const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png, and .pdf files are allowed'));
    }
  }
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; // Unified port for frontend and backend

// Middleware
app.use(cors()); // Enable CORS for development (adjust for production if needed)
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files from Vite's build output
const clientBuildPath = path.join(__dirname, '../dist');
app.use(express.static(clientBuildPath));

// Database connection
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'loan_management7',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    await initializeDatabase();
  } catch (error) {
    console.error('Error connecting to MySQL database:', error);
    process.exit(1);
  }
})();

// Initialize database schema
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        path VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        related_table VARCHAR(50),
        related_id INT
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS loan_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        applicant_name VARCHAR(100) NOT NULL,
        nida_id VARCHAR(50) NOT NULL UNIQUE,
        loan_amount DECIMAL(15, 2) NOT NULL,
        term_months INT NOT NULL,
        interest_rate DECIMAL(5, 2) NOT NULL,
        employment_status ENUM('Employed', 'Entrepreneur') NOT NULL,
        employment_proof INT,
        mode_of_repayment ENUM('weekly', 'monthly') NOT NULL,
        sponsor1_name VARCHAR(100) NOT NULL,
        sponsor1_id VARCHAR(50) NOT NULL,
        sponsor1_doc INT,
        sponsor2_name VARCHAR(100) NOT NULL,
        sponsor2_id VARCHAR(50) NOT NULL,
        sponsor2_doc INT,
        terms_doc INT,
        local_govt_letter INT,
        title_deed INT,
        vehicle_reg_card INT,
        csee_certificate INT,
        acse_certificate INT,
        higher_edu_certificate INT,
        status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employment_proof) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (sponsor1_doc) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (sponsor2_doc) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (terms_doc) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (local_govt_letter) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (title_deed) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (vehicle_reg_card) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (csee_certificate) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (acse_certificate) REFERENCES documents(id) ON DELETE SET NULL,
        FOREIGN KEY (higher_edu_certificate) REFERENCES documents(id) ON DELETE SET NULL
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS loan_repayments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loan_application_id INT NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        due_date DATE NOT NULL,
        paid BOOLEAN NOT NULL DEFAULT FALSE,
        paid_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (loan_application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cash_flow (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('income', 'expense', 'loan_disbursement', 'loan_repayment') NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT NOT NULL,
        date DATE NOT NULL,
        related_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_loan_applications_status ON loan_applications(status)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_loan_applications_nida_id ON loan_applications(nida_id)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_application_id ON loan_repayments(loan_application_id)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_loan_repayments_due_date ON loan_repayments(due_date)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_loan_repayments_paid ON loan_repayments(paid)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_cash_flow_type ON cash_flow(type)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_cash_flow_date ON cash_flow(date)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_cash_flow_related_id ON cash_flow(related_id)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)`);
    await connection.query(`CREATE INDEX IF NOT EXISTS idx_documents_related ON documents(related_table, related_id)`);
    
    console.log('Database schema initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
};

// Helper function to log audit
const logAudit = async (userId, action, details) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)',
      [userId, action, details]
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  try {
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const userId = result.insertId;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '1h' });
    
    await logAudit(userId, 'REGISTER', 'User registered');
    
    res.status(201).json({
      token,
      user: { id: userId, username, email, created_at: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    await logAudit(user.id, 'LOGIN', 'User logged in');
    
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, created_at: user.created_at }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.get('/api/loan-applications', authenticateToken, async (req, res) => {
  try {
    const [applications] = await pool.query('SELECT * FROM loan_applications ORDER BY created_at DESC');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    res.status(500).json({ message: 'Server error fetching loan applications' });
  }
});

app.post('/api/loan-applications', authenticateToken, upload.fields([
  { name: 'employment_proof', maxCount: 1 },
  { name: 'sponsor1_doc', maxCount: 1 },
  { name: 'sponsor2_doc', maxCount: 1 },
  { name: 'terms_doc', maxCount: 1 },
  { name: 'local_govt_letter', maxCount: 1 },
  { name: 'title_deed', maxCount: 1 },
  { name: 'vehicle_reg_card', maxCount: 1 },
  { name: 'csee_certificate', maxCount: 1 },
  { name: 'acse_certificate', maxCount: 1 },
  { name: 'higher_edu_certificate', maxCount: 1 }
]), async (req, res) => {
  const {
    applicant_name, nida_id, loan_amount, term_months, interest_rate,
    employment_status, mode_of_repayment, sponsor1_name, sponsor1_id,
    sponsor2_name, sponsor2_id
  } = req.body;
  
  const files = req.files;
  
  // Validate required fields
  if (!applicant_name || !nida_id || !loan_amount || !term_months || !interest_rate || 
      !employment_status || !mode_of_repayment || !sponsor1_name || !sponsor1_id || 
      !sponsor2_name || !sponsor2_id) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }
  
  // Validate required documents
  if (!files || !files.sponsor1_doc || !files.sponsor2_doc || !files.terms_doc) {
    return res.status(400).json({ message: 'Required documents must be uploaded' });
  }
  
  // Validate employment proof if employed
  if (employment_status === 'Employed' && !files.employment_proof) {
    return res.status(400).json({ message: 'Employment proof document is required for employed applicants' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert required documents
    const documentInserts = [];
    const documentFields = {};
    
    // Process employment proof if employed
    if (employment_status === 'Employed' && files.employment_proof) {
      const [employmentProofResult] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.employment_proof[0].originalname, `/uploads/${files.employment_proof[0].filename}`, 'loan_applications']
      );
      documentFields.employment_proof = employmentProofResult.insertId;
      documentInserts.push(employmentProofResult.insertId);
    }
    
    // Process required documents
    const [sponsor1DocResult] = await connection.query(
      'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
      [files.sponsor1_doc[0].originalname, `/uploads/${files.sponsor1_doc[0].filename}`, 'loan_applications']
    );
    documentFields.sponsor1_doc = sponsor1DocResult.insertId;
    documentInserts.push(sponsor1DocResult.insertId);
    
    const [sponsor2DocResult] = await connection.query(
      'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
      [files.sponsor2_doc[0].originalname, `/uploads/${files.sponsor2_doc[0].filename}`, 'loan_applications']
    );
    documentFields.sponsor2_doc = sponsor2DocResult.insertId;
    documentInserts.push(sponsor2DocResult.insertId);
    
    const [termsDocResult] = await connection.query(
      'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
      [files.terms_doc[0].originalname, `/uploads/${files.terms_doc[0].filename}`, 'loan_applications']
    );
    documentFields.terms_doc = termsDocResult.insertId;
    documentInserts.push(termsDocResult.insertId);
    
    // Process optional documents
    if (files.local_govt_letter) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.local_govt_letter[0].originalname, `/uploads/${files.local_govt_letter[0].filename}`, 'loan_applications']
      );
      documentFields.local_govt_letter = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    if (files.title_deed) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.title_deed[0].originalname, `/uploads/${files.title_deed[0].filename}`, 'loan_applications']
      );
      documentFields.title_deed = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    if (files.vehicle_reg_card) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.vehicle_reg_card[0].originalname, `/uploads/${files.vehicle_reg_card[0].filename}`, 'loan_applications']
      );
      documentFields.vehicle_reg_card = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    if (files.csee_certificate) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.csee_certificate[0].originalname, `/uploads/${files.csee_certificate[0].filename}`, 'loan_applications']
      );
      documentFields.csee_certificate = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    if (files.acse_certificate) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.acse_certificate[0].originalname, `/uploads/${files.acse_certificate[0].filename}`, 'loan_applications']
      );
      documentFields.acse_certificate = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    if (files.higher_edu_certificate) {
      const [result] = await connection.query(
        'INSERT INTO documents (filename, path, related_table) VALUES (?, ?, ?)',
        [files.higher_edu_certificate[0].originalname, `/uploads/${files.higher_edu_certificate[0].filename}`, 'loan_applications']
      );
      documentFields.higher_edu_certificate = result.insertId;
      documentInserts.push(result.insertId);
    }
    
    // Build the SQL query dynamically based on available document fields
    const fields = [
      'applicant_name', 'nida_id', 'loan_amount', 'term_months', 'interest_rate',
      'employment_status', 'mode_of_repayment', 'sponsor1_name', 'sponsor1_id',
      'sponsor2_name', 'sponsor2_id', 'status'
    ];
    
    const values = [
      applicant_name, nida_id, loan_amount, term_months, interest_rate,
      employment_status, mode_of_repayment, sponsor1_name, sponsor1_id,
      sponsor2_name, sponsor2_id, 'pending'
    ];
    
    // Add document fields to the query
    Object.keys(documentFields).forEach(field => {
      fields.push(field);
      values.push(documentFields[field]);
    });
    
    const placeholders = values.map(() => '?').join(', ');
    const [applicationResult] = await connection.query(
      `INSERT INTO loan_applications (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );
    
    const applicationId = applicationResult.insertId;
    
    // Update document related_id
    if (documentInserts.length > 0) {
      await connection.query(
        'UPDATE documents SET related_id = ? WHERE id IN (?)',
        [applicationId, documentInserts]
      );
    }
    
    await connection.commit();
    await logAudit(req.user.id, 'CREATE_APPLICATION', `Created loan application for ${applicant_name}`);
    
    const [applications] = await connection.query('SELECT * FROM loan_applications WHERE id = ?', [applicationId]);
    res.status(201).json(applications[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error creating loan application:', error);
    res.status(500).json({ message: 'Server error creating loan application' });
  } finally {
    connection.release();
  }
});

app.put('/api/loan-applications/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Valid status (approved/rejected) is required' });
  }
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const [applications] = await connection.query('SELECT * FROM loan_applications WHERE id = ?', [id]);
    
    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = applications[0];
    await connection.query('UPDATE loan_applications SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    
    if (status === 'approved') {
      const loanAmount = parseFloat(application.loan_amount);
      const termMonths = parseInt(application.term_months);
      const interestRate = parseFloat(application.interest_rate);
      const modeOfRepayment = application.mode_of_repayment;
      
      const totalInterest = (loanAmount * interestRate * termMonths) / 100;
      const totalAmount = loanAmount + totalInterest;
      const periods = modeOfRepayment === 'weekly' ? termMonths * 4 : termMonths;
      const amountPerPeriod = totalAmount / periods;
      
      const now = new Date();
      for (let i = 0; i < periods; i++) {
        const dueDate = new Date(now);
        if (modeOfRepayment === 'weekly') {
          dueDate.setDate(dueDate.getDate() + (i + 1) * 7);
        } else {
          dueDate.setMonth(dueDate.getMonth() + i + 1);
        }
        await connection.query(
          'INSERT INTO loan_repayments (loan_application_id, amount, due_date) VALUES (?, ?, ?)',
          [id, amountPerPeriod, dueDate.toISOString().split('T')[0]]
        );
      }
      
      // Add loan disbursement to cash flow
      await connection.query(
        'INSERT INTO cash_flow (type, amount, description, date, related_id) VALUES (?, ?, ?, ?, ?)',
        ['loan_disbursement', loanAmount, `Loan disbursement to ${application.applicant_name}`, now.toISOString().split('T')[0], id]
      );
    }
    
    await connection.commit();
    await logAudit(req.user.id, 'UPDATE_APPLICATION_STATUS', `Updated application ${id} status to ${status}`);
    
    const [updatedApplications] = await connection.query('SELECT * FROM loan_applications WHERE id = ?', [id]);
    res.json(updatedApplications[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error updating application status' });
  } finally {
    connection.release();
  }
});

app.delete('/api/loan-applications/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get all document IDs associated with this application
    const [applications] = await connection.query(
      `SELECT 
        employment_proof, sponsor1_doc, sponsor2_doc, terms_doc,
        local_govt_letter, title_deed, vehicle_reg_card, 
        csee_certificate, acse_certificate, higher_edu_certificate
      FROM loan_applications WHERE id = ?`,
      [id]
    );
    
    if (applications.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Application not found' });
    }
    
    const application = applications[0];
    
    // Collect all document IDs
    const documentIds = Object.values(application).filter(id => id !== null);
    
    // Delete related cash flow entries
    await connection.query('DELETE FROM cash_flow WHERE related_id = ?', [id]);
    
    // Delete the application (this will cascade delete repayments)
    await connection.query('DELETE FROM loan_applications WHERE id = ?', [id]);
    
    // Delete associated documents
    if (documentIds.length > 0) {
      await connection.query('DELETE FROM documents WHERE id IN (?)', [documentIds]);
    }
    
    await connection.commit();
    await logAudit(req.user.id, 'DELETE_APPLICATION', `Deleted application ${id}`);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting application:', error);
    res.status(500).json({ message: 'Server error deleting application' });
  } finally {
    connection.release();
  }
});

app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const [applicationsCountResult] = await pool.query('SELECT COUNT(*) as count FROM loan_applications');
    
    // Calculate total income (income + loan_repayment)
    const [incomeResult] = await pool.query(
      'SELECT SUM(amount) as total FROM cash_flow WHERE type IN ("income", "loan_repayment")'
    );
    
    // Calculate total expenses (expense + loan_disbursement)
    const [expensesResult] = await pool.query(
      'SELECT SUM(amount) as total FROM cash_flow WHERE type IN ("expense", "loan_disbursement")'
    );
    
    const [recentApplications] = await pool.query('SELECT * FROM loan_applications ORDER BY created_at DESC LIMIT 5');
    const [recentTransactions] = await pool.query('SELECT * FROM cash_flow ORDER BY date DESC LIMIT 5');
    
    res.json({
      total_applications: applicationsCountResult[0].count || 0,
      total_income: incomeResult[0].total || 0,
      total_expenses: expensesResult[0].total || 0,
      recent_applications: recentApplications,
      recent_transactions: recentTransactions
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
});

app.get('/api/cash-flow', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await pool.query('SELECT * FROM cash_flow ORDER BY date DESC');
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching cash flow data:', error);
    res.status(500).json({ message: 'Server error fetching cash flow data' });
  }
});

app.post('/api/cash-flow', authenticateToken, async (req, res) => {
  const { type, amount, description, date } = req.body;
  
  if (!type || !amount || !description || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'Type must be income or expense' });
  }
  
  try {
    const [result] = await pool.query(
      'INSERT INTO cash_flow (type, amount, description, date) VALUES (?, ?, ?, ?)',
      [type, amount, description, date]
    );
    
    await logAudit(req.user.id, 'CREATE_TRANSACTION', `Created ${type} transaction of ${amount}`);
    const [transactions] = await pool.query('SELECT * FROM cash_flow WHERE id = ?', [result.insertId]);
    res.status(201).json(transactions[0]);
  } catch (error) {
    console.error('Error creating cash flow entry:', error);
    res.status(500).json({ message: 'Server error creating cash flow entry' });
  }
});

app.put('/api/cash-flow/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { type, amount, description, date } = req.body;
  
  if (!type && !amount && !description && !date) {
    return res.status(400).json({ message: 'At least one field is required' });
  }
  
  try {
    const [transaction] = await pool.query('SELECT * FROM cash_flow WHERE id = ?', [id]);
    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (['loan_disbursement', 'loan_repayment'].includes(transaction[0].type)) {
      return res.status(403).json({ message: 'System-generated transactions cannot be modified' });
    }
    
    const updates = [];
    const values = [];
    if (type) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: 'Type must be income or expense' });
      }
      updates.push('type = ?');
      values.push(type);
    }
    if (amount) { updates.push('amount = ?'); values.push(amount); }
    if (description) { updates.push('description = ?'); values.push(description); }
    if (date) { updates.push('date = ?'); values.push(date); }
    values.push(id);
    
    await pool.query(`UPDATE cash_flow SET ${updates.join(', ')} WHERE id = ?`, values);
    await logAudit(req.user.id, 'UPDATE_TRANSACTION', `Updated transaction ${id}`);
    
    const [transactions] = await pool.query('SELECT * FROM cash_flow WHERE id = ?', [id]);
    res.json(transactions[0]);
  } catch (error) {
    console.error('Error updating cash flow entry:', error);
    res.status(500).json({ message: 'Server error updating cash flow entry' });
  }
});

app.delete('/api/cash-flow/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [transaction] = await pool.query('SELECT * FROM cash_flow WHERE id = ?', [id]);
    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    if (['loan_disbursement', 'loan_repayment'].includes(transaction[0].type)) {
      return res.status(403).json({ message: 'System-generated transactions cannot be deleted' });
    }
    
    await pool.query('DELETE FROM cash_flow WHERE id = ?', [id]);
    await logAudit(req.user.id, 'DELETE_TRANSACTION', `Deleted transaction ${id}`);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash flow entry:', error);
    res.status(500).json({ message: 'Server error deleting cash flow entry' });
  }
});

app.get('/api/repayments', authenticateToken, async (req, res) => {
  try {
    const [repayments] = await pool.query(
      `SELECT r.*, a.applicant_name, a.nida_id, a.loan_amount as total_loan,
       (SELECT SUM(amount) FROM loan_repayments WHERE loan_application_id = r.loan_application_id AND paid = 1) as amount_paid
       FROM loan_repayments r
       JOIN loan_applications a ON r.loan_application_id = a.id
       ORDER BY r.due_date ASC`
    );
    
    // Calculate repayment summary
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const thirtyDaysDate = thirtyDaysFromNow.toISOString().split('T')[0];
    
    const [totalDueResult] = await pool.query(
      `SELECT SUM(amount) as total_due FROM loan_repayments WHERE paid = 0`
    );
    
    const [overdueResult] = await pool.query(
      `SELECT SUM(amount) as overdue FROM loan_repayments WHERE paid = 0 AND due_date < ?`,
      [today]
    );
    
    const [dueSoonResult] = await pool.query(
      `SELECT SUM(amount) as due_soon FROM loan_repayments WHERE paid = 0 AND due_date BETWEEN ? AND ?`,
      [today, thirtyDaysDate]
    );
    
    const repaymentSummary = {
      total_due: totalDueResult[0].total_due || 0,
      overdue: overdueResult[0].overdue || 0,
      due_soon: dueSoonResult[0].due_soon || 0
    };
    
    res.json({
      repayments,
      summary: repaymentSummary
    });
  } catch (error) {
    console.error('Error fetching repayments:', error);
    res.status(500).json({ message: 'Server error fetching repayments' });
  }
});

app.post('/api/repayments/:id/pay', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { paid_date } = req.body;
  const paymentDate = paid_date || new Date().toISOString().split('T')[0];
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const [repayments] = await connection.query(
      `SELECT r.*, a.applicant_name, a.id as application_id 
       FROM loan_repayments r
       JOIN loan_applications a ON r.loan_application_id = a.id
       WHERE r.id = ?`,
      [id]
    );
    
    if (repayments.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Repayment not found' });
    }
    
    const repayment = repayments[0];
    if (repayment.paid) {
      await connection.rollback();
      return res.status(400).json({ message: 'Repayment already marked as paid' });
    }
    
    await connection.query('UPDATE loan_repayments SET paid = 1, paid_date = ? WHERE id = ?', [paymentDate, id]);
    
    // Add loan repayment to cash flow
    await connection.query(
      'INSERT INTO cash_flow (type, amount, description, date, related_id) VALUES (?, ?, ?, ?, ?)',
      ['loan_repayment', repayment.amount, `Loan repayment from ${repayment.applicant_name}`, paymentDate, repayment.application_id]
    );
    
    await connection.commit();
    await logAudit(req.user.id, 'MARK_REPAYMENT_PAID', `Marked repayment ${id} as paid`);
    
    const [updatedRepayments] = await pool.query(
      `SELECT r.*, a.applicant_name, a.nida_id, a.loan_amount as total_loan,
       (SELECT SUM(amount) FROM loan_repayments WHERE loan_application_id = r.loan_application_id AND paid = 1) as amount_paid
       FROM loan_repayments r
       JOIN loan_applications a ON r.loan_application_id = a.id
       WHERE r.id = ?`,
      [id]
    );
    res.json(updatedRepayments[0]);
  } catch (error) {
    await connection.rollback();
    console.error('Error marking repayment as paid:', error);
    res.status(500).json({ message: 'Server error marking repayment as paid' });
  } finally {
    connection.release();
  }
});

app.get('/api/reports/cash-flow', authenticateToken, async (req, res) => {
  const { startDate, endDate, sortBy, sortOrder } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Start date and end date are required' });
  }
  
  try {
    let query = `
      SELECT date, 
       SUM(CASE WHEN type IN ('income', 'loan_repayment') THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type IN ('expense', 'loan_disbursement') THEN amount ELSE 0 END) as expense
       FROM cash_flow
       WHERE date BETWEEN ? AND ?
       GROUP BY date`;
    
    // Add sorting if provided
    if (sortBy) {
      const validSortFields = ['date', 'income', 'expense'];
      const validSortOrders = ['asc', 'desc'];
      
      const field = validSortFields.includes(sortBy) ? sortBy : 'date';
      const order = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
      
      query += ` ORDER BY ${field} ${order}`;
    } else {
      query += ` ORDER BY date`;
    }
    
    const [results] = await pool.query(query, [startDate, endDate]);
    res.json(results);
  } catch (error) {
    console.error('Error generating cash flow report:', error);
    res.status(500).json({ message: 'Server error generating cash flow report' });
  }
});

app.get('/api/reports/loan-applications', authenticateToken, async (req, res) => {
  const { status, sortBy, sortOrder } = req.query;
  
  try {
    let query = 'SELECT status, COUNT(*) as count FROM loan_applications';
    const params = [];
    
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    
    query += ' GROUP BY status';
    
    // Add sorting if provided
    if (sortBy) {
      const validSortFields = ['status', 'count'];
      const validSortOrders = ['asc', 'desc'];
      
      const field = validSortFields.includes(sortBy) ? sortBy : 'count';
      const order = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
      
      query += ` ORDER BY ${field} ${order}`;
    } else {
      query += ` ORDER BY count DESC`;
    }
    
    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (error) {
    console.error('Error generating loan applications report:', error);
    res.status(500).json({ message: 'Server error generating loan applications report' });
  }
});

app.get('/api/reports/loan-repayments', authenticateToken, async (req, res) => {
  const { sortBy, sortOrder } = req.query;
  
  try {
    let query = `
      SELECT 
        a.id as loan_id,
        a.applicant_name,
        a.nida_id,
        a.loan_amount,
        a.interest_rate,
        a.term_months,
        a.status,
        COUNT(r.id) as total_installments,
        SUM(CASE WHEN r.paid = 1 THEN 1 ELSE 0 END) as paid_installments,
        SUM(CASE WHEN r.paid = 0 THEN 1 ELSE 0 END) as unpaid_installments,
        SUM(r.amount) as total_repayment_amount,
        SUM(CASE WHEN r.paid = 1 THEN r.amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN r.paid = 0 THEN r.amount ELSE 0 END) as remaining_amount
      FROM loan_applications a
      LEFT JOIN loan_repayments r ON a.id = r.loan_application_id
      WHERE a.status = 'approved'
      GROUP BY a.id, a.applicant_name, a.nida_id, a.loan_amount, a.interest_rate, a.term_months, a.status
    `;
    
    // Add sorting if provided
    if (sortBy) {
      const validSortFields = [
        'loan_id', 'applicant_name', 'loan_amount', 'total_installments', 
        'paid_installments', 'unpaid_installments', 'total_repayment_amount', 
        'paid_amount', 'remaining_amount'
      ];
      const validSortOrders = ['asc', 'desc'];
      
      const field = validSortFields.includes(sortBy) ? sortBy : 'remaining_amount';
      const order = validSortOrders.includes(sortOrder) ? sortOrder : 'desc';
      
      query += ` ORDER BY ${field} ${order}`;
    } else {
      query += ` ORDER BY remaining_amount DESC`;
    }
    
    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    console.error('Error generating loan repayments report:', error);
    res.status(500).json({ message: 'Server error generating loan repayments report' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Handle React Router (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});