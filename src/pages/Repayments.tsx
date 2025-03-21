import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchRepayments, markRepaymentAsPaid } from '../api/repayments';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { LoanRepayment, RepaymentSummary } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Check, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

export default function Repayments() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [repayments, setRepayments] = useState<LoanRepayment[]>([]);
  const [summary, setSummary] = useState<RepaymentSummary>({
    total_due: 0,
    overdue: 0,
    due_soon: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<number | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid', 'overdue'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRepayments();
  }, [token]);

  const loadRepayments = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetchRepayments(token);
      setRepayments(response.repayments);
      setSummary(response.summary);
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to load repayments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!token) return;
    
    setIsProcessing(id);
    try {
      await markRepaymentAsPaid(token, id);
      showToast('success', 'Success', 'Repayment marked as paid');
      loadRepayments();
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to mark repayment as paid');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredRepayments = repayments.filter(repayment => {
    const matchesSearch = 
      repayment.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repayment.nida_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const today = new Date();
    const dueDate = parseISO(repayment.due_date);
    const isOverdue = !repayment.paid && isAfter(today, dueDate);
    
    switch (filter) {
      case 'paid':
        return repayment.paid && matchesSearch;
      case 'unpaid':
        return !repayment.paid && matchesSearch;
      case 'overdue':
        return isOverdue && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  if (isLoading) {
    return (
      <PageContainer title="Loan Repayments">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Loan Repayments">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_due)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.overdue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Due Soon (30 days)</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.due_soon)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Repayment Schedule</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 md:mb-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'paid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'unpaid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unpaid
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-3 py-2 text-sm rounded-md ${
                  filter === 'overdue' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overdue
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIDA ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRepayments.length > 0 ? (
                  filteredRepayments.map((repayment) => {
                    const today = new Date();
                    const dueDate = parseISO(repayment.due_date);
                    const isOverdue = !repayment.paid && isAfter(today, dueDate);
                    
                    return (
                      <tr key={repayment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {repayment.applicant_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {repayment.nida_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(repayment.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(repayment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {repayment.paid ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Paid
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!repayment.paid && (
                            <button
                              onClick={() => handleMarkAsPaid(repayment.id)}
                              disabled={isProcessing === repayment.id}
                              className="text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {isProcessing === repayment.id ? (
                                <span className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                  Processing...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark as Paid
                                </span>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No repayments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}