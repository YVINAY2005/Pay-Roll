import { SalarySlip, Expense, User } from '@/types';

// Generate mock salary slips
export const generateMockSalarySlips = (employeeId: string, employeeName: string): SalarySlip[] => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June'];
  return months.map((month, index) => {
    const basicSalary = 50000 + Math.floor(Math.random() * 20000);
    const allowances = 5000 + Math.floor(Math.random() * 5000);
    const deductions = 2000 + Math.floor(Math.random() * 3000);
    return {
      id: `slip-${employeeId}-${index}`,
      employeeId,
      employeeName,
      month,
      year: 2024,
      basicSalary,
      allowances,
      deductions,
      netSalary: basicSalary + allowances - deductions,
      status: (index < 5 ? 'issued' : 'draft') as SalarySlip['status'],
      createdAt: new Date(2024, index, 1).toISOString(),
      updatedAt: new Date(2024, index, 5).toISOString(),
    };
  });
};

// Generate mock expenses
export const generateMockExpenses = (employeeId: string, employeeName: string): Expense[] => {
  const categories = ['Travel', 'Meals', 'Equipment', 'Training', 'Office Supplies'];
  const statuses: Expense['status'][] = ['pending', 'approved', 'rejected'];
  
  return Array.from({ length: 8 }, (_, index) => ({
    id: `expense-${employeeId}-${index}`,
    employeeId,
    employeeName,
    category: categories[Math.floor(Math.random() * categories.length)],
    amount: 100 + Math.floor(Math.random() * 900),
    description: `Expense for ${categories[Math.floor(Math.random() * categories.length)].toLowerCase()} purposes`,
    date: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    createdAt: new Date().toISOString(),
  }));
};

// Mock employees for admin view
export const mockEmployees: User[] = [
  {
    id: '2',
    email: 'employee@demo.com',
    name: 'John Employee',
    role: 'employee',
    department: 'Engineering',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'jane@company.com',
    name: 'Jane Smith',
    role: 'employee',
    department: 'Marketing',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'bob@company.com',
    name: 'Bob Johnson',
    role: 'employee',
    department: 'Sales',
    createdAt: new Date().toISOString(),
  },
];

// Initialize mock data in localStorage
export const initializeMockData = () => {
  if (!localStorage.getItem('payroll_salary_slips')) {
    const allSlips: SalarySlip[] = [];
    mockEmployees.forEach(emp => {
      allSlips.push(...generateMockSalarySlips(emp.id, emp.name));
    });
    localStorage.setItem('payroll_salary_slips', JSON.stringify(allSlips));
  }

  if (!localStorage.getItem('payroll_expenses')) {
    const allExpenses: Expense[] = [];
    mockEmployees.forEach(emp => {
      allExpenses.push(...generateMockExpenses(emp.id, emp.name));
    });
    localStorage.setItem('payroll_expenses', JSON.stringify(allExpenses));
  }
};

// Data access functions
export const getSalarySlips = (employeeId?: string): SalarySlip[] => {
  const slips = JSON.parse(localStorage.getItem('payroll_salary_slips') || '[]');
  if (employeeId) {
    return slips.filter((slip: SalarySlip) => slip.employeeId === employeeId);
  }
  return slips;
};

export const saveSalarySlip = (slip: SalarySlip) => {
  const slips = getSalarySlips();
  const existingIndex = slips.findIndex(s => s.id === slip.id);
  if (existingIndex >= 0) {
    slips[existingIndex] = slip;
  } else {
    slips.push(slip);
  }
  localStorage.setItem('payroll_salary_slips', JSON.stringify(slips));
};

export const getExpenses = (employeeId?: string): Expense[] => {
  const expenses = JSON.parse(localStorage.getItem('payroll_expenses') || '[]');
  if (employeeId) {
    return expenses.filter((expense: Expense) => expense.employeeId === employeeId);
  }
  return expenses;
};

export const saveExpense = (expense: Expense) => {
  const expenses = getExpenses();
  const existingIndex = expenses.findIndex(e => e.id === expense.id);
  if (existingIndex >= 0) {
    expenses[existingIndex] = expense;
  } else {
    expenses.push(expense);
  }
  localStorage.setItem('payroll_expenses', JSON.stringify(expenses));
};

export const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
  const expenses = getExpenses();
  const expense = expenses.find(e => e.id === expenseId);
  if (expense) {
    expense.status = status;
    localStorage.setItem('payroll_expenses', JSON.stringify(expenses));
  }
};
