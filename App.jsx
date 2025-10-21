import InstallPWAButton from "./InstallPWAButton";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">RaMP it Up! Data Tracker</h1>
            <p className="text-sm text-slate-500">
              Log behavior/skill data fast. Export, print, and share.
            </p>
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* 👉 Install button shows only when installable */}
          <InstallPWAButton />

          {/* existing header actions */}
          <nav className="ml-3 flex items-center gap-2">
            {/* your Log / Dashboard / Setup buttons here */}
          </nav>
        </div>
      </header>

      {/* ...rest of your app */}
    </div>
  );
}



import React, { useEffect, useMemo, useState } from "react";
import { Download, Plus, Trash2, Edit3, BarChart3, Database, Settings2, Filter, Printer } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// === Minimal UI Primitives (Tailwind classes via CDN in index.html) ===
const Button = ({ className = "", ...props }) => (
  <button className={`px-3 py-2 rounded-2xl shadow-sm border text-sm hover:shadow transition ${className}`} {...props} />
);
const Input = ({ className = "", ...props }) => (
  <input className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`} {...props} />
);
const Select = ({ className = "", children, ...props }) => (
  <select className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`} {...props}>{children}</select>
);
const Textarea = ({ className = "", ...props }) => (
  <textarea className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`} {...props} />
);
const Card = ({ className = "", ...props }) => <div className={`bg-white rounded-2xl shadow p-4 border ${className}`} {...props} />;
const Badge = ({ children }) => (
  <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">{children}</span>
);

// === Local Storage ===
const STORAGE_KEY = "ramp-it-up-tracker-v5";
const defaultData = {
  students: [
    { id: "s1", name: "Jasmine" },
    { id: "s2", name: "Sarah" },
    { id: "s3", name: "Abby" },
    { id: "s4", name: "Donovan" },
  ],
  // short = what you see in dropdown/table; label = full goal text kept for records/CSV
  skills: [
    {
      id: "k1",
      short: "Start & Sustain Work",
      label:
        "When given a task or assignment, STUDENT will begin the task/assignment within 1 minute and continue for a minimum of 10 minutes with no more than 2 prompts on 8 out of 10 opportunities, as measured by staff data and observation.",
    },
    {
      id: "k2",
      short: "No Physical Aggression",
      label:
        "During each segment of the school day, STUDENT will refrain from physical aggression (i.e. kicking, hitting, pushing, tripping) with all adults and children on 8 out of 10 opportunities, as measured by staff data and observation.",
    },
    {
      id: "k3",
      short: "Cooperative Play",
      label:
        "During unstructured time, STUDENT will cooperatively play (participate, share, follow directions, take turns) on 8 out of 10 opportunities, as measured by staff data and observation.",
    },
    {
      id: "k4",
      short: "Follow Directions",
      label:
        "When given a direction, STUDENT will respond appropriately (\"yes, okay\") and initiate the direction without arguing on 8 out of 10 opportunities, as measured by staff data and observation.",
    },
  ],
  reinforcers: [
    { id: "r1", label: "PBIS point" },
    { id: "r2", label: "Break" },
    { id: "r3", label: "Praise" },
    { id: "r4", label: "Sticker" },
    { id: "r5", label: "Snack" },
    { id: "r6", label: "Computer time" },
    { id: "r7", label: "Sensory break" },
    { id: "r8", label: "Call home (positive)" },
    { id: "r9", label: "Tangible" },
    { id: "r_other", label: "Other" },
  ],
  entries: [],
  org: { teamName: "", userName: "", sheetsWebhook: "" },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch {
    return defaultData;
  }
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// === CSV Export ===
function toCSV(rows) {
  const headers = [
    "id","timestamp","date","time",
    "student","student_id",
    "skill_short","skill_full","skill_id",
    "rating","prompt_details",
    "duration_min",
    "prompt_level",
    "reinforcer","reinforcer_other",
    "setting","function",
    "tokens","delivered",
    "antecedent","behavior_event","consequence",
    "goal_baseline","goal_target","goal_mastery",
    "notes",
  ];
  const escape = (v) => `"${String(v ?? "").replaceAll('"','""').replaceAll("\n"," ").replaceAll("\r"," ")}"`;
  const lines = [headers.join(",")];
  for (const r of rows) {
    const d = new Date(r.timestamp);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    lines.push([
      r.id,
      r.timestamp,
      date,
      time,
      r.studentName,
      r.studentId,
      r.skillShort,
      r.skillLabel,
      r.skillId,
      r.rating,
      r.promptDetails ?? "",
      r.durationMin ?? "",
      r.promptLevel ?? "",
      r.reinforcer ?? "",
      r.reinforcerOther ?? "",
      r.setting ?? "",
      r.func ?? "",
      r.tokens ?? "",
      r.delivered ? "yes" : "no",
      r.abcA ?? "",
      r.abcB ?? "",
      r.abcC ?? "",
      r.goalBaseline ?? "",
      r.goalTarget ?? "",
      r.goalMastery ?? "",
      r.notes ?? "",
    ].map(escape).join(","));
  }
  return lines.join("\n");
}

