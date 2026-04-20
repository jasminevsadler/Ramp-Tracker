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
        title:
          "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
        shortName: "Directions",
        objective:
          "Johnny will respond to reminders within 30 seconds across settings.",
        example:
          "Examples: starts work after teacher says 'Please begin,' lines up when directed, puts materials away after one reminder.",
        baseline: "0/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-calm-frustration",
        title:
          "During times of frustration, Johnny will use a calm strategy such as deep breathing, asking for help, requesting a break, or using kind words instead of yelling, refusing, or shutting down.",
        shortName: "Calm",
        objective:
          "Johnny will use an appropriate calm-down strategy instead of problem behavior.",
        example:
          "Examples: asks for help when confused, takes a breathing break, says 'I need a minute,' uses calm words instead of arguing.",
        baseline: "1/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-peer-interactions",
        title:
          "During structured and unstructured activities, Johnny will engage in positive peer interactions by greeting peers, sharing materials, taking turns, joining activities appropriately, or responding kindly.",
        shortName: "Peer Interaction",
        objective:
          "Johnny will engage in appropriate positive peer interactions.",
        example:
          "Examples: says hello, asks to play, shares supplies, takes turns in a game, uses kind responses with classmates.",
        baseline: "2/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-staying-focused",
        title:
          "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        shortName: "Focus",
        objective:
          "Johnny will stay on task and complete expected work components during work periods.",
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

  const [sessionData, setSessionData] = useState(() =>
    loadFromStorage("ramp_session_data", {})
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

  const [activeGoalId, setActiveGoalId] = useState(null);
  const [expandedObjectiveId, setExpandedObjectiveId] = useState(null);

  useEffect(() => {
    localStorage.setItem("ramp_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("ramp_session_data", JSON.stringify(sessionData));
  }, [sessionData]);

  useEffect(() => {
    localStorage.setItem(
      "ramp_selected_student",
      JSON.stringify(selectedStudentId)
    );
  }, [selectedStudentId]);

  useEffect(() => {
    localStorage.setItem("ramp_active_tab", JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    setActiveGoalId(null);
    setExpandedObjectiveId(null);
  }, [selectedStudentId]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const allHistory = loadFromStorage("ramp_session_history", []);
  const savedHistory = allHistory.filter(
    (entry) => entry.studentId === selectedStudent?.id
  );

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
    if (!studentId) return;
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const confirmed = window.confirm(
      `Delete ${student.name}? This removes the student profile from the app.`
    );
    if (!confirmed) return;

    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);
    setSelectedStudentId(updatedStudents[0]?.id || "");
  };

  const addGoalToStudent = () => {
    if (!selectedStudent) return;

    const title = window.prompt("Enter the full goal:");
    if (!title) return;

    const shortName = window.prompt("Enter short name for the goal:");
    const objective = window.prompt("Enter objective wording:");
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
  };

  const removeGoal = (goalId) => {
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.filter((goal) => goal.id !== goalId),
            }
          : student
      )
    );

    if (activeGoalId === goalId) {
      setActiveGoalId(null);
      setExpandedObjectiveId(null);
    }
  };

  const updateGoalField = (goalId, field, value) => {
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.map((goal) =>
                goal.id === goalId ? { ...goal, [field]: value } : goal
              ),
            }
          : student
      )
    );
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
    if (!selectedStudent) return;

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
          field === "sessionLength" ? Number(value) : Number(updated.sessionLength);
        const intervalLength =
          field === "intervalLength" ? Number(value) : Number(updated.intervalLength);

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
    if (!selectedStudent) return;

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
    if (!selectedStudent) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id);
    const entry = sessionData[key] || getDefaultSessionForGoal();

    const historyKey = "ramp_session_history";
    const existingHistory = loadFromStorage(historyKey, []);

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

      localStorage.setItem(
        historyKey,
        JSON.stringify([...existingHistory, record])
      );
      alert(`Saved interval data for ${goal.shortName || "goal"}: ${percent}%`);
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

    localStorage.setItem(
      historyKey,
      JSON.stringify([...existingHistory, record])
    );
    alert(`Saved data for ${goal.shortName || "goal"}.`);
  };

  const exportCSV = () => {
    const history = loadFromStorage("ramp_session_history", []);

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

    localStorage.removeItem("ramp_session_history");
    alert("All saved session history has been cleared.");
  };

  const renderAddStudentCard = () => (
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
  );

  const renderSelectedStudentCard = () => (
    <div style={styles.card}>
      <h2 style={styles.subTitle}>Selected Student</h2>
      <select
        value={selectedStudent?.id || ""}
        onChange={(e) => setSelectedStudentId(e.target.value)}
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
          <div><strong>Name:</strong> {selectedStudent.name}</div>
          <div><strong>Grade:</strong> {selectedStudent.grade || "-"}</div>
          <div><strong>Support Person:</strong> {selectedStudent.supportPerson || "-"}</div>
          <div><strong>Setting:</strong> {selectedStudent.setting || "-"}</div>
          <div><strong>Goals:</strong> {selectedStudent.goals?.length || 0}</div>
          <div><strong>Saved Entries:</strong> {savedHistory.length}</div>
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

        <button
          onClick={() => deleteStudent(selectedStudent?.id)}
          style={styles.buttonRed}
          disabled={!selectedStudent}
        >
          Delete Selected Student
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>Dashboard</h2>

      {!selectedStudent ? (
        <div>No student selected.</div>
      ) : (
        <div style={styles.summaryGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{selectedStudent.name}</div>
            <div style={styles.statLabel}>Selected Student</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{selectedStudent.goals.length}</div>
            <div style={styles.statLabel}>Number of Goals</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{savedHistory.length}</div>
            <div style={styles.statLabel}>Saved Entries</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGoals = () => {
    if (!selectedStudent) {
      return (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Goals & Data</h2>
          <div>No student selected.</div>
        </div>
      );
    }

    if (!activeGoalId) {
      return (
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
            selectedStudent.goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setActiveGoalId(goal.id)}
                style={styles.goalSelectCard}
              >
                <div
                  style={{
                    fontWeight: 700,
                    color: "#1e3a8a",
                    marginBottom: "6px",
                  }}
                >
                  {goal.shortName || "Goal"}
                </div>
                <div style={{ lineHeight: 1.5 }}>{goal.title}</div>
              </div>
            ))
          )}
        </div>
      );
    }

    const goal = selectedStudent.goals.find((g) => g.id === activeGoalId);
    if (!goal) {
      return (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Goals & Data</h2>
          <div>Goal not found.</div>
        </div>
      );
    }

    const key = getGoalSessionKey(selectedStudent.id, goal.id);
    const currentSession = sessionData[key] || getDefaultSessionForGoal();

    return (
      <div style={styles.card}>
        <div style={{ ...styles.rowGap, justifyContent: "space-between", marginBottom: "16px" }}>
          <button
            onClick={() => {
              setActiveGoalId(null);
              setExpandedObjectiveId(null);
            }}
            style={styles.buttonSecondary}
          >
            ← Back to Goals
          </button>

          <button
            onClick={() => removeGoal(goal.id)}
            style={styles.buttonRed}
          >
            Delete Goal
          </button>
        </div>

        <div style={styles.goalCard}>
          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Short Name</label>
            <input
              type="text"
              value={goal.shortName || ""}
              onChange={(e) =>
                updateGoalField(goal.id, "shortName", e.target.value)
              }
              style={styles.input}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Full Goal</label>
            <textarea
              value={goal.title}
              onChange={(e) =>
                updateGoalField(goal.id, "title", e.target.value)
              }
              style={{ ...styles.textarea, minHeight: "100px" }}
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Collection Method</label>
            <select
              value={goal.collectionMethod || "rating"}
              onChange={(e) =>
                updateGoalField(goal.id, "collectionMethod", e.target.value)
              }
              style={styles.input}
            >
              {COLLECTION_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method === "rating" ? "Rating Scale" : "Interval Data"}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <button
              onClick={() =>
                setExpandedObjectiveId(
                  expandedObjectiveId === goal.id ? null : goal.id
                )
              }
              style={styles.buttonSecondary}
            >
              {expandedObjectiveId === goal.id
                ? "Hide Objective & Details"
                : "Show Objective & Details"}
            </button>
          </div>

          {expandedObjectiveId === goal.id && (
            <div
              style={{
                border: "1px solid #dbeafe",
                borderRadius: "14px",
                padding: "16px",
                background: "#f8fbff",
                marginBottom: "16px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label style={styles.label}>Objective</label>
                <textarea
                  value={goal.objective || ""}
                  onChange={(e) =>
                    updateGoalField(goal.id, "objective", e.target.value)
                  }
                  style={styles.textarea}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={styles.label}>Examples</label>
                <textarea
                  value={goal.example || ""}
                  onChange={(e) =>
                    updateGoalField(goal.id, "example", e.target.value)
                  }
                  style={styles.textarea}
                />
              </div>

              <div style={styles.sessionGrid}>
                <div>
                  <label style={styles.label}>Baseline</label>
                  <input
                    type="text"
                    value={goal.baseline || ""}
                    onChange={(e) =>
                      updateGoalField(goal.id, "baseline", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Mastery</label>
                  <input
                    type="text"
                    value={goal.mastery || ""}
                    onChange={(e) =>
                      updateGoalField(goal.id, "mastery", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {goal.collectionMethod === "interval" ? (
            <div style={styles.sessionBox}>
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: "12px",
                  color: "#1e3a8a",
                  fontSize: "17px",
                }}
              >
                Record Data
              </div>

              <div style={styles.sessionGrid}>
                <div>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={currentSession.date}
                    onChange={(e) =>
                      handleSessionChange(goal, "date", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Location</label>
                  <select
                    value={currentSession.location}
                    onChange={(e) =>
                      handleSessionChange(goal, "location", e.target.value)
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
                      handleSessionChange(goal, "collectedBy", e.target.value)
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
                      handleSessionChange(goal, "intervalType", e.target.value)
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
                      handleSessionChange(goal, "sessionLength", e.target.value)
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
                      handleSessionChange(goal, "intervalLength", e.target.value)
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
                            handleIntervalResultChange(goal, index, "yes")
                          }
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          style={styles.intervalButton(result === "no")}
                          onClick={() =>
                            handleIntervalResultChange(goal, index, "no")
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
                    handleSessionChange(goal, "notes", e.target.value)
                  }
                  style={styles.textarea}
                  placeholder="Add notes about the session..."
                />
              </div>

              <button
                onClick={() => saveSessionEntry(goal)}
                style={styles.buttonPrimary}
              >
                Save
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
                Record Data
              </div>

              <div style={styles.sessionGrid}>
                <div>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={currentSession.date}
                    onChange={(e) =>
                      handleSessionChange(goal, "date", e.target.value)
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Location</label>
                  <select
                    value={currentSession.location}
                    onChange={(e) =>
                      handleSessionChange(goal, "location", e.target.value)
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
                      handleSessionChange(goal, "collectedBy", e.target.value)
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
                      handleSessionChange(goal, "score", e.target.value)
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
                        handleSessionChange(goal, "promptLevel", e.target.value)
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
                    handleSessionChange(goal, "notes", e.target.value)
                  }
                  style={styles.textarea}
                  placeholder="Add notes about the session..."
                />
              </div>

              <button
                onClick={() => saveSessionEntry(goal)}
                style={styles.buttonPrimary}
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
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
                      <td style={styles.td}>{entry.shortName || entry.goalTitle}</td>
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

        .ramp-desktop-layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          align-items: start;
        }

        .ramp-mobile-stack {
          display: none;
        }

        @media (max-width: 1100px) {
          .ramp-desktop-layout {
            display: none !important;
          }

          .ramp-mobile-stack {
            display: block !important;
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

        {/* Desktop layout */}
        <div className="ramp-desktop-layout">
          <div style={styles.sidebar}>
            {activeTab === "dashboard" && renderAddStudentCard()}
            {renderSelectedStudentCard()}
            {renderDataOptionsCard()}
          </div>

          <div style={styles.content}>
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "goals" && renderGoals()}
            {activeTab === "history" && renderHistory()}
          </div>
        </div>

        {/* Mobile layout */}
        <div className="ramp-mobile-stack">
          {activeTab === "dashboard" && renderAddStudentCard()}
          {renderSelectedStudentCard()}

          <div style={styles.content}>
            {activeTab === "dashboard" && renderDashboard()}
            {activeTab === "goals" && renderGoals()}
            {activeTab === "history" && renderHistory()}
          </div>

          {renderDataOptionsCard()}
        </div>
      </div>
    </div>
  );
}

export default App;
