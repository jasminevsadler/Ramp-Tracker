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
          "When given a verbal reminder, Johnny will follow directions within 30 seconds by saying “okay,” beginning the task, or moving to the expected location.",
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h1 className="text-3xl font-bold mb-2">RaMP Tracker</h1>
            <p className="text-slate-600">
              Track student goals using a 0 / 1 / 2 scale with prompts, notes,
              and local storage.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="text-xl font-semibold mb-4">Add Student</h2>

              <form onSubmit={addStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Student Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={studentForm.name}
                    onChange={handleStudentFormChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter student name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={studentForm.grade}
                    onChange={handleStudentFormChange}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select grade</option>
                    {GRADE_OPTIONS.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Case Manager
                  </label>
                  <input
                    type="text"
                    name="caseManager"
                    value={studentForm.caseManager}
                    onChange={handleStudentFormChange}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter case manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Disability / Eligibility
                  </label>
                  <select
                    name="disabilities"
                    multiple
                    value={studentForm.disabilities}
                    onChange={handleStudentFormChange}
                    className="w-full border rounded-lg px-3 py-2 min-h-[160px]"
                  >
                    {DISABILITY_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Hold Ctrl (Windows) or Command (Mac) to select more than
                    one.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 font-medium"
                >
                  Add Student
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="text-xl font-semibold mb-4">Select Student</h2>

              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>

              {selectedStudent && (
                <div className="mt-4 text-sm space-y-2">
                  <p>
                    <strong>Name:</strong> {selectedStudent.name}
                  </p>
                  <p>
                    <strong>Grade:</strong> {selectedStudent.grade || "-"}
                  </p>
                  <p>
                    <strong>Case Manager:</strong>{" "}
                    {selectedStudent.caseManager || "-"}
                  </p>
                  <p>
                    <strong>Disability / Eligibility:</strong>{" "}
                    {selectedStudent.disabilities?.length
                      ? selectedStudent.disabilities.join(", ")
                      : "-"}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="text-xl font-semibold mb-4">Data Options</h2>

              <div className="space-y-3">
                <button
                  onClick={exportCSV}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-medium"
                >
                  Export CSV
                </button>

                <button
                  onClick={clearAllSavedSessions}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-4 py-2 font-medium"
                >
                  Clear Saved Session History
                </button>
              </div>
            </div>
          </section>

          <section className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold">Goals & Objectives</h2>
                <button
                  onClick={addGoalToStudent}
                  className="bg-slate-800 hover:bg-slate-900 text-white rounded-lg px-4 py-2 font-medium"
                >
                  Add Goal
                </button>
              </div>

              {!selectedStudent ? (
                <p className="text-slate-600">No student selected.</p>
              ) : selectedStudent.goals.length === 0 ? (
                <p className="text-slate-600">
                  No goals added for this student yet.
                </p>
              ) : (
                <div className="space-y-6">
                  {selectedStudent.goals.map((goal) => {
                    const key = getGoalSessionKey(selectedStudent.id, goal.id);
                    const currentSession = sessionData[key] || {
                      date: new Date().toISOString().slice(0, 10),
                      score: "",
                      promptLevel: "",
                      notes: "",
                    };

                    return (
                      <div
                        key={goal.id}
                        className="border rounded-2xl p-4 bg-slate-50"
                      >
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={goal.title}
                              onChange={(e) =>
                                updateGoalField(goal.id, "title", e.target.value)
                              }
                              className="w-full text-lg font-semibold bg-white border rounded-lg px-3 py-2"
                            />

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Short Name
                              </label>
                              <input
                                type="text"
                                value={goal.shortName || ""}
                                onChange={(e) =>
                                  updateGoalField(
                                    goal.id,
                                    "shortName",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2 bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Objective
                              </label>
                              <textarea
                                value={goal.objective || ""}
                                onChange={(e) =>
                                  updateGoalField(
                                    goal.id,
                                    "objective",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2 min-h-[90px] bg-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Examples
                              </label>
                              <textarea
                                value={goal.example || ""}
                                onChange={(e) =>
                                  updateGoalField(
                                    goal.id,
                                    "example",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2 min-h-[80px] bg-white"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Baseline
                                </label>
                                <input
                                  type="text"
                                  value={goal.baseline || ""}
                                  onChange={(e) =>
                                    updateGoalField(
                                      goal.id,
                                      "baseline",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border rounded-lg px-3 py-2 bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Mastery
                                </label>
                                <input
                                  type="text"
                                  value={goal.mastery || ""}
                                  onChange={(e) =>
                                    updateGoalField(
                                      goal.id,
                                      "mastery",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border rounded-lg px-3 py-2 bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => removeGoal(goal.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-3 py-2 h-fit"
                          >
                            Delete Goal
                          </button>
                        </div>

                        <div className="bg-white border rounded-2xl p-4">
                          <h3 className="font-semibold mb-3">
                            Record Session Data
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                value={currentSession.date}
                                onChange={(e) =>
                                  handleSessionChange(
                                    goal.id,
                                    "date",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Score
                              </label>
                              <select
                                value={currentSession.score}
                                onChange={(e) =>
                                  handleSessionChange(
                                    goal.id,
                                    "score",
                                    e.target.value
                                  )
                                }
                                className="w-full border rounded-lg px-3 py-2"
                              >
                                <option value="">Select score</option>
                                <option value="0">
                                  0 = Not demonstrating
                                </option>
                                <option value="1">1 = With prompts</option>
                                <option value="2">2 = Independent</option>
                              </select>
                            </div>

                            {currentSession.score === "1" && (
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Prompt Level
                                </label>
                                <select
                                  value={currentSession.promptLevel}
                                  onChange={(e) =>
                                    handleSessionChange(
                                      goal.id,
                                      "promptLevel",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border rounded-lg px-3 py-2"
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

                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              Notes
                            </label>
                            <textarea
                              value={currentSession.notes}
                              onChange={(e) =>
                                handleSessionChange(
                                  goal.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded-lg px-3 py-2 min-h-[90px]"
                              placeholder="Add notes about the session..."
                            />
                          </div>

                          <button
                            onClick={() => saveSessionEntry(goal)}
                            className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-4 py-2 font-medium"
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

            <div className="bg-white rounded-2xl shadow-sm border p-5">
              <h2 className="text-xl font-semibold mb-4">Saved History</h2>

              {!savedHistory.length ? (
                <p className="text-slate-600">
                  No saved entries yet for this student.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-3 border">Date</th>
                        <th className="text-left p-3 border">Goal</th>
                        <th className="text-left p-3 border">Short Name</th>
                        <th className="text-left p-3 border">Score</th>
                        <th className="text-left p-3 border">Prompt</th>
                        <th className="text-left p-3 border">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...savedHistory]
                        .reverse()
                        .map((entry) => (
                          <tr key={entry.id}>
                            <td className="p-3 border">{entry.date}</td>
                            <td className="p-3 border">{entry.goalTitle}</td>
                            <td className="p-3 border">{entry.shortName}</td>
                            <td className="p-3 border">{entry.score}</td>
                            <td className="p-3 border">
                              {entry.promptLevel || "-"}
                            </td>
                            <td className="p-3 border">{entry.notes || "-"}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
