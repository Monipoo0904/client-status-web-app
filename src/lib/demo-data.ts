export type ProjectStatus = "On Track" | "At Risk" | "Blocked";
export type ContractStatus = "Active" | "Pending Signature" | "Renewal Due";

export type Priority = "High" | "Medium" | "Low";

export type Villager = {
  name: string;
  role: string;
  capacity: number;
};

export type Project = {
  id: string;
  name: string;
  client: string;
  owner: string;
  status: ProjectStatus;
  progress: number;
  sprintGoal: string;
  villagers: Villager[];
  nextSteps: { task: string; due: string; priority: Priority }[];
};

export type Contract = {
  id: string;
  projectId: string;
  client: string;
  owner: string;
  value: number;
  renewalDate: string;
  status: ContractStatus;
};

export const projects: Project[] = [
  {
    id: "PRJ-101",
    name: "Client Portal Refresh",
    client: "Northwind Labs",
    owner: "Ari M.",
    status: "On Track",
    progress: 74,
    sprintGoal: "Ship authenticated dashboard and billing summary views.",
    villagers: [
      { name: "Nia", role: "Frontend", capacity: 80 },
      { name: "Rafi", role: "Backend", capacity: 70 },
      { name: "Soren", role: "QA", capacity: 65 }
    ],
    nextSteps: [
      { task: "Finalize dashboard empty states", due: "Jul 22", priority: "Medium" },
      { task: "Complete billing endpoint integration", due: "Jul 21", priority: "High" },
      { task: "Regression pass before demo", due: "Jul 24", priority: "Medium" }
    ]
  },
  {
    id: "PRJ-108",
    name: "Field Ops Mobile Sync",
    client: "Harvest Grid",
    owner: "Liam K.",
    status: "At Risk",
    progress: 53,
    sprintGoal: "Reduce offline data conflicts below 1.5%.",
    villagers: [
      { name: "Mika", role: "Mobile", capacity: 90 },
      { name: "Theo", role: "Platform", capacity: 85 },
      { name: "Jules", role: "Data", capacity: 60 }
    ],
    nextSteps: [
      { task: "Patch merge conflict resolver", due: "Jul 20", priority: "High" },
      { task: "Run 3-day offline simulation", due: "Jul 23", priority: "High" },
      { task: "Review telemetry dropouts", due: "Jul 25", priority: "Medium" }
    ]
  },
  {
    id: "PRJ-114",
    name: "Partner Analytics Hub",
    client: "Skyline Commerce",
    owner: "Rina T.",
    status: "Blocked",
    progress: 41,
    sprintGoal: "Launch executive metrics board with role-based access.",
    villagers: [
      { name: "Anya", role: "Frontend", capacity: 75 },
      { name: "Dax", role: "API", capacity: 80 },
      { name: "Vik", role: "Security", capacity: 40 }
    ],
    nextSteps: [
      { task: "Resolve delayed SSO credentials", due: "Jul 19", priority: "High" },
      { task: "Align permission matrix with client IT", due: "Jul 21", priority: "High" },
      { task: "Resume KPI panel implementation", due: "Jul 26", priority: "Low" }
    ]
  }
];

export const developerWorkstreams = [
  {
    developer: "Nia",
    project: "Client Portal Refresh",
    currentTask: "Dashboard card states",
    completion: 78,
    status: "On Track"
  },
  {
    developer: "Theo",
    project: "Field Ops Mobile Sync",
    currentTask: "Conflict resolver patch",
    completion: 49,
    status: "At Risk"
  },
  {
    developer: "Dax",
    project: "Partner Analytics Hub",
    currentTask: "Auth gateway contract",
    completion: 35,
    status: "Blocked"
  },
  {
    developer: "Rafi",
    project: "Client Portal Refresh",
    currentTask: "Billing endpoint integration",
    completion: 66,
    status: "On Track"
  }
] as const;

export const contracts: Contract[] = [
  {
    id: "CTR-501",
    projectId: "PRJ-101",
    client: "Northwind Labs",
    owner: "Ari M.",
    value: 120000,
    renewalDate: "2026-12-14",
    status: "Active"
  },
  {
    id: "CTR-502",
    projectId: "PRJ-108",
    client: "Harvest Grid",
    owner: "Liam K.",
    value: 89000,
    renewalDate: "2026-08-01",
    status: "Renewal Due"
  },
  {
    id: "CTR-503",
    projectId: "PRJ-114",
    client: "Skyline Commerce",
    owner: "Rina T.",
    value: 164000,
    renewalDate: "2026-09-10",
    status: "Pending Signature"
  }
];
