// Central data model + seed/demo data for the whole app.
//
// IMPORTANT: there is no backend or database. The seed* arrays and
// projectDetailsById below are the app's *initial* state only. The
// dashboard (src/app/page.tsx) copies them into React useState on load and
// all edits (add/remove/assign/etc.) live in that client-side state — they
// are lost on refresh and are NOT visible to the API routes under
// src/app/api/, which re-import these seed arrays directly. Anything that
// needs to be true "by default" (e.g. a new contract's starting tasks)
// should be added here rather than relying on someone clicking through the
// UI after every reload.
//
// Data model hierarchy: Contract (top-level "folder") -> Project -> Task,
// with Developer assigned across any of the three via ownerDeveloperId /
// developerId.

export type ProjectStatus = "On Track" | "At Risk" | "Blocked" | "Done";
export type ContractStatus = "Draft" | "Active" | "At Risk" | "Closed";
export type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";
export type NotificationChannel = "None" | "Email" | "Slack";
export type WorkflowSourceType = "Meeting Email" | "Otter Transcript" | "Manual";
export type WorkflowReliability = "Primary" | "Fallback";

export type Developer = {
  id: string;
  name: string;
  role: string;
  focus: string;
  capacity: number;
  email: string;
  slackHandle: string;
  skills: string[];
};

export const SKILL_OPTIONS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Swift",
  "Kotlin",
  "SQL / Databases",
  "API Design",
  "DevOps",
  "QA / Testing",
  "UI/UX Design",
  "Figma",
  "Product Design",
  "Data Engineering"
] as const;

export type Project = {
  id: string;
  contractId: string;
  name: string;
  client: string;
  status: ProjectStatus;
  ownerDeveloperId: string;
  summary: string;
};

export type ContractProgressEntry = {
  id: string;
  note: string;
  createdAt: string;
  author: string;
};

// Hours logged against a client last calendar month, split by category —
// shown on the contract folder panel so clients can see time spent in
// meetings vs. actual development work.
export type ClientHoursLog = {
  meetings: number;
  development: number;
};

// Top-level "folder" in the app. slackChannelId is optional — only
// contracts with one set (e.g. Victory Village) get real Slack messages;
// see notifySlackUpdate/notifySlackAssignment in page.tsx.
export type Contract = {
  id: string;
  organization: string;
  name: string;
  client: string;
  value: number;
  status: ContractStatus;
  ownerDeveloperId: string;
  startDate: string;
  renewalDate: string;
  workflowMode: "Email First" | "Transcript Assisted";
  workflowNotes: string;
  progress: ContractProgressEntry[];
  slackChannelId?: string;
  lastMonthHours: ClientHoursLog;
};

export type Task = {
  id: string;
  contractId: string;
  projectId: string;
  title: string;
  summary: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  developerId: string | null;
  notificationPreference: NotificationChannel;
  source: WorkflowSourceType;
  awaitingAssignment: boolean;
};

export type WorkflowSource = {
  id: string;
  contractId: string;
  sourceType: Exclude<WorkflowSourceType, "Manual">;
  title: string;
  summary: string;
  reliability: WorkflowReliability;
  lastProcessedAt: string;
  action: string;
};

// Extended, per-project info edited from the "Details" tab on each project
// card (see handleShowProjectTab/handleDetailSave in page.tsx). Keyed by
// project ID in projectDetailsById below — a project with no entry falls
// back to DEFAULT_PROJECT_DETAIL in page.tsx rather than crashing.
export type ProjectDetail = {
  phase: string;
  kickoffDate: string;
  targetLaunchDate: string;
  deliveryConfidence: "High" | "Medium" | "Low";
  nextMeetingAt?: string;
  focusAreas: string[];
  risks: string[];
  decisions: string[];
  notes: { id: string; title: string; body: string; updatedAt: string }[];
};

