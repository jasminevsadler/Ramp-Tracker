
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

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
  "at home",
  "at specials",
  "in the cafeteria",
  "in the classroom",
  "in the community",
  "in the crisis room",
  "in the gym",
  "in the hallway",
  "in the resource room",
  "in the small group setting",
  "in the therapy room",
  "on the bus",
  "on the playground",
  "Other",
];

const COLLECTED_BY_OPTIONS = [
  "Administrator",
  "BCBA",
  "Behavior Specialist",
  "Counselor",
  "OT",
  "Parent/Caregiver",
  "Paraprofessional",
  "PT",
  "RBT",
  "SLP",
  "Student",
  "Teacher",
  "Other",
];

const PROMPT_OPTIONS = [
  "Gestural",
  "Verbal",
  "Model",
  "Partial Physical",
  "Full Physical",
];

const REINFORCEMENT_OPTIONS = [
  "Praise",
  "Token",
  "Break",
  "Preferred Item",
  "Preferred Activity",
  "Other",
];

const INTERVAL_TYPES = ["Whole Interval"];

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
    id: "student-liam",
    name: "Liam Carter",
    grade: "3",
    supportPerson: "Ms. Williams",
    disabilities: ["ADHD", "Specific Learning Disability"],
    setting: "School",
    goals: [
      {
        id: "goal-following-directions",
        goalTitle: "Task Initiation",
        fullGoalText:
          "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
        benchmarks: [
          {
            id: "benchmark-directions-1",
            text: "Begin the first step of an assignment within 2 minutes with verbal prompting.",
            status: "Current",
          },
          {
            id: "benchmark-liam-task-2",
            text: "Begin the first step of an assignment within 2 minutes independently.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: writes name on paper, opens the assignment, completes the first problem, or starts the first step after directions are given.",
        baseline: "1/5 opportunities independently",
        mastery: "4/5 opportunities independently across 3 consecutive sessions",
        collectionMethod: "rating",
      },
      {
        id: "goal-liam-work-completion",
        goalTitle: "Work Completion",
        fullGoalText:
          "During independent work, Liam will remain engaged and complete assigned tasks with no more than one reminder during a 10-minute work period.",
        benchmarks: [
          {
            id: "benchmark-liam-work-1",
            text: "Remain engaged for 7 out of 10 whole intervals with adult support.",
            status: "Current",
          },
          {
            id: "benchmark-liam-work-2",
            text: "Remain engaged for 8 out of 10 whole intervals with no more than one reminder.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: keeps pencil moving, looks at the assignment, answers questions, returns to task after redirection, or completes the expected part of the activity.",
        baseline: "5/10 intervals engaged",
        mastery: "80% or higher engagement across 3 consecutive sessions",
        collectionMethod: "interval",
      },
    ],
  },
  {
    id: "student-ava",
    name: "Ava Johnson",
    grade: "1",
    supportPerson: "Mr. Patel",
    disabilities: ["Speech or Language Impairment", "Developmental Delay"],
    setting: "School",
    goals: [
      {
        id: "goal-ava-communication",
        goalTitle: "Functional Communication",
        fullGoalText:
          "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
        benchmarks: [
          {
            id: "benchmark-ava-communication-1",
            text: "Use a taught phrase, picture, or gesture to request help with prompting.",
            status: "Current",
          },
          {
            id: "benchmark-ava-communication-2",
            text: "Use a taught phrase, picture, or gesture to request help independently.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: says 'help please,' points to a help card, asks for a break, raises hand, or gives a picture card to an adult.",
        baseline: "Requests help in 2/10 observed opportunities",
        mastery: "Uses functional communication in 8/10 opportunities across 3 sessions",
        collectionMethod: "interval",
      },
      {
        id: "goal-ava-peer-play",
        goalTitle: "Peer Interaction",
        fullGoalText:
          "During structured play or partner activities, Ava will engage in positive peer interaction by taking turns, sharing materials, or responding to a peer.",
        benchmarks: [
          {
            id: "benchmark-ava-peer-1",
            text: "Respond to a peer interaction with adult support.",
            status: "Current",
          },
          {
            id: "benchmark-ava-peer-2",
            text: "Initiate or respond to a peer interaction independently.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: shares blocks, answers a peer, takes a turn, says hello, asks to join, or follows a simple play routine.",
        baseline: "1/5 opportunities independently",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
    ],
  },
  {
    id: "student-mason",
    name: "Mason Lee",
    grade: "5",
    supportPerson: "Ms. Rivera",
    disabilities: ["Autism", "Emotional/Behavioral Disability"],
    setting: "School",
    goals: [
      {
        id: "goal-mason-task-avoidance",
        goalTitle: "Task-Avoidance Behavior",
        fullGoalText:
          "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
        benchmarks: [
          {
            id: "benchmark-mason-avoidance-1",
            text: "Use a replacement strategy with adult prompting when frustrated.",
            status: "Current",
          },
          {
            id: "benchmark-mason-avoidance-2",
            text: "Use a replacement strategy independently before leaving the task area.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples of task avoidance: head down, leaving seat, arguing, refusing, tearing paper, or delaying task start. Replacement strategies include asking for help or requesting a break.",
        baseline: "Average 9 minutes of task-avoidance behavior per session",
        mastery: "Average 3 minutes or less across 3 consecutive sessions",
        collectionMethod: "duration",
      },
      {
        id: "goal-mason-calm-strategy",
        goalTitle: "Calm Strategy Use",
        fullGoalText:
          "When frustrated, Mason will use one taught calm strategy before escalating, such as breathing, asking for help, using a break card, or using calm words.",
        benchmarks: [
          {
            id: "benchmark-mason-calm-1",
            text: "Use one calm strategy with verbal or model prompting.",
            status: "Current",
          },
          {
            id: "benchmark-mason-calm-2",
            text: "Use one calm strategy independently before escalation.",
            status: "Not Started",
          },
        ],
        examplesDefinition:
          "Examples: uses break card, says 'I need help,' takes deep breaths, asks for space, or uses a taught script instead of yelling or refusing.",
        baseline: "1/5 opportunities with support",
        mastery: "4/5 opportunities across 3 consecutive sessions",
        collectionMethod: "rating",
      },
    ],
  },
];

const DEMO_HISTORY = [
  {
    "id": "demo-liam-task-1",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-22",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Verbal",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Started after one verbal reminder and praise."
  },
  {
    "id": "demo-liam-task-2",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-24",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Gestural",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Needed a gesture toward the first problem before beginning."
  },
  {
    "id": "demo-liam-task-3",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-28",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Opened assignment and began independently."
  },
  {
    "id": "demo-liam-task-4",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-01",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Verbal",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Brief verbal prompt needed after directions."
  },
  {
    "id": "demo-liam-task-5",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-05",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Began the first step independently within one minute."
  },
  {
    "id": "demo-liam-task-6",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-following-directions",
    "goalTitle": "Task Initiation",
    "fullGoalText": "When given an independent work task, Liam will begin the first step within 2 minutes using no more than verbal prompting across classroom activities.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-directions-1",
    "benchmarkText": "Begin the first step of an assignment within 2 minutes with verbal prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-08",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Started independently and earned positive praise."
  },
  {
    "id": "demo-liam-work-1",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-liam-work-completion",
    "goalTitle": "Work Completion",
    "fullGoalText": "During independent work, Liam will remain engaged and complete assigned tasks with no more than one reminder during a 10-minute work period.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-liam-work-1",
    "benchmarkText": "Remain engaged for 7 out of 10 whole intervals with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-04-23",
    "location": "in the small group setting",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no",
      "no"
    ],
    "yesCount": 6,
    "percent": 60,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Returned to task after two reminders."
  },
  {
    "id": "demo-liam-work-2",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-liam-work-completion",
    "goalTitle": "Work Completion",
    "fullGoalText": "During independent work, Liam will remain engaged and complete assigned tasks with no more than one reminder during a 10-minute work period.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-liam-work-1",
    "benchmarkText": "Remain engaged for 7 out of 10 whole intervals with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-04-29",
    "location": "in the small group setting",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no"
    ],
    "yesCount": 7,
    "percent": 70,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Stayed engaged for most intervals with one break."
  },
  {
    "id": "demo-liam-work-3",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-liam-work-completion",
    "goalTitle": "Work Completion",
    "fullGoalText": "During independent work, Liam will remain engaged and complete assigned tasks with no more than one reminder during a 10-minute work period.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-liam-work-1",
    "benchmarkText": "Remain engaged for 7 out of 10 whole intervals with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-05-03",
    "location": "in the small group setting",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no"
    ],
    "yesCount": 8,
    "percent": 80,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Token"
    ],
    "reinforcementOther": "",
    "notes": "Completed the expected portion with one reminder."
  },
  {
    "id": "demo-liam-work-4",
    "studentId": "student-liam",
    "studentName": "Liam Carter",
    "grade": "3",
    "supportPerson": "Ms. Williams",
    "disabilities": "ADHD, Specific Learning Disability",
    "setting": "School",
    "goalId": "goal-liam-work-completion",
    "goalTitle": "Work Completion",
    "fullGoalText": "During independent work, Liam will remain engaged and complete assigned tasks with no more than one reminder during a 10-minute work period.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-liam-work-1",
    "benchmarkText": "Remain engaged for 7 out of 10 whole intervals with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-05-09",
    "location": "in the small group setting",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no"
    ],
    "yesCount": 9,
    "percent": 90,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Token"
    ],
    "reinforcementOther": "",
    "notes": "Strong engagement during independent work."
  },
  {
    "id": "demo-ava-comm-1",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-communication",
    "goalTitle": "Functional Communication",
    "fullGoalText": "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-communication-1",
    "benchmarkText": "Use a taught phrase, picture, or gesture to request help with prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-22",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "SLP",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no",
      "no",
      "no",
      "no",
      "no"
    ],
    "yesCount": 3,
    "percent": 30,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Preferred Activity"
    ],
    "reinforcementOther": "",
    "notes": "Used help card after adult model."
  },
  {
    "id": "demo-ava-comm-2",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-communication",
    "goalTitle": "Functional Communication",
    "fullGoalText": "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-communication-1",
    "benchmarkText": "Use a taught phrase, picture, or gesture to request help with prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-25",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no",
      "no",
      "no",
      "no"
    ],
    "yesCount": 4,
    "percent": 40,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Preferred Activity"
    ],
    "reinforcementOther": "",
    "notes": "Requested help with verbal prompting."
  },
  {
    "id": "demo-ava-comm-3",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-communication",
    "goalTitle": "Functional Communication",
    "fullGoalText": "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-communication-1",
    "benchmarkText": "Use a taught phrase, picture, or gesture to request help with prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-30",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "SLP",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no",
      "no"
    ],
    "yesCount": 6,
    "percent": 60,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Preferred Activity"
    ],
    "reinforcementOther": "",
    "notes": "Used picture card during center work."
  },
  {
    "id": "demo-ava-comm-4",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-communication",
    "goalTitle": "Functional Communication",
    "fullGoalText": "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-communication-1",
    "benchmarkText": "Use a taught phrase, picture, or gesture to request help with prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-06",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no",
      "no"
    ],
    "yesCount": 7,
    "percent": 70,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Preferred Activity"
    ],
    "reinforcementOther": "",
    "notes": "Requested help and a break with fewer prompts."
  },
  {
    "id": "demo-ava-comm-5",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-communication",
    "goalTitle": "Functional Communication",
    "fullGoalText": "During classroom activities, Ava will use functional communication to request help, a break, or needed materials instead of shutting down or leaving the area.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-communication-1",
    "benchmarkText": "Use a taught phrase, picture, or gesture to request help with prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-10",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "interval",
    "intervalType": "Whole Interval",
    "sessionLength": 10,
    "intervalLength": 1,
    "totalIntervals": 10,
    "intervalResults": [
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "yes",
      "no",
      "no"
    ],
    "yesCount": 8,
    "percent": 80,
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Preferred Activity"
    ],
    "reinforcementOther": "",
    "notes": "Used help request independently several times."
  },
  {
    "id": "demo-ava-peer-1",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-peer-play",
    "goalTitle": "Peer Interaction",
    "fullGoalText": "During structured play or partner activities, Ava will engage in positive peer interaction by taking turns, sharing materials, or responding to a peer.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-peer-1",
    "benchmarkText": "Respond to a peer interaction with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-04-24",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Model",
    "strategiesUsed": [
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Responded to peer after adult model."
  },
  {
    "id": "demo-ava-peer-2",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-peer-play",
    "goalTitle": "Peer Interaction",
    "fullGoalText": "During structured play or partner activities, Ava will engage in positive peer interaction by taking turns, sharing materials, or responding to a peer.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-peer-1",
    "benchmarkText": "Respond to a peer interaction with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-05-01",
    "location": "in the classroom",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Verbal",
    "strategiesUsed": [
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Shared materials after a verbal prompt."
  },
  {
    "id": "demo-ava-peer-3",
    "studentId": "student-ava",
    "studentName": "Ava Johnson",
    "grade": "1",
    "supportPerson": "Mr. Patel",
    "disabilities": "Speech or Language Impairment, Developmental Delay",
    "setting": "School",
    "goalId": "goal-ava-peer-play",
    "goalTitle": "Peer Interaction",
    "fullGoalText": "During structured play or partner activities, Ava will engage in positive peer interaction by taking turns, sharing materials, or responding to a peer.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-ava-peer-1",
    "benchmarkText": "Respond to a peer interaction with adult support.",
    "benchmarkStatus": "Current",
    "date": "2026-05-08",
    "location": "on the playground",
    "customLocation": "",
    "collectedBy": "Teacher",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Took turns during partner activity independently."
  },
  {
    "id": "demo-mason-avoid-1",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-task-avoidance",
    "goalTitle": "Task-Avoidance Behavior",
    "fullGoalText": "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-avoidance-1",
    "benchmarkText": "Use a replacement strategy with adult prompting when frustrated.",
    "benchmarkStatus": "Current",
    "date": "2026-04-21",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "duration",
    "durationValue": "9",
    "durationUnit": "minutes",
    "durationBehavior": "task-avoidance behavior",
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Break",
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Left seat and delayed starting during writing."
  },
  {
    "id": "demo-mason-avoid-2",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-task-avoidance",
    "goalTitle": "Task-Avoidance Behavior",
    "fullGoalText": "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-avoidance-1",
    "benchmarkText": "Use a replacement strategy with adult prompting when frustrated.",
    "benchmarkStatus": "Current",
    "date": "2026-04-25",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "duration",
    "durationValue": "8",
    "durationUnit": "minutes",
    "durationBehavior": "task-avoidance behavior",
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Break",
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Avoidance decreased after break card prompt."
  },
  {
    "id": "demo-mason-avoid-3",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-task-avoidance",
    "goalTitle": "Task-Avoidance Behavior",
    "fullGoalText": "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-avoidance-1",
    "benchmarkText": "Use a replacement strategy with adult prompting when frustrated.",
    "benchmarkStatus": "Current",
    "date": "2026-04-30",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "duration",
    "durationValue": "6",
    "durationUnit": "minutes",
    "durationBehavior": "task-avoidance behavior",
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Break",
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Used help request after verbal prompt."
  },
  {
    "id": "demo-mason-avoid-4",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-task-avoidance",
    "goalTitle": "Task-Avoidance Behavior",
    "fullGoalText": "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-avoidance-1",
    "benchmarkText": "Use a replacement strategy with adult prompting when frustrated.",
    "benchmarkStatus": "Current",
    "date": "2026-05-05",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "duration",
    "durationValue": "5",
    "durationUnit": "minutes",
    "durationBehavior": "task-avoidance behavior",
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Break",
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Returned to task after using break card."
  },
  {
    "id": "demo-mason-avoid-5",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-task-avoidance",
    "goalTitle": "Task-Avoidance Behavior",
    "fullGoalText": "During academic tasks, Mason will reduce task-avoidance behaviors by using a taught replacement strategy such as requesting help, requesting a break, or beginning the first step.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-avoidance-1",
    "benchmarkText": "Use a replacement strategy with adult prompting when frustrated.",
    "benchmarkStatus": "Current",
    "date": "2026-05-09",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "duration",
    "durationValue": "3",
    "durationUnit": "minutes",
    "durationBehavior": "task-avoidance behavior",
    "score": "",
    "promptLevel": "",
    "strategiesUsed": [
      "Prompting",
      "Modeling",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Break",
      "Praise"
    ],
    "reinforcementOther": "",
    "notes": "Brief avoidance; used replacement strategy quickly."
  },
  {
    "id": "demo-mason-calm-1",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-calm-strategy",
    "goalTitle": "Calm Strategy Use",
    "fullGoalText": "When frustrated, Mason will use one taught calm strategy before escalating, such as breathing, asking for help, using a break card, or using calm words.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-calm-1",
    "benchmarkText": "Use one calm strategy with verbal or model prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-23",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Model",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Modeled breathing before he used the strategy."
  },
  {
    "id": "demo-mason-calm-2",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-calm-strategy",
    "goalTitle": "Calm Strategy Use",
    "fullGoalText": "When frustrated, Mason will use one taught calm strategy before escalating, such as breathing, asking for help, using a break card, or using calm words.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-calm-1",
    "benchmarkText": "Use one calm strategy with verbal or model prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-04-29",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "1",
    "promptLevel": "Verbal",
    "strategiesUsed": [
      "Modeling",
      "Prompting",
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Used break card after verbal reminder."
  },
  {
    "id": "demo-mason-calm-3",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-calm-strategy",
    "goalTitle": "Calm Strategy Use",
    "fullGoalText": "When frustrated, Mason will use one taught calm strategy before escalating, such as breathing, asking for help, using a break card, or using calm words.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-calm-1",
    "benchmarkText": "Use one calm strategy with verbal or model prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-04",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Asked for help before escalating."
  },
  {
    "id": "demo-mason-calm-4",
    "studentId": "student-mason",
    "studentName": "Mason Lee",
    "grade": "5",
    "supportPerson": "Ms. Rivera",
    "disabilities": "Autism, Emotional/Behavioral Disability",
    "setting": "School",
    "goalId": "goal-mason-calm-strategy",
    "goalTitle": "Calm Strategy Use",
    "fullGoalText": "When frustrated, Mason will use one taught calm strategy before escalating, such as breathing, asking for help, using a break card, or using calm words.",
    "targetType": "benchmark",
    "benchmarkId": "benchmark-mason-calm-1",
    "benchmarkText": "Use one calm strategy with verbal or model prompting.",
    "benchmarkStatus": "Current",
    "date": "2026-05-11",
    "location": "in the resource room",
    "customLocation": "",
    "collectedBy": "Behavior Specialist",
    "customCollectedBy": "",
    "collectionMethod": "rating",
    "score": "2",
    "promptLevel": "",
    "strategiesUsed": [
      "Reinforcement"
    ],
    "reinforcementTypes": [
      "Praise",
      "Break"
    ],
    "reinforcementOther": "",
    "notes": "Used calm words and requested a break independently."
  }
];

const DEMO_URL_KEYS = ["demo", "mode"]

function isDemoUrl() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const demoParam = params.get("demo");
  const modeParam = params.get("mode");
  const hash = window.location.hash.toLowerCase();

  return (
    demoParam === "1" ||
    demoParam === "true" ||
    modeParam === "demo" ||
    hash.includes("demo")
  );
}

function buildStorageKey(isDemoMode, name) {
  return `${isDemoMode ? "ramp_demo" : "ramp"}_${name}`;
}

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
            ["interval", "duration"].includes(goal.collectionMethod) ? goal.collectionMethod : "rating",
        }))
      : [],
  }));
}

