import { NavLink, Outlet } from "react-router-dom";
import {
  IconPedidos,
  IconModelos,
  IconPrazos,
  IconClientes,
  IconPainel,
  IconConfig,
} from "./icons";

const abas = [
  { to: "/", label: "Pedidos", icon: IconPedidos, end: true },
  { to: "/modelos", label: "Modelos", icon: IconModelos, end: false },
  { to: "/prazos", label: "Prazos", icon: IconPrazos, end: false },
  { to: "/clientes", label: "Clientes", icon: IconClientes, end: false },
  { to: "/painel", label: "Painel", icon: IconPainel, end: false },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-sand-200 bg-cream/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 text-base shadow-sm shadow-rose-500/30">
            🧶
          </span>
          <span className="text-lg font-extrabold tracking-tight text-ink-800">PontoCerto</span>
        </div>
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `rounded-xl p-2 transition ${
              isActive ? "bg-rose-50 text-rose-600" : "text-ink-400 hover:bg-sand-100 hover:text-ink-700"
            }`
          }
          aria-label="Configurações"
        >
          <IconConfig className="h-5 w-5" />
        </NavLink>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-sand-200 bg-white/90 shadow-[0_-4px_20px_-8px_rgba(43,36,32,0.12)] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 py-1">
          {abas.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${
                  isActive ? "bg-rose-50 text-rose-600" : "text-ink-400 hover:text-rose-500"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
