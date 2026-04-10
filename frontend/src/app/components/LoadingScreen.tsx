import { Shield } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950">
      <div className="text-center">
        <div className="relative inline-flex mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Vormetric Tokenization Server</h2>
        <p className="text-slate-400 text-sm">Initializing secure environment...</p>
      </div>
    </div>
  );
}
