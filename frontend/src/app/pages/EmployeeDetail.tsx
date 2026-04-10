import { useNavigate, useParams } from "react-router";
import { Users, LogOut, ChevronLeft, User, Mail, Phone, Calendar, Wallet, CreditCard, Building2 } from "lucide-react";

const employeesData = {
  "10003": {
    name: "Carlos Pereira",
    role: "Analista de Financeiro",
    id: "10003",
    cpf: "555.668.777-88",
    rg: "70.556.687-77",
    birthDate: "03/03/1992",
    admissionDate: "01/03/2023",
    salary: "R$ 4.500,00",
    department: "Financeiro",
    email: "carlos.pereira@example.com",
    phone: "(21) 98777-0000",
    bankAgency: "3678",
    bankAccount: "JM7654",
  },
  "10004": {
    name: "Ana Oliveira",
    role: "Gerente de Financeiro",
    id: "10004",
    cpf: "555.668.777-88",
    rg: "70.556.687-77",
    birthDate: "03/03/1992",
    admissionDate: "01/03/2023",
    salary: "R$ 4.500,00",
    department: "Financeiro",
    email: "ana.oliveira@example.com",
    phone: "(21) 98777-0000",
    bankAgency: "3678",
    bankAccount: "JM7654",
  },
  "10001": {
    name: "João Silva",
    role: "Analista de Cybersegurança",
    id: "10001",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    birthDate: "01/01/1990",
    admissionDate: "01/01/2023",
    salary: "R$ 5.000,00",
    department: "TI",
    email: "joao.silva@example.com",
    phone: "(21) 98765-1000",
    bankAgency: "1001",
    bankAccount: "12345-6",
  },
};

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const employee = employeesData[id as keyof typeof employeesData] || employeesData["10003"];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-24 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4">
        <div className="mb-4">
          <img 
            src={`/images/logo_da.svg?v=${Date.now()}`}
            alt="Neotel" 
            style={{ width: '72px', height: '72px' }}
          />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          <button 
            onClick={() => navigate("/employees")}
            className="w-12 h-12 bg-[#1AC647] hover:bg-[#17b33d] rounded-xl flex items-center justify-center transition-all"
            title="Funcionários"
          >
            <Users className="w-6 h-6 text-white" />
          </button>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-12 h-12 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all"
          title="Sair"
        >
          <LogOut className="w-6 h-6 text-gray-400 hover:text-red-500" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employees")}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Perfil do Funcionário</h1>
              <p className="text-sm text-gray-500">Visualização detalhada de informações</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Employee Header */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#1AC647] rounded-xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{employee.name}</h2>
                  <p className="text-gray-600">{employee.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                  ID: {employee.id}
                </span>
                <span className="px-3 py-1.5 bg-[#1AC647]/10 text-[#1AC647] rounded-lg text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {employee.department}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                  <User className="w-5 h-5 text-[#1AC647]" />
                  <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                      CPF
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {employee.cpf}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                      RG
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {employee.rg}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                      Data de Nascimento
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {employee.birthDate}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                      Data de Admissão
                    </label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {employee.admissionDate}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                      Salário
                    </label>
                    <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-semibold">
                      {employee.salary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Banking */}
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <Mail className="w-5 h-5 text-[#1AC647]" />
                    <h3 className="text-lg font-semibold text-gray-900">Informações de Contato</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                        E-mail
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 break-all">
                        {employee.email}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                        Telefone
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {employee.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banking Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <CreditCard className="w-5 h-5 text-[#1AC647]" />
                    <h3 className="text-lg font-semibold text-gray-900">Dados Bancários</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                        Agência
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {employee.bankAgency}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase mb-1.5 block">
                        Conta Corrente
                      </label>
                      <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                        {employee.bankAccount}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
