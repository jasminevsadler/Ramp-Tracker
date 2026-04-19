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

const PROMPT_OPTIONS = [
  "Gestural",
  "Verbal",
  "Model",
  "Partial Physical",
  "Full Physical",
];

const DEFAULT_STUDENTS = [
  {
    id: "student-johnny",
    name: "Johnny",
    grade: "3",
    caseManager: "Ms. Williams",
    disabilities: ["Autism", "ADHD"],
    goals: [
      {
        id: "goal-following-directions",
        title: "Following Directions",
        shortName: "Directions",
        objective:
          "When given a verbal reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location.",
        example:
          "Examples: starts work after teacher says 'Please begin,' lines up when directed, puts materials away after one reminder.",
        baseline: "0/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
      },
      {
        id: "goal-calm-frustration",
        title: "Maintaining Calm During Frustration",
        shortName: "Calm",
        objective:
          "During times of frustration, Johnny will use a calm strategy such as deep breathing, asking for help, requesting a break, or using kind words instead of yelling, refusing, or shutting down.",
        example:
          "Examples: asks for help when confused, takes a breathing break, says 'I need a minute,' uses calm words instead of arguing.",
        baseline: "1/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
      },
      {
        id: "goal-peer-interactions",
        title: "Positive Peer Interactions",
        shortName: "Peer Interaction",
        objective:
          "During structured and unstructured activities, Johnny will engage in positive peer interactions by greeting peers, sharing materials, taking turns, joining activities appropriately, or responding kindly.",
        example:
          "Examples: says hello, asks to play, shares supplies, takes turns in a game, uses kind responses with classmates.",
        baseline: "2/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
      },
      {
        id: "goal-staying-focused",
        title: "Staying Focused to Complete Tasks",
        shortName: "Focus",
        objective:
          "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        example:
          "Examples: keeps working during independent work, finishes a class assignment, returns to task after distraction, completes steps of an activity.",
        baseline: "1/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
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

function App() {
  const [students, setStudents] = useState(() =>
    loadFromStorage("ramp_students", DEFAULT_STUDENTS)
  );

  const [selectedStudentId, setSelectedStudentId] = useState(
    () =>
      loadFromStorage("ramp_selected_student", DEFAULT_STUDENTS[0]?.id || "") ||
      DEFAULT_STUDENTS[0]?.id ||
      ""
  );

  const [sessionData, setSessionData] = useState(() =>
    loadFromStorage("ramp_session_data", {})
  );

  const [studentForm, setStudentForm] = useState({
    name: "",
    grade: "",
    caseManager: "",
    disabilities: [],
  });

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

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId),
    [students, selectedStudentId]
  );

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
      caseManager: studentForm.caseManager.trim(),
      disabilities: studentForm.disabilities || [],
      goals: [],
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(safeId);

    setStudentForm({
      name: "",
      grade: "",
      caseManager: "",
      disabilities: [],
    });
  };

  const addGoalToStudent = () => {
    if (!selectedStudent) return;

    const title = window.prompt("Enter goal title:");
    if (!title) return;

    const shortName = window.prompt("Enter short name for the goal/objective:");
    const objective = window.prompt("Enter objective wording:");
    const example = window.prompt("Enter examples:");
    const baseline = window.prompt("Enter baseline data:");
    const mastery = window.prompt("Enter mastery criteria:");

    const newGoal = {
      id: `goal-${Date.now()}`,
      title,
      shortName: shortName || "",
      objective: objective || "",
      example: example || "",
      baseline: baseline || "",
      mastery: mastery || "",
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

  const handleSessionChange = (goalId, field, value) => {
    if (!selectedStudent) return;

    const key = getGoalSessionKey(selectedStudent.id, goalId);

    setSessionData((prev) => {
      const current = prev[key] || {
        date: new Date().toISOString().slice(0, 10),
        score: "",
        promptLevel: "",
        notes: "",
      };

      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "score" && value !== "1") {
        updated.promptLevel = "";
      }

      return {
        ...prev,
        [key]: updated,
      };
    });
  };

  const saveSessionEntry = (goal) => {
    if (!selectedStudent) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id);
    const entry = sessionData[key];

    if (!entry || entry.score === "") {
      alert("Please select a score before saving.");
      return;
    }

    const historyKey = "ramp_session_history";
    const existingHistory = loadFromStorage(historyKey, []);

    const record = {
      id: `entry-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      grade: selectedStudent.grade || "",
      caseManager: selectedStudent.caseManager || "",
      disabilities: (selectedStudent.disabilities || []).join(", "),
      goalId: goal.id,
      goalTitle: goal.title,
      shortName: goal.shortName || "",
      objective: goal.objective || "",
      date: entry.date || "",
      score: entry.score || "",
      promptLevel: entry.score === "1" ? entry.promptLevel || "" : "",
      notes: entry.notes || "",
    };

    const updatedHistory = [...existingHistory, record];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));

    alert(`Saved data for ${goal.title}.`);
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
      "Case Manager",
      "Disabilities",
      "Goal Title",
      "Short Name",
      "Objective",
      "Date",
      "Score",
      "Prompt Level",
      "Notes",
    ];

    const rows = history.map((item) => [
      item.studentName,
      item.grade,
      item.caseManager,
      item.disabilities,
      item.goalTitle,
      item.shortName,
      item.objective,
      item.date,
      item.score,
      item.promptLevel,
      item.notes,
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

  const savedHistory = loadFromStorage("ramp_session_history", []).filter(
    (entry) => entry.studentId === selectedStudentId
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
      marginBottom: "24px",
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
    grid: {
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
    card: {
      background: "white",
      borderRadius: "22px",
      padding: "20px",
      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
      border: "1px solid #dbeafe",
    },
    cardTitle: {
      margin: "0 0 16px 0",
      fontSize: "22px",
      fontWeight: 700,
      color: "#1e3a8a",
    },
    sectionTitle: {
      margin: "0 0 18px 0",
      fontSize: "24px",
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
    smallText: {
      fontSize: "12px",
      color: "#64748b",
      marginTop: "6px",
      lineHeight: 1.4,
    },
    buttonPrimary: {
      width: "100%",
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
      width: "100%",
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
      width: "100%",
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
    goalCard: {
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
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "18px",
      flexWrap: "wrap",
    },
    studentSummary: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "16px",
      padding: "14px",
      marginTop: "16px",
      lineHeight: 1.7,
      fontSize: "14px",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
    },
    sessionGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: "12px",
      marginBottom: "12px",
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
    deleteButton: {
      background: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "10px 14px",
      fontSize: "13px",
      fontWeight: 700,
      cursor: "pointer",
      alignSelf: "flex-start",
    },
  };

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
          .ramp-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 700px) {
          .ramp-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>RaMP Tracker</h1>
          <div style={styles.heroText}>
            Track student goals with clean visuals, simple data collection, prompt levels,
            examples, and exportable records.
          </div>
        </div>

        <div className="ramp-grid" style={styles.grid}>
          <div style={styles.sidebar}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Add Student</h2>

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
                  <label style={styles.label}>Case Manager</label>
                  <input
                    type="text"
                    name="caseManager"
                    value={studentForm.caseManager}
                    onChange={handleStudentFormChange}
                    style={styles.input}
                    placeholder="Enter case manager"
                  />
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

                <button type="submit" style={styles.buttonPrimary}>
                  Add Student
                </button>
              </form>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Select Student</h2>

              <select
                value={selectedStudentId}
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
                <div style={styles.studentSummary}>
                  <div><strong>Name:</strong> {selectedStudent.name}</div>
                  <div><strong>Grade:</strong> {selectedStudent.grade || "-"}</div>
                  <div><strong>Case Manager:</strong> {selectedStudent.caseManager || "-"}</div>
                  <div>
                    <strong>Disability / Eligibility:</strong>{" "}
                    {selectedStudent.disabilities?.length
                      ? selectedStudent.disabilities.join(", ")
                      : "-"}
                  </div>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>Data Options</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <button onClick={exportCSV} style={styles.buttonGreen}>
                  Export CSV
                </button>

                <button onClick={clearAllSavedSessions} style={styles.buttonRed}>
                  Clear Saved Session History
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={styles.card}>
              <div style={styles.topBar}>
                <h2 style={styles.sectionTitle}>Goals & Objectives</h2>
                <button onClick={addGoalToStudent} style={styles.buttonSecondary}>
                  Add Goal
                </button>
              </div>

              {!selectedStudent ? (
                <div>No student selected.</div>
              ) : selectedStudent.goals.length === 0 ? (
                <div>No goals added for this student yet.</div>
              ) : (
                <div>
                  {selectedStudent.goals.map((goal) => {
                    const key = getGoalSessionKey(selectedStudent.id, goal.id);
                    const currentSession = sessionData[key] || {
                      date: new Date().toISOString().slice(0, 10),
                      score: "",
                      promptLevel: "",
                      notes: "",
                    };

                    return (
                      <div key={goal.id} style={styles.goalCard}>
                        <div
                          className="ramp-two-col"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto",
                            gap: "14px",
                            alignItems: "start",
                          }}
                        >
                          <div>
                            <div style={{ marginBottom: "12px" }}>
                              <label style={styles.label}>Goal Title</label>
                              <input
                                type="text"
                                value={goal.title}
                                onChange={(e) =>
                                  updateGoalField(goal.id, "title", e.target.value)
                                }
                                style={styles.input}
                              />
                            </div>

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
                              <label style={styles.label}>Objective</label>
                              <textarea
                                value={goal.objective || ""}
                                onChange={(e) =>
                                  updateGoalField(goal.id, "objective", e.target.value)
                                }
                                style={{ ...styles.textarea, minHeight: "110px" }}
                              />
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                              <label style={styles.label}>Examples</label>
                              <textarea
                                value={goal.example || ""}
                                onChange={(e) =>
                                  updateGoalField(goal.id, "example", e.target.value)
                                }
                                style={{ ...styles.textarea, minHeight: "90px" }}
                              />
                            </div>

                            <div className="ramp-two-col" style={styles.twoCol}>
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

                          <button
                            onClick={() => removeGoal(goal.id)}
                            style={styles.deleteButton}
                          >
                            Delete Goal
                          </button>
                        </div>

                        <div style={styles.sessionBox}>
                          <div
                            style={{
                              fontWeight: 700,
                              marginBottom: "12px",
                              color: "#1e3a8a",
                              fontSize: "17px",
                            }}
                          >
                            Record Session Data
                          </div>

                          <div style={styles.sessionGrid}>
                            <div>
                              <label style={styles.label}>Date</label>
                              <input
                                type="date"
                                value={currentSession.date}
                                onChange={(e) =>
                                  handleSessionChange(goal.id, "date", e.target.value)
                                }
                                style={styles.input}
                              />
                            </div>

                            <div>
                              <label style={styles.label}>Score</label>
                              <select
                                value={currentSession.score}
                                onChange={(e) =>
                                  handleSessionChange(goal.id, "score", e.target.value)
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
                                      goal.id,
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
                                handleSessionChange(goal.id, "notes", e.target.value)
                              }
                              style={styles.textarea}
                              placeholder="Add notes about the session..."
                            />
                          </div>

                          <button
                            onClick={() => saveSessionEntry(goal)}
                            style={{
                              ...styles.buttonPrimary,
                              width: "auto",
                              padding: "12px 18px",
                            }}
                          >
                            Save Session
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Saved History</h2>

              {!savedHistory.length ? (
                <div>No saved entries yet for this student.</div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Goal</th>
                        <th style={styles.th}>Short Name</th>
                        <th style={styles.th}>Score</th>
                        <th style={styles.th}>Prompt</th>
                        <th style={styles.th}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...savedHistory].reverse().map((entry) => (
                        <tr key={entry.id}>
                          <td style={styles.td}>{entry.date}</td>
                          <td style={styles.td}>{entry.goalTitle}</td>
                          <td style={styles.td}>{entry.shortName}</td>
                          <td style={styles.td}>{entry.score}</td>
                          <td style={styles.td}>{entry.promptLevel || "-"}</td>
                          <td style={styles.td}>{entry.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
