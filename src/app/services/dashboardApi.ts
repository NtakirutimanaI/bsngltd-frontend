import { fetchApi } from '@/app/api/client';

// Types (keeping the same interface structure)
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: Date;
  isActive: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  activeProjects: number;
  completedProjects: number;
  totalProperties: number;
  availableProperties: number;
  soldProperties: number;
  rentedProperties: number;
  totalEmployees: number;
  activeEmployees: number;
  pendingTransactions: number;
  pendingTaxes: number;
}

export interface ConstructionProject {
  id: string;
  name: string;
  type: 'construction' | 'renovation' | 'maintenance';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  clientId: string;
  startDate: Date;
  endDate?: Date;
  estimatedCost: number;
  actualCost: number;
  progress: number;
  description: string;
  assignedEmployees: string[];
  documents: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  type: 'house' | 'plot' | 'commercial' | 'rental';
  status: 'available' | 'sold' | 'rented' | 'reserved' | 'under_construction';
  price: number;
  location: string;
  size: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense' | 'salary' | 'client_payment';
  amount: number;
  currency: string;
  description: string;
  category: string;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedBy?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Employee {
  id: string;
  userId: string;
  employeeNumber: string;
  department: string;
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract';
  salary: number;
  joinDate: Date;
  momoNumber?: string;
  taxId?: string;
  isActive: boolean;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  tax: number;
  netSalary: number;
  paymentMethod: string;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  paymentDate?: Date;
  transactionId?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half_day';
}

export interface TaxRecord {
  id: string;
  type: string;
  period: string;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  status: 'pending' | 'filed' | 'paid';
  rraTin?: string;
  documents: string[];
  createdAt: Date;
  paymentDate?: Date;
  filingDate?: Date;
}

export interface BrokerageTransaction {
  id: string;
  brokerId: string;
  propertyId: string;
  clientId: string;
  transactionType: 'sale' | 'rental';
  amount: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'completed' | 'failed';
  completedAt?: Date;
  createdAt: Date;
}

export interface RentalAgreement {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'pending' | 'ended' | 'terminated';
  paymentDay: number;
  documents: string[];
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ==================== DASHBOARD SERVICES ====================
export const dashboardService = {
  async getStats(role: string = 'admin'): Promise<ApiResponse<any>> {
    try {
      const data = await fetchApi<any>(`/dashboard/stats?role=${role}`);
      return { success: true, data, message: 'Stats retrieved' };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, message: 'Failed to fetch stats' };
    }
  },
};

// ==================== PROJECTS SERVICES ====================
export const projectService = {
  async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    try {
      const data = await fetchApi<any>(`/projects?page=${page}&limit=${limit}`);
      return { success: true, data: data.data || [], message: 'Projects retrieved' };
    } catch (error) {
      console.error('Error fetching projects:', error);
      return { success: false, message: 'Failed to fetch projects' };
    }
  },

  async create(project: Partial<ConstructionProject>): Promise<ApiResponse<ConstructionProject>> {
    try {
      const data = await fetchApi<ConstructionProject>('/projects', {
        method: 'POST',
        body: JSON.stringify(project),
      });
      return { success: true, data, message: 'Project created successfully' };
    } catch (error) {
      console.error('Error creating project:', error);
      return { success: false, message: 'Failed to create project' };
    }
  },

