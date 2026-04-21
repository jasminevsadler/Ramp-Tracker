import React, { useState, useEffect } from "react";

const DEMO_STUDENTS = [
  {
    id: "1",
    name: "Johnny",
    goals: [
      {
        title: "Following Directions",
        baseline:
          "Requires 2–3 prompts, completes independently 40% of the time.",
        mastery:
          "Will begin tasks within 30 seconds independently in 80% of opportunities.",
        entries: [
          { date: "Day 1", score: 1 },
          { date: "Day 2", score: 1 },
          { date: "Day 3", score: 2 },
          { date: "Day 4", score: 2 },
          { date: "Day 5", score: 2 }
        ]
      }
    ]
  },
  {
    id: "2",
    name: "Mia",
    goals: [
      {
        title: "Accepting Feedback",
        baseline: "Argues or shuts down when corrected.",
        mastery:
          "Will accept feedback appropriately in 4 out of 5 opportunities.",
        entries: [
          { date: "Day 1", score: 1 },
          { date: "Day 2", score: 1 },
          { date: "Day 3", score: 2 },
          { date: "Day 4", score: 2 }
        ]
      }
    ]
  }
];

function App() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAccessScreen, setShowAccessScreen] = useState(true);

  useEffect(() => {
    if (!isDemoMode) {
      const saved = localStorage.getItem("students");
      if (saved) setStudents(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("students", JSON.stringify(students));
    }
  }, [students, isDemoMode]);

  const startDemoMode = () => {
    setStudents(DEMO_STUDENTS);
    setIsDemoMode(true);
    setShowAccessScreen(false);
  };

  const startFullApp = () => {
    const saved = localStorage.getItem("students");
    setStudents(saved ? JSON.parse(saved) : []);
    setIsDemoMode(false);
    setShowAccessScreen(false);
  };

  const demoBlocked = () => {
    alert("Demo Mode: This feature is locked.");
  };

  // 🔥 ACCESS SCREEN
  if (showAccessScreen) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1>RaMP Tracker</h1>
        <p>Try a demo or enter the full app</p>

        <button onClick={startDemoMode} style={{ margin: 10 }}>
          Try Demo
        </button>

        <button onClick={startFullApp} style={{ margin: 10 }}>
          Enter Full App
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* DEMO BANNER */}
      {isDemoMode && (
        <div style={{ background: "#ffeeba", padding: 10, marginBottom: 20 }}>
          Demo Mode – sample data only
        </div>
      )}

      <h2>Students</h2>

      {/* STUDENT LIST */}
      {students.map((student) => (
        <div
          key={student.id}
          onClick={() => setSelectedStudent(student)}
          style={{
            border: "1px solid gray",
            padding: 10,
            margin: 5,
            cursor: "pointer"
          }}
        >
          {student.name}
        </div>
      ))}

      {/* ADD STUDENT */}
      <button
        onClick={() => {
          if (isDemoMode) return demoBlocked();

          const name = prompt("Enter student name");
          if (!name) return;

          setStudents([...students, { id: Date.now(), name, goals: [] }]);
        }}
      >
        Add Student
      </button>

      {/* SELECTED STUDENT */}
      {selectedStudent && (
        <div style={{ marginTop: 20 }}>
          <h3>{selectedStudent.name}</h3>

          {selectedStudent.goals.map((goal, index) => (
            <div key={index} style={{ borderTop: "1px solid #ccc", marginTop: 10 }}>
              <h4>{goal.title}</h4>
              <p><strong>Baseline:</strong> {goal.baseline}</p>
              <p><strong>Mastery:</strong> {goal.mastery}</p>

              <h5>Data:</h5>
              {goal.entries.map((entry, i) => (
                <div key={i}>
                  {entry.date}: {entry.score}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