// === Main App ===
export default function App() {
  const [state, setState] = useState(loadState());
  const [tab, setTab] = useState("log");
  const [filter, setFilter] = useState({ studentId: "", skillId: "", from: "", to: "" });
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => saveState(state), [state]);

  // Derived filtered entries
  const filteredEntries = useMemo(() => {
    return state.entries
      .filter((e) => (filter.studentId ? e.studentId === filter.studentId : true))
      .filter((e) => (filter.skillId ? e.skillId === filter.skillId : true))
      .filter((e) => {
        if (!filter.from && !filter.to) return true;
        const t = new Date(e.timestamp).getTime();
        const from = filter.from ? new Date(filter.from + "T00:00").getTime() : -Infinity;
        const to = filter.to ? new Date(filter.to + "T23:59").getTime() : Infinity;
        return t >= from && t <= to;
      })
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e) => {
        const skillObj = state.skills.find((k) => k.id === e.skillId);
        return {
          ...e,
          studentName: state.students.find((s) => s.id === e.studentId)?.name ?? "",
          skillLabel: skillObj?.label ?? "",
          skillShort: skillObj?.short ?? skillObj?.label ?? "",
        };
      });
  }, [state.entries, state.students, state.skills, filter]);

  // Chart data: average rating per skill (0–2)
  const chartData = useMemo(() => {
    const grouped = {};
    for (const e of filteredEntries) {
      if (!grouped[e.skillId]) grouped[e.skillId] = { skill: e.skillShort || e.skillLabel, total: 0, count: 0 };
      grouped[e.skillId].total += Number(e.rating || 0);
      grouped[e.skillId].count += 1;
    }
    return Object.values(grouped).map((g) => ({ skill: g.skill, avg: g.count ? g.total / g.count : 0 }));
  }, [filteredEntries]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-slate-800">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">R</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">RaMP it Up! Data Tracker</h1>
            <p className="text-xs text-slate-500 -mt-0.5">0–2 rating, prompt details when needed, export & print.</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button onClick={() => setTab("log")} className={tab === "log" ? "bg-indigo-600 text-white" : "bg-white"}>
              <Database className="inline-block w-4 h-4 mr-1" /> Log
            </Button>
            <Button onClick={() => setTab("dash")} className={tab === "dash" ? "bg-indigo-600 text-white" : "bg-white"}>
              <BarChart3 className="inline-block w-4 h-4 mr-1" /> Dashboard
            </Button>
            <Button onClick={() => setTab("setup")} className={tab === "setup" ? "bg-indigo-600 text-white" : "bg-white"}>
              <Settings2 className="inline-block w-4 h-4 mr-1" /> Setup
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {tab === "log" && (
          <LogTab
            state={state}
            setState={setState}
            filter={filter}
            setFilter={setFilter}
            entries={filteredEntries}
            editingEntry={editingEntry}
            setEditingEntry={setEditingEntry}
          />
        )}
        {tab === "dash" && <DashboardTab entries={filteredEntries} state={state} chartData={chartData} filter={filter} setFilter={setFilter} />}
        {tab === "setup" && <SetupTab state={state} setState={setState} />}
      </main>

      <footer className="max-w-6xl mx-auto p-4 text-xs text-slate-500">
        Built for fast classroom data: 0–2 rating, duration, prompts, ABC, function, tokens, and notes. Stores locally.
      </footer>
    </div>
  );
}

