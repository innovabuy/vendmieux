import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./theme";
import { AuthProvider } from "./auth";
import Head from "./components/Head";
import "./responsive.css";
import "@fontsource/dm-sans/latin-200.css";
import "@fontsource/dm-sans/latin-300.css";
import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/dm-sans/latin-700.css";
import "@fontsource/dm-sans/latin-800.css";

const Accueil = lazy(() => import("./pages/Accueil"));
const Produit = lazy(() => import("./pages/Produit"));
const Tarifs = lazy(() => import("./pages/Tarifs"));
const Scenarios = lazy(() => import("./pages/Scenarios"));
const Ecoles = lazy(() => import("./pages/Ecoles"));
const EcolesTarifs = lazy(() => import("./pages/EcolesTarifs"));
const Contact = lazy(() => import("./pages/Contact"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Login = lazy(() => import("./pages/Login"));
const AppDashboard = lazy(() => import("./pages/AppDashboard"));
const AppSession = lazy(() => import("./pages/AppSession"));

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
        <Head/>
        <Suspense fallback={<div style={{minHeight:"100vh",background:"#0C0E13"}}></div>}>
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
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);
