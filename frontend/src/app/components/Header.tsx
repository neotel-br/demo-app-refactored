import { Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const styles = `
  .hdr-root {
    height: 56px;
    background: #ffffff;
    border-bottom: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.5rem;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
    flex-shrink: 0;
    z-index: 10;
  }

  .hdr-left {
    display: flex;
    align-items: center;
    gap: 0.875rem;
  }

  .hdr-logo {
    display: flex;
    align-items: center;
    gap: 0.5625rem;
  }

  .hdr-logo-mark {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(5,150,105,0.3);
  }

  .hdr-logo-name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.03em;
  }

  .hdr-sep {
    width: 1px;
    height: 18px;
    background: #E5E7EB;
    flex-shrink: 0;
  }

  .hdr-section {
    font-size: 0.8125rem;
    color: #9CA3AF;
    font-weight: 500;
    white-space: nowrap;
  }

  .hdr-right {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .hdr-icon-btn {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    background: transparent;
    color: #9CA3AF;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    position: relative;
  }

  .hdr-icon-btn:hover {
    background: #F9FAFB;
    color: #374151;
    border-color: #D1D5DB;
  }

  .hdr-notif-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #059669;
    border: 1.5px solid #ffffff;
  }

  .hdr-user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3125rem 0.625rem 0.3125rem 0.3125rem;
    border-radius: 8px;
    border: 1px solid #E5E7EB;
    background: transparent;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
    margin-left: 0.125rem;
  }

  .hdr-user-btn:hover {
    background: #F9FAFB;
    border-color: #D1D5DB;
  }

  .hdr-avatar {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0;
    flex-shrink: 0;
  }

  .hdr-user-name {
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    letter-spacing: -0.01em;
    white-space: nowrap;
  }

  .hdr-chevron {
    color: #9CA3AF;
    flex-shrink: 0;
  }
`;

export function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const toastId = toast.loading("Saindo...");
    try {
      await apiClient.logout();
      toast.success("Logout realizado com sucesso!", { id: toastId });
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout", { id: toastId });
    }
  };

  return (
    <>
      <style>{styles}</style>

      <header className="hdr-root">
        {/* Left */}
        <div className="hdr-left">
          <div className="hdr-logo">
            <div className="hdr-logo-mark">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {/* Person */}
                <circle cx="7" cy="4.5" r="2" fill="rgba(255,255,255,0.95)" />
                {/* Team arc */}
                <path
                  d="M2.5 12C2.5 9.51472 4.51472 7.5 7 7.5C9.48528 7.5 11.5 9.51472 11.5 12"
                  stroke="rgba(255,255,255,0.85)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="hdr-logo-name">DemoApp</span>
          </div>

          <div className="hdr-sep" />
          <span className="hdr-section">Gestão de Pessoas</span>
        </div>

        {/* Right */}
        <div className="hdr-right">
          {/* Notifications */}
          <button className="hdr-icon-btn">
            <Bell size={14} />
            <div className="hdr-notif-dot" />
          </button>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hdr-user-btn">
                <div className="hdr-avatar">AD</div>
                <span className="hdr-user-name">admin</span>
                <ChevronDown size={11} className="hdr-chevron" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 bg-white border-[#E5E7EB] shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <DropdownMenuLabel
                className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]"
                style={{ padding: "0.625rem 0.75rem 0.375rem" }}
              >
                Minha Conta
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#F3F4F6]" />
              <DropdownMenuItem
                className="text-[#374151] focus:text-[#111827] focus:bg-[#F9FAFB] text-[0.8125rem] cursor-pointer"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <User className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#F3F4F6]" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-[#DC2626] focus:text-[#B91C1C] focus:bg-[#FEF2F2] cursor-pointer text-[0.8125rem]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
