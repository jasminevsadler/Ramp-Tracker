// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";

/* ---------------- UI atoms ---------------- */
const Button = ({ className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-xl border shadow-sm text-sm hover:shadow transition ${className}`}
    {...props}
  />
);
const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    {...props}
  />
);
const Select = ({ className = "", children, ...props }) => (
  <select
    className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    {...props}
  >
    {children}
  </select>
);
const Textarea = ({ className = "", ...props }) => (
  <textarea
    className={`w-full px-3 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
    {...props}
  />
);
const Card = ({ className = "", ...props }) => (
  <div className={`bg-white border rounded-2xl p-4 shadow ${className}`} {...props} />
);

/* --------------- data & storage --------------- */
const STORAGE_KEY = "ramp-it-up-tracker-v6";

const defaultData = {
  students: [
    { id: "s1", name: "Jasmine" },
    { id: "s2", name: "Sarah" },
    { id: "s3", name: "Abby" },
  ],
  // short = UI label; label = full goal text (kept for CSV)
  skills: [
    {
      id: "k1",
      short: "Follow Directions",
      label:
        'When given a direction, STUDENT will respond "okay" and initiate the task within 1 minute on 8 of 10 opportunities.',
    },
    {
      id: "k2",
      short: "Start & Sustain Work",
      label:
        "When given a task, STUDENT will begin within 1 minute and sustain engagement for 10 minutes with ≤2 prompts on 8 of 10 trials.",
    },
    {
      id: "k3",
      short: "Cooperative Play",
      label:
        "During unstructured time, STUDENT will participate, share, take turns on 8 of 10 opportunities.",
    },
  ],
  reinforcers: [
    { id: "r1", label: "PBIS point" },
    { id: "r2", label: "Break" },
    { id: "r3", label: "Praise" },
    { id: "r_other", label: "Other" },
  ],
  entries: [],
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultData;
  } catch {
    return defaultData;
  }
};
const saveState = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

