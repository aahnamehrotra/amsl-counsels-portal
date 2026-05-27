import { useState, useEffect } from "react";

const SUPABASE_URL = "https://yyodgdaasgulfomrbvlz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5b2RnZGFhc2d1bGZvbXJidmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDcyODMsImV4cCI6MjA5NTEyMzI4M30.-e6tqfavPmv7rmLN406-LsMW-_H0vFhUIsJmAT2xEd0";
const ALLOWED_DOMAIN = "amsportslaw.com";
const PARALEGAL_EMAIL = "paralegal@amsportslaw.com";

const COUNSEL_META = {
  "aahna.mehrotra@amsportslaw.com": {
    joinDate: "2017-06-28", probationEnd: "2017-06-28",
    noticeByFirm: null, noticeByCounsel: null, lockInEnd: null, isFounder: true,
    attendanceFrom: "2026-05-25"
  },
  "riyarajkumar.sharma@amsportslaw.com": {
    joinDate: "2023-06-01", probationEnd: "2023-09-01",
    noticeByFirm: 1, noticeByCounsel: 3, lockInEnd: null,
    role: "associate_partner", attendanceFrom: "2026-05-25"
  },
  "rupakshi.choudhary@amsportslaw.com": {
    joinDate: "2025-10-01", probationEnd: "2026-01-01",
    maternityStart: "2026-03-01", maternityEnd: "2026-09-01",
    noticeByFirm: 1, noticeByCounsel: 2, lockInEnd: null
  },
  "rushil.chadha@amsportslaw.com": {
    joinDate: "2026-06-01", probationEnd: "2026-09-01", activeFrom: "2026-06-01",
    noticeByFirm: 1, noticeByCounsel: 2, lockInEnd: "2027-08-31"
  },
  "aakarshan.majumdar@amsportslaw.com": {
    joinDate: "2026-06-01", probationEnd: "2026-09-01", activeFrom: "2026-06-01",
    noticeByFirm: 1, noticeByCounsel: 2, lockInEnd: "2027-08-31"
  },
};

const DEFAULT_HOLIDAYS = [
  { date: "2026-01-01", name: "New Year", type: "fixed" },
  { date: "2026-01-26", name: "Republic Day", type: "fixed" },
  { date: "2026-03-04", name: "Holi", type: "fixed" },
  { date: "2026-03-21", name: "Eid al-Fitr", type: "fixed" },
  { date: "2026-04-03", name: "Good Friday", type: "fixed" },
  { date: "2026-08-15", name: "Independence Day", type: "fixed" },
  { date: "2026-10-02", name: "Gandhi Jayanti", type: "fixed" },
  { date: "2026-10-20", name: "Dussehra", type: "fixed" },
  { date: "2026-11-08", name: "Diwali", type: "fixed" },
  { date: "2026-12-25", name: "Christmas", type: "fixed" },
  { date: "2026-02-15", name: "Maha Shivratri", type: "optional" },
  { date: "2026-03-19", name: "Gudi Padwa", type: "optional" },
  { date: "2026-05-01", name: "Buddha Purnima", type: "optional" },
  { date: "2026-07-26", name: "Muharram", type: "optional" },
  { date: "2026-08-28", name: "Raksha Bandhan", type: "optional" },
  { date: "2026-09-04", name: "Janmashtami", type: "optional" },
  { date: "2026-09-14", name: "Ganesh Chaturthi", type: "optional" },
  { date: "2026-09-26", name: "Id-e-Milad", type: "optional" },
  { date: "2026-11-11", name: "Bhai Duj", type: "optional" },
  { date: "2026-11-24", name: "Guru Nanak Jayanti", type: "optional" },
];

const LEAVE_TYPES = [
  { value: "Casual/Sick Leave", code: "CL/SL", maxDays: 7, maxAtOnce: 3, probationAllowed: false },
  { value: "Earned Leave", code: "EL", maxDays: 18, probationAllowed: false },
  { value: "Half-Day Leave", code: "HL", maxDays: null, probationAllowed: true, isLWPDuringProbation: true },
  { value: "Bereavement Leave (Immediate Family)", code: "BL-I", maxDays: 5, probationAllowed: true, notLWP: true },
  { value: "Bereavement Leave (Extended Family/Friend)", code: "BL-E", maxDays: 1, probationAllowed: true, notLWP: true },
  { value: "Maternity Leave", code: "ML", maxDays: 182, probationAllowed: false },
  { value: "Paternity Leave", code: "PL", maxDays: 30, probationAllowed: false },
  { value: "Leave Without Pay", code: "LWP", maxDays: null, probationAllowed: true },
  { value: "Birthday Leave", code: "BL", maxDays: 1, probationAllowed: false, isBirthdayLeave: true },
];

const db = {
  async get(table, filters = {}) {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`;
    Object.entries(filters).forEach(([k, v]) => { url += `&${k}=eq.${encodeURIComponent(v)}`; });
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return res.json();
  },
  async delete(table, id) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Prefer: "return=minimal" }
    });
    return res.ok;
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

async function signInWithGoogle() {
  const redirectTo = encodeURIComponent(window.location.origin + window.location.pathname);
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`;
}

async function refreshAccessToken(refreshToken) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      const session = { token: data.access_token, refreshToken: data.refresh_token, email: data.user?.email?.toLowerCase(), expiresAt };
      localStorage.setItem("amsl_session", JSON.stringify(session));
      return session;
    }
  } catch(e) {}
  return null;
}