// --- Seed data below ---
// Each seed* array/record is the dashboard's starting state. IDs are
// hand-assigned (CTR-/PRJ-/TASK-/DEV-/WF- prefixes) and referenced by other
// records via foreign-key-style string fields (contractId, projectId,
// ownerDeveloperId, developerId) — there's no runtime validation that these
// point to something real, so keep new entries consistent by hand.

export const seedDevelopers: Developer[] = [
  {
    id: "DEV-001",
    name: "Ari M.",
    role: "Project Lead",
    focus: "Delivery and client sync",
    capacity: 80,
    email: "ari@myvillage.app",
    slackHandle: "@ari",
    skills: ["Product Design", "API Design"]
  },
  {
    id: "DEV-002",
    name: "Nia",
    role: "Frontend Engineer",
    focus: "UI and dashboard modules",
    capacity: 75,
    email: "nia@myvillage.app",
    slackHandle: "@nia",
    skills: ["React", "TypeScript", "UI/UX Design"]
  },
  {
    id: "DEV-003",
    name: "Theo",
    role: "Backend Engineer",
    focus: "Data APIs and automation",
    capacity: 70,
    email: "theo@myvillage.app",
    slackHandle: "@theo",
    skills: ["Node.js", "Python", "SQL / Databases"]
  },
  {
    id: "DEV-004",
    name: "Delali",
    role: "Implementation Manager",
    focus: "Client follow-through and work routing",
    capacity: 65,
    email: "delali@myvillage.app",
    slackHandle: "@delali",
    skills: ["QA / Testing", "API Design"]
  },
  {
    id: "DEV-005",
    name: "Monique Reed",
    role: "Developer",
    focus: "Victory Village build",
    capacity: 75,
    email: "monique@scratchwerk.tech",
    slackHandle: "@monique.reed",
    skills: ["React", "TypeScript", "Node.js"]
  },
  {
    id: "DEV-006",
    name: "Hana Elbatouty",
    role: "Implementation Coordinator",
    focus: "Client content intake: transcripts and meeting notes",
    capacity: 60,
    email: "hana@victoryvillage.app",
    slackHandle: "@hana.elbatouty",
    skills: ["QA / Testing"]
  },
  {
    id: "DEV-007",
    name: "Ronnie King",
    role: "CEO",
    focus: "Executive oversight and approvals",
    capacity: 40,
    email: "ronnie@victoryvillage.app",
    slackHandle: "@ronnie.king",
    skills: ["Product Design"]
  }
];

