import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/globals.css";
import { SafezyStoreProvider } from "./store/safezyStore.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SafezyStoreProvider>
      <App />
    </SafezyStoreProvider>
  </React.StrictMode>
);
