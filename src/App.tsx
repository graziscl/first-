import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useAppStore } from "./store";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import PaywallPage from "./pages/PaywallPage";
import KanbanPage from "./pages/KanbanPage";
import ModelosPage from "./pages/ModelosPage";
import PrazosPage from "./pages/PrazosPage";
import ClientesPage from "./pages/ClientesPage";
import DashboardPage from "./pages/DashboardPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";

export default function App() {
  const session = useAppStore((s) => s.session);
  const carregando = useAppStore((s) => s.carregando);
  const assinaturaAtiva = useAppStore((s) => s.assinaturaAtiva);
  const inicializar = useAppStore((s) => s.inicializar);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <span className="text-3xl">🧶</span>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!assinaturaAtiva) {
    return <PaywallPage />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<KanbanPage />} />
          <Route path="modelos" element={<ModelosPage />} />
          <Route path="prazos" element={<PrazosPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="painel" element={<DashboardPage />} />
          <Route path="configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
