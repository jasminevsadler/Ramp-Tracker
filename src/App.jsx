import React, { useEffect, useMemo, useState } from "react";

const GRADE_OPTIONS = [
  "Preschool",
  "Pre-K",
  "K",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "College",
  "Adult",
];

const DISABILITY_OPTIONS = [
  "Autism",
  "ADHD",
  "Intellectual Disability",
  "Developmental Delay",
  "Speech or Language Impairment",
  "Specific Learning Disability",
  "Emotional/Behavioral Disability",
  "Other Health Impairment",
  "Hearing Impairment",
  "Visual Impairment",
  "Orthopedic Impairment",
  "Traumatic Brain Injury",
  "Multiple Disabilities",
  "Deaf-Blindness",
  "504 Plan",
  "Other",
];

const SETTING_OPTIONS = ["School", "Home", "Therapy", "Community", "Other"];

const SESSION_LOCATION_OPTIONS = [
  "Classroom",
  "Cafeteria",
  "Gym",
  "Hallway",
  "Bathroom",
  "Playground",
  "Bus",
  "Therapy Room",
  "Resource Room",
  "Small Group",
  "Specials",
  "Home",
  "Community",
  "Other",
];

const COLLECTED_BY_OPTIONS = [
  "Teacher",
  "Parent/Caregiver",
  "Paraprofessional",
  "Behavior Specialist",
  "BCBA",
  "SLP",
  "OT",
  "PT",
  "Counselor",
  "Administrator",
  "Student",
  "Other",
];

const PROMPT_OPTIONS = [
  "Gestural",
  "Verbal",
  "Model",
  "Partial Physical",
  "Full Physical",
];

const COLLECTION_METHODS = ["rating", "interval"];
const INTERVAL_TYPES = [
  "Whole Interval",
  "Partial Interval",
  "Momentary Time Sampling",
];

