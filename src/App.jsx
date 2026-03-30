import React, { useEffect, useMemo, useState } from "react";

const PERFORMANCE_OPTIONS = [
  { value: "0", label: "0 - Not Demonstrating" },
  { value: "1", label: "1 - Requiring Prompts" },
  { value: "2", label: "2 - Independent" },
];

const PROMPT_OPTIONS = [
  "Gestural",
  "Verbal",
  "Model",
  "Partial Physical",
  "Full Physical",
];

const STORAGE_KEY = "ramp_tracker_entries_v2";

const GOAL_EXAMPLES = [
  {
    shortName: "Following Directions",
    fullGoal:
      "When given a verbal reminder, Johnny will follow directions within 30 seconds.",
    example:
      "Example: Teacher says, 'Please open your notebook,' and student begins within 30 seconds.",
  },
  {
    shortName: "Staying on Task",
    fullGoal:
      "During independent work, the student will remain on task for the assigned activity.",
    example:
      "Example: Student works on the assigned worksheet and avoids unrelated talking or playing.",
  },
  {
    shortName: "Transitioning",
    fullGoal:
      "The student will transition between classroom activities with no more than one reminder.",
    example:
      "Example: Student moves from whole group to centers after one teacher cue.",
  },
  {
    shortName: "Peer Interaction",
    fullGoal:
      "The student will appropriately interact with peers during structured activities.",
    example:
      "Example: Student greets a peer, shares materials, or takes turns during a game.",
  },
  {
    shortName: "Requesting Help",
    fullGoal:
      "The student will appropriately request help when needed instead of shutting down or leaving task.",
    example:
      "Example: Student raises hand or says, 'Can you help me?' during work time.",
  },
];

function getPerformanceLabel(value) {
  const match = PERFORMANCE_OPTIONS.find((option) => option.value === value);
  return match ? match.label : "";
}

function createBlankEntry() {
  return {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString().slice(0, 10),
    student: "",
    shortName: "",
    goal: "",
    example: "",
    score: "",
    promptType: "",
    notes: "",
  };
}