function GraphCard({ title, points, mode, targetValue = null, targetLabel = "Goal" }) {
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
  const maxY = mode === "interval" ? 100 : mode === "duration" ? Math.max(10, ...sorted.map((point) => Number(point.value || 0))) : 2;

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

  const ticks = mode === "interval" ? [0, 25, 50, 75, 100] : mode === "duration" ? [0, Math.round(maxY / 2), maxY] : [0, 1, 2];
  const showTargetLine =
    targetValue !== null &&
    targetValue !== undefined &&
    !Number.isNaN(Number(targetValue)) &&
    Number(targetValue) >= 0 &&
    Number(targetValue) <= maxY;
  const targetY = showTargetLine ? yForValue(Number(targetValue)) : null;

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

          {showTargetLine && (
            <g>
              <line
                x1={padLeft}
                y1={targetY}
                x2={padLeft + chartWidth}
                y2={targetY}
                stroke="#dc2626"
                strokeWidth="3"
                strokeDasharray="10 6"
              />
              <text
                x={padLeft + chartWidth - 4}
                y={targetY - 6}
                fontSize="11"
                textAnchor="end"
                fill="#b91c1c"
                fontWeight="700"
              >
                {targetLabel}
              </text>
            </g>
          )}

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
          : mode === "duration"
            ? "Graph shows total duration recorded for each session."
            : "0 = Not demonstrating • 1 = With prompts • 2 = Independent"}
        {showTargetLine ? ` Goal line: ${targetLabel}.` : ""}
      </div>
    </div>
  );
}


