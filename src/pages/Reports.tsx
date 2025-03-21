import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchCashFlowReport, fetchLoanApplicationsReport, fetchLoanRepaymentsReport } from '../api/reports';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CashFlowReport, LoanStatusReport, LoanRepaymentReport, SortOrder } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Download, FileText, DollarSign, Info, ArrowUpDown, Calendar, Users } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { format, parseISO, subDays } from 'date-fns';

// Tab type for the report sections
type ReportTab = 'cashflow' | 'loans' | 'repayments';

export default function Reports() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [cashFlowData, setCashFlowData] = useState<CashFlowReport[]>([]);
  const [loanStatusData, setLoanStatusData] = useState<LoanStatusReport[]>([]);
  const [loanRepaymentData, setLoanRepaymentData] = useState<LoanRepaymentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ReportTab>('cashflow');
  
  // Sorting state
  const [cashFlowSort, setCashFlowSort] = useState({ field: 'date', order: 'desc' as SortOrder });
  const [loanSort, setLoanSort] = useState({ field: 'count', order: 'desc' as SortOrder });
  const [repaymentSort, setRepaymentSort] = useState({ field: 'remaining_amount', order: 'desc' as SortOrder });
  
  // Date range for cash flow report
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Filter state
  const [loanStatusFilter, setLoanStatusFilter] = useState<string>('');

  useEffect(() => {
    loadReportData();
  }, [token, dateRange, cashFlowSort, loanSort, repaymentSort, loanStatusFilter]);

  const loadReportData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const [cashFlowData, loanStatusData, loanRepaymentData] = await Promise.all([
        fetchCashFlowReport(
          token, 
          dateRange.startDate, 
          dateRange.endDate,
          cashFlowSort.field,
          cashFlowSort.order
        ),
        fetchLoanApplicationsReport(
          token,
          loanStatusFilter,
          loanSort.field,
          loanSort.order
        ),
        fetchLoanRepaymentsReport(
          token,
          repaymentSort.field,
          repaymentSort.order
        )
      ]);
      
      setCashFlowData(cashFlowData);
      setLoanStatusData(loanStatusData);
      setLoanRepaymentData(loanRepaymentData);
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to load report data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (tab: ReportTab, field: string) => {
    if (tab === 'cashflow') {
      setCashFlowSort(prev => ({
        field,
        order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
      }));
    } else if (tab === 'loans') {
      setLoanSort(prev => ({
        field,
        order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
      }));
    } else if (tab === 'repayments') {
      setRepaymentSort(prev => ({
        field,
        order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
      }));
    }
  };

  const handleExportCsv = (reportType: string) => {
    setIsExporting(reportType);
    
    try {
      let csvContent = '';
      let filename = '';
      
      if (reportType === 'Cash Flow') {
        // Create CSV header
        csvContent = 'Date,Income,Expense,Net Cash Flow\\n';
        
        // Add data rows
        cashFlowData.forEach(item => {
          const netCashFlow = item.income - item.expense;
          csvContent += `${item.date},${item.income.toFixed(2)},${item.expense.toFixed(2)},${netCashFlow.toFixed(2)}\\n`;
        });
        
        // Add summary row
        const totalIncome = cashFlowData.reduce((sum, item) => sum + item.income, 0);
        const totalExpense = cashFlowData.reduce((sum, item) => sum + item.expense, 0);
        const totalNetCashFlow = totalIncome - totalExpense;
        csvContent += `\\nTotal,${totalIncome.toFixed(2)},${totalExpense.toFixed(2)},${totalNetCashFlow.toFixed(2)}\\n`;
        
        filename = `cash_flow_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      } else if (reportType === 'Loan Applications') {
        // Create CSV header
        csvContent = 'Status,Count,Percentage\\n';
        
        // Calculate total
        const totalApplications = loanStatusData.reduce((sum, item) => sum + item.count, 0);
        
        // Add data rows
        loanStatusData.forEach(item => {
          const percentage = totalApplications > 0 ? (item.count / totalApplications * 100).toFixed(2) : '0.00';
          csvContent += `${item.status},${item.count},${percentage}%\\n`;
        });
        
        // Add summary row
        csvContent += `\\nTotal,${totalApplications},100.00%\\n`;
        
        filename = `loan_applications_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (reportType === 'Loan Repayments') {
        // Create CSV header
        csvContent = 'Loan ID,Applicant Name,NIDA ID,Loan Amount,Interest Rate,Term Months,Status,Total Installments,Paid Installments,Unpaid Installments,Total Repayment Amount,Paid Amount,Remaining Amount\\n';
        
        // Add data rows
        loanRepaymentData.forEach(item => {
          csvContent += `${item.loan_id},${item.applicant_name},${item.nida_id},${item.loan_amount.toFixed(2)},${item.interest_rate.toFixed(2)},${item.term_months},${item.status},${item.total_installments},${item.paid_installments},${item.unpaid_installments},${item.total_repayment_amount.toFixed(2)},${item.paid_amount.toFixed(2)},${item.remaining_amount.toFixed(2)}\\n`;
        });
        
        // Add summary row
        const totalLoanAmount = loanRepaymentData.reduce((sum, item) => sum + item.loan_amount, 0);
        const totalRepaymentAmount = loanRepaymentData.reduce((sum, item) => sum + item.total_repayment_amount, 0);
        const totalPaidAmount = loanRepaymentData.reduce((sum, item) => sum + item.paid_amount, 0);
        const totalRemainingAmount = loanRepaymentData.reduce((sum, item) => sum + item.remaining_amount, 0);
        
        csvContent += `\\nTotal,,,,,,,,,,${totalRepaymentAmount.toFixed(2)},${totalPaidAmount.toFixed(2)},${totalRemainingAmount.toFixed(2)}\\n`;
        
        filename = `loan_repayments_report_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('success', 'Download Complete', `${reportType} report downloaded successfully`);
    } catch (error) {
      showToast('error', 'Export Error', error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setIsExporting(null);
    }
  };

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  if (isLoading) {
    return (
      <PageContainer title="Reports">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Reports">
      {/* Report Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cashflow'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <DollarSign className="inline-block h-4 w-4 mr-2" />
              Cash Flow
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'loans'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="inline-block h-4 w-4 mr-2" />
              Loan Applications
            </button>
            <button
              onClick={() => setActiveTab('repayments')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'repayments'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="inline-block h-4 w-4 mr-2" />
              Loan Repayments
            </button>
          </nav>
        </div>
      </div>

      {/* Cash Flow Report */}
      {activeTab === 'cashflow' && (
        <Card className="mb-8">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Cash Flow Report</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Income vs. Expenses over time</p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                  From:
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                  To:
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              
              <button
                onClick={() => handleExportCsv('Cash Flow')}
                disabled={isExporting === 'Cash Flow' || cashFlowData.length === 0}
                className="flex items-center px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isExporting === 'Cash Flow' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting === 'Cash Flow' ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
              <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Income includes regular income and loan repayments. Expenses include regular expenses and loan disbursements.
                </p>
              </div>
            </div>
            
            <div className="h-80 bg-gray-50 rounded-lg p-4">
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cashFlowData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${formatCurrency(value)}`, '']}
                      labelFormatter={(date) => format(parseISO(date), 'MMMM dd, yyyy')}
                    />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4ade80" />
                    <Bar dataKey="expense" name="Expense" fill="#f87171" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No cash flow data available for the selected date range</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Income</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        cashFlowData.reduce((sum, item) => sum + item.income, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(
                        cashFlowData.reduce((sum, item) => sum + item.expense, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
                    <p className={`text-xl font-bold ${
                      cashFlowData.reduce((sum, item) => sum + item.income, 0) >= 
                      cashFlowData.reduce((sum, item) => sum + item.expense, 0) 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {formatCurrency(
                        cashFlowData.reduce((sum, item) => sum + item.income, 0) - 
                        cashFlowData.reduce((sum, item) => sum + item.expense, 0)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cash Flow Data Table */}
            {cashFlowData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Cash Flow Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('cashflow', 'date')}
                        >
                          <div className="flex items-center">
                            Date
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('cashflow', 'income')}
                        >
                          <div className="flex items-center">
                            Income
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('cashflow', 'expense')}
                        >
                          <div className="flex items-center">
                            Expense
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Cash Flow
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {cashFlowData.map((item, index) => {
                        const netCashFlow = item.income - item.expense;
                        return (<tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(item.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.income)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.expense)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(netCashFlow)}
                          </td>
                        </tr>
                      )})}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.income, 0))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(cashFlowData.reduce((sum, item) => sum + item.expense, 0))}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          cashFlowData.reduce((sum, item) => sum + item.income, 0) >= 
                          cashFlowData.reduce((sum, item) => sum + item.expense, 0) 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatCurrency(
                            cashFlowData.reduce((sum, item) => sum + item.income, 0) - 
                            cashFlowData.reduce((sum, item) => sum + item.expense, 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Loan Applications Report */}
      {activeTab === 'loans' && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Loan Applications Report</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
              <select
                value={loanStatusFilter}
                onChange={(e) => setLoanStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <button
                onClick={() => handleExportCsv('Loan Applications')}
                disabled={isExporting === 'Loan Applications' || loanStatusData.length === 0}
                className="flex items-center px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isExporting === 'Loan Applications' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting === 'Loan Applications' ? 'Exporting...' : 'Export CSV'}
              </button>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                {loanStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={loanStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {loanStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} applications`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No loan application data available</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Summary</h3>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {loanStatusData.map((item, index) => (
                      <div key={item.status} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </p>
                            <p className="text-lg font-bold text-gray-900">
                              {item.count} applications
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Applications</p>
                          <p className="text-lg font-bold text-gray-900">
                            {loanStatusData.reduce((sum, item) => sum + item.count, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Loan Applications Data Table */}
            {loanStatusData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Application Status Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('loans', 'status')}
                        >
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('loans', 'count')}
                        >
                          <div className="flex items-center">
                            Count
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loanStatusData.map((item, index) => {
                        const totalApplications = loanStatusData.reduce((sum, item) => sum + item.count, 0);
                        const percentage = totalApplications > 0 ? (item.count / totalApplications * 100).toFixed(2) : '0.00';
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {percentage}%
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50 font-medium">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loanStatusData.reduce((sum, item) => sum + item.count, 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          100.00%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loan Repayments Report */}
      {activeTab === 'repayments' && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Loan Repayments Report</CardTitle>
              <p className="text-sm text-gray-500 mt-1">Repayment status and progress</p>
            </div>
            
            <button
              onClick={() => handleExportCsv('Loan Repayments')}
              disabled={isExporting === 'Loan Repayments' || loanRepaymentData.length === 0}
              className="flex items-center px-3 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed mt-4 md:mt-0"
            >
              {isExporting === 'Loan Repayments' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting === 'Loan Repayments' ? 'Exporting...' : 'Export CSV'}
            </button>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                {loanRepaymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={loanRepaymentData.slice(0, 5)} // Show only top 5 for clarity
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="applicant_name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip formatter={(value) => [`${formatCurrency(value)}`, '']} />
                      <Legend />
                      <Bar dataKey="paid_amount" name="Paid" stackId="a" fill="#4ade80" />
                      <Bar dataKey="remaining_amount" name="Remaining" stackId="a" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No loan repayment data available</p>
                  </div>
                )}
              </div>
              
              <div className="h-64 bg-gray-50 rounded-lg p-4">
                {loanRepaymentData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Paid', value: loanRepaymentData.reduce((sum, item) => sum + item.paid_amount, 0) },
                          { name: 'Remaining', value: loanRepaymentData.reduce((sum, item) => sum + item.remaining_amount, 0) }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#4ade80" />
                        <Cell fill="#f87171" />
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No loan repayment data available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Repayment Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(loanRepaymentData.reduce((sum, item) => sum + item.total_repayment_amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Paid Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(loanRepaymentData.reduce((sum, item) => sum + item.paid_amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Remaining Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(loanRepaymentData.reduce((sum, item) => sum + item.remaining_amount, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Loan Repayments Data Table */}
            {loanRepaymentData.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Loan Repayment Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('repayments', 'applicant_name')}
                        >
                          <div className="flex items-center">
                            Applicant
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('repayments', 'loan_amount')}
                        >
                          <div className="flex items-center">
                            Loan Amount
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('repayments', 'total_repayment_amount')}
                        >
                          <div className="flex items-center">
                            Total Repayment
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('repayments', 'paid_amount')}
                        >
                          <div className="flex items-center">
                            Paid
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('repayments', 'remaining_amount')}
                        >
                          <div className="flex items-center">
                            Remaining
                            <ArrowUpDown className="ml-1 h-4 w-4" />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loanRepaymentData.map((item, index) => {
                        const progressPercentage = item.total_repayment_amount > 0 
                          ? (item.paid_amount / item.total_repayment_amount * 100).toFixed(0)
                          : '0';
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.applicant_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.loan_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.total_repayment_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                              {formatCurrency(item.paid_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                              {formatCurrency(item.remaining_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">{progressPercentage}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}