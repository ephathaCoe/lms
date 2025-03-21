import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchCashFlow, createCashFlow, updateCashFlow, deleteCashFlow } from '../api/cashFlow';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { CashFlow } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Edit, Trash2, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';

export default function CashFlowPage() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<CashFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  // Filter state
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense', 'loan'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCashFlow();
  }, [token]);

  const loadCashFlow = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const data = await fetchCashFlow(token);
      setTransactions(data);
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to load cash flow data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsCreating(true);
    try {
      await createCashFlow(token, {
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date
      });
      
      showToast('success', 'Success', 'Transaction created successfully');
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadCashFlow();
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to create transaction');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || isEditing === null) return;
    
    try {
      await updateCashFlow(token, isEditing, {
        type: formData.type as 'income' | 'expense',
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date
      });
      
      showToast('success', 'Success', 'Transaction updated successfully');
      setIsEditing(null);
      setFormData({
        type: 'income',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      loadCashFlow();
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!token) return;
    
    setIsDeleting(id);
    try {
      await deleteCashFlow(token, id);
      showToast('success', 'Success', 'Transaction deleted successfully');
      loadCashFlow();
    } catch (error) {
      showToast('error', 'Error', error instanceof Error ? error.message : 'Failed to delete transaction');
    } finally {
      setIsDeleting(null);
    }
  };

  const startEditing = (transaction: CashFlow) => {
    setIsEditing(transaction.id);
    setFormData({
      type: transaction.type === 'loan_disbursement' || transaction.type === 'loan_repayment' 
        ? 'income' 
        : transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: transaction.date
    });
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    switch (filter) {
      case 'income':
        return (transaction.type === 'income' || transaction.type === 'loan_repayment') && matchesSearch;
      case 'expense':
        return (transaction.type === 'expense' || transaction.type === 'loan_disbursement') && matchesSearch;
      case 'loan':
        return (transaction.type === 'loan_repayment' || transaction.type === 'loan_disbursement') && matchesSearch;
      default:
        return matchesSearch;
    }
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income' || t.type === 'loan_repayment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense' || t.type === 'loan_disbursement')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netCashFlow = totalIncome - totalExpenses;

  if (isLoading) {
    return (
      <PageContainer title="Cash Flow">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Cash Flow">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <ArrowUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <ArrowDown className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netCashFlow)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing !== null ? 'Edit Transaction' : 'Add Transaction'}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={isEditing !== null ? handleUpdateTransaction : handleCreateTransaction}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      rows={3}
                      placeholder="Enter description"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </span>
                      ) : isEditing !== null ? (
                        'Update Transaction'
                      ) : (
                        <span className="flex items-center justify-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Transaction
                        </span>
                      )}
                    </button>
                    
                    {isEditing !== null && (
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
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
                    onClick={() => setFilter('income')}
                    className={`px-3 py-2 text-sm rounded-md ${
                      filter === 'income' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Income
                  </button>
                  <button
                    onClick={() => setFilter('expense')}
                    className={`px-3 py-2 text-sm rounded-md ${
                      filter === 'expense' 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Expenses
                  </button>
                  <button
                    onClick={() => setFilter('loan')}
                    className={`px-3 py-2 text-sm rounded-md ${
                      filter === 'loan' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Loan Related
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => {
                        const isSystemGenerated = transaction.type === 'loan_disbursement' || transaction.type === 'loan_repayment';
                        
                        return (
                          <tr key={transaction.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {transaction.type === 'income' || transaction.type === 'loan_repayment' ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {transaction.type === 'loan_repayment' ? 'Loan Repayment' : 'Income'}
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  {transaction.type === 'loan_disbursement' ? 'Loan Disbursement' : 'Expense'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {transaction.description}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              transaction.type === 'income' || transaction.type === 'loan_repayment'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {formatCurrency(transaction.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {!isSystemGenerated && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditing(transaction)}
                                    className="text-blue-600 hover:text-blue-900"
                                    disabled={isEditing !== null || isDeleting !== null}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    className="text-red-600 hover:text-red-900"
                                    disabled={isDeleting !== null}
                                  >
                                    {isDeleting === transaction.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              )}
                              {isSystemGenerated && (
                                <span className="text-xs text-gray-500">System Generated</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}