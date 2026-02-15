import { useState } from "react";
import { useColors, Badge, Nav, Footer } from "../shared";

function Input({ label,type="text",placeholder,textarea,value,onChange }){

  const C = useColors(); const shared={ width:"100%",padding:textarea?"12px 16px":"11px 16px",background:C.bgE,border:`1px solid ${ C.bd }`,borderRadius:10,color:C.tx,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",transition:"border-color 0.2s" };
  return(
    <div style={ { marginBottom:16 } }>
      <label style={ { display:"block",fontSize:11,fontWeight:600,letterSpacing:0.5,color:C.mt,marginBottom:6,textTransform:"uppercase" } }>{ label }</label>
      { textarea
        ? <textarea rows={ 4 } placeholder={ placeholder } value={ value } onChange={ onChange } style={ { ...shared,resize:"vertical" } } onFocus={ e=>e.target.style.borderColor=C.ac } onBlur={ e=>e.target.style.borderColor=C.bd }/>
        : <input type={ type } placeholder={ placeholder } value={ value } onChange={ onChange } style={ shared } onFocus={ e=>e.target.style.borderColor=C.ac } onBlur={ e=>e.target.style.borderColor=C.bd }/> }
    </div>
  ); }

export default function Contact(){
  const C = useColors(); const [form,setForm]=useState({ name:"",email:"",company:"",phone:"",subject:"demo",message:"" });
  const [sent,setSent]=useState(false);
  const [tab,setTab]=useState("rdv");

  const subjects=[
    { value:"demo",label:"Demander une démo" },
    { value:"devis",label:"Devis école" },
    { value:"partenariat",label:"Partenariat" },
    { value:"support",label:"Support" },
    { value:"autre",label:"Autre" },
  ];

  const handleSubmit=()=>{ setSent(true);setTimeout(()=>setSent(false),4000); };

  return(
    <div style={ { minHeight:"100vh",background:C.bg,color:C.tx,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif" } }>
      <Nav active="Contact"/>

      <div className="vm-hero" style={ { textAlign:"center",padding:"56px 24px 32px" } }>
        <Badge color="accent">Contact</Badge>
        <h1 className="vm-h1" style={ { fontSize:36,fontWeight:300,margin:"16px 0 12px",letterSpacing:-0.8 } }>Parlons de <span style={ { fontWeight:700,color:C.ac } }>votre équipe</span></h1>
        <p style={ { fontSize:15,color:C.mt,maxWidth:480,margin:"0 auto",lineHeight:1.6 } }>Une question, une démo, un devis ? On répond sous 24h. Ou réservez directement un créneau.</p>
      </div>

      <div style={ { display:"flex",justifyContent:"center",padding:"16px 0 40px" } }>
        <div style={ { display:"inline-flex",background:C.bgC,borderRadius:10,padding:4,border:`1px solid ${ C.bd }` } }>
          <button onClick={ ()=>setTab("rdv") } style={ { padding:"10px 24px",borderRadius:8,border:"none",background:tab==="rdv"?C.bgE:"transparent",color:tab==="rdv"?C.tx:C.mt,fontSize:13,fontWeight:tab==="rdv"?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:6 } }>
            <span style={ { fontSize:15 } }>📅</span> Réserver un créneau
          </button>
          <button onClick={ ()=>setTab("form") } style={ { padding:"10px 24px",borderRadius:8,border:"none",background:tab==="form"?C.bgE:"transparent",color:tab==="form"?C.tx:C.mt,fontSize:13,fontWeight:tab==="form"?600:400,cursor:"pointer",display:"flex",alignItems:"center",gap:6 } }>
            <span style={ { fontSize:15 } }>✉️</span> Envoyer un message
          </button>
        </div>
      </div>

      <div style={ { maxWidth:960,margin:"0 auto",padding:"0 24px" } }>
        <div className="vm-grid-sidebar" style={ { display:"grid",gridTemplateColumns:"1fr 340px",gap:24,alignItems:"flex-start" } }>

          <div>
            { tab==="rdv" ? (
              <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,overflow:"hidden" } }>
                <div style={ { padding:"20px 24px",borderBottom:`1px solid ${ C.bd }` } }>
                  <h2 style={ { fontSize:18,fontWeight:600,margin:"0 0 4px" } }>Réservez un créneau de 30 min</h2>
                  <p style={ { fontSize:13,color:C.mt,margin:0 } }>Démo live du simulateur + discussion sur vos besoins</p>
                </div>
                <div style={{minHeight:500,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 24px",textAlign:"center"}}>
                  <div style={{fontSize:48,marginBottom:20}}>📅</div>
                  <h3 style={{fontSize:20,fontWeight:600,margin:"0 0 12px"}}>Choisissez votre créneau</h3>
                  <p style={{fontSize:14,color:C.mt,maxWidth:400,lineHeight:1.6,margin:"0 0 28px"}}>Démo live de 30 minutes. On vous montre le simulateur en action avec un scénario de votre secteur.</p>
                  <a href="https://ai-pilot.cap-performances.fr/book/cap-performances" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",padding:"16px 36px",background:`linear-gradient(135deg,${C.ac},${C.acL})`,border:"none",borderRadius:12,color:"#fff",fontSize:15,fontWeight:600,textDecoration:"none",boxShadow:"0 4px 20px rgba(212,133,74,0.3)"}}>
                    Réserver un créneau →
                  </a>
                  <div style={{fontSize:12,color:C.dm,marginTop:14}}>Gratuit · Sans engagement · 30 min</div>
                </div>
              </div>
            ) : (
              <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:18,padding:28 } }>
                <h2 style={ { fontSize:18,fontWeight:600,margin:"0 0 4px" } }>Envoyez-nous un message</h2>
                <p style={ { fontSize:13,color:C.mt,margin:"0 0 24px" } }>Réponse sous 24h, généralement en quelques heures</p>

                { sent ? (
                  <div style={ { textAlign:"center",padding:"48px 24px" } }>
                    <div style={ { width:64,height:64,borderRadius:16,background:C.okD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px" } }>✓</div>
                    <div style={ { fontSize:18,fontWeight:600,marginBottom:8 } }>Message envoyé !</div>
                    <div style={ { fontSize:14,color:C.mt } }>On revient vers vous très vite.</div>
                  </div>
                ) : (
                  <>
                    <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 } }>
                      <Input label="Nom complet" placeholder="Jean Dupont" value={ form.name } onChange={ e=>setForm({ ...form,name:e.target.value }) }/>
                      <Input label="Email professionnel" type="email" placeholder="jean@entreprise.fr" value={ form.email } onChange={ e=>setForm({ ...form,email:e.target.value }) }/>
                    </div>
                    <div className="vm-grid-2" style={ { display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 } }>
                      <Input label="Entreprise" placeholder="Mon entreprise" value={ form.company } onChange={ e=>setForm({ ...form,company:e.target.value }) }/>
                      <Input label="Téléphone (optionnel)" type="tel" placeholder="07 00 00 00 00" value={ form.phone } onChange={ e=>setForm({ ...form,phone:e.target.value }) }/>
                    </div>
                    <div style={ { marginBottom:16 } }>
                      <label style={ { display:"block",fontSize:11,fontWeight:600,letterSpacing:0.5,color:C.mt,marginBottom:8,textTransform:"uppercase" } }>Sujet</label>
                      <div style={ { display:"flex",gap:8,flexWrap:"wrap" } }>
                        { subjects.map(s=>(
                          <button key={ s.value } onClick={ ()=>setForm({ ...form,subject:s.value }) } style={ { padding:"8px 16px",borderRadius:8,border:`1px solid ${ form.subject===s.value?C.ac+"60":C.bd }`,background:form.subject===s.value?C.acD:"transparent",color:form.subject===s.value?C.ac:C.mt,fontSize:12,fontWeight:form.subject===s.value?600:400,cursor:"pointer",transition:"all 0.2s" } }>{ s.label }</button>
                        )) }
                      </div>
                    </div>
                    <Input label="Votre message" textarea placeholder="Décrivez votre besoin..." value={ form.message } onChange={ e=>setForm({ ...form,message:e.target.value }) }/>
                    <button onClick={ handleSubmit } style={ { width:"100%",padding:"14px 24px",background:`linear-gradient(135deg,${ C.ac },${ C.acL })`,border:"none",borderRadius:10,color:"#fff",fontSize:15,fontWeight:600,cursor:"pointer",boxShadow:"0 4px 16px rgba(212,133,74,0.25)" } }>Envoyer le message →</button>
                  </>
                ) }
              </div>
            ) }
          </div>

          { /* RIGHT SIDEBAR */ }
          <div style={ { display:"flex",flexDirection:"column",gap:14 } }>
            <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:22 } }>
              <div style={ { fontSize:12,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.mt,marginBottom:16 } }>Contact direct</div>
              <div style={ { display:"flex",alignItems:"center",gap:12,marginBottom:16 } }>
                <div style={ { width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#4A6B8A,#3A5B7A)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff" } }>JF</div>
                <div>
                  <div style={ { fontSize:14,fontWeight:600 } }>Jean-François Perrin</div>
                  <div style={ { fontSize:12,color:C.mt } }>Fondateur · SASU INNOVABUY</div>
                </div>
              </div>
              { [
                { icon:"📧",label:"Email",value:"jfperrin@cap-performances.fr",href:"mailto:jfperrin@cap-performances.fr" },
                { icon:"📱",label:"Téléphone",value:"07 60 40 39 66",href:"tel:+33760403966" },
                { icon:"💼",label:"LinkedIn",value:"Jean-François Perrin",href:"https://www.linkedin.com/in/jean-francois-perrin/" },
              ].map((c,i)=>(
                <a key={ i } href={ c.href } target={ c.href.startsWith("http")?"_blank":undefined } rel={ c.href.startsWith("http")?"noopener":undefined } style={ { display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bgE,borderRadius:10,textDecoration:"none",marginBottom:i<2?8:0,transition:"border-color 0.2s",border:"1px solid transparent" } }
                  onMouseEnter={ e=>e.currentTarget.style.borderColor=C.ac+"40" }
                  onMouseLeave={ e=>e.currentTarget.style.borderColor="transparent" }>
                  <span style={ { fontSize:16 } }>{ c.icon }</span>
                  <div>
                    <div style={ { fontSize:10,color:C.dm,fontWeight:600 } }>{ c.label }</div>
                    <div style={ { fontSize:13,color:C.tx,fontWeight:500 } }>{ c.value }</div>
                  </div>
                </a>
              )) }
            </div>

            <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:22 } }>
              <div style={ { fontSize:12,fontWeight:700,letterSpacing:0.8,textTransform:"uppercase",color:C.mt,marginBottom:14 } }>Réponses rapides</div>
              { [
                { q:"Combien ça coûte ?",a:"49€/user/mois sans engagement. 3 simulations gratuites." },
                { q:"Je peux tester ?",a:"Oui, 3 simulations gratuites sans carte bancaire." },
                { q:"Délai pour démarrer ?",a:"5 minutes. Compte, scénario, simulation." },
                { q:"Adapté à mon secteur ?",a:"200+ scénarios dans 20 secteurs. Et créez les vôtres." },
              ].map((q,i)=>(
                <div key={ i } style={ { marginBottom:i<3?12:0 } }>
                  <div style={ { fontSize:12,fontWeight:600,marginBottom:3 } }>{ q.q }</div>
                  <div style={ { fontSize:11,color:C.dm,lineHeight:1.5 } }>{ q.a }</div>
                </div>
              )) }
            </div>

            <div style={ { background:C.acD,border:"1px solid rgba(212,133,74,0.2)",borderRadius:14,padding:"16px 18px",textAlign:"center" } }>
              <div style={ { fontSize:24,fontWeight:200,color:C.ac } }>{ "< 24h" }</div>
              <div style={ { fontSize:12,color:C.mt } }>Temps de réponse moyen</div>
            </div>
          </div>
        </div>
      </div>

      { /* Localisation */ }
      <div style={ { maxWidth:960,margin:"48px auto 0",padding:"0 24px" } }>
        <div style={ { background:C.bgC,border:`1px solid ${ C.bd }`,borderRadius:16,padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16 } }>
          <div>
            <div style={ { fontSize:14,fontWeight:600,marginBottom:4 } }>📍 SASU INNOVABUY</div>
            <div style={ { fontSize:13,color:C.mt } }>6 Square Jean-Baptiste Riobé · 49480 Saint-Sylvain-d'Anjou</div>
          </div>
          <div style={ { display:"flex",gap:12 } }>
            { [{ e:"🇫🇷",l:"France" },{ e:"🔒",l:"RGPD" },{ e:"🏢",l:"SIRET actif" }].map((b,i)=>(
              <div key={ i } style={ { textAlign:"center",padding:"10px 18px",background:C.bgE,borderRadius:10 } }>
                <div style={ { fontSize:18 } }>{ b.e }</div>
                <div style={ { fontSize:10,color:C.dm,marginTop:2 } }>{ b.l }</div>
              </div>
            )) }
          </div>
        </div>
      </div>

      <div style={ { paddingBottom:48 } }/>
      <Footer/>
    </div>
  ); }
