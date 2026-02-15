import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import OverlandFinder from "./OverlandFinder";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <OverlandFinder />
  </StrictMode>
);
