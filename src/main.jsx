import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Trash2, Pencil, Target, CalendarDays, Download, Settings, X, Check, ArrowUpRight, ArrowDownRight, CircleDollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import './style.css';

const TARGET_DEFAULT = 10000;
const CATEGORIES = ['Alimentation','Transport','Loyer','Factures','Shopping','Santé','Famille','Loisirs','Épargne','Autre'];
const money = n => new Intl.NumberFormat('fr-MA',{style:'currency',currency:'MAD',maximumFractionDigits:2}).format(Number(n)||0).replace('MAD','DH');
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const seed = { initialBalance: 0, target: TARGET_DEFAULT, startDate: today(), duration: 4, transactions: [] };
function loadData(){ try { const raw=JSON.parse(localStorage.getItem('epargne10k')||'{}'); return {...seed,...raw,transactions:Array.isArray(raw.transactions)?raw.transactions:[]}; } catch { return {...seed}; } }

function App(){
  const [data,setData] = useState(loadData);
  const [page,setPage] = useState('dashboard');
  const [modal,setModal] = useState(false);
  const [editing,setEditing] = useState(null);
  const [type,setType] = useState('expense');
  const [form,setForm] = useState({amount:'',category:'Alimentation',date:today(),note:''});
  const [filter,setFilter] = useState('all');
  const [targetInput,setTargetInput] = useState(String(data.target));
  const [initialInput,setInitialInput] = useState(String(data.initialBalance));
  const [installPrompt,setInstallPrompt] = useState(null);
  useEffect(()=>{
    const capture=e=>{e.preventDefault();setInstallPrompt(e)};
    window.addEventListener('beforeinstallprompt',capture);
    if('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>{});
    return ()=>window.removeEventListener('beforeinstallprompt',capture);
  },[]);
  const installApp=async()=>{if(!installPrompt)return;await installPrompt.prompt();setInstallPrompt(null)};
  useEffect(()=>localStorage.setItem('epargne10k',JSON.stringify(data)),[data]);

  const totals = useMemo(()=>{
    const income=data.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
    const expenses=data.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
    const savingTransactions=data.transactions.filter(t=>t.type==='saving').reduce((s,t)=>s+Number(t.amount||0),0);
    const saved=Number(data.initialBalance||0)+savingTransactions;
    const available=Number(data.initialBalance||0)+income-expenses-savingTransactions;
    return {income,expenses,saved,available};
  },[data]);
  const progress = Math.min(100,Math.max(0,(totals.saved/(Number(data.target)||TARGET_DEFAULT))*100));
  const months = useMemo(()=>{
    const now=new Date(); const start=new Date(data.startDate+'T12:00:00'); start.setDate(1);
    return Array.from({length:data.duration},(_,i)=>{
      const d=new Date(start); d.setMonth(d.getMonth()+i);
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const saved=data.transactions.filter(t=>t.type==='saving'&&t.date.startsWith(key)).reduce((s,t)=>s+t.amount,0);
      return {month:d.toLocaleDateString('fr-FR',{month:'short'}),epargne:saved};
    });
  },[data]);
  const openNew=(t='expense')=>{setEditing(null);setType(t);setForm({amount:'',category:t==='saving'?'Épargne':t==='income'?'Autre':'Alimentation',date:today(),note:''});setModal(true)};
  const openEdit=t=>{setEditing(t.id);setType(t.type);setForm({amount:String(t.amount),category:t.category,date:t.date,note:t.note||''});setModal(true)};
  const saveTransaction=e=>{
    e.preventDefault(); const amount=Number(form.amount);
    if(!Number.isFinite(amount)||amount<=0) return;
    const item={id:editing||crypto.randomUUID(),type,amount,category:type==='saving'?'Épargne':form.category,date:form.date,note:form.note.trim()};
    setData(d=>({...d,transactions:editing?d.transactions.map(t=>t.id===editing?item:t):[item,...d.transactions]}));setModal(false);
  };
  const remove=id=>{if(confirm('Supprimer cette opération ?'))setData(d=>({...d,transactions:d.transactions.filter(t=>t.id!==id)}))};
  const exportData=()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='epargne-10k-sauvegarde.json';a.click();URL.revokeObjectURL(url);
  };
  const shown=data.transactions.filter(t=>filter==='all'||t.type===filter);
  const nav=[['dashboard','Vue générale'],['transactions','Opérations'],['settings','Paramètres']];
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><PiggyBank size={24}/></div><div><strong>Épargne 10K</strong><small>MON BUDGET PERSONNEL</small></div></div>
      <nav>{nav.map(([id,label])=><button key={id} className={page===id?'nav-item active':'nav-item'} onClick={()=>setPage(id)}>{id==='dashboard'?<Wallet size={18}/>:id==='transactions'?<CalendarDays size={18}/>:<Settings size={18}/>}<span>{label}</span></button>)}</nav>
      <div className="sidebar-goal"><Target size={19}/><strong>Mon objectif</strong><div className="goal-value">{money(data.target)}</div><div className="progress-track"><span style={{width:progress+'%'}}/></div><small>{progress.toFixed(1)}% atteint</small></div>
      <div className="sidebar-foot">Privé · Stocké sur cet appareil</div>
    </aside>
    <main className="main">
      <header className="topbar"><div><p className="eyebrow">VOTRE ARGENT, VOTRE PLAN</p><h1>{page==='dashboard'?'Vue générale':page==='transactions'?'Mes opérations':'Paramètres'}</h1></div><div className="topbar-actions">{installPrompt&&<button className="outline install-button" onClick={installApp}>Installer l’application</button>}<button className="primary" onClick={()=>openNew('expense')}><Plus size={18}/> Ajouter une dépense</button></div></header>
      {page==='dashboard'&&<div className="content">
        <section className="hero">
          <div className="hero-copy"><span className="pill"><Target size={14}/> OBJECTIF SUR {data.duration} MOIS</span><h2>Chaque dirham<br/>vous rapproche du but.</h2><p>Votre objectif : {money(data.target)} d'épargne. Avancez à votre rythme et suivez votre progression.</p><button className="hero-button" onClick={()=>openNew('saving')}><PiggyBank size={17}/> Enregistrer une épargne</button></div>
          <div className="hero-chart"><div className="donut" style={{'--progress':`${progress*3.6}deg`}}><div><strong>{progress.toFixed(0)}%</strong><small>atteint</small></div></div><div className="hero-chart-text"><span>Épargne enregistrée</span><strong>{money(totals.saved)}</strong><small>Reste {money(Math.max(0,data.target-totals.saved))}</small></div></div>
        </section>
      <section className="stats-grid">
          <Stat icon={<Wallet/>} label="Solde disponible estimé" value={money(totals.available)} tone="blue" hint="Solde initial + revenus − dépenses − épargne"/>
          <Stat icon={<TrendingUp/>} label="Total des revenus" value={money(totals.income)} tone="green" hint="Revenus enregistrés"/>
          <Stat icon={<TrendingDown/>} label="Total des dépenses" value={money(totals.expenses)} tone="red" hint="Dépenses enregistrées"/>
          <Stat icon={<PiggyBank/>} label="Épargne cumulée" value={money(totals.saved)} tone="purple" hint={`Objectif mensuel : ${money(data.target/data.duration)}`}/>
        </section>
        <section className="lower-grid">
          <div className="panel chart-panel"><div className="panel-head"><div><h3>Mon épargne par mois</h3><p>Suivez les montants réellement enregistrés</p></div><span className="soft-tag">{data.duration} mois</span></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={months}><defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#28bd86" stopOpacity={0.25}/><stop offset="100%" stopColor="#28bd86" stopOpacity={0.01}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edf2"/><XAxis dataKey="month" axisLine={false} tickLine={false}/><YAxis axisLine={false} tickLine={false} width={52}/><Tooltip formatter={v=>money(v)}/><Area type="monotone" dataKey="epargne" stroke="#21a675" strokeWidth={3} fill="url(#fillGreen)"/></AreaChart></ResponsiveContainer></div></div>
          <div className="panel plan-panel"><div className="panel-head"><div><h3>Plan d'épargne</h3><p>Votre repère pour atteindre l'objectif</p></div><Target size={20} color="#219b70"/></div><div className="plan-row"><span>Objectif total</span><strong>{money(data.target)}</strong></div><div className="plan-row"><span>Objectif par mois</span><strong>{money(data.target/data.duration)}</strong></div><div className="plan-row"><span>Objectif par semaine (approx.)</span><strong>{money(data.target/(data.duration*4.345))}</strong></div><div className="plan-row"><span>Objectif par jour (approx.)</span><strong>{money(data.target/(data.duration*30.4375))}</strong></div><div className="tip"><CircleDollarSign size={19}/><span>Essayez de mettre de côté l'épargne dès que vous recevez votre revenu.</span></div></div>
        </section>
        <section className="panel recent"><div className="panel-head"><div><h3>Dernières opérations</h3><p>Vos mouvements les plus récents</p></div><button className="text-button" onClick={()=>setPage('transactions')}>Tout afficher <ArrowUpRight size={15}/></button></div><TransactionList transactions={data.transactions.slice(0,5)} onEdit={openEdit} onDelete={remove}/></section>
      </div>}
      {page==='transactions'&&<div className="content"><section className="panel"><div className="panel-head wrap"><div><h3>Historique des opérations</h3><p>Ajoutez vos revenus, dépenses et versements d'épargne.</p></div><div className="actions"><button className="outline" onClick={()=>openNew('income')}><Plus size={16}/> Revenu</button><button className="outline" onClick={()=>openNew('saving')}><Plus size={16}/> Épargne</button><button className="primary" onClick={()=>openNew('expense')}><Plus size={16}/> Dépense</button></div></div><div className="filters">{[['all','Toutes'],['income','Revenus'],['expense','Dépenses'],['saving','Épargne']].map(([id,l])=><button key={id} className={filter===id?'filter active':'filter'} onClick={()=>setFilter(id)}>{l}</button>)}</div><TransactionList transactions={shown} onEdit={openEdit} onDelete={remove}/></section></div>}
      {page==='settings'&&<div className="content settings-grid"><section className="panel settings-card"><h3>Mon objectif d'épargne</h3><p>Modifiez le montant et la durée de votre plan.</p><label>Objectif total (DH)<input type="number" min="1" value={targetInput} onChange={e=>setTargetInput(e.target.value)}/></label><label>Durée</label><div className="duration-options">{[2,3,4,6,12].map(n=><button key={n} className={data.duration===n?'duration active':'duration'} onClick={()=>setData(d=>({...d,duration:n}))}>{n} mois</button>)}</div><button className="primary full" onClick={()=>{if(Number(targetInput)>0)setData(d=>({...d,target:Number(targetInput)}))}}>Enregistrer l'objectif</button></section><section className="panel settings-card"><h3>Solde de départ</h3><p>Indiquez l'argent que vous aviez au début du suivi. Ce montant n'est pas compté comme un revenu.</p><label>Solde initial (DH)<input type="number" min="0" value={initialInput} onChange={e=>setInitialInput(e.target.value)}/></label><button className="primary full" onClick={()=>{if(Number(initialInput)>=0)setData(d=>({...d,initialBalance:Number(initialInput)}))}}>Enregistrer le solde</button><div className="backup"><div><strong>Sauvegarder mes données</strong><small>Exportez vos opérations dans un fichier JSON.</small></div><button className="outline" onClick={exportData}><Download size={16}/> Exporter</button></div><p className="privacy-note">Vos données sont enregistrées localement dans ce navigateur. Exportez régulièrement une sauvegarde. Effacer les données du navigateur peut les supprimer.</p></section></div>}
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveTransaction}><div className="modal-head"><div><p className="eyebrow">NOUVELLE OPÉRATION</p><h2>{editing?'Modifier':'Ajouter'} {type==='income'?'un revenu':type==='saving'?'une épargne':'une dépense'}</h2></div><button type="button" className="icon-button" onClick={()=>setModal(false)}><X/></button></div><div className="type-tabs">{[['expense','Dépense'],['income','Revenu'],['saving','Épargne']].map(([v,l])=><button type="button" key={v} className={type===v?'type-tab active '+v:'type-tab'} onClick={()=>{setType(v);setForm(f=>({...f,category:v==='saving'?'Épargne':v==='income'?'Autre':'Alimentation'}))}}>{l}</button>)}</div><label>Montant (DH)<input autoFocus type="number" min="0.01" step="0.01" required placeholder="0,00" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))}/></label>{type!=='saving'&&<label>Catégorie<select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{CATEGORIES.filter(c=>c!=='Épargne').map(c=><option key={c}>{c}</option>)}</select></label>}<label>Date<input type="date" required value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></label><label>Note (facultatif)<input placeholder="Ex. salaire du mois" value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}/></label><button className="primary full" type="submit"><Check size={17}/> Enregistrer l'opération</button></form></div>}
  </div>
}
function Stat({icon,label,value,tone,hint}){return <div className="stat-card"><div className={'stat-icon '+tone}>{icon}</div><span className="stat-label">{label}</span><strong className="stat-value">{value}</strong><small>{hint}</small></div>}
function TransactionList({transactions,onEdit,onDelete}){
 if(!transactions.length)return <div className="empty"><div className="empty-icon"><Wallet size={24}/></div><strong>Aucune opération pour le moment</strong><p>Ajoutez votre premier revenu, dépense ou versement d'épargne.</p></div>;
 return <div className="transaction-list">{transactions.map(t=><div className="transaction" key={t.id}><div className={'transaction-icon '+t.type}>{t.type==='income'?<ArrowDownRight/>:t.type==='saving'?<PiggyBank/>:<ArrowUpRight/>}</div><div className="transaction-main"><strong>{t.note||t.category}</strong><small>{t.category} · {new Date(t.date+'T12:00:00').toLocaleDateString('fr-FR')}</small></div><strong className={'transaction-amount '+t.type}>{t.type==='income'?'+':t.type==='saving'?'−':'−'}{money(t.amount)}</strong><div className="transaction-actions"><button title="Modifier" onClick={()=>onEdit(t)}><Pencil size={16}/></button><button title="Supprimer" onClick={()=>onDelete(t.id)}><Trash2 size={16}/></button></div></div>)}</div>
}
createRoot(document.getElementById('root')).render(<App/>);
