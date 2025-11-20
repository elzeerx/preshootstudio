import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// تطبيق RTL والسمات الجمالية على المستوى العام
document.documentElement.lang = "ar";
document.documentElement.dir = "rtl";
document.documentElement.classList.add("theme-aura");
document.body.classList.add("theme-aura", "bg-aura-dark", "text-white");

createRoot(document.getElementById("root")!).render(<App />);
