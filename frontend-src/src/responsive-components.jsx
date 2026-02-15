import { useIsMobile } from "./hooks";

// Responsive grid - switches to single column on mobile
export function Grid({cols=2,gap=14,mobileCol=1,className="",style={},children}){
  const mobile=useIsMobile();
  return(
    <div className={className} style={{
      display:"grid",
      gridTemplateColumns:mobile?`repeat(${mobileCol},1fr)`:`repeat(${cols},1fr)`,
      gap,
      ...style,
    }}>{children}</div>
  );
}

// Sidebar layout (main + sidebar) - stacks on mobile
export function SidebarLayout({sidebarWidth=340,gap=24,style={},children}){
  const mobile=useIsMobile();
  return(
    <div style={{
      display:"grid",
      gridTemplateColumns:mobile?"1fr":`1fr ${sidebarWidth}px`,
      gap,
      alignItems:"flex-start",
      ...style,
    }}>{children}</div>
  );
}

// Button row - stacks on mobile
export function BtnRow({gap=14,style={},children}){
  const mobile=useIsMobile();
  return(
    <div style={{
      display:"flex",
      gap,
      justifyContent:"center",
      flexWrap:"wrap",
      flexDirection:mobile?"column":"row",
      alignItems:mobile?"stretch":"center",
      ...style,
    }}>{children}</div>
  );
}

// Hero section with responsive font sizes
export function HeroTitle({children,style={}}){
  const mobile=useIsMobile();
  return(
    <h1 style={{
      fontSize:mobile?26:36,
      fontWeight:300,
      margin:"16px 0 12px",
      letterSpacing:-0.8,
      lineHeight:1.15,
      ...style,
    }}>{children}</h1>
  );
}

export function HeroTitle2({children,style={}}){
  const mobile=useIsMobile();
  return(
    <h2 style={{
      fontSize:mobile?22:28,
      fontWeight:300,
      margin:0,
      ...style,
    }}>{children}</h2>
  );
}

// Section wrapper with responsive padding
export function Section({children,style={},maxWidth=960}){
  const mobile=useIsMobile();
  return(
    <div style={{
      padding:mobile?"40px 16px":"56px 24px",
      maxWidth,
      margin:"0 auto",
      ...style,
    }}>{children}</div>
  );
}

// Steps row (horizontal on desktop, vertical on mobile)
export function StepsRow({connector=true,connectorColor="#2A2E3A",children}){
  const mobile=useIsMobile();
  const items=Array.isArray(children)?children:[children];
  return(
    <div style={{
      display:"flex",
      flexDirection:mobile?"column":"row",
      gap:0,
      justifyContent:"center",
      alignItems:"center",
    }}>
      {items.map((child,i)=>(
        <div key={i} style={{display:"flex",flexDirection:mobile?"column":"row",alignItems:"center"}}>
          {child}
          {connector&&i<items.length-1&&(
            <div style={{
              width:mobile?2:32,
              height:mobile?24:2,
              background:connectorColor,
              flexShrink:0,
            }}/>
          )}
        </div>
      ))}
    </div>
  );
}
