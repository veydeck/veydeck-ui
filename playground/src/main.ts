import { createApp } from "vue";
import App from "./App.vue";
import GlassLab from "./GlassLab.vue";
import "@veydeck/tokens/index.css";
import "@veydeck/vue/style.css";
import "./index.css";

createApp(
  new URLSearchParams(location.search).has("glass") ? GlassLab : App,
).mount("#app");