function LandingScreen({
  onDemo,
  onLogin,
  onWatchTour
}) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #edf4ff 0%, #ffffff 100%)",
      padding: "20px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "500px",
        background: "white",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        textAlign: "center"
      }}>

        <h1 style={{
          fontSize: "38px",
          marginBottom: "10px",
          color: "#1f2937"
        }}>
          RaMP Tracker
        </h1>

        <p style={{
          fontSize: "18px",
          lineHeight: "1.5",
          color: "#4b5563",
          marginBottom: "30px"
        }}>
          Track IEP goals, prompting, behavior,
          and progress in seconds.
        </p>

        <button
          onClick={onLogin}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            border: "none",
            background: "#7c3aed",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Start Free 14-Day Trial
        </button>

        <p style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "24px"
        }}>
          Full access • No credit card required
        </p>

        <button
          onClick={onDemo}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "2px solid #7c3aed",
            background: "white",
            color: "#7c3aed",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "14px"
          }}
        >
          Try Demo
        </button>

    

<div style={{
  marginTop: "24px",
  background: "#ffffff",
  borderRadius: "18px",
  padding: "16px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  textAlign: "center"
}}>
  <h3 style={{
    marginBottom: "8px",
    color: "#4b2e83"
  }}>
    Watch the Video Tour
  </h3>

  <p style={{
    fontSize: "14px",
    color: "#555",
    marginBottom: "12px"
  }}>
    See how RaMP Tracker helps you record data, monitor progress, and generate notes quickly.
  </p>

  <video
    controls
    playsInline
    preload="metadata"
    style={{
      width: "100%",
      maxWidth: "320px",
      borderRadius: "20px",
      border: "1px solid #ddd",
        display: "block",
    margin: "0 auto"
    }}
  >
    <source src="/ramp-preview.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

<div style={{
  marginTop: "40px",
  textAlign: "left"
}}>






          
          

          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ marginBottom: "5px" }}>
              Record Data Fast
            </h3>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Track prompts, intervals, duration,
              and behaviors quickly.
            </p>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ marginBottom: "5px" }}>
              Auto-Generate Notes
            </h3>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Turn session data into documentation instantly.
            </p>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <h3 style={{ marginBottom: "5px" }}>
              Monitor Progress
            </h3>
            <p style={{ color: "#6b7280", margin: 0 }}>
              View graphs, trends, and mastery over time.
            </p>
          </div>

          <div>
            <h3 style={{ marginBottom: "5px" }}>
              Organize Everything
            </h3>
            <p style={{ color: "#6b7280", margin: 0 }}>
              Students, goals, benchmarks,
              and history all in one place.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function App() {
  // Demo-first launch: visitors can explore first, then log in to save real data.
  const [showGate, setShowGate] = useState(false);
  const [showLandingScreen, setShowLandingScreen] = useState(true);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(null);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [progressFilterResetKey, setProgressFilterResetKey] = useState(0);
  const [user, setUser] = useState(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudStatus, setCloudStatus] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return isDemoUrl() || localStorage.getItem("ramp_user") !== "true";
  });

  const storageKey = (name) => buildStorageKey(isDemoMode, name);
  const isReadOnlyDemo = isDemoMode;
  const demoTheme = isDemoMode
    ? {
        pageBackground: "linear-gradient(180deg, #f6f0ff 0%, #fbf7ff 40%, #ffffff 100%)",
        heroBackground: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 55%, #c084fc 100%)",
        heroShadow: "0 20px 50px rgba(168, 85, 247, 0.22)",
        focusBorder: "#a855f7",
        focusShadow: "rgba(168,85,247,0.18)",
        accent: "#7c3aed",
        accentDark: "#6d28d9",
        accentSoft: "#ede9fe",
        accentBorder: "#d8b4fe",
        accentText: "#5b21b6",
        cardBorder: "#ddd6fe",
        tabBorder: "#d8b4fe",
        selectedBorder: "#8b5cf6",
      }
    : {
        pageBackground: "linear-gradient(180deg, #edf4ff 0%, #f6fbff 40%, #ffffff 100%)",
        heroBackground: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 55%, #60a5fa 100%)",
        heroShadow: "0 20px 50px rgba(37, 99, 235, 0.20)",
        focusBorder: "#3b82f6",
        focusShadow: "rgba(59,130,246,0.15)",
        accent: "#2563eb",
        accentDark: "#1d4ed8",
        accentSoft: "#eff6ff",
        accentBorder: "#bfdbfe",
        accentText: "#1e3a8a",
        cardBorder: "#dbeafe",
        tabBorder: "#bfdbfe",
        selectedBorder: "#2563eb",
      };

  const showDemoStructureLockedMessage = () => {
  setShowUpgradePopup(true);
};

