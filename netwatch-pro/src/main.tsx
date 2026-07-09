import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { initDatabase } from "./lib/db";
import "./index.css";

async function bootstrap() {
  try {
    await initDatabase();
  } catch (err) {
    console.error("DB init failed", err);
  }
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}

bootstrap();
