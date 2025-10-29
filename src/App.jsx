import React, { useState, useEffect, useMemo } from "react";
import InstallPWAButton from "./InstallPWAButton";
import {
  Download,
  Plus,
  Trash2,
  Edit3,
  BarChart3,
  Database,
  Settings2,
  Filter,
  Printer,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// === UI Components (minimal Tailwind-based) ===
const Button = ({ className = "", ...props }) => (
  <button
    className={`px-3 py-2 rounded-2xl shadow-sm border text-sm hover:shadow transition ${className}`}
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
  <div className={`bg-white rounded-2xl shadow p-4 border ${className}`} {...props} />
);

const Badge = ({ children }) => (
  <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
    {children}
  </span>
);

// === Main Component ===
export default function App() {
  const [student, setStudent] = useState("Jasmine");
  const [goal, setGoal] = useState("When given a task or assignment");
  const [rating, setRating] = useState(0);
  const [promptLevel, setPromptLevel] = useState("Independent");
  const [promptDetails, setPromptDetails] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [reinforcer, setReinforcer] = useState("PBIS point");
  const [setting, setSetting] = useState("Classroom");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Save last used values
  useEffect(() => {
    localStorage.setItem("rampTrackerData", JSON.stringify({
      student, goal, rating, promptLevel, promptDetails,
      durationMin, reinforcer, setting, date, time,
    }));
  }, [student, goal, rating, promptLevel, promptDetails, durationMin, reinforcer, setting, date, time]);

  // Load saved values
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("rampTrackerData"));
    if (saved) {
      setStudent(saved.student);
      setGoal(saved.goal);
      setRating(saved.rating);
      setPromptLevel(saved.promptLevel);
      setPromptDetails(saved.promptDetails);
      setDurationMin(saved.durationMin);
      setReinforcer(saved.reinforcer);
      setSetting(saved.setting);
      setDate(saved.date);
      setTime(saved.time);
    }
  }, []);

  const handleSave = () => {
    alert("Entry saved! ✅");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between bg-indigo-600 text-white p-4 shadow">
        <h1 className="text-lg font-bold">RaMP it Up! Data Tracker</h1>
        <InstallPWAButton />
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto p-4 grid gap-4">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Log Entry</h2>

          {/* Student / Goal */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-500">Student</label>
              <Select value={student} onChange={(e) => setStudent(e.target.value)}>
                <option>Jasmine</option>
                <option>Donavin</option>
                <option>Autumn</option>
                <option>Zay</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-500">Skill / Goal</label>
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter goal description"
              />
            </div>
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="text-xs text-slate-500">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">Time</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Rating / Duration / Prompt Level */}
          <div className="grid grid-cols-3 gap-2 items-end mt-3">
            <div>
              <label className="text-xs text-slate-500">Rating (0–2)</label>
              <Select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={0}>0 – Not Demonstrating</option>
                <option value={1}>1 – Requires Prompts</option>
                <option value={2}>2 – Independent</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-500">Duration (min)</label>
              <Input
                type="number"
                min="0"
                step="1"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">Prompt Level</label>
              <Select
                value={promptLevel}
                onChange={(e) => setPromptLevel(e.target.value)}
              >
                <option>Independent</option>
                <option>Gestural</option>
                <option>Verbal</option>
                <option>Model</option>
                <option>Partial Physical</option>
                <option>Full Physical</option>
              </Select>
            </div>
          </div>

          {/* Conditional Prompt Details */}
          {Number(rating) === 1 && (
            <div className="mt-3">
              <label className="text-xs text-slate-500">
                Prompt Details (required for rating = 1)
              </label>
              <Textarea
                rows={2}
                placeholder="Describe specific prompts used..."
                value={promptDetails}
                onChange={(e) => setPromptDetails(e.target.value)}
              />
            </div>
          )}

          {/* Reinforcer / Setting */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div>
              <label className="text-xs text-slate-500">Reinforcer</label>
              <Select
                value={reinforcer}
                onChange={(e) => setReinforcer(e.target.value)}
              >
                <option>PBIS point</option>
                <option>Token</option>
                <option>Sticker</option>
                <option>Break</option>
                <option>Verbal Praise</option>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-500">Setting</label>
              <Select
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
              >
                <option>Classroom</option>
                <option>Community</option>
                <option>Therapy Room</option>
                <option>Lunchroom</option>
              </Select>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={handleSave}
            >
              <Plus className="inline-block w-4 h-4 mr-1" />
              Save Entry
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Build v6 — tracker.rampitupsolutions.com
        </p>
      </main>
    </div>
  );
}
<p className="text-center text-xs text-slate-500 mt-4">
  Build v7 — tracker.rampitupsolutions.com
</p>
