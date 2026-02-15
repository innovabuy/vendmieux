import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme";
import "./responsive.css";
import Accueil from "./pages/Accueil";
import Produit from "./pages/Produit";
import Tarifs from "./pages/Tarifs";
import Scenarios from "./pages/Scenarios";
import Ecoles from "./pages/Ecoles";
import Contact from "./pages/Contact";
import MentionsLegales from "./pages/MentionsLegales";
import Confidentialite from "./pages/Confidentialite";
import Dashboard from "./pages/Dashboard";

function ScrollToTop(){
  const { pathname } = useLocation();
  useEffect(()=>{ window.scrollTo(0,0); },[pathname]);
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <ScrollToTop/>
      <Routes>
        <Route path="/" element={<Accueil/>}/>
        <Route path="/produit" element={<Produit/>}/>
        <Route path="/tarifs" element={<Tarifs/>}/>
        <Route path="/scenarios" element={<Scenarios/>}/>
        <Route path="/ecoles" element={<Ecoles/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path="/mentions-legales" element={<MentionsLegales/>}/>
        <Route path="/confidentialite" element={<Confidentialite/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="*" element={<Accueil/>}/>
      </Routes>
    </ThemeProvider>
  </BrowserRouter>
);