// === Tabs ===
function LogTab({ state, setState, filter, setFilter, entries, editingEntry, setEditingEntry }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <h2 className="font-semibold mb-3">Log Entry</h2>
        <EntryForm
          state={state}
          onSave={(entry) => {
            setState((prev) => {
              const exists = prev.entries.some((e) => e.id === entry.id);
              const entries = exists ? prev.entries.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...prev.entries];
              return { ...prev, entries };
            });
            setEditingEntry(null);
          }}
          initial={editingEntry}
        />
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Recent Entries</h2>
          <div className="flex gap-2 items-end">
            <FilterControls state={state} filter={filter} setFilter={setFilter} />
            <ExportButton rows={entries} />
            <PrintButton />
          </div>
        </div>
        <EntriesTable
          rows={entries}
          onEdit={setEditingEntry}
          onDelete={(id) => setState((prev) => ({ ...prev, entries: prev.entries.filter((e) => e.id !== id) }))}
        />
      </Card>
    </div>
  );
}

function DashboardTab({ entries, state, chartData, filter, setFilter }) {
  const totalTokens = entries.reduce((sum, e) => sum + Number(e.tokens || 0), 0);
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Filters</h2>
          <FilterControls state={state} filter={filter} setFilter={setFilter} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <Stat title="Entries" value={entries.length} />
          <Stat title="Avg Rating (0–2)" value={avg(entries.map((e) => Number(e.rating || 0))).toFixed(2)} />
          <Stat title="Students" value={state.students.length} />
          <Stat title="Tokens Earned" value={totalTokens} />
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Average Rating by Skill</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skill" interval={0} angle={-10} textAnchor="end" height={60} />
              <YAxis domain={[0, 2]} />
              <Tooltip />
              <Bar dataKey="avg" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Entries</h2>
        <EntriesTable rows={entries} />
      </Card>
    </div>
  );
}

