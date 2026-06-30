import React from "react";
import { createRoot } from "react-dom/client";
import { PracticeApp } from "./components/PracticeApp";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <PracticeApp />
  </React.StrictMode>
);

