import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PortalHome from "./pages/PortalHome";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PortalHome />
  </StrictMode>,
);
