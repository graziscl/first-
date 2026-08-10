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
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-lilac-100 bg-cream/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧶</span>
          <span className="text-lg font-bold text-ink-800">PontoCerto</span>
        </div>
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `rounded-full p-2 transition ${
              isActive ? "bg-lilac-100 text-lilac-700" : "text-ink-400 hover:bg-lilac-50 hover:text-lilac-600"
            }`
          }
          aria-label="Configurações"
        >
          <IconConfig className="h-6 w-6" />
        </NavLink>
      </header>

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-lilac-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 py-1">
          {abas.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 text-[11px] font-medium transition ${
                  isActive ? "bg-rose-100 text-rose-600" : "text-ink-400 hover:text-rose-500"
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
