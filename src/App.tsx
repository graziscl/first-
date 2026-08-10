import { HashRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import KanbanPage from "./pages/KanbanPage";
import ModelosPage from "./pages/ModelosPage";
import PrazosPage from "./pages/PrazosPage";
import ClientesPage from "./pages/ClientesPage";
import DashboardPage from "./pages/DashboardPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";

export default function App() {
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
