import { useState, useEffect } from "react";

const SUPABASE_URL = "https://yyodgdaasgulfomrbvlz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2RnZGFhc2d1bGZvbXJidmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDcyODMsImV4cCI6MjA5NTEyMzI4M30.-e6tqfavPmv7rmLN406-LsMW-_H0vFhUIsJmAT2xEd0";

// ─── DB HELPERS ───────────────────────────────────────────────────────────────
const db = {
  async get(table, filters = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    Object.entries(filters).forEach(([k, v]) => { url += `&${k}=eq.${encodeURIComponent(v)}`; });
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_CLIENTS = [
  { acronym: "ACG",     name: "ACG Sports Private Limited" },
  { acronym: "TTFI",    name: "Table Tennis Federation of India" },
  { acronym: "Hydra",   name: "Hydra Trading Private Limited" },
  { acronym: "Smiti",   name: "Smiti" },
  { acronym: "CricViz", name: "CricViz" },
  { acronym: "RPPL",    name: "Racing Promotions Private Limited" },
  { acronym: "ARC",     name: "ARC" },
  { acronym: "CPL",     name: "Caribbean Premier League" },
  { acronym: "Commune", name: "Commune" },
  { acronym: "GSL",     name: "Global Super League" },
  { acronym: "PWR",     name: "Times Group / PWR" },
  { acronym: "IPA",     name: "Indian Pickleball Association" },
  { acronym: "Nikai",   name: "Nikai Group" },
  { acronym: "RBC",     name: "Reporter Broadcast" },
  { acronym: "NSS",     name: "New Sports Society" },
  { acronym: "ESPL",    name: "ESPL" },
  { acronym: "CFC",     name: "CFC" },
  { acronym: "GOLS",    name: "GOLS" },
  { acronym: "WTT",     name: "WTT India" },
  { acronym: "Dani",    name: "Dani" },
  { acronym: "Deepti",  name: "Deepti" },
  { acronym: "Guyana",  name: "Guyana" },
  { acronym: "Asiana",  name: "Asiana" },
  { acronym: "ESPL/CFC",name: "ESPL / CFC" },
  { acronym: "Firm Dev",name: "Firm Development (Internal)" },
];

const LAWYERS = [
  { initials: "RRS", name: "Riya Rajkumar Sharma" },
  { initials: "AM",  name: "Aahna Mehrotra" },
  { initials: "RC",  name: "Rupakshi Choudhary" },
  { initials: "SS",  name: "Shivansh Soni" },
  { initials: "SG",  name: "Shilpa Gamnani" },
  { initials: "PM",  name: "Parth Mehta" },
  { initials: "UM",  name: "Urja Mishra" },
  { initials: "IK",  name: "Indiradevi Kollipara" },
  { initials: "AG",  name: "Arhana Gaur" },
  { initials: "KS",  name: "Kumudavalli Seetharaman" },
  { initials: "RP",  name: "Rajeev Parashar" },
  { initials: "JB",  name: "Jadunath Behera" },
];

const STATUS_CONFIG = [
  { key: "priority",   label: "Priority",         full: "AMSL to do on priority",          color: "#c62828", bg: "#ffebee" },
  { key: "postred",    label: "Post Red Marks",    full: "AMSL to do post red marks",       color: "#e65100", bg: "#fff3e0" },
  { key: "client",     label: "Client to Revert",  full: "Client to revert",                color: "#6a1b9a", bg: "#f3e5f5" },
  { key: "aahna",      label: "Aahna to do",       full: "Aahna to do",                     color: "#1565c0", bg: "#e3f2fd" },
  { key: "hearing",    label: "Hearing Dates",      full: "Hearing Dates",                   color: "#880e4f", bg: "#fce4ec" },
  { key: "closed",     label: "Sent & Closed",      full: "Sent and Closed",                 color: "#2e7d32", bg: "#e8f5e9" },
];

const getTodayStr = () => new Date().toISOString().split("T")[0];
const formatDate = s => s ? new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function getStatusCfg(full) {
  return STATUS_CONFIG.find(s => s.full === full) || { color: "#607d8b", bg: "#eceff1", label: full };
}

// ─── SUPABASE TABLES NEEDED ───────────────────────────────────────────────────
// wh_clients   : id, acronym, name, created_at
// wh_deliverables : id, date, client_id, matter, counsel (array/text), deadline, status, notes, billable, created_by, created_at
// wh_time_entries : id, date, client_id, matter, counsel, hours, billable, narration, created_by, created_at

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;500;600;700&display=swap');

  .wh-topbar{background:#0a2342;padding:0 40px;display:flex;align-items:center;height:56px;border-bottom:1px solid rgba(255,255,255,.08);}
  .wh-back{background:none;border:none;color:rgba(255,255,255,.6);font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;padding:0;display:flex;align-items:center;gap:6px;}
  .wh-back:hover{color:#fff;}
  .wh-title{font-family:'Playfair Display',serif;font-size:17px;color:#ffffff;margin-left:20px;font-weight:400;}
  .wh-tabs-bar{background:#0a2342;border-bottom:2px solid rgba(255,255,255,.1);padding:0 40px;display:flex;gap:0;}
  .wh-tab{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:rgba(255,255,255,.55);font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;padding:14px 18px;cursor:pointer;transition:all .2s;}
  .wh-tab:hover{color:#fff;}
  .wh-tab.active{color:#fff;border-bottom-color:#4a9fd4;}

  .wh-main{max-width:1100px;margin:0 auto;padding:36px 28px 80px;}
  .wh-pt{font-family:'Playfair Display',serif;font-size:28px;color:#0a2342;font-weight:600;margin-bottom:3px;}
  .wh-ps{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.18em;text-transform:uppercase;margin-bottom:28px;font-weight:500;}

  .wh-card{background:#fff;border-radius:4px;padding:24px 28px;margin-bottom:16px;box-shadow:0 1px 4px rgba(10,35,66,.08);}
  .wh-ct{font-family:'Raleway',sans-serif;font-size:10px;color:#4a9fd4;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px;font-weight:700;border-bottom:2px solid #e8f0f8;padding-bottom:10px;display:flex;align-items:center;justify-content:space-between;}

  .wh-g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  .wh-g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
  .wh-g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;}

  .wh-fld{margin-bottom:14px;}
  .wh-lbl{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.12em;text-transform:uppercase;margin-bottom:5px;display:block;font-weight:700;}
  .wh-inp{background:#fff;border:1px solid #c0d4e4;border-radius:3px;color:#0a2342;font-family:'Raleway',sans-serif;font-size:13px;padding:9px 13px;width:100%;outline:none;transition:border-color .2s;}
  .wh-inp:focus{border-color:#4a9fd4;box-shadow:0 0 0 3px rgba(74,159,212,.1);}
  select.wh-inp option{background:#fff;}

  .wh-btn{padding:9px 20px;border-radius:3px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:all .2s;}
  .wh-btn-primary{background:#0a2342;color:#fff;}
  .wh-btn-primary:hover{background:#4a9fd4;}
  .wh-btn-outline{background:transparent;border:1px solid #c0d4e4;color:#4a7090;}
  .wh-btn-outline:hover{border-color:#0a2342;color:#0a2342;}
  .wh-btn-danger{background:transparent;border:1px solid #e8c0bc;color:#c0392b;}
  .wh-btn-danger:hover{background:#fdf0ef;}
  .wh-btn-sm{padding:5px 12px;font-size:10px;}
  .wh-btn-green{background:#1a7a3a;color:#fff;}
  .wh-btn-green:hover{background:#156030;}

  .wh-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:12px;font-family:'Raleway',sans-serif;font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;white-space:nowrap;}

  .wh-status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
  .wh-status-pill{border:2px solid transparent;border-radius:3px;padding:8px 10px;cursor:pointer;font-size:10px;font-family:'Raleway',sans-serif;font-weight:700;text-align:center;letter-spacing:.06em;text-transform:uppercase;transition:all .2s;opacity:.5;}
  .wh-status-pill:hover{opacity:.8;}
  .wh-status-pill.sel{opacity:1;border-color:currentColor !important;}

  .wh-table{width:100%;border-collapse:collapse;}
  .wh-table th{font-family:'Raleway',sans-serif;font-size:10px;color:#4a9fd4;letter-spacing:.14em;text-transform:uppercase;text-align:left;padding:0 10px 11px;border-bottom:2px solid #d0e4f4;font-weight:700;}
  .wh-table td{padding:11px 10px;border-bottom:1px solid #f0f4f8;font-family:'Raleway',sans-serif;font-size:12px;color:#4a6070;vertical-align:middle;}
  .wh-table tr:hover td{background:#f7fafd;}
  .wh-table td:first-child{color:#0a2342;font-weight:600;}

  .wh-filter-bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:18px;}
  .wh-filter-btn{background:#f5f9ff;border:1px solid #d0e4f4;color:#4a7090;font-family:'Raleway',sans-serif;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:5px 12px;border-radius:20px;cursor:pointer;transition:all .2s;}
  .wh-filter-btn:hover{border-color:#4a9fd4;color:#0a2342;}
  .wh-filter-btn.active{background:#0a2342;border-color:#0a2342;color:#fff;}
  .wh-search{background:#fff;border:1px solid #c0d4e4;border-radius:3px;color:#0a2342;font-family:'Raleway',sans-serif;font-size:12px;padding:7px 12px;outline:none;width:220px;margin-left:auto;}
  .wh-search:focus{border-color:#4a9fd4;}

  .wh-modal-overlay{position:fixed;inset:0;background:rgba(10,35,66,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(3px);}
  .wh-modal{background:#fff;border-radius:4px;padding:36px;max-width:520px;width:90%;box-shadow:0 16px 48px rgba(10,35,66,.2);max-height:90vh;overflow-y:auto;}
  .wh-modal-title{font-family:'Playfair Display',serif;font-size:22px;color:#0a2342;font-weight:600;margin-bottom:6px;}
  .wh-modal-sub{font-family:'Raleway',sans-serif;font-size:12px;color:#7a94aa;margin-bottom:22px;line-height:1.7;}

  .wh-counsel-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}
  .wh-chip{display:inline-flex;align-items:center;gap:5px;background:#e8f0f8;border:1px solid #c0d4e4;border-radius:20px;padding:4px 10px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;color:#0a2342;cursor:pointer;transition:all .2s;}
  .wh-chip:hover{background:#d0e4f4;}
  .wh-chip.sel{background:#0a2342;border-color:#0a2342;color:#fff;}

  .wh-overdue{color:#c0392b !important;font-weight:600 !important;}
  .wh-notif{position:fixed;top:76px;right:24px;background:#e8f5e9;border-left:4px solid #2e7d32;border-radius:3px;padding:11px 18px;font-family:'Raleway',sans-serif;font-size:12px;color:#1b5e20;z-index:9999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.1);}
  .wh-notif.err{background:#ffebee;border-left-color:#c62828;color:#b71c1c;}

  .wh-tabs-inner{display:flex;gap:0;margin-bottom:22px;border-bottom:2px solid #d0e4f4;}
  .wh-itab{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:#7a94aa;font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:9px 16px;cursor:pointer;transition:all .2s;}
  .wh-itab:hover{color:#0a2342;}
  .wh-itab.active{color:#0a2342;border-bottom-color:#4a9fd4;}

  .wh-hours-badge{display:inline-block;background:#e3f2fd;color:#1565c0;border-radius:3px;padding:2px 8px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:700;}

  @media(max-width:640px){
    .wh-g2,.wh-g3,.wh-g4{grid-template-columns:1fr;}
    .wh-status-grid{grid-template-columns:1fr 1fr;}
    .wh-main{padding:20px 14px 60px;}
    .wh-topbar,.wh-tabs-bar{padding:0 14px;}
    .wh-search{width:100%;margin-left:0;}
  }
`;

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function WorkHub({ currentUser, onBack }) {
  const [view, setView] = useState("deliverables");
  const [clients, setClients] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Deliverables state
  const [dlFilter, setDlFilter] = useState("all");
  const [dlSearch, setDlSearch] = useState("");
  const [dlForm, setDlForm] = useState({ date: getTodayStr(), client_id: "", matter: "", counsel: [], deadline: "", status: "AMSL to do on priority", notes: "", billable: true });
  const [dlTab, setDlTab] = useState("list");
  const [editingDl, setEditingDl] = useState(null);
  const [showDlModal, setShowDlModal] = useState(false);

  // Time entries state
  const [teForm, setTeForm] = useState({ date: getTodayStr(), client_id: "", matter: "", counsel: currentUser?.initials || "", hours: "", billable: true, narration: "" });
  const [teFilter, setTeFilter] = useState("all");
  const [teSearch, setTeSearch] = useState("");

  // Client management state
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({ acronym: "", name: "" });
  const [editingClient, setEditingClient] = useState(null);

  const isAdmin = currentUser?.is_admin;
  const isFounderOrPartner = currentUser?.role === "founder" || currentUser?.role === "associate_partner" || currentUser?.is_admin;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [c, d, t] = await Promise.all([
      db.get("wh_clients"),
      db.get("wh_deliverables"),
      db.get("wh_time_entries")
    ]);
    // If no clients in DB yet, seed defaults
    const clientList = Array.isArray(c) && c.length > 0 ? c : DEFAULT_CLIENTS.map((cl, i) => ({ ...cl, id: `local-${i}` }));
    setClients(clientList);
    setDeliverables(Array.isArray(d) ? d.sort((a, b) => b.date?.localeCompare(a.date)) : []);
    setTimeEntries(Array.isArray(t) ? t.sort((a, b) => b.date?.localeCompare(a.date)) : []);
    setLoading(false);
  }

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getClient = (id) => clients.find(c => c.id === id);
  const clientName = (id) => { const c = getClient(id); return c ? `${c.acronym}` : "—"; };
  const clientFull = (id) => { const c = getClient(id); return c ? `${c.acronym} — ${c.name}` : "—"; };

  // ── CLIENT MANAGEMENT ───────────────────────────────────────────────────────
  async function saveClient() {
    if (!clientForm.acronym || !clientForm.name) { notify("Please fill in both fields", "error"); return; }
    if (editingClient) {
      const r = await db.update("wh_clients", editingClient.id, clientForm);
      if (Array.isArray(r) && r[0]) {
        setClients(p => p.map(c => c.id === editingClient.id ? r[0] : c));
        notify(`Updated: ${clientForm.acronym}`);
      }
    } else {
      const r = await db.insert("wh_clients", { ...clientForm, created_by: currentUser?.name });
      if (Array.isArray(r) && r[0]) {
        setClients(p => [...p, r[0]]);
        notify(`Added: ${clientForm.acronym}`);
      } else {
        // fallback for local
        setClients(p => [...p, { ...clientForm, id: `local-${Date.now()}` }]);
        notify(`Added: ${clientForm.acronym}`);
      }
    }
    setClientForm({ acronym: "", name: "" });
    setEditingClient(null);
  }

  async function deleteClient(id) {
    if (!window.confirm("Remove this client?")) return;
    await db.delete("wh_clients", id);
    setClients(p => p.filter(c => c.id !== id));
    notify("Client removed");
  }

  // ── DELIVERABLES ────────────────────────────────────────────────────────────
  async function saveDl() {
    if (!dlForm.client_id || !dlForm.matter) { notify("Please fill in Client and Matter", "error"); return; }
    const data = { ...dlForm, counsel: dlForm.counsel.join(", "), created_by: currentUser?.name };
    if (editingDl) {
      const r = await db.update("wh_deliverables", editingDl.id, data);
      if (Array.isArray(r) && r[0]) {
        setDeliverables(p => p.map(d => d.id === editingDl.id ? r[0] : d));
        notify("Updated");
      }
    } else {
      const r = await db.insert("wh_deliverables", data);
      if (Array.isArray(r) && r[0]) {
        setDeliverables(p => [r[0], ...p]);
        notify("Deliverable added ✓");
      } else {
        setDeliverables(p => [{ ...data, id: `local-${Date.now()}`, counsel: data.counsel }, ...p]);
        notify("Deliverable added ✓");
      }
    }
    resetDlForm();
    setShowDlModal(false);
  }

  function resetDlForm() {
    setDlForm({ date: getTodayStr(), client_id: "", matter: "", counsel: [], deadline: "", status: "AMSL to do on priority", notes: "", billable: true });
    setEditingDl(null);
  }

  function openEditDl(dl) {
    setEditingDl(dl);
    setDlForm({ ...dl, counsel: dl.counsel ? dl.counsel.split(", ").filter(Boolean) : [] });
    setShowDlModal(true);
  }

  async function updateDlStatus(id, status) {
    const r = await db.update("wh_deliverables", id, { status });
    if (Array.isArray(r) && r[0]) setDeliverables(p => p.map(d => d.id === id ? r[0] : d));
    else setDeliverables(p => p.map(d => d.id === id ? { ...d, status } : d));
  }

  async function deleteDl(id) {
    if (!window.confirm("Delete this deliverable?")) return;
    await db.delete("wh_deliverables", id);
    setDeliverables(p => p.filter(d => d.id !== id));
    notify("Deleted");
  }

  const filteredDls = deliverables.filter(d => {
    const matchStatus = dlFilter === "all" || d.status === STATUS_CONFIG.find(s => s.key === dlFilter)?.full;
    const q = dlSearch.toLowerCase();
    const matchSearch = !q || d.matter?.toLowerCase().includes(q) || clientName(d.client_id)?.toLowerCase().includes(q) || d.counsel?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const isOverdue = (deadline) => deadline && deadline < getTodayStr() && true;

  // ── TIME ENTRIES ────────────────────────────────────────────────────────────
  async function saveTE() {
    if (!teForm.client_id || !teForm.hours || !teForm.counsel) { notify("Please fill Client, Hours and Counsel", "error"); return; }
    const hrs = parseFloat(teForm.hours);
    if (isNaN(hrs) || hrs <= 0) { notify("Please enter valid hours", "error"); return; }
    const data = { ...teForm, hours: hrs, created_by: currentUser?.name };
    const r = await db.insert("wh_time_entries", data);
    if (Array.isArray(r) && r[0]) {
      setTimeEntries(p => [r[0], ...p]);
      notify("Time entry added ✓");
    } else {
      setTimeEntries(p => [{ ...data, id: `local-${Date.now()}` }, ...p]);
      notify("Time entry added ✓");
    }
    setTeForm({ date: getTodayStr(), client_id: "", matter: "", counsel: currentUser?.initials || "", hours: "", billable: true, narration: "" });
  }

  async function deleteTE(id) {
    if (!window.confirm("Delete this entry?")) return;
    await db.delete("wh_time_entries", id);
    setTimeEntries(p => p.filter(t => t.id !== id));
    notify("Deleted");
  }

  const filteredTEs = timeEntries.filter(t => {
    const matchCounsel = teFilter === "all" || t.counsel === teFilter;
    const q = teSearch.toLowerCase();
    const matchSearch = !q || t.matter?.toLowerCase().includes(q) || clientName(t.client_id)?.toLowerCase().includes(q) || t.counsel?.toLowerCase().includes(q);
    return matchCounsel && matchSearch;
  });

  // ── REPORTS ─────────────────────────────────────────────────────────────────
  const totalHours = timeEntries.reduce((s, t) => s + (parseFloat(t.hours) || 0), 0);
  const billableHours = timeEntries.filter(t => t.billable).reduce((s, t) => s + (parseFloat(t.hours) || 0), 0);

  const hoursByClient = clients.map(c => ({
    ...c,
    hours: timeEntries.filter(t => t.client_id === c.id).reduce((s, t) => s + (parseFloat(t.hours) || 0), 0)
  })).filter(c => c.hours > 0).sort((a, b) => b.hours - a.hours);

  const hoursByCounsel = LAWYERS.map(l => ({
    ...l,
    hours: timeEntries.filter(t => t.counsel === l.initials).reduce((s, t) => s + (parseFloat(t.hours) || 0), 0),
    billable: timeEntries.filter(t => t.counsel === l.initials && t.billable).reduce((s, t) => s + (parseFloat(t.hours) || 0), 0),
  })).filter(l => l.hours > 0).sort((a, b) => b.hours - a.hours);

  const openDeliverables = deliverables.filter(d => d.status !== "Sent and Closed").length;
  const closedDeliverables = deliverables.filter(d => d.status === "Sent and Closed").length;
  const priorityDeliverables = deliverables.filter(d => d.status === "AMSL to do on priority").length;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#7a94aa", letterSpacing: "0.15em" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <style>{CSS}</style>
      {notification && <div className={`wh-notif${notification.type === "error" ? " err" : ""}`}>{notification.msg}</div>}

      {/* Top bar */}
      <div className="wh-topbar">
        {onBack && <button className="wh-back" onClick={onBack}>← Portal</button>}
        <div className="wh-title">Work Hub</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="wh-btn wh-btn-sm" style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 3, fontFamily: "Raleway, sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase", cursor: "pointer" }} onClick={() => setShowClientModal(true)}>
            ⚙ Manage Clients
          </button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="wh-tabs-bar">
        {["deliverables", "timesheet", "reports"].map(t => (
          <button key={t} className={`wh-tab${view === t ? " active" : ""}`} onClick={() => setView(t)}>
            {t === "deliverables" ? "📋 Deliverables" : t === "timesheet" ? "⏱ Timesheet" : "📊 Reports"}
          </button>
        ))}
      </div>

      <div className="wh-main">

        {/* ══════════════════ DELIVERABLES ══════════════════ */}
        {view === "deliverables" && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
              <div>
                <div className="wh-pt">Deliverables</div>
                <div className="wh-ps">Daily matter tracker — morning intake & evening update</div>
              </div>
              <button className="wh-btn wh-btn-primary" style={{ marginLeft: "auto", marginBottom: 28 }} onClick={() => { resetDlForm(); setShowDlModal(true); }}>
                + Add Deliverable
              </button>
            </div>

            {/* Summary row */}
            <div className="wh-g4" style={{ marginBottom: 18 }}>
              {[
                { label: "Open", value: openDeliverables, color: "#1565c0" },
                { label: "Priority", value: priorityDeliverables, color: "#c62828" },
                { label: "Closed", value: closedDeliverables, color: "#2e7d32" },
                { label: "Total", value: deliverables.length, color: "#0a2342" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 4, padding: "16px 20px", boxShadow: "0 1px 4px rgba(10,35,66,.08)" }}>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, color: s.color, fontWeight: 600 }}>{s.value}</div>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="wh-filter-bar">
              <button className={`wh-filter-btn${dlFilter === "all" ? " active" : ""}`} onClick={() => setDlFilter("all")}>All</button>
              {STATUS_CONFIG.map(s => (
                <button key={s.key} className={`wh-filter-btn${dlFilter === s.key ? " active" : ""}`}
                  style={dlFilter === s.key ? {} : { borderColor: s.color + "66", color: s.color }}
                  onClick={() => setDlFilter(dlFilter === s.key ? "all" : s.key)}>
                  {s.label}
                </button>
              ))}
              <input className="wh-search" placeholder="Search matter, client, counsel..." value={dlSearch} onChange={e => setDlSearch(e.target.value)} />
            </div>

            {/* Deliverables table */}
            <div className="wh-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="wh-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Status</th>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Matter</th>
                    <th>Counsel</th>
                    <th>Deadline</th>
                    <th>Billable</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDls.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: "#aaa" }}>No deliverables found</td></tr>
                  )}
                  {filteredDls.map(dl => {
                    const sc = getStatusCfg(dl.status);
                    return (
                      <tr key={dl.id}>
                        <td style={{ paddingLeft: 20, width: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: sc.color, flexShrink: 0 }} />
                            <select
                              value={dl.status}
                              onChange={e => updateDlStatus(dl.id, e.target.value)}
                              style={{ background: sc.bg, border: "none", borderRadius: 20, padding: "3px 8px", fontFamily: "Raleway, sans-serif", fontSize: 10, fontWeight: 700, color: sc.color, cursor: "pointer", outline: "none", letterSpacing: ".04em" }}>
                              {STATUS_CONFIG.map(s => <option key={s.key} value={s.full}>{s.label}</option>)}
                            </select>
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(dl.date)}</td>
                        <td><span style={{ fontWeight: 700, color: "#0a2342" }}>{clientName(dl.client_id)}</span></td>
                        <td style={{ maxWidth: 280 }}>
                          <div style={{ color: "#0a2342", fontWeight: 600 }}>{dl.matter}</div>
                          {dl.notes && <div style={{ fontSize: 11, color: "#7a94aa", marginTop: 2, fontStyle: "italic" }}>{dl.notes}</div>}
                        </td>
                        <td style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, color: "#4a9fd4", fontWeight: 600 }}>{dl.counsel || "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <span className={isOverdue(dl.deadline) && dl.status !== "Sent and Closed" ? "wh-overdue" : ""}>
                            {formatDate(dl.deadline)}
                          </span>
                        </td>
                        <td>
                          <span className="wh-badge" style={{ background: dl.billable ? "#e8f5e9" : "#f5f5f5", color: dl.billable ? "#2e7d32" : "#757575" }}>
                            {dl.billable ? "Bill" : "Non-Bill"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="wh-btn wh-btn-outline wh-btn-sm" onClick={() => openEditDl(dl)}>Edit</button>
                            <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => deleteDl(dl.id)}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ══════════════════ TIMESHEET ══════════════════ */}
        {view === "timesheet" && (
          <>
            <div className="wh-pt">Timesheet</div>
            <div className="wh-ps">Log hours per counsel per matter</div>

            {/* Entry form */}
            <div className="wh-card">
              <div className="wh-ct">New Time Entry</div>
              <div className="wh-g3">
                <div className="wh-fld">
                  <label className="wh-lbl">Date</label>
                  <input type="date" className="wh-inp" value={teForm.date} onChange={e => setTeForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="wh-fld">
                  <label className="wh-lbl">Client</label>
                  <select className="wh-inp" value={teForm.client_id} onChange={e => setTeForm(f => ({ ...f, client_id: e.target.value }))}>
                    <option value="">— Select Client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>)}
                  </select>
                </div>
                <div className="wh-fld">
                  <label className="wh-lbl">Counsel</label>
                  <select className="wh-inp" value={teForm.counsel} onChange={e => setTeForm(f => ({ ...f, counsel: e.target.value }))}>
                    <option value="">— Select —</option>
                    {LAWYERS.map(l => <option key={l.initials} value={l.initials}>{l.initials} — {l.name}</option>)}
                  </select>
                </div>
                <div className="wh-fld">
                  <label className="wh-lbl">Hours <span style={{ color: "#7a94aa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(0.25 = 15 min)</span></label>
                  <input type="number" className="wh-inp" min="0.25" max="24" step="0.25" placeholder="e.g. 1.5" value={teForm.hours} onChange={e => setTeForm(f => ({ ...f, hours: e.target.value }))} />
                  {teForm.hours && !isNaN(parseFloat(teForm.hours)) && (
                    <div style={{ fontSize: 10, color: "#4a9fd4", marginTop: 4, fontFamily: "Raleway, sans-serif" }}>
                      = {Math.floor(parseFloat(teForm.hours))}h {Math.round((parseFloat(teForm.hours) % 1) * 60)}m
                    </div>
                  )}
                </div>
                <div className="wh-fld">
                  <label className="wh-lbl">Nature of Work</label>
                  <select className="wh-inp" value={teForm.billable} onChange={e => setTeForm(f => ({ ...f, billable: e.target.value === "true" }))}>
                    <option value="true">Billable</option>
                    <option value="false">Non-Billable</option>
                  </select>
                </div>
                <div className="wh-fld">
                  <label className="wh-lbl">Matter / Task</label>
                  <input type="text" className="wh-inp" placeholder="e.g. Franchise Agreement Drafting" value={teForm.matter} onChange={e => setTeForm(f => ({ ...f, matter: e.target.value }))} />
                </div>
              </div>
              <div className="wh-fld">
                <label className="wh-lbl">Narration / Status</label>
                <input type="text" className="wh-inp" placeholder="Brief description of work done..." value={teForm.narration} onChange={e => setTeForm(f => ({ ...f, narration: e.target.value }))} />
              </div>
              <button className="wh-btn wh-btn-primary" onClick={saveTE}>+ Log Hours</button>
            </div>

            {/* Filter bar */}
            <div className="wh-filter-bar">
              <button className={`wh-filter-btn${teFilter === "all" ? " active" : ""}`} onClick={() => setTeFilter("all")}>All Counsel</button>
              {LAWYERS.map(l => (
                <button key={l.initials} className={`wh-filter-btn${teFilter === l.initials ? " active" : ""}`} onClick={() => setTeFilter(teFilter === l.initials ? "all" : l.initials)}>
                  {l.initials}
                </button>
              ))}
              <input className="wh-search" placeholder="Search..." value={teSearch} onChange={e => setTeSearch(e.target.value)} />
            </div>

            {/* Time entries table */}
            <div className="wh-card" style={{ padding: 0, overflow: "hidden" }}>
              <table className="wh-table">
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 20 }}>Date</th>
                    <th>Client</th>
                    <th>Matter</th>
                    <th>Counsel</th>
                    <th>Hours</th>
                    <th>Type</th>
                    <th>Narration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTEs.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "32px 0", color: "#aaa" }}>No entries found</td></tr>
                  )}
                  {filteredTEs.map(te => (
                    <tr key={te.id}>
                      <td style={{ paddingLeft: 20, whiteSpace: "nowrap" }}>{formatDate(te.date)}</td>
                      <td><span style={{ fontWeight: 700, color: "#0a2342" }}>{clientName(te.client_id)}</span></td>
                      <td style={{ maxWidth: 220, color: "#0a2342" }}>{te.matter || "—"}</td>
                      <td><span style={{ fontWeight: 700, color: "#4a9fd4" }}>{te.counsel}</span></td>
                      <td><span className="wh-hours-badge">{te.hours}h</span></td>
                      <td>
                        <span className="wh-badge" style={{ background: te.billable ? "#e8f5e9" : "#f5f5f5", color: te.billable ? "#2e7d32" : "#757575" }}>
                          {te.billable ? "Billable" : "Non-Bill"}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: "#7a94aa", fontStyle: "italic", maxWidth: 200 }}>{te.narration || "—"}</td>
                      <td>
                        <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => deleteTE(te.id)}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ══════════════════ REPORTS ══════════════════ */}
        {view === "reports" && (
          <>
            <div className="wh-pt">Reports</div>
            <div className="wh-ps">Summary across deliverables and time entries</div>

            <div className="wh-g4" style={{ marginBottom: 18 }}>
              {[
                { label: "Total Hours", value: totalHours.toFixed(1), color: "#0a2342" },
                { label: "Billable Hours", value: billableHours.toFixed(1), color: "#2e7d32" },
                { label: "Non-Billable", value: (totalHours - billableHours).toFixed(1), color: "#7a94aa" },
                { label: "Billable %", value: totalHours > 0 ? `${Math.round((billableHours / totalHours) * 100)}%` : "—", color: "#4a9fd4" },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", borderRadius: 4, padding: "16px 20px", boxShadow: "0 1px 4px rgba(10,35,66,.08)" }}>
                  <div style={{ fontFamily: "Playfair Display, serif", fontSize: 28, color: s.color, fontWeight: 600 }}>{s.value}</div>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa", letterSpacing: ".12em", textTransform: "uppercase", marginTop: 3, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div className="wh-g2">
              <div className="wh-card">
                <div className="wh-ct">Hours by Counsel</div>
                {hoursByCounsel.length === 0 && <div style={{ color: "#aaa", fontFamily: "Raleway, sans-serif", fontSize: 12 }}>No entries yet</div>}
                {hoursByCounsel.map(l => (
                  <div key={l.initials} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#0a2342", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{l.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#0a2342", fontWeight: 600 }}>{l.name}</div>
                      <div style={{ height: 4, background: "#e8f0f8", borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#4a9fd4", borderRadius: 2, width: `${hoursByCounsel[0] ? (l.hours / hoursByCounsel[0].hours) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: "#0a2342" }}>{l.hours.toFixed(1)}h</div>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa" }}>{l.billable.toFixed(1)}h billable</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wh-card">
                <div className="wh-ct">Hours by Client</div>
                {hoursByClient.length === 0 && <div style={{ color: "#aaa", fontFamily: "Raleway, sans-serif", fontSize: 12 }}>No entries yet</div>}
                {hoursByClient.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#0a2342", fontWeight: 600 }}>{c.acronym}</div>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa" }}>{c.name}</div>
                      <div style={{ height: 4, background: "#e8f0f8", borderRadius: 2, marginTop: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#0a2342", borderRadius: 2, width: `${hoursByClient[0] ? (c.hours / hoursByClient[0].hours) * 100 : 0}%` }} />
                      </div>
                    </div>
                    <div style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: "#0a2342" }}>{c.hours.toFixed(1)}h</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables by status */}
            <div className="wh-card">
              <div className="wh-ct">Deliverables by Status</div>
              <div className="wh-g3">
                {STATUS_CONFIG.map(s => {
                  const count = deliverables.filter(d => d.status === s.full).length;
                  return (
                    <div key={s.key} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 3, padding: "14px 16px" }}>
                      <div style={{ fontFamily: "Playfair Display, serif", fontSize: 24, color: s.color, fontWeight: 600 }}>{count}</div>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: s.color, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2, fontWeight: 700 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* ══════ DELIVERABLE MODAL ══════ */}
      {showDlModal && (
        <div className="wh-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowDlModal(false); resetDlForm(); } }}>
          <div className="wh-modal">
            <div className="wh-modal-title">{editingDl ? "Edit Deliverable" : "Add Deliverable"}</div>
            <div className="wh-modal-sub">Fill in the matter details and assign counsel</div>

            <div className="wh-g2">
              <div className="wh-fld">
                <label className="wh-lbl">Date</label>
                <input type="date" className="wh-inp" value={dlForm.date} onChange={e => setDlForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="wh-fld">
                <label className="wh-lbl">Deadline / Send By</label>
                <input type="date" className="wh-inp" value={dlForm.deadline} onChange={e => setDlForm(f => ({ ...f, deadline: e.target.value }))} />
              </div>
            </div>

            <div className="wh-fld">
              <label className="wh-lbl">Client</label>
              <select className="wh-inp" value={dlForm.client_id} onChange={e => setDlForm(f => ({ ...f, client_id: e.target.value }))}>
                <option value="">— Select Client —</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>)}
              </select>
            </div>

            <div className="wh-fld">
              <label className="wh-lbl">Matter / Task</label>
              <input type="text" className="wh-inp" placeholder="e.g. Franchise Agreement Drafting" value={dlForm.matter} onChange={e => setDlForm(f => ({ ...f, matter: e.target.value }))} />
            </div>

            <div className="wh-fld">
              <label className="wh-lbl">Assign Counsel <span style={{ color: "#7a94aa", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(select multiple)</span></label>
              <div className="wh-counsel-chips">
                {LAWYERS.map(l => (
                  <div key={l.initials}
                    className={`wh-chip${dlForm.counsel.includes(l.initials) ? " sel" : ""}`}
                    onClick={() => setDlForm(f => ({
                      ...f,
                      counsel: f.counsel.includes(l.initials) ? f.counsel.filter(x => x !== l.initials) : [...f.counsel, l.initials]
                    }))}>
                    <span style={{ fontWeight: 700 }}>{l.initials}</span>
                    <span style={{ fontSize: 10, opacity: .8 }}>{l.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="wh-fld">
              <label className="wh-lbl">Status</label>
              <div className="wh-status-grid">
                {STATUS_CONFIG.map(s => (
                  <div key={s.key}
                    className={`wh-status-pill${dlForm.status === s.full ? " sel" : ""}`}
                    style={{ background: s.bg, color: s.color }}
                    onClick={() => setDlForm(f => ({ ...f, status: s.full }))}>
                    {s.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="wh-g2">
              <div className="wh-fld">
                <label className="wh-lbl">Nature of Work</label>
                <select className="wh-inp" value={dlForm.billable} onChange={e => setDlForm(f => ({ ...f, billable: e.target.value === "true" }))}>
                  <option value="true">Billable</option>
                  <option value="false">Non-Billable</option>
                </select>
              </div>
              <div className="wh-fld">
                <label className="wh-lbl">Notes</label>
                <input type="text" className="wh-inp" placeholder="Optional context..." value={dlForm.notes} onChange={e => setDlForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="wh-btn wh-btn-primary" style={{ flex: 1 }} onClick={saveDl}>{editingDl ? "Save Changes" : "Add Deliverable"}</button>
              <button className="wh-btn wh-btn-outline" onClick={() => { setShowDlModal(false); resetDlForm(); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════ CLIENT MANAGEMENT MODAL ══════ */}
      {showClientModal && (
        <div className="wh-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowClientModal(false); }}>
          <div className="wh-modal" style={{ maxWidth: 600 }}>
            <div className="wh-modal-title">Manage Clients</div>
            <div className="wh-modal-sub">Add, edit or remove clients. Acronym is used throughout the app.</div>

            {/* Add/Edit form */}
            <div style={{ background: "#f5f9ff", border: "1px solid #d0e4f4", borderRadius: 3, padding: 16, marginBottom: 20 }}>
              <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#4a9fd4", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }}>
                {editingClient ? `Editing: ${editingClient.acronym}` : "Add New Client"}
              </div>
              <div className="wh-g2">
                <div className="wh-fld" style={{ marginBottom: 0 }}>
                  <label className="wh-lbl">Acronym / Short Name</label>
                  <input type="text" className="wh-inp" placeholder="e.g. ACG" value={clientForm.acronym} onChange={e => setClientForm(f => ({ ...f, acronym: e.target.value }))} />
                </div>
                <div className="wh-fld" style={{ marginBottom: 0 }}>
                  <label className="wh-lbl">Full Name</label>
                  <input type="text" className="wh-inp" placeholder="e.g. ACG Sports Private Limited" value={clientForm.name} onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="wh-btn wh-btn-primary wh-btn-sm" onClick={saveClient}>{editingClient ? "Save Changes" : "Add Client"}</button>
                {editingClient && <button className="wh-btn wh-btn-outline wh-btn-sm" onClick={() => { setEditingClient(null); setClientForm({ acronym: "", name: "" }); }}>Cancel Edit</button>}
              </div>
            </div>

            {/* Client list */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {clients.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#0a2342", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", fontSize: 10, fontWeight: 700, color: "#fff", flexShrink: 0, letterSpacing: ".05em" }}>{c.acronym.slice(0, 2).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#0a2342", fontWeight: 700 }}>{c.acronym}</div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, color: "#7a94aa" }}>{c.name}</div>
                  </div>
                  <button className="wh-btn wh-btn-outline wh-btn-sm" onClick={() => { setEditingClient(c); setClientForm({ acronym: c.acronym, name: c.name }); }}>Edit</button>
                  <button className="wh-btn wh-btn-danger wh-btn-sm" onClick={() => deleteClient(c.id)}>✕</button>
                </div>
              ))}
            </div>

            <button className="wh-btn wh-btn-outline" style={{ width: "100%", marginTop: 16 }} onClick={() => setShowClientModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