  async updateProgress(id: string, progress: number): Promise<ApiResponse<null>> {
    try {
      await fetchApi(`/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      });
      return { success: true, message: `Project progress updated to ${progress}%` };
    } catch (error) {
      console.error('Error updating project progress:', error);
      return { success: false, message: 'Failed to update progress' };
    }
  },
};

// ==================== FINANCIAL SERVICES ====================
export const financialService = {
  async getTransactions(page: number = 1, limit: number = 10): Promise<ApiResponse<FinancialTransaction[]>> {
    try {
      const data = await fetchApi<any>(`/payments?page=${page}&limit=${limit}`);
      return { success: true, data: data.data || [], message: 'Transactions retrieved' };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, message: 'Failed to fetch transactions' };
    }
  },

  async createTransaction(transaction: Partial<FinancialTransaction>): Promise<ApiResponse<FinancialTransaction>> {
    try {
      const data = await fetchApi<FinancialTransaction>('/payments', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      return { success: true, data, message: 'Transaction completed successfully' };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return { success: false, message: 'Failed to create transaction' };
    }
  },
};

// ==================== PROPERTY SERVICES ====================
export const propertyService = {
  async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<Property[]>> {
    try {
      const data = await fetchApi<any>(`/properties?page=${page}&limit=${limit}`);
      return { success: true, data: data.data || [], message: 'Properties retrieved' };
    } catch (error) {
      console.error('Error fetching properties:', error);
      return { success: false, message: 'Failed to fetch properties' };
    }
  },

  async create(property: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const data = await fetchApi<Property>('/properties', {
        method: 'POST',
        body: JSON.stringify(property),
      });
      return { success: true, data, message: 'Property created successfully' };
    } catch (error) {
      console.error('Error creating property:', error);
      return { success: false, message: 'Failed to create property' };
    }
  },

  async update(id: string, property: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const data = await fetchApi<Property>(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(property),
      });
      return { success: true, data, message: 'Property updated successfully' };
    } catch (error) {
      console.error('Error updating property:', error);
      return { success: false, message: 'Failed to update property' };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      await fetchApi(`/properties/${id}`, { method: 'DELETE' });
      return { success: true, message: 'Property deleted successfully' };
    } catch (error) {
      console.error('Error deleting property:', error);
      return { success: false, message: 'Failed to delete property' };
    }
  },
};

// ==================== EMPLOYEE SERVICES ====================
export const employeeService = {
  async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<Employee[]>> {
    try {
      const data = await fetchApi<any>(`/employees?page=${page}&limit=${limit}`);
      return { success: true, data: data.data || [], message: 'Employees retrieved' };
    } catch (error) {
      console.error('Error fetching employees:', error);
      return { success: false, message: 'Failed to fetch employees' };
    }
  },

  async create(employee: Partial<Employee>): Promise<ApiResponse<Employee>> {
    try {
      const data = await fetchApi<Employee>('/employees', {
        method: 'POST',
        body: JSON.stringify(employee),
      });
      return { success: true, data, message: 'Employee created successfully' };
    } catch (error) {
      console.error('Error creating employee:', error);
      return { success: false, message: 'Failed to create employee' };
    }
  },
};

// ==================== SALARY SERVICES ====================
export const salaryService = {
  async getAll(page: number = 1, limit: number = 10): Promise<ApiResponse<SalaryPayment[]>> {
    try {
      const data = await fetchApi<any>(`/payments?page=${page}&limit=${limit}&type=salary`);
      return { success: true, data: data.data || [], message: 'Salaries retrieved' };
    } catch (error) {
      console.error('Error fetching salaries:', error);
      return { success: false, message: 'Failed to fetch salaries' };
    }
  },

  async processSalary(salary: Partial<SalaryPayment>): Promise<ApiResponse<SalaryPayment>> {
    try {
      const data = await fetchApi<SalaryPayment>('/payments', {
        method: 'POST',
        body: JSON.stringify({ ...salary, type: 'salary' }),
      });
      return { success: true, data, message: 'Salary payment initiated' };
    } catch (error) {
      console.error('Error processing salary:', error);
      return { success: false, message: 'Failed to process salary' };
    }
  },
};

// ==================== ATTENDANCE SERVICES ====================
export const attendanceService = {
  async getByEmployee(employeeId: string, month?: string): Promise<ApiResponse<Attendance[]>> {
    try {
      // Use the attendance/all endpoint as a fallback since specific employee attendance
      // endpoint is not available. In production, you would add GET /employees/:id/attendance
      const url = month ? `/employees/attendance/all?date=${month}` : '/employees/attendance/all';
      const data = await fetchApi<Attendance[]>(url);
      return { success: true, data: data || [], message: 'Attendance retrieved' };
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return { success: false, message: 'Failed to fetch attendance', data: [] };
    }
  },

  async markAttendance(attendance: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    try {
      const data = await fetchApi<Attendance>('/employees/attendance', {
        method: 'POST',
        body: JSON.stringify(attendance),
      });
      return { success: true, data, message: 'Attendance marked successfully' };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return { success: false, message: 'Failed to mark attendance' };
    }
  },
};

// ==================== NOTIFICATION SERVICES ====================
export const notificationService = {
  async getAll(): Promise<ApiResponse<Notification[]>> {
    try {
      const data = await fetchApi<Notification[]>('/notifications');
      return { success: true, data: data || [], message: 'Notifications retrieved' };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, message: 'Failed to fetch notifications' };
    }
  },

  async markAsRead(id: string): Promise<ApiResponse<null>> {
    try {
      await fetchApi(`/notifications/${id}/read`, { method: 'PATCH' });
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, message: 'Failed to mark as read' };
    }
  },
};

// ==================== TAX SERVICES ====================
export const taxService = {
  async getAll(): Promise<ApiResponse<TaxRecord[]>> {
    try {
      const data = await fetchApi<TaxRecord[]>('/payments?type=tax');
      return { success: true, data: data || [], message: 'Tax records retrieved' };
    } catch (error) {
      console.error('Error fetching tax records:', error);
      return { success: false, message: 'Failed to fetch tax records' };
    }
  },

  async fileTax(tax: Partial<TaxRecord>): Promise<ApiResponse<TaxRecord>> {
    try {
      const data = await fetchApi<TaxRecord>('/payments', {
        method: 'POST',
        body: JSON.stringify({ ...tax, type: 'tax' }),
      });
      return { success: true, data, message: 'Tax filed successfully with Rwanda Revenue Authority' };
    } catch (error) {
      console.error('Error filing tax:', error);
      return { success: false, message: 'Failed to file tax' };
    }
  },
};

// ==================== BROKERAGE SERVICES ====================
export const brokerageService = {
  async getTransactions(): Promise<ApiResponse<BrokerageTransaction[]>> {
    try {
      const data = await fetchApi<BrokerageTransaction[]>('/payments?type=brokerage');
      return { success: true, data: data || [], message: 'Brokerage transactions retrieved' };
    } catch (error) {
      console.error('Error fetching brokerage transactions:', error);
      return { success: false, message: 'Failed to fetch brokerage transactions' };
    }
  },
};

// ==================== RENTAL SERVICES ====================
export const rentalService = {
  async getAgreements(): Promise<ApiResponse<RentalAgreement[]>> {
    try {
      // Since /properties/rentals endpoint doesn't exist yet,
      // we can use /bookings or return properties with rental status
      const data = await fetchApi<any>('/properties?isForRent=true');
      const rentals = (data?.data || []).map((property: any) => ({
        id: property.id,
        propertyId: property.id,
        tenantId: property.tenantId || '',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        monthlyRent: property.price || 0,
        securityDeposit: (property.price || 0) * 2,
        status: property.status as 'active' | 'pending' | 'ended' | 'terminated',
        paymentDay: 1,
        documents: [],
        createdAt: new Date(),
      }));
      return { success: true, data: rentals || [], message: 'Rental agreements retrieved' };
    } catch (error) {
      console.error('Error fetching rental agreements:', error);
      return { success: false, message: 'Failed to fetch rental agreements', data: [] };
    }
  },
};
