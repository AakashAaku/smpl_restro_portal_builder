import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css";

console.log("Main.tsx: Mounting application...");

const container = document.getElementById("root");
if (!container) {
    console.error("Main.tsx: Target container #root not found!");
} else {
    createRoot(container).render(<App />);
    console.log("Main.tsx: Render called.");
}
