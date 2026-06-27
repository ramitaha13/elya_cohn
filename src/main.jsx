import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

import Home from "./component/home.jsx";
import LoginPage from "./component/loginpage.jsx";
import Dashboardpage from "./component/dashboardpage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboardpage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
