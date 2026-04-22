
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

const INTERVAL_TYPES = [
  "Whole Interval",
  "Partial Interval",
  "Momentary Time Sampling",
];

const BENCHMARK_STATUS_OPTIONS = ["Not Started", "Current", "Mastered"];

const GOAL_TEMPLATE_OPTIONS = [
  {
    label: "Following Directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, the student will follow directions within 30 seconds by acknowledging the direction, beginning the task, or moving to the expected location across settings.",
    examplesDefinition:
      "Examples: starts work after a reminder, lines up when directed, puts materials away after one reminder.",
    baseline: "0/5 opportunities independently",
    mastery: "4/5 opportunities across 3 consecutive sessions",
    collectionMethod: "rating",
    benchmarks: [
      {
        text: "Follow 1-step directions within 30 seconds with support.",
        status: "Current",
      },
      {
        text: "Follow 1-step directions within 30 seconds independently.",
        status: "Not Started",
      },
      {
        text: "Follow 2-step directions within 30 seconds independently.",
        status: "Not Started",
      },
    ],
  },
  {
    label: "Task Completion",
    goalTitle: "Task Completion",
    fullGoalText:
      "Given an assignment or task, the student will remain engaged and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
    examplesDefinition:
      "Examples: starts independent work, completes part of an assignment, returns to task after distraction.",
    baseline: "1/5 opportunities",
    mastery: "80% across 3 consecutive sessions",
    collectionMethod: "interval",
    benchmarks: [
      {
        text: "Work on task for 5 minutes with prompts.",
        status: "Current",
      },
      {
        text: "Work on task for 10 minutes with minimal prompts.",
        status: "Not Started",
      },
      {
        text: "Complete assigned task within allotted time.",
        status: "Not Started",
      },
    ],
  },
  {
    label: "Positive Peer Interaction",
    goalTitle: "Positive Peer Interaction",
    fullGoalText:
      "During structured and unstructured activities, the student will engage in positive peer interactions by greeting peers, sharing materials, taking turns, joining activities appropriately, or responding kindly.",
    examplesDefinition:
      "Examples: says hello, asks to join, shares materials, takes turns, uses kind responses.",
    baseline: "2/5 opportunities",
    mastery: "4/5 opportunities across 3 consecutive sessions",
    collectionMethod: "rating",
    benchmarks: [
      {
        text: "Respond appropriately to peer greetings.",
        status: "Current",
      },
      {
        text: "Initiate a positive peer interaction.",
        status: "Not Started",
      },
      {
        text: "Take turns and share materials during a group activity.",
        status: "Not Started",
      },
    ],
  },
  {
    label: "Emotional Regulation",
    goalTitle: "Emotional Regulation",
    fullGoalText:
      "During times of frustration, the student will use a calm strategy such as deep breathing, asking for help, requesting a break, or using kind words instead of yelling, refusing, or shutting down.",
    examplesDefinition:
      "Examples: asks for help, takes a break, uses calm words, takes deep breaths.",
    baseline: "1/5 opportunities",
    mastery: "4/5 opportunities across 3 consecutive sessions",
    collectionMethod: "rating",
    benchmarks: [
      {
        text: "Identify when feeling frustrated and accept adult support.",
        status: "Current",
      },
      {
        text: "Use one taught calm strategy with prompting.",
        status: "Not Started",
      },
      {
        text: "Use one taught calm strategy independently.",
        status: "Not Started",
      },
    ],
  },
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
        goalTitle: "Following Directions",
        fullGoalText:
          "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
        benchmarks: [
          {
            id: "benchmark-directions-1",
            text: "Follow 1-step directions within 30 seconds with one reminder.",
            status: "Current",
          },
          {
            id: "benchmark-directions-2",
            text: "Follow 1-step directions within 30 seconds independently.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: starts work after teacher says 'Please begin,' lines up when directed, puts materials away after one reminder.",
        baseline: "0/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-staying-focused",
        goalTitle: "Staying Focused",
        fullGoalText:
          "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        benchmarks: [],
        examplesDefinition:
          "Examples: keeps working during independent work, finishes a class assignment, returns to task after distraction, completes steps of an activity.",
        baseline: "1/5 opportunities",
        mastery: "80% across 3 consecutive sessions",
        collectionMethod: "interval",
      },
    ],
  },

