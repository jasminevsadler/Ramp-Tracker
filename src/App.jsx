import { useMemo, useState } from "react";

const rampOptions = ["Reinforcement", "Modeling", "Prompting"];
const statusOptions = ["Met", "Partially Met", "Not Met"];

const goalTemplates = [
  {
    name: "Following Directions",
    text: "When given a verbal reminder, the student will follow directions within 30 seconds in 4 out of 5 opportunities.",
  },
  {
    name: "On Task",
    text: "The student will remain on task for 10 consecutive minutes with no more than 1 prompt.",
  },
  {
    name: "Transitions",
    text: "The student will transition between activities within 1 minute with no more than one prompt.",
  },
  {
    name: "Work Completion",
    text: "Given a classroom assignment, the student will begin work within 1 minute and complete the task with no more than 2 prompts in 4 out of 5 opportunities.",
  },
  {
    name: "Appropriate Responses",
    text: "When frustrated or corrected, the student will respond appropriately by using respectful words and actions in 4 out of 5 opportunities.",
  },
];

export default function App() {
  const [student, setStudent] = useState("");
  const [shortName, setShortName] = useState("");
  const [goal, setGoal] = useState("");
  const [rampType, setRampType] = useState("Reinforcement");
  const [status, setStatus] = useState("Met");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState([
    {
      id: 1,
      student: "Johnny",
      shortName: "Following Directions",
      goal: "When given a verbal reminder, Johnny will follow directions within 30 seconds in 4 out of 5 opportunities.",
      rampType: "Prompting",
      status: "Met",
      notes: "Responded after one verbal reminder.",
      date: new Date().toLocaleDateString(),
    },
  ]);

  const totalEntries = entries.length;

  const metCount = useMemo(
    () => entries.filter((entry) => entry.status === "Met").length,
    [entries]
  );

  const handleAddEntry = (e) => {
    e.preventDefault();

    if (!student.trim() || !shortName.trim() || !goal.trim()) {
      alert("Please enter a student name, short name, and full goal.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      student: student.trim(),
      shortName: shortName.trim(),
      goal: goal.trim(),
      rampType,
      status,
      notes: notes.trim(),
      date: new Date().toLocaleDateString(),
    };

    setEntries([newEntry, ...entries]);
    setStudent("");
    setShortName("");
    setGoal("");
    setRampType("Reinforcement");
    setStatus("Met");
    setNotes("");
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "#f4f1fb",
        color: "#221b2d",
      }}
    >
      <header
        style={{
          background: "linear-gradient(90deg, #6d28d9, #7c3aed)",
          color: "white",
          padding: "20px 24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>RaMP It Up!</h1>
            <p style={{ margin: "6px 0 0", opacity: 0.95 }}>
              Tracker for Reinforcement, Modeling, and Prompting
            </p>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.14)",
              borderRadius: "16px",
              padding: "10px 14px",
              minWidth: "220px",
            }}
          >
            <div style={{ fontSize: "0.95rem" }}>Quick Snapshot</div>
            <div style={{ fontWeight: 700, marginTop: "4px" }}>
              {metCount} of {totalEntries} marked Met
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <StatCard label="Total Entries" value={totalEntries} />
          <StatCard label="Met" value={metCount} />
          <StatCard
            label="Partially / Not Met"
            value={totalEntries - metCount}
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1.3fr",
            gap: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 8px 24px rgba(55, 30, 95, 0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Add New Entry</h2>
            <p style={{ color: "#625b70", marginTop: 0 }}>
              Track student support, goals, and outcomes in one place.
            </p>

            <form onSubmit={handleAddEntry}>
              <FormLabel label="Student Name" />
              <input
                type="text"
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                placeholder="Enter student name"
                style={inputStyle}
              />

              <FormLabel label="Short Name (Quick Label)" />
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Example: Following Directions"
                style={inputStyle}
              />

              <FormLabel label="Goal" />

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "10px",
                }}
              >
                {goalTemplates.map((template) => (
                  <button
                    key={template.name}
                    type="button"
                    onClick={() => {
                      setShortName(template.name);
                      setGoal(template.text);
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      border: "1px solid #d6cffa",
                      background: "white",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                  >
                    {template.name}
                  </button>
                ))}
              </div>

              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Enter full IEP-style goal"
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <FormLabel label="RaMP Type" />
              <select
                value={rampType}
                onChange={(e) => setRampType(e.target.value)}
                style={inputStyle}
              >
                {rampOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <FormLabel label="Status" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={inputStyle}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <FormLabel label="Notes / Examples" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Example: Followed direction after one verbal reminder and completed task independently."
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
              />

              <button type="submit" style={primaryButtonStyle}>
                Save Entry
              </button>
            </form>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "22px",
              boxShadow: "0 8px 24px rgba(55, 30, 95, 0.08)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Recent Entries</h2>
            <p style={{ color: "#625b70", marginTop: 0 }}>
              Newest entries appear first.
            </p>

            {entries.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #d8cffa",
                  borderRadius: "14px",
                  padding: "20px",
                  color: "#625b70",
                }}
              >
                No entries yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      border: "1px solid #e6def8",
                      borderRadius: "16px",
                      padding: "18px",
                      background: "#fcfbff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "1.05rem", fontWeight: 700 }}>
                          {entry.student}
                        </div>
                        <div style={{ color: "#625b70", marginTop: "4px" }}>
                          {entry.date}
                        </div>
                      </div>

                      <span
                        style={{
                          alignSelf: "start",
                          background:
                            entry.status === "Met"
                              ? "#dcfce7"
                              : entry.status === "Partially Met"
                              ? "#fef3c7"
                              : "#fee2e2",
                          color:
                            entry.status === "Met"
                              ? "#166534"
                              : entry.status === "Partially Met"
                              ? "#92400e"
                              : "#991b1b",
                          padding: "8px 12px",
                          borderRadius: "999px",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <div style={{ marginBottom: "6px" }}>
                      <strong>Skill:</strong> {entry.shortName || "—"}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <strong>Goal:</strong> {entry.goal}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <strong>RaMP Type:</strong> {entry.rampType}
                    </div>
                    <div style={{ marginBottom: "14px" }}>
                      <strong>Notes:</strong>{" "}
                      {entry.notes || "No notes added for this entry."}
                    </div>

                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      style={deleteButtonStyle}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "18px 20px",
        boxShadow: "0 8px 24px rgba(55, 30, 95, 0.08)",
      }}
    >
      <div style={{ color: "#625b70", marginBottom: "8px" }}>{label}</div>
      <div style={{ fontSize: "1.9rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function FormLabel({ label }) {
  return (
    <label
      style={{
        display: "block",
        marginBottom: "8px",
        marginTop: "16px",
        fontWeight: 700,
      }}
    >
      {label}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #d6cffa",
  fontSize: "1rem",
  boxSizing: "border-box",
  outline: "none",
};

const primaryButtonStyle = {
  marginTop: "18px",
  width: "100%",
  background: "#6d28d9",
  color: "white",
  border: "none",
  borderRadius: "12px",
  padding: "14px 16px",
  fontWeight: 700,
  fontSize: "1rem",
  cursor: "pointer",
};

const deleteButtonStyle = {
  background: "white",
  color: "#6d28d9",
  border: "1px solid #d6cffa",
  borderRadius: "10px",
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};