const showDemoUnsavedMessage = () => {
  setShowUpgradePopup(true);
};

  const handleAuth = async () => {
    setAuthMessage("");
    if (!authEmail || !authPassword) {
      setAuthMessage("Enter your email and password.");
      return;
    }

    const { data, error } = authMode === "signup"
      ? await supabase.auth.signUp({ email: authEmail, password: authPassword })
      : await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    if (authMode === "signup" && !data.session) {
      setAuthMessage("Account created. Check your email if Supabase asks you to confirm before logging in.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("ramp_user");
    setUser(null);
    setCloudReady(false);
    setIsDemoMode(true);
    setStudents(normalizeStudents(DEFAULT_STUDENTS));
    setHistory(DEMO_HISTORY);
    setSessionData({});
    setActiveTab("studentDashboard");
  };

  const [students, setStudents] = useState(() =>
    isDemoMode
      ? normalizeStudents(DEFAULT_STUDENTS)
      : normalizeStudents(loadFromStorage(storageKey("students"), DEFAULT_STUDENTS))
  );
  const [selectedStudentId, setSelectedStudentId] = useState(() =>
    isDemoMode
      ? DEFAULT_STUDENTS[0]?.id || ""
      : loadFromStorage(storageKey("selected_student"), DEFAULT_STUDENTS[0]?.id || "")
  );
  const [selectedGoalId, setSelectedGoalId] = useState(() =>
    isDemoMode ? "goal-following-directions" : loadFromStorage(storageKey("selected_goal"), "")
  );
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState(() =>
    isDemoMode ? "benchmark-directions-1" : loadFromStorage(storageKey("selected_benchmark"), "")
  );
  const [showGoalDetails, setShowGoalDetails] = useState(() =>
    isDemoMode ? true : loadFromStorage(storageKey("show_goal_details"), false)
  );
  const [sessionData, setSessionData] = useState(() =>
    isDemoMode ? {} : loadFromStorage(storageKey("session_data"), {})
  );
  const [history, setHistory] = useState(() =>
    isDemoMode ? DEMO_HISTORY : loadFromStorage(storageKey("session_history"), [])
  );
  const [activeTab, setActiveTab] = useState(() =>
    isDemoMode ? "studentDashboard" : loadFromStorage(storageKey("active_tab"), "studentDashboard")
  );
  const [progressDateRange, setProgressDateRange] = useState({ start: "", end: "" });
  const [showAddStudentForm, setShowAddStudentForm] = useState(isDemoMode);
  const [studentForm, setStudentForm] = useState({
    name: "",
    grade: "",
    supportPerson: "",
    disabilities: [],
    setting: "",
  });

  const [previewTemplateLabel, setPreviewTemplateLabel] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      if (currentUser && !isDemoUrl()) {
        localStorage.setItem("ramp_user", "true");
        setIsDemoMode(false);
        setShowGate(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem("ramp_user", "true");
        setIsDemoMode(false);
        setShowGate(false);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user || isDemoMode) return;

    const loadCloudData = async () => {
      setCloudReady(false);
      setCloudStatus("Loading saved data...");

      const [{ data: studentRows, error: studentError }, { data: historyRows, error: historyError }] =
        await Promise.all([
          supabase.from("students").select("*").eq("user_id", user.id).order("name", { ascending: true }),
          supabase.from("session_data").select("*").eq("user_id", user.id).order("created_at", { ascending: true }),
        ]);

      if (studentError || historyError) {
        setCloudStatus(studentError?.message || historyError?.message || "Could not load saved data.");
        setCloudReady(true);
        return;
      }

      const cloudStudents = (studentRows || [])
        .map((row) => row.data || { id: row.id, name: row.name, goals: [] })
        .filter(Boolean);
      const cloudHistory = (historyRows || []).map((row) => row.data).filter(Boolean);

      if (cloudStudents.length) {
        setStudents(normalizeStudents(cloudStudents));
        setSelectedStudentId(cloudStudents[0]?.id || "");
      } else {
        setStudents([]);
        setSelectedStudentId("");
      }
      setHistory(cloudHistory);
      setSessionData({});
      setCloudReady(true);
      setCloudStatus("Saved to cloud");
    };

    loadCloudData();
  }, [user, isDemoMode]);

  useEffect(() => {
    if (!user || isDemoMode || !cloudReady) return;

    const saveCloudData = async () => {
      setCloudStatus("Saving...");
      const studentRows = students.map((student) => ({
        user_id: user.id,
        name: student.name || "Student",
        data: student,
      }));

      const historyRows = history.map((entry) => ({
        user_id: user.id,
        data: entry,
      }));

      const { error: studentDeleteError } = await supabase.from("students").delete().eq("user_id", user.id);
      if (studentDeleteError) {
        setCloudStatus(studentDeleteError.message);
        return;
      }
      if (studentRows.length) {
        const { error } = await supabase.from("students").insert(studentRows);
        if (error) {
          setCloudStatus(error.message);
          return;
        }
      }

      const { error: historyDeleteError } = await supabase.from("session_data").delete().eq("user_id", user.id);
      if (historyDeleteError) {
        setCloudStatus(historyDeleteError.message);
        return;
      }
      if (historyRows.length) {
        const { error } = await supabase.from("session_data").insert(historyRows);
        if (error) {
          setCloudStatus(error.message);
          return;
        }
      }

      setCloudStatus("Saved to cloud");
    };

    const timeout = setTimeout(saveCloudData, 600);
    return () => clearTimeout(timeout);
  }, [students, history, user, isDemoMode, cloudReady]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("students"), JSON.stringify(students));
  }, [students, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("session_data"), JSON.stringify(sessionData));
  }, [sessionData, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("session_history"), JSON.stringify(history));
  }, [history, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("selected_student"), JSON.stringify(selectedStudentId));
  }, [selectedStudentId, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("selected_goal"), JSON.stringify(selectedGoalId));
  }, [selectedGoalId, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("selected_benchmark"), JSON.stringify(selectedBenchmarkId));
  }, [selectedBenchmarkId, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("show_goal_details"), JSON.stringify(showGoalDetails));
  }, [showGoalDetails, isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return;
    localStorage.setItem(storageKey("active_tab"), JSON.stringify(activeTab));
  }, [activeTab, isDemoMode]);

  const sortedStudents = useMemo(
    () => [...students].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [students]
  );

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) || sortedStudents[0],
    [students, selectedStudentId, sortedStudents]
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

  const filteredSavedHistory = useMemo(() => {
    return savedHistory.filter((entry) => {
      if (!progressDateRange.start && !progressDateRange.end) return true;
      if (!entry.date) return false;

      const entryDate = new Date(`${entry.date}T00:00:00`);
      if (progressDateRange.start) {
        const startDate = new Date(`${progressDateRange.start}T00:00:00`);
        if (entryDate < startDate) return false;
      }
      if (progressDateRange.end) {
        const endDate = new Date(`${progressDateRange.end}T23:59:59`);
        if (entryDate > endDate) return false;
      }
      return true;
    });
  }, [savedHistory, progressDateRange]);

  const progressSummary = useMemo(() => {
    const values = filteredSavedHistory
      .map((entry) =>
        entry.collectionMethod === "interval"
          ? Number(entry.percent ?? 0)
          : entry.collectionMethod === "duration"
            ? Number(entry.durationValue ?? 0)
            : Number(entry.score ?? 0)
      )
      .filter((value) => Number.isFinite(value));

    const lastEntry = [...filteredSavedHistory].sort((a, b) =>
      (a.date || "").localeCompare(b.date || "")
    ).at(-1);

    const lastValue = lastEntry
      ? lastEntry.collectionMethod === "interval"
        ? `${lastEntry.percent ?? 0}%`
        : lastEntry.collectionMethod === "duration"
          ? `${lastEntry.durationValue ?? 0} ${lastEntry.durationUnit ?? ""}`
          : `${lastEntry.score ?? 0}/2`
      : "—";

    const averageValue = values.length
      ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
      : null;

    return {
      totalEntries: filteredSavedHistory.length,
      lastValue,
      averageValue: averageValue === null ? "—" : averageValue,
    };
  }, [filteredSavedHistory]);

  const goalProgressSections = useMemo(() => {
    if (!selectedStudent) return [];

    return (selectedStudent.goals || []).map((goal) => {
      const relatedEntries = filteredSavedHistory
        .filter((entry) => entry.goalId === goal.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      const points = relatedEntries.map((entry) => ({
        date: entry.date,
        value:
          entry.collectionMethod === "interval"
            ? Number(entry.percent || 0)
            : entry.collectionMethod === "duration"
              ? Number(entry.durationValue || 0)
              : Number(entry.score || 0),
      }));

      const sortedEntries = [...relatedEntries].sort((a, b) => b.date.localeCompare(a.date));

      const activeObjectives = Array.from(
        new Set(
          relatedEntries
            .map((entry) =>
              entry.targetType === "benchmark" && entry.benchmarkText
                ? entry.benchmarkText
                : ""
            )
            .filter(Boolean)
        )
      );

      return {
        id: goal.id,
        title: goal.goalTitle,
        fullGoalText: goal.fullGoalText || goal.goalTitle,
        objectiveText: activeObjectives.length ? activeObjectives.join(" | ") : "Goal-level data",
        mode: goal.collectionMethod === "interval" ? "interval" : goal.collectionMethod === "duration" ? "duration" : "rating",
        targetValue:
          goal.collectionMethod === "interval"
            ? 80
            : goal.collectionMethod === "duration"
              ? null
              : 2,
        targetLabel:
          goal.collectionMethod === "interval"
            ? "Goal Line: 80%"
            : goal.collectionMethod === "duration"
              ? "Duration"
              : "Goal Line: 2 = Independent",
        points,
        entries: sortedEntries,
      };
    });
  }, [selectedStudent, filteredSavedHistory]);

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
    location: "in the classroom",
    customLocation: "",
    collectedBy: "Teacher",
    customCollectedBy: "",
    score: "",
    promptLevel: "",
    strategiesUsed: [],
    reinforcementTypes: [],
    reinforcementOther: "",
    notes: "",
    intervalType: "Whole Interval",
    sessionLength: 10,
    intervalLength: 1,
    intervalResults: Array(10).fill(""),
    durationValue: "",
    durationUnit: "minutes",
    durationBehavior: "",
    generatedNote: "",
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

  const formatNoteDate = (dateString) => {
    if (!dateString) return "this date";
    const [year, month, day] = dateString.split("-");
    if (!year || !month || !day) return dateString;
    return Number(month) + "/" + Number(day) + "/" + String(year).slice(-2);
  };

  const cleanLower = (value) => String(value || "").trim().toLowerCase();

  const getResolvedLocation = (entry) => {
    const selected = String(entry?.location || "").trim();
    if (selected === "Other") return String(entry?.customLocation || "the session setting").trim();
    return selected || "the session setting";
  };

  const getResolvedCollectedBy = (entry) => {
    const selected = String(entry?.collectedBy || "").trim();
    if (selected === "Other") return String(entry?.customCollectedBy || "staff").trim();
    return selected || "staff";
  };

  const formatLocationForNote = (location) => {
    const text = String(location || "the session setting").trim();
    const lower = text.toLowerCase();
    if (lower.startsWith("in ") || lower.startsWith("on ") || lower.startsWith("at ")) {
      return lower;
    }
    if (lower === "home") return "at home";
    return "in the " + lower;
  };

  const getReinforcementList = (entry) => {
    const items = [
      ...(entry?.reinforcementTypes || []),
      entry?.reinforcementOther ? entry.reinforcementOther : "",
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return [...new Set(items)];
  };

  const formatListForSentence = (items) => {
    const list = (items || []).filter(Boolean);
    if (!list.length) return "";
    if (list.length === 1) return cleanLower(list[0]);
    if (list.length === 2) return cleanLower(list[0]) + " and " + cleanLower(list[1]);
    return list.slice(0, -1).map(cleanLower).join(", ") + ", and " + cleanLower(list[list.length - 1]);
  };

  const buildReinforcementSentence = (entry) => {
    const reinforcements = getReinforcementList(entry);
    if (!reinforcements.length) return "";
    return " Reinforcement used during the session included " + formatListForSentence(reinforcements) + ".";
  };

  const buildAutoSessionNote = (student, goal, entry) => {
    if (!student || !goal || !entry) return "";

    const name = student.name || "the student";
    const dateText = formatNoteDate(entry.date);
    const person = getResolvedCollectedBy(entry);
    const locationText = formatLocationForNote(getResolvedLocation(entry));
    const goalText = cleanLower(goal.goalTitle || "the selected skill");

    if (goal.collectionMethod === "interval") {
      const sessionLength = Number(entry.sessionLength || 0);
      const intervalLength = Number(entry.intervalLength || 0);
      const intervalResults = syncIntervalArray(
        entry.intervalResults,
        sessionLength,
        intervalLength
      );
      const totalIntervals = intervalResults.length;
      const yesCount = intervalResults.filter((x) => x === "yes").length;
      const minuteText = sessionLength === 1 ? "1 minute" : (sessionLength || 0) + " minutes";

      return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " demonstrated " + goalText + " during " + yesCount + "/" + totalIntervals + " whole intervals over a " + minuteText + " period, indicating " + Math.round((yesCount / Math.max(totalIntervals, 1)) * 100) + "% engagement across the session." + buildReinforcementSentence(entry);
    }

    if (goal.collectionMethod === "duration") {
      const value = entry.durationValue || "___";
      const unit = entry.durationUnit || "minutes";
      const behaviorText = cleanLower(entry.durationBehavior || goalText);
      return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " engaged in " + behaviorText + " for a total duration of " + value + " " + unit + "." + buildReinforcementSentence(entry);
    }

    if (String(entry.score) === "0") {
      return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " worked on " + goalText + " and received a score of 0, indicating the skill was not demonstrated during this session." + buildReinforcementSentence(entry);
    }

    if (String(entry.score) === "1") {
      const promptText = cleanLower(entry.promptLevel || "selected");
      return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " worked on " + goalText + " and received a score of 1, completing the task with " + promptText + " prompting." + buildReinforcementSentence(entry);
    }

    if (String(entry.score) === "2") {
      return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " worked on " + goalText + " and received a score of 2, completing the task independently." + buildReinforcementSentence(entry);
    }

    return "On " + dateText + ", while working with the " + person + " " + locationText + ", " + name + " worked on " + goalText + "." + buildReinforcementSentence(entry);
  };

  const formatDateRangeText = (entries) => {
    const dates = entries
      .map((entry) => entry.date)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    if (!dates.length) return "During the selected date range";

    const firstDate = formatNoteDate(dates[0]);
    const lastDate = formatNoteDate(dates[dates.length - 1]);

    if (firstDate === lastDate) return "On " + firstDate;
    return "From " + firstDate + "-" + lastDate;
  };

  const getEntryPercentValue = (entry) => {
    if (!entry) return null;

    if (entry.collectionMethod === "interval") {
      const value = Number(entry.percent);
      return Number.isFinite(value) ? value : null;
    }

    if (entry.collectionMethod === "rating") {
      const score = Number(entry.score);
      if (!Number.isFinite(score)) return null;
      return Math.round((score / 2) * 100);
    }

    return null;
  };

  const buildGoalProgressNote = (student, section) => {
    const entries = section?.entries || [];
    if (!student || !section || !entries.length) {
      return "No data points are available for this goal in the selected date range.";
    }

    const studentName = student.name || "The student";
    const goalText = cleanLower(section.title || "the selected goal");
    const dateRangeText = formatDateRangeText(entries);
    const percentValues = entries
      .map(getEntryPercentValue)
      .filter((value) => Number.isFinite(value));

    const averagePercent = percentValues.length
      ? Math.round(percentValues.reduce((sum, value) => sum + value, 0) / percentValues.length)
      : null;

    const rangeText = percentValues.length
      ? Math.min(...percentValues) + "-" + Math.max(...percentValues) + "%"
      : "not available";

    if (section.mode === "duration") {
      const durationEntries = entries
        .map((entry) => Number(entry.durationValue))
        .filter((value) => Number.isFinite(value));
      const averageDuration = durationEntries.length
        ? Math.round((durationEntries.reduce((sum, value) => sum + value, 0) / durationEntries.length) * 10) / 10
        : null;
      const unit = entries.find((entry) => entry.durationUnit)?.durationUnit || "minutes";
      const durationRange = durationEntries.length
        ? Math.min(...durationEntries) + "-" + Math.max(...durationEntries) + " " + unit
        : "not available";

      const reinforcementCounts = {};
      entries.forEach((entry) => {
        getReinforcementList(entry).forEach((item) => {
          reinforcementCounts[item] = (reinforcementCounts[item] || 0) + 1;
        });
      });
      const reinforcementParts = Object.entries(reinforcementCounts).map(([item, count]) => cleanLower(item) + " (" + Math.round((count / entries.length) * 100) + "% of sessions)");
      const reinforcementBreakdown = reinforcementParts.length
        ? " Reinforcement used during this period included " + reinforcementParts.join(", ") + "."
        : "";

      return dateRangeText + ", " + studentName + " engaged in " + goalText + " for an average duration of " + (averageDuration ?? "___") + " " + unit + ", with durations ranging from " + durationRange + "." + reinforcementBreakdown;
    }

    const promptCounts = {};
    let independentCount = 0;
    let notDemonstratingCount = 0;

    entries.forEach((entry) => {
      if (entry.collectionMethod === "rating") {
        if (String(entry.score) === "2") {
          independentCount += 1;
        } else if (String(entry.score) === "1") {
          const promptLabel = entry.promptLevel || "Prompted";
          promptCounts[promptLabel] = (promptCounts[promptLabel] || 0) + 1;
        } else if (String(entry.score) === "0") {
          notDemonstratingCount += 1;
        }
      }
    });

    const totalEntries = entries.length || 1;
    const scoreParts = Object.entries(promptCounts).map(([prompt, count]) => {
      const percent = Math.round((count / totalEntries) * 100);
      return percent + "% " + cleanLower(prompt) + " prompts";
    });

    if (independentCount) {
      scoreParts.push(Math.round((independentCount / totalEntries) * 100) + "% independent");
    }

    if (notDemonstratingCount) {
      scoreParts.push(Math.round((notDemonstratingCount / totalEntries) * 100) + "% not demonstrating");
    }

    const scoreBreakdown = scoreParts.length
      ? " Performance included " + scoreParts.join(", ") + "."
      : "";

    const reinforcementCounts = {};
    entries.forEach((entry) => {
      getReinforcementList(entry).forEach((item) => {
        reinforcementCounts[item] = (reinforcementCounts[item] || 0) + 1;
      });
    });

    const reinforcementParts = Object.entries(reinforcementCounts).map(([item, count]) => {
      const percent = Math.round((count / totalEntries) * 100);
      return cleanLower(item) + " (" + percent + "% of sessions)";
    });

    const reinforcementBreakdown = reinforcementParts.length
      ? " Reinforcement used during this period included " + reinforcementParts.join(", ") + "."
      : "";

    const ratingEntries = entries.filter((entry) => entry.collectionMethod === "rating");
    const ratingScores = ratingEntries
      .map((entry) => Number(entry.score))
      .filter((value) => Number.isFinite(value));
    const averageRating = ratingScores.length
      ? Math.round((ratingScores.reduce((sum, value) => sum + value, 0) / ratingScores.length) * 10) / 10
      : null;
    const ratingAverageText = section.mode === "rating" && averageRating !== null
      ? " The average rating was " + averageRating + "/2, with 2 representing independent performance."
      : "";

    return dateRangeText + ", " + studentName + " demonstrated an average accuracy of " + (averagePercent ?? "___") + "%, with performance ranging from " + rangeText + " on " + goalText + "." + ratingAverageText + scoreBreakdown + reinforcementBreakdown;
  };

  const applyAutoNoteIfNeeded = (student, goal, current, updated) => {
    const previousGeneratedNote = current.generatedNote || "";
    const userHasEditedNote =
      current.notes && previousGeneratedNote && current.notes !== previousGeneratedNote;

    if (userHasEditedNote) return updated;

    const nextGeneratedNote = buildAutoSessionNote(student, goal, updated);
    return {
      ...updated,
      notes: nextGeneratedNote,
      generatedNote: nextGeneratedNote,
    };
  };

  const handleStudentFormChange = (e) => {
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
      return;
    }
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
    if (isReadOnlyDemo) {
      e.preventDefault();
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
      "Enter collection method: rating, interval, or duration",
      "rating"
    );

    const collectionMethod =
      methodPrompt && ["interval", "duration"].includes(methodPrompt.toLowerCase())
        ? methodPrompt.toLowerCase()
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
      "Edit collection method: rating, interval, or duration",
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
      ["interval", "duration"].includes(methodPrompt.toLowerCase()) ? methodPrompt.toLowerCase() : "rating"
    );
  };

  const addBenchmark = (goalId) => {
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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

      const finalSession =
        field === "notes"
          ? { ...updated, generatedNote: current.generatedNote || "" }
          : applyAutoNoteIfNeeded(selectedStudent, goal, current, updated);

      return {
        ...prev,
        [key]: finalSession,
      };
    });
  };

  const handleIntervalResultChange = (goal, benchmark, index, value) => {
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);

    setSessionData((prev) => {
      const current = prev[key] || getDefaultSessionForGoal();
      const nextResults = [...(current.intervalResults || [])];
      nextResults[index] = value;

      const updated = {
        ...current,
        intervalResults: nextResults,
      };
      const finalSession = applyAutoNoteIfNeeded(selectedStudent, goal, current, updated);

      return {
        ...prev,
        [key]: finalSession,
      };
    });
  };

  const clearSessionEntryForm = (goal, benchmark = null) => {
    if (!selectedStudent || !goal) return;
    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);
    setSessionData((prev) => ({
      ...prev,
      [key]: getDefaultSessionForGoal(),
    }));
  };

  const saveSessionEntry = (goal, benchmark = null) => {
    if (isReadOnlyDemo) {
      showDemoUnsavedMessage();
      return;
    }
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);
    const entry = sessionData[key] || getDefaultSessionForGoal();

    const targetType = benchmark ? "benchmark" : "goal";
    const targetName = benchmark ? benchmark.text : goal.goalTitle;
    const resolvedLocation = getResolvedLocation(entry);
    const resolvedCollectedBy = getResolvedCollectedBy(entry);

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
        location: resolvedLocation,
        collectedBy: resolvedCollectedBy,
        collectionMethod: "interval",
        intervalType: entry.intervalType || "Whole Interval",
        sessionLength,
        intervalLength,
        totalIntervals,
        intervalResults,
        yesCount,
        percent,
        strategiesUsed: entry.strategiesUsed || [],
        reinforcementTypes: entry.reinforcementTypes || [],
        reinforcementOther: entry.reinforcementOther || "",
        notes: entry.notes || buildAutoSessionNote(selectedStudent, goal, entry),
      };

      setHistory((prev) => [...prev, record]);
      clearSessionEntryForm(goal, benchmark);
      alert(`Saved interval data for ${targetName}: ${percent}%`);
      return;
    }

    if (goal.collectionMethod === "duration") {
      if (!entry.durationValue) {
        alert("Please enter the duration before saving.");
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
        location: resolvedLocation,
        collectedBy: resolvedCollectedBy,
        collectionMethod: "duration",
        durationValue: entry.durationValue || "",
        durationUnit: entry.durationUnit || "minutes",
        durationBehavior: entry.durationBehavior || "",
        strategiesUsed: entry.strategiesUsed || [],
        reinforcementTypes: entry.reinforcementTypes || [],
        reinforcementOther: entry.reinforcementOther || "",
        notes: entry.notes || buildAutoSessionNote(selectedStudent, goal, entry),
      };

      setHistory((prev) => [...prev, record]);
      clearSessionEntryForm(goal, benchmark);
      alert(`Saved duration data for ${targetName}.`);
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
      promptLevel:
        entry.score === "1" || (entry.strategiesUsed || []).includes("Prompting")
          ? entry.promptLevel || ""
          : "",
      strategiesUsed: entry.strategiesUsed || [],
      reinforcementTypes: entry.reinforcementTypes || [],
      reinforcementOther: entry.reinforcementOther || "",
      notes: entry.notes || buildAutoSessionNote(selectedStudent, goal, entry),
    };

    setHistory((prev) => [...prev, record]);
    clearSessionEntryForm(goal, benchmark);
    alert(`Saved data for ${targetName}.`);
  };

  const updateSavedEntryNote = (entryId, noteText) => {
    if (isReadOnlyDemo) {
      showDemoUnsavedMessage();
      return;
    }

    setHistory((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, notes: noteText } : entry
      )
    );
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const generatePrintableSessionReport = () => {
    if (!selectedStudent) {
      alert("Please select a student before generating a report.");
      return;
    }

    const includedSections = goalProgressSections.filter((section) => section.entries.length);
    if (!includedSections.length) {
      alert("No data is available for the selected student and date range.");
      return;
    }

    const rangeLabel = progressDateRange.start || progressDateRange.end
      ? `${progressDateRange.start || "Beginning"} to ${progressDateRange.end || "Today"}`
      : "All available dates";

    const sectionHtml = includedSections.map((section) => {
      const rows = section.entries.map((entry) => {
        const scoreText = entry.collectionMethod === "interval"
          ? `${entry.percent ?? 0}% (${entry.yesCount ?? 0}/${entry.totalIntervals ?? 0})`
          : entry.collectionMethod === "duration"
            ? `${entry.durationValue ?? "-"} ${entry.durationUnit ?? ""}`
            : `${entry.score ?? "-"}/2${entry.promptLevel ? `, ${entry.promptLevel} prompt` : ""}`;
        const reinforcements = getReinforcementList(entry).join(", ") || "-";
        return `
          <tr>
            <td>${escapeHtml(entry.date)}</td>
            <td>${escapeHtml(scoreText)}</td>
            <td>${escapeHtml(entry.location || "-")}</td>
            <td>${escapeHtml(entry.collectedBy || "-")}</td>
            <td>${escapeHtml(reinforcements)}</td>
            <td>${escapeHtml(entry.notes || "-")}</td>
          </tr>`;
      }).join("");

      return `
        <section class="goal-section">
          <h2>${escapeHtml(section.title)}</h2>
          <div class="context-box">
            <strong>Goal:</strong> ${escapeHtml(section.fullGoalText || section.title)}<br />
            <strong>Benchmark / Objective:</strong> ${escapeHtml(section.objectiveText || "Goal-level data")}
          </div>
          <div class="summary-note">${escapeHtml(buildGoalProgressNote(selectedStudent, section))}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Score / Data</th>
                <th>Location</th>
                <th>Collected By</th>
                <th>Reinforcement</th>
                <th>Session Note</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </section>`;
    }).join("");

    const reportWindow = window.open("", "_blank");
    if (!reportWindow) {
      alert("Please allow pop-ups to generate the printable report.");
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>RaMP Tracker Session Report</title>
          <style>
            body { font-family: Arial, sans-serif; color: #172554; margin: 32px; line-height: 1.45; }
            h1 { margin-bottom: 4px; }
            h2 { color: #1e3a8a; margin-top: 28px; }
            .report-actions { display: flex; gap: 10px; flex-wrap: wrap; margin: 0 0 18px; }
            .report-actions button { border: 0; border-radius: 999px; padding: 10px 14px; font-weight: 700; cursor: pointer; }
            .print-btn { background: #7c3aed; color: white; }
            .close-btn { background: #e5e7eb; color: #111827; }
            .meta { color: #475569; margin-bottom: 18px; }
            .context-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px; margin: 10px 0 12px; color: #1e293b; }
            .summary-note { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px; margin: 10px 0 14px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; text-align: left; }
            th { background: #dbeafe; color: #1e3a8a; }
            .footer { margin-top: 28px; font-size: 12px; color: #64748b; }
            @media (max-width: 700px) {
              body { margin: 16px; }
              table { display: block; overflow-x: auto; white-space: normal; font-size: 11px; }
              th, td { padding: 7px; }
              td:last-child { min-width: 220px; }
            }
            @media print {
              body { margin: 18px; }
              .goal-section { break-inside: avoid; }
              .report-actions { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="report-actions">
            <button class="print-btn" onclick="window.print()">Print / Save PDF</button>
            <button class="close-btn" onclick="window.close()">Close Report</button>
          </div>
          <h1>RaMP Tracker Session Report</h1>
          <div class="meta">
            <strong>Student:</strong> ${escapeHtml(selectedStudent.name)}<br />
            <strong>Date Range:</strong> ${escapeHtml(rangeLabel)}<br />
            <strong>Entries Included:</strong> ${escapeHtml(filteredSavedHistory.length)}
          </div>
          ${sectionHtml}
          <div class="footer">Generated from RaMP Tracker. Use the Print / Save PDF button to save this report.</div>
        </body>
      </html>
    `);
    reportWindow.document.close();
  };

  const exportCSV = () => {
    if (isReadOnlyDemo) {
      showDemoUnsavedMessage();
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
      "Duration",
      "Duration Unit",
      "Duration Behavior",
      "Score",
      "Prompt Level",
      "Strategy Used",
      "Reinforcement Used",
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
      item.durationValue ?? "",
      item.durationUnit ?? "",
      item.durationBehavior ?? "",
      item.score ?? "",
      item.promptLevel ?? "",
      (item.strategiesUsed || []).join("; "),
      [
        ...(item.reinforcementTypes || []),
        item.reinforcementOther ? `Other: ${item.reinforcementOther}` : "",
      ].filter(Boolean).join("; "),
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
    if (isReadOnlyDemo) {
      showDemoStructureLockedMessage();
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
      background: demoTheme.pageBackground,
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
      background: demoTheme.heroBackground,
      color: "white",
      borderRadius: "24px",
      padding: "28px",
      boxShadow: demoTheme.heroShadow,
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
    secondaryHeroButton: {
      border: "1px solid rgba(255,255,255,0.35)",
      background: "rgba(255,255,255,0.18)",
      color: "#ffffff",
      borderRadius: "999px",
      padding: "10px 14px",
      fontWeight: 700,
      cursor: "pointer",
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
      border: `1px solid ${demoTheme.tabBorder}`,
      background: "white",
      color: demoTheme.accentText,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
    },
    activeTab: {
      padding: "12px 18px",
      borderRadius: "14px",
      border: `1px solid ${demoTheme.selectedBorder}`,
      background: `linear-gradient(135deg, ${demoTheme.accent} 0%, ${demoTheme.accentDark} 100%)`,
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
      border: `1px solid ${demoTheme.cardBorder}`,
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
      background: `linear-gradient(135deg, ${demoTheme.accent} 0%, ${demoTheme.accentDark} 100%)`,
      color: "white",
      border: "none",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: "15px",
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: isDemoMode ? "0 10px 18px rgba(168, 85, 247, 0.20)" : "0 10px 18px rgba(37, 99, 235, 0.20)",
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
      background: demoTheme.accentSoft,
      color: demoTheme.accentDark,
      border: `1px solid ${demoTheme.tabBorder}`,
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
      border: `1px solid ${demoTheme.tabBorder}`,
      borderRadius: "18px",
      padding: "18px",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
    },
    statNumber: {
      fontSize: "32px",
      fontWeight: 800,
      color: demoTheme.accentDark,
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "14px",
      color: "#475569",
      fontWeight: 600,
    },
    demoHelperText: {
      fontSize: "13px",
      fontWeight: 700,
      color: "rgba(255,255,255,0.95)",
      padding: "4px 2px 0 2px",
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
      border: `1px solid ${demoTheme.tabBorder}`,
      borderRadius: "18px",
      padding: "16px",
      background: isDemoMode ? "linear-gradient(180deg, #fbf7ff 0%, #ffffff 100%)" : "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
    },
    selectedStudentCard: {
      border: `2px solid ${demoTheme.selectedBorder}`,
      borderRadius: "18px",
      padding: "16px",
      background: isDemoMode ? "linear-gradient(180deg, #f3e8ff 0%, #ffffff 100%)" : "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
    },
    goalCard: {
      border: `1px solid ${demoTheme.tabBorder}`,
      borderRadius: "20px",
      padding: "16px",
      background: isDemoMode ? "linear-gradient(180deg, #fbf7ff 0%, #ffffff 100%)" : "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      marginBottom: "16px",
    },
    goalListCard: {
      border: `1px solid ${demoTheme.tabBorder}`,
      borderRadius: "18px",
      padding: "14px",
      background: isDemoMode ? "linear-gradient(180deg, #fbf7ff 0%, #ffffff 100%)" : "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
      boxShadow: "0 8px 25px rgba(15, 23, 42, 0.05)",
      cursor: "pointer",
      marginBottom: "14px",
    },
    selectedGoalListCard: {
      border: `2px solid ${demoTheme.selectedBorder}`,
      borderRadius: "18px",
      padding: "14px",
      background: isDemoMode ? "linear-gradient(180deg, #f3e8ff 0%, #ffffff 100%)" : "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
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
      border: `2px solid ${demoTheme.selectedBorder}`,
      borderRadius: "14px",
      padding: "12px",
      background: demoTheme.accentSoft,
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
      background: demoTheme.accentSoft,
      border: `1px solid ${demoTheme.tabBorder}`,
      borderRadius: "18px",
      padding: "16px",
      marginTop: "18px",
    },
    quickRecordBox: {
      background: demoTheme.accentSoft,
      border: `1px solid ${demoTheme.tabBorder}`,
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
      background: demoTheme.accentSoft,
      color: demoTheme.accentText,
      fontWeight: 700,
      borderBottom: `1px solid ${demoTheme.tabBorder}`,
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
      border: selected ? `1px solid ${demoTheme.selectedBorder}` : "1px solid #cbd5e1",
      background: selected ? demoTheme.accentSoft : "white",
      color: selected ? demoTheme.accentDark : "#334155",
      fontWeight: 700,
      cursor: "pointer",
    }),
    checkPill: (selected) => ({
      padding: "10px 12px",
      borderRadius: "999px",
      border: selected ? `1px solid ${demoTheme.selectedBorder}` : "1px solid #cbd5e1",
      background: selected ? demoTheme.accentSoft : "white",
      color: selected ? demoTheme.accentDark : "#334155",
      fontWeight: 700,
      fontSize: "13px",
      cursor: "pointer",
    }),
  };










  const toggleSessionArrayValue = (goal, benchmark, field, value) => {
    if (!selectedStudent || !goal) return;

    const key = getGoalSessionKey(selectedStudent.id, goal.id, benchmark?.id);

    setSessionData((prev) => {
      const current = prev[key] || getDefaultSessionForGoal();
      const currentArray = Array.isArray(current[field]) ? current[field] : [];
      const nextArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];

      const updated = {
        ...current,
        [field]: nextArray,
      };

      if (field === "strategiesUsed" && !nextArray.includes("Prompting")) {
        updated.promptLevel = "";
      }

      if (field === "strategiesUsed" && !nextArray.includes("Reinforcement")) {
        updated.reinforcementTypes = [];
        updated.reinforcementOther = "";
      }

      return {
        ...prev,
        [key]: updated,
      };
    });
  };

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
        {sortedStudents.map((student) => (
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
              if (isReadOnlyDemo) {
                showDemoStructureLockedMessage();
                return;
              }
              setShowAddStudentForm((prev) => !prev);
            }}
            style={styles.buttonPrimary}
          >
            {showAddStudentForm ? (isDemoMode ? "Hide Student Preview" : "Hide Add Student") : (isDemoMode ? "Preview Add Student" : "Add Student")}
          </button>
        </div>
      </div>

      {showAddStudentForm && (
        <div style={styles.card}>
          <h3 style={styles.subTitle}>{isDemoMode ? "Add Student Preview" : "Add Student"}</h3>
          {isDemoMode && (
            <div style={{ ...styles.smallText, marginBottom: "12px" }}>
              You can explore the form in demo mode, but creating a student requires an account.
            </div>
          )}
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
              {isDemoMode ? "Create account to save student" : "Save Student"}
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
            {sortedStudents.map((student) => {
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
              value={previewTemplateLabel}
              onChange={(e) => {
                const value = e.target.value;
                if (isDemoMode) {
                  setPreviewTemplateLabel(value);
                } else if (value) {
                  addGoalFromTemplate(value);
                  setPreviewTemplateLabel("");
                } else {
                  setPreviewTemplateLabel("");
                }
              }}
            >
              <option value="">{isDemoMode ? "Choose a sample to preview" : "Choose a template"}</option>
              {GOAL_TEMPLATE_OPTIONS.map((template) => (
                <option key={template.label} value={template.label}>
                  {template.label}
                </option>
              ))}
            </select>
            {isDemoMode && previewTemplateLabel && (() => {
              const template = GOAL_TEMPLATE_OPTIONS.find((item) => item.label === previewTemplateLabel);
              if (!template) return null;
              return (
                <div style={{ ...styles.infoBlock, marginTop: "12px" }}>
                  <div style={{ fontWeight: 800, color: "#1e3a8a", marginBottom: "8px" }}>
                    {template.goalTitle}
                  </div>
                  <div style={{ marginBottom: "10px", lineHeight: 1.6 }}>{template.fullGoalText}</div>
                  <div style={{ marginBottom: "8px" }}><strong>Examples:</strong> {template.examplesDefinition}</div>
                  <div style={{ marginBottom: "8px" }}><strong>Baseline:</strong> {template.baseline}</div>
                  <div style={{ marginBottom: "8px" }}><strong>Mastery:</strong> {template.mastery}</div>
                  <div><strong>Method:</strong> {template.collectionMethod === "interval" ? "Interval Data" : "Rating Scale"}</div>
                  <div style={{ ...styles.smallText, marginTop: "10px" }}>
                    Demo preview only. Create an account to add this goal to a student.
                  </div>
                </div>
              );
            })()}
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
                        : goal.collectionMethod === "duration"
                          ? "Duration"
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
                  {currentSession.location === "Other" && (
                    <input
                      value={currentSession.customLocation || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customLocation",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter location"
                    />
                  )}
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
                  {currentSession.collectedBy === "Other" && (
                    <input
                      value={currentSession.customCollectedBy || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customCollectedBy",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter person or role"
                    />
                  )}
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
                <label style={styles.label}>Strategy Used (RaMP)</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {["Reinforcement", "Modeling", "Prompting"].map((strategy) => (
                    <button
                      key={strategy}
                      type="button"
                      style={styles.checkPill((currentSession.strategiesUsed || []).includes(strategy))}
                      onClick={() =>
                        toggleSessionArrayValue(
                          selectedGoal,
                          activeTargetBenchmark,
                          "strategiesUsed",
                          strategy
                        )
                      }
                    >
                      {strategy}
                    </button>
                  ))}
                </div>

                {(currentSession.strategiesUsed || []).includes("Reinforcement") && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={styles.smallText}>Select reinforcement used during the session.</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                      {REINFORCEMENT_OPTIONS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          style={styles.checkPill((currentSession.reinforcementTypes || []).includes(item))}
                          onClick={() =>
                            toggleSessionArrayValue(
                              selectedGoal,
                              activeTargetBenchmark,
                              "reinforcementTypes",
                              item
                            )
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    {(currentSession.reinforcementTypes || []).includes("Other") && (
                      <div style={{ marginTop: "10px" }}>
                        <label style={styles.label}>Other Reinforcement</label>
                        <input
                          type="text"
                          value={currentSession.reinforcementOther || ""}
                          onChange={(e) =>
                            handleSessionChange(
                              selectedGoal,
                              activeTargetBenchmark,
                              "reinforcementOther",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          placeholder="Describe reinforcement used"
                        />
                      </div>
                    )}
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
                Save Interval Session
              </button>
            </>
          ) : selectedGoal.collectionMethod === "duration" ? (
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
                  {currentSession.location === "Other" && (
                    <input
                      value={currentSession.customLocation || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customLocation",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter location"
                    />
                  )}
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
                  {currentSession.collectedBy === "Other" && (
                    <input
                      value={currentSession.customCollectedBy || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customCollectedBy",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter person or role"
                    />
                  )}
                </div>

                <div>
                  <label style={styles.label}>Duration</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentSession.durationValue || ""}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "durationValue",
                        e.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="Enter number"
                  />
                </div>

                <div>
                  <label style={styles.label}>Duration Unit</label>
                  <select
                    value={currentSession.durationUnit || "minutes"}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "durationUnit",
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    <option value="seconds">seconds</option>
                    <option value="minutes">minutes</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Behavior / Skill Observed</label>
                  <input
                    type="text"
                    value={currentSession.durationBehavior || ""}
                    onChange={(e) =>
                      handleSessionChange(
                        selectedGoal,
                        activeTargetBenchmark,
                        "durationBehavior",
                        e.target.value
                      )
                    }
                    style={styles.input}
                    placeholder="Enter behavior (e.g., on-task, tantrum, elopement)"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={styles.label}>Strategy Used (RaMP)</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {["Reinforcement", "Modeling", "Prompting"].map((strategy) => (
                    <button
                      key={strategy}
                      type="button"
                      style={styles.checkPill((currentSession.strategiesUsed || []).includes(strategy))}
                      onClick={() =>
                        toggleSessionArrayValue(
                          selectedGoal,
                          activeTargetBenchmark,
                          "strategiesUsed",
                          strategy
                        )
                      }
                    >
                      {strategy}
                    </button>
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
                  placeholder="Session note will auto-fill here and can be edited."
                />
              </div>

              <button
                onClick={() =>
                  saveSessionEntry(selectedGoal, activeTargetBenchmark)
                }
                style={styles.buttonPrimary}
              >
                Save Duration Session
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
                  {currentSession.location === "Other" && (
                    <input
                      value={currentSession.customLocation || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customLocation",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter location"
                    />
                  )}
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
                  {currentSession.collectedBy === "Other" && (
                    <input
                      value={currentSession.customCollectedBy || ""}
                      onChange={(e) =>
                        handleSessionChange(
                          selectedGoal,
                          activeTargetBenchmark,
                          "customCollectedBy",
                          e.target.value
                        )
                      }
                      style={{ ...styles.input, marginTop: "8px" }}
                      placeholder="Enter person or role"
                    />
                  )}
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

                {(currentSession.score === "1" || (currentSession.strategiesUsed || []).includes("Prompting")) && (
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
                <label style={styles.label}>Strategy Used (RaMP)</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {["Reinforcement", "Modeling", "Prompting"].map((strategy) => (
                    <button
                      key={strategy}
                      type="button"
                      style={styles.checkPill((currentSession.strategiesUsed || []).includes(strategy))}
                      onClick={() =>
                        toggleSessionArrayValue(
                          selectedGoal,
                          activeTargetBenchmark,
                          "strategiesUsed",
                          strategy
                        )
                      }
                    >
                      {strategy}
                    </button>
                  ))}
                </div>

                {(currentSession.strategiesUsed || []).includes("Reinforcement") && (
                  <div style={{ marginBottom: "10px" }}>
                    <div style={styles.smallText}>Select reinforcement used during the session.</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                      {REINFORCEMENT_OPTIONS.map((item) => (
                        <button
                          key={item}
                          type="button"
                          style={styles.checkPill((currentSession.reinforcementTypes || []).includes(item))}
                          onClick={() =>
                            toggleSessionArrayValue(
                              selectedGoal,
                              activeTargetBenchmark,
                              "reinforcementTypes",
                              item
                            )
                          }
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    {(currentSession.reinforcementTypes || []).includes("Other") && (
                      <div style={{ marginTop: "10px" }}>
                        <label style={styles.label}>Other Reinforcement</label>
                        <input
                          type="text"
                          value={currentSession.reinforcementOther || ""}
                          onChange={(e) =>
                            handleSessionChange(
                              selectedGoal,
                              activeTargetBenchmark,
                              "reinforcementOther",
                              e.target.value
                            )
                          }
                          style={styles.input}
                          placeholder="Describe reinforcement used"
                        />
                      </div>
                    )}
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
            <div style={styles.rowGap}>
              <button
                onClick={() =>
                  window.alert("ABC/FBA data collection will live in a separate workflow so the progress-monitoring screen stays clean.")
                }
                style={styles.buttonSecondary}
              >
                Conduct FBA / ABC Data
              </button>
              <button
                onClick={() => setShowGoalDetails((prev) => !prev)}
                style={styles.buttonLight}
              >
                {showGoalDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>
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
                    : selectedGoal.collectionMethod === "duration"
                      ? "Duration"
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
        <h2 style={styles.cardTitle}>Student Progress</h2>

        <div
          key={progressFilterResetKey}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
            padding: "14px",
            borderRadius: "16px",
            background: demoTheme.accentSoft,
            border: `1px solid ${demoTheme.accentBorder}`,
          }}
        >
          <div>
            <label style={styles.label}>Start Date</label>
            <input
              type="date"
              value={progressDateRange.start}
              onChange={(event) =>
                setProgressDateRange((prev) => ({ ...prev, start: event.target.value }))
              }
              style={styles.input}
            />
          </div>
          <div>
            <label style={styles.label}>End Date</label>
            <input
              type="date"
              value={progressDateRange.end}
              onChange={(event) =>
                setProgressDateRange((prev) => ({ ...prev, end: event.target.value }))
              }
              style={styles.input}
            />
          </div>
          <div style={{ alignSelf: "end", display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setProgressDateRange({ start: "", end: "" });
                setProgressFilterResetKey((prev) => prev + 1);
              }}
              style={styles.secondaryButton}
            >
              Clear Dates
            </button>
            <button type="button" onClick={() => window.print()} style={styles.secondaryButton}>
              Print Page
            </button>
            <button type="button" onClick={generatePrintableSessionReport} style={styles.primaryButton}>
              Generate Session Report
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Entries in Range</div>
            <div style={styles.metricValue}>{progressSummary.totalEntries}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Last Score / Percent</div>
            <div style={styles.metricValue}>{progressSummary.lastValue}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Average Score / Percent</div>
            <div style={styles.metricValue}>{progressSummary.averageValue}</div>
          </div>
        </div>

        {!selectedStudent ? (
          <div>No student selected.</div>
        ) : !goalProgressSections.length ? (
          <div>No saved entries yet for this student.</div>
        ) : (
          <>
            {goalProgressSections.map((section) => (
              <div key={section.id} style={{ ...styles.card, marginBottom: "20px", padding: "18px" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#1e3a8a", marginBottom: "12px" }}>{section.title}</div>
                <GraphCard
                  title={`${section.title} Progress`}
                  points={section.points}
                  mode={section.mode}
                  targetValue={section.targetValue}
                  targetLabel={section.targetLabel}
                />

                <div style={{
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "12px",
                  marginBottom: "14px",
                  color: "#374151",
                  lineHeight: 1.5
                }}>
                  <div><strong>Goal:</strong> {section.fullGoalText || section.title}</div>
                  <div><strong>Benchmark / Objective:</strong> {section.objectiveText || "Goal-level data"}</div>
                </div>

                <div
                  style={{
                    fontWeight: 800,
                    color: "#1e3a8a",
                    fontSize: "16px",
                    marginBottom: "10px",
                  }}
                >
                  Saved Entries for This Goal (Filtered Date Range)
                </div>

                {!section.entries.length ? (
                  <div style={styles.smallText}>No saved entries yet for this goal.</div>
                ) : (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Location</th>
                          <th style={styles.th}>Collected By</th>
                          <th style={styles.th}>Method</th>
                          <th style={styles.th}>Score / %</th>
                          <th style={styles.th}>Prompt / Interval</th>
                          <th style={styles.th}>RaMP Strategy</th>
                          <th style={styles.th}>Reinforcement</th>
                          <th style={styles.th}>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.entries.map((entry) => (
                          <tr key={entry.id}>
                            <td style={styles.td}>{entry.date}</td>
                            <td style={styles.td}>{entry.location || "-"}</td>
                            <td style={styles.td}>{entry.collectedBy || "-"}</td>
                            <td style={styles.td}>
                              {entry.collectionMethod === "interval" ? "Interval" : entry.collectionMethod === "duration" ? "Duration" : "Rating"}
                            </td>
                            <td style={styles.td}>
                              {entry.collectionMethod === "interval"
                                ? `${entry.percent ?? 0}%`
                                : entry.collectionMethod === "duration"
                                  ? `${entry.durationValue ?? "-"} ${entry.durationUnit ?? ""}`
                                  : String(entry.score) === "2"
                                    ? "2 - Independent"
                                    : String(entry.score) === "1"
                                      ? "1 - Prompted"
                                      : String(entry.score) === "0"
                                        ? "0 - Not demonstrating"
                                        : entry.score}
                            </td>
                            <td style={styles.td}>
                              {entry.collectionMethod === "interval"
                                ? `${entry.intervalType || "-"} (${entry.yesCount ?? 0}/${entry.totalIntervals ?? 0})`
                                : entry.collectionMethod === "duration"
                                  ? entry.durationBehavior || "-"
                                  : entry.promptLevel || "-"}
                            </td>
                            <td style={styles.td}>
                              {(entry.strategiesUsed || []).length
                                ? entry.strategiesUsed.join(", ")
                                : "-"}
                            </td>
                            <td style={styles.td}>
                              {getReinforcementList(entry).length
                                ? getReinforcementList(entry).join(", ")
                                : "-"}
                            </td>
                            <td style={styles.td}>{entry.notes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!!section.entries.length && (
                  <div style={{ marginTop: "16px" }}>
                    <div
                      style={{
                        fontWeight: 800,
                        color: "#1e3a8a",
                        fontSize: "16px",
                        marginBottom: "10px",
                      }}
                    >
                      Progress Summary Note
                    </div>

                    <textarea
                      value={buildGoalProgressNote(selectedStudent, section)}
                      readOnly
                      rows={4}
                      style={{ ...styles.textarea, marginBottom: 0 }}
                      placeholder="A summary note will appear here when data is available for the selected date range."
                    />
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );

  const openDemoMode = () => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.set("demo", "1");
    window.location.href = url.toString();
  };

  const exitDemoMode = () => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    DEMO_URL_KEYS.forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    window.location.href = url.toString();
  };

  const resetDemoData = () => {
    if (typeof window === "undefined") return;

    [
      "students",
      "selected_student",
      "selected_goal",
      "selected_benchmark",
      "show_goal_details",
      "session_data",
      "session_history",
      "active_tab",
    ].forEach((name) => localStorage.removeItem(buildStorageKey(true, name)));

    window.location.reload();
  };



  useEffect(() => {
    if (isDemoMode) return;

    const trialStart = localStorage.getItem("ramp_trial_start");

    if (!trialStart) {
      const today = new Date().toISOString();
      localStorage.setItem("ramp_trial_start", today);
      setTrialDaysLeft(14);
      return;
    }

    const startDate = new Date(trialStart);
    const today = new Date();

    const diffTime = today - startDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = 14 - diffDays;

    if (remaining <= 0) {
      setTrialDaysLeft(0);
      setIsTrialExpired(true);
    } else {
      setTrialDaysLeft(remaining);
    }
  }, [isDemoMode]);


  if (showLandingScreen) {
    return (
      <LandingScreen
        onDemo={() => {
          setShowLandingScreen(false);
          setIsDemoMode(true);
        }}
        onLogin={() => {
          setShowLandingScreen(false);
          setIsDemoMode(false);
          setAuthMode("signup");
          setShowGate(true);
        }}
        onWatchTour={() =>
          window.open("YOUR_VIDEO_LINK", "_blank")
        }
      />
    );
  }


  const UpgradePopup = () => (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "24px",
        maxWidth: "420px",
        width: "100%",
        padding: "32px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        textAlign: "center"
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: "12px",
          color: "#111827"
        }}>
          Start Your Free 14-Day Trial
        </h2>

        <p style={{
          color: "#6b7280",
          lineHeight: "1.6",
          marginBottom: "24px"
        }}>
          Save your own students, export reports,
          track progress, and access all RaMP Tracker features.
        </p>

        <button
          onClick={() => {
            setShowUpgradePopup(false);
            setShowGate(true);
          }}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "14px",
            background: "#7c3aed",
            color: "white",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "12px"
          }}
        >
          Start Free Trial
        </button>

        <button
          onClick={() => setShowUpgradePopup(false)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "14px",
            border: "1px solid #d1d5db",
            background: "white",
            color: "#374151",
            cursor: "pointer"
          }}
        >
          Continue Demo
        </button>
      </div>
    </div>
  );



  return (
    <div style={styles.page}>
      {!isDemoMode && trialDaysLeft !== null && (
        <div style={{
          background: "#ede9fe",
          color: "#5b21b6",
          padding: "10px 16px",
          textAlign: "center",
          fontWeight: "600",
          fontSize: "14px"
        }}>
          {isTrialExpired
            ? "Your free trial has ended."
            : `${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left in your free trial`}
        </div>
      )}

      {showUpgradePopup && <UpgradePopup />}

      {isTrialExpired && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(255,255,255,0.96)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            maxWidth: "420px",
            background: "white",
            borderRadius: "24px",
            padding: "36px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.12)"
          }}>
            <h2>Your Free Trial Has Ended</h2>

            <p style={{
              color: "#6b7280",
              lineHeight: "1.6",
              marginBottom: "24px"
            }}>
              Continue using RaMP Tracker to save student data,
              monitor progress, and generate notes.
            </p>

            <button
              onClick={() => setShowGate(true)}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "14px",
                background: "#7c3aed",
                color: "white",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Upgrade Account
            </button>
          </div>
        </div>
      )}

      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, textarea, button { font: inherit; }
        input:focus, select:focus, textarea:focus {
          border-color: ${demoTheme.focusBorder} !important;
          box-shadow: 0 0 0 3px ${demoTheme.focusShadow};
        }
        button:hover { filter: brightness(0.98); }

        @media print {
          button, .ramp-tabs, .no-print { display: none !important; }
          body { background: white !important; }
        }

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

      {showGate ? (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
              textAlign: "center",
              maxWidth: "420px",
              width: "100%",
              border: `1px solid ${demoTheme.cardBorder}`,
            }}
          >
            <h1 style={{ fontSize: "28px", marginBottom: "10px", color: "#1e3a8a" }}>
              RaMP Tracker
            </h1>

            <p style={{ marginBottom: "22px", color: "#475569", lineHeight: 1.5 }}>
              {authMode === "signup" ? "Create your account to save student data to the cloud." : "Log in to access your saved RaMP Tracker data."}
            </p>

            <input
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="Email"
              type="email"
              style={{ ...styles.input, width: "100%", marginBottom: "12px" }}
            />
            <input
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Password"
              type="password"
              style={{ ...styles.input, width: "100%", marginBottom: "12px" }}
            />

            {authMessage ? (
              <div style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "12px", lineHeight: 1.4 }}>
                {authMessage}
              </div>
            ) : null}

            <button
              onClick={handleAuth}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "#1e3a8a",
                color: "white",
                fontWeight: "700",
                border: "none",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              {authMode === "signup" ? "Create Account" : "Log In"}
            </button>

            <button
              onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "white",
                color: "#1e3a8a",
                fontWeight: "700",
                border: "1px solid #bfdbfe",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              {authMode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
            </button>

            <button
              onClick={() => {
                setShowGate(false);
                setIsDemoMode(true);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "#8b5cf6",
                color: "white",
                fontWeight: "700",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Demo Instead
            </button>

            <div style={{ marginTop: "16px", color: "#475569", fontSize: "14px", lineHeight: 1.5 }}>
              🎉 Free 14-Day Trial • No credit card required
            </div>
          </div>
        </div>
      ) : (
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>RaMP Tracker</h1>
          <div style={styles.heroText}>
            Track progress. Build skills. Support growth across school, home,
            and therapy using clear prompt-level and interval data.
          </div>

          <div
            style={{
              marginTop: "14px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            {isDemoMode ? (
              <>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.22)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  Demo Mode is on
                </div>

                <button style={styles.secondaryHeroButton} onClick={resetDemoData}>
                  Reset Demo Data
                </button>

                <button
                  style={styles.secondaryHeroButton}
                  onClick={() => {
                    setIsDemoMode(false);
                    setAuthMode("signup");
                    setShowGate(true);
                  }}
                >
                  Start Free 14-Day Trial
                </button>

                <button
                  style={styles.secondaryHeroButton}
                  onClick={() => {
                    setIsDemoMode(false);
                    setAuthMode("login");
                    setShowGate(true);
                  }}
                >
                  Log In / Exit Demo
                </button>

                <div style={styles.demoHelperText}>
                  Interactive sample — try scoring and prompts, but demo changes will not be saved.
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.2)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {cloudStatus || "Cloud saving on"}
                </div>

                <button style={styles.secondaryHeroButton} onClick={openDemoMode}>
                  Open Demo Mode
                </button>

                <button style={styles.secondaryHeroButton} onClick={handleLogout}>
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>

        <div className="ramp-tabs" style={styles.tabsWrap}>
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
      )}
    </div>
  );
}
