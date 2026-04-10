import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/employees");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1AC647]/5 via-white to-[#1AC647]/10 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Gradient accents */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#1AC647]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#1AC647]/10 rounded-full blur-3xl" />

      {/* Login container */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-4">
          <img 
            src={`/images/logo_demoapp.svg?v=${Date.now()}`}
            alt="Neotel" 
            style={{ height: '280px', width: 'auto' }}
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Bem-vindo</h2>
            <p className="text-gray-600">Entre com suas credenciais para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1AC647] focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 px-6 py-4 bg-[#1AC647] hover:bg-[#17b33d] text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              Entrar
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              Não tem uma conta? <button onClick={() => navigate("/register")} className="text-[#1AC647] hover:text-[#17b33d] font-medium">Criar conta</button>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-8">
          Powered by Neotel &copy; 2026.
        </p>
      </div>
    </div>
  );
}
