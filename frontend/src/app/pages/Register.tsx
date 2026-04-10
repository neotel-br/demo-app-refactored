import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Usuário é obrigatório";
    } else if (formData.username.length < 3) {
      newErrors.username = "Usuário deve ter pelo menos 3 caracteres";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Import apiClient
        const { apiClient } = await import("../../lib/api");
        
        // Call API to register user
        const response = await apiClient.register(
          formData.name,
          formData.email,
          formData.username,
          formData.password
        );
        
        console.log("Usuário criado com sucesso:", response);
        
        // Show success message
        alert("✅ Conta criada com sucesso! Você será redirecionado para o login.");
        
        // Redirect to login
        navigate("/login");
      } catch (error) {
        console.error("Erro ao criar usuário:", error);
        
        // Parse error message from API
        let errorMessage = "Erro ao criar usuário. Tente novamente.";
        
        if (error instanceof Error) {
          if (error.message.includes("usuário já está em uso")) {
            errorMessage = "Nome de usuário já está em uso";
          } else if (error.message.includes("E-mail já está em uso")) {
            errorMessage = "E-mail já está em uso";
          } else if (error.message !== "API Error: undefined") {
            errorMessage = error.message;
          }
        }
        
        // Show error
        setErrors({ 
          ...errors, 
          submit: errorMessage
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1AC647]/5 via-white to-[#1AC647]/10 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Gradient accents */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#1AC647]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#1AC647]/10 rounded-full blur-3xl" />

      {/* Register container */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img 
            src={`/images/logo_demoapp.svg?v=${Date.now()}`}
            alt="Neotel" 
            style={{ height: '200px', width: 'auto' }}
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-lg">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1AC647] transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para Login
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Criar Nova Conta</h2>
            <p className="text-gray-600">Preencha os dados abaixo para se cadastrar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de Usuário
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Digite seu nome de usuário"
                    className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    className={`w-full pl-11 pr-11 py-3.5 bg-gray-50 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    className={`w-full pl-11 pr-11 py-3.5 bg-gray-50 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Error message for submit */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Botão Criar Conta */}
            <button
              type="submit"
              className="w-full mt-6 px-6 py-4 bg-[#1AC647] hover:bg-[#17b33d] text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              Criar Conta
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Powered by Neotel &copy; 2026.
        </p>
      </div>
    </div>
  );
}