function SetupTab({ state, setState }) {
  const [studentName, setStudentName] = useState("");
  const [skillShort, setSkillShort] = useState("");
  const [skillFull, setSkillFull] = useState("");
  const [reinforcerLabel, setReinforcerLabel] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <h2 className="font-semibold mb-3">Students</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add student name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              if (!studentName.trim()) return;
              setState((prev) => ({
                ...prev,
                students: [...prev.students, { id: `s${crypto.randomUUID()}`, name: studentName.trim() }],
              }));
              setStudentName("");
            }}
          >
            <Plus className="inline-block w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <ul className="space-y-2">
          {state.students.map((s) => (
            <li key={s.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <span>{s.name}</span>
              <Button className="bg-white" onClick={() => setState((prev) => ({ ...prev, students: prev.students.filter((x) => x.id !== s.id) }))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="lg:col-span-1">
        <h2 className="font-semibold mb-3">Skills / Goals</h2>
        <div className="grid grid-cols-1 gap-2 mb-3">
          <Input placeholder="Short name (e.g., Follow Directions)" value={skillShort} onChange={(e) => setSkillShort(e.target.value)} />
          <Textarea rows={3} placeholder="Full goal text (optional but recommended for records/CSV)" value={skillFull} onChange={(e) => setSkillFull(e.target.value)} />
          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 text-white"
              onClick={() => {
                if (!skillShort.trim()) return;
                setState((prev) => ({
                  ...prev,
                  skills: [...prev.skills, { id: `k${crypto.randomUUID()}`, short: skillShort.trim(), label: skillFull.trim() || skillShort.trim() }],
                }));
                setSkillShort("");
                setSkillFull("");
              }}
            >
              <Plus className="inline-block w-4 h-4 mr-1" /> Add
            </Button>
          </div>
        </div>
        <ul className="space-y-2">
          {state.skills.map((k) => (
            <li key={k.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium">{k.short || k.label}</div>
                {k.label && k.label !== k.short && <div className="text-xs text-slate-500 truncate" title={k.label}>{k.label}</div>}
              </div>
              <Button className="bg-white" onClick={() => setState((prev) => ({ ...prev, skills: prev.skills.filter((x) => x.id !== k.id) }))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="lg:col-span-1">
        <h2 className="font-semibold mb-3">Reinforcers (Dropdown)</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add reinforcer label" value={reinforcerLabel} onChange={(e) => setReinforcerLabel(e.target.value)} />
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              if (!reinforcerLabel.trim()) return;
              setState((prev) => ({
                ...prev,
                reinforcers: [...prev.reinforcers, { id: `r${crypto.randomUUID()}`, label: reinforcerLabel.trim() }],
              }));
              setReinforcerLabel("");
            }}
          >
            <Plus className="inline-block w-4 h-4 mr-1" /> Add
          </Button>
        </div>
        <ul className="space-y-2">
          {state.reinforcers.map((r) => (
            <li key={r.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <span>{r.label}</span>
              <Button className="bg-white" onClick={() => setState((prev) => ({ ...prev, reinforcers: prev.reinforcers.filter((x) => x.id !== r.id) }))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="lg:col-span-3">
        <h2 className="font-semibold mb-3">Organization (optional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-500">Team/Program Name</label>
            <Input value={state.org.teamName} onChange={(e) => setState((p) => ({ ...p, org: { ...p.org, teamName: e.target.value } }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Your Name</label>
            <Input value={state.org.userName} onChange={(e) => setState((p) => ({ ...p, org: { ...p.org, userName: e.target.value } }))} />
          </div>
          <div>
            <label className="text-xs text-slate-500">Google Sheets/Webhook URL (future sync)</label>
            <Input placeholder="Optional – paste endpoint to receive CSV rows" value={state.org.sheetsWebhook} onChange={(e) => setState((p) => ({ ...p, org: { ...p.org, sheetsWebhook: e.target.value } }))} />
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">Note: This starter stores data locally. Sheets sync and multi-user require a backend endpoint – this field prepares for that.</p>
      </Card>
    </div>
  );
}

// === Components ===
function EntryForm({ state, onSave, initial }) {
  const [studentId, setStudentId] = useState(initial?.studentId || (state.students[0]?.id ?? ""));
  const [skillId, setSkillId] = useState(initial?.skillId || (state.skills[0]?.id ?? ""));
  const [date, setDate] = useState(initial ? toDateInput(initial.timestamp) : toDateInput(Date.now()));
  const [time, setTime] = useState(initial ? toTimeInput(initial.timestamp) : toTimeInput(Date.now()));

  // 0–2 rating per request
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [promptDetails, setPromptDetails] = useState(initial?.promptDetails ?? ""); // required when rating === 1

  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? "");
  const [promptLevel, setPromptLevel] = useState(initial?.promptLevel ?? "Independent");
  const [reinforcer, setReinforcer] = useState(initial?.reinforcer ?? state.reinforcers[0]?.id ?? "");
  const [reinforcerOther, setReinforcerOther] = useState(initial?.reinforcerOther ?? "");
  const [setting, setSetting] = useState(initial?.setting ?? "Classroom");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  // ABC & Function
  const [abcA, setAbcA] = useState(initial?.abcA ?? "");
  const [abcB, setAbcB] = useState(initial?.abcB ?? "");
  const [abcC, setAbcC] = useState(initial?.abcC ?? "");
  const [func, setFunc] = useState(initial?.func ?? "Attention");

  // Reinforcement / tokens
  const [tokens, setTokens] = useState(initial?.tokens ?? 0);
  const [delivered, setDelivered] = useState(Boolean(initial?.delivered));

  // Optional IEP goal fields (not required)
  const [includeGoal, setIncludeGoal] = useState(Boolean(initial?.goalBaseline || initial?.goalTarget || initial?.goalMastery));
  const [goalBaseline, setGoalBaseline] = useState(initial?.goalBaseline ?? "");
  const [goalTarget, setGoalTarget] = useState(initial?.goalTarget ?? "");
  const [goalMastery, setGoalMastery] = useState(initial?.goalMastery ?? "");

  useEffect(() => {
    if (!initial) return;
    setStudentId(initial.studentId);
    setSkillId(initial.skillId);
    setDate(toDateInput(initial.timestamp));
    setTime(toTimeInput(initial.timestamp));
    setRating(initial.rating);
    setPromptDetails(initial.promptDetails ?? "");
    setDurationMin(initial.durationMin ?? "");
    setPromptLevel(initial.promptLevel ?? "");
    setReinforcer(initial.reinforcer ?? state.reinforcers[0]?.id ?? "");
    setReinforcerOther(initial.reinforcerOther ?? "");
    setSetting(initial.setting ?? "");
    setNotes(initial.notes ?? "");
    setAbcA(initial.abcA ?? "");
    setAbcB(initial.abcB ?? "");
    setAbcC(initial.abcC ?? "");
    setFunc(initial.func ?? "Attention");
    setTokens(initial.tokens ?? 0);
    setDelivered(Boolean(initial.delivered));
    setIncludeGoal(Boolean(initial.goalBaseline || initial.goalTarget || initial.goalMastery));
    setGoalBaseline(initial.goalBaseline ?? "");
    setGoalTarget(initial.goalTarget ?? "");
    setGoalMastery(initial.goalMastery ?? "");
  }, [initial, state.reinforcers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(rating) === 1 && !promptDetails.trim()) {
      alert("Please describe the specific prompt(s) used for rating 1 (Requires Prompts).");
      return;
    }
    const timestamp = new Date(`${date}T${time}`)?.getTime?.() ?? Date.now();
    const entry = {
      id: initial?.id ?? crypto.randomUUID(),
      timestamp,
      studentId,
      skillId,
      rating: Number(rating),                // 0–2
      promptDetails: rating === 1 || Number(rating) === 1 ? promptDetails.trim() : "",
      durationMin: durationMin === "" ? null : Number(durationMin),
      promptLevel,
      reinforcer,
      reinforcerOther: reinforcer === "r_other" ? reinforcerOther : "",
      setting,
      notes,
      abcA,
      abcB,
      abcC,
      func,
      tokens: Number(tokens || 0),
      delivered,
      goalBaseline: includeGoal ? goalBaseline : "",
      goalTarget: includeGoal ? goalTarget : "",
      goalMastery: includeGoal ? goalMastery : "",
    };
    onSave(entry);
    // reset if creating new
    if (!initial) {
      setRating(0);
      setPromptDetails("");
      setDurationMin("");
      setReinforcer(state.reinforcers[0]?.id ?? "");
      setReinforcerOther("");
      setNotes("");
      setAbcA("");
      setAbcB("");
      setAbcC("");
      setFunc("Attention");
      setTokens(0);
      setDelivered(false);
      setIncludeGoal(false);
      setGoalBaseline("");
      setGoalTarget("");
      setGoalMastery("");
    }
  };

  const settingOptions = ["Classroom","Hallway","Lunchroom","Bathroom","Recess","PE","Playground","Home"];
  const functionOptions = ["Attention","Escape","Tangible","Sensory/Automatic"];

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500">Student</label>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {state.students.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Skill / Goal</label>
          <Select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            {state.skills.map((k) => (
              <option key={k.id} value={k.id} title={k.label}>{k.short || k.label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500">Date</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Time</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 items-end">
        <div>
          <label className="text-xs text-slate-500">Rating (0–2)</label>
          <Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            <option value={0}>0 – Not Demonstrating</option>
            <option value={1}>1 – Requires Prompts</option>
            <option value={2}>2 – Independent</option>
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Duration (min)</label>
          <Input type="number" min="0" step="1" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-slate-500">Prompt Level</label>
          <Select value={promptLevel} onChange={(e) => setPromptLevel(e.target.value)}>
            <option>Independent</option>
            <option>Gestural</option>
            <option>Verbal</option>
            <option>Model</option>
            <option>Partial Physical</option>
            <option>Full Physical</option>
          </Select>
        </div>
      </div>

      {Number(rating) === 1 && (
        <div>
          <label className="text-xs text-slate-500">Prompt details (required when rating = 1)</label>
          <Textarea
            rows={2}
            placeholder="e.g., Verbal prompt to start; Model prompt during steps 2–3"
            value={promptDetails}
            onChange={(e) => setPromptDetails(e.target.value)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500">Reinforcer</label>
          <Select value={reinforcer} onChange={(e) => setReinforcer(e.target.value)}>
            {state.reinforcers.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </Select>
          {reinforcer === "r_other" && (
            <Input className="mt-2" placeholder="Specify other reinforcer" value={reinforcerOther} onChange={(e) => setReinforcerOther(e.target.value)} />
          )}
        </div>
        <div>
          <label className="text-xs text-slate-500">Setting</label>
          <Select value={setting} onChange={(e) => setSetting(e.target.value)}>
            {settingOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-500">Antecedent</label>
            <Textarea rows={2} value={abcA} onChange={(e) => setAbcA(e.target.value)} placeholder="What happened right before?" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Behavior (event)</label>
            <Textarea rows={2} value={abcB} onChange={(e) => setAbcB(e.target.value)} placeholder="What was the observable behavior?" />
          </div>
          <div>
            <label className="text-xs text-slate-500">Consequence</label>
            <Textarea rows={2} value={abcC} onChange={(e) => setAbcC(e.target.value)} placeholder="What happened after?" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-500">Function (hypothesized)</label>
            <Select value={func} onChange={(e) => setFunc(e.target.value)}>
              {["Attention","Escape","Tangible","Sensory/Automatic"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Tokens (+/–)</label>
            <Input type="number" step="1" value={tokens} onChange={(e) => setTokens(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <input id="delivered" type="checkbox" checked={delivered} onChange={(e) => setDelivered(e.target.checked)} />
            <label htmlFor="delivered" className="text-xs text-slate-600">Reinforcement delivered</label>
          </div>
        </div>
      </div>

      <div className="border rounded-xl p-3 bg-slate-50">
        <div className="flex items-center gap-2 mb-2">
          <input id="includeGoal" type="checkbox" checked={includeGoal} onChange={(e) => setIncludeGoal(e.target.checked)} />
          <label htmlFor="includeGoal" className="text-sm font-medium">Include IEP Goal details (optional)</label>
        </div>
        {includeGoal && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-500">Baseline</label>
              <Input value={goalBaseline} onChange={(e) => setGoalBaseline(e.target.value)} placeholder="e.g., 40% over 3 days" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Target</label>
              <Input value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} placeholder="e.g., 80% across 2 settings" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Mastery Criteria</label>
              <Input value={goalMastery} onChange={(e) => setGoalMastery(e.target.value)} placeholder="e.g., 80% for 2 consecutive weeks" />
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="text-xs text-slate-500">Notes</label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Brief notes or context" />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-indigo-600 text-white">
          <Plus className="inline-block w-4 h-4 mr-1" /> {initial ? "Update Entry" : "Save Entry"}
        </Button>
        <Badge>Saved to this browser</Badge>
      </div>
    </form>
  );
}

function EntriesTable({ rows, onEdit, onDelete }) {
  if (!rows.length) return <p className="text-sm text-slate-500">No entries yet.</p>;
  return (
    <div className="overflow-auto rounded-xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <Th>Date/Time</Th>
            <Th>Student</Th>
            <Th>Skill</Th>
            <Th>Rating</Th>
            <Th>Prompt Details</Th>
            <Th>Duration</Th>
            <Th>Prompt</Th>
            <Th>Reinforcer</Th>
            <Th>Setting</Th>
            <Th>Function</Th>
            <Th>Tokens</Th>
            <Th>Notes</Th>
            {(onEdit || onDelete) && <Th>Actions</Th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <Td>{new Date(r.timestamp).toLocaleString()}</Td>
              <Td>{r.studentName}</Td>
              <Td title={r.skillLabel}>{r.skillShort || r.skillLabel}</Td>
              <Td>{r.rating}</Td>
              <Td className="max-w-[30ch] truncate" title={r.promptDetails}>{r.promptDetails}</Td>
              <Td>{r.durationMin ?? ""}</Td>
              <Td>{r.promptLevel ?? ""}</Td>
              <Td>{labelForReinforcer(r.reinforcer)}</Td>
              <Td>{r.setting ?? ""}</Td>
              <Td>{r.func ?? ""}</Td>
              <Td>{r.tokens ?? 0}</Td>
              <Td className="max-w-[28ch] truncate" title={r.notes}>{r.notes}</Td>
              {(onEdit || onDelete) && (
                <Td>
                  <div className="flex gap-2">
                    {onEdit && (
                      <Button className="bg-white" onClick={() => onEdit(r)} title="Edit">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button className="bg-white" onClick={() => onDelete(r.id)} title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Th = ({ children }) => (
  <th className="text-left p-2 font-medium text-slate-700 whitespace-nowrap">{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`p-2 align-top text-slate-700 whitespace-nowrap ${className}`}>{children}</td>
);

function FilterControls({ state, filter, setFilter }) {
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div>
        <label className="text-xs text-slate-500">Student</label>
        <Select value={filter.studentId} onChange={(e) => setFilter((f) => ({ ...f, studentId: e.target.value }))}>
          <option value="">All</option>
          {state.students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-xs text-slate-500">Skill</label>
        <Select value={filter.skillId} onChange={(e) => setFilter((f) => ({ ...f, skillId: e.target.value }))}>
          <option value="">All</option>
          {state.skills.map((k) => (
            <option key={k.id} value={k.id}>{k.short || k.label}</option>
          ))}
        </Select>
      </div>
      <div>
        <label className="text-xs text-slate-500">From</label>
        <Input type="date" value={filter.from} onChange={(e) => setFilter((f) => ({ ...f, from: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs text-slate-500">To</label>
        <Input type="date" value={filter.to} onChange={(e) => setFilter((f) => ({ ...f, to: e.target.value }))} />
      </div>
      <Button className="bg-white" onClick={() => setFilter({ studentId: "", skillId: "", from: "", to: "" })}>
        <Filter className="inline-block w-4 h-4 mr-1" /> Clear
      </Button>
    </div>
  );
}

function ExportButton({ rows }) {
  const handleExport = () => {
    const csv = toCSV(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `ramp-it-up-data-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Button className="bg-white" onClick={handleExport} title="Export CSV">
      <Download className="inline-block w-4 h-4 mr-1" /> Export CSV
    </Button>
  );
}

function PrintButton() {
  return (
    <Button className="bg-white" onClick={() => window.print()} title="Print / Save PDF">
      <Printer className="inline-block w-4 h-4 mr-1" /> Print
    </Button>
  );
}

function Stat({ title, value }) {
  return (
    <div className="p-4 rounded-2xl border bg-slate-50">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function avg(arr) { if (!arr.length) return 0; return arr.reduce((a, b) => a + b, 0) / arr.length; }
function toDateInput(ts) { const d = new Date(ts); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-"); }
function toTimeInput(ts) { const d = new Date(ts); return [String(d.getHours()).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0")].join(":"); }
function labelForReinforcer(id) {
  if (!id) return "";
  const defaults = {
    r1: "PBIS point", r2: "Break", r3: "Praise", r4: "Sticker", r5: "Snack",
    r6: "Computer time", r7: "Sensory break", r8: "Call home (positive)", r9: "Tangible", r_other: "Other",
  };
  return defaults[id] || id;
}
