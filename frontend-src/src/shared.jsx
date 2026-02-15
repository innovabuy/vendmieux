import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme, ThemeToggle, darkColors } from "./theme";

export const C = darkColors;

export function useColors(){ 
  try { const {colors}=useTheme(); return colors; } catch { return darkColors; }
}

export function Badge({children,color="accent",bg:customBg,textColor}){
  const c=useColors();
  const map={accent:{b:c.acD,t:c.ac},ok:{b:c.okD,t:c.ok},warn:{b:c.wrD,t:c.wr},danger:{b:c.dnD,t:c.dn},blue:{b:c.blD,t:c.bl},muted:{b:"rgba(139,141,149,0.12)",t:c.mt},violet:{b:c.viD,t:c.vi}};
  const m=map[color]||map.accent;
  return <span style={{display:"inline-flex",padding:"3px 10px",borderRadius:16,fontSize:10,fontWeight:700,letterSpacing:0.3,background:customBg||m.b,color:textColor||m.t,textTransform:"uppercase"}}>{children}</span>;
}

export function Avatar({name,gender="M",size=32}){
  const ini=name.split(" ").map(n=>n[0]).join("").slice(0,2);
  const bg=gender==="F"?["#8B5E83","#6B4E73"]:["#4A6B8A","#3A5B7A"];
  return <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${bg[0]},${bg[1]})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:700,color:"#fff",flexShrink:0}}>{ini}</div>;
}

export function WaveformAnim(){
  const c=useColors();
  const [f,setF]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setF(v=>v+1),60);return()=>clearInterval(id);},[]);
  return(
    <div style={{display:"flex",alignItems:"center",gap:2,height:40}}>
      {Array.from({length:32}).map((_,i)=>{
        const n=Math.sin(f*0.08+i*0.5)*0.5+Math.sin(f*0.04+i*0.8)*0.3+0.4;
        const h=Math.max(4,Math.abs(n)*40);
        return <div key={i} style={{width:3,height:h,borderRadius:2,background:c.ac,opacity:0.5+Math.abs(n)*0.5,transition:"height 0.1s"}}/>
      })}
    </div>
  );
}

export function CountUp({target,suffix="",duration=2000}){
  const [val,setVal]=useState(0);
  const [started,setStarted]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setStarted(true),300);return()=>clearTimeout(t);},[]);
  useEffect(()=>{
    if(!started)return;
    const steps=40;const inc=target/steps;let curr=0;
    const id=setInterval(()=>{curr+=inc;if(curr>=target){setVal(target);clearInterval(id);}else setVal(Math.round(curr));},duration/steps);
    return()=>clearInterval(id);
  },[started,target,duration]);
  return <span>{val}{suffix}</span>;
}

export function MiniSparkline({data,color,w=64,h=22}){
  const c=useColors();
  const col=color||c.ac;
  const max=Math.max(...data);const min=Math.min(...data);const range=max-min||1;
  const pts=data.map((v,i)=>{const x=(i/(data.length-1))*w;const y=h-((v-min)/range)*(h-4)-2;return`${x},${y}`;}).join(" ");
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <polyline points={pts} fill="none" stroke={col} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={parseFloat(pts.split(" ").pop().split(",")[1])} r={2.5} fill={col}/>
    </svg>
  );
}