// CTR-001/002 are the original Northwind/Harvest Grid demo contracts.
// CTR-003 (Victory Village) is a real client folder wired to an actual
// Slack channel (slackChannelId) and owned by Monique.
export const seedContracts: Contract[] = [
  {
    id: "CTR-001",
    organization: "Northwind Labs",
    name: "Northwind Labs Service Agreement",
    client: "Northwind Labs",
    value: 120000,
    status: "Active",
    ownerDeveloperId: "DEV-001",
    startDate: "2026-06-15",
    renewalDate: "2026-12-15",
    workflowMode: "Email First",
    workflowNotes:
      "Treat Ms. Valerie's follow-up email as the source of truth and use transcripts only to enrich task descriptions.",
    lastMonthHours: { meetings: 6, development: 34 },
    progress: [
      {
        id: "p1",
        note: "Kickoff completed and statement of work approved.",
        createdAt: "2026-07-10T10:00:00.000Z",
        author: "Ari M."
      },
      {
        id: "p2",
        note: "Waiting on the post-meeting email to confirm dashboard rollout tasks for the next sprint.",
        createdAt: "2026-07-23T16:30:00.000Z",
        author: "Delali"
      }
    ]
  },
  {
    id: "CTR-002",
    organization: "Harvest Grid",
    name: "Harvest Grid Extension",
    client: "Harvest Grid",
    value: 88000,
    status: "At Risk",
    ownerDeveloperId: "DEV-003",
    startDate: "2026-07-01",
    renewalDate: "2026-11-10",
    workflowMode: "Transcript Assisted",
    workflowNotes:
      "Transcript can draft task notes, but manual review is required because recent recordings have cut off before the final action items.",
    lastMonthHours: { meetings: 4, development: 22 },
    progress: [
      {
        id: "p3",
        note: "Legal review comments received from client counsel.",
        createdAt: "2026-07-12T15:30:00.000Z",
        author: "Theo"
      }
    ]
  },
  {
    id: "CTR-003",
    organization: "Victory Village",
    name: "Victory Village Program Support",
    client: "Victory Village",
    value: 95000,
    status: "Active",
    ownerDeveloperId: "DEV-005",
    startDate: "2026-07-15",
    renewalDate: "2027-01-15",
    workflowMode: "Email First",
    workflowNotes:
      "Hana pastes call transcriptions and email notes directly into the Automation Intake form for this folder; treat her email recap notes as the primary source and transcripts as supporting context.",
    slackChannelId: "C0BD1PENTLH",
    lastMonthHours: { meetings: 9, development: 47 },
    progress: [
      {
        id: "p6",
        note: "Backfilled the Hana presentation meeting from last month (front end priority, prototype weave-together, book content/copyright, connections feature, village difficulty levels) into 8 unassigned tasks for the team to triage.",
        createdAt: "2026-07-29T17:49:55.000Z",
        author: "Workflow Bot"
      },
      {
        id: "p5",
        note: "Ingested Monique's July 29 meeting recap and created 4 tasks: avatar customization, SVG handoff, asset publishing, and FLE reading-level scoring. Next meeting scheduled for August 20, 2026.",
        createdAt: "2026-07-29T17:37:48.000Z",
        author: "Monique"
      },
      {
        id: "p4",
        note: "Onboarded Victory Village as a contract folder so Hana can submit transcripts and email notes.",
        createdAt: "2026-07-29T12:00:00.000Z",
        author: "Delali"
      }
    ]
  }
];

// Every project's contractId must point to an entry in seedContracts above.
export const seedProjects: Project[] = [
  {
    id: "PRJ-101",
    contractId: "CTR-001",
    name: "Client Portal Refresh",
    client: "Northwind Labs",
    status: "On Track",
    ownerDeveloperId: "DEV-001",
    summary: "Modernize the client portal with contract-level status, routing, and assignment visibility."
  },
  {
    id: "PRJ-102",
    contractId: "CTR-001",
    name: "Automation Inbox",
    client: "Northwind Labs",
    status: "At Risk",
    ownerDeveloperId: "DEV-004",
    summary: "Convert Valerie's meeting follow-up email into status updates and draft tasks."
  },
  {
    id: "PRJ-108",
    contractId: "CTR-002",
    name: "Field Ops Mobile Sync",
    client: "Harvest Grid",
    status: "At Risk",
    ownerDeveloperId: "DEV-003",
    summary: "Improve sync reliability and release the updated field workflow tooling."
  },
  {
    id: "PRJ-115",
    contractId: "CTR-003",
    name: "Victory Village Community Program",
    client: "Victory Village",
    status: "On Track",
    ownerDeveloperId: "DEV-005",
    summary: "Track program follow-through from Hana's meeting recaps and call transcriptions."
  }
];

