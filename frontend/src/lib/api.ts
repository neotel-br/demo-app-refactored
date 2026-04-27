const API_URL = import.meta.env.VITE_API_URL ?? '';

interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.error || data.message || `API Error: ${response.statusText}`);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/api/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      requiresAuth: false,
    });
  }

  async logout() {
    return this.request('/api/logout/', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/user/');
  }

  async register(name: string, email: string, username: string, password: string) {
    return this.request('/api/register/', {
      method: 'POST',
      body: JSON.stringify({ name, email, username, password }),
      requiresAuth: false,
    });
  }

  // Employee endpoints
  async createEmployee(employeeData: any) {
    return this.request('/api/employees/create/', {
      method: 'POST',
      body: JSON.stringify(employeeData),
      requiresAuth: false,
    });
  }

  // Department endpoints
  async getDepartments() {
    return this.request('/api/departments/', { requiresAuth: false });
  }

  async getDepartment(id: number) {
    return this.request(`/api/departments/${id}`, { requiresAuth: false });
  }

  // Position endpoints
  async getPositions(departmentId?: number) {
    const url = departmentId 
      ? `/api/positions/?department_id=${departmentId}`
      : '/api/positions/';
    return this.request(url, { requiresAuth: false });
  }

  // Employee endpoints
  async getEmployees() {
    return this.request('/api/employees/', { requiresAuth: false });
  }

  async getEmployee(id: number) {
    return this.request(`/api/employees/${id}`, { requiresAuth: false });
  }

  async deleteEmployee(id: number) {
    return this.request(`/api/employees/${id}/delete/`, {
      method: 'DELETE',
    });
  }

  async getEmployeesByDepartment(departmentId: number) {
    return this.request(`/api/employees/department/${departmentId}`, { requiresAuth: false });
  }

  // Tokenization endpoints
  async detokenize(data: any) {
    return this.request('/api/detokenize/', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: false,
    });
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