const DEMO_STUDENTS = [
  {
    id: "student-demo-johnny",
    name: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: ["Autism", "ADHD"],
    setting: "School",
    goals: [
      {
        id: "goal-demo-following-directions",
        goalTitle: "Following Directions",
        fullGoalText:
          "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
        benchmarks: [
          {
            id: "benchmark-demo-directions-1",
            text: "Follow 1-step directions within 30 seconds with one reminder.",
            status: "Mastered",
          },
          {
            id: "benchmark-demo-directions-2",
            text: "Follow 1-step directions within 30 seconds independently.",
            status: "Current",
          },
        ],
        examplesDefinition:
          "Examples: starts work after teacher says 'Please begin,' lines up when directed, puts materials away after one reminder.",
        baseline: "0/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-demo-staying-focused",
        goalTitle: "Staying Focused",
        fullGoalText:
          "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
        benchmarks: [],
        examplesDefinition:
          "Examples: keeps working during independent work, finishes a class assignment, returns to task after distraction, completes steps of an activity.",
        baseline: "1/5 opportunities",
        mastery: "80% across 3 consecutive sessions",
        collectionMethod: "interval",
      },
    ],
  },
  {
    id: "student-demo-mia",
    name: "Mia",
    grade: "5",
    supportPerson: "Ms. Carter",
    disabilities: ["ADHD"],
    setting: "School",
    goals: [
      {
        id: "goal-demo-feedback",
        goalTitle: "Accepting Feedback",
        fullGoalText:
          "When given corrective feedback, Mia will respond appropriately by remaining calm, acknowledging the feedback, and continuing the task without arguing.",
        benchmarks: [
          {
            id: "benchmark-demo-feedback-1",
            text: "Accept feedback with prompting and continue working.",
            status: "Current",
          },
          {
            id: "benchmark-demo-feedback-2",
            text: "Accept feedback independently and continue working.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: says 'okay,' corrects work, uses calm words, continues the assignment.",
        baseline: "1/5 opportunities",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
    ],
  },
];

const DEMO_HISTORY = [
  {
    id: "demo-entry-1",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-following-directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-directions-1",
    benchmarkText: "Follow 1-step directions within 30 seconds with one reminder.",
    benchmarkStatus: "Mastered",
    date: "2026-04-10",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "1",
    promptLevel: "Verbal",
    notes: "Needed one reminder before starting math.",
  },
  {
    id: "demo-entry-2",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-following-directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-directions-1",
    benchmarkText: "Follow 1-step directions within 30 seconds with one reminder.",
    benchmarkStatus: "Mastered",
    date: "2026-04-11",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "1",
    promptLevel: "Model",
    notes: "Teacher modeled how to begin the task.",
  },
  {
    id: "demo-entry-3",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-following-directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-directions-2",
    benchmarkText: "Follow 1-step directions within 30 seconds independently.",
    benchmarkStatus: "Current",
    date: "2026-04-14",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "2",
    promptLevel: "",
    notes: "Started work independently after instruction.",
  },
  {
    id: "demo-entry-4",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-following-directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-directions-2",
    benchmarkText: "Follow 1-step directions within 30 seconds independently.",
    benchmarkStatus: "Current",
    date: "2026-04-15",
    location: "Small Group",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "2",
    promptLevel: "",
    notes: "Transitioned to centers without prompts.",
  },
  {
    id: "demo-entry-5",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-following-directions",
    goalTitle: "Following Directions",
    fullGoalText:
      "When given a reminder, Johnny will follow directions within 30 seconds by saying 'okay,' beginning the task, or moving to the expected location across settings.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-directions-2",
    benchmarkText: "Follow 1-step directions within 30 seconds independently.",
    benchmarkStatus: "Current",
    date: "2026-04-16",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "2",
    promptLevel: "",
    notes: "Completed transition immediately and began task.",
  },
  {
    id: "demo-entry-6",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-staying-focused",
    goalTitle: "Staying Focused",
    fullGoalText:
      "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
    targetType: "goal",
    benchmarkId: "",
    benchmarkText: "",
    benchmarkStatus: "",
    date: "2026-04-10",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "interval",
    intervalType: "Whole Interval",
    sessionLength: 10,
    intervalLength: 1,
    totalIntervals: 10,
    yesCount: 4,
    percent: 40,
    notes: "Needed frequent redirection during independent work.",
  },
  {
    id: "demo-entry-7",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-staying-focused",
    goalTitle: "Staying Focused",
    fullGoalText:
      "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
    targetType: "goal",
    benchmarkId: "",
    benchmarkText: "",
    benchmarkStatus: "",
    date: "2026-04-12",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "interval",
    intervalType: "Whole Interval",
    sessionLength: 10,
    intervalLength: 1,
    totalIntervals: 10,
    yesCount: 6,
    percent: 60,
    notes: "Returned to work more quickly after prompts.",
  },
  {
    id: "demo-entry-8",
    studentId: "student-demo-johnny",
    studentName: "Johnny",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: "Autism, ADHD",
    setting: "School",
    goalId: "goal-demo-staying-focused",
    goalTitle: "Staying Focused",
    fullGoalText:
      "Given an assignment or task, Johnny will remain focused and work toward completion by staying on task, returning to task after redirection, and completing expected parts within the allotted time.",
    targetType: "goal",
    benchmarkId: "",
    benchmarkText: "",
    benchmarkStatus: "",
    date: "2026-04-15",
    location: "Small Group",
    collectedBy: "Teacher",
    collectionMethod: "interval",
    intervalType: "Whole Interval",
    sessionLength: 10,
    intervalLength: 1,
    totalIntervals: 10,
    yesCount: 8,
    percent: 80,
    notes: "Stayed engaged for most of the session.",
  },
  {
    id: "demo-entry-9",
    studentId: "student-demo-mia",
    studentName: "Mia",
    grade: "5",
    supportPerson: "Ms. Carter",
    disabilities: "ADHD",
    setting: "School",
    goalId: "goal-demo-feedback",
    goalTitle: "Accepting Feedback",
    fullGoalText:
      "When given corrective feedback, Mia will respond appropriately by remaining calm, acknowledging the feedback, and continuing the task without arguing.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-feedback-1",
    benchmarkText: "Accept feedback with prompting and continue working.",
    benchmarkStatus: "Current",
    date: "2026-04-09",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "1",
    promptLevel: "Model",
    notes: "Needed modeled response before correcting work.",
  },
  {
    id: "demo-entry-10",
    studentId: "student-demo-mia",
    studentName: "Mia",
    grade: "5",
    supportPerson: "Ms. Carter",
    disabilities: "ADHD",
    setting: "School",
    goalId: "goal-demo-feedback",
    goalTitle: "Accepting Feedback",
    fullGoalText:
      "When given corrective feedback, Mia will respond appropriately by remaining calm, acknowledging the feedback, and continuing the task without arguing.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-feedback-1",
    benchmarkText: "Accept feedback with prompting and continue working.",
    benchmarkStatus: "Current",
    date: "2026-04-12",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "1",
    promptLevel: "Verbal",
    notes: "Accepted redirection after one reminder.",
  },
  {
    id: "demo-entry-11",
    studentId: "student-demo-mia",
    studentName: "Mia",
    grade: "5",
    supportPerson: "Ms. Carter",
    disabilities: "ADHD",
    setting: "School",
    goalId: "goal-demo-feedback",
    goalTitle: "Accepting Feedback",
    fullGoalText:
      "When given corrective feedback, Mia will respond appropriately by remaining calm, acknowledging the feedback, and continuing the task without arguing.",
    targetType: "benchmark",
    benchmarkId: "benchmark-demo-feedback-2",
    benchmarkText: "Accept feedback independently and continue working.",
    benchmarkStatus: "Not Started",
    date: "2026-04-14",
    location: "Classroom",
    collectedBy: "Teacher",
    collectionMethod: "rating",
    score: "2",
    promptLevel: "",
    notes: "Corrected work calmly and continued the assignment.",
  },
];

];

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeStudents(students) {
  const source = Array.isArray(students) ? students : [];
  return source.map((student) => ({
    id: student.id || makeId("student"),
    name: student.name || "",
    grade: student.grade || "",
    supportPerson: student.supportPerson || "",
    disabilities: Array.isArray(student.disabilities) ? student.disabilities : [],
    setting: student.setting || "",
    goals: Array.isArray(student.goals)
      ? student.goals.map((goal) => ({
          id: goal.id || makeId("goal"),
          goalTitle:
            goal.goalTitle ||
            goal.shortName ||
            goal.title ||
            "Untitled Goal",
          fullGoalText: goal.fullGoalText || goal.title || goal.objective || "",
          benchmarks: Array.isArray(goal.benchmarks)
            ? goal.benchmarks.map((benchmark) => ({
                id: benchmark.id || makeId("benchmark"),
                text: benchmark.text || benchmark.objective || "",
                status:
                  BENCHMARK_STATUS_OPTIONS.includes(benchmark.status)
                    ? benchmark.status
                    : "Not Started",
              }))
            : [],
          examplesDefinition:
            goal.examplesDefinition || goal.example || goal.definition || "",
          baseline: goal.baseline || "",
          mastery: goal.mastery || "",
          collectionMethod:
            goal.collectionMethod === "interval" ? "interval" : "rating",
        }))
      : [],
  }));
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
        <div style={{ color: "#64748b" }}>No saved data yet for this item.</div>
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

export default function App() {
  const [students, setStudents] = useState(() =>
    normalizeStudents(loadFromStorage("ramp_students", DEFAULT_STUDENTS))
  );
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    loadFromStorage("ramp_selected_student", DEFAULT_STUDENTS[0]?.id || "")
  );
  const [selectedGoalId, setSelectedGoalId] = useState(() =>
    loadFromStorage("ramp_selected_goal", "")
  );
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState(() =>
    loadFromStorage("ramp_selected_benchmark", "")
  );
  const [showGoalDetails, setShowGoalDetails] = useState(() =>
    loadFromStorage("ramp_show_goal_details", false)
  );
  const [sessionData, setSessionData] = useState(() =>
    loadFromStorage("ramp_session_data", {})
  );
  const [history, setHistory] = useState(() =>
    loadFromStorage("ramp_session_history", [])
  );
  const [activeTab, setActiveTab] = useState(() =>
    loadFromStorage("ramp_active_tab", "studentDashboard")
  );
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [studentForm, setStudentForm] = useState({
    name: "",
    grade: "",
    supportPerson: "",
    disabilities: [],
    setting: "",
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [showAccessScreen, setShowAccessScreen] = useState(() => true);
  useEffect(() => {
  setShowAccessScreen(true);
}, []);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("ramp_students", JSON.stringify(students));
    }
  }, [students, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("ramp_session_data", JSON.stringify(sessionData));
    }
  }, [sessionData, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("ramp_session_history", JSON.stringify(history));
    }
  }, [history, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(
        "ramp_selected_student",
        JSON.stringify(selectedStudentId)
      );
    }
  }, [selectedStudentId, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("ramp_selected_goal", JSON.stringify(selectedGoalId));
    }
  }, [selectedGoalId, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(
        "ramp_selected_benchmark",
        JSON.stringify(selectedBenchmarkId)
      );
    }
  }, [selectedBenchmarkId, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem(
        "ramp_show_goal_details",
        JSON.stringify(showGoalDetails)
      );
    }
  }, [showGoalDetails, isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) {
      localStorage.setItem("ramp_active_tab", JSON.stringify(activeTab));
    }
  }, [activeTab, isDemoMode]);

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || students[0],
    [students, selectedStudentId]
  );

  const selectedGoal = useMemo(() => {
    if (!selectedStudent) return null;
    return (
      selectedStudent.goals.find((goal) => goal.id === selectedGoalId) ||
      selectedStudent.goals[0] ||
      null
    );
  }, [selectedStudent, selectedGoalId]);

  const selectedBenchmark = useMemo(() => {
    if (!selectedGoal || !selectedGoal.benchmarks?.length) return null;
    return (
      selectedGoal.benchmarks.find(
        (benchmark) => benchmark.id === selectedBenchmarkId
      ) || selectedGoal.benchmarks[0]
    );
  }, [selectedGoal, selectedBenchmarkId]);

  useEffect(() => {
    if (!selectedStudent) {
      setSelectedGoalId("");
      setSelectedBenchmarkId("");
      return;
    }

    const goalExists = selectedStudent.goals.some((goal) => goal.id === selectedGoalId);
    const nextGoal = goalExists
      ? selectedStudent.goals.find((goal) => goal.id === selectedGoalId)
      : selectedStudent.goals[0];

    if (!goalExists) {
      setSelectedGoalId(nextGoal?.id || "");
    }

    if (nextGoal?.benchmarks?.length) {
      const benchmarkExists = nextGoal.benchmarks.some(
        (benchmark) => benchmark.id === selectedBenchmarkId
      );
      if (!benchmarkExists) {
        setSelectedBenchmarkId(nextGoal.benchmarks[0]?.id || "");
      }
    } else {
      setSelectedBenchmarkId("");
    }
  }, [selectedStudent, selectedGoalId, selectedBenchmarkId]);

  const savedHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return history.filter((entry) => entry.studentId === selectedStudent.id);
  }, [history, selectedStudent]);

  const graphGroups = useMemo(() => {
    if (!selectedStudent) return [];

    const groups = [];

    selectedStudent.goals.forEach((goal) => {
      if (goal.benchmarks?.length) {
        goal.benchmarks.forEach((benchmark) => {
          const matching = savedHistory
            .filter(
              (entry) =>
                entry.goalId === goal.id &&
                entry.targetType === "benchmark" &&
                entry.benchmarkId === benchmark.id
            )
            .map((entry) => ({
              date: entry.date,
              value:
                entry.collectionMethod === "interval"
                  ? Number(entry.percent || 0)
                  : Number(entry.score || 0),
            }));

          groups.push({
            id: `${goal.id}-${benchmark.id}`,
            title: `${goal.goalTitle} — ${benchmark.text}`,
            points: matching,
            mode: goal.collectionMethod === "interval" ? "interval" : "rating",
          });
        });
      } else {
        const matching = savedHistory
          .filter(
            (entry) => entry.goalId === goal.id && entry.targetType === "goal"
          )
          .map((entry) => ({
            date: entry.date,
            value:
              entry.collectionMethod === "interval"
                ? Number(entry.percent || 0)
                : Number(entry.score || 0),
          }));

        groups.push({
          id: goal.id,
          title: goal.goalTitle,
          points: matching,
          mode: goal.collectionMethod === "interval" ? "interval" : "rating",
        });
      }
    });

    return groups;
  }, [selectedStudent, savedHistory]);

  const totalGoals = students.reduce(
    (sum, student) => sum + (student.goals?.length || 0),
    0
  );

  const totalBenchmarks = students.reduce(
    (sum, student) =>
      sum +
      (student.goals || []).reduce(
        (inner, goal) => inner + (goal.benchmarks?.length || 0),
        0
      ),
    0
  );

  const selectedStudentCurrentCount = (selectedStudent?.goals || []).reduce(
    (sum, goal) =>
      sum +
      (goal.benchmarks || []).filter(
        (benchmark) => benchmark.status === "Current"
      ).length,
    0
  );

  const selectedStudentMasteredCount = (selectedStudent?.goals || []).reduce(
    (sum, goal) =>
      sum +
      (goal.benchmarks || []).filter(
        (benchmark) => benchmark.status === "Mastered"
      ).length,
    0
  );

  const getGoalSessionKey = (studentId, goalId, benchmarkId = "") =>
    `${studentId}__${goalId}__${benchmarkId || "goal"}`;

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


  const startDemoMode = () => {
    const demoStudents = normalizeStudents(DEMO_STUDENTS);
    setStudents(demoStudents);
    setHistory(DEMO_HISTORY);
    setSessionData({});
    setSelectedStudentId(demoStudents[0]?.id || "");
    setSelectedGoalId(demoStudents[0]?.goals?.[0]?.id || "");
    setSelectedBenchmarkId(demoStudents[0]?.goals?.[0]?.benchmarks?.[0]?.id || "");
    setShowGoalDetails(true);
    setActiveTab("studentDashboard");
    setShowAddStudentForm(false);
    setIsDemoMode(true);
    setShowAccessScreen(false);
  };

  const startFullApp = () => {
    const fullStudents = normalizeStudents(loadFromStorage("ramp_students", DEFAULT_STUDENTS));
    const fullHistory = loadFromStorage("ramp_session_history", []);
    const fullSessionData = loadFromStorage("ramp_session_data", {});
    const fullStudentId = loadFromStorage("ramp_selected_student", fullStudents[0]?.id || "");
    const fullGoalId = loadFromStorage("ramp_selected_goal", "");
    const fullBenchmarkId = loadFromStorage("ramp_selected_benchmark", "");
    const fullShowGoalDetails = loadFromStorage("ramp_show_goal_details", false);
    const fullActiveTab = loadFromStorage("ramp_active_tab", "studentDashboard");

    setStudents(fullStudents);
    setHistory(Array.isArray(fullHistory) ? fullHistory : []);
    setSessionData(fullSessionData || {});
    setSelectedStudentId(fullStudentId || fullStudents[0]?.id || "");
    setSelectedGoalId(fullGoalId || "");
    setSelectedBenchmarkId(fullBenchmarkId || "");
    setShowGoalDetails(Boolean(fullShowGoalDetails));
    setActiveTab(fullActiveTab || "studentDashboard");
    setShowAddStudentForm(false);
    setIsDemoMode(false);
    setShowAccessScreen(false);
  };

  const backToStart = () => {
    setShowAccessScreen(true);
  };

  const demoBlocked = (feature = "This feature") => {
    window.alert(`${feature} is locked in Demo Mode. Create an account to use your own student data.`);
  };

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
    if (isDemoMode) {
      if (e?.preventDefault) e.preventDefault();
      demoBlocked("Adding students");
      return;
    }
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    const newStudent = {
      id: makeId("student"),
      name: studentForm.name.trim(),
      grade: studentForm.grade || "",
      supportPerson: studentForm.supportPerson.trim(),
      disabilities: studentForm.disabilities || [],
      setting: studentForm.setting || "",
      goals: [],
    };

    setStudents((prev) => [...prev, newStudent]);
    setSelectedStudentId(newStudent.id);
    setSelectedGoalId("");
    setSelectedBenchmarkId("");
    setShowAddStudentForm(false);

    setStudentForm({
      name: "",
      grade: "",
      supportPerson: "",
      disabilities: [],
      setting: "",
    });
  };

  const deleteStudent = (studentId) => {
    if (isDemoMode) {
      demoBlocked("Deleting students");
      return;
    }
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
    setSelectedBenchmarkId(updatedStudents[0]?.goals?.[0]?.benchmarks?.[0]?.id || "");
  };

  const addGoalCustom = () => {
    if (isDemoMode) {
      demoBlocked("Adding goals");
      return;
    }
    if (!selectedStudent) return;

    const goalTitle = window.prompt("Enter goal title:");
    if (!goalTitle) return;

    const fullGoalText = window.prompt("Enter full goal text:");
    const examplesDefinition = window.prompt("Enter examples or definition:");
    const baseline = window.prompt("Enter baseline:");
    const mastery = window.prompt("Enter mastery:");
    const methodPrompt = window.prompt(
      "Enter collection method: rating or interval",
      "rating"
    );

    const collectionMethod =
      methodPrompt && methodPrompt.toLowerCase() === "interval"
        ? "interval"
        : "rating";

    const newGoal = {
      id: makeId("goal"),
      goalTitle: goalTitle.trim(),
      fullGoalText: fullGoalText || "",
      benchmarks: [],
      examplesDefinition: examplesDefinition || "",
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
    setSelectedBenchmarkId("");
  };

  const addGoalFromTemplate = (templateLabel) => {
    if (isDemoMode) {
      demoBlocked("Adding goals");
      return;
    }
    if (!selectedStudent || !templateLabel) return;

    const template = GOAL_TEMPLATE_OPTIONS.find(
      (item) => item.label === templateLabel
    );
    if (!template) return;

    const newGoal = {
      id: makeId("goal"),
      goalTitle: template.goalTitle,
      fullGoalText: template.fullGoalText,
      benchmarks: (template.benchmarks || []).map((benchmark) => ({
        id: makeId("benchmark"),
        text: benchmark.text,
        status: benchmark.status || "Not Started",
      })),
      examplesDefinition: template.examplesDefinition,
      baseline: template.baseline,
      mastery: template.mastery,
      collectionMethod: template.collectionMethod,
    };

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, goals: [...student.goals, newGoal] }
          : student
      )
    );

    setSelectedGoalId(newGoal.id);
    setSelectedBenchmarkId(newGoal.benchmarks[0]?.id || "");
  };

  const removeGoal = (goalId) => {
    if (isDemoMode) {
      demoBlocked("Deleting goals");
      return;
    }
    if (!selectedStudent) return;

    const goal = selectedStudent.goals.find((g) => g.id === goalId);
    const confirmed = window.confirm(
      `Delete goal${goal?.goalTitle ? `: ${goal.goalTitle}` : ""}?`
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

    const updatedStudent = updatedStudents.find(
      (student) => student.id === selectedStudent.id
    );
    setSelectedGoalId(updatedStudent?.goals?.[0]?.id || "");
    setSelectedBenchmarkId(updatedStudent?.goals?.[0]?.benchmarks?.[0]?.id || "");
  };

  const updateGoalField = (goalId, field, value) => {
    if (isDemoMode) {
      demoBlocked("Editing goals");
      return;
    }
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

  const editGoal = (goal) => {
    if (isDemoMode) {
      demoBlocked("Editing goals");
      return;
    }
    if (!selectedStudent || !goal) return;

    const goalTitle = window.prompt("Edit goal title:", goal.goalTitle);
    if (goalTitle === null) return;

    const fullGoalText = window.prompt(
      "Edit full goal text:",
      goal.fullGoalText
    );
    if (fullGoalText === null) return;

    const examplesDefinition = window.prompt(
      "Edit examples or definition:",
      goal.examplesDefinition
    );
    if (examplesDefinition === null) return;

    const baseline = window.prompt("Edit baseline:", goal.baseline);
    if (baseline === null) return;

    const mastery = window.prompt("Edit mastery:", goal.mastery);
    if (mastery === null) return;

    const methodPrompt = window.prompt(
      "Edit collection method: rating or interval",
      goal.collectionMethod
    );
    if (methodPrompt === null) return;

    updateGoalField(goal.id, "goalTitle", goalTitle.trim());
    updateGoalField(goal.id, "fullGoalText", fullGoalText);
    updateGoalField(goal.id, "examplesDefinition", examplesDefinition);
    updateGoalField(goal.id, "baseline", baseline);
    updateGoalField(goal.id, "mastery", mastery);
    updateGoalField(
      goal.id,
      "collectionMethod",
      methodPrompt.toLowerCase() === "interval" ? "interval" : "rating"
    );
  };

  const addBenchmark = (goalId) => {
    if (isDemoMode) {
      demoBlocked("Adding benchmarks");
      return;
    }
    if (!selectedStudent) return;
    const text = window.prompt("Enter short-term benchmark/objective:");
    if (!text) return;

    const newBenchmark = {
      id: makeId("benchmark"),
      text: text.trim(),
      status: "Not Started",
    };

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.map((goal) =>
                goal.id === goalId
                  ? {
                      ...goal,
                      benchmarks: [...goal.benchmarks, newBenchmark],
                    }
                  : goal
              ),
            }
          : student
      )
    );

    setSelectedGoalId(goalId);
    setSelectedBenchmarkId(newBenchmark.id);
  };

  const editBenchmark = (goalId, benchmark) => {
    if (isDemoMode) {
      demoBlocked("Editing benchmarks");
      return;
    }
    if (!selectedStudent || !benchmark) return;
    const text = window.prompt(
      "Edit short-term benchmark/objective:",
      benchmark.text
    );
    if (text === null) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.map((goal) =>
                goal.id === goalId
                  ? {
                      ...goal,
                      benchmarks: goal.benchmarks.map((item) =>
                        item.id === benchmark.id
                          ? { ...item, text: text.trim() }
                          : item
                      ),
                    }
                  : goal
              ),
            }
          : student
      )
    );
  };

  const updateBenchmarkStatus = (goalId, benchmarkId, status) => {
    if (isDemoMode) {
      demoBlocked("Updating benchmark status");
      return;
    }
    if (!selectedStudent) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.map((goal) =>
                goal.id === goalId
                  ? {
                      ...goal,
                      benchmarks: goal.benchmarks.map((benchmark) =>
                        benchmark.id === benchmarkId
                          ? { ...benchmark, status }
                          : benchmark
                      ),
                    }
                  : goal
              ),
            }
          : student
      )
    );
  };

  const removeBenchmark = (goalId, benchmarkId) => {
    if (isDemoMode) {
      demoBlocked("Deleting benchmarks");
      return;
    }
    if (!selectedStudent) return;

    const goal = selectedStudent.goals.find((g) => g.id === goalId);
    const benchmark = goal?.benchmarks?.find((b) => b.id === benchmarkId);
    const confirmed = window.confirm(
      `Delete short-term benchmark/objective${
        benchmark?.text ? `: ${benchmark.text}` : ""
      }?`
    );
    if (!confirmed) return;

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              goals: student.goals.map((goalItem) =>
                goalItem.id === goalId
                  ? {
                      ...goalItem,
                      benchmarks: goalItem.benchmarks.filter(
                        (benchmark) => benchmark.id !== benchmarkId
                      ),
                    }
                  : goalItem
              ),
            }
          : student
      )
    );

    if (selectedBenchmarkId === benchmarkId) {
      const updatedGoal = goal?.benchmarks?.filter(
        (benchmark) => benchmark.id !== benchmarkId
      );
      setSelectedBenchmarkId(updatedGoal?.[0]?.id || "");
    }
  };

  const handleSessionChange = (goal, benchmark, field, value) => {
    if (isDemoMode) {
      demoBlocked("Recording data");
      return;
    }
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);

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

  const handleIntervalResultChange = (goal, benchmark, index, value) => {
    if (isDemoMode) {
      demoBlocked("Recording data");
      return;
    }
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);

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

  const saveSessionEntry = (goal, benchmark = null) => {
    if (isDemoMode) {
      demoBlocked("Saving session data");
      return;
    }
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);
    const entry = sessionData[key] || getDefaultSessionForGoal();

    const targetType = benchmark ? "benchmark" : "goal";
    const targetName = benchmark ? benchmark.text : goal.goalTitle;

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
        id: makeId("entry"),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        grade: selectedStudent.grade || "",
        supportPerson: selectedStudent.supportPerson || "",
        disabilities: (selectedStudent.disabilities || []).join(", "),
        setting: selectedStudent.setting || "",
        goalId: goal.id,
        goalTitle: goal.goalTitle,
        fullGoalText: goal.fullGoalText,
        targetType,
        benchmarkId: benchmark?.id || "",
        benchmarkText: benchmark?.text || "",
        benchmarkStatus: benchmark?.status || "",
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
      alert(`Saved interval data for ${targetName}: ${percent}%`);
      return;
    }

    if (entry.score === "") {
      alert("Please select a score before saving.");
      return;
    }

    const record = {
      id: makeId("entry"),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      grade: selectedStudent.grade || "",
      supportPerson: selectedStudent.supportPerson || "",
      disabilities: (selectedStudent.disabilities || []).join(", "),
      setting: selectedStudent.setting || "",
      goalId: goal.id,
      goalTitle: goal.goalTitle,
      fullGoalText: goal.fullGoalText,
      targetType,
      benchmarkId: benchmark?.id || "",
      benchmarkText: benchmark?.text || "",
      benchmarkStatus: benchmark?.status || "",
      date: entry.date || "",
      location: entry.location || "",
      collectedBy: entry.collectedBy || "",
      collectionMethod: "rating",
      score: entry.score || "",
      promptLevel: entry.score === "1" ? entry.promptLevel || "" : "",
      notes: entry.notes || "",
    };

    setHistory((prev) => [...prev, record]);
    alert(`Saved data for ${targetName}.`);
  };

  const exportCSV = () => {
    if (isDemoMode) {
      demoBlocked("Exporting data");
      return;
    }
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
      "Full Goal Text",
      "Target Type",
      "Short-Term Benchmark/Objective",
      "Benchmark Status",
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
      item.fullGoalText,
      item.targetType,
      item.benchmarkText,
      item.benchmarkStatus,
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
    if (isDemoMode) {
      demoBlocked("Clearing saved sessions");
      return;
    }
    const confirmed = window.confirm(
      "Are you sure you want to delete all saved session history?"
    );
    if (!confirmed) return;

    setHistory([]);
    alert("All saved session history has been cleared.");
  };

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
      maxWidth: "1480px",
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
      gridTemplateColumns: "330px 1fr",
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
    smallButton: {
      background: "#f8fafc",
      color: "#0f172a",
      border: "1px solid #cbd5e1",
      borderRadius: "10px",
      padding: "8px 12px",
      fontSize: "13px",
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
    rowGap: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    studentGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
      gap: "16px",
    },
    studentCard: {
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "16px",
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
    },
    selectedStudentCard: {
      border: "2px solid #2563eb",
      borderRadius: "18px",
      padding: "16px",
      background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
    },
    goalCard: {
      border: "1px solid #bfdbfe",
      borderRadius: "20px",
      padding: "16px",
      background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      marginBottom: "16px",
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
    benchmarkCard: {
      border: "1px solid #dbeafe",
      borderRadius: "14px",
      padding: "12px",
      background: "white",
      marginBottom: "10px",
    },
    selectedBenchmarkCard: {
      border: "2px solid #2563eb",
      borderRadius: "14px",
      padding: "12px",
      background: "#eff6ff",
      marginBottom: "10px",
      cursor: "pointer",
    },
    benchmarkCardClickable: {
      border: "1px solid #dbeafe",
      borderRadius: "14px",
      padding: "12px",
      background: "white",
      marginBottom: "10px",
      cursor: "pointer",
    },
    infoBlock: {
      background: "#ffffff",
      border: "1px solid #dbeafe",
      borderRadius: "14px",
      padding: "14px",
      marginBottom: "12px",
    },
    sessionBox: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "16px",
      marginTop: "18px",
    },
    quickRecordBox: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      borderRadius: "18px",
      padding: "16px",
      marginTop: "14px",
      marginBottom: "18px",
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
  };










  const renderAccessScreen = () => (
    <div style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, textarea, button { font: inherit; }
      `}</style>

      <div style={{ ...styles.container, minHeight: "calc(100vh - 48px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...styles.card, maxWidth: "1100px", width: "100%", padding: "32px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "24px",
              alignItems: "stretch",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: 700,
                  fontSize: "14px",
                  marginBottom: "18px",
                  width: "fit-content",
                }}
              >
                RaMP Tracker
              </div>

              <h1
                style={{
                  fontSize: "clamp(36px, 5vw, 58px)",
                  lineHeight: 1.05,
                  margin: "0 0 16px 0",
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                }}
              >
                Let people preview the app without giving away the full product.
              </h1>

              <p style={{ color: "#475569", fontSize: "20px", lineHeight: 1.6, margin: 0 }}>
                Demo Mode shows sample students, sample goals, and real-looking progress data.
                Full App is where your own students live.
              </p>

              <p style={{ color: "#1e40af", fontSize: "18px", fontWeight: 700, lineHeight: 1.6, marginTop: "16px" }}>
                See how students move from prompts to independence using RaMP.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "26px" }}>
                <button
                  onClick={startDemoMode}
                  style={{ ...styles.buttonPrimary, padding: "14px 20px", borderRadius: "16px" }}
                >
                  Try Demo (No Login Needed)
                </button>
                <button
                  onClick={startFullApp}
                  style={{ ...styles.buttonLight, padding: "14px 20px", borderRadius: "16px" }}
                >
                  Create Account / Log In
                </button>
              </div>
            </div>

            <div style={{ ...styles.card, marginBottom: 0, background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)" }}>
              <h2 style={{ marginTop: 0, color: "#0f172a", fontSize: "22px" }}>What Demo Mode shows</h2>
              <ul style={{ color: "#475569", fontSize: "18px", lineHeight: 1.8, paddingLeft: "24px", marginBottom: 0 }}>
                <li>Sample students: Johnny and Mia</li>
                <li>Baseline and mastery examples</li>
                <li>Sample progress entries using your 0–1–2 style</li>
                <li>A realistic preview for teachers, schools, and families</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentSelect = () => (
    <div style={styles.card}>
      <label style={styles.label}>Select Student</label>
      <select
        value={selectedStudent?.id || ""}
        onChange={(e) => {
          const nextStudentId = e.target.value;
          const nextStudent = students.find((s) => s.id === nextStudentId);
          setSelectedStudentId(nextStudentId);
          setSelectedGoalId(nextStudent?.goals?.[0]?.id || "");
          setSelectedBenchmarkId(nextStudent?.goals?.[0]?.benchmarks?.[0]?.id || "");
        }}
        style={styles.input}
      >
        {students.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name}
          </option>
        ))}
      </select>
    </div>
  );

  const renderStudentDashboard = () => (
    <>
      <div style={styles.card}>
        <div style={{ ...styles.rowGap, justifyContent: "space-between" }}>
          <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Student Dashboard</h2>
          <button
            onClick={() => {
              if (isDemoMode) {
                demoBlocked("Adding students");
                return;
              }
              setShowAddStudentForm((prev) => !prev);
            }}
            style={styles.buttonPrimary}
          >
            {showAddStudentForm ? "Hide Add Student" : "Add Student"}
          </button>
        </div>
      </div>

      {showAddStudentForm && (
        <div style={styles.card}>
          <h3 style={styles.subTitle}>Add Student</h3>
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
            </div>

            <button type="submit" style={styles.buttonPrimary}>
              Save Student
            </button>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <h3 style={styles.subTitle}>Students</h3>
        {!students.length ? (
          <div>No students added yet.</div>
        ) : (
          <div style={styles.studentGrid}>
            {students.map((student) => {
              const isSelected = selectedStudent?.id === student.id;
              const cardStyle = isSelected
                ? styles.selectedStudentCard
                : styles.studentCard;

              const benchmarkCount = (student.goals || []).reduce(
                (sum, goal) => sum + (goal.benchmarks?.length || 0),
                0
              );

              return (
                <div
                  key={student.id}
                  style={cardStyle}
                  onClick={() => {
                    setSelectedStudentId(student.id);
                    setSelectedGoalId(student.goals?.[0]?.id || "");
                    setSelectedBenchmarkId(student.goals?.[0]?.benchmarks?.[0]?.id || "");
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#1e3a8a",
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
                    {student.name}
                  </div>
                  <div><strong>Grade:</strong> {student.grade || "-"}</div>
                  <div><strong>Support Person:</strong> {student.supportPerson || "-"}</div>
                  <div><strong>Goals:</strong> {student.goals?.length || 0}</div>
                  <div><strong>Benchmarks/Objectives:</strong> {benchmarkCount}</div>
                </div>
              );
            })}
          </div>
        )}
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
              {selectedStudent.name}'s Goals
            </h3>
            <div style={styles.rowGap}>
              <button onClick={addGoalCustom} style={styles.buttonSecondary}>
                Add Custom Goal
              </button>
              <button
                onClick={() => deleteStudent(selectedStudent.id)}
                style={styles.buttonRed}
              >
                Delete Student
              </button>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Quick Add Goal Template</label>
            <select
              style={styles.input}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  addGoalFromTemplate(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">Choose a template</option>
              {GOAL_TEMPLATE_OPTIONS.map((template) => (
                <option key={template.label} value={template.label}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent.goals.length === 0 ? (
            <div>No goals added for this student yet.</div>
          ) : (
            selectedStudent.goals.map((goal) => (
              <div key={goal.id} style={styles.goalCard}>
                <div
                  style={{
                    ...styles.rowGap,
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#1e3a8a",
                        marginBottom: "6px",
                      }}
                    >
                      {goal.goalTitle}
                    </div>
                    <div style={styles.smallText}>
                      Method:{" "}
                      {goal.collectionMethod === "interval"
                        ? "Interval Data"
                        : "Rating Scale"}
                    </div>
                  </div>

                  <div style={styles.rowGap}>
                    <button
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setSelectedBenchmarkId(goal.benchmarks?.[0]?.id || "");
                        setActiveTab("progressMonitoring");
                      }}
                      style={styles.buttonLight}
                    >
                      Open in Progress Monitoring
                    </button>
                    <button onClick={() => editGoal(goal)} style={styles.smallButton}>
                      Edit Goal
                    </button>
                    <button onClick={() => removeGoal(goal.id)} style={styles.smallButton}>
                      Delete Goal
                    </button>
                  </div>
                </div>

                <div style={styles.infoBlock}>
                  <div
                    style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}
                  >
                    Full Goal Text
                  </div>
                  <div style={{ lineHeight: 1.6 }}>{goal.fullGoalText || "-"}</div>
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
                      Examples / Definition
                    </div>
                    <div>{goal.examplesDefinition || "-"}</div>
                  </div>

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
                    <div>{goal.baseline || "-"}</div>
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
                    <div>{goal.mastery || "-"}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      ...styles.rowGap,
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#1e3a8a",
                        fontSize: "16px",
                      }}
                    >
                      Short-Term Benchmarks/Objectives
                    </div>
                    <button
                      onClick={() => addBenchmark(goal.id)}
                      style={styles.buttonPrimary}
                    >
                      Add Benchmark/Objective
                    </button>
                  </div>

                  {!goal.benchmarks.length ? (
                    <div style={styles.smallText}>
                      No short-term benchmarks/objectives yet. Data will be taken
                      on the goal until one is added.
                    </div>
                  ) : (
                    goal.benchmarks.map((benchmark) => (
                      <div key={benchmark.id} style={styles.benchmarkCard}>
                        <div
                          style={{
                            ...styles.rowGap,
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: "220px", lineHeight: 1.5 }}>
                            {benchmark.text}
                          </div>

                          <div style={styles.rowGap}>
                            <button
                              onClick={() => editBenchmark(goal.id, benchmark)}
                              style={styles.smallButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeBenchmark(goal.id, benchmark.id)}
                              style={styles.smallButton}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div style={{ maxWidth: "240px" }}>
                          <label style={styles.label}>Status</label>
                          <select
                            value={benchmark.status}
                            onChange={(e) =>
                              updateBenchmarkStatus(goal.id, benchmark.id, e.target.value)
                            }
                            style={styles.input}
                          >
                            {BENCHMARK_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );

  const renderProgressMonitoring = () => {
    if (!selectedStudent) {
      return (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Progress Monitoring</h2>
          <div>No student selected.</div>
        </div>
      );
    }

    const activeTargetBenchmark =
      selectedGoal?.benchmarks?.length ? selectedBenchmark : null;

    const sessionKey = selectedGoal
      ? getGoalSessionKey(
          selectedStudent.id,
          selectedGoal.id,
          activeTargetBenchmark?.id
        )
      : "";
    const currentSession = sessionData[sessionKey] || getDefaultSessionForGoal();

    const renderRecordDataBox = () => {
      if (!selectedGoal) return null;

      return (
        <div style={styles.quickRecordBox}>
          <div
            style={{
              fontWeight: 700,
              marginBottom: "12px",
              color: "#1e3a8a",
              fontSize: "17px",
            }}
          >
            Record Data For:{" "}
            {activeTargetBenchmark
              ? activeTargetBenchmark.text
              : selectedGoal.goalTitle}
          </div>

          {isDemoMode && (
            <div
              style={{
                background: "#ffffff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
                borderRadius: "14px",
                padding: "12px",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              Demo preview — this shows where you would record data in the full version.
            </div>
          )}

          {selectedGoal.collectionMethod === "interval" ? (
            <>
              <div style={styles.sessionGrid}>
                <div>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={currentSession.date}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "date",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Location</label>
                  <select
                    value={currentSession.location}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "location",
                        e.target.value
                      )
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
                        activeTargetBenchmark,
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
                        activeTargetBenchmark,
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
                        activeTargetBenchmark,
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
                        activeTargetBenchmark,
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
                            handleIntervalResultChange(
                              selectedGoal,
                              activeTargetBenchmark,
                              index,
                              "yes"
                            )
                          }
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          style={styles.intervalButton(result === "no")}
                          onClick={() =>
                            handleIntervalResultChange(
                              selectedGoal,
                              activeTargetBenchmark,
                              index,
                              "no"
                            )
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
                    handleSessionChange(
                      selectedGoal,
                      activeTargetBenchmark,
                      "notes",
                      e.target.value
                    )
                  }
                  style={styles.textarea}
                  placeholder="Add notes about the session..."
                />
              </div>

              <button
                onClick={() =>
                  saveSessionEntry(selectedGoal, activeTargetBenchmark)
                }
                style={styles.buttonPrimary}
              >
                Save Interval Session
              </button>
            </>
          ) : (
            <>
              <div style={styles.sessionGrid}>
                <div>
                  <label style={styles.label}>Date</label>
                  <input
                    type="date"
                    value={currentSession.date}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "date",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Location</label>
                  <select
                    value={currentSession.location}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "location",
                        e.target.value
                      )
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
                        activeTargetBenchmark,
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
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "score",
                        e.target.value
                      )
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
                          activeTargetBenchmark,
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
                    handleSessionChange(
                      selectedGoal,
                      activeTargetBenchmark,
                      "notes",
                      e.target.value
                    )
                  }
                  style={styles.textarea}
                  placeholder="Add notes about the session..."
                />
              </div>

              <button
                onClick={() =>
                  saveSessionEntry(selectedGoal, activeTargetBenchmark)
                }
                style={styles.buttonPrimary}
              >
                Save Session
              </button>
            </>
          )}
        </div>
      );
    };

    return (
      <>
        {renderStudentSelect()}

        <div style={styles.card}>
          <div
            style={{
              ...styles.rowGap,
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>
              Progress Monitoring
            </h2>
            <button
              onClick={() => setShowGoalDetails((prev) => !prev)}
              style={styles.buttonLight}
            >
              {showGoalDetails ? "Hide Details" : "Show Details"}
            </button>
          </div>

          {selectedStudent.goals.length === 0 ? (
            <div>No goals added for this student yet.</div>
          ) : (
            <>
              <div style={styles.smallText}>
                Click a goal below to open its monitoring area.
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
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setSelectedBenchmarkId(goal.benchmarks?.[0]?.id || "");
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#1e3a8a",
                          marginBottom: "8px",
                        }}
                      >
                        {goal.goalTitle}
                      </div>
                      <div style={{ lineHeight: 1.6 }}>{goal.fullGoalText}</div>
                    </div>
                  );
                })}
              </div>

              {selectedGoal && renderRecordDataBox()}
            </>
          )}
        </div>

        {selectedGoal && showGoalDetails && (
          <div style={styles.card}>
            <h3 style={styles.subTitle}>{selectedGoal.goalTitle}</h3>

            <div style={styles.infoBlock}>
              <div
                style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}
              >
                Full Goal Text
              </div>
              <div style={{ lineHeight: 1.6 }}>{selectedGoal.fullGoalText || "-"}</div>
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
                  Examples / Definition
                </div>
                <div>{selectedGoal.examplesDefinition || "-"}</div>
              </div>

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

              <div style={styles.infoBlock}>
                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    marginBottom: "8px",
                  }}
                >
                  Collection Method
                </div>
                <div>
                  {selectedGoal.collectionMethod === "interval"
                    ? "Interval Data"
                    : "Rating Scale"}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontWeight: 800,
                  color: "#1e3a8a",
                  fontSize: "16px",
                  marginBottom: "10px",
                }}
              >
                Short-Term Benchmarks/Objectives
              </div>

              {!selectedGoal.benchmarks.length ? (
                <div style={styles.infoBlock}>
                  No short-term benchmarks/objectives have been added. Data will be
                  recorded on the goal.
                </div>
              ) : (
                selectedGoal.benchmarks.map((benchmark) => {
                  const isSelected = selectedBenchmark?.id === benchmark.id;
                  return (
                    <div
                      key={benchmark.id}
                      style={
                        isSelected
                          ? styles.selectedBenchmarkCard
                          : styles.benchmarkCardClickable
                      }
                      onClick={() => setSelectedBenchmarkId(benchmark.id)}
                    >
                      <div
                        style={{
                          ...styles.rowGap,
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: "220px", lineHeight: 1.5 }}>
                          {benchmark.text}
                        </div>
                        <div style={{ minWidth: "220px" }}>
                          <label style={styles.label}>Status</label>
                          <select
                            value={benchmark.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              updateBenchmarkStatus(
                                selectedGoal.id,
                                benchmark.id,
                                e.target.value
                              )
                            }
                            style={styles.input}
                          >
                            {BENCHMARK_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderStudentProgress = () => (
    <>
      {renderStudentSelect()}
      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <h2 style={{ ...styles.cardTitle, marginBottom: 0 }}>Student Progress</h2>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={exportCSV} style={styles.buttonSecondary}>
              Export CSV
            </button>
            <button onClick={clearAllSavedSessions} style={styles.buttonRed}>
              Clear Saved Sessions
            </button>
          </div>
        </div>

        {!selectedStudent ? (
          <div>No student selected.</div>
        ) : (
          <>
            <h3 style={{ ...styles.subTitle, marginTop: "4px" }}>Progress Graphs</h3>
            {graphGroups.map((group) => (
              <GraphCard
                key={group.id}
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
                      <th style={styles.th}>Benchmark / Objective</th>
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
                        <td style={styles.td}>{entry.goalTitle}</td>
                        <td style={styles.td}>
                          {entry.targetType === "benchmark"
                            ? entry.benchmarkText
                            : "Goal Level"}
                        </td>
                        <td style={styles.td}>{entry.location || "-"}</td>
                        <td style={styles.td}>{entry.collectedBy || "-"}</td>
                        <td style={styles.td}>
                          {entry.collectionMethod === "interval" ? "Interval" : "Rating"}
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
    </>
  );

  if (showAccessScreen) {
    return renderAccessScreen();
  }

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
        {isDemoMode && (
          <div
            style={{
              background: "#fef3c7",
              color: "#92400e",
              border: "1px solid #fcd34d",
              padding: "14px 16px",
              borderRadius: "16px",
              marginBottom: "18px",
              fontWeight: 700,
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
            }}
          >
            Demo Mode — Start with Johnny, open Progress Monitoring, and then view Student Progress to see growth over time.
          </div>
        )}

        <div style={styles.hero}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <h1 style={styles.heroTitle}>RaMP Tracker</h1>
              <div style={styles.heroText}>
                {isDemoMode
                  ? "Previewing sample student data with demo goals, sample sessions, and example progress."
                  : "Track progress. Build skills. Support growth across school, home, and therapy using clear prompt-level and interval data."}
              </div>
            </div>

            <button onClick={backToStart} style={styles.buttonLight}>
              Back to Start
            </button>
          </div>
        </div>

        <div style={styles.tabsWrap}>
          <button
            style={
              activeTab === "studentDashboard" ? styles.activeTab : styles.tab
            }
            onClick={() => setActiveTab("studentDashboard")}
          >
            Student Dashboard
          </button>
          <button
            style={
              activeTab === "progressMonitoring" ? styles.activeTab : styles.tab
            }
            onClick={() => setActiveTab("progressMonitoring")}
          >
            Progress Monitoring
          </button>
          <button
            style={
              activeTab === "studentProgress" ? styles.activeTab : styles.tab
            }
            onClick={() => setActiveTab("studentProgress")}
          >
            Student Progress
          </button>
        </div>

        <div style={styles.content}>
          {activeTab === "studentDashboard" && renderStudentDashboard()}
          {activeTab === "progressMonitoring" && renderProgressMonitoring()}
          {activeTab === "studentProgress" && renderStudentProgress()}
        </div>
      </div>
    </div>
  );
}
