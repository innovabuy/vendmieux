import React, { Suspense, lazy, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
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

const Simulation = lazy(() => import("./pages/Simulation"));
const DemoPage = lazy(() => import("./pages/DemoPage"));
const DashboardPreview = lazy(() => import("./pages/DashboardPreview"));

// Redirect helper for /app/session/:id -> /debrief?session=:id
function SessionRedirect() {
  const { id } = useParams();
  useEffect(() => { window.location.href = '/debrief?session=' + encodeURIComponent(id); }, [id]);
  return null;
}

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
            <Route path="/simulation" element={<Simulation/>}/>
            <Route path="/app/simulation" element={<Simulation/>}/>
            <Route path="/demo" element={<DemoPage/>}/>
            <Route path="/app/demo" element={<DemoPage/>}/>
            <Route path="/app/dashboard-preview" element={<DashboardPreview/>}/>
            <Route path="/app" element={<Navigate to="/home" replace/>}/>
            <Route path="/app/login" element={<Navigate to="/login" replace/>}/>
            <Route path="/app/dashboard" element={<Navigate to="/home" replace/>}/>
            <Route path="/app/session/:id" element={<SessionRedirect/>}/>
            <Route path="*" element={<Navigate to="/home" replace/>}/>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  </BrowserRouter>
);
