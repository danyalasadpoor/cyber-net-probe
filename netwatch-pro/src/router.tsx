import { createHashRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import Scanner from "./pages/Scanner";
import Logs from "./pages/Logs";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Settings from "./pages/Settings";

export const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "targets", element: <Targets /> },
      { path: "scanner", element: <Scanner /> },
      { path: "logs", element: <Logs /> },
      { path: "analytics", element: <Analytics /> },
      { path: "history", element: <History /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
