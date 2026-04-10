import { useNavigate } from "react-router";
import { Users, Settings, LogOut, Search, Building2, ChevronRight, Shield, Filter, TrendingUp } from "lucide-react";
import { useState } from "react";

const employees = [
  {
    id: "10003",
    name: "Carlos Pereira",
    role: "Analista de Financeiro",
    department: "Financeiro",
    email: "carlos.pereira@example.com",
    avatar: "👨‍💼",
    status: "active",
  },
  {
    id: "10004",
    name: "Ana Oliveira",
    role: "Gerente de Financeiro",
    department: "Financeiro",
    email: "ana.oliveira@example.com",
    avatar: "👩‍💼",
    status: "active",
  },
];

export default function EmployeeList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50/30 flex">
      {/* Sidebar */}
      <div className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 shadow-sm">
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <button 
            className="w-12 h-12 bg-violet-50 hover:bg-violet-100 rounded-xl flex items-center justify-center transition-all duration-300 group border border-violet-200"
            title="Funcionários"
          >
            <Users className="w-6 h-6 text-violet-600 group-hover:text-violet-700" />
          </button>
          
          <button 
            className="w-12 h-12 hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all duration-300 group"
            title="Configurações"
          >
            <Settings className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-12 h-12 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all duration-300 group border border-transparent hover:border-red-200"
          title="Sair"
        >
          <LogOut className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Funcionários</h1>
              <p className="text-sm text-gray-500">Gerencie todos os colaboradores</p>
            </div>
            <span className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-sm font-semibold">
              {filteredEmployees.length} ativos
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">Acesso total</p>
            </div>
            <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex items-center justify-center text-lg shadow-lg ring-4 ring-violet-100">
              👤
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-violet-600" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">24</h3>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">5 ativos</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">8</h3>
                <p className="text-sm text-gray-600">Departamentos</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">VTS Ativo</span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">100%</h3>
                <p className="text-sm text-gray-600">Dados Protegidos</p>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, cargo ou departamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition shadow-sm"
                />
              </div>
              
              <button className="px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm">
                <Filter className="w-5 h-5" />
                Filtros
              </button>

              <button className="px-5 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition flex items-center gap-2 font-medium shadow-sm">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Financeiro
              </button>
            </div>

            {/* Department Section */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white border-2 border-emerald-200 rounded-2xl flex items-center justify-center shadow-sm">
                    <Building2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Departamento Financeiro</h2>
                    <p className="text-sm text-gray-600">Gestão financeira e contabilidade da empresa</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{filteredEmployees.length}</p>
                  <p className="text-sm text-gray-600">colaboradores</p>
                </div>
              </div>
            </div>

            {/* Employee Grid */}
            <div className="grid gap-4">
              {filteredEmployees.map((employee, index) => (
                <div
                  key={employee.id}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-violet-300 transition-all duration-300 group cursor-pointer"
                  onClick={() => navigate(`/employees/${employee.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform">
                          {employee.avatar}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition">
                          {employee.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 font-medium">{employee.role}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-lg">ID: {employee.id}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{employee.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right mr-2">
                        <span className="block text-xs text-gray-500 mb-1">Status</span>
                        <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          Ativo
                        </span>
                      </div>
                      
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-violet-100 rounded-xl flex items-center justify-center transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}