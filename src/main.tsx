import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// تطبيق RTL على المستوى العام
document.documentElement.lang = 'ar';
document.documentElement.dir = 'rtl';

createRoot(document.getElementById("root")!).render(<App />);
