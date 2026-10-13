import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@veydeck/tokens/index.css";
import "@veydeck/react/style.css";
import "./index.css";
import App from "./App";
import GlassLab from "./GlassLab";
import { VeyGlassProvider } from "@veydeck/react";

const Content = new URLSearchParams(location.search).has("glass")
  ? GlassLab
  : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VeyGlassProvider>
      <Content />
    </VeyGlassProvider>
  </StrictMode>,
);
