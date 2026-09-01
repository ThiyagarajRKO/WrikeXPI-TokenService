import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import RootLogin from "./pages/RootLogin";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootLogin />
  </StrictMode>,
);
