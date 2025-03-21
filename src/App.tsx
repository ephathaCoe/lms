import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LoanApplications from './pages/LoanApplications';
import NewLoanApplication from './pages/NewLoanApplication';
import CashFlow from './pages/CashFlow';
import Repayments from './pages/Repayments';
import Reports from './pages/Reports';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="loan-applications" element={<LoanApplications />} />
              <Route path="loan-applications/new" element={<NewLoanApplication />} />
              <Route path="cash-flow" element={<CashFlow />} />
              <Route path="repayments" element={<Repayments />} />
              <Route path="reports" element={<Reports />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;