// TASK-001-004: original Northwind/Harvest Grid demo tasks.
// TASK-005-016: Victory Village tasks, generated by actually running real
// meeting transcripts through the /api/ingestion/* pipeline (not hand-typed)
// — see conversation history / commit context for the source transcripts.
// TASK-009-016 are intentionally left unassigned (developerId: null) since
// they came from a messy historical meeting the team still needs to triage.
export const seedTasks: Task[] = [
  {
    id: "TASK-001",
    contractId: "CTR-001",
    projectId: "PRJ-101",
    title: "Launch contract workspace MVP",
    summary: "Finalize one clear dashboard flow for contract folders and project drill-down.",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-07-30",
    developerId: "DEV-002",
    notificationPreference: "Slack",
    source: "Manual",
    awaitingAssignment: false
  },
  {
    id: "TASK-002",
    contractId: "CTR-001",
    projectId: "PRJ-102",
    title: "Parse Valerie follow-up email into tasks",
    summary: "Auto-create tasks and update contract status from the email summary after each meeting.",
    status: "Todo",
    priority: "High",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Email",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-003",
    contractId: "CTR-002",
    projectId: "PRJ-108",
    title: "Complete API reliability pass",
    summary: "Reduce response failures and finalize service monitoring setup.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-03",
    developerId: "DEV-003",
    notificationPreference: "Email",
    source: "Manual",
    awaitingAssignment: false
  },
  {
    id: "TASK-004",
    contractId: "CTR-002",
    projectId: "PRJ-108",
    title: "Review transcript cutoff gaps",
    summary: "Mark transcript segments that end before next steps so the workflow stays email-first.",
    status: "Blocked",
    priority: "Low",
    dueDate: "2026-08-05",
    developerId: "DEV-004",
    notificationPreference: "Slack",
    source: "Otter Transcript",
    awaitingAssignment: false
  },
  {
    id: "TASK-005",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Customize avatars and provide selection options",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: "DEV-005",
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: false
  },
  {
    id: "TASK-006",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Send SVG files to the developer team for each world",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: "DEV-005",
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: false
  },
  {
    id: "TASK-007",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Edit and publish delivered village assets",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: "DEV-005",
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: false
  },
  {
    id: "TASK-008",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Add FLE reading-level scores to the book data sets",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: "DEV-005",
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: false
  },
  {
    id: "TASK-009",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Front end has been the priority",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-010",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Back end will be next in the priority.",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-011",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Weave together screens into a prototype",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-012",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Book Passage Access: Please connect with April on Book Content Database.",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-013",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Passages may not come with question so we will send questions for review",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-014",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Village Storylines: is under review for more detailed discussion for app",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-015",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Connections feature: Create community within the app",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  },
  {
    id: "TASK-016",
    contractId: "CTR-003",
    projectId: "PRJ-115",
    title: "Incorporate new difficulty levels within cyclone and sky villages.",
    summary: "Created from meeting email ingestion.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-08-01",
    developerId: null,
    notificationPreference: "Slack",
    source: "Meeting Email",
    awaitingAssignment: true
  }
];

// Static log of past ingestion runs shown in the "Automation Intake" activity
// feed. New runs made through the live form are appended to a separate
// workflowRuns React state in page.tsx and merged with this list for
// display — they are not pushed back into this array.
export const workflowInbox: WorkflowSource[] = [
  {
    id: "WF-001",
    contractId: "CTR-001",
    sourceType: "Meeting Email",
    title: "Valerie follow-up email",
    summary:
      "Primary automation trigger. Update contract status, create new tasks, then route only assignment decisions to operations.",
    reliability: "Primary",
    lastProcessedAt: "2026-07-23T17:10:00.000Z",
    action: "Create tasks and set due dates from the email's next steps section."
  },
  {
    id: "WF-002",
    contractId: "CTR-001",
    sourceType: "Otter Transcript",
    title: "Meeting transcript",
    summary:
      "Useful for richer context, but not reliable enough to replace the email because some recordings stop before the action items.",
    reliability: "Fallback",
    lastProcessedAt: "2026-07-23T16:48:00.000Z",
    action: "Enrich task descriptions only when the transcript contains the full close-out section."
  },
  {
    id: "WF-003",
    contractId: "CTR-002",
    sourceType: "Meeting Email",
    title: "Client recap email",
    summary: "Preferred source for the next sprint commitment list and owner confirmation.",
    reliability: "Primary",
    lastProcessedAt: "2026-07-25T14:22:00.000Z",
    action: "Generate draft tasks and keep developer assignment optional until reviewed."
  }
];

// Keyed by project ID (see seedProjects above). A project without an entry
// here isn't an error — page.tsx and the /projects/[projectId] page both
// fall back to a generic "not yet filled in" default rather than crashing.
export const projectDetailsById: Record<string, ProjectDetail> = {
  "PRJ-101": {
    phase: "Build + QA",
    kickoffDate: "2026-06-15",
    targetLaunchDate: "2026-08-04",
    deliveryConfidence: "High",
    focusAreas: [
      "Finalize contract workspace navigation",
      "Complete role-based activity stream filters",
      "Lock in assignment flow with optional notifications"
    ],
    risks: [
      "Status updates still depend on manual note capture when the email format changes",
      "Notification rules need approval before sending Slack messages automatically"
    ],
    decisions: [
      "Make contracts the top-level folder in the dashboard",
      "Allow tasks to remain unassigned until operations has a developer in mind"
    ],
    notes: [
      {
        id: "n-101-1",
        title: "Workflow Alignment",
        body: "The team wants status updates and task creation to happen automatically from the meeting recap email.",
        updatedAt: "2026-07-24"
      }
    ]
  },
  "PRJ-102": {
    phase: "Discovery",
    kickoffDate: "2026-07-20",
    targetLaunchDate: "2026-08-15",
    deliveryConfidence: "Medium",
    focusAreas: [
      "Parse next-step bullets from email",
      "Map tasks to the correct contract and project",
      "Keep transcript usage as a fallback enrichment source"
    ],
    risks: [
      "Emails may vary in structure week to week",
      "Transcript truncation can miss the final assignment notes"
    ],
    decisions: ["Prefer email as the trigger and transcripts as secondary context"],
    notes: [
      {
        id: "n-102-1",
        title: "Automation Scope",
        body: "Only create tasks automatically. Leave developer assignment optional so operations can decide later.",
        updatedAt: "2026-07-25"
      }
    ]
  },
  "PRJ-108": {
    phase: "Stabilization",
    kickoffDate: "2026-07-01",
    targetLaunchDate: "2026-08-18",
    deliveryConfidence: "Medium",
    focusAreas: [
      "Reduce sync collision rate below threshold",
      "Improve retry handling for low-connectivity sessions",
      "Strengthen alerting for failed background sync"
    ],
    risks: [
      "Dependency on external auth token refresh timing",
      "Field test feedback cycle is slower than expected"
    ],
    decisions: [
      "Freeze non-critical UI changes until sync reliability clears",
      "Escalate telemetry anomaly triage to daily review"
    ],
    notes: [
      {
        id: "n-108-1",
        title: "Client Concern",
        body: "Client requested daily visibility into unresolved sync conflicts by region.",
        updatedAt: "2026-07-15"
      }
    ]
  },
  "PRJ-115": {
    phase: "Prototype",
    kickoffDate: "2026-07-15",
    targetLaunchDate: "2026-10-01",
    deliveryConfidence: "Medium",
    nextMeetingAt: "2026-08-20T21:00:00.000Z",
    focusAreas: [
      "Weave individual screens into a clickable prototype",
      "Customize avatars with world-specific selection options",
      "Add FLE reading-level scores to the book data sets"
    ],
    risks: [
      "Copyright clearance for book content still under inquiry",
      "Village storylines are under review and not yet finalized"
    ],
    decisions: [
      "Front end work is the current priority; back end is next",
      "Treat Hana's email recap notes as the primary source of truth"
    ],
    notes: [
      {
        id: "n-115-1",
        title: "Meeting Recap",
        body: "Backfilled the Hana presentation meeting and Monique's July 29 recap into this project's task list.",
        updatedAt: "2026-07-29"
      }
    ]
  }
};
