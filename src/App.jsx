// 🔥 CLEANED + FIXED VERSION (Goals drill-down + no sidebar clutter)

import React, { useEffect, useMemo, useState } from "react";

/* ------------------ DEFAULT DATA ------------------ */

const DEFAULT_STUDENTS = [
  {
    id: "student-johnny",
    name: "Johnny",
    goals: [
      {
        id: "goal-following-directions",
        title: "Following Directions",
        objective:
          "When given a reminder, Johnny will follow directions within 30 seconds.",
        example:
          "Starts work, lines up, follows directions after one prompt.",
        collectionMethod: "rating",
      },
    ],
  },
];

/* ------------------ STORAGE ------------------ */

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

/* ------------------ APP ------------------ */

export default function App() {
  const [students, setStudents] = useState(() =>
    load("students", DEFAULT_STUDENTS)
  );
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id
  );
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [history, setHistory] = useState(() => load("history", []));

  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  const student = students.find((s) => s.id === selectedStudentId);
  const goal = student?.goals.find((g) => g.id === selectedGoalId);

  /* ------------------ SAVE DATA ------------------ */

  const saveData = (value) => {
    setHistory([
      ...history,
      {
        id: Date.now(),
        studentId: student.id,
        goalId: goal.id,
        value,
        date: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  /* ------------------ UI ------------------ */

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>RaMP Tracker</h1>

      {/* -------- STUDENT SELECT -------- */}
      <select
        value={student?.id}
        onChange={(e) => {
          setSelectedStudentId(e.target.value);
          setSelectedGoalId(null);
        }}
      >
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <hr />

      {/* -------- GOAL LIST -------- */}
      {!selectedGoalId && (
        <div>
          <h2>Goals</h2>
          {student?.goals.map((g) => (
            <div
              key={g.id}
              style={{
                padding: 12,
                border: "1px solid #ccc",
                marginBottom: 10,
                cursor: "pointer",
              }}
              onClick={() => setSelectedGoalId(g.id)}
            >
              {g.title}
            </div>
          ))}
        </div>
      )}

      {/* -------- GOAL VIEW -------- */}
      {goal && (
        <div>
          <button onClick={() => setSelectedGoalId(null)}>⬅ Back</button>

          <h2>{goal.title}</h2>

          <p>
            <strong>Objective:</strong> {goal.objective}
          </p>

          <p>
            <strong>Examples:</strong> {goal.example}
          </p>

          <hr />

          <h3>Record Data</h3>

          {goal.collectionMethod === "rating" ? (
            <>
              <button onClick={() => saveData(0)}>0</button>
              <button onClick={() => saveData(1)}>1</button>
              <button onClick={() => saveData(2)}>2</button>
            </>
          ) : (
            <>
              <button onClick={() => saveData("yes")}>Yes</button>
              <button onClick={() => saveData("no")}>No</button>
            </>
          )}

          <hr />

          <h3>History</h3>
          {history
            .filter((h) => h.goalId === goal.id)
            .map((h) => (
              <div key={h.id}>
                {h.date} — {h.value}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
