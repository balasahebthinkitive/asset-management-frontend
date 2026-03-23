// Mock API for dashboard stats
export const fetchDashboardStats = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    total: 150,
    byStatus: [
      { status: 'available', count: 50 },
      { status: 'in-use', count: 80 },
      { status: 'maintenance', count: 15 },
      { status: 'retired', count: 5 },
    ],
    byCategory: [
      { category: 'Laptop', count: 40 },
      { category: 'Desktop', count: 30 },
      { category: 'Monitor', count: 25 },
      { category: 'Printer', count: 20 },
      { category: 'Tablet', count: 15 },
      { category: 'Phone', count: 10 },
      { category: 'Other', count: 10 },
    ],
    totalValue: 25000000, // 25 million INR
    monthly: [
      { month: '2023-04', count: 5 },
      { month: '2023-05', count: 8 },
      { month: '2023-06', count: 12 },
      { month: '2023-07', count: 7 },
      { month: '2023-08', count: 10 },
      { month: '2023-09', count: 15 },
      { month: '2023-10', count: 9 },
      { month: '2023-11', count: 11 },
      { month: '2023-12', count: 6 },
      { month: '2024-01', count: 14 },
      { month: '2024-02', count: 8 },
      { month: '2024-03', count: 13 },
    ],
    recent: [
      {
        id: 1,
        asset_code: 'AST-001',
        name: 'Dell Laptop',
        Category: { name: 'Laptop' },
        assigned_to: 'John Doe',
        status: 'in-use',
      },
      {
        id: 2,
        asset_code: 'AST-002',
        name: 'HP Desktop',
        Category: { name: 'Desktop' },
        assigned_to: null,
        status: 'available',
      },
      {
        id: 3,
        asset_code: 'AST-003',
        name: 'Samsung Monitor',
        Category: { name: 'Monitor' },
        assigned_to: 'Jane Smith',
        status: 'maintenance',
      },
      {
        id: 4,
        asset_code: 'AST-004',
        name: 'Canon Printer',
        Category: { name: 'Printer' },
        assigned_to: 'Bob Johnson',
        status: 'in-use',
      },
      {
        id: 5,
        asset_code: 'AST-005',
        name: 'iPad Pro',
        Category: { name: 'Tablet' },
        assigned_to: null,
        status: 'retired',
      },
    ],
  };
};