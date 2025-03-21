import { CashFlowReport, LoanStatusReport, LoanRepaymentReport } from '../types';

const API_URL = 'http://localhost:3001/api';

export const fetchCashFlowReport = async (
  token: string, 
  startDate: string, 
  endDate: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<CashFlowReport[]> => {
  let url = `${API_URL}/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`;
  
  if (sortBy) {
    url += `&sortBy=${sortBy}&sortOrder=${sortOrder || 'desc'}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch cash flow report');
  }

  return response.json();
};

export const fetchLoanApplicationsReport = async (
  token: string, 
  status?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<LoanStatusReport[]> => {
  let url = status 
    ? `${API_URL}/reports/loan-applications?status=${status}`
    : `${API_URL}/reports/loan-applications`;
    
  if (sortBy) {
    url += `${url.includes('?') ? '&' : '?'}sortBy=${sortBy}&sortOrder=${sortOrder || 'desc'}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch loan applications report');
  }

  return response.json();
};

export const fetchLoanRepaymentsReport = async (
  token: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<LoanRepaymentReport[]> => {
  let url = `${API_URL}/reports/loan-repayments`;
  
  if (sortBy) {
    url += `?sortBy=${sortBy}&sortOrder=${sortOrder || 'desc'}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch loan repayments report');
  }

  return response.json();
};