async function getSessionFromHash() {
  // Check URL hash first (fresh login)
  const hash = window.location.hash;
  if (hash.includes("access_token")) {
    const params = new URLSearchParams(hash.substring(1));
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const expiresIn = parseInt(params.get("expires_in") || "3600");
    if (token) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
      });
      const user = await res.json();
      if (user.email) {
        const expiresAt = Date.now() + expiresIn * 1000;
        localStorage.setItem("amsl_session", JSON.stringify({ token, refreshToken, email: user.email.toLowerCase(), expiresAt }));
        window.history.replaceState({}, document.title, window.location.pathname);
        return { token, email: user.email.toLowerCase() };
      }
    }
  }
  // Check localStorage for existing session
  try {
    const stored = localStorage.getItem("amsl_session");
    if (stored) {
      const sess = JSON.parse(stored);
      // If token is still valid (with 5 min buffer)
      if (sess.expiresAt > Date.now() + 300000) {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${sess.token}` }
        });
        if (res.ok) {
          const user = await res.json();
          if (user.email) return { token: sess.token, email: user.email.toLowerCase() };
        }
      }
      // Token expired or expiring soon - try to refresh
      if (sess.refreshToken) {
        const refreshed = await refreshAccessToken(sess.refreshToken);
        if (refreshed) return refreshed;
      }
      localStorage.removeItem("amsl_session");
    }
  } catch(e) {}
  return null;
}

const getTodayStr = () => new Date().toISOString().split("T")[0];
const formatTime = s => s ? new Date(s).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-";
const formatDate = s => s ? new Date(s + (s.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
const getDuration = (a, b) => {
  if (!a || !b) return null;
  const d = (new Date(b) - new Date(a)) / 60000;
  return `${Math.floor(d / 60)}h ${Math.round(d % 60)}m`;
};

function getProRatedDays(email, type) {
  const meta = COUNSEL_META[email];
  if (!meta) return type === "Earned Leave" ? 18 : type === "Casual/Sick Leave" ? 7 : 0;
  const today = getTodayStr();
  if (today < meta.probationEnd) return 0;
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const effectiveStart = meta.joinDate > yearStart ? meta.probationEnd : yearStart;
  const monthsLeft = Math.max(0, Math.ceil((new Date("2026-12-31") - new Date(effectiveStart)) / (1000 * 60 * 60 * 24 * 30.44)));
  if (type === "Earned Leave") return Math.min(18, Math.round(monthsLeft * 1.5));
  if (type === "Casual/Sick Leave") return Math.min(7, Math.round((monthsLeft / 12) * 7));
  if (type === "Bereavement Leave (Immediate Family)") return 5;
  if (type === "Bereavement Leave (Extended Family/Friend)") return 1;
  return 0;
}

function getBalance(lawyerId, email, leaves, type) {
  const today = getTodayStr();
  const meta = COUNSEL_META[email];
  const inProbation = meta && today < meta.probationEnd;
  const lt = LEAVE_TYPES.find(l => l.value === type);
  if (!lt) return null;
  if (inProbation && !lt.probationAllowed) return { total: 0, used: 0, remaining: 0, locked: true };
  const total = getProRatedDays(email, type);
  if (total === null || (!lt.maxDays && lt.maxDays !== 0)) return null;
  const used = leaves.filter(l => l.lawyer_id === lawyerId && l.type === type && l.status === "approved").reduce((s, l) => s + (l.days || 0), 0);
  return { total, used, remaining: Math.max(0, total - used) };
}

const CUSTOM_INITIALS = {
  "Riya Rajkumar Sharma": "RRS",
  "Aakarshan Majumdar": "AMa",
  "Aahna Mehrotra": "AM",
  "Rupakshi Choudhary": "RC",
  "Rushil Chadha": "RCh",
};

const getInitials = (name) => {
  if (!name) return "?";
  if (CUSTOM_INITIALS[name]) return CUSTOM_INITIALS[name];
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getDayOfWeek = dateStr => {
  if (!dateStr) return "";
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return days[new Date(dateStr + "T00:00:00").getDay()];
};

// Birthday helpers
function getBirthdayThisYear(birthday) {
  if (!birthday) return null;
  const [dd, mm] = birthday.split('-');
  const year = new Date().getFullYear();
  return `${year}-${mm}-${dd}`;
}

function formatBirthday(birthday) {
  if (!birthday) return '';
  const [dd, mm] = birthday.split('-');
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${parseInt(dd)} ${months[parseInt(mm)-1]}`;
}

function getDayOfWeekFromDate(dateStr) {
  if (!dateStr) return '';
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return days[new Date(dateStr + "T00:00:00").getDay()];
}

function isBirthdayToday(birthday) {
  if (!birthday) return false;
  const today = getTodayStr();
  const [dd, mm] = birthday.split('-');
  const todayDate = new Date(today + "T00:00:00");
  return todayDate.getDate() === parseInt(dd) && todayDate.getMonth() + 1 === parseInt(mm);
}

function getLeaveOverlap(fromDate, toDate, leaves, lawyers, excludeLawyerId) {
  return leaves.filter(l => {
    if (l.lawyer_id === excludeLawyerId) return false;
    if (l.status !== 'approved') return false;
    return l.from_date <= toDate && l.to_date >= fromDate;
  }).map(l => ({
    ...l,
    lawyerName: lawyers.find(lw => lw.id === l.lawyer_id)?.name || 'Unknown'
  }));
}

// -- Attendance Analytics --
const WORK_START = "09:30";
const GRACE_END = "10:00";
const TYPICAL_HOURS = 10; // 9:30 to 8:00 PM minus 30 min break

function getHoursWorked(signIn, signOut) {
  if (!signIn || !signOut) return 0;
  const diff = (new Date(signOut) - new Date(signIn)) / (1000 * 60 * 60);
  return Math.round(diff * 10) / 10;
}

function isShortSession(signIn, signOut) { if (!signIn || !signOut) return false; return getHoursWorked(signIn, signOut) < 0.5; }

function classifyDay(signIn, signOut) {
  if (!signIn) return "absent";
  const hours = getHoursWorked(signIn, signOut);
  if (!signOut) return "in-progress";
  if (hours < 3.5) return "day-off";
  if (hours < 5.5) return "half-day";
  if (hours < 6.5) return "short-day";
  return "full-day";
}

function isLateArrival(signIn) {
  if (!signIn) return false;
  const t = new Date(signIn);
  const hours = t.getHours();
  const mins = t.getMinutes();
  // Late if after 10:00 AM
  return hours > 10 || (hours === 10 && mins > 0);
}

function getSignInTimeStr(signIn) {
  if (!signIn) return "-";
  const t = new Date(signIn);
  return t.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function isWorkingDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  return day !== 0; // Exclude Sundays only; Saturdays tracked separately
}

function getWorkingDaysBetween(startStr, endStr) {
  const days = [];
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  const cur = new Date(start);
  while (cur <= end) {
    const dateStr = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,"0")}-${String(cur.getDate()).padStart(2,"0")}`;
    if (isWorkingDay(dateStr)) days.push(dateStr);
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function getMonthStr(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function getAttendanceSummary(lawyerId, lawyerJoinDate, attendanceList, leavesList, fromDate, toDate) {
  const records = attendanceList.filter(a => a.lawyer_id === lawyerId && a.date >= fromDate && a.date <= toDate);
  const workingDays = getWorkingDaysBetween(fromDate, toDate).filter(d => d >= lawyerJoinDate);

  let daysPresent = 0, lateDays = 0, fullDays = 0, halfDays = 0, shortDays = 0, dayOffDue = 0;
  let totalHours = 0;
  const unexplained = [];
  const lateList = [];
  const shortList = [];

  workingDays.forEach(date => {
    if (date > toDate) return;
    const rec = records.find(r => r.date === date);
    const onLeave = leavesList.find(l => l.lawyer_id === lawyerId && l.status === "approved" && l.from_date <= date && l.to_date >= date);
    if (onLeave) return; // approved leave - skip

    if (!rec || !rec.sign_in) {
      unexplained.push(date);
      return;
    }

    const classification = classifyDay(rec.sign_in, rec.sign_out);
    const hours = getHoursWorked(rec.sign_in, rec.sign_out);
    totalHours += hours;

    if (classification === "full-day") { fullDays++; daysPresent++; }
    else if (classification === "short-day") { shortDays++; daysPresent++; shortList.push({ date, hours }); }
    else if (classification === "half-day") { halfDays++; daysPresent++; }
    else if (classification === "day-off") { dayOffDue++; }
    else if (classification === "in-progress") { daysPresent++; }

    if (isLateArrival(rec.sign_in)) { lateDays++; lateList.push({ date, time: getSignInTimeStr(rec.sign_in) }); }
  });

  const avgHours = daysPresent > 0 ? Math.round((totalHours / daysPresent) * 10) / 10 : 0;
  const shortSessions = records.filter(r => isShortSession(r.sign_in, r.sign_out));
  return { daysPresent, lateDays, fullDays, halfDays, shortDays, dayOffDue, avgHours, totalHours: Math.round(totalHours * 10) / 10, unexplained, lateList, shortList, shortSessions, workingDays: workingDays.length };
}

// Saturday helpers
function getNextSaturday(fromDate) {
  const d = new Date(fromDate + "T00:00:00");
  const day = d.getDay();
  const daysUntilSat = day === 6 ? 7 : (6 - day + 7) % 7;
  d.setDate(d.getDate() + daysUntilSat);
  // Use local date to avoid timezone shift
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isFriday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 5;
}

function isMonday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 1;
}

function isSaturday(dateStr) {
  return new Date(dateStr + "T00:00:00").getDay() === 6;
}

function getSaturdaysInMonth(year, month) {
  const sats = [];
  const d = new Date(year, month, 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  while (d.getMonth() === month) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    sats.push(`${y}-${mo}-${dd}`);
    d.setDate(d.getDate() + 7);
  }
  return sats;
}

function isSandwichSaturday(satDate, holidays, leaveFrom, leaveTo) {
  // Check if saturday falls between a holiday and applied leave dates
  const sat = new Date(satDate + "T00:00:00");
  const from = new Date(leaveFrom + "T00:00:00");
  const to = new Date(leaveTo + "T00:00:00");
  if (sat < from || sat > to) return false;
  // Check if there's a holiday within 2 days of the saturday
  return holidays.some(h => {
    const hd = new Date(h.date + "T00:00:00");
    const diff = Math.abs(hd - sat) / (1000 * 60 * 60 * 24);
    return diff <= 2;
  });
}

const isOnMaternity = email => {
  const m = COUNSEL_META[email];
  if (!m?.maternityStart) return false;
  const t = getTodayStr();
  return t >= m.maternityStart && t < m.maternityEnd;
};

const isInProbation = email => {
  const m = COUNSEL_META[email];
  return m ? getTodayStr() < m.probationEnd : false;
};

// Role helpers
const isAssociatePartner = (lawyer) => lawyer?.role === 'associate_partner';
const isFounder = (lawyer) => lawyer?.role === 'founder' || lawyer?.is_admin;
const isJuniorCounsel = (email) => {
  return ['rushil.chadha@amsportslaw.com', 'aakarshan.majumdar@amsportslaw.com', 'rupakshi.choudhary@amsportslaw.com'].includes(email?.toLowerCase());
};

const isInLockIn = email => {
  const m = COUNSEL_META[email];
  if (!m?.lockInEnd) return false;
  const t = getTodayStr();
  return t >= (m.probationEnd || "") && t <= m.lockInEnd;
};

const hasOneYear = email => {
  const m = COUNSEL_META[email];
  if (!m) return false;
  const oneYear = new Date(m.joinDate);
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  return new Date(getTodayStr()) >= oneYear;
};


// -- Mini Calendar Component --
function MiniCalendar({ holidays, userLeaves }) {
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const today = getTodayStr();
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  function getDateStr(day) {
    return `${calYear}-${String(calMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function getDayMeta(day) {
    const d = getDateStr(day);
    const isToday = d === today;
    const isHol = holidays.find(h => h.date === d); // includes fixed, optional, and firm
    const isLeave = userLeaves.find(l => l.status === "approved" && l.from_date <= d && l.to_date >= d);
    const dow = new Date(calYear, calMonth, day).getDay();
    const isWeekend = dow === 0 || dow === 6;
    return { d, isToday, isHol, isLeave, isWeekend, dow };
  }

  function getDayStyle(day) {
    const { isToday, isHol, isLeave, isWeekend } = getDayMeta(day);
    let bg = "transparent", color = isWeekend ? "#4a4a6a" : "#6a6a8a", fontWeight = "normal";
    if (isToday) { bg = "#003366"; color = "#f5f5f0"; fontWeight = "bold"; }
    else if (isHol) { bg = "#1a2a3a"; color = "#4080aa"; }
    else if (isLeave) { bg = "#2a1a30"; color = "#9060b0"; }
    return { background: bg, color, fontWeight, borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "DM Mono, monospace" };
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); }}
          style={{ background: "none", border: "none", color: "#7a7a9a", cursor: "pointer", fontSize: 18, padding: "0 8px", lineHeight: 1 }}>{'<'}</button>
        <div style={{ flex: 1, textAlign: "center", fontFamily: "Cormorant Garamond, serif", fontSize: 15, color: "#1a1a2e", fontWeight: 600 }}>
          {monthNames[calMonth]} {calYear}
        </div>
        <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); }}
          style={{ background: "none", border: "none", color: "#7a7a9a", cursor: "pointer", fontSize: 18, padding: "0 8px", lineHeight: 1 }}>{'>'}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 4 }}>
        {dayNames.map(d => <div key={d} style={{ textAlign: "center", fontFamily: "DM Mono, monospace", fontSize: 9, color: "#7a7a9a", letterSpacing: "0.05em", paddingBottom: 4 }}>{d}</div>)}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 1 }}>
          {week.map((day, di) => (
            <div key={di} style={{ display: "flex", justifyContent: "center", padding: "1px 0" }}>
              {day ? <div style={getDayStyle(day)}>{day}</div> : null}
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: "flex", gap: 14, marginTop: 10, paddingTop: 10, borderTop: "1px solid #2a2a38", flexWrap: "wrap" }}>
        {[["#003366","Today"],["#4080aa","Holiday"],["#9060b0","Leave"]].map(([col, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: col + "33", border: `1px solid ${col}` }} />
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: 9, color: "#7a7a9a" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [lawyers, setLawyers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState(DEFAULT_HOLIDAYS);
  const [session, setSession] = useState(null);
  const [currentLawyer, setCurrentLawyer] = useState(null);
  const [view, setView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [notification, setNotification] = useState(null);
  const [leaveForm, setLeaveForm] = useState({ type: "Casual/Sick Leave", from: "", to: "", reason: "", isPostFacto: false });
  const [leaveError, setLeaveError] = useState("");
  const [bervForm, setBervForm] = useState({ type: "Bereavement Leave (Immediate Family)", from: "", to: "", name: "", relation: "Parent", reason: "" });
  const [holidayForm, setHolidayForm] = useState({ date: "", name: "", type: "fixed" });
  const [newCounselForm, setNewCounselForm] = useState({ name: "", email: "", is_admin: false });
  const [saturdays, setSaturdays] = useState([]);
  const [showSaturdayPrompt, setShowSaturdayPrompt] = useState(false);
  const [nextSatDate, setNextSatDate] = useState("");
  const [lastSatDate, setLastSatDate] = useState("");
  const [satPromptMode, setSatPromptMode] = useState("upcoming"); // "upcoming" or "past"
  const [correctionForm, setCorrectionForm] = useState({ type: "attendance", date: "", note: "", correctionField: "sign_out", correctedTime: "" });
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrections, setCorrections] = useState([]);
  const [activeTab, setActiveTab] = useState("apply");
  const [interns, setInterns] = useState([]);
  const [internAttendance, setInternAttendance] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isParalegal, setIsParalegal] = useState(false);
  const [internForm, setInternForm] = useState({ name: "", start_date: "", end_date: "" });
  const [showInternPicker, setShowInternPicker] = useState(false);
  const [leaveOverlapWarning, setLeaveOverlapWarning] = useState([]);
  const [showForgotSignout, setShowForgotSignout] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});
  const [missedSignoutDate, setMissedSignoutDate] = useState("");

  const today = getTodayStr();

  useEffect(() => { init(); }, []);

  async function init() {
    setLoading(true);
    const sess = await getSessionFromHash();
    if (sess) { await handleAuth(sess); return; }
    setLoading(false);
  }

  async function handleAuth(sess) {
    const email = sess.email?.toLowerCase();
    if (!email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
      setAuthError(`Access restricted to @${ALLOWED_DOMAIN} accounts only.`);
      setLoading(false);
      return;
    }
    const meta = COUNSEL_META[email];
    if (meta?.activeFrom && today < meta.activeFrom) {
      setAuthError(`Your portal access activates on ${formatDate(meta.activeFrom)}.`);
      setLoading(false);
      return;
    }
    setSession(sess);
    const [l, a, lv, sv, cv] = await Promise.all([db.get("Lawyers"), db.get("Attendance"), db.get("Leaves"), db.get("Saturdays"), db.get("Corrections")]);
    const lawyersList = Array.isArray(l) ? l : [];
    setLawyers(lawyersList);
    setAttendance(Array.isArray(a) ? a : []);
    setLeaves(Array.isArray(lv) ? lv : []);
    setSaturdays(Array.isArray(sv) ? sv : []);
    setCorrections(Array.isArray(cv) ? cv : []);
    const lawyer = lawyersList.find(lw => lw.email?.toLowerCase() === email) || null;
    setCurrentLawyer(lawyer);

    // Check if forgot to sign out yesterday
    const todCheck = getTodayStr();
    const yesterdayCheck = new Date(todCheck + "T00:00:00");
    yesterdayCheck.setDate(yesterdayCheck.getDate() - 1);
    const yStr = `${yesterdayCheck.getFullYear()}-${String(yesterdayCheck.getMonth()+1).padStart(2,"0")}-${String(yesterdayCheck.getDate()).padStart(2,"0")}`;
    const yesterdayAtt = (Array.isArray(a) ? a : []).find(att => att.lawyer_id === lawyer?.id && att.date === yStr);
    // Only show if signed in yesterday but sign_out is explicitly null or empty string
    if (yesterdayAtt?.sign_in && (yesterdayAtt?.sign_out === null || yesterdayAtt?.sign_out === "" || yesterdayAtt?.sign_out === undefined)) {
      setMissedSignoutDate(yStr);
      setShowForgotSignout(true);
    }

    // Load interns and intern attendance
    const [iv, ia, nv] = await Promise.all([db.get("Interns"), db.get("InternAttendance"), db.get("Notifications")]);
    setNotifications(Array.isArray(nv) ? nv.filter(n => n.lawyer_id === (lawyersList.find(lw => lw.email?.toLowerCase() === email)?.id)) : []);
    setInterns(Array.isArray(iv) ? iv : []);
    setInternAttendance(Array.isArray(ia) ? ia : []);

    // Handle paralegal login
    if (email === PARALEGAL_EMAIL) {
      setIsParalegal(true);
      const activeInterns = (Array.isArray(iv) ? iv : []).filter(i => i.active);
      if (activeInterns.length === 1) {
        setSelectedIntern(activeInterns[0]);
      } else if (activeInterns.length > 1) {
        setShowInternPicker(true);
      }
    }

    // Check Saturday prompt conditions
    const satTod = getTodayStr();
    if (lawyer) {
      const nextSat = getNextSaturday(satTod);
      setNextSatDate(nextSat);

      if (isFriday(satTod)) {
        // Friday: ask about UPCOMING Saturday only if not already recorded
        const satRecord = (Array.isArray(sv) ? sv : []).find(s => s.lawyer_id === lawyer.id && s.date === nextSat);
        if (!satRecord) {
          setSatPromptMode("upcoming");
          setShowSaturdayPrompt(true);
        }
        // If already recorded - never show prompt
      } else if (isMonday(satTod)) {
        // Monday: ask about LAST Saturday (2 days ago) only if not already recorded
        const lastSat = new Date(satTod + "T00:00:00");
        lastSat.setDate(lastSat.getDate() - 2);
        const y = lastSat.getFullYear();
        const m = String(lastSat.getMonth()+1).padStart(2,"0");
        const d = String(lastSat.getDate()).padStart(2,"0");
        const lastSatStr = `${y}-${m}-${d}`;
        setLastSatDate(lastSatStr);
        const lastSatRecord = (Array.isArray(sv) ? sv : []).find(s => s.lawyer_id === lawyer.id && s.date === lastSatStr);
        if (!lastSatRecord) {
          // Only show if not already recorded in DB
          setSatPromptMode("past");
          setShowSaturdayPrompt(true);
        }
        // If already recorded - never show prompt
      }
      // Tue/Wed/Thu/Sat/Sun: never show prompt
    }
    setLoading(false);
  }

  const notify = (msg, type = "success") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 3500); };

  const user = currentLawyer;
  const userEmail = session?.email?.toLowerCase() || "";
  const meta = COUNSEL_META[userEmail];
  const userAtt = attendance.filter(a => a.lawyer_id === user?.id);
  const userLeaves = leaves.filter(l => l.lawyer_id === user?.id);
  const todayAtt = userAtt.find(a => a.date === today);
  const inProbation = isInProbation(userEmail);
  const onMaternity = isOnMaternity(userEmail);
  const inLockIn = isInLockIn(userEmail);
  const isHoliday = d => holidays.find(h => h.date === d);

  const elBal = user ? getBalance(user.id, userEmail, leaves, "Earned Leave") : null;
  const slBal = user ? getBalance(user.id, userEmail, leaves, "Casual/Sick Leave") : null;
  const blIBal = user ? getBalance(user.id, userEmail, leaves, "Bereavement Leave (Immediate Family)") : null;
  const blEBal = user ? getBalance(user.id, userEmail, leaves, "Bereavement Leave (Extended Family/Friend)") : null;
  const hlUsed = userLeaves.filter(l => l.type === "Half-Day Leave" && l.status === "approved").length;

  function validateLeave(form) {
    if (!form.from || !form.reason) return "Please fill all required fields.";
    const to = form.to || form.from;
    const lt = LEAVE_TYPES.find(l => l.value === form.type);
    if (!lt) return "Invalid leave type.";
    if (inProbation && !lt.probationAllowed) return "This leave type is not available during probation. Any absence will be recorded as LWP.";
    if (onMaternity && form.type !== "Bereavement Leave (Immediate Family)" && form.type !== "Bereavement Leave (Extended Family/Friend)") return "You are currently on maternity leave.";
    if (!form.isPostFacto) {
      const fromH = isHoliday(form.from);
      if (fromH) return `${formatDate(form.from)} is a public holiday (${fromH.name}). No need to apply for leave.`;
    }
    const days = Math.ceil((new Date(to) - new Date(form.from)) / 86400000) + 1;
    if (lt.maxAtOnce && days > lt.maxAtOnce) return `${form.type} cannot exceed ${lt.maxAtOnce} consecutive days.`;
    if (form.type === "Maternity Leave" || form.type === "Paternity Leave") {
      if (!hasOneYear(userEmail)) return `${form.type} requires 1 year of service. You are not yet eligible.`;
    }
    if (lt.maxDays) {
      const bal = getBalance(user?.id, userEmail, leaves, form.type);
      if (bal && days > bal.remaining) return `Insufficient balance. You have ${bal.remaining} days remaining for ${form.type}.`;
    }
    return null;
  }

  async function handleSignIn() {
    if (todayAtt) { notify("Already signed in today!", "error"); return; }
    if (isHoliday(today)) { notify(`Today is a public holiday - ${isHoliday(today).name}`, "error"); return; }
    const now = new Date().toISOString();
    const result = await db.insert("Attendance", { lawyer_id: user.id, date: today, sign_in: now, sign_out: null });
    if (Array.isArray(result) && result[0]) { setAttendance(p => [...p, result[0]]); notify("Good morning! Signed in "); }
  }

  async function handleSignOut2() {
    if (!todayAtt || todayAtt.sign_out) return;
    const now = new Date().toISOString();
    const result = await db.update("Attendance", todayAtt.id, { sign_out: now });
    if (Array.isArray(result) && result[0]) { setAttendance(p => p.map(a => a.id === todayAtt.id ? result[0] : a)); notify("Signed out. Good evening! "); }
  }

  async function handleLeaveSubmit() {
    setLeaveError("");
    const err = validateLeave(leaveForm);
    if (err) { setLeaveError(err); return; }
    const to = leaveForm.to || leaveForm.from;
    const days = Math.ceil((new Date(to) - new Date(leaveForm.from)) / 86400000) + 1;
    const lt = LEAVE_TYPES.find(l => l.value === leaveForm.type);
    const effectiveType = inProbation && lt?.isLWPDuringProbation ? "Leave Without Pay" : leaveForm.type;
    const result = await db.insert("Leaves", {
      lawyer_id: user.id, type: effectiveType, from_date: leaveForm.from,
      to_date: to, days, reason: leaveForm.reason, status: "pending", applied_on: today,
      is_post_facto: leaveForm.isPostFacto || false
    });
    if (Array.isArray(result) && result[0]) {
      setLeaves(p => [...p, result[0]]);
      setLeaveForm({ type: "Casual/Sick Leave", from: "", to: "", reason: "", isPostFacto: false });
      notify("Leave application submitted ");
    }
  }

  async function handleSaturdayResponse(status) {
    if (!user) return;
    setShowSaturdayPrompt(false);
    const targetDate = satPromptMode === "past" ? lastSatDate : nextSatDate;
    if (!targetDate) return;
    const monthSats = getSaturdaysInMonth(new Date(targetDate + "T00:00:00").getFullYear(), new Date(targetDate + "T00:00:00").getMonth());
    const offsThisMonth = saturdays.filter(s => s.lawyer_id === user.id && monthSats.includes(s.date) && s.status === "off").length;
    const countsAsEl = status === "off" && offsThisMonth >= 2;
    const result = await db.insert("Saturdays", { lawyer_id: user.id, date: targetDate, status, counts_as_el: countsAsEl });
    if (Array.isArray(result) && result[0]) {
      setSaturdays(prev => [...prev, result[0]]);
      if (countsAsEl) notify("Note: You have used your 2 Saturday offs this month. This Saturday will count as Earned Leave.", "error");
      else notify(status === "working" ? "Saturday marked as working" : "Saturday off recorded");
    }
    setSatPromptMode("upcoming");
  }

  async function handleSignOutWithSaturdayCheck() {
    await handleSignOut2();
    // Show Saturday prompt on Friday signout
    if (isFriday(getTodayStr()) && nextSatDate) {
      const existing = saturdays.find(s => s.lawyer_id === user?.id && s.date === nextSatDate);
      if (!existing) setShowSaturdayPrompt(true);
    }
  }

  async function handleCorrectionSubmit() {
    if (!correctionForm.date) return;
    if (!isFounder(user) && !correctionForm.note) { notify("Please provide a reason for the correction.", "error"); return; }
    const resetForm = { type: "attendance", date: "", note: "", correctionField: "sign_out", signInTime: "", signOutTime: "" };
    const parts = [];
    if ((correctionForm.correctionField === "sign_in" || correctionForm.correctionField === "both") && correctionForm.signInTime) parts.push("Sign in: " + correctionForm.signInTime);
    if ((correctionForm.correctionField === "sign_out" || correctionForm.correctionField === "both") && correctionForm.signOutTime) parts.push("Sign out: " + correctionForm.signOutTime);
    const currentValue = parts.join(", ") || correctionForm.correctionField;

    if (isFounder(user)) {
      const attRec = attendance.find(a => a.lawyer_id === user.id && a.date === correctionForm.date);
      const updates = {};
      if ((correctionForm.correctionField === "sign_in" || correctionForm.correctionField === "both") && correctionForm.signInTime) {
        const [hh,mm] = correctionForm.signInTime.split(":");
        const d = new Date(correctionForm.date + "T00:00:00"); d.setHours(parseInt(hh),parseInt(mm),0,0);
        updates.sign_in = d.toISOString();
      }
      if ((correctionForm.correctionField === "sign_out" || correctionForm.correctionField === "both") && correctionForm.signOutTime) {
        const [hh,mm] = correctionForm.signOutTime.split(":");
        const d = new Date(correctionForm.date + "T00:00:00"); d.setHours(parseInt(hh),parseInt(mm),0,0);
        updates.sign_out = d.toISOString();
      }
      if (Object.keys(updates).length > 0) {
        if (attRec) { const r = await db.update("Attendance", attRec.id, updates); if (Array.isArray(r)&&r[0]) setAttendance(p=>p.map(a=>a.id===attRec.id?r[0]:a)); }
        else { const r = await db.insert("Attendance",{lawyer_id:user.id,date:correctionForm.date,...updates}); if (Array.isArray(r)&&r[0]) setAttendance(p=>[...p,r[0]]); }
      }
      setShowCorrectionModal(false); setCorrectionForm(resetForm); notify("Correction applied immediately");
    } else {
      const result = await db.insert("Corrections", {
        lawyer_id: user.id, lawyer_name: user.name, type: correctionForm.type,
        date: correctionForm.date, note: correctionForm.note,
        current_value: currentValue, status: "pending", requested_on: getTodayStr()
      });
      if (Array.isArray(result) && result[0]) {
        setCorrections(prev => [...prev, result[0]]);
        setShowCorrectionModal(false);
        setCorrectionForm(resetForm);
        notify("Correction request submitted - awaiting Aahna's approval");
        // Notify Aahna
        const aahna = lawyers.find(l => l.email?.toLowerCase() === "aahna.mehrotra@amsportslaw.com");
        if (aahna) {
          await db.insert("Notifications", {
            lawyer_id: aahna.id,
            message: user.name + " has requested a " + correctionForm.type + " correction for " + formatDate(correctionForm.date) + ": " + currentValue + ".",
            type: "correction_submitted", read: false
          });
        }
      }
    }
  }

  async function handleDeleteAttendance(attId, dateStr) {
    if (!window.confirm("Delete attendance record for " + formatDate(dateStr) + "?")) return;
    await db.delete("Attendance", attId);
    setAttendance(prev => prev.filter(a => a.id !== attId));
    notify("Attendance record deleted");
    if (!isFounder(user)) {
      const aahna = lawyers.find(l => l.email?.toLowerCase() === "aahna.mehrotra@amsportslaw.com");
      if (aahna) await db.insert("Notifications", { lawyer_id: aahna.id, message: user.name + " deleted their attendance record for " + formatDate(dateStr) + ".", type: "attendance_deleted", read: false });
    }
  }

  async function handleCorrectionAction(id, action) {
    const correction = corrections.find(c => c.id === id);
    const result = await db.update("Corrections", id, { status: action });
    if (Array.isArray(result) && result[0]) {
      setCorrections(prev => prev.map(c => c.id === id ? result[0] : c));
      if (action === "approved" && correction && correction.type === "attendance") {
        const attRec = attendance.find(a => a.lawyer_id === correction.lawyer_id && a.date === correction.date);
        const val = correction.current_value || "";
        const updates = {};
        const siMatch = val.match(/Sign in: (\d{1,2}:\d{2})/i);
        const soMatch = val.match(/Sign out: (\d{1,2}:\d{2})/i);
        if (siMatch) { const [hh,mm]=siMatch[1].split(":"); const d=new Date(correction.date+"T00:00:00"); d.setHours(parseInt(hh),parseInt(mm),0,0); updates.sign_in=d.toISOString(); }
        if (soMatch) { const [hh,mm]=soMatch[1].split(":"); const d=new Date(correction.date+"T00:00:00"); d.setHours(parseInt(hh),parseInt(mm),0,0); updates.sign_out=d.toISOString(); }
        if (Object.keys(updates).length > 0) {
          if (attRec) { const r=await db.update("Attendance",attRec.id,updates); if(Array.isArray(r)&&r[0]) setAttendance(p=>p.map(a=>a.id===attRec.id?r[0]:a)); }
          else { const r=await db.insert("Attendance",{lawyer_id:correction.lawyer_id,date:correction.date,...updates}); if(Array.isArray(r)&&r[0]) setAttendance(p=>[...p,r[0]]); }
        }
        await db.insert("Notifications",{lawyer_id:correction.lawyer_id,message:"Your correction for "+formatDate(correction.date)+" has been approved.",type:"correction_approved",read:false});
      } else if (action === "rejected" && correction) {
        await db.insert("Notifications",{lawyer_id:correction.lawyer_id,message:"Your correction for "+formatDate(correction.date)+" was not approved.",type:"correction_rejected",read:false});
      }
      notify(action === "approved" ? "Correction approved and attendance updated" : "Correction rejected");
    }
  }

  // Intern functions
  async function handleInternSignIn(internId) {
    const now = new Date().toISOString();
    const today = getTodayStr();
    const existing = internAttendance.find(a => a.intern_id === internId && a.date === today);
    if (existing) { notify("Already signed in today!", "error"); return; }
    const result = await db.insert("InternAttendance", { intern_id: internId, date: today, sign_in: now, sign_out: null });
    if (Array.isArray(result) && result[0]) {
      setInternAttendance(p => [...p, result[0]]);
      notify("Good morning! Signed in");
    }
  }

  async function handleInternSignOut(internId) {
    const today = getTodayStr();
    const existing = internAttendance.find(a => a.intern_id === internId && a.date === today);
    if (!existing || existing.sign_out) return;
    const now = new Date().toISOString();
    const result = await db.update("InternAttendance", existing.id, { sign_out: now });
    if (Array.isArray(result) && result[0]) {
      setInternAttendance(p => p.map(a => a.id === existing.id ? result[0] : a));
      notify("Signed out. Good evening!");
    }
  }

  async function handleAddIntern() {
    if (!internForm.name || !internForm.start_date || !internForm.end_date) {
      notify("Please fill all fields.", "error"); return;
    }
    const result = await db.insert("Interns", {
      name: internForm.name, start_date: internForm.start_date,
      end_date: internForm.end_date, added_by: user?.name || "Admin", active: true,
      certificate_requested: false
    });
    if (Array.isArray(result) && result[0]) {
      setInterns(p => [...p, result[0]]);
      setInternForm({ name: "", start_date: "", end_date: "" });
      notify("Intern added successfully");
    }
  }

  async function handleRemoveIntern(id) {
    if (!window.confirm("Remove this intern? Their attendance records will be kept.")) return;
    await db.update("Interns", id, { active: false });
    setInterns(p => p.map(i => i.id === id ? { ...i, active: false } : i));
    notify("Intern removed");
  }

  async function handleCertificateRequest(internId) {
    const today = getTodayStr();
    await db.update("Interns", internId, { certificate_requested: true, certificate_request_date: today });
    setInterns(p => p.map(i => i.id === internId ? { ...i, certificate_requested: true, certificate_request_date: today } : i));
    // Send email via a simple mailto link
    const intern = interns.find(i => i.id === internId);
    const subject = encodeURIComponent(`Certificate of Completion Request - ${intern?.name}`);
    const body = encodeURIComponent(`Dear Aahna,

I would like to request a Certificate of Completion for my internship at AM Sports Law & Management Co.

Intern Name: ${intern?.name}
Internship Period: ${formatDate(intern?.start_date)} to ${formatDate(intern?.end_date)}
Request Date: ${formatDate(today)}

Thank you.`);
    window.open(`mailto:aahna.mehrotra@amsportslaw.com,admin@amsportslaw.com?subject=${subject}&body=${body}`);
    notify("Certificate request sent via email");
  }

  async function handleBervSubmit() {
    if (!bervForm.from || !bervForm.name) { notify("Please fill all fields.", "error"); return; }
    const to = bervForm.to || bervForm.from;
    const days = Math.ceil((new Date(to) - new Date(bervForm.from)) / 86400000) + 1;
    const maxDays = bervForm.type === "Bereavement Leave (Immediate Family)" ? 5 : 1;
    if (days > maxDays) { notify(`Maximum ${maxDays} day(s) allowed for this bereavement type.`, "error"); return; }
    const result = await db.insert("Leaves", {
      lawyer_id: user.id, type: bervForm.type, from_date: bervForm.from,
      to_date: to, days, reason: `Bereavement - ${bervForm.name} (${bervForm.relation}). ${bervForm.reason}`.trim(),
      status: "approved", applied_on: today, is_post_facto: true
    });
    if (Array.isArray(result) && result[0]) {
      setLeaves(p => [...p, result[0]]);
      setBervForm({ type: "Bereavement Leave (Immediate Family)", from: "", to: "", name: "", relation: "Parent", reason: "" });
      notify("Bereavement leave recorded ");
    }
  }

  async function handleLeaveAction(leaveId, action) {
    const result = await db.update("Leaves", leaveId, { status: action });
    if (Array.isArray(result) && result[0]) { setLeaves(p => p.map(l => l.id === leaveId ? result[0] : l)); notify(action === "approved" ? "Approved " : "Rejected "); }
  }

  async function handleAddCounsel() {
    if (!newCounselForm.name || !newCounselForm.email) return;
    const result = await db.insert("Lawyers", { name: newCounselForm.name, email: newCounselForm.email.toLowerCase(), is_admin: newCounselForm.is_admin });
    if (Array.isArray(result) && result[0]) { setLawyers(p => [...p, result[0]]); setNewCounselForm({ name: "", email: "", is_admin: false }); notify("Counsel added "); }
  }

  async function handleRemoveCounsel(id) {
    if (!window.confirm("Remove this counsel from the portal?")) return;
    await db.delete("Lawyers", id);
    setLawyers(p => p.filter(l => l.id !== id));
    notify("Counsel removed");
  }

  const pendingLeaves = leaves.filter(l => l.status === "pending").map(l => ({
    ...l,
    lawyerName: lawyers.find(lw => lw.id === l.lawyer_id)?.name || "Unknown",
    lawyerEmail: lawyers.find(lw => lw.id === l.lawyer_id)?.email?.toLowerCase() || ""
  }));

  // Leaves visible to associate partner (Riya) = only junior counsel requests
  const pendingForRiya = pendingLeaves.filter(l => isJuniorCounsel(l.lawyerEmail));
  // Leaves visible to founder (Aahna) = all pending leaves
  const pendingForAdmin = pendingLeaves;
  // What current user sees in approvals
  const myPendingApprovals = isFounder(user) ? pendingForAdmin : isAssociatePartner(user) ? pendingForRiya : [];

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Raleway:wght@300;400;500;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#f0f4f8;font-family:'Raleway',sans-serif;}

    /* -- Topbar -- */
    .topbar{background:#0a2342;border-bottom:none;padding:0 40px 0 16px;display:flex;align-items:center;height:68px;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(10,35,66,.18);}
    .logo{margin-right:auto;display:flex;align-items:center;}
    .nb{background:none;border:none;color:rgba(255,255,255,.65);font-family:'Raleway',sans-serif;font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;padding:0 10px;height:68px;border-bottom:3px solid transparent;transition:all .2s;}
    .nb:hover{color:#ffffff;}
    .nb.active{color:#ffffff;border-bottom-color:#4a9fd4;}
    .uc{font-family:'Raleway',sans-serif;font-size:12px;color:rgba(255,255,255,.7);display:flex;align-items:center;gap:8px;margin-left:12px;font-weight:500;}
    .av{width:32px;height:32px;border-radius:50%;background:#4a9fd4;display:flex;align-items:center;justify-content:center;font-size:12px;color:#ffffff;font-family:'Raleway',sans-serif;font-weight:700;flex-shrink:0;}
    .lb{background:none;border:1px solid rgba(255,255,255,.3);color:rgba(255,255,255,.7);font-family:'Raleway',sans-serif;font-size:10px;font-weight:600;padding:5px 12px;border-radius:2px;cursor:pointer;margin-left:10px;letter-spacing:.08em;text-transform:uppercase;transition:all .2s;}
    .lb:hover{border-color:#ffffff;color:#ffffff;}

    /* -- Layout -- */
    .main{max-width:980px;margin:0 auto;padding:40px 28px;}
    .pt{font-family:'Playfair Display',serif;font-size:30px;color:#0a2342;font-weight:600;margin-bottom:4px;letter-spacing:-.01em;}
    .ps{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.18em;text-transform:uppercase;margin-bottom:32px;font-weight:500;}

    /* -- Cards -- */
    .card{background:#ffffff;border:none;border-radius:4px;padding:24px 28px;margin-bottom:16px;box-shadow:0 1px 4px rgba(10,35,66,.08);}
    .ct{font-family:'Raleway',sans-serif;font-size:10px;color:#4a9fd4;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px;font-weight:700;border-bottom:2px solid #e8f0f8;padding-bottom:10px;}

    /* -- Stat cards -- */
    .sc{background:#f5f9ff;border:1px solid #d0e4f4;border-radius:4px;padding:18px 20px;}
    .sv{font-family:'Playfair Display',serif;font-size:32px;color:#0a2342;font-weight:600;}
    .sl{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.12em;text-transform:uppercase;margin-top:4px;font-weight:500;}

    /* -- Grid -- */
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
    .g4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;}

    /* -- Buttons -- */
    .btn{padding:10px 22px;border-radius:3px;font-family:'Raleway',sans-serif;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;cursor:pointer;border:none;transition:all .2s;}
    .bg{background:#0a2342;color:#ffffff;}
    .bg:hover{background:#4a9fd4;}
    .bo{background:transparent;border:1px solid #c0d4e4;color:#4a7090;}
    .bo:hover{border-color:#0a2342;color:#0a2342;}
    .bgr{background:#1a7a3a;color:#ffffff;}
    .bgr:hover{background:#156030;}
    .br{background:#ffffff;color:#c0392b;border:1px solid #e8c0bc;}
    .br:hover{background:#fdf0ef;}
    .brd{background:#fdf0ef;color:#c0392b;border:1px solid #e8c0bc;}
    .bsm{padding:6px 14px;font-size:10px;}

    /* -- Sign in block -- */
    .sib{display:flex;align-items:center;gap:16px;padding:22px 26px;background:linear-gradient(135deg,#0a2342 0%,#1a4a7a 100%);border-radius:4px;margin-bottom:16px;}
    .td{font-family:'Playfair Display',serif;font-size:22px;color:#ffffff;letter-spacing:.02em;}
    .tl{font-family:'Raleway',sans-serif;font-size:10px;color:rgba(255,255,255,.6);letter-spacing:.14em;text-transform:uppercase;font-weight:600;}

    /* -- Tables -- */
    table{width:100%;border-collapse:collapse;}
    th{font-family:'Raleway',sans-serif;font-size:10px;color:#4a9fd4;letter-spacing:.16em;text-transform:uppercase;text-align:left;padding:0 0 12px;border-bottom:2px solid #d0e4f4;font-weight:700;}
    td{padding:12px 0;border-bottom:1px solid #f0f4f8;font-family:'Raleway',sans-serif;font-size:12px;color:#4a6070;vertical-align:middle;font-weight:400;}
    td:first-child{color:#0a2342;font-weight:600;}

    /* -- Badges -- */
    .badge{display:inline-block;padding:3px 10px;border-radius:12px;font-family:'Raleway',sans-serif;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;}
    .bp{background:#fff8e1;color:#b8860b;}
    .ba{background:#e8f5e9;color:#2e7d32;}
    .brej{background:#ffebee;color:#c62828;}
    .bin{background:#e3f2fd;color:#1565c0;}
    .bout{background:#f5f5f5;color:#757575;}
    .blv{background:#f3e5f5;color:#6a1b9a;}
    .bho{background:#e3f2fd;color:#0d47a1;}
    .bfirm{background:#e8f5e9;color:#1b5e20;}
    .bfirm{background:#e8f5e9;color:#1b5e20;}
    .bprob{background:#fff3e0;color:#e65100;}
    .bberv{background:#e0f2f1;color:#00695c;}

    /* -- Inputs -- */
    .inp{background:#ffffff;border:1px solid #c0d4e4;border-radius:3px;color:#0a2342;font-family:'Raleway',sans-serif;font-size:13px;font-weight:400;padding:10px 14px;width:100%;outline:none;transition:border-color .2s;}
    .inp:focus{border-color:#4a9fd4;box-shadow:0 0 0 3px rgba(74,159,212,.1);}
    .lbl{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;display:block;font-weight:700;}
    .fld{margin-bottom:16px;}
    select.inp option{background:#ffffff;}

    /* -- Staff rows -- */
    .sr{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #f0f4f8;}
    .sav{width:36px;height:36px;border-radius:50%;background:#0a2342;display:flex;align-items:center;justify-content:center;font-size:13px;color:#ffffff;font-family:'Raleway',sans-serif;font-weight:700;flex-shrink:0;}

    /* -- Notifications -- */
    .notif{position:fixed;top:76px;right:24px;background:#e8f5e9;border-left:4px solid #2e7d32;border-radius:3px;padding:12px 20px;font-family:'Raleway',sans-serif;font-size:12px;color:#1b5e20;z-index:999;font-weight:600;box-shadow:0 4px 12px rgba(0,0,0,.1);}
    .notif.err{background:#ffebee;border-left-color:#c62828;color:#b71c1c;}
    .errmsg{font-family:'Raleway',sans-serif;font-size:11px;color:#c62828;margin-top:10px;padding:10px 14px;background:#ffebee;border-radius:3px;border-left:3px solid #c62828;font-weight:500;}

    /* -- Balance bars -- */
    .bal-bar{height:5px;background:#d0e4f4;border-radius:3px;margin-top:8px;overflow:hidden;}
    .bal-fill{height:100%;border-radius:3px;background:#4a9fd4;transition:width .4s;}
    .bal-fill.low{background:#c62828;}

    /* -- Alerts -- */
    .alert{padding:14px 18px;border-radius:3px;font-family:'Raleway',sans-serif;font-size:12px;margin-bottom:14px;line-height:1.7;font-weight:500;}
    .alert-warn{background:#fff8e1;border-left:4px solid #f9a825;color:#7a5c00;}
    .alert-info{background:#e3f2fd;border-left:4px solid #1565c0;color:#0d47a1;}
    .alert-mat{background:#f3e5f5;border-left:4px solid #7b1fa2;color:#4a148c;}
    .alert-lock{background:#e8f5e9;border-left:4px solid #2e7d32;color:#1b5e20;}

    /* -- Tabs -- */
    .tab-row{display:flex;gap:0;margin-bottom:24px;border-bottom:2px solid #d0e4f4;}
    .tab{background:none;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:#7a94aa;font-family:'Raleway',sans-serif;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:10px 18px;cursor:pointer;transition:all .2s;}
    .tab.active{color:#0a2342;border-bottom-color:#4a9fd4;}
    .tab:hover{color:#0a2342;}

    /* -- Info rows -- */
    .info-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f4f8;}
    .info-label{font-family:'Raleway',sans-serif;font-size:10px;color:#7a94aa;letter-spacing:.12em;text-transform:uppercase;font-weight:600;}
    .info-val{font-family:'Raleway',sans-serif;font-size:13px;color:#0a2342;font-weight:400;}

    /* -- Modals -- */
    .modal-overlay{position:fixed;inset:0;background:rgba(10,35,66,.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(3px);}
    .modal{background:#ffffff;border-radius:4px;padding:36px;max-width:460px;width:90%;box-shadow:0 16px 48px rgba(10,35,66,.2);}
    .modal-title{font-family:'Playfair Display',serif;font-size:22px;color:#0a2342;font-weight:600;margin-bottom:8px;}
    .modal-sub{font-family:'Raleway',sans-serif;font-size:12px;color:#7a94aa;margin-bottom:24px;line-height:1.7;font-weight:400;}
    .modal-btns{display:flex;gap:10px;margin-top:22px;}

    /* -- Google button -- */
    .google-btn{display:flex;align-items:center;gap:12px;background:#ffffff;color:#0a2342;border:1px solid #c0d4e4;border-radius:3px;padding:13px 24px;font-family:'Raleway',sans-serif;font-size:13px;font-weight:600;cursor:pointer;width:100%;justify-content:center;transition:all .2s;letter-spacing:.04em;}
    .google-btn:hover{background:#f0f4f8;border-color:#0a2342;box-shadow:0 2px 8px rgba(10,35,66,.1);}

    /* -- Dividers -- */
    .dv{height:1px;background:#e0ecf4;margin:20px 0;}
    .sg{margin-top:24px;}
  `;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#7a7a9a", letterSpacing: "0.15em" }}>LOADING...</div>
    </div>
  );

  if (!session || !currentLawyer) return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div style={{ background: "#ffffff", border: "1px solid #2a2a38", borderRadius: 4, padding: "48px 40px", width: 420 }}>
        <img src="https://amsportslaw.com/img/amsport-logo.png" alt="AM Sports Law & Management Co." style={{ height: 48, objectFit: "contain", marginBottom: 16 }} />
        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#7a7a9a", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 32 }}>AMSL Counsels Portal</div>
        <div style={{ height: 1, background: "#d0e4f4", marginBottom: 24 }} />
        {authError && <div style={{ background: "#ffebee", borderLeft: "4px solid #c62828", borderRadius: 3, padding: "11px 16px", fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#b71c1c", marginBottom: 18, lineHeight: 1.6, fontWeight: 500 }}>{authError}</div>}
        <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#7a7a9a", marginBottom: 14, textAlign: "center", letterSpacing: "0.08em" }}>Sign in with your @amsportslaw.com account</div>
        <button className="google-btn" onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );

  const navItems = isParalegal ? ["intern dashboard", "intern attendance"] : ["dashboard", "attendance", "leaves", "my info", "birthdays", ...(isAssociatePartner(user) ? ["approvals"] : []), ...(isFounder(user) ? ["admin", "reports", "holidays", "interns"] : []), ...(!isParalegal && !isFounder(user) && !isAssociatePartner(user) && !isInProbation(userEmail) ? ["interns"] : [])];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8" }}>
      <style>{CSS}</style>
      {notification && <div className={`notif${notification.type === "error" ? " err" : ""}`}>{notification.msg}</div>}

      <div className="topbar">
        <div className="logo">
          <img src="https://amsportslaw.com/img/amsport-logo.png" alt="AM Sports Law & Management Co." style={{ height: 32, objectFit: "contain" }} />
        </div>
        {navItems.map(v => <button key={v} className={`nb${view === v ? " active" : ""}`} onClick={() => setView(v)}>{v}</button>)}
        {/* Notifications Bell */}
        <div style={{ position: "relative", marginLeft: 12 }}>
          <button onClick={() => setShowNotifications(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.8)", fontSize: 20, padding: "0 8px", position: "relative", lineHeight: 1 }}>
            &#9993;
            {notifications.filter(n => !n.read).length > 0 && (
              <span style={{ position: "absolute", top: -6, right: -2, background: "#e53935", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Raleway, sans-serif", fontWeight: 700 }}>
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          {showNotifications && (
            <div style={{ position: "fixed", right: 20, top: 72, background: "#fff", border: "1px solid #d0e4f4", borderRadius: 4, width: 320, boxShadow: "0 8px 24px rgba(10,35,66,.15)", zIndex: 300, maxHeight: 400, overflowY: "auto" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #e8f0f8", fontFamily: "Raleway, sans-serif", fontSize: 10, fontWeight: 700, color: "#4a9fd4", letterSpacing: "0.12em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <button onClick={async () => {
                    await Promise.all(notifications.filter(n => !n.read).map(n => db.update("Notifications", n.id, { read: true })));
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setShowNotifications(false);
                  }} style={{ background: "none", border: "none", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa", cursor: "pointer" }}>Mark all read</button>
                )}
              </div>
              {notifications.length === 0 && (
                <div style={{ padding: "20px 16px", fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#7a94aa", textAlign: "center" }}>No notifications</div>
              )}
              {[...notifications].reverse().map(n => (
                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #f0f4f8", background: n.read ? "#fff" : "#f0f7ff" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.type?.includes("approved") ? "#2e7d32" : n.type?.includes("rejected") ? "#c62828" : "#4a9fd4", flexShrink: 0, marginTop: 4 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#0a2342", lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa", marginTop: 3 }}>{formatDate(n.created_at?.slice(0,10))}</div>
                    </div>
                    {!n.read && (
                      <button onClick={async () => {
                        await db.update("Notifications", n.id, { read: true });
                        setNotifications(prev => prev.map(nn => nn.id === n.id ? { ...nn, read: true } : nn));
                      }} style={{ background: "none", border: "none", color: "#7a94aa", cursor: "pointer", fontSize: 14 }}>x</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8, flexShrink: 0 }}>
          <div className="av" title={user?.name}>{getInitials(user?.name)}</div>
          <button className="lb" style={{ lineHeight: 1.3, padding: "4px 10px", textAlign: "center", whiteSpace: "normal", maxWidth: 48 }} onClick={() => { localStorage.removeItem("amsl_session"); setSession(null); setCurrentLawyer(null); setLawyers([]); setAttendance([]); setLeaves([]); }}>Sign Out</button>
        </div>
      </div>

      <div className="main">

        {/* -- DASHBOARD -- */}
        {view === "dashboard" && (
          <>
            <div className="pt">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {user?.name.split(" ")[0]}.</div>
            <div className="ps">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>

            {isBirthdayToday(user?.birthday) && (
              <div style={{ background: "#2a1a30", border: "1px solid #c8a96e55", borderRadius: 4, padding: "12px 18px", marginBottom: 14, fontFamily: "DM Mono, monospace", fontSize: 12, color: "#003366", lineHeight: 1.6 }}>
                Happy Birthday, {user?.name.split(" ")[0]}! Your birthday leave has been auto-approved for today. Enjoy your special day!
              </div>
            )}
            {onMaternity && <div className="alert alert-mat"> You are on maternity leave until {formatDate(meta?.maternityEnd)}. Wishing you well!</div>}
            {inProbation && !onMaternity && <div className="alert alert-warn"> Probation period active until {formatDate(meta?.probationEnd)}. EL & CL/SL are not available during this period. Any leave taken will be recorded as LWP.</div>}
            {inLockIn && <div className="alert alert-lock"> You are within your lock-in period (ends {formatDate(meta?.lockInEnd)}). Resignation is not permitted during this time.</div>}
            {isHoliday(today) && <div className="alert alert-info"> Today is a public holiday - {isHoliday(today).name}</div>}

            <div className="sib">
              <div style={{ flex: 1 }}>
                <div className="tl">Today</div>
                <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                  <div><div className="tl" style={{ marginBottom: 2 }}>IN</div><div className="td">{formatTime(todayAtt?.sign_in)}</div></div>
                  <div><div className="tl" style={{ marginBottom: 2 }}>OUT</div><div className="td">{formatTime(todayAtt?.sign_out)}</div></div>
                  {todayAtt?.sign_in && todayAtt?.sign_out && <div><div className="tl" style={{ marginBottom: 2 }}>HRS</div><div className="td">{getDuration(todayAtt.sign_in, todayAtt.sign_out)}</div></div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {!todayAtt?.sign_in && !isHoliday(today) && !onMaternity && <button className="btn bg" onClick={handleSignIn}>Sign In</button>}
                {todayAtt?.sign_in && !todayAtt?.sign_out && <button className="btn bo" onClick={handleSignOutWithSaturdayCheck}>Sign Out</button>}
                {todayAtt?.sign_out && <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a" }}>Day complete </span>}
              </div>
            </div>

            {/* Mini Calendar */}
            <MiniCalendar holidays={holidays} userLeaves={userLeaves} />

            {/* Leave balance cards */}
            <div className="g4" style={{ marginBottom: 14 }}>
              <div className="sc">
                <div className="tl">Earned Leave</div>
                <div className="sv" style={{ marginTop: 4 }}>{elBal?.remaining ?? 0}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/{elBal?.total ?? 0}</span></div>
                <div className="sl">days left</div>
                <div className="bal-bar"><div className="bal-fill" style={{ width: `${elBal?.total > 0 ? (elBal.remaining / elBal.total) * 100 : 0}%` }} /></div>
              </div>
              <div className="sc">
                <div className="tl">Casual / Sick</div>
                <div className="sv" style={{ marginTop: 4 }}>{slBal?.remaining ?? 0}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/{slBal?.total ?? 0}</span></div>
                <div className="sl">days left</div>
                <div className="bal-bar"><div className={`bal-fill${slBal?.remaining <= 2 ? " low" : ""}`} style={{ width: `${slBal?.total > 0 ? (slBal.remaining / slBal.total) * 100 : 0}%` }} /></div>
              </div>
              <div className="sc">
                <div className="tl">Bereavement</div>
                <div className="sv" style={{ marginTop: 4 }}>{(blIBal?.remaining ?? 5)}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/5</span></div>
                <div className="sl">immediate family</div>
                <div className="bal-bar"><div className="bal-fill" style={{ width: `${((blIBal?.remaining ?? 5) / 5) * 100}%` }} /></div>
              </div>
              <div className="sc">
                <div className="tl">Half-Days Used</div>
                <div className="sv" style={{ marginTop: 4 }}>{hlUsed}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/2 <span style={{ fontSize: 10 }}>mo</span></span></div>
                <div className="sl">this month</div>
              </div>
            </div>

            <div className="g3" style={{ marginBottom: 14 }}>
              <div className="sc"><div className="sv">{userAtt.length}</div><div className="sl">Days Present</div></div>
              <div className="sc"><div className="sv">{userLeaves.filter(l => l.status === "approved").length}</div><div className="sl">Leaves Approved</div></div>
              <div className="sc"><div className="sv">{userLeaves.filter(l => l.status === "pending").length}</div><div className="sl">Leaves Pending</div></div>
            </div>

            <div className="card">
              <div className="ct">Office Today</div>
              {lawyers.filter(l => l.email?.toLowerCase() !== PARALEGAL_EMAIL).map(l => {
                const lEmail = l.email?.toLowerCase();
                const lMeta = COUNSEL_META[lEmail];
                const att = attendance.find(a => a.lawyer_id === l.id && a.date === today);
                const onLeave = leaves.find(lv => lv.lawyer_id === l.id && lv.status === "approved" && lv.from_date <= today && lv.to_date >= today);
                const lOnMat = isOnMaternity(lEmail);
                const lInProb = isInProbation(lEmail);
                const notYet = lMeta?.activeFrom && today < lMeta.activeFrom;
                return (
                  <div className="sr" key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="sav">{getInitials(l.name)}</div>
                      <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 13, color: "#0a2342", fontWeight: 600 }}>{l.name}</div>
                    </div>
                    <div>
                      {notYet ? <span className="badge bout">Joining Jun 1</span>
                        : lOnMat ? <span className="badge blv">Maternity</span>
                        : lInProb ? <span className="badge bprob">Probation</span>
                        : isHoliday(today) ? <span className="badge bho">Holiday</span>
                        : onLeave ? <span className="badge blv">On Leave</span>
                        : att?.sign_in && !att?.sign_out ? <span className="badge bin">In {formatTime(att.sign_in)}</span>
                        : att?.sign_out ? <span className="badge ba">Done</span>
                        : <span className="badge bout">Not In</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saturday Status */}
            {(() => {
              const monthSats = getSaturdaysInMonth(new Date().getFullYear(), new Date().getMonth());
              const offsUsed = saturdays.filter(s => s.lawyer_id === user?.id && monthSats.includes(s.date) && s.status === "off").length;
              const nextSat = monthSats.find(s => s >= today);
              const nextSatRecord = saturdays.find(s => s.lawyer_id === user?.id && s.date === nextSat);
              return (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="ct">Saturday Tracker - {new Date().toLocaleString("en-IN", { month: "long" })}</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className="sc" style={{ flex: 1 }}>
                      <div className="sv">{offsUsed}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/2</span></div>
                      <div className="sl">Saturdays off used</div>
                    </div>
                    <div className="sc" style={{ flex: 2 }}>
                      <div className="tl">Next Saturday - {nextSat ? `${getDayOfWeek(nextSat)}, ${formatDate(nextSat)}` : "-"}</div>
                      <div style={{ marginTop: 8 }}>
                        {nextSatRecord
                          ? <span className={`badge ${nextSatRecord.status === "working" ? "bin" : "bout"}`}>{nextSatRecord.status === "working" ? "Working" : "Day Off"}{nextSatRecord.counts_as_el ? " (EL)" : ""}</span>
                          : <button className="btn bg bsm" onClick={() => setShowSaturdayPrompt(true)}>Mark Saturday Status</button>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Upcoming Birthday */}
            {(() => {
              const today = getTodayStr();
              const upcoming = lawyers
                .filter(l => l.birthday && l.id !== user?.id)
                .map(l => ({ ...l, bdayThisYear: getBirthdayThisYear(l.birthday) }))
                .filter(l => l.bdayThisYear >= today)
                .sort((a, b) => a.bdayThisYear.localeCompare(b.bdayThisYear))[0];
              if (!upcoming) return null;
              const daysUntil = Math.ceil((new Date(upcoming.bdayThisYear + "T00:00:00") - new Date(today + "T00:00:00")) / 86400000);
              return (
                <div style={{ background: "#f0f0f0", border: "1px solid #2a2a4a", borderRadius: 4, padding: "12px 18px", marginBottom: 14, fontFamily: "DM Mono, monospace", fontSize: 11, color: "#6a6a8a", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}></span>
                  <span>
                    <span style={{ color: "#2a2a3a" }}>{upcoming.name.split(" ")[0]}'s</span> birthday is on {getDayOfWeekFromDate(upcoming.bdayThisYear)}, {formatBirthday(upcoming.birthday)}
                    {daysUntil === 0 ? " - Today!" : daysUntil === 1 ? " - Tomorrow!" : ` - in ${daysUntil} days`}
                  </span>
                </div>
              );
            })()}

            <div className="card">
              <div className="ct">Upcoming Holidays</div>
              {holidays.filter(h => h.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(h => (
                <div className="sr" key={h.date}>
                  <div style={{ flex: 1, fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{h.name}</div>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginRight: 6 }}>{getDayOfWeek(h.date)}, {formatDate(h.date)}</span>
                  <span className={`badge ${h.type === "fixed" ? "bho" : h.type === "firm" ? "bfirm" : "blv"}`}>{h.type === "firm" ? "Firm" : h.type}</span>
                </div>
              ))}
            </div>

            {(isFounder(user) || isAssociatePartner(user)) && myPendingApprovals.length > 0 && (
              <div className="card">
                <div className="ct">Pending Approvals ({myPendingApprovals.length})</div>
                {myPendingApprovals.map(l => (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1e1e2a" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{l.lawyerName}</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>{l.type} . {formatDate(l.from_date)}{l.from_date !== l.to_date ? ` -> ${formatDate(l.to_date)}` : ""} . {l.days}d</div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#6a6a8a", marginTop: 3, fontStyle: "italic" }}>{l.reason}</div>
                    </div>
                    <button className="btn bgr bsm" onClick={() => handleLeaveAction(l.id, "approved")}>Approve</button>
                    <button className="btn br bsm" onClick={() => handleLeaveAction(l.id, "rejected")}>Reject</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* -- MY INFO -- */}
        {view === "my info" && (
          <>
            <div className="pt">My Profile</div>
            <div className="ps">Your employment details and entitlements</div>
            <div className="card">
              <div className="ct">Employment Details</div>
              <div className="info-row"><span className="info-label">Name</span><span className="info-val">{user?.name}</span></div>
              <div className="info-row"><span className="info-label">Email</span><span className="info-val">{userEmail}</span></div>
              <div className="info-row"><span className="info-label">Date of Joining</span><span className="info-val">{formatDate(meta?.joinDate)}</span></div>
              <div className="info-row"><span className="info-label">Probation Ends</span><span className="info-val">{formatDate(meta?.probationEnd)} {inProbation ? <span className="badge bprob">Active</span> : <span className="badge ba">Completed</span>}</span></div>
              {meta?.lockInEnd && <div className="info-row"><span className="info-label">Lock-in Period</span><span className="info-val">{formatDate(meta.probationEnd)} - {formatDate(meta.lockInEnd)} {inLockIn ? <span className="badge bprob">Active</span> : today > meta.lockInEnd ? <span className="badge ba">Completed</span> : <span className="badge bout">Not Started</span>}</span></div>}
              {meta?.maternityStart && <div className="info-row"><span className="info-label">Maternity Leave</span><span className="info-val">{formatDate(meta.maternityStart)} - {formatDate(meta.maternityEnd)} {onMaternity ? <span className="badge blv">Active</span> : ""}</span></div>}
              {!meta?.isFounder && <div className="info-row"><span className="info-label">Notice Period (You)</span><span className="info-val">{meta?.noticeByCounsel ? `${meta.noticeByCounsel} month${meta.noticeByCounsel > 1 ? "s" : ""}` : "N/A"}</span></div>}
              {!meta?.isFounder && <div className="info-row"><span className="info-label">Notice Period (Firm)</span><span className="info-val">{meta?.noticeByFirm ? `${meta.noticeByFirm} month` : "N/A"}</span></div>}
            </div>
            <div className="card">
              <div className="ct">Leave Entitlements</div>
              {[
                { label: "Earned Leave (EL)", bal: elBal, total: elBal?.total ?? 0 },
                { label: "Casual / Sick Leave (CL/SL)", bal: slBal, total: slBal?.total ?? 0 },
                { label: "Bereavement - Immediate Family", bal: blIBal, total: 5 },
                { label: "Bereavement - Extended/Friends", bal: blEBal, total: 1 },
              ].map(({ label, bal, total }) => (
                <div key={label} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#2a2a3a" }}>{label}</span>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#003366" }}>{bal?.remaining ?? total} / {total} days</span>
                  </div>
                  <div className="bal-bar"><div className="bal-fill" style={{ width: `${total > 0 ? ((bal?.remaining ?? total) / total) * 100 : 0}%` }} /></div>
                  {bal?.locked && <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#7a7a9a", marginTop: 4 }}>Not available during probation</div>}
                </div>
              ))}
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#2a2a3a" }}>Half-Day Leave (this month)</span>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#003366" }}>{hlUsed} / 2 used</span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="ct">Leave Summary</div>
              <table>
                <thead><tr><th>Type</th><th>Approved</th><th>Pending</th><th>Rejected</th></tr></thead>
                <tbody>
                  {LEAVE_TYPES.map(lt => {
                    const approved = userLeaves.filter(l => l.type === lt.value && l.status === "approved").reduce((s, l) => s + (l.days || 0), 0);
                    const pending = userLeaves.filter(l => l.type === lt.value && l.status === "pending").length;
                    const rejected = userLeaves.filter(l => l.type === lt.value && l.status === "rejected").length;
                    if (!approved && !pending && !rejected) return null;
                    return <tr key={lt.value}><td>{lt.value}</td><td>{approved ? <span className="badge ba">{approved}d</span> : "-"}</td><td>{pending ? <span className="badge bp">{pending}</span> : "-"}</td><td>{rejected ? <span className="badge brej">{rejected}</span> : "-"}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* -- ATTENDANCE -- */}
        {view === "attendance" && (
          <>
            <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <div className="pt">Attendance</div>
                <div className="ps">Your sign-in history</div>
              </div>
              <button className="btn bo bsm" style={{ marginBottom: 32 }} onClick={() => { setShowCorrectionModal(true); setCorrectionForm(f => ({...f, date: getTodayStr()})); }}>Request Correction</button>
            </div>
            <div className="card">
              <table>
                <thead><tr><th>Date</th><th>Sign In</th><th>Sign Out</th><th>Duration</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[...userAtt].sort((a, b) => b.date.localeCompare(a.date)).map((a, i) => (
                    <tr key={i}><td>{formatDate(a.date)}</td><td>{formatTime(a.sign_in)}</td><td>{formatTime(a.sign_out)}</td><td>{getDuration(a.sign_in, a.sign_out) || "-"}</td><td><span className={`badge ${a.sign_out ? "ba" : "bp"}`}>{a.sign_out ? "Complete" : "In Progress"}</span></td><td><button className="btn brd bsm" onClick={() => handleDeleteAttendance(a.id, a.date)}>Delete</button></td></tr>
                  ))}
                  {userAtt.length === 0 && <tr><td colSpan={5} style={{ color: "#aaaacc", textAlign: "center", paddingTop: 20 }}>No records yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* -- MY ATTENDANCE (in My Info) -- */}
        {view === "my info" && !isParalegal && (() => {
          const today = getTodayStr();
          const currentMonth = today.slice(0, 7);
          const monthStart = currentMonth + "-01";
          const daysInMonth = new Date(parseInt(currentMonth.slice(0,4)), parseInt(currentMonth.slice(5,7)), 0).getDate();
          const monthEnd = currentMonth + "-" + String(daysInMonth).padStart(2,"0");
          const meta = COUNSEL_META[userEmail];
          if (!meta) return null;
          const attStart = meta.attendanceFrom || meta.joinDate;
          // Never show absences before portal start date
          const portalStart = "2026-05-25";
          const effectiveStart = attStart > portalStart ? attStart : portalStart;
          const fromDate = effectiveStart > monthStart ? effectiveStart : monthStart;
          const summary = getAttendanceSummary(user?.id, effectiveStart, attendance, leaves, fromDate, today < monthEnd ? today : monthEnd);
          const monthSats = getSaturdaysInMonth(new Date(monthStart + "T00:00:00").getFullYear(), new Date(monthStart + "T00:00:00").getMonth());
          const satOffs = saturdays.filter(s => s.lawyer_id === user?.id && monthSats.includes(s.date) && s.status === "off").length;
          return (
            <div className="card" style={{ marginTop: 16 }}>
              <div className="ct">My Attendance -- {new Date(monthStart + "T00:00:00").toLocaleString("en-IN", { month: "long", year: "numeric" })}</div>
              <div style={{ background: "#f5f9ff", border: "1px solid #d0e4f4", borderRadius: 3, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#4a9fd4", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Classification Key</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    ["Full Day", "6.5+ hours worked", "#2e7d32"],
                    ["Short Day", "5.5 to 6.5 hrs -- more than 2/month flagged", "#b7860a"],
                    ["Half Day", "3.5 to 5.5 hours -- deducted from EL", "#6a1b9a"],
                    ["Day Off (auto)", "Under 3.5 hours -- treated as absent", "#c62828"],
                    ["Late Arrival", "Sign-in after 10:00 AM", "#1565c0"],
                    ["Unexplained", "No record and no approved leave", "#880e4f"],
                  ].map(([label, desc, color]) => (
                    <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0, marginTop: 3 }} />
                      <div>
                        <span style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, fontWeight: 700, color }}>{label}: </span>
                        <span style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, color: "#4a6070" }}>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="g4" style={{ marginBottom: 16 }}>
                {[
                  ["Days Present", summary.daysPresent, "#0a2342"],
                  ["Full Days", summary.fullDays, "#2e7d32"],
                  ["Half Days", summary.halfDays, "#6a1b9a"],
                  ["Late Arrivals", summary.lateDays, "#1565c0"],
                  ["Short Days", summary.shortDays, "#b7860a"],
                  ["Unexplained", summary.unexplained.length, "#c62828"],
                  ["Avg Hours", summary.avgHours, "#0a2342"],
                  ["Saturdays Off", satOffs, satOffs > 2 ? "#c62828" : "#0a2342"],
                ].map(([label, val, color]) => (
                  <div key={label} className="sc">
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 22, fontWeight: 700, color }}>{val}</div>
                    <div className="sl">{label}</div>
                  </div>
                ))}
              </div>
              {summary.lateList.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#1565c0", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Late Arrivals</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {summary.lateList.map(l => (
                      <span key={l.date} style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#1565c0" }}>{formatDate(l.date)} -- {l.time}</span>
                    ))}
                  </div>
                </div>
              )}
              {summary.shortList.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#b7860a", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Short Days {summary.shortDays > 2 ? "-- Flagged: More than 2 this month" : ""}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {summary.shortList.map(s => (
                      <span key={s.date} style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#b7860a" }}>{formatDate(s.date)} -- {s.hours}h</span>
                    ))}
                  </div>
                </div>
              )}
              {summary.unexplained.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#c62828", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Unexplained Absences</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {summary.unexplained.map(d => (
                      <span key={d} style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#c62828" }}>{getDayOfWeek(d)}, {formatDate(d)}</span>
                    ))}
                  </div>
                </div>
              )}
              {satOffs > 2 && (
                <div className="alert alert-warn" style={{ marginTop: 12 }}>
                  You have taken {satOffs} Saturday offs this month -- exceeding the 2-day allowance. Additional offs require Aahna's approval.
                </div>
              )}
            </div>
          );
        })()}

        {/* -- LEAVES -- */}
        {view === "leaves" && (
          <>
            <div className="pt">Leave Management</div>
            <div className="ps">Apply and track your leaves</div>
            {inProbation && <div className="alert alert-warn"> During probation, EL and CL/SL are not available. Any absence will be recorded as LWP. Half-day and bereavement leaves are available.</div>}
            {isBirthdayToday(user?.birthday) && (
              <div style={{ background: "#2a1a30", border: "1px solid #c8a96e55", borderRadius: 4, padding: "12px 18px", marginBottom: 14, fontFamily: "DM Mono, monospace", fontSize: 12, color: "#003366", lineHeight: 1.6 }}>
                Happy Birthday, {user?.name.split(" ")[0]}! Your birthday leave has been auto-approved for today. Enjoy your special day!
              </div>
            )}
            {onMaternity && <div className="alert alert-mat"> You are on maternity leave until {formatDate(meta?.maternityEnd)}. Bereavement leave can still be recorded if needed.</div>}

            <div className="tab-row">
              <button className={`tab${activeTab === "apply" ? " active" : ""}`} onClick={() => setActiveTab("apply")}>Apply for Leave</button>
              <button className={`tab${activeTab === "optional" ? " active" : ""}`} onClick={() => setActiveTab("optional")}>Optional Holidays</button>
              <button className={`tab${activeTab === "berv" ? " active" : ""}`} onClick={() => setActiveTab("berv")}>Record Bereavement</button>
              <button className={`tab${activeTab === "history" ? " active" : ""}`} onClick={() => setActiveTab("history")}>Leave History</button>
            </div>

            {activeTab === "apply" && (
              <div className="card">
                <div className="ct">Leave Application</div>
                <div className="g2">
                  <div className="fld">
                    <label className="lbl">Leave Type</label>
                    <select className="inp" value={leaveForm.type} onChange={e => { setLeaveForm(f => ({ ...f, type: e.target.value })); setLeaveError(""); }}>
                      {LEAVE_TYPES.filter(lt => !lt.value.includes("Bereavement")).map(t => <option key={t.value}>{t.value}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <label className="lbl">Application Type</label>
                    <select className="inp" value={leaveForm.isPostFacto ? "postFacto" : "advance"} onChange={e => setLeaveForm(f => ({ ...f, isPostFacto: e.target.value === "postFacto" }))}>
                      <option value="advance">In Advance</option>
                      <option value="postFacto">Post-Facto (after the fact)</option>
                    </select>
                  </div>
                  <div className="fld"><label className="lbl">From Date</label><input type="date" className="inp" value={leaveForm.from} onChange={e => { setLeaveForm(f => ({ ...f, from: e.target.value })); setLeaveError(""); }} /></div>
                  <div className="fld"><label className="lbl">To Date <span style={{ color: "#aaaacc" }}>(optional)</span></label><input type="date" className="inp" value={leaveForm.to} onChange={e => { setLeaveForm(f => ({ ...f, to: e.target.value })); setLeaveError(""); }} /></div>
                </div>
                <div className="fld"><label className="lbl">Reason</label><textarea className="inp" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm(f => ({ ...f, reason: e.target.value }))} placeholder="Brief reason for leave..." style={{ resize: "vertical" }} /></div>
                {leaveError && <div className="errmsg">{leaveError}</div>}
                <button className="btn bg" style={{ marginTop: 8 }} onClick={handleLeaveSubmit}>Submit Application</button>
              </div>
            )}

            {activeTab === "optional" && (
              <div className="card">
                <div className="ct">Claim Optional Holiday Leave</div>
                <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "#7a94aa", marginBottom: 20, lineHeight: 1.8, fontWeight: 400 }}>
                  You are entitled to <strong style={{ color: "#0a2342" }}>4 optional holiday days</strong> per year, chosen from the list below. These are included in your 18-day Earned Leave entitlement. Select a date you wish to observe and submit - it will be deducted from your EL balance.
                </div>
                {(() => {
                  const optionalHols = holidays.filter(h => h.type === "optional");
                  const claimedOptional = userLeaves.filter(l => l.type === "Earned Leave" && optionalHols.some(h => h.date === l.from_date && h.date === l.to_date));
                  const remainingOptional = Math.max(0, 4 - claimedOptional.length);
                  return (
                    <>
                      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                        <div className="sc" style={{ flex: 1 }}>
                          <div className="sv">{remainingOptional}<span style={{ fontSize: 16, color: "#7a94aa", fontFamily: "Raleway, sans-serif" }}>/4</span></div>
                          <div className="sl">Optional days remaining</div>
                        </div>
                        <div className="sc" style={{ flex: 1 }}>
                          <div className="sv">{claimedOptional.length}</div>
                          <div className="sl">Already claimed</div>
                        </div>
                      </div>
                      {remainingOptional === 0 && (
                        <div className="alert alert-info" style={{ marginBottom: 16 }}>You have claimed all 4 optional holiday days for this year.</div>
                      )}
                      <table>
                        <thead>
                          <tr>
                            <th>Holiday</th>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Status</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {optionalHols.sort((a, b) => a.date.localeCompare(b.date)).map(h => {
                            const claimed = claimedOptional.find(l => l.from_date === h.date);
                            const isPast = h.date < getTodayStr();
                            const canClaim = !claimed && remainingOptional > 0 && !isPast && !inProbation;
                            return (
                              <tr key={h.date}>
                                <td>{h.name}</td>
                                <td>{formatDate(h.date)}</td>
                                <td>{getDayOfWeek(h.date)}</td>
                                <td>
                                  {claimed
                                    ? <span className="badge ba">Claimed</span>
                                    : isPast
                                    ? <span className="badge bout">Passed</span>
                                    : inProbation
                                    ? <span className="badge bprob">Probation</span>
                                    : remainingOptional === 0
                                    ? <span className="badge bout">Limit reached</span>
                                    : <span className="badge bp">Available</span>}
                                </td>
                                <td>
                                  {canClaim && (
                                    <button className="btn bg bsm" onClick={async () => {
                                      const result = await db.insert("Leaves", {
                                        lawyer_id: user.id, type: "Earned Leave",
                                        from_date: h.date, to_date: h.date, days: 1,
                                        reason: `Optional Holiday: ${h.name}`,
                                        status: "approved", applied_on: getTodayStr(), is_post_facto: false
                                      });
                                      if (Array.isArray(result) && result[0]) {
                                        setLeaves(p => [...p, result[0]]);
                                        notify(`${h.name} claimed as optional holiday leave`);
                                      }
                                    }}>Claim</button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </>
                  );
                })()}
              </div>
            )}

            {activeTab === "berv" && (
              <div className="card">
                <div className="ct">Record Bereavement Leave</div>
                <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginBottom: 16, lineHeight: 1.7 }}>
                  Bereavement leave is recorded post-facto. Immediate family (parent, spouse, child, sibling): 5 days. Extended family or friend: 1 day on compassionate grounds.
                </div>
                <div className="g2">
                  <div className="fld">
                    <label className="lbl">Type</label>
                    <select className="inp" value={bervForm.type} onChange={e => setBervForm(f => ({ ...f, type: e.target.value }))}>
                      <option>Bereavement Leave (Immediate Family)</option>
                      <option>Bereavement Leave (Extended Family/Friend)</option>
                    </select>
                  </div>
                  <div className="fld">
                    <label className="lbl">Relation</label>
                    <select className="inp" value={bervForm.relation} onChange={e => setBervForm(f => ({ ...f, relation: e.target.value }))}>
                      {bervForm.type.includes("Immediate") ? ["Parent", "Spouse", "Child", "Sibling"].map(r => <option key={r}>{r}</option>) : ["Grandparent", "Aunt/Uncle", "Cousin", "Friend", "Other"].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="fld"><label className="lbl">From Date</label><input type="date" className="inp" value={bervForm.from} onChange={e => setBervForm(f => ({ ...f, from: e.target.value }))} /></div>
                  <div className="fld"><label className="lbl">To Date <span style={{ color: "#aaaacc" }}>(optional)</span></label><input type="date" className="inp" value={bervForm.to} onChange={e => setBervForm(f => ({ ...f, to: e.target.value }))} /></div>
                </div>
                <div className="fld"><label className="lbl">Name of Deceased</label><input type="text" className="inp" value={bervForm.name} onChange={e => setBervForm(f => ({ ...f, name: e.target.value }))} placeholder="Name of the person" /></div>
                <div className="fld"><label className="lbl">Additional Notes <span style={{ color: "#aaaacc" }}>(optional)</span></label><textarea className="inp" rows={2} value={bervForm.reason} onChange={e => setBervForm(f => ({ ...f, reason: e.target.value }))} style={{ resize: "vertical" }} /></div>
                <button className="btn bg" onClick={handleBervSubmit}>Record Bereavement Leave</button>
              </div>
            )}

            {activeTab === "history" && (
              <div className="card">
                <div className="ct">My Leave History</div>
                <table>
                  <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {[...userLeaves].reverse().map(l => (
                      <tr key={l.id}>
                        <td style={{ maxWidth: 140 }}>{l.type}</td><td>{formatDate(l.from_date)}</td><td>{formatDate(l.to_date)}</td><td>{l.days}</td>
                        <td style={{ fontStyle: "italic", color: "#6a6a8a", maxWidth: 180 }}>{l.reason}</td>
                        <td><span className={`badge ${l.status === "approved" ? "ba" : l.status === "rejected" ? "brej" : "bp"}`}>{l.status}</span></td>
                      </tr>
                    ))}
                    {userLeaves.length === 0 && <tr><td colSpan={6} style={{ color: "#aaaacc", textAlign: "center", paddingTop: 20 }}>No applications yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -- ADMIN -- */}
        {view === "admin" && user?.is_admin && (
          <>
            <div className="pt">Admin Panel</div>
            <div className="ps">Manage counsels and approvals</div>
            <div className="card">
              <div className="ct">Add New Counsel</div>
              <div className="g3">
                <div className="fld"><label className="lbl">Full Name</label><input type="text" className="inp" value={newCounselForm.name} onChange={e => setNewCounselForm(f => ({ ...f, name: e.target.value }))} placeholder="Priya Sharma" /></div>
                <div className="fld"><label className="lbl">Firm Email</label><input type="email" className="inp" value={newCounselForm.email} onChange={e => setNewCounselForm(f => ({ ...f, email: e.target.value }))} placeholder="priya.sharma@amsportslaw.com" /></div>
                <div className="fld"><label className="lbl">Admin Access</label><select className="inp" value={newCounselForm.is_admin} onChange={e => setNewCounselForm(f => ({ ...f, is_admin: e.target.value === "true" }))}><option value="false">No</option><option value="true">Yes</option></select></div>
              </div>
              <button className="btn bg" onClick={handleAddCounsel}>Add Counsel</button>
            </div>
            <div className="card">
              <div className="ct">All Counsels</div>
              {lawyers.map(l => {
                const lEmail = l.email?.toLowerCase();
                const lMeta = COUNSEL_META[lEmail];
                const status = isOnMaternity(lEmail) ? "Maternity" : isInProbation(lEmail) ? "Probation" : lMeta?.activeFrom && today < lMeta.activeFrom ? "Not Yet Active" : "Active";
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid #1e1e2a" }}>
                    <div className="sav">{getInitials(l.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{l.name}</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#7a7a9a", marginTop: 2 }}>{l.email}</div>
                    </div>
                    <span className={`badge ${status === "Active" ? "ba" : status === "Maternity" ? "blv" : "bprob"}`}>{status}</span>
                    {l.is_admin && <span className="badge bho">Admin</span>}
                    {!l.is_admin && <button className="btn brd bsm" onClick={() => handleRemoveCounsel(l.id)}>Remove</button>}
                  </div>
                );
              })}
            </div>
            {/* Correction Requests */}
            {corrections.filter(c => c.status === "pending").length > 0 && (
              <div className="card">
                <div className="ct">Correction Requests ({corrections.filter(c => c.status === "pending").length})</div>
                {corrections.filter(c => c.status === "pending").map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e1e2a" }}>
                    <div className="sav">{c.lawyer_name?.[0] || "?"}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{c.lawyer_name}</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>
                        {c.type} correction . {getDayOfWeek(c.date)}, {formatDate(c.date)}
                      </div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#003366", marginTop: 2 }}>Correct to: {c.current_value}</div>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#6a6a8a", marginTop: 3, fontStyle: "italic" }}>{c.note}</div>
                    </div>
                    <button className="btn bgr bsm" onClick={() => handleCorrectionAction(c.id, "approved")}>Approve</button>
                    <button className="btn br bsm" onClick={() => handleCorrectionAction(c.id, "rejected")}>Reject</button>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              <div className="ct">Pending Approvals ({pendingLeaves.length})</div>
              {pendingLeaves.length === 0 && <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#aaaacc" }}>No pending requests.</div>}
              {pendingLeaves.map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid #1e1e2a" }}>
                  <div className="sav">{getInitials(l.lawyerName)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{l.lawyerName}</div>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>{l.type} . {formatDate(l.from_date)}{l.from_date !== l.to_date ? ` -> ${formatDate(l.to_date)}` : ""} . {l.days}d</div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#6a6a8a", marginTop: 3, fontStyle: "italic" }}>{l.reason}</div>
                  </div>
                  <button className="btn bgr bsm" onClick={() => handleLeaveAction(l.id, "approved")}>Approve</button>
                  <button className="btn br bsm" onClick={() => handleLeaveAction(l.id, "rejected")}>Reject</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* -- REPORTS -- */}
                {view === "reports" && isFounder(user) && (
          <>
            <div className="pt">Reports</div>
            <div className="ps">Attendance analytics and leave summary</div>

            {/* Key / Legend */}
            <div className="card">
              <div className="ct">Key -- What Each Classification Means</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["Full Day", "5.5+ hours worked", "#e8f5e9", "#2e7d32"],
                  ["Short Day", "5.5 to 6 hours worked. More than 2 in a month triggers a flag.", "#fff8e1", "#b7860a"],
                  ["Half Day", "3.5 to 5.5 hours worked. Deducted from EL.", "#f3e5f5", "#6a1b9a"],
                  ["Day Off (auto)", "Under 3.5 hours logged. Treated as absent.", "#ffebee", "#c62828"],
                  ["Late Arrival", "Sign-in after 10:00 AM (grace period ends at 10:00 AM).", "#e3f2fd", "#1565c0"],
                  ["Unexplained Absence", "No attendance record and no approved leave. Requires explanation.", "#fce4ec", "#880e4f"],
                  ["In Progress", "Signed in but not yet signed out for the day.", "#f0f4f8", "#4a7090"],
                  ["Saturday Flag", "More than 2 Saturday offs in a month. Requires Aahna's review.", "#fff3e0", "#e65100"],
                ].map(([label, desc, bg, color]) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 3, padding: "10px 14px" }}>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, fontWeight: 700, color, marginBottom: 3 }}>{label}</div>
                    <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, color: "#4a6070", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-counsel attendance summary */}
            {(() => {
              const today = getTodayStr();
              const currentMonth = today.slice(0, 7);
              const monthStart = currentMonth + "-01";
              const daysInMonth = new Date(parseInt(currentMonth.slice(0,4)), parseInt(currentMonth.slice(5,7)), 0).getDate();
              const monthEnd = currentMonth + "-" + String(daysInMonth).padStart(2,"0");

              return lawyers.filter(l => !isOnMaternity(l.email?.toLowerCase())).map(l => {
                const meta = COUNSEL_META[l.email?.toLowerCase()];
                if (!meta) return null;
                const attStart = meta.attendanceFrom || meta.joinDate;
                const portalStart = "2026-05-25";
                const effectiveStart = attStart > portalStart ? attStart : portalStart;
                const fromDate = effectiveStart > monthStart ? effectiveStart : monthStart;
                const summary = getAttendanceSummary(l.id, effectiveStart, attendance, leaves, fromDate, monthEnd < today ? monthEnd : today);
                const monthSats = getSaturdaysInMonth(new Date(monthStart + "T00:00:00").getFullYear(), new Date(monthStart + "T00:00:00").getMonth());
                const satOffs = saturdays.filter(s => s.lawyer_id === l.id && monthSats.includes(s.date) && s.status === "off").length;
                const satFlag = satOffs > 2;
                const shortDayFlag = summary.shortDays > 2;

                return (
                  <div className="card" key={l.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <div className="sav">{getInitials(l.name)}</div>
                      <div>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 14, fontWeight: 700, color: "#0a2342" }}>{l.name}</div>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#7a94aa", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          {new Date(monthStart + "T00:00:00").toLocaleString("en-IN", { month: "long", year: "numeric" })}
                        </div>
                      </div>
                      {satFlag && <span className="badge bprob" style={{ marginLeft: "auto" }}>Saturday Flag</span>}
                      {shortDayFlag && <span className="badge bp" style={{ marginLeft: satFlag ? 4 : "auto" }}>Short Day Flag</span>}
                    </div>

                    <div className="g4" style={{ marginBottom: 16 }}>
                      {[
                        ["Days Present", summary.daysPresent, "#0a2342"],
                        ["Full Days", summary.fullDays, "#2e7d32"],
                        ["Half Days", summary.halfDays, "#6a1b9a"],
                        ["Late Arrivals", summary.lateDays, "#1565c0"],
                        ["Short Days", summary.shortDays, "#b7860a"],
                        ["Unexplained", summary.unexplained.length, "#c62828"],
                        ["Avg Hours/Day", summary.avgHours, "#0a2342"],
                        ["Total Hours", summary.totalHours, "#0a2342"],
                      ].map(([label, val, color]) => (
                        <div key={label} className="sc">
                          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 20, fontWeight: 700, color }}>{val}</div>
                          <div className="sl">{label}</div>
                        </div>
                      ))}
                    </div>

                    {summary.lateList.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#1565c0", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Late Arrivals</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {summary.lateList.map(l => (
                            <span key={l.date} style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#1565c0" }}>
                              {formatDate(l.date)} -- {l.time}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {summary.shortList.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#b7860a", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Short Days {shortDayFlag ? "-- FLAG: More than 2 this month" : ""}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {summary.shortList.map(s => (
                            <span key={s.date} style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#b7860a" }}>
                              {formatDate(s.date)} -- {s.hours}h
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {summary.unexplained.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#c62828", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>Unexplained Absences</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {summary.unexplained.map(d => (
                            <span key={d} style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#c62828" }}>
                              {getDayOfWeek(d)}, {formatDate(d)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Daily Log */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#4a9fd4", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>Daily Log -- {new Date(monthStart + "T00:00:00").toLocaleString("en-IN", { month: "long", year: "numeric" })}</div>
                        <button onClick={() => setExpandedLogs(prev => ({ ...prev, [l.id]: !prev[l.id] }))} style={{ background: "none", border: "1px solid #d0e4f4", borderRadius: 3, padding: "3px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#4a9fd4", cursor: "pointer", fontWeight: 600 }}>
                          {expandedLogs[l.id] ? "Hide" : "Show Log"}
                        </button>
                      </div>
                      {expandedLogs[l.id] && <table>
                        <thead><tr><th>Date</th><th>Day</th><th>Sign In</th><th>Sign Out</th><th>Hours</th><th>Status</th></tr></thead>
                        <tbody>
                          {summary.workingDays > 0 && getWorkingDaysBetween(fromDate, monthEnd < today ? monthEnd : today).map(date => {
                            const rec = attendance.find(a => a.lawyer_id === l.id && a.date === date);
                            const onLeave = leaves.find(lv => lv.lawyer_id === l.id && lv.status === "approved" && lv.from_date <= date && lv.to_date >= date);
                            const classification = rec ? classifyDay(rec.sign_in, rec.sign_out) : onLeave ? "leave" : "absent";
                            const hours = rec ? getHoursWorked(rec.sign_in, rec.sign_out) : 0;
                            const late = rec && isLateArrival(rec.sign_in);
                            const bgColor = classification === "full-day" ? "#f1f8e9" : classification === "half-day" ? "#f3e5f5" : classification === "short-day" ? "#fff8e1" : classification === "leave" ? "#e3f2fd" : classification === "absent" ? "#ffebee" : "#fff";
                            return (
                              <tr key={date} style={{ background: bgColor }}>
                                <td>{formatDate(date)}</td>
                                <td>{getDayOfWeek(date)}</td>
                                <td style={{ color: late ? "#c62828" : "inherit" }}>{rec?.sign_in ? formatTime(rec.sign_in) + (late ? " (late)" : "") : "-"}</td>
                                <td>{rec?.sign_out ? formatTime(rec.sign_out) : "-"}</td>
                                <td>{hours > 0 ? hours + "h" : "-"}</td>
                                <td><span className={`badge ${classification === "full-day" ? "ba" : classification === "half-day" ? "blv" : classification === "short-day" ? "bp" : classification === "leave" ? "bho" : classification === "in-progress" ? "bin" : "brej"}`}>{classification === "in-progress" ? "In Progress" : classification === "day-off" ? "Day Off" : classification}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>}
                    </div>
                    {(() => {
                      const monthCorr = corrections.filter(c => c.lawyer_id === l.id && c.requested_on >= monthStart && c.requested_on <= (monthEnd < today ? monthEnd : today));
                      if (monthCorr.length === 0) return null;
                      return (
                        <div>
                          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: monthCorr.length > 3 ? "#c62828" : "#7a94aa", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                            Correction Requests This Month {monthCorr.length > 3 ? "-- Flagged: Excessive" : ""}
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {monthCorr.map(c => (
                              <span key={c.id} style={{ background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 12, padding: "2px 10px", fontFamily: "Raleway, sans-serif", fontSize: 10, color: "#6a1b9a" }}>
                                {formatDate(c.date)} -- {c.type} -- {c.status}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                );
              });
            })()}
          </>
        )}


        {view === "holidays" && user?.is_admin && (
          <>
            <div className="pt">Holiday Calendar</div>
            <div className="ps">Manage public and optional holidays</div>
            <div className="card">
              <div className="ct">Add Holiday</div>
              <div className="g3">
                <div className="fld"><label className="lbl">Date</label><input type="date" className="inp" value={holidayForm.date} onChange={e => setHolidayForm(f => ({ ...f, date: e.target.value }))} /></div>
                <div className="fld"><label className="lbl">Name</label><input type="text" className="inp" value={holidayForm.name} onChange={e => setHolidayForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Diwali" /></div>
                <div className="fld"><label className="lbl">Type</label><select className="inp" value={holidayForm.type} onChange={e => setHolidayForm(f => ({ ...f, type: e.target.value }))}><option value="fixed">Fixed (Compulsory)</option><option value="optional">Optional (counts as EL)</option></select></div>
              </div>
              <button className="btn bg" onClick={async () => {
  if (!holidayForm.date || !holidayForm.name) return;
  setHolidays(p => [...p, { ...holidayForm }]);
  if (holidayForm.type === "firm") {
    const msg = "Firm Holiday: " + holidayForm.name + " on " + getDayOfWeek(holidayForm.date) + ", " + formatDate(holidayForm.date) + ". Office will be closed.";
    await Promise.all(lawyers.map(l => db.insert("Notifications", { lawyer_id: l.id, message: msg, type: "firm_holiday", read: false })));
  }
  setHolidayForm({ date: "", name: "", type: "fixed" });
  notify("Holiday added");
}}>Add Holiday</button>
            </div>
            {["fixed", "optional"].map(type => (
              <div className="card" key={type}>
                <div className="ct">{type === "fixed" ? "Fixed Holidays" : "Optional Holidays"}</div>
                {holidays.filter(h => h.type === type).sort((a, b) => a.date.localeCompare(b.date)).map(h => (
                  <div className="sr" key={h.date}>
                    <span className={`badge ${type === "fixed" ? "bho" : "blv"}`}>{type}</span>
                    <div style={{ flex: 1, fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{h.name}</div>
                    <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginRight: 12 }}>{getDayOfWeek(h.date)}, {formatDate(h.date)}</span>
                    <button className="btn brd bsm" onClick={() => setHolidays(p => p.filter(hh => hh.date !== h.date))}>Remove</button>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}


        {/* -- BIRTHDAYS -- */}
        {view === "birthdays" && !isParalegal && (
          <>
            <div className="pt">Birthday Calendar</div>
            <div className="ps">Team birthdays and leave planning</div>
            {["01","02","03","04","05","06","07","08","09","10","11","12"].map(mm => {
              const monthLawyers = lawyers.filter(l => l.birthday && l.birthday.split('-')[1] === mm);
              if (monthLawyers.length === 0) return null;
              const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
              return (
                <div className="card" key={mm}>
                  <div className="ct">{monthNames[parseInt(mm)-1]}</div>
                  {monthLawyers.sort((a,b) => parseInt(a.birthday) - parseInt(b.birthday)).map(l => {
                    const bdayThisYear = getBirthdayThisYear(l.birthday);
                    const dow = getDayOfWeekFromDate(bdayThisYear);
                    const isHol = holidays.find(h => h.date === bdayThisYear);
                    const isWeekend = dow === "Sat" || dow === "Sun";
                    const overlappingLeaves = leaves.filter(lv => lv.status === "approved" && lv.lawyer_id !== l.id && lv.from_date <= bdayThisYear && lv.to_date >= bdayThisYear);
                    const isToday = bdayThisYear === getTodayStr();
                    return (
                      <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e1e2a" }}>
                        <div className="sav" style={{ background: isToday ? "#00336622" : "#f0f0f0" }}>{getInitials(l.name)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: isToday ? "#003366" : "#2a2a3a" }}>
                            {l.name} {isToday ? "- Today!" : ""}
                          </div>
                          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>
                            {dow}, {formatBirthday(l.birthday)} {new Date().getFullYear()}
                            {isHol ? ` - ${isHol.name}` : ""}
                            {isWeekend && !isHol ? " - Weekend" : ""}
                          </div>
                          {overlappingLeaves.length > 0 && (
                            <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#cc7700", marginTop: 3 }}>
                              Coverage gap: {overlappingLeaves.map(lv => lawyers.find(lw => lw.id === lv.lawyer_id)?.name?.split(" ")[0]).join(", ")} on leave
                            </div>
                          )}
                        </div>
                        <span className={`badge ${isToday ? "ba" : isWeekend || isHol ? "bho" : "bout"}`}>
                          {isToday ? "Today" : isHol ? "Holiday" : isWeekend ? "Weekend" : formatBirthday(l.birthday)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </>
        )}

        {/* -- INTERN DASHBOARD -- */}
        {view === "intern dashboard" && isParalegal && selectedIntern && (
          <>
            <div className="pt">Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening"}, {selectedIntern.name.split(" ")[0]}.</div>
            <div className="ps">AMSL Counsels Portal - Paralegal</div>
            {(() => {
              const today = getTodayStr();
              const todayRec = internAttendance.find(a => a.intern_id === selectedIntern.id && a.date === today);
              return (
                <>
                  <div className="sib">
                    <div style={{ flex: 1 }}>
                      <div className="tl">Today</div>
                      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                        <div><div className="tl" style={{ marginBottom: 2 }}>IN</div><div className="td">{formatTime(todayRec?.sign_in)}</div></div>
                        <div><div className="tl" style={{ marginBottom: 2 }}>OUT</div><div className="td">{formatTime(todayRec?.sign_out)}</div></div>
                        {todayRec?.sign_in && todayRec?.sign_out && <div><div className="tl" style={{ marginBottom: 2 }}>HRS</div><div className="td">{getDuration(todayRec.sign_in, todayRec.sign_out)}</div></div>}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {!todayRec?.sign_in && <button className="btn bg" onClick={() => handleInternSignIn(selectedIntern.id)}>Sign In</button>}
                      {todayRec?.sign_in && !todayRec?.sign_out && <button className="btn bo" onClick={() => handleInternSignOut(selectedIntern.id)}>Sign Out</button>}
                      {todayRec?.sign_out && <span style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a" }}>Day complete</span>}
                    </div>
                  </div>
                  <div className="g3">
                    <div className="sc"><div className="sv">{internAttendance.filter(a => a.intern_id === selectedIntern.id).length}</div><div className="sl">Days Present</div></div>
                    <div className="sc"><div className="sv">{formatDate(selectedIntern.start_date)}</div><div className="sl">Start Date</div></div>
                    <div className="sc"><div className="sv">{formatDate(selectedIntern.end_date)}</div><div className="sl">End Date</div></div>
                  </div>
                  {!selectedIntern.certificate_requested && getTodayStr() >= selectedIntern.end_date && (
                    <div className="card" style={{ marginTop: 16 }}>
                      <div className="ct">Certificate of Completion</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginBottom: 14, lineHeight: 1.7 }}>
                        Your internship period has ended. You may request a Certificate of Completion.
                      </div>
                      <button className="btn bg" onClick={() => handleCertificateRequest(selectedIntern.id)}>Request Certificate</button>
                    </div>
                  )}
                  {selectedIntern.certificate_requested && (
                    <div className="alert alert-info" style={{ marginTop: 16 }}>Certificate requested on {formatDate(selectedIntern.certificate_request_date)}. Aahna will be in touch.</div>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* -- INTERN ATTENDANCE -- */}
        {view === "intern attendance" && isParalegal && selectedIntern && (
          <>
            <div className="pt">Attendance</div>
            <div className="ps">{selectedIntern.name} - Paralegal</div>
            <div className="card">
              <table>
                <thead><tr><th>Date</th><th>Sign In</th><th>Sign Out</th><th>Duration</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {[...internAttendance.filter(a => a.intern_id === selectedIntern.id)].sort((a, b) => b.date.localeCompare(a.date)).map((a, i) => (
                    <tr key={i}><td>{formatDate(a.date)}</td><td>{formatTime(a.sign_in)}</td><td>{formatTime(a.sign_out)}</td><td>{getDuration(a.sign_in, a.sign_out) || "-"}</td><td><span className={`badge ${a.sign_out ? "ba" : "bp"}`}>{a.sign_out ? "Complete" : "In Progress"}</span></td><td><button className="btn brd bsm" onClick={() => handleDeleteAttendance(a.id, a.date)}>Delete</button></td></tr>
                  ))}
                  {internAttendance.filter(a => a.intern_id === selectedIntern.id).length === 0 && <tr><td colSpan={5} style={{ color: "#aaaacc", textAlign: "center", paddingTop: 20 }}>No records yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* -- INTERNS (Admin + Counsels view) -- */}
        {view === "interns" && !isParalegal && (
          <>
            <div className="pt">Paralegal / Interns</div>
            <div className="ps">Manage intern profiles and track attendance</div>
            <div className="card">
              <div className="ct">Add New Intern</div>
              <div className="g3">
                <div className="fld"><label className="lbl">Full Name</label><input type="text" className="inp" value={internForm.name} onChange={e => setInternForm(f => ({ ...f, name: e.target.value }))} placeholder="Intern Name" /></div>
                <div className="fld"><label className="lbl">Start Date</label><input type="date" className="inp" value={internForm.start_date} onChange={e => setInternForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                <div className="fld"><label className="lbl">End Date</label><input type="date" className="inp" value={internForm.end_date} onChange={e => setInternForm(f => ({ ...f, end_date: e.target.value }))} /></div>
              </div>
              <button className="btn bg" onClick={handleAddIntern}>Add Intern</button>
            </div>
            <div className="card">
              <div className="ct">Active Interns</div>
              {interns.filter(i => i.active).length === 0 && <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#aaaacc" }}>No active interns.</div>}
              {interns.filter(i => i.active).map(i => {
                const days = internAttendance.filter(a => a.intern_id === i.id).length;
                const todayRec = internAttendance.find(a => a.intern_id === i.id && a.date === getTodayStr());
                return (
                  <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #1e1e2a" }}>
                    <div className="sav">{getInitials(i.name)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{i.name}</div>
                      <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>
                        {formatDate(i.start_date)} - {formatDate(i.end_date)} . {days} days present . Added by {i.added_by}
                      </div>
                      {i.certificate_requested && <div style={{ fontFamily: "DM Mono, monospace", fontSize: 10, color: "#4080aa", marginTop: 2 }}>Certificate requested {formatDate(i.certificate_request_date)}</div>}
                    </div>
                    {todayRec?.sign_in && !todayRec?.sign_out ? <span className="badge bin">In Office</span>
                      : todayRec?.sign_out ? <span className="badge ba">Done</span>
                      : <span className="badge bout">Not In</span>}
                    {isFounder(user) && <button className="btn brd bsm" onClick={() => handleRemoveIntern(i.id)}>Remove</button>}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* -- APPROVALS (Associate Partner view) -- */}
        {view === "approvals" && isAssociatePartner(user) && (
          <>
            <div className="pt">Approvals</div>
            <div className="ps">Pending requests from junior counsels</div>
            <div className="card">
              <div className="ct">Pending Leave Requests ({pendingForRiya.length})</div>
              {pendingForRiya.length === 0 && <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#aaaacc" }}>No pending requests.</div>}
              {pendingForRiya.map(l => (
                <div key={l.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 0", borderBottom: "1px solid #1e1e2a" }}>
                  <div className="sav">{getInitials(l.lawyerName)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#2a2a3a" }}>{l.lawyerName}</div>
                    <div style={{ fontFamily: "DM Mono, monospace", fontSize: 11, color: "#7a7a9a", marginTop: 2 }}>
                      {l.type} . {formatDate(l.from_date)}{l.from_date !== l.to_date ? ` - ${formatDate(l.to_date)}` : ""} . {l.days} day{l.days > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontFamily: "Georgia, serif", fontSize: 12, color: "#6a6a8a", marginTop: 3, fontStyle: "italic" }}>{l.reason}</div>
                  </div>
                  <button className="btn bgr bsm" onClick={() => handleLeaveAction(l.id, "approved")}>Approve</button>
                  <button className="btn br bsm" onClick={() => handleLeaveAction(l.id, "rejected")}>Reject</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Forgot Sign Out Modal */}
      {showForgotSignout && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Forgot to Sign Out?</div>
            <div className="modal-sub">
              It looks like you did not sign out on {getDayOfWeek(missedSignoutDate)}, {formatDate(missedSignoutDate)}. Would you like to record a sign-out time for that day?
            </div>
            <div className="fld">
              <label className="lbl">Sign Out Time ({getDayOfWeek(missedSignoutDate)}, {formatDate(missedSignoutDate)})</label>
              <input type="time" className="inp" id="missed-signout-time" defaultValue="20:00" />
            </div>
            <div className="modal-btns">
              <button className="btn bg" style={{ flex: 1 }} onClick={async () => {
                const timeInput = document.getElementById("missed-signout-time").value;
                const [hh, mm] = timeInput.split(":");
                const signOutDate = new Date(missedSignoutDate + "T00:00:00");
                signOutDate.setHours(parseInt(hh), parseInt(mm), 0, 0);
                const rec = attendance.find(a => a.lawyer_id === user?.id && a.date === missedSignoutDate);
                if (rec) {
                  const result = await db.update("Attendance", rec.id, { sign_out: signOutDate.toISOString() });
                  if (Array.isArray(result) && result[0]) {
                    setAttendance(p => p.map(a => a.id === rec.id ? result[0] : a));
                    notify("Sign out recorded for " + formatDate(missedSignoutDate));
                  }
                }
                setShowForgotSignout(false);
              }}>Record Sign Out</button>
              <button className="btn bo" onClick={() => setShowForgotSignout(false)}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

      {/* Saturday Prompt Modal */}
      {showSaturdayPrompt && (nextSatDate || lastSatDate) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">{satPromptMode === "past" ? "Last Saturday" : "This Saturday"}</div>
            <div className="modal-sub">
              {satPromptMode === "past"
                ? <>{getDayOfWeek(lastSatDate)}, {formatDate(lastSatDate)}<br/>Did you come in to work last Saturday?</>
                : <>{getDayOfWeek(nextSatDate)}, {formatDate(nextSatDate)}<br/>Will you be coming in to work this Saturday?</>
              }
            </div>
            <div className="modal-btns">
              <button className="btn bg" style={{ flex: 1 }} onClick={() => handleSaturdayResponse("working")}>{satPromptMode === "past" ? "Yes, I worked" : "Yes, I'll be in"}</button>
              <button className="btn bo" style={{ flex: 1 }} onClick={() => handleSaturdayResponse("off")}>{satPromptMode === "past" ? "No, I was off" : "Taking the day off"}</button>
            </div>
            <button onClick={() => setShowSaturdayPrompt(false)} style={{ background: "none", border: "none", color: "#7a7a9a", fontFamily: "DM Mono, monospace", fontSize: 10, cursor: "pointer", marginTop: 14, display: "block", letterSpacing: "0.08em" }}>
              Remind me later
            </button>
          </div>
        </div>
      )}

      {/* Correction Request Modal */}
      {showCorrectionModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Request a Correction</div>
            <div className="modal-sub">{isFounder(user) ? "Your corrections are applied immediately." : "Corrections require Aahna's approval before taking effect."}</div>
            <div className="fld">
              <label className="lbl">Type</label>
              <select className="inp" value={correctionForm.type} onChange={e => setCorrectionForm(f => ({ ...f, type: e.target.value }))}>
                <option value="attendance">Attendance (Sign In / Sign Out)</option>
                <option value="leave">Leave Record</option>
                <option value="saturday">Saturday Status</option>
              </select>
            </div>
            <div className="fld">
              <label className="lbl">Date</label>
              <input type="date" className="inp" value={correctionForm.date} onChange={e => setCorrectionForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            {correctionForm.type === "attendance" && (
              <>
                <div className="fld">
                  <label className="lbl">What needs to be corrected?</label>
                  <select className="inp" value={correctionForm.correctionField} onChange={e => setCorrectionForm(f => ({ ...f, correctionField: e.target.value }))}>
                    <option value="sign_in">Sign In Time</option>
                    <option value="sign_out">Sign Out Time</option>
                    <option value="both">Both Sign In and Sign Out</option>
                  </select>
                </div>
                {(correctionForm.correctionField === "sign_in" || correctionForm.correctionField === "both") && (
                  <div className="fld">
                    <label className="lbl">Correct Sign In Time</label>
                    <input type="time" className="inp" value={correctionForm.signInTime || ""} onChange={e => setCorrectionForm(f => ({ ...f, signInTime: e.target.value }))} />
                  </div>
                )}
                {(correctionForm.correctionField === "sign_out" || correctionForm.correctionField === "both") && (
                  <div className="fld">
                    <label className="lbl">Correct Sign Out Time</label>
                    <input type="time" className="inp" value={correctionForm.signOutTime || ""} onChange={e => setCorrectionForm(f => ({ ...f, signOutTime: e.target.value }))} />
                  </div>
                )}
              </>
            )}
            {correctionForm.type === "saturday" && (
              <div className="fld">
                <label className="lbl">Correct Status</label>
                <select className="inp" value={correctionForm.correctionField} onChange={e => setCorrectionForm(f => ({ ...f, correctionField: e.target.value }))}>
                  <option value="working">Working</option>
                  <option value="off">Day Off</option>
                </select>
              </div>
            )}
            <div className="fld">
              <label className="lbl">Reason</label>
              <textarea className="inp" rows={3} value={correctionForm.note} onChange={e => setCorrectionForm(f => ({ ...f, note: e.target.value }))} placeholder="Brief explanation..." style={{ resize: "vertical" }} />
            </div>
            <div className="modal-btns">
              <button className="btn bg" style={{ flex: 1 }} onClick={handleCorrectionSubmit}>
                {isFounder(user) ? "Apply Correction" : "Submit Request"}
              </button>
              <button className="btn bo" onClick={() => { setShowCorrectionModal(false); setCorrectionForm({ type: "attendance", date: "", note: "", correctionField: "sign_out", correctedTime: "" }); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}