const DEFAULT_STUDENTS = [
  {
    id: "student-johnny",
    name: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: ["Autism", "ADHD"],
    setting: "School",
    goals: [
      {
        id: "goal-following-directions",
        title: "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
        shortName: "Following Directions",
        objective:
          "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
        example:
          "Examples: starts work after teacher says 'Please begin,' lines up when directed, puts materials away after one reminder.",
        baseline: "0/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-calm-frustration",
        title: "During times of frustration, Johnny will use a calm strategy such as deep breathing, asking for help, requesting a break, or using kind words instead of yelling, refusing, or shutting down.",
        shortName: "Maintaining Calm",
        objective:
          "During times of frustration, Johnny will use a calm strategy such as deep breathing, asking for help, requesting a break, or using kind words instead of yelling, refusing, or shutting down.",
        example:
          "Examples: asks for help when confused, takes a breathing break, says 'I need a minute,' uses calm words instead of arguing.",
        baseline: "1/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-peer-interactions",
        title: "During structured and unstructured activities, Johnny will engage in positive peer interactions by greeting peers, sharing materials, taking turns, joining activities appropriately, or responding kindly.",
        shortName: "Peer Interaction",
        objective:
          "During structured and unstructured activities, Johnny will engage in positive peer interactions by greeting peers, sharing materials, taking turns, joining activities appropriately, or responding kindly.",
        example:
          "Examples: says hello, asks to play, shares supplies, takes turns in a game, uses kind responses with classmates.",
        baseline: "2/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-staying-focused",
        title: "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        shortName: "Staying Focused",
        objective:
          "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        example:
          "Examples: keeps working during independent work, finishes a class assignment, returns to task after distraction, completes steps of an activity.",
        baseline: "1/5 opportunities",
        mastery: "80% across 3 consecutive sessions",
        collectionMethod: "interval",
      },
    ],
  },
];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function GraphCard({ title, points, mode }) {
  const width = 700;
  const height = 240;
  const padLeft = 50;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 40;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  if (!points || points.length === 0) {
    return (
      <div
        style={{
          border: "1px solid #bfdbfe",
          borderRadius: "18px",
          padding: "16px",
          background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: "#1e3a8a",
            marginBottom: "10px",
            fontSize: "18px",
          }}
        >
          {title}
        </div>
        <div style={{ color: "#64748b" }}>No saved data yet for this goal.</div>
      </div>
    );
  }

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const maxY = mode === "interval" ? 100 : 2;

  const xForIndex = (index) => {
    if (sorted.length === 1) return padLeft + chartWidth / 2;
    return padLeft + (index / (sorted.length - 1)) * chartWidth;
  };

  const yForValue = (value) => {
    const normalized = Number(value) / maxY;
    return padTop + chartHeight - normalized * chartHeight;
  };

  const pathD = sorted
    .map((point, index) => {
      const x = xForIndex(index);
      const y = yForValue(point.value);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const ticks = mode === "interval" ? [0, 25, 50, 75, 100] : [0, 1, 2];

  return (
    <div
      style={{
        border: "1px solid #bfdbfe",
        borderRadius: "18px",
        padding: "16px",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
        marginBottom: "16px",
        boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          color: "#1e3a8a",
          marginBottom: "12px",
          fontSize: "18px",
        }}
      >
        {title}
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", minWidth: "620px", display: "block" }}
        >
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />
          <line
            x1={padLeft}
            y1={padTop + chartHeight}
            x2={padLeft + chartWidth}
            y2={padTop + chartHeight}
            stroke="#94a3b8"
            strokeWidth="1.5"
          />

          {ticks.map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + chartWidth}
                  y2={y}
                  stroke="#dbeafe"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 12}
                  y={y + 5}
                  fontSize="12"
                  textAnchor="end"
                  fill="#475569"
                >
                  {mode === "interval" ? `${tick}%` : tick}
                </text>
              </g>
            );
          })}

          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {sorted.map((point, index) => {
            const x = xForIndex(index);
            const y = yForValue(point.value);
            return (
              <g key={`${point.date}-${index}`}>
                <circle cx={x} cy={y} r="5.5" fill="#1d4ed8" />
                <text
                  x={x}
                  y={height - 10}
                  fontSize="11"
                  textAnchor="middle"
                  fill="#475569"
                >
                  {point.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        {mode === "interval"
          ? "Graph shows percent of intervals scored yes."
          : "0 = Not demonstrating • 1 = With prompts • 2 = Independent"}
      </div>
    </div>
  );
}

function App() {
  const [students, setStudents] = useState(() =>
    loadFromStorage("ramp_students", DEFAULT_STUDENTS)
  );

  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    loadFromStorage("ramp_selected_student", DEFAULT_STUDENTS[0]?.id || "")
  );

  const [selectedGoalId, setSelectedGoalId] = useState(() =>
    loadFromStorage("ramp_selected_goal", "")
  );

  const [showGoalDetails, setShowGoalDetails] = useState(() =>
    loadFromStorage("ramp_show_goal_details", true)
  );

  const [sessionData, setSessionData] = useState(() =>
    loadFromStorage("ramp_session_data", {})
  );

  const [history, setHistory] = useState(() =>
    loadFromStorage("ramp_session_history", [])
  );

  const [activeTab, setActiveTab] = useState(() =>
    loadFromStorage("ramp_active_tab", "dashboard")
  );

  const [studentForm, setStudentForm] = useState({
    name: "",
    grade: "",
    supportPerson: "",
    disabilities: [],
    setting: "",
  });

  useEffect(() => {
    localStorage.setItem("ramp_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("ramp_session_data", JSON.stringify(sessionData));
  }, [sessionData]);

  useEffect(() => {
    localStorage.setItem("ramp_session_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(
      "ramp_selected_student",
      JSON.stringify(selectedStudentId)
    );
  }, [selectedStudentId]);

  useEffect(() => {
    localStorage.setItem("ramp_selected_goal", JSON.stringify(selectedGoalId));
  }, [selectedGoalId]);

  useEffect(() => {
    localStorage.setItem(
      "ramp_show_goal_details",
      JSON.stringify(showGoalDetails)
    );
  }, [showGoalDetails]);

  useEffect(() => {
    localStorage.setItem("ramp_active_tab", JSON.stringify(activeTab));
  }, [activeTab]);

  const selectedStudent = useMemo(() => {
    return (
      students.find((student) => student.id === selectedStudentId) || students[0]
    );
  }, [students, selectedStudentId]);

  const selectedGoal = useMemo(() => {
    if (!selectedStudent) return null;
    return (
      selectedStudent.goals.find((goal) => goal.id === selectedGoalId) ||
      selectedStudent.goals[0] ||
      null
    );
  }, [selectedStudent, selectedGoalId]);

  useEffect(() => {
    if (!selectedStudent) {
      setSelectedGoalId("");
      return;
    }

    const hasSelectedGoal = selectedStudent.goals.some(
      (goal) => goal.id === selectedGoalId
    );

    if (!hasSelectedGoal) {
      setSelectedGoalId(selectedStudent.goals[0]?.id || "");
    }
  }, [selectedStudent, selectedGoalId]);

  const savedHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return history.filter((entry) => entry.studentId === selectedStudent.id);
  }, [history, selectedStudent]);

  const graphGroups = useMemo(() => {
    if (!selectedStudent) return [];

    return selectedStudent.goals.map((goal) => {
      const matching = savedHistory
        .filter((entry) => entry.goalId === goal.id)
        .map((entry) => ({
          date: entry.date,
          value:
            entry.collectionMethod === "interval"
              ? Number(entry.percent || 0)
              : Number(entry.score || 0),
        }));

      return {
        goalId: goal.id,
        title: goal.shortName || goal.title,
        points: matching,
        mode: goal.collectionMethod === "interval" ? "interval" : "rating",
      };
    });
  }, [selectedStudent, savedHistory]);

  const handleStudentFormChange = (e) => {
    const { name, value, options } = e.target;

    if (name === "disabilities") {
      const selectedValues = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => option.value);

      setStudentForm((prev) => ({
        ...prev,
        disabilities: selectedValues,
      }));
    } else {
      setStudentForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    const safeId = `student-${Date.now()}`;

    const newStudent = {
      id: safeId,
      name: studentForm.name.trim(),
      grade: studentForm.grade,
      supportPerson: studentForm.supportPerson.trim(),
      disabilities: studentForm.disabilities || [],
      setting: studentForm.setting || "",
      goals: [],
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(safeId);
    setSelectedGoalId("");
    setActiveTab("dashboard");

    setStudentForm({
      name: "",
      grade: "",
      supportPerson: "",
      disabilities: [],
      setting: "",
    });
  };

  const deleteStudent = (studentId) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const confirmed = window.confirm(
      `Delete ${student.name}? This removes the student profile from the app.`
    );
    if (!confirmed) return;

    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);
    setSelectedStudentId(updatedStudents[0]?.id || "");
    setSelectedGoalId(updatedStudents[0]?.goals?.[0]?.id || "");
  };

  const addGoalToStudent = () => {
    if (!selectedStudent) return;

    const title = window.prompt("Enter the full goal wording:");
    if (!title) return;

    const shortName = window.prompt("Enter short name/title for this goal:");
    const objective = window.prompt("Enter objective wording:", title);
    const example = window.prompt("Enter examples:");
    const baseline = window.prompt("Enter baseline data:");
    const mastery = window.prompt("Enter mastery criteria:");
    const methodPrompt = window.prompt(
      "Enter collection method: rating or interval",
      "rating"
    );

    const collectionMethod =
      methodPrompt && methodPrompt.toLowerCase() === "interval"
        ? "interval"
        : "rating";

    const newGoal = {
      id: `goal-${Date.now()}`,
      title,
      shortName: shortName || "",
      objective: objective || "",
      example: example || "",
      baseline: baseline || "",
      mastery: mastery || "",
      collectionMethod,
    };

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, goals: [...student.goals, newGoal] }
          : student
      )
    );

    setSelectedGoalId(newGoal.id);
  };

  const removeGoal = (goalId) => {
    if (!selectedStudent) return;

    const goal = selectedStudent.goals.find((g) => g.id === goalId);
    const confirmed = window.confirm(
      `Delete this goal${goal?.shortName ? `: ${goal.shortName}` : ""}?`
    );
    if (!confirmed) return;

    const updatedStudents = students.map((student) =>
      student.id === selectedStudent.id
        ? {
            ...student,
            goals: student.goals.filter((goalItem) => goalItem.id !== goalId),
          }
        : student
    );

    setStudents(updatedStudents);

    const updatedSelectedStudent =
      updatedStudents.find((s) => s.id === selectedStudent.id) || null;
    const nextGoalId = updatedSelectedStudent?.goals?.[0]?.id || "";
    setSelectedGoalId(nextGoalId);
  };

  const getGoalSessionKey = (studentId, goalId) => `${studentId}__${goalId}`;

  const getDefaultSessionForGoal = () => ({
    date: new Date().toISOString().slice(0, 10),
    location: "Classroom",
    collectedBy: "Teacher",
    score: "",
    promptLevel: "",
    notes: "",
    intervalType: "Whole Interval",
    sessionLength: 10,
    intervalLength: 1,
    intervalResults: Array(10).fill(""),
  });

  const syncIntervalArray = (existing, sessionLength, intervalLength) => {
    const totalIntervals = Math.max(
      1,
      Math.floor(Number(sessionLength || 0) / Number(intervalLength || 1))
    );
    const current = Array.isArray(existing) ? existing : [];
    if (current.length === totalIntervals) return current;
    if (current.length < totalIntervals) {
      return [...current, ...Array(totalIntervals - current.length).fill("")];
    }
    return current.slice(0, totalIntervals);
  };

  const handleSessionChange = (goal, field, value) => {
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id);

    setSessionData((prev) => {
      const current = prev[key] || getDefaultSessionForGoal();

      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "score" && value !== "1") {
        updated.promptLevel = "";
      }

      if (field === "sessionLength" || field === "intervalLength") {
        const sessionLength =
          field === "sessionLength"
            ? Number(value)
            : Number(updated.sessionLength);
        const intervalLength =
          field === "intervalLength"
            ? Number(value)
            : Number(updated.intervalLength);

        updated.intervalResults = syncIntervalArray(
          updated.intervalResults,
          sessionLength,
          intervalLength
        );
      }

      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  const handleIntervalResultChange = (goal, index, value) => {
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id);

    setSessionData((prev) => {
      const current = prev[key] || getDefaultSessionForGoal();
      const nextResults = [...(current.intervalResults || [])];
      nextResults[index] = value;

      return {
        ...prev,
        [key]: {
          ...current,
          intervalResults: nextResults,
        },
      };
    });
  };

  const saveSessionEntry = (goal) => {
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id);
    const entry = sessionData[key] || getDefaultSessionForGoal();

    if (goal.collectionMethod === "interval") {
      const sessionLength = Number(entry.sessionLength || 0);
      const intervalLength = Number(entry.intervalLength || 0);

      if (!sessionLength || !intervalLength) {
        alert("Please enter session length and interval length.");
        return;
      }

      const intervalResults = syncIntervalArray(
        entry.intervalResults,
        sessionLength,
        intervalLength
      );

      const totalIntervals = intervalResults.length;
      const yesCount = intervalResults.filter((x) => x === "yes").length;
      const percent = totalIntervals
        ? Math.round((yesCount / totalIntervals) * 100)
        : 0;

      const record = {
        id: `entry-${Date.now()}`,
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        grade: selectedStudent.grade || "",
        supportPerson: selectedStudent.supportPerson || "",
        disabilities: (selectedStudent.disabilities || []).join(", "),
        setting: selectedStudent.setting || "",
        goalId: goal.id,
        goalTitle: goal.title,
        shortName: goal.shortName || "",
        objective: goal.objective || "",
        date: entry.date || "",
        location: entry.location || "",
        collectedBy: entry.collectedBy || "",
        collectionMethod: "interval",
        intervalType: entry.intervalType || "Whole Interval",
        sessionLength,
        intervalLength,
        totalIntervals,
        intervalResults,
        yesCount,
        percent,
        notes: entry.notes || "",
      };

      setHistory((prev) => [...prev, record]);
      alert(`Saved interval data for ${goal.shortName || goal.title}: ${percent}%`);
      return;
    }

    if (entry.score === "") {
      alert("Please select a score before saving.");
      return;
    }

    const record = {
      id: `entry-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      grade: selectedStudent.grade || "",
      supportPerson: selectedStudent.supportPerson || "",
      disabilities: (selectedStudent.disabilities || []).join(", "),
      setting: selectedStudent.setting || "",
      goalId: goal.id,
      goalTitle: goal.title,
      shortName: goal.shortName || "",
      objective: goal.objective || "",
      date: entry.date || "",
      location: entry.location || "",
      collectedBy: entry.collectedBy || "",
      collectionMethod: "rating",
      score: entry.score || "",
      promptLevel: entry.score === "1" ? entry.promptLevel || "" : "",
      notes: entry.notes || "",
    };

    setHistory((prev) => [...prev, record]);
    alert(`Saved data for ${goal.shortName || goal.title}.`);
  };

  const exportCSV = () => {
    if (!history.length) {
      alert("No saved session data to export yet.");
      return;
    }

    const headers = [
      "Student Name",
      "Grade",
      "Support Person",
      "Disabilities",
      "Primary Setting",
      "Goal Title",
      "Short Name",
      "Objective",
      "Date",
      "Location",
      "Collected By",
      "Collection Method",
      "Score",
      "Prompt Level",
      "Interval Type",
      "Session Length",
      "Interval Length",
      "Total Intervals",
      "Yes Count",
      "Percent",
      "Notes",
    ];

    const rows = history.map((item) => [
      item.studentName,
      item.grade,
      item.supportPerson,
      item.disabilities,
      item.setting,
      item.goalTitle,
      item.shortName,
      item.objective,
      item.date,
      item.location ?? "",
      item.collectedBy ?? "",
      item.collectionMethod || "rating",
      item.score ?? "",
      item.promptLevel ?? "",
      item.intervalType ?? "",
      item.sessionLength ?? "",
      item.intervalLength ?? "",
      item.totalIntervals ?? "",
      item.yesCount ?? "",
      item.percent ?? "",
      item.notes ?? "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ramp_tracker_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllSavedSessions = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all saved session history?"
    );
    if (!confirmed) return;

    setHistory([]);
    alert("All saved session history has been cleared.");
  };

  const totalGoals = students.reduce(
    (sum, student) => sum + (student.goals?.length || 0),
    0
  );

  const styles = {
    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(180deg, #edf4ff 0%, #f6fbff 40%, #ffffff 100%)",
      color: "#1e293b",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: "24px",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    hero: {
      background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #60a5fa 100%)",
      color: "white",
      borderRadius: "24px",
      padding: "28px",
      boxShadow: "0 20px 50px rgba(37, 99, 235, 0.20)",
      marginBottom: "20px",
    },
    heroTitle: {
      fontSize: "34px",
      fontWeight: 800,
      margin: 0,
      letterSpacing: "-0.02em",
    },
    heroText: {
      marginTop: "10px",
      fontSize: "16px",
      opacity: 0.95,
      lineHeight: 1.5,
    },
    tabsWrap: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "20px",
    },
    tab: {
      padding: "12px 18px",
      borderRadius: "14px",
      border: "1px solid #bfdbfe",
      background: "white",
      color: "#1e3a8a",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
    },
    activeTab: {
      padding: "12px 18px",
      borderRadius: "14px",
      border: "1px solid #2563eb",
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "white",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 18px rgba(37, 99, 235, 0.18)",
    },
    layout: {
      display: "grid",
      gridTemplateColumns: "340px 1fr",
      gap: "24px",
      alignItems: "start",
    },
    sidebar: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    content: {
      minWidth: 0,
    },
    card: {
      background: "white",
      borderRadius: "22px",
      padding: "20px",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      border: "1px solid #dbeafe",
      marginBottom: "20px",
    },
    cardTitle: {
      margin: "0 0 16px 0",
      fontSize: "24px",
      fontWeight: 700,
      color: "#1e3a8a",
    },
    subTitle: {
      margin: "0 0 14px 0",
      fontSize: "20px",
      fontWeight: 700,
      color: "#1e3a8a",
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "7px",
      color: "#334155",
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      fontSize: "14px",
      boxSizing: "border-box",
      outline: "none",
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      fontSize: "14px",
      boxSizing: "border-box",
      minHeight: "90px",
      resize: "vertical",
      outline: "none",
      fontFamily: "inherit",
    },
    multiSelect: {
      width: "100%",
      padding: "10px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      background: "#ffffff",
      fontSize: "14px",
      boxSizing: "border-box",
      minHeight: "150px",
      outline: "none",
    },
    buttonPrimary: {
      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
      color: "white",
      border: "none",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 18px rgba(37, 99, 235, 0.20)",
    },
    buttonSecondary: {
      background: "#0f172a",
      color: "white",
      border: "none",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    buttonGreen: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      color: "white",
      border: "none",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 18px rgba(16, 185, 129, 0.18)",
    },
    buttonRed: {
      background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      color: "white",
      border: "none",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 10px 18px rgba(239, 68, 68, 0.18)",
    },
    buttonLight: {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
      borderRadius: "14px",
      padding: "10px 14px",
      fontSize: "14px",
      fontWeight: 700,
      cursor: "pointer",
    },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    },
    statCard: {
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "18px",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: 800,
      color: "#1d4ed8",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "14px",
      color: "#475569",
      fontWeight: 600,
    },
    studentCard: {
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "16px",
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
    },
    goalListCard: {
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "14px",
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
      marginBottom: "14px",
    },
    selectedGoalListCard: {
      border: "2px solid #2563eb",
      borderRadius: "18px",
      padding: "14px",
      background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
      marginBottom: "14px",
    },
    goalDetailsCard: {
      border: "1px solid #bfdbfe",
      borderRadius: "22px",
      padding: "18px",
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      marginBottom: "20px",
    },
    sessionBox: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "16px",
      marginTop: "18px",
    },
    sessionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
      marginBottom: "12px",
    },
    rowGap: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    tableWrap: {
      overflowX: "auto",
      borderRadius: "18px",
      border: "1px solid #dbeafe",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "14px",
      background: "white",
    },
    th: {
      textAlign: "left",
      padding: "14px",
      background: "#dbeafe",
      color: "#1e3a8a",
      fontWeight: 700,
      borderBottom: "1px solid #bfdbfe",
    },
    td: {
      padding: "14px",
      borderBottom: "1px solid #e2e8f0",
      verticalAlign: "top",
    },
    smallText: {
      fontSize: "12px",
      color: "#64748b",
      marginTop: "6px",
      lineHeight: 1.4,
    },
    intervalButton: (selected) => ({
      minWidth: "44px",
      padding: "10px 12px",
      borderRadius: "12px",
      border: selected ? "1px solid #2563eb" : "1px solid #cbd5e1",
      background: selected ? "#dbeafe" : "white",
      color: selected ? "#1d4ed8" : "#334155",
      fontWeight: 700,
      cursor: "pointer",
    }),
    infoBlock: {
      background: "#ffffff",
      border: "1px solid #dbeafe",
      borderRadius: "14px",
      padding: "14px",
      marginBottom: "12px",
    },
  };

  const renderStudentSelectorCard = () => (
    <div style={styles.card}>
      <h2 style={styles.subTitle}>Selected Student</h2>
      <select
        value={selectedStudent?.id || ""}
        onChange={(e) => {
          const nextStudentId = e.target.value;
          setSelectedStudentId(nextStudentId);
          const nextStudent = students.find((s) => s.id === nextStudentId);
          setSelectedGoalId(nextStudent?.goals?.[0]?.id || "");
        }}
        style={styles.input}
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>

      {selectedStudent && (
        <div style={{ marginTop: "16px", lineHeight: 1.7, fontSize: "14px" }}>
          <div>
            <strong>Name:</strong> {selectedStudent.name}
          </div>
          <div>
            <strong>Grade:</strong> {selectedStudent.grade || "-"}
          </div>
          <div>
            <strong>Support Person:</strong>{" "}
            {selectedStudent.supportPerson || "-"}
          </div>
          <div>
            <strong>Setting:</strong> {selectedStudent.setting || "-"}
          </div>
          <div>
            <strong>Disability / Eligibility:</strong>{" "}
            {selectedStudent.disabilities?.length
              ? selectedStudent.disabilities.join(", ")
              : "-"}
          </div>
          <div>
            <strong>Goals:</strong> {selectedStudent.goals?.length || 0}
          </div>
        </div>
      )}
    </div>
  );

  const renderDataOptionsCard = () => (
    <div style={styles.card}>
      <h2 style={styles.subTitle}>Data Options</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <button onClick={exportCSV} style={styles.buttonGreen}>
          Export CSV
        </button>

        <button
          onClick={() => alert("Printable reports coming next!")}
          style={styles.buttonPrimary}
        >
          Print Progress Report
        </button>

        <button onClick={clearAllSavedSessions} style={styles.buttonRed}>
          Clear Saved Session History
        </button>
      </div>
    </div>
  );

  const renderDashboardSidebar = () => (
    <div style={styles.sidebar}>
      <div
        style={{
          background: "linear-gradient(135deg, #16a34a, #22c55e)",
          color: "white",
          borderRadius: "20px",
          padding: "18px",
          boxShadow: "0 10px 25px rgba(34,197,94,0.25)",
        }}
      >
        <div style={{ fontSize: "20px", fontWeight: 800, marginBottom: "6px" }}>
          🎉 Founding Member Pricing
        </div>
        <div style={{ fontSize: "14px", marginBottom: "10px", opacity: 0.95 }}>
          Get full access to RaMP Tracker for <strong>$5/month</strong>. Lock in
          your price for life.
        </div>
        <button
          style={{
            background: "white",
            color: "#16a34a",
            border: "none",
            borderRadius: "10px",
            padding: "8px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={() =>
            alert("Payment integration coming next. You’ll be able to subscribe soon!")
          }
        >
          Upgrade Now
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subTitle}>Add Student</h2>
        <form onSubmit={addStudent}>
          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>Student Name</label>
            <input
              type="text"
              name="name"
              value={studentForm.name}
              onChange={handleStudentFormChange}
              style={styles.input}
              placeholder="Enter student name"
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>Grade</label>
            <select
              name="grade"
              value={studentForm.grade}
              onChange={handleStudentFormChange}
              style={styles.input}
            >
              <option value="">Select grade</option>
              {GRADE_OPTIONS.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>Support Person</label>
            <input
              type="text"
              name="supportPerson"
              value={studentForm.supportPerson}
              onChange={handleStudentFormChange}
              style={styles.input}
              placeholder="Teacher, parent, therapist, etc."
            />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>Primary Setting</label>
            <select
              name="setting"
              value={studentForm.setting}
              onChange={handleStudentFormChange}
              style={styles.input}
            >
              <option value="">Select setting</option>
              {SETTING_OPTIONS.map((setting) => (
                <option key={setting} value={setting}>
                  {setting}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Disability / Eligibility</label>
            <select
              name="disabilities"
              multiple
              value={studentForm.disabilities}
              onChange={handleStudentFormChange}
              style={styles.multiSelect}
            >
              {DISABILITY_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <div style={styles.smallText}>
              Hold Ctrl (Windows) or Command (Mac) to select more than one.
            </div>
          </div>

          <button type="submit" style={{ ...styles.buttonPrimary, width: "100%" }}>
            Add Student
          </button>
        </form>
      </div>

      {renderStudentSelectorCard()}
      {renderDataOptionsCard()}
    </div>
  );

  const renderStandardSidebar = () => (
    <div style={styles.sidebar}>
      {renderStudentSelectorCard()}
      {renderDataOptionsCard()}
    </div>
  );

  const renderDashboard = () => (
    <>
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Dashboard</h2>
        <div style={styles.summaryGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{students.length}</div>
            <div style={styles.statLabel}>Students</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{totalGoals}</div>
            <div style={styles.statLabel}>Total Goals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{history.length}</div>
            <div style={styles.statLabel}>Saved Data Entries</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>
              {selectedStudent ? selectedStudent.goals.length : 0}
            </div>
            <div style={styles.statLabel}>Goals for Selected Student</div>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div style={styles.card}>
          <div
            style={{
              ...styles.rowGap,
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ ...styles.subTitle, marginBottom: 0 }}>
              {selectedStudent.name}
            </h3>
            <button
              onClick={() => deleteStudent(selectedStudent.id)}
              style={styles.buttonRed}
            >
              Delete Student
            </button>
          </div>

          <div style={styles.studentCard}>
            <div style={{ lineHeight: 1.8 }}>
              <div>
                <strong>Grade:</strong> {selectedStudent.grade || "-"}
              </div>
              <div>
                <strong>Support Person:</strong>{" "}
                {selectedStudent.supportPerson || "-"}
              </div>
              <div>
                <strong>Setting:</strong> {selectedStudent.setting || "-"}
              </div>
              <div>
                <strong>Disability / Eligibility:</strong>{" "}
                {selectedStudent.disabilities?.length
                  ? selectedStudent.disabilities.join(", ")
                  : "-"}
              </div>
              <div>
                <strong>Number of Goals:</strong>{" "}
                {selectedStudent.goals?.length || 0}
              </div>
              <div>
                <strong>Saved Entries:</strong> {savedHistory.length}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.subTitle}>Progress Graphs</h3>
        {!selectedStudent ? (
          <div>No student selected.</div>
        ) : (
          graphGroups.map((group) => (
            <GraphCard
              key={group.goalId}
              title={group.title}
              points={group.points}
              mode={group.mode}
            />
          ))
        )}
      </div>
    </>
  );

  const renderSelectedGoalSessionBox = () => {
    if (!selectedStudent || !selectedGoal) {
      return (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Goals & Data</h2>
          <div>No goal selected.</div>
        </div>
      );
    }

    const key = getGoalSessionKey(selectedStudent.id, selectedGoal.id);
    const currentSession = sessionData[key] || getDefaultSessionForGoal();

    return (
      <div style={styles.goalDetailsCard}>
        <div
          style={{
            ...styles.rowGap,
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>
            Record Data
          </h2>
          <div style={styles.rowGap}>
            <button
              onClick={() => setShowGoalDetails((prev) => !prev)}
              style={styles.buttonLight}
            >
              {showGoalDetails ? "Hide Details" : "Show Details"}
            </button>
            <button onClick={() => removeGoal(selectedGoal.id)} style={styles.buttonRed}>
              Delete Goal
            </button>
          </div>
        </div>

        <div style={styles.infoBlock}>
          <div style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}>
            Full Goal
          </div>
          <div style={{ lineHeight: 1.6 }}>{selectedGoal.title}</div>
        </div>

        {showGoalDetails && (
          <>
            <div style={styles.infoBlock}>
              <div
                style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}
              >
                Objective
              </div>
              <div style={{ lineHeight: 1.6 }}>
                {selectedGoal.objective || "-"}
              </div>
            </div>

            <div style={styles.infoBlock}>
              <div
                style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}
              >
                Examples
              </div>
              <div style={{ lineHeight: 1.6 }}>{selectedGoal.example || "-"}</div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={styles.infoBlock}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    marginBottom: "8px",
                  }}
                >
                  Baseline
                </div>
                <div>{selectedGoal.baseline || "-"}</div>
              </div>

              <div style={styles.infoBlock}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    marginBottom: "8px",
                  }}
                >
                  Mastery
                </div>
                <div>{selectedGoal.mastery || "-"}</div>
              </div>
            </div>
          </>
        )}

        {selectedGoal.collectionMethod === "interval" ? (
          <div style={styles.sessionBox}>
            <div
              style={{
                fontWeight: 700,
                marginBottom: "12px",
                color: "#1e3a8a",
                fontSize: "17px",
              }}
            >
              Record Interval Data
            </div>

            <div style={styles.sessionGrid}>
              <div>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={currentSession.date}
                  onChange={(e) =>
                    handleSessionChange(selectedGoal, "date", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Location</label>
                <select
                  value={currentSession.location}
                  onChange={(e) =>
                    handleSessionChange(selectedGoal, "location", e.target.value)
                  }
                  style={styles.input}
                >
                  {SESSION_LOCATION_OPTIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Collected By</label>
                <select
                  value={currentSession.collectedBy}
                  onChange={(e) =>
                    handleSessionChange(
                      selectedGoal,
                      "collectedBy",
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  {COLLECTED_BY_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Interval Type</label>
                <select
                  value={currentSession.intervalType}
                  onChange={(e) =>
                    handleSessionChange(
                      selectedGoal,
                      "intervalType",
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  {INTERVAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Session Length (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={currentSession.sessionLength}
                  onChange={(e) =>
                    handleSessionChange(
                      selectedGoal,
                      "sessionLength",
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Interval Length (minutes)</label>
                <input
                  type="number"
                  min="1"
                  value={currentSession.intervalLength}
                  onChange={(e) =>
                    handleSessionChange(
                      selectedGoal,
                      "intervalLength",
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={styles.label}>Intervals</div>
              <div style={styles.smallText}>
                Score each interval yes or no. Total intervals:{" "}
                {
                  syncIntervalArray(
                    currentSession.intervalResults,
                    currentSession.sessionLength,
                    currentSession.intervalLength
                  ).length
                }
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                  gap: "10px",
                  marginTop: "12px",
                }}
              >
                {syncIntervalArray(
                  currentSession.intervalResults,
                  currentSession.sessionLength,
                  currentSession.intervalLength
                ).map((result, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #dbeafe",
                      borderRadius: "12px",
                      padding: "10px",
                      background: "white",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1e3a8a",
                        marginBottom: "8px",
                      }}
                    >
                      Interval {index + 1}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        style={styles.intervalButton(result === "yes")}
                        onClick={() =>
                          handleIntervalResultChange(selectedGoal, index, "yes")
                        }
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        style={styles.intervalButton(result === "no")}
                        onClick={() =>
                          handleIntervalResultChange(selectedGoal, index, "no")
                        }
                      >
                        No
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={currentSession.notes}
                onChange={(e) =>
                  handleSessionChange(selectedGoal, "notes", e.target.value)
                }
                style={styles.textarea}
                placeholder="Add notes about the session..."
              />
            </div>

            <button
              onClick={() => saveSessionEntry(selectedGoal)}
              style={styles.buttonPrimary}
            >
              Save Interval Session
            </button>
          </div>
        ) : (
          <div style={styles.sessionBox}>
            <div
              style={{
                fontWeight: 700,
                marginBottom: "12px",
                color: "#1e3a8a",
                fontSize: "17px",
              }}
            >
              Record Rating Scale Data
            </div>

            <div style={styles.sessionGrid}>
              <div>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={currentSession.date}
                  onChange={(e) =>
                    handleSessionChange(selectedGoal, "date", e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>Location</label>
                <select
                  value={currentSession.location}
                  onChange={(e) =>
                    handleSessionChange(selectedGoal, "location", e.target.value)
                  }
                  style={styles.input}
                >
                  {SESSION_LOCATION_OPTIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Collected By</label>
                <select
                  value={currentSession.collectedBy}
                  onChange={(e) =>
                    handleSessionChange(
                      selectedGoal,
                      "collectedBy",
                      e.target.value
                    )
                  }
                  style={styles.input}
                >
                  {COLLECTED_BY_OPTIONS.map((person) => (
                    <option key={person} value={person}>
                      {person}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>Score</label>
                <select
                  value={currentSession.score}
                  onChange={(e) =>
                    handleSessionChange(selectedGoal, "score", e.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">Select score</option>
                  <option value="0">0 = Not demonstrating</option>
                  <option value="1">1 = With prompts</option>
                  <option value="2">2 = Independent</option>
                </select>
              </div>

              {currentSession.score === "1" && (
                <div>
                  <label style={styles.label}>Prompt Level</label>
                  <select
                    value={currentSession.promptLevel}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        "promptLevel",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    <option value="">Select prompt</option>
                    {PROMPT_OPTIONS.map((prompt) => (
                      <option key={prompt} value={prompt}>
                        {prompt}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={currentSession.notes}
                onChange={(e) =>
                  handleSessionChange(selectedGoal, "notes", e.target.value)
                }
                style={styles.textarea}
                placeholder="Add notes about the session..."
              />
            </div>

            <button
              onClick={() => saveSessionEntry(selectedGoal)}
              style={styles.buttonPrimary}
            >
              Save Session
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGoals = () => {
    if (!selectedStudent) {
      return (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Goals & Data</h2>
          <div>No student selected.</div>
        </div>
      );
    }

    return (
      <>
        <div style={styles.card}>
          <div
            style={{
              ...styles.rowGap,
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Goals & Data</h2>
            <button onClick={addGoalToStudent} style={styles.buttonSecondary}>
              Add Goal
            </button>
          </div>

          {selectedStudent.goals.length === 0 ? (
            <div>No goals added for this student yet.</div>
          ) : (
            <div>
              <div style={styles.smallText}>
                Click a goal below to open its data collection form.
              </div>

              <div style={{ marginTop: "14px" }}>
                {selectedStudent.goals.map((goal) => {
                  const isSelected = selectedGoal?.id === goal.id;
                  return (
                    <div
                      key={goal.id}
                      style={
                        isSelected
                          ? styles.selectedGoalListCard
                          : styles.goalListCard
                      }
                      onClick={() => setSelectedGoalId(goal.id)}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e3a8a",
                          marginBottom: "8px",
                        }}
                      >
                        {goal.shortName || "Goal"}
                      </div>
                      <div style={{ lineHeight: 1.6 }}>{goal.title}</div>
                      <div style={styles.smallText}>
                        Method:{" "}
                        {goal.collectionMethod === "interval"
                          ? "Interval Data"
                          : "Rating Scale"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {renderSelectedGoalSessionBox()}
      </>
    );
  };

  const renderHistory = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>History</h2>

      {!selectedStudent ? (
        <div>No student selected.</div>
      ) : (
        <>
          <h3 style={styles.subTitle}>Progress Graphs</h3>
          {graphGroups.map((group) => (
            <GraphCard
              key={group.goalId}
              title={group.title}
              points={group.points}
              mode={group.mode}
            />
          ))}

          <h3 style={{ ...styles.subTitle, marginTop: "22px" }}>Saved Entries</h3>

          {!savedHistory.length ? (
            <div>No saved entries yet for this student.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Goal</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Collected By</th>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Score / %</th>
                    <th style={styles.th}>Prompt / Interval</th>
                    <th style={styles.th}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...savedHistory].reverse().map((entry) => (
                    <tr key={entry.id}>
                      <td style={styles.td}>{entry.date}</td>
                      <td style={styles.td}>
                        {entry.shortName || entry.goalTitle}
                      </td>
                      <td style={styles.td}>{entry.location || "-"}</td>
                      <td style={styles.td}>{entry.collectedBy || "-"}</td>
                      <td style={styles.td}>
                        {entry.collectionMethod === "interval"
                          ? "Interval"
                          : "Rating"}
                      </td>
                      <td style={styles.td}>
                        {entry.collectionMethod === "interval"
                          ? `${entry.percent ?? 0}%`
                          : entry.score}
                      </td>
                      <td style={styles.td}>
                        {entry.collectionMethod === "interval"
                          ? `${entry.intervalType || "-"} (${entry.yesCount ?? 0}/${entry.totalIntervals ?? 0})`
                          : entry.promptLevel || "-"}
                      </td>
                      <td style={styles.td}>{entry.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, textarea, button { font: inherit; }
        input:focus, select:focus, textarea:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        button:hover { filter: brightness(0.98); }

        @media (max-width: 1100px) {
          .ramp-layout {
            display: flex !important;
            flex-direction: column !important;
          }
          .ramp-content {
            order: 1 !important;
          }
          .ramp-sidebar {
            order: 2 !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>RaMP Tracker</h1>
          <div style={styles.heroText}>
            Track progress. Build skills. Support growth across school, home,
            and therapy using clear prompt-level and interval data.
          </div>
        </div>

        <div style={styles.tabsWrap}>
          <button
            style={activeTab === "dashboard" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            style={activeTab === "goals" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("goals")}
          >
            Goals & Data
          </button>
          <button
            style={activeTab === "history" ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        <div className="ramp-layout" style={styles.layout}>
          <div className="ramp-sidebar">
            {activeTab === "dashboard"
              ? renderDashboardSidebar()
              : renderStandardSidebar()}
          </div>

          <div className="ramp-content" style={styles.content}>
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "goals" && renderGoals()}
            {activeTab === "history" && renderHistory()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
