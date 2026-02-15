import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const darkColors = {
  bg:"#0C0E13",bgC:"#14171E",bgE:"#1C2029",
  bd:"#2A2E3A",tx:"#E8E6E1",mt:"#8B8D95",dm:"#84868E",
  ac:"#D4854A",acL:"#E89B5E",acD:"rgba(212,133,74,0.15)",
  ok:"#3DB06B",okD:"rgba(61,176,107,0.15)",
  bl:"#4A7FD4",blD:"rgba(74,127,212,0.12)",
  wr:"#D4A84A",wrD:"rgba(212,168,74,0.15)",
  dn:"#D45A5A",dnD:"rgba(212,90,90,0.15)",
  vi:"#8B5ECF",viD:"rgba(139,94,207,0.12)",
};

export const lightColors = {
  bg:"#F5F3EF",bgC:"#FFFFFF",bgE:"#EDEAE4",
  bd:"#D8D5CE",tx:"#1A1A1A",mt:"#5C5C5C",dm:"#8C8C8C",
  ac:"#C47539",acL:"#D4854A",acD:"rgba(196,117,57,0.12)",
  ok:"#2D8F55",okD:"rgba(45,143,85,0.12)",
  bl:"#3A6BBF",blD:"rgba(58,107,191,0.10)",
  wr:"#B8922E",wrD:"rgba(184,146,46,0.12)",
  dn:"#C04444",dnD:"rgba(192,68,68,0.12)",
  vi:"#7548B2",viD:"rgba(117,72,178,0.10)",
};

export function ThemeProvider({children}){
  const [isDark,setIsDark]=useState(()=>{
    try { return localStorage.getItem("vm-theme")!=="light"; } catch { return true; }
  });
  const [showToast,setShowToast]=useState(()=>{
    try { return !localStorage.getItem("vm-theme-seen"); } catch { return true; }
  });

  useEffect(()=>{
    try { localStorage.setItem("vm-theme",isDark?"dark":"light"); } catch {}
  },[isDark]);

  const dismissToast=()=>{
    setShowToast(false);
    try { localStorage.setItem("vm-theme-seen","1"); } catch {}
  };

  const toggle=()=>setIsDark(d=>!d);
  const colors=isDark?darkColors:lightColors;

  return(
    <ThemeContext.Provider value={{isDark,toggle,colors}}>
      <div style={{background:colors.bg,color:colors.tx,minHeight:"100vh",transition:"background 0.3s, color 0.3s"}}>
        {children}
        {showToast&&<ThemeToast isDark={isDark} toggle={toggle} dismiss={dismissToast} colors={colors}/>}
      </div>
    </ThemeContext.Provider>
  );
}

function ThemeToast({isDark,toggle,dismiss,colors}){
  return(
    <div style={{
      position:"fixed",bottom:24,right:24,zIndex:300,
      background:colors.bgC,border:`1px solid ${colors.bd}`,
      borderRadius:16,padding:"16px 20px",maxWidth:320,
      boxShadow:"0 8px 32px rgba(0,0,0,0.3)",
      animation:"toastSlideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:600}}>🌓 Mode d'affichage</span>
        <button onClick={dismiss} style={{background:"none",border:"none",color:colors.dm,fontSize:16,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
      </div>
      <p style={{fontSize:12,color:colors.mt,lineHeight:1.5,margin:"0 0 12px"}}>
        Le site est en mode {isDark?"sombre":"clair"}. Vous pouvez changer à tout moment avec le toggle en haut à droite.
      </p>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>{toggle();dismiss();}} style={{
          flex:1,padding:"8px 14px",borderRadius:8,border:`1px solid ${colors.bd}`,
          background:colors.bgE,color:colors.tx,fontSize:12,fontWeight:600,cursor:"pointer",
        }}>
          Passer en {isDark?"clair ☀️":"sombre 🌙"}
        </button>
        <button onClick={dismiss} style={{
          padding:"8px 14px",borderRadius:8,border:"none",
          background:colors.ac,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",
        }}>
          OK
        </button>
      </div>
      <style>{`@keyframes toastSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

export function useTheme(){ return useContext(ThemeContext); }

export function ThemeToggle(){
  const {isDark,toggle,colors}=useTheme();
  return(
    <button onClick={toggle} title={isDark?"Passer en mode clair":"Passer en mode sombre"} style={{
      width:36,height:36,borderRadius:8,border:`1px solid ${colors.bd}`,
      background:colors.bgE,display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:16,cursor:"pointer",color:colors.tx,transition:"all 0.2s",flexShrink:0,
    }}>
      {isDark?"☀️":"🌙"}
    </button>
  );
}