/* --------------- helpers --------------- */
const toDate = (ts) => {
  const d = new Date(ts);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const toTime = (ts) => {
  const d = new Date(ts);
  return [String(d.getHours()).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0")].join(":");
};
const csvEscape = (v) =>
  `"${String(v ?? "").replaceAll('"', '""').replaceAll("\n", " ").replaceAll("\r", " ")}"`;

function rowsToCSV(rows) {
  const headers = [
    "id",
    "timestamp",
    "date",
    "time",
    "student",
    "student_id",
    "skill_short",
    "skill_full",
    "skill_id",
    "rating",
    "prompt_details",
    "duration_min",
    "prompt_level",
    "reinforcer",
    "reinforcer_other",
    "setting",
    "notes",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const d = new Date(r.timestamp);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    lines.push(
      [
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
        r.notes ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }
  return lines.join("\n");
}

/* --------------- App --------------- */
export default function App() {
  const [state, setState] = useState(loadState());
  const [tab, setTab] = useState("log");
  const [filter, setFilter] = useState({ studentId: "", skillId: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => saveState(state), [state]);

  const filtered = useMemo(() => {
    return state.entries
      .filter((e) => (filter.studentId ? e.studentId === filter.studentId : true))
      .filter((e) => (filter.skillId ? e.skillId === filter.skillId : true))
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((e) => {
        const sObj = state.skills.find((k) => k.id === e.skillId);
        return {
          ...e,
          studentName: state.students.find((s) => s.id === e.studentId)?.name ?? "",
          skillLabel: sObj?.label ?? "",
          skillShort: sObj?.short ?? sObj?.label ?? "",
        };
      });
  }, [state.entries, state.students, state.skills, filter]);

  const exportCSV = () => {
    const csv = rowsToCSV(filtered);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ramp-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-slate-800">
      {/* header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">R</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">RaMP it Up! Data Tracker</h1>
            <p className="text-xs text-slate-500 -mt-0.5">0–2 rating; prompts required at 1; export & print.</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button className={tab === "log" ? "bg-indigo-600 text-white" : "bg-white"} onClick={() => setTab("log")}>
              Log
            </Button>
            <Button
              className={tab === "setup" ? "bg-indigo-600 text-white" : "bg-white"}
              onClick={() => setTab("setup")}
            >
              Setup
            </Button>
          </div>
        </div>
      </header>

      {/* main */}
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {tab === "log" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <h2 className="font-semibold mb-3">{editing ? "Edit Entry" : "Log Entry"}</h2>
              <EntryForm
                state={state}
                initial={editing}
                onSave={(entry) => {
                  setState((p) => {
                    const exists = p.entries.some((e) => e.id === entry.id);
                    const entries = exists
                      ? p.entries.map((e) => (e.id === entry.id ? entry : e))
                      : [entry, ...p.entries];
                    return { ...p, entries };
                  });
                  setEditing(null);
                }}
                onCancel={() => setEditing(null)}
              />
            </Card>

            <Card className="lg:col-span-2">
              <div className="flex items-end justify-between gap-2 mb-3">
                <h2 className="font-semibold">Recent Entries</h2>
                <div className="flex gap-2">
                  <div>
                    <label className="text-xs text-slate-500">Student</label>
                    <Select
                      value={filter.studentId}
                      onChange={(e) => setFilter((f) => ({ ...f, studentId: e.target.value }))}
                    >
                      <option value="">All</option>
                      {state.students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Skill</label>
                    <Select value={filter.skillId} onChange={(e) => setFilter((f) => ({ ...f, skillId: e.target.value }))}>
                      <option value="">All</option>
                      {state.skills.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.short || k.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Button className="bg-white" onClick={() => setFilter({ studentId: "", skillId: "" })}>
                    Clear
                  </Button>
                  <Button className="bg-white" onClick={exportCSV}>
                    Export CSV
                  </Button>
                </div>
              </div>
              <EntriesTable
                rows={filtered}
                onEdit={setEditing}
                onDelete={(id) => setState((p) => ({ ...p, entries: p.entries.filter((e) => e.id !== id) }))}
              />
            </Card>
          </div>
        )}

        {tab === "setup" && <Setup state={state} setState={setState} />}
      </main>

      {/* footer */}
      <footer className="max-w-6xl mx-auto p-4 text-xs text-slate-500">
        Stores locally in this browser. Use Export CSV to share or archive.
      </footer>
    </div>
  );
}

/* --------------- subcomponents --------------- */

function EntryForm({ state, initial, onSave, onCancel }) {
  const now = Date.now();
  const [studentId, setStudentId] = useState(initial?.studentId || state.students[0]?.id || "");
  const [skillId, setSkillId] = useState(initial?.skillId || state.skills[0]?.id || "");
  const [date, setDate] = useState(initial ? toDate(initial.timestamp) : toDate(now));
  const [time, setTime] = useState(initial ? toTime(initial.timestamp) : toTime(now));

  // 0–2 rating + prompt details required at 1
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [promptDetails, setPromptDetails] = useState(initial?.promptDetails ?? "");

  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? "");
  const [promptLevel, setPromptLevel] = useState(initial?.promptLevel ?? "Independent");
  const [reinforcer, setReinforcer] = useState(initial?.reinforcer ?? state.reinforcers[0]?.id ?? "");
  const [reinforcerOther, setReinforcerOther] = useState(initial?.reinforcerOther ?? "");
  const [setting, setSetting] = useState(initial?.setting ?? "Classroom");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const submit = (e) => {
    e.preventDefault();
    if (Number(rating) === 1 && !promptDetails.trim()) {
      alert("Please describe the specific prompt(s) used when rating is 1 (Requires Prompts).");
      return;
    }
    const ts = new Date(`${date}T${time}`).getTime();
    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      timestamp: ts,
      studentId,
      skillId,
      rating: Number(rating),
      promptDetails: Number(rating) === 1 ? promptDetails.trim() : "",
      durationMin: durationMin === "" ? null : Number(durationMin),
      promptLevel,
      reinforcer,
      reinforcerOther: reinforcer === "r_other" ? reinforcerOther : "",
      setting,
      notes,
    });
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-slate-500">Student</label>
          <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
            {state.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Skill / Goal</label>
          <Select value={skillId} onChange={(e) => setSkillId(e.target.value)}>
            {state.skills.map((k) => (
              <option key={k.id} value={k.id} title={k.label}>
                {k.short || k.label}
              </option>
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

      <div className="grid grid-cols-3 gap-2">
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
            placeholder="e.g., verbal prompt to start; model prompt for step 2"
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
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </Select>
          {reinforcer === "r_other" && (
            <Input
              className="mt-2"
              placeholder="Specify other reinforcer"
              value={reinforcerOther}
              onChange={(e) => setReinforcerOther(e.target.value)}
            />
          )}
        </div>
        <div>
          <label className="text-xs text-slate-500">Setting</label>
          <Select value={setting} onChange={(e) => setSetting(e.target.value)}>
            {["Classroom", "Hallway", "Lunchroom", "Recess", "PE", "Home"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500">Notes</label>
        <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-indigo-600 text-white">
          {initial ? "Update Entry" : "Save Entry"}
        </Button>
        {initial && (
          <Button type="button" className="bg-white" onClick={onCancel}>
            Cancel
          </Button>
        )}
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
            <th className="text-left p-2">Date/Time</th>
            <th className="text-left p-2">Student</th>
            <th className="text-left p-2">Skill</th>
            <th className="text-left p-2">Rating</th>
            <th className="text-left p-2">Prompt Details</th>
            <th className="text-left p-2">Duration</th>
            <th className="text-left p-2">Prompt</th>
            <th className="text-left p-2">Reinforcer</th>
            <th className="text-left p-2">Setting</th>
            <th className="text-left p-2">Notes</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-2">{new Date(r.timestamp).toLocaleString()}</td>
              <td className="p-2">{r.studentName}</td>
              <td className="p-2" title={r.skillLabel}>
                {r.skillShort || r.skillLabel}
              </td>
              <td className="p-2">{r.rating}</td>
              <td className="p-2 max-w-[28ch] truncate" title={r.promptDetails}>
                {r.promptDetails}
              </td>
              <td className="p-2">{r.durationMin ?? ""}</td>
              <td className="p-2">{r.promptLevel ?? ""}</td>
              <td className="p-2">{r.reinforcer === "r_other" ? r.reinforcerOther || "Other" : r.reinforcer}</td>
              <td className="p-2">{r.setting ?? ""}</td>
              <td className="p-2 max-w-[28ch] truncate" title={r.notes}>
                {r.notes}
              </td>
              <td className="p-2">
                <div className="flex gap-2">
                  {onEdit && (
                    <Button className="bg-white" onClick={() => onEdit(r)}>
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button className="bg-white" onClick={() => onDelete(r.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Setup({ state, setState }) {
  const [studentName, setStudentName] = useState("");
  const [skillShort, setSkillShort] = useState("");
  const [skillFull, setSkillFull] = useState("");
  const [reinforcerLabel, setReinforcerLabel] = useState("");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <h2 className="font-semibold mb-3">Students</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add student name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              if (!studentName.trim()) return;
              setState((p) => ({
                ...p,
                students: [...p.students, { id: crypto.randomUUID(), name: studentName.trim() }],
              }));
              setStudentName("");
            }}
          >
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {state.students.map((s) => (
            <li key={s.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <span>{s.name}</span>
              <Button
                className="bg-white"
                onClick={() => setState((p) => ({ ...p, students: p.students.filter((x) => x.id !== s.id) }))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Skills / Goals</h2>
        <div className="grid grid-cols-1 gap-2 mb-3">
          <Input placeholder="Short name (e.g., Follow Directions)" value={skillShort} onChange={(e) => setSkillShort(e.target.value)} />
          <Textarea rows={3} placeholder="Full goal text (optional but good for CSV)" value={skillFull} onChange={(e) => setSkillFull(e.target.value)} />
          <div className="flex gap-2">
            <Button
              className="bg-indigo-600 text-white"
              onClick={() => {
                if (!skillShort.trim()) return;
                setState((p) => ({
                  ...p,
                  skills: [
                    ...p.skills,
                    { id: crypto.randomUUID(), short: skillShort.trim(), label: (skillFull || skillShort).trim() },
                  ],
                }));
                setSkillShort("");
                setSkillFull("");
              }}
            >
              Add
            </Button>
          </div>
        </div>
        <ul className="space-y-2">
          {state.skills.map((k) => (
            <li key={k.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <div className="min-w-0">
                <div className="font-medium">{k.short || k.label}</div>
                {k.label && k.label !== k.short && (
                  <div className="text-xs text-slate-500 truncate" title={k.label}>
                    {k.label}
                  </div>
                )}
              </div>
              <Button
                className="bg-white"
                onClick={() => setState((p) => ({ ...p, skills: p.skills.filter((x) => x.id !== k.id) }))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold mb-3">Reinforcers</h2>
        <div className="flex gap-2 mb-3">
          <Input placeholder="Add reinforcer label" value={reinforcerLabel} onChange={(e) => setReinforcerLabel(e.target.value)} />
          <Button
            className="bg-indigo-600 text-white"
            onClick={() => {
              if (!reinforcerLabel.trim()) return;
              setState((p) => ({
                ...p,
                reinforcers: [...p.reinforcers, { id: crypto.randomUUID(), label: reinforcerLabel.trim() }],
              }));
              setReinforcerLabel("");
            }}
          >
            Add
          </Button>
        </div>
        <ul className="space-y-2">
          {state.reinforcers.map((r) => (
            <li key={r.id} className="flex items-center justify-between border rounded-xl px-3 py-2">
              <span>{r.label}</span>
              <Button
                className="bg-white"
                onClick={() => setState((p) => ({ ...p, reinforcers: p.reinforcers.filter((x) => x.id !== r.id) }))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
