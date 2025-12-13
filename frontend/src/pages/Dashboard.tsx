import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSalarySlips, getExpenses, initializeMockData, mockEmployees } from '@/lib/mockData';
import StatCard from '@/components/stats/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Receipt, DollarSign, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(172, 66%, 50%)', 'hsl(38, 92%, 50%)', 'hsl(142, 76%, 36%)'];

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    initializeMockData();
  }, []);

  const salarySlips = useMemo(() => 
    isAdmin ? getSalarySlips() : getSalarySlips(user?.id), 
    [isAdmin, user?.id]
  );
  
  const expenses = useMemo(() => 
    isAdmin ? getExpenses() : getExpenses(user?.id), 
    [isAdmin, user?.id]
  );

  const stats = useMemo(() => {
    const totalSalary = salarySlips.reduce((sum, slip) => sum + slip.netSalary, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const pendingExpenses = expenses.filter(exp => exp.status === 'pending').length;
    
    return {
      totalSalary,
      totalExpenses,
      pendingExpenses,
      employeeCount: isAdmin ? mockEmployees.length : 1,
    };
  }, [salarySlips, expenses, isAdmin]);

  const salaryChartData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    salarySlips.forEach(slip => {
      const key = slip.month.substring(0, 3);
      monthlyData[key] = (monthlyData[key] || 0) + slip.netSalary;
    });
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }));
  }, [salarySlips]);

  const expensesByCategory = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    expenses.forEach(exp => {
      categoryData[exp.category] = (categoryData[exp.category] || 0) + exp.amount;
    });
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const expenseStatusData = useMemo(() => {
    const pending = expenses.filter(e => e.status === 'pending').length;
    const approved = expenses.filter(e => e.status === 'approved').length;
    const rejected = expenses.filter(e => e.status === 'rejected').length;
    return [
      { name: 'Pending', value: pending },
      { name: 'Approved', value: approved },
      { name: 'Rejected', value: rejected },
    ];
  }, [expenses]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here's an overview of your {isAdmin ? 'company' : ''} payroll data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isAdmin && (
          <StatCard
            title="Total Employees"
            value={stats.employeeCount}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
        )}
        <StatCard
          title={isAdmin ? "Total Payroll" : "Total Earnings"}
          value={`₹${stats.totalSalary.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          icon={Receipt}
        />
        <StatCard
          title="Pending Expenses"
          value={stats.pendingExpenses}
          icon={FileText}
        />
        {!isAdmin && (
          <StatCard
            title="Salary Slips"
            value={salarySlips.length}
            icon={TrendingUp}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Salary Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {isAdmin ? 'Monthly Payroll' : 'Salary History'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                  <Bar dataKey="amount" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {expensesByCategory.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Status Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Expense Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenseStatusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(172, 66%, 50%)"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(172, 66%, 50%)', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
