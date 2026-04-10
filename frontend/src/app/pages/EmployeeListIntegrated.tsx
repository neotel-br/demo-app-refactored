import { useNavigate } from "react-router";
import { Users, LogOut, Search, Building2, ChevronRight, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Employee {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  employee_role: string;
  employee_cpf: string;
  department: {
    department_id: number;
    department_name: string;
  };
}

export default function EmployeeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // Carregar funcionários de ambos os departamentos
      const [dept1, dept2] = await Promise.all([
        apiClient.getEmployeesByDepartment(1),
        apiClient.getEmployeesByDepartment(2)
      ]);
      setEmployees([...dept1, ...dept2]);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    // Filtro de busca
    const matchesSearch = !searchTerm || 
      emp.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de departamento
    const matchesDepartment = departmentFilter === "all" || 
      emp.department?.department_name === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4">
        <div className="mb-4">
          <img 
            src={`/images/logo_da.svg?v=${Date.now()}`}
            alt="Neotel" 
            style={{ width: '140px', height: '140px' }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <button 
            className="w-12 h-12 bg-[#1AC647]/10 rounded-lg flex items-center justify-center transition group border border-[#1AC647]/20"
            title="Funcionários"
          >
            <Users className="w-5 h-5 text-[#1AC647]" />
          </button>
          <button 
            onClick={() => navigate("/employees/add")}
            className="w-12 h-12 bg-[#1AC647]/10 rounded-lg flex items-center justify-center transition group border border-[#1AC647]/20 hover:bg-[#1AC647]/20"
            title="Adicionar Funcionário"
          >
            <Plus className="w-5 h-5 text-[#1AC647]" />
          </button>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-12 h-12 hover:bg-red-50 rounded-lg flex items-center justify-center transition group"
          title="Sair"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Funcionários</h1>
            <p className="text-sm text-gray-500">Gerencie todos os colaboradores</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-px h-8 bg-gray-200"></div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Acesso total</p>
            </div>
            <div className="w-10 h-10 bg-[#1AC647] rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-[#1AC647]/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#1AC647]" />
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Ativo</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-1">{filteredEmployees.length}</h3>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">Ativo</span>
                </div>
                <h3 className="text-3xl font-semibold text-gray-900 mb-1">2</h3>
                <p className="text-sm text-gray-600">Departamentos</p>
              </div>
            </div>

            {/* Search Bar and Filters */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent"
                />
              </div>
              
              {/* Department Filter */}
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm font-medium text-gray-700 cursor-pointer pr-8"
                >
                  <option value="all">-- Selecione o Departamento --</option>
                  <option value="TI">TI</option>
                  <option value="Financeiro">Financeiro</option>
                </select>
              </div>
            </div>

            {/* Employee Cards */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1AC647] mx-auto"></div>
                <p className="text-gray-500 mt-4">Carregando funcionários...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.employee_id}
                    onClick={() => navigate(`/employees/${employee.employee_id}`)}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#1AC647] rounded-lg flex items-center justify-center text-white font-medium text-lg">
                          {employee.employee_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#1AC647] transition">
                            {employee.employee_name}
                          </h3>
                          <p className="text-sm text-gray-600">{employee.employee_role}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#1AC647] transition" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{employee.department.department_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-mono">ID: {employee.employee_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredEmployees.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou termos de busca</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
