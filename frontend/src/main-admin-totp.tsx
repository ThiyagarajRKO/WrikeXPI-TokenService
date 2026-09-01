import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AdminTotp from "./pages/AdminTotp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminTotp />
  </StrictMode>,
);
