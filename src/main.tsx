import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { WorkOrderProvider } from "./hooks/useWorkOrders";
import { ToastProvider } from "./components/ui/Toast/Toast";
import "./styles/variables.css";
import "./styles/typography.css";
import "./styles/animations.css";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ToastProvider>
                <AuthProvider>
                    <WorkOrderProvider>
                        <App />
                    </WorkOrderProvider>
                </AuthProvider>
            </ToastProvider>
        </BrowserRouter>
    </React.StrictMode>
);