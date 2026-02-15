import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { AuthProvider } from "./auth";
import "./responsive.css";
import Accueil from "./pages/Accueil";
import Produit from "./pages/Produit";
import Tarifs from "./pages/Tarifs";
import Scenarios from "./pages/Scenarios";
import Ecoles from "./pages/Ecoles";
import EcolesTarifs from "./pages/EcolesTarifs";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AppDashboard from "./pages/AppDashboard";
import AppSession from "./pages/AppSession";

function ScrollToTop(){
  const { pathname } = useLocation();
  useEffect(()=>{ window.scrollTo(0,0); },[pathname]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ThemeProvider>
        <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Accueil/>}/>
          <Route path="/produit" element={<Produit/>}/>
          <Route path="/tarifs" element={<Tarifs/>}/>
          <Route path="/scenarios" element={<Scenarios/>}/>
          <Route path="/ecoles" element={<Ecoles/>}/>
          <Route path="/ecoles-tarifs" element={<EcolesTarifs/>}/>
          <Route path="/contact" element={<Contact/>}/>
          <Route path="/mentions-legales" element={<MentionsLegales/>}/>
          <Route path="/confidentialite" element={<Confidentialite/>}/>
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/app/login" element={<Login/>}/>
          <Route path="/app/dashboard" element={<AppDashboard/>}/>
          <Route path="/app/session/:id" element={<AppSession/>}/>
          <Route path="*" element={<Accueil/>}/>
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);