function downloadCSV(rows, filename = "ramp-tracker-data.csv") {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function App() {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [createBlankEntry()];
    } catch {
      return [createBlankEntry()];
    }
  });

  const [activeTab, setActiveTab] = useState("entry");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const updateEntry = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;

        const updated = { ...entry, [field]: value };

        if (field === "score" && value !== "1") {
          updated.promptType = "";
        }

        return updated;
      })
    );
  };

  const applyGoalTemplate = (id, shortName) => {
    const selected = GOAL_EXAMPLES.find((goal) => goal.shortName === shortName);

    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              shortName: selected?.shortName || "",
              goal: selected?.fullGoal || "",
              example: selected?.example || "",
            }
          : entry
      )
    );
  };

  const addEntry = () => {
    setEntries((prev) => [...prev, createBlankEntry()]);
  };

  const deleteEntry = (id) => {
    setEntries((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      return updated.length ? updated : [createBlankEntry()];
    });
  };

  const clearAll = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all entries?"
    );
    if (!confirmed) return;
    setEntries([createBlankEntry()]);
  };

  const validateEntries = () => {
    for (const entry of entries) {
      if (!entry.date || !entry.student || !entry.goal || !entry.score) {
        alert("Please complete Date, Student, Goal, and Performance for all entries.");
        return false;
      }

      if (entry.score === "1" && !entry.promptType) {
        alert("Please select the specific prompt type for any score of 1.");
        return false;
      }
    }
    return true;
  };

  const handleExportCSV = () => {
    if (!validateEntries()) return;

    const rows = entries.map((entry) => ({
      Date: entry.date,
      Student: entry.student,
      "Goal Short Name": entry.shortName,
      Goal: entry.goal,
      Example: entry.example,
      Performance: getPerformanceLabel(entry.score),
      "Prompt Type": entry.score === "1" ? entry.promptType : "",
      Notes: entry.notes,
    }));

    downloadCSV(rows);
  };

  const dashboard = useMemo(() => {
    const completeEntries = entries.filter((entry) => entry.score !== "");

    const total = completeEntries.length;
    const zeroCount = completeEntries.filter((entry) => entry.score === "0").length;
    const oneCount = completeEntries.filter((entry) => entry.score === "1").length;
    const twoCount = completeEntries.filter((entry) => entry.score === "2").length;

    const average =
      total === 0
        ? 0
        : (
            completeEntries.reduce(
              (sum, entry) => sum + Number(entry.score || 0),
              0
            ) / total
          ).toFixed(2);

    const promptBreakdown = PROMPT_OPTIONS.map((prompt) => ({
      prompt,
      count: completeEntries.filter(
        (entry) => entry.score === "1" && entry.promptType === prompt
      ).length,
    }));

    return {
      total,
      zeroCount,
      oneCount,
      twoCount,
      average,
      promptBreakdown,
    };
  }, [entries]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>RaMP Tracker</h1>
            <p style={styles.subtitle}>
              Track student performance using 0 = Not Demonstrating, 1 = Requiring
              Prompts, and 2 = Independent.
            </p>
          </div>
        </header>

        <div style={styles.tabBar}>
          <button
            style={activeTab === "entry" ? styles.activeTabButton : styles.tabButton}
            onClick={() => setActiveTab("entry")}
          >
            Data Entry
          </button>
          <button
            style={activeTab === "dashboard" ? styles.activeTabButton : styles.tabButton}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            style={activeTab === "table" ? styles.activeTabButton : styles.tabButton}
            onClick={() => setActiveTab("table")}
          >
            Table View
          </button>
        </div>

        {activeTab === "entry" && (
          <div style={styles.section}>
            <div style={styles.actionRow}>
              <button style={styles.primaryButton} onClick={addEntry}>
                + Add Entry
              </button>
              <button style={styles.secondaryButton} onClick={handleExportCSV}>
                Export CSV
              </button>
              <button style={styles.dangerButton} onClick={clearAll}>
                Clear All
              </button>
            </div>

            {entries.map((entry, index) => (
              <div key={entry.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Entry {index + 1}</h3>
                  <button
                    style={styles.deleteButton}
                    onClick={() => deleteEntry(entry.id)}
                  >
                    Delete
                  </button>
                </div>

                <div style={styles.grid}>
                  <div style={styles.field}>
                    <label style={styles.label}>Date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Student</label>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Enter student name"
                      value={entry.student}
                      onChange={(e) => updateEntry(entry.id, "student", e.target.value)}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Goal Short Name</label>
                    <select
                      style={styles.input}
                      value={entry.shortName}
                      onChange={(e) => applyGoalTemplate(entry.id, e.target.value)}
                    >
                      <option value="">Select a short name</option>
                      {GOAL_EXAMPLES.map((goal) => (
                        <option key={goal.shortName} value={goal.shortName}>
                          {goal.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Performance</label>
                    <select
                      style={styles.input}
                      value={entry.score}
                      onChange={(e) => updateEntry(entry.id, "score", e.target.value)}
                    >
                      <option value="">Select</option>
                      {PERFORMANCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {entry.score === "1" && (
                    <div style={styles.field}>
                      <label style={styles.label}>Prompt Type</label>
                      <select
                        style={styles.input}
                        value={entry.promptType}
                        onChange={(e) =>
                          updateEntry(entry.id, "promptType", e.target.value)
                        }
                      >
                        <option value="">Select Prompt Type</option>
                        {PROMPT_OPTIONS.map((prompt) => (
                          <option key={prompt} value={prompt}>
                            {prompt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Goal</label>
                  <textarea
                    style={styles.textarea}
                    rows={3}
                    placeholder="Type the full goal here"
                    value={entry.goal}
                    onChange={(e) => updateEntry(entry.id, "goal", e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Example</label>
                  <textarea
                    style={styles.textarea}
                    rows={2}
                    placeholder="Add an example of what this looks like"
                    value={entry.example}
                    onChange={(e) => updateEntry(entry.id, "example", e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={styles.textarea}
                    rows={3}
                    placeholder="Add notes here"
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, "notes", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div style={styles.section}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Scored Entries</div>
                <div style={styles.statValue}>{dashboard.total}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>0 - Not Demonstrating</div>
                <div style={styles.statValue}>{dashboard.zeroCount}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>1 - Requiring Prompts</div>
                <div style={styles.statValue}>{dashboard.oneCount}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>2 - Independent</div>
                <div style={styles.statValue}>{dashboard.twoCount}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Average Score</div>
                <div style={styles.statValue}>{dashboard.average}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Prompt Type Breakdown</h3>
              <div style={styles.promptList}>
                {dashboard.promptBreakdown.map((item) => (
                  <div key={item.prompt} style={styles.promptRow}>
                    <span>{item.prompt}</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "table" && (
          <div style={styles.section}>
            <div style={styles.actionRow}>
              <button style={styles.secondaryButton} onClick={handleExportCSV}>
                Export CSV
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Goal Short Name</th>
                    <th style={styles.th}>Goal</th>
                    <th style={styles.th}>Example</th>
                    <th style={styles.th}>Performance</th>
                    <th style={styles.th}>Prompt Type</th>
                    <th style={styles.th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={styles.td}>{entry.date}</td>
                      <td style={styles.td}>{entry.student}</td>
                      <td style={styles.td}>{entry.shortName}</td>
                      <td style={styles.td}>{entry.goal}</td>
                      <td style={styles.td}>{entry.example}</td>
                      <td style={styles.td}>{getPerformanceLabel(entry.score)}</td>
                      <td style={styles.td}>
                        {entry.score === "1" ? entry.promptType : ""}
                      </td>
                      <td style={styles.td}>{entry.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "24px",
    boxSizing: "border-box",
    fontFamily:
      'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#1f2937",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
  },
  subtitle: {
    marginTop: "8px",
    fontSize: "15px",
    color: "#4b5563",
  },
  tabBar: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  tabButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeTabButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #94a3b8",
    background: "#ffffff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: 600,
  },
  dangerButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteButton: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
  },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
  },
  input: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#ffffff",
  },
  textarea: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    resize: "vertical",
    background: "#ffffff",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  statCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
  },
  promptList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  promptRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px",
  },
  tableWrap: {
    overflowX: "auto",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1000px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontSize: "14px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
    fontSize: "14px",
  },
};
