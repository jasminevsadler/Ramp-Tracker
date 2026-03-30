import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "ramp_tracker_entries_v3";

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

const PROMPT_RANK = {
  Gestural: 1,
  Verbal: 2,
  Model: 3,
  "Partial Physical": 4,
  "Full Physical": 5,
};

const SETTING_OPTIONS = [
  "Classroom",
  "Small Group",
  "Hallway",
  "Cafeteria",
  "Recess",
  "Home",
  "Community",
  "Therapy Room",
  "PE",
  "Other",
];

const COLLECTOR_OPTIONS = [
  "Teacher",
  "Para",
  "SLP",
  "BCBA",
  "Parent",
  "Counselor",
  "Other",
];

const NOTE_TAGS = [
  "Refusal",
  "Distracted",
  "Tired",
  "Motivated by reward",
  "Peer conflict",
  "Schedule change",
  "Needed break",
  "Great mood",
  "High interest activity",
];

const GOAL_EXAMPLES = [
  {
    shortName: "Following Directions",
    fullGoal:
      "When given a verbal reminder, the student will follow directions within 30 seconds.",
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
    setting: "",
    collector: "",
    trials: "",
    independentCount: "",
    notes: "",
    tags: [],
  };
}

function sortByDateAsc(list) {
  return [...list].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
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

function percent(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function getMasteryStatus(entries) {
  if (!entries.length) return "No data";

  const sorted = sortByDateAsc(entries);
  const lastThree = sorted.slice(-3);
  if (lastThree.length < 3) return "Progressing";

  const allSessionsMeetRule = lastThree.every((entry) => {
    if (entry.trials && Number(entry.trials) > 0) {
      return (
        Number(entry.independentCount || 0) / Number(entry.trials || 1) >= 0.8
      );
    }
    return entry.score === "2";
  });

  if (allSessionsMeetRule) return "Mastered";

  const lastTwo = sorted.slice(-2);
  const nearMastery =
    lastTwo.length === 2 &&
    lastTwo.every((entry) => {
      if (entry.trials && Number(entry.trials) > 0) {
        return (
          Number(entry.independentCount || 0) / Number(entry.trials || 1) >= 0.8
        );
      }
      return entry.score === "2";
    });

  if (nearMastery) return "Near Mastery";
  return "Progressing";
}

function MiniLineGraph({ data, height = 220 }) {
  if (!data.length) {
    return (
      <div style={styles.emptyGraph}>
        No graph data yet. Add scored entries with dates to view progress.
      </div>
    );
  }

  const width = 760;
  const padding = 36;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + innerHeight - (item.value / 100) * innerHeight;
    return { x, y, label: item.label, value: item.value };
  });

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const masteryY = padding + innerHeight - 0.8 * innerHeight;

  return (
    <div style={styles.graphWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} style={styles.graphSvg}>
        <line
          x1={padding}
          y1={padding + innerHeight}
          x2={padding + innerWidth}
          y2={padding + innerHeight}
          stroke="#94a3b8"
          strokeWidth="1"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + innerHeight}
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {[0, 20, 40, 60, 80, 100].map((tick) => {
          const y = padding + innerHeight - (tick / 100) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={padding}
                y1={y}
                x2={padding + innerWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={6}
                y={y + 4}
                fontSize="12"
                fill="#64748b"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        <line
          x1={padding}
          y1={masteryY}
          x2={padding + innerWidth}
          y2={masteryY}
          stroke="#16a34a"
          strokeDasharray="6 6"
          strokeWidth="2"
        />
        <text
          x={padding + 8}
          y={masteryY - 8}
          fontSize="12"
          fill="#166534"
        >
          Mastery line (80%)
        </text>

        <path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={`${point.label}-${point.value}`}>
            <circle cx={point.x} cy={point.y} r="4.5" fill="#2563eb" />
            <text
              x={point.x}
              y={height - 10}
              fontSize="11"
              textAnchor="middle"
              fill="#475569"
            >
              {point.label}
            </text>
            <text
              x={point.x}
              y={point.y - 10}
              fontSize="11"
              textAnchor="middle"
              fill="#1e3a8a"
            >
              {point.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarGraph({ data, max = 10, titleField = "label", valueField = "value" }) {
  if (!data.length) {
    return <div style={styles.emptyGraph}>No data yet.</div>;
  }

  return (
    <div style={styles.barGraph}>
      {data.map((item) => {
        const width = max ? `${(item[valueField] / max) * 100}%` : "0%";
        return (
          <div key={item[titleField]} style={styles.barRow}>
            <div style={styles.barLabel}>{item[titleField]}</div>
            <div style={styles.barTrack}>
              <div style={{ ...styles.barFill, width }} />
            </div>
            <div style={styles.barValue}>{item[valueField]}</div>
          </div>
        );
      })}
    </div>
  );
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
  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    student: "",
    shortName: "",
  });

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

        if (field === "trials") {
          const trials = Number(value || 0);
          const currentIndependent = Number(updated.independentCount || 0);
          if (currentIndependent > trials && value !== "") {
            updated.independentCount = value;
          }
        }

        return updated;
      })
    );
  };

  const toggleTag = (id, tag) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry;
        const hasTag = entry.tags.includes(tag);
        return {
          ...entry,
          tags: hasTag
            ? entry.tags.filter((item) => item !== tag)
            : [...entry.tags, tag],
        };
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
    const next = createBlankEntry();
    setEntries((prev) => [...prev, next]);
    setEditingId(next.id);
    setActiveTab("entry");
  };

  const deleteEntry = (id) => {
    setEntries((prev) => {
      const updated = prev.filter((entry) => entry.id !== id);
      return updated.length ? updated : [createBlankEntry()];
    });
    if (editingId === id) setEditingId(null);
  };

  const clearAll = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all entries?"
    );
    if (!confirmed) return;
    setEntries([createBlankEntry()]);
    setEditingId(null);
  };

  const validateEntries = (list = entries) => {
    for (const entry of list) {
      const hasAnyData =
        entry.student ||
        entry.shortName ||
        entry.goal ||
        entry.score ||
        entry.notes ||
        entry.setting ||
        entry.collector ||
        entry.trials ||
        entry.independentCount;

      if (!hasAnyData) continue;

      if (!entry.date || !entry.student || !entry.goal || !entry.score) {
        alert("Please complete Date, Student, Goal, and Performance for all used entries.");
        return false;
      }

      if (entry.score === "1" && !entry.promptType) {
        alert("Please select the specific prompt type for any score of 1.");
        return false;
      }

      if (entry.independentCount && !entry.trials) {
        alert("If you enter independent successes, also enter total trials.");
        return false;
      }

      if (
        Number(entry.independentCount || 0) > Number(entry.trials || 0) &&
        entry.trials !== ""
      ) {
        alert("Independent successes cannot be more than total trials.");
        return false;
      }
    }
    return true;
  };

  const uniqueStudents = useMemo(() => {
    return [...new Set(entries.map((e) => e.student).filter(Boolean))].sort();
  }, [entries]);

  const uniqueGoals = useMemo(() => {
    return [...new Set(entries.map((e) => e.shortName).filter(Boolean))].sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return sortByDateAsc(entries).filter((entry) => {
      if (filters.startDate && entry.date < filters.startDate) return false;
      if (filters.endDate && entry.date > filters.endDate) return false;
      if (filters.student && entry.student !== filters.student) return false;
      if (filters.shortName && entry.shortName !== filters.shortName) return false;
      return true;
    });
  }, [entries, filters]);

  const scoredFilteredEntries = useMemo(() => {
    return filteredEntries.filter((entry) => entry.score !== "");
  }, [filteredEntries]);

  const summary = useMemo(() => {
    const total = scoredFilteredEntries.length;
    const zeroCount = scoredFilteredEntries.filter((e) => e.score === "0").length;
    const oneCount = scoredFilteredEntries.filter((e) => e.score === "1").length;
    const twoCount = scoredFilteredEntries.filter((e) => e.score === "2").length;

    const averageScore =
      total === 0
        ? 0
        : (
            scoredFilteredEntries.reduce(
              (sum, entry) => sum + Number(entry.score || 0),
              0
            ) / total
          ).toFixed(2);

    const totalTrials = scoredFilteredEntries.reduce(
      (sum, entry) => sum + Number(entry.trials || 0),
      0
    );

    const totalIndependent = scoredFilteredEntries.reduce(
      (sum, entry) => sum + Number(entry.independentCount || 0),
      0
    );

    const independentPercentByTrials =
      totalTrials > 0 ? percent(totalIndependent, totalTrials) : null;

    const promptBreakdown = PROMPT_OPTIONS.map((prompt) => ({
      label: prompt,
      value: scoredFilteredEntries.filter(
        (entry) => entry.score === "1" && entry.promptType === prompt
      ).length,
    }));

    const promptAverage =
      scoredFilteredEntries.filter((entry) => entry.score === "1" && entry.promptType)
        .length > 0
        ? (
            scoredFilteredEntries
              .filter((entry) => entry.score === "1" && entry.promptType)
              .reduce(
                (sum, entry) => sum + (PROMPT_RANK[entry.promptType] || 0),
                0
              ) /
            scoredFilteredEntries.filter(
              (entry) => entry.score === "1" && entry.promptType
            ).length
          ).toFixed(2)
        : "N/A";

    const masteryStatus = getMasteryStatus(scoredFilteredEntries);

    return {
      total,
      zeroCount,
      oneCount,
      twoCount,
      zeroPercent: percent(zeroCount, total),
      onePercent: percent(oneCount, total),
      twoPercent: percent(twoCount, total),
      averageScore,
      totalTrials,
      totalIndependent,
      independentPercentByTrials,
      promptBreakdown,
      promptAverage,
      masteryStatus,
    };
  }, [scoredFilteredEntries]);

  const progressGraphData = useMemo(() => {
    const grouped = {};
    scoredFilteredEntries.forEach((entry) => {
      if (!entry.date) return;
      if (!grouped[entry.date]) {
        grouped[entry.date] = {
          date: entry.date,
          trials: 0,
          independent: 0,
          scores: [],
        };
      }
      grouped[entry.date].scores.push(Number(entry.score || 0));
      grouped[entry.date].trials += Number(entry.trials || 0);
      grouped[entry.date].independent += Number(entry.independentCount || 0);
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => {
        let value = 0;

        if (item.trials > 0) {
          value = percent(item.independent, item.trials);
        } else if (item.scores.length > 0) {
          const avg = item.scores.reduce((sum, n) => sum + n, 0) / item.scores.length;
          value = Math.round((avg / 2) * 100);
        }

        return {
          label: item.date.slice(5),
          value,
        };
      });
  }, [scoredFilteredEntries]);

  const promptTrendGraphData = useMemo(() => {
    const prompted = sortByDateAsc(
      scoredFilteredEntries.filter((entry) => entry.score === "1" && entry.promptType)
    );

    if (!prompted.length) return [];

    return prompted.map((entry, index) => ({
      label: `${index + 1}. ${entry.date.slice(5)}`,
      value: PROMPT_RANK[entry.promptType] || 0,
      prompt: entry.promptType,
    }));
  }, [scoredFilteredEntries]);

  const promptTrendDisplay = useMemo(() => {
    if (!promptTrendGraphData.length) return [];

    return promptTrendGraphData.map((item) => ({
      label: item.prompt,
      value: item.value,
    }));
  }, [promptTrendGraphData]);

  const settingBreakdown = useMemo(() => {
    const counts = {};
    scoredFilteredEntries.forEach((entry) => {
      if (!entry.setting) return;
      counts[entry.setting] = (counts[entry.setting] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [scoredFilteredEntries]);

  const collectorBreakdown = useMemo(() => {
    const counts = {};
    scoredFilteredEntries.forEach((entry) => {
      if (!entry.collector) return;
      counts[entry.collector] = (counts[entry.collector] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [scoredFilteredEntries]);

  const noteTagBreakdown = useMemo(() => {
    const counts = {};
    scoredFilteredEntries.forEach((entry) => {
      (entry.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [scoredFilteredEntries]);

  const handleExportCSV = () => {
    if (!validateEntries(filteredEntries)) return;

    const rows = filteredEntries.map((entry) => ({
      Date: entry.date,
      Student: entry.student,
      "Goal Short Name": entry.shortName,
      Goal: entry.goal,
      Example: entry.example,
      Setting: entry.setting,
      Collector: entry.collector,
      Performance: getPerformanceLabel(entry.score),
      "Prompt Type": entry.score === "1" ? entry.promptType : "",
      Trials: entry.trials,
      "Independent Successes": entry.independentCount,
      "Independent %":
        entry.trials && Number(entry.trials) > 0
          ? percent(Number(entry.independentCount || 0), Number(entry.trials))
          : "",
      Tags: (entry.tags || []).join("; "),
      Notes: entry.notes,
    }));

    downloadCSV(rows);
  };

  const handleEditFromTable = (id) => {
    setEditingId(id);
    setActiveTab("entry");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const entryList = editingId
    ? entries.filter((entry) => entry.id === editingId)
    : entries;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>RaMP Tracker</h1>
            <p style={styles.subtitle}>
              Track skill performance, prompts, trials, and progress toward mastery.
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

        <div style={styles.filterCard}>
          <h3 style={styles.cardTitle}>Filters</h3>
          <div style={styles.grid}>
            <div style={styles.field}>
              <label style={styles.label}>Start Date</label>
              <input
                style={styles.input}
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>End Date</label>
              <input
                style={styles.input}
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Student</label>
              <select
                style={styles.input}
                value={filters.student}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, student: e.target.value }))
                }
              >
                <option value="">All Students</option>
                {uniqueStudents.map((student) => (
                  <option key={student} value={student}>
                    {student}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Goal Short Name</label>
              <select
                style={styles.input}
                value={filters.shortName}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, shortName: e.target.value }))
                }
              >
                <option value="">All Goals</option>
                {uniqueGoals.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.actionRow}>
            <button
              style={styles.secondaryButton}
              onClick={() =>
                setFilters({
                  startDate: "",
                  endDate: "",
                  student: "",
                  shortName: "",
                })
              }
            >
              Clear Filters
            </button>
            <button style={styles.secondaryButton} onClick={handleExportCSV}>
              Export Filtered CSV
            </button>
          </div>
        </div>

        {activeTab === "entry" && (
          <div style={styles.section}>
            <div style={styles.actionRow}>
              <button style={styles.primaryButton} onClick={addEntry}>
                + Add Entry
              </button>
              <button
                style={styles.secondaryButton}
                onClick={() => setEditingId(null)}
              >
                Show All Entries
              </button>
              <button style={styles.dangerButton} onClick={clearAll}>
                Clear All
              </button>
            </div>

            {editingId && (
              <div style={styles.editingBanner}>
                Editing one saved entry. Click “Show All Entries” to go back.
              </div>
            )}

            {entryList.map((entry, index) => (
              <div key={entry.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    {editingId ? "Edit Entry" : `Entry ${index + 1}`}
                  </h3>
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

                  <div style={styles.field}>
                    <label style={styles.label}>Setting / Location</label>
                    <select
                      style={styles.input}
                      value={entry.setting}
                      onChange={(e) => updateEntry(entry.id, "setting", e.target.value)}
                    >
                      <option value="">Select Setting</option>
                      {SETTING_OPTIONS.map((setting) => (
                        <option key={setting} value={setting}>
                          {setting}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Data Collector</label>
                    <select
                      style={styles.input}
                      value={entry.collector}
                      onChange={(e) =>
                        updateEntry(entry.id, "collector", e.target.value)
                      }
                    >
                      <option value="">Select Collector</option>
                      {COLLECTOR_OPTIONS.map((collector) => (
                        <option key={collector} value={collector}>
                          {collector}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Total Trials / Opportunities</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={entry.trials}
                      onChange={(e) => updateEntry(entry.id, "trials", e.target.value)}
                    />
                  </div>

                  <div style={styles.field}>
                    <label style={styles.label}>Independent Successes</label>
                    <input
                      style={styles.input}
                      type="number"
                      min="0"
                      placeholder="e.g. 4"
                      value={entry.independentCount}
                      onChange={(e) =>
                        updateEntry(entry.id, "independentCount", e.target.value)
                      }
                    />
                  </div>
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
                  <label style={styles.label}>Quick Note Tags</label>
                  <div style={styles.tagWrap}>
                    {NOTE_TAGS.map((tag) => {
                      const active = entry.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(entry.id, tag)}
                          style={active ? styles.activeTag : styles.tag}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
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

                {entry.trials && Number(entry.trials) > 0 && (
                  <div style={styles.infoChip}>
                    Independent rate for this entry:{" "}
                    {percent(
                      Number(entry.independentCount || 0),
                      Number(entry.trials || 0)
                    )}
                    %
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "dashboard" && (
          <div style={styles.section}>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Mastery Status</div>
                <div style={styles.statValueSmall}>{summary.masteryStatus}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Scored Entries</div>
                <div style={styles.statValue}>{summary.total}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Average Score</div>
                <div style={styles.statValue}>{summary.averageScore}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>0 - Not Demonstrating</div>
                <div style={styles.statValue}>
                  {summary.zeroCount} ({summary.zeroPercent}%)
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>1 - Requiring Prompts</div>
                <div style={styles.statValue}>
                  {summary.oneCount} ({summary.onePercent}%)
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>2 - Independent</div>
                <div style={styles.statValue}>
                  {summary.twoCount} ({summary.twoPercent}%)
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Total Trials</div>
                <div style={styles.statValue}>{summary.totalTrials}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Independent Successes</div>
                <div style={styles.statValue}>{summary.totalIndependent}</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Independent % by Trials</div>
                <div style={styles.statValue}>
                  {summary.independentPercentByTrials === null
                    ? "N/A"
                    : `${summary.independentPercentByTrials}%`}
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statLabel}>Average Prompt Level</div>
                <div style={styles.statValue}>{summary.promptAverage}</div>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Progress Toward Mastery</h3>
              <p style={styles.helpText}>
                This graph shows daily independence percentage. If trials are entered,
                it uses independent successes ÷ total trials. If trials are not entered,
                it estimates from the 0–1–2 score.
              </p>
              <MiniLineGraph data={progressGraphData} />
            </div>

            <div style={styles.twoCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Prompt Type Breakdown</h3>
                <BarGraph
                  data={summary.promptBreakdown}
                  max={Math.max(...summary.promptBreakdown.map((x) => x.value), 1)}
                />
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Setting Breakdown</h3>
                <BarGraph
                  data={settingBreakdown}
                  max={Math.max(...settingBreakdown.map((x) => x.value), 1)}
                />
              </div>
            </div>

            <div style={styles.twoCol}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Data Collector Breakdown</h3>
                <BarGraph
                  data={collectorBreakdown}
                  max={Math.max(...collectorBreakdown.map((x) => x.value), 1)}
                />
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Quick Note Tag Breakdown</h3>
                <BarGraph
                  data={noteTagBreakdown}
                  max={Math.max(...noteTagBreakdown.map((x) => x.value), 1)}
                />
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Prompt Hierarchy Trend</h3>
              <p style={styles.helpText}>
                Lower numbers are less intrusive prompts. Gestural = 1, Verbal = 2,
                Model = 3, Partial Physical = 4, Full Physical = 5.
              </p>
              {promptTrendGraphData.length ? (
                <div style={styles.promptTrendList}>
                  {promptTrendGraphData.map((item) => (
                    <div key={item.label} style={styles.promptTrendRow}>
                      <span>{item.label}</span>
                      <strong>
                        {item.prompt} ({item.value})
                      </strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyGraph}>No prompted entries yet.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === "table" && (
          <div style={styles.section}>
            <div style={styles.actionRow}>
              <button style={styles.secondaryButton} onClick={handleExportCSV}>
                Export Filtered CSV
              </button>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Edit</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Student</th>
                    <th style={styles.th}>Goal Short Name</th>
                    <th style={styles.th}>Goal</th>
                    <th style={styles.th}>Setting</th>
                    <th style={styles.th}>Collector</th>
                    <th style={styles.th}>Performance</th>
                    <th style={styles.th}>Prompt Type</th>
                    <th style={styles.th}>Trials</th>
                    <th style={styles.th}>Independent</th>
                    <th style={styles.th}>Independent %</th>
                    <th style={styles.th}>Tags</th>
                    <th style={styles.th}>Notes</th>
                    <th style={styles.th}>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td style={styles.td}>
                        <button
                          style={styles.smallButton}
                          onClick={() => handleEditFromTable(entry.id)}
                        >
                          Edit
                        </button>
                      </td>
                      <td style={styles.td}>{entry.date}</td>
                      <td style={styles.td}>{entry.student}</td>
                      <td style={styles.td}>{entry.shortName}</td>
                      <td style={styles.td}>{entry.goal}</td>
                      <td style={styles.td}>{entry.setting}</td>
                      <td style={styles.td}>{entry.collector}</td>
                      <td style={styles.td}>{getPerformanceLabel(entry.score)}</td>
                      <td style={styles.td}>
                        {entry.score === "1" ? entry.promptType : ""}
                      </td>
                      <td style={styles.td}>{entry.trials}</td>
                      <td style={styles.td}>{entry.independentCount}</td>
                      <td style={styles.td}>
                        {entry.trials && Number(entry.trials) > 0
                          ? `${percent(
                              Number(entry.independentCount || 0),
                              Number(entry.trials || 0)
                            )}%`
                          : ""}
                      </td>
                      <td style={styles.td}>{(entry.tags || []).join(", ")}</td>
                      <td style={styles.td}>{entry.notes}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.smallDeleteButton}
                          onClick={() => deleteEntry(entry.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredEntries.length && (
                    <tr>
                      <td style={styles.td} colSpan={15}>
                        No entries match the current filters.
                      </td>
                    </tr>
                  )}
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
    maxWidth: "1280px",
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
    marginBottom: "18px",
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
  filterCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid #e5e7eb",
    marginBottom: "18px",
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
  smallDeleteButton: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  smallButton: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #93c5fd",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  editingBanner: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    color: "#1d4ed8",
    padding: "12px 14px",
    borderRadius: "12px",
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
  helpText: {
    marginTop: "6px",
    marginBottom: "14px",
    color: "#475569",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px",
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
  tagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  tag: {
    padding: "8px 10px",
    borderRadius: "999px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
  },
  activeTag: {
    padding: "8px 10px",
    borderRadius: "999px",
    border: "1px solid #2563eb",
    background: "#dbeafe",
    color: "#1d4ed8",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  infoChip: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#ecfdf5",
    color: "#166534",
    fontWeight: 600,
    fontSize: "13px",
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
    fontSize: "24px",
    fontWeight: 700,
  },
  statValueSmall: {
    fontSize: "22px",
    fontWeight: 700,
  },
  graphWrap: {
    width: "100%",
    overflowX: "auto",
  },
  graphSvg: {
    width: "100%",
    minWidth: "760px",
    height: "220px",
    display: "block",
  },
  emptyGraph: {
    padding: "20px",
    border: "1px dashed #cbd5e1",
    borderRadius: "12px",
    color: "#64748b",
    background: "#f8fafc",
  },
  barGraph: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  barRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr 48px",
    gap: "10px",
    alignItems: "center",
  },
  barLabel: {
    fontSize: "14px",
    color: "#334155",
  },
  barTrack: {
    height: "14px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "999px",
  },
  barValue: {
    fontWeight: 700,
    fontSize: "13px",
    textAlign: "right",
  },
  promptTrendList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  promptTrendRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "8px",
    fontSize: "14px",
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
    minWidth: "1500px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontSize: "14px",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
    fontSize: "14px",
  },
};
