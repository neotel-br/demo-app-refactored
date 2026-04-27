import { createBrowserRouter } from "react-router";
import PortalTransparencia from "./pages/PortalTransparencia";
import PortalAdmin from "./pages/PortalAdmin";
import AppFlowDiagram from "./pages/AppFlowDiagram";
import ArquiteturaFlow from "../components/ArquiteturaFlow";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PortalTransparencia />,
  },
  {
    path: "/gerenciar",
    element: <PortalAdmin />,
  },
  {
    path: "/admin/flow",
    element: <AppFlowDiagram />,
  },
  {
    path: "/arquitetura",
    element: <ArquiteturaFlow />,
  },
]);