export function Nav({active=""}){
  const c=useColors();
  const [menuOpen,setMenuOpen]=useState(false);
  const links=[
    {label:"Accueil",to:"/"},
    {label:"Produit",to:"/produit"},
    {label:"Scénarios",to:"/scenarios"},
    {label:"Tarifs",to:"/tarifs"},
    {label:"Écoles",to:"/ecoles"},
    {label:"Contact",to:"/contact"},
  ];
  return(
    <>
      <div className="vm-nav" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 24px",borderBottom:`1px solid ${c.bd}`,background:`${c.bg}E0`,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100,transition:"background 0.3s"}}>
        <Link to="/" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:c.tx}}>
          <div style={{width:32,height:32,borderRadius:8,background:`linear-gradient(135deg,${c.ac},${c.acL})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff"}}>V</div>
          <span style={{fontSize:16,fontWeight:600,letterSpacing:-0.3}}>Vend<span style={{color:c.ac}}>Mieux</span></span>
        </Link>
        {/* Desktop links */}
        <div className="vm-nav-links" style={{display:"flex",gap:16,alignItems:"center"}}>
          {links.map(l=>(
            <Link key={l.to} to={l.to} style={{fontSize:13,color:active===l.label?c.ac:c.mt,textDecoration:"none",fontWeight:active===l.label?600:400}}>{l.label}</Link>
          ))}
          <ThemeToggle/>
          <Link to="/contact" className="vm-cta-btn" style={{padding:"8px 18px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${c.ac},${c.acL})`,color:"#fff",fontSize:13,fontWeight:600,textDecoration:"none"}}>Essai gratuit</Link>
        </div>
        {/* Mobile burger */}
        <div className="vm-nav-mobile" style={{display:"none",alignItems:"center",gap:10}}>
          <ThemeToggle/>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{width:36,height:36,borderRadius:8,border:`1px solid ${c.bd}`,background:c.bgE,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexDirection:"column",gap:4,padding:8}}>
            <div style={{width:16,height:2,background:c.tx,borderRadius:1,transition:"all 0.2s",transform:menuOpen?"rotate(45deg) translateY(3px)":"none"}}/>
            <div style={{width:16,height:2,background:c.tx,borderRadius:1,transition:"all 0.2s",opacity:menuOpen?0:1}}/>
            <div style={{width:16,height:2,background:c.tx,borderRadius:1,transition:"all 0.2s",transform:menuOpen?"rotate(-45deg) translateY(-3px)":"none"}}/>
          </button>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen&&(
        <div style={{position:"fixed",top:60,left:0,right:0,bottom:0,background:`${c.bg}F5`,backdropFilter:"blur(16px)",zIndex:99,padding:"24px",display:"flex",flexDirection:"column",gap:4}}>
          {links.map(l=>(
            <Link key={l.to} to={l.to} onClick={()=>setMenuOpen(false)} style={{display:"block",padding:"14px 16px",borderRadius:10,fontSize:16,fontWeight:active===l.label?600:400,color:active===l.label?c.ac:c.tx,background:active===l.label?c.acD:"transparent",textDecoration:"none"}}>{l.label}</Link>
          ))}
          <div style={{marginTop:16}}>
            <Link to="/contact" onClick={()=>setMenuOpen(false)} style={{display:"block",padding:"14px 24px",borderRadius:10,background:`linear-gradient(135deg,${c.ac},${c.acL})`,color:"#fff",fontSize:16,fontWeight:600,textDecoration:"none",textAlign:"center"}}>Essai gratuit</Link>
          </div>
        </div>
      )}
    </>
  );
}

export function Footer(){
  const c=useColors();
  return(
    <div style={{borderTop:`1px solid ${c.bd}`,padding:"32px 24px",maxWidth:1100,margin:"0 auto"}}>
      <div className="vm-footer-grid" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:32}}>
        <div>
          <Link to="/" style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,textDecoration:"none",color:c.tx}}>
            <div style={{width:28,height:28,borderRadius:7,background:`linear-gradient(135deg,${c.ac},${c.acL})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff"}}>V</div>
            <span style={{fontSize:14,fontWeight:600}}>Vend<span style={{color:c.ac}}>Mieux</span></span>
          </Link>
          <p style={{fontSize:12,color:c.dm,maxWidth:280,lineHeight:1.5,margin:0}}>Simulateur vocal IA de formation commerciale.<br/>Conçu en France pour les PME françaises.</p>
          <p style={{fontSize:11,color:c.dm,marginTop:8}}>SASU INNOVABUY · SIRET 931 378 368 00019</p>
        </div>
        <div className="vm-footer-links" style={{display:"flex",gap:40}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:c.mt,textTransform:"uppercase",marginBottom:12}}>Produit</div>
            {[{l:"Comment ça marche",to:"/produit"},{l:"Tarifs",to:"/tarifs"},{l:"Scénarios",to:"/scenarios"},{l:"Écoles",to:"/ecoles"}].map(x=><Link key={x.to} to={x.to} style={{display:"block",fontSize:12,color:c.dm,textDecoration:"none",marginBottom:8}}>{x.l}</Link>)}
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1,color:c.mt,textTransform:"uppercase",marginBottom:12}}>Ressources</div>
            {[{l:"Contact",to:"/contact"},{l:"Mentions légales",to:"/mentions-legales"},{l:"Confidentialité",to:"/confidentialite"}].map(x=><Link key={x.l} to={x.to} style={{display:"block",fontSize:12,color:c.dm,textDecoration:"none",marginBottom:8}}>{x.l}</Link>)}
          </div>
        </div>
      </div>
      <div style={{borderTop:`1px solid ${c.bd}`,marginTop:24,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:11,color:c.dm}}>© 2026 VendMieux — SASU INNOVABUY (Cap Performances)</span>
        <span style={{fontSize:11,color:c.dm}}>Hébergé en France 🇫🇷</span>
      </div>
    </div>
  );
}
