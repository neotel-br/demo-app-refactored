import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Mail, Phone, Calendar, DollarSign, Building2, Briefcase } from "lucide-react";
import { apiClient } from "../../lib/api";

interface Department {
  id: number;
  department_name: string;
  department_icon: string;
}

interface Position {
  id: number;
  position_name: string;
  department: number;
}

export default function AddEmployee() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    employee_name: "",
    department_id: "",
    position_id: "",
    employee_cpf: "",
    employee_rg: "",
    employee_birthdate: "",
    employee_startdate: "",
    employee_salary: "",
    employee_email: "",
    employee_phone: "",
    employee_bank: "",
    employee_agency: "",
    employee_cc: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depts, poss] = await Promise.all([
        apiClient.getDepartments(),
        apiClient.getPositions()
      ]);
      setDepartments(depts);
      setPositions(poss);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setErrors({ submit: "Erro ao carregar departamentos e cargos" });
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // When department changes, filter positions
    if (name === "department_id") {
      const filtered = positions.filter(p => p.department === parseInt(value));
      setFilteredPositions(filtered);
      setFormData({ ...formData, department_id: value, position_id: "" });
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_name.trim()) newErrors.employee_name = "Nome é obrigatório";
    if (!formData.department_id) newErrors.department_id = "Departamento é obrigatório";
    if (!formData.position_id) newErrors.position_id = "Cargo é obrigatório";
    if (!formData.employee_cpf.trim()) newErrors.employee_cpf = "CPF é obrigatório";
    if (!formData.employee_rg.trim()) newErrors.employee_rg = "RG é obrigatório";
    if (!formData.employee_birthdate) newErrors.employee_birthdate = "Data de nascimento é obrigatória";
    if (!formData.employee_startdate) newErrors.employee_startdate = "Data de admissão é obrigatória";
    if (!formData.employee_salary) newErrors.employee_salary = "Salário é obrigatório";
    if (!formData.employee_email.trim()) newErrors.employee_email = "E-mail é obrigatório";
    if (!formData.employee_phone.trim()) newErrors.employee_phone = "Telefone é obrigatório";
    if (!formData.employee_bank.trim()) newErrors.employee_bank = "Banco é obrigatório";
    if (!formData.employee_agency.trim()) newErrors.employee_agency = "Agência é obrigatória";
    if (!formData.employee_cc.trim()) newErrors.employee_cc = "Conta corrente é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      await apiClient.createEmployee({
        ...formData,
        department_id: parseInt(formData.department_id),
        position_id: parseInt(formData.position_id)
      });
      
      alert("✅ Funcionário criado com sucesso!");
      navigate("/employees");
    } catch (error: any) {
      console.error("Erro ao criar funcionário:", error);
      setErrors({ 
        submit: error.message || "Erro ao criar funcionário. Tente novamente."
      });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/employees")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1AC647] transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Funcionários
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Adicionar Funcionário</h1>
          <p className="text-gray-600 mt-2">Preencha os dados do novo funcionário</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Dados Pessoais */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#1AC647]" />
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    name="employee_name"
                    value={formData.employee_name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="Nome completo do funcionário"
                  />
                  {errors.employee_name && <p className="mt-1 text-sm text-red-600">{errors.employee_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
                  <input
                    type="text"
                    name="employee_cpf"
                    value={formData.employee_cpf}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_cpf ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="000.000.000-00"
                  />
                  {errors.employee_cpf && <p className="mt-1 text-sm text-red-600">{errors.employee_cpf}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">RG *</label>
                  <input
                    type="text"
                    name="employee_rg"
                    value={formData.employee_rg}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_rg ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="00.000.000-0"
                  />
                  {errors.employee_rg && <p className="mt-1 text-sm text-red-600">{errors.employee_rg}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento *</label>
                  <input
                    type="date"
                    name="employee_birthdate"
                    value={formData.employee_birthdate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_birthdate ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                  />
                  {errors.employee_birthdate && <p className="mt-1 text-sm text-red-600">{errors.employee_birthdate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Admissão *</label>
                  <input
                    type="date"
                    name="employee_startdate"
                    value={formData.employee_startdate}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_startdate ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                  />
                  {errors.employee_startdate && <p className="mt-1 text-sm text-red-600">{errors.employee_startdate}</p>}
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#1AC647]" />
                Dados Profissionais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
                  <select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.department_id ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                  >
                    <option value="">Selecione o departamento</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.department_name}</option>
                    ))}
                  </select>
                  {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
                  <select
                    name="position_id"
                    value={formData.position_id}
                    onChange={handleChange}
                    disabled={!formData.department_id}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.position_id ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647] disabled:opacity-50`}
                  >
                    <option value="">Selecione o cargo</option>
                    {filteredPositions.map(pos => (
                      <option key={pos.id} value={pos.id}>{pos.position_name}</option>
                    ))}
                  </select>
                  {errors.position_id && <p className="mt-1 text-sm text-red-600">{errors.position_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salário *</label>
                  <input
                    type="number"
                    name="employee_salary"
                    value={formData.employee_salary}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_salary ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="5000"
                  />
                  {errors.employee_salary && <p className="mt-1 text-sm text-red-600">{errors.employee_salary}</p>}
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1AC647]" />
                Contato
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
                  <input
                    type="email"
                    name="employee_email"
                    value={formData.employee_email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="email@example.com"
                  />
                  {errors.employee_email && <p className="mt-1 text-sm text-red-600">{errors.employee_email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="text"
                    name="employee_phone"
                    value={formData.employee_phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_phone ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="(11) 99999-9999"
                  />
                  {errors.employee_phone && <p className="mt-1 text-sm text-red-600">{errors.employee_phone}</p>}
                </div>
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#1AC647]" />
                Dados Bancários
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Banco *</label>
                  <input
                    type="text"
                    name="employee_bank"
                    value={formData.employee_bank}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_bank ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="Banco do Brasil"
                  />
                  {errors.employee_bank && <p className="mt-1 text-sm text-red-600">{errors.employee_bank}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Agência *</label>
                  <input
                    type="text"
                    name="employee_agency"
                    value={formData.employee_agency}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_agency ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="0001"
                  />
                  {errors.employee_agency && <p className="mt-1 text-sm text-red-600">{errors.employee_agency}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conta Corrente *</label>
                  <input
                    type="text"
                    name="employee_cc"
                    value={formData.employee_cc}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${
                      errors.employee_cc ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1AC647]`}
                    placeholder="12345-6"
                  />
                  {errors.employee_cc && <p className="mt-1 text-sm text-red-600">{errors.employee_cc}</p>}
                </div>
              </div>
            </div>

            {/* Error message */}
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Submit button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-[#1AC647] hover:bg-[#17b33d] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Criando..." : "Criar Funcionário"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
