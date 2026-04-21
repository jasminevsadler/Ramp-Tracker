
import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "students";

const DEMO_STUDENTS = [
  {
    id: "demo-1",
    Demo Mode — Start with Johnny → review the goal → scroll to see progress over time.
    name: "Johnny",
    grade: "3",
    goals: [
      {
        id: "goal-1",
        title: "Following Directions",
        shortName: "Follow Directions",
        baseline:
          "Johnny currently requires 2–3 prompts to begin tasks and completes directions independently in about 40% of opportunities.",
        mastery:
          "Johnny will begin tasks within 30 seconds independently in 80% of opportunities across 3 consecutive sessions.",
        collectionMethod: "Teacher observation and frequency count",
        examples:
          "Begin work after instruction, line up when asked, transition to centers, put materials away, and start independent work.",
        entries: [
          { id: "j-1", date: "2026-04-10", score: 1, note: "Needed one verbal reminder before starting math." },
          { id: "j-2", date: "2026-04-11", score: 1, note: "Teacher modeled how to start the task." },
          { id: "j-3", date: "2026-04-14", score: 2, note: "Began work independently after instruction." },
          { id: "j-4", date: "2026-04-15", score: 2, note: "Transitioned to centers without prompts." },
          { id: "j-5", date: "2026-04-16", score: 2, note: "Started independent work right away." }
        ]
      }
    ]
  },
  {
    id: "demo-2",
    name: "Mia",
    grade: "5",
    goals: [
      {
        id: "goal-2",
        title: "Accepting Feedback",
        shortName: "Accept Feedback",
        baseline:
          "Mia often argues or shuts down when corrected during academic tasks.",
        mastery:
          "Mia will accept feedback appropriately in 4 out of 5 opportunities across 3 consecutive sessions.",
        collectionMethod: "Teacher observation",
        examples:
          "Saying 'okay,' correcting work, continuing the task, and responding calmly to redirection.",
        entries: [
          { id: "m-1", date: "2026-04-09", score: 1, note: "Needed modeled response before correcting work." },
          { id: "m-2", date: "2026-04-12", score: 1, note: "Accepted redirection after one reminder." },
          { id: "m-3", date: "2026-04-14", score: 2, note: "Corrected assignment appropriately." },
          { id: "m-4", date: "2026-04-16", score: 2, note: "Accepted feedback and continued working independently." }
        ]
      }
    ]
  }
];
<button
  onClick={() => {
    if (isDemoMode) {
      demoBlocked("Recording data");
      return;
    }
    alert("This is where you would record data.");
  }}
  style={{
    marginTop: 10,
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  Record Data
</button>

<p style={{ marginTop: 10, fontWeight: "bold", color: "#16a34a" }}>
  Progress is improving — prompts are decreasing and independence is increasing.
</p>

function scoreLabel(score) {
  if (score === 2) return "Independent";
  if (score === 1) return "With prompts";
  return "Not demonstrating";
}

function scoreBadgeStyle(score) {
  if (score === 2) {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac"
    };
  }
  if (score === 1) {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fcd34d"
    };
  }
  return {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5"
  };
}

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAccessScreen, setShowAccessScreen] = useState(true);

  useEffect(() => {
    if (!isDemoMode) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStudents(Array.isArray(parsed) ? parsed : []);
        } catch (error) {
          console.error("Could not parse saved students", error);
          setStudents([]);
        }
      }
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
  }, [students, isDemoMode]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const startDemoMode = () => {
    setStudents(DEMO_STUDENTS);
    setSelectedStudentId(DEMO_STUDENTS[0]?.id ?? null);
    setIsDemoMode(true);
    setShowAccessScreen(false);
  };

  const startFullApp = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    let parsed = [];
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (error) {
        console.error("Could not parse saved students", error);
      }
    }

    setStudents(Array.isArray(parsed) ? parsed : []);
    setSelectedStudentId(Array.isArray(parsed) && parsed[0] ? parsed[0].id : null);
    setIsDemoMode(false);
    setShowAccessScreen(false);
  };

  const resetToHome = () => {
    setShowAccessScreen(true);
    setSelectedStudentId(null);
  };

  const demoBlocked = (feature = "This feature") => {
    alert(`${feature} is locked in Demo Mode.`);
  };

  const addStudent = () => {
    if (isDemoMode) {
      demoBlocked("Adding students");
      return;
    }

    const name = window.prompt("Enter student name");
    if (!name || !name.trim()) return;

    const grade = window.prompt("Enter grade (optional)") || "";

    const newStudent = {
      id: String(Date.now()),
      name: name.trim(),
      grade: grade.trim(),
      goals: []
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
  };

  const appShellStyle = {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a"
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
    border: "1px solid #e2e8f0"
  };

  if (showAccessScreen) {
    return (
      <div style={{ ...appShellStyle, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ ...cardStyle, maxWidth: 900, width: "100%", padding: 32 }}>
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 16
                }}
              >
                RaMP Tracker
              </div>

              <h1 style={{ fontSize: 34, lineHeight: 1.1, margin: "0 0 12px 0" }}>
                Let people preview the app without giving away the full product.
              </h1>

              <p style={{ color: "#475569", fontSize: 17, lineHeight: 1.6, margin: 0 }}>
                Demo Mode shows sample students, sample goals, and real-looking progress data.
                Full App is where your own students live.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 24 }}>
                <button
                  onClick={startDemoMode}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    borderRadius: 14,
                    padding: "14px 18px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Try Demo
                </button>

                <button
                  onClick={startFullApp}
                  style={{
                    background: "#fff",
                    color: "#0f172a",
                    border: "1px solid #cbd5e1",
                    borderRadius: 14,
                    padding: "14px 18px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Enter Full App
                </button>
              </div>
            </div>

            <div style={{ ...cardStyle, padding: 20, background: "#f8fbff" }}>
              <h2 style={{ marginTop: 0, fontSize: 22 }}>What Demo Mode shows</h2>
              <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 1.8, marginBottom: 0 }}>
                <li>Sample students: Johnny and Mia</li>
                <li>Baseline and mastery examples</li>
                <li>Sample progress entries using your 0–1–2 style</li>
                <li>A realistic preview for teachers, schools, and families</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={appShellStyle}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        {isDemoMode && (
          <div
            style={{
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
              padding: 14,
              borderRadius: 16,
              marginBottom: 16,
              fontWeight: 600
            }}
          >
            Demo Mode — sample data only. Adding students and saving new features are locked.
          </div>
        )}

        <div
          style={{
            ...cardStyle,
            padding: 20,
            marginBottom: 18,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12
          }}
        >
          <div>
            <h1 style={{ margin: "0 0 6px 0", fontSize: 28 }}>RaMP Tracker</h1>
            <div style={{ color: "#64748b" }}>
              {isDemoMode ? "Previewing sample student data" : "Tracking your own students"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={addStudent}
              style={{
                background: isDemoMode ? "#e2e8f0" : "#2563eb",
                color: isDemoMode ? "#64748b" : "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Add Student
            </button>

            <button
              onClick={resetToHome}
              style={{
                background: "#fff",
                color: "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "12px 16px",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Back to Start
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(280px, 360px) minmax(0, 1fr)" }}>
          <div style={{ ...cardStyle, padding: 16, alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>Students</h2>
              <div style={{ color: "#64748b", fontSize: 14 }}>{students.length}</div>
            </div>

            {students.length === 0 ? (
              <div style={{ color: "#64748b", lineHeight: 1.6 }}>
                No students yet. Click <strong>Add Student</strong> to begin.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {students.map((student) => {
                  const isSelected = selectedStudentId === student.id;
                  return (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      style={{
                        textAlign: "left",
                        padding: 14,
                        borderRadius: 16,
                        border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "#fff",
                        cursor: "pointer"
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{student.name}</div>
                      <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
                        Grade: {student.grade || "—"} · Goals: {student.goals?.length || 0}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ ...cardStyle, padding: 20 }}>
            {!selectedStudent ? (
              <div style={{ color: "#64748b", lineHeight: 1.7 }}>
                Select a student to view goals, baseline, mastery, and progress data.
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 18 }}>
                  <h2 style={{ margin: "0 0 6px 0", fontSize: 28 }}>{selectedStudent.name}</h2>
                  <div style={{ color: "#64748b" }}>
                    Grade: {selectedStudent.grade || "—"} · Goals: {selectedStudent.goals?.length || 0}
                  </div>
                </div>

                {selectedStudent.goals?.length ? (
                  <div style={{ display: "grid", gap: 18 }}>
                    {selectedStudent.goals.map((goal) => (
                      <div
                        key={goal.id || goal.title}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 18,
                          padding: 18,
                          background: "#fff"
                        }}
                      >
                        <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>{goal.title}</h3>

                        {goal.shortName && (
                          <div style={{ color: "#64748b", marginBottom: 14 }}>
                            Short Name: {goal.shortName}
                          </div>
                        )}

                        <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Baseline</div>
                            <div style={{ color: "#475569", lineHeight: 1.6 }}>{goal.baseline}</div>
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>Mastery</div>
                            <div style={{ color: "#475569", lineHeight: 1.6 }}>{goal.mastery}</div>
                          </div>

                          {goal.collectionMethod && (
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>Collection Method</div>
                              <div style={{ color: "#475569", lineHeight: 1.6 }}>{goal.collectionMethod}</div>
                            </div>
                          )}

                          {goal.examples && (
                            <div>
                              <div style={{ fontWeight: 700, marginBottom: 6 }}>Examples</div>
                              <div style={{ color: "#475569", lineHeight: 1.6 }}>{goal.examples}</div>
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, marginBottom: 10 }}>Progress Data</div>

                          {goal.entries?.length ? (
                            <div style={{ display: "grid", gap: 10 }}>
                              {goal.entries.map((entry) => (
                                <div
                                  key={entry.id || `${entry.date}-${entry.score}`}
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    padding: 12,
                                    borderRadius: 14,
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0"
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: 700 }}>{entry.date}</div>
                                    {entry.note && (
                                      <div style={{ color: "#64748b", marginTop: 4 }}>{entry.note}</div>
                                    )}
                                  </div>

                                  <div
                                    style={{
                                      ...scoreBadgeStyle(entry.score),
                                      padding: "8px 10px",
                                      borderRadius: 999,
                                      fontWeight: 700,
                                      alignSelf: "center"
                                    }}
                                  >
                                    {entry.score} · {scoreLabel(entry.score)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ color: "#64748b" }}>No entries yet.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#64748b" }}>This student does not have goals yet.</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
