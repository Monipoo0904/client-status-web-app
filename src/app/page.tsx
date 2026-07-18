"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Handshake,
  ListTodo,
  MessagesSquare,
  Plus,
  UsersRound
} from "lucide-react";

type ProjectStatus = "On Track" | "At Risk" | "Blocked" | "Done";
type ContractStatus = "Draft" | "Active" | "At Risk" | "Closed";
type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";
type TaskPriority = "Low" | "Medium" | "High";

type Developer = {
  id: string;
  name: string;
  role: string;
  focus: string;
  capacity: number;
};

type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  ownerDeveloperId: string;
  summary: string;
};

type ContractProgressEntry = {
  id: string;
  note: string;
  createdAt: string;
  author: string;
};

type Contract = {
  id: string;
  projectId: string;
  name: string;
  client: string;
  value: number;
  status: ContractStatus;
  ownerDeveloperId: string;
  startDate: string;
  renewalDate: string;
  progress: ContractProgressEntry[];
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  developerId: string;
  contractId: string;
};

const seedDevelopers: Developer[] = [
  {
    id: "DEV-001",
    name: "Ari M.",
    role: "Project Lead",
    focus: "Delivery and client sync",
    capacity: 80
  },
  {
    id: "DEV-002",
    name: "Nia",
    role: "Frontend Engineer",
    focus: "UI and dashboard modules",
    capacity: 75
  },
  {
    id: "DEV-003",
    name: "Theo",
    role: "Backend Engineer",
    focus: "Data APIs and integration",
    capacity: 70
  }
];

const seedProjects: Project[] = [
  {
    id: "PRJ-101",
    name: "Client Portal Refresh",
    client: "Northwind Labs",
    status: "On Track",
    ownerDeveloperId: "DEV-001",
    summary: "Modernize client portal with task and contract visibility."
  },
  {
    id: "PRJ-108",
    name: "Field Ops Mobile Sync",
    client: "Harvest Grid",
    status: "At Risk",
    ownerDeveloperId: "DEV-003",
    summary: "Improve sync reliability and release updated field workflow tooling."
  }
];

const seedContracts: Contract[] = [
  {
    id: "CTR-001",
    projectId: "PRJ-101",
    name: "Northwind Labs Service Agreement",
    client: "Northwind Labs",
    value: 120000,
    status: "Active",
    ownerDeveloperId: "DEV-001",
    startDate: "2026-06-15",
    renewalDate: "2026-12-15",
    progress: [
      {
        id: "p1",
        note: "Kickoff completed and statement of work approved.",
        createdAt: "2026-07-10T10:00:00.000Z",
        author: "Ari M."
      }
    ]
  },
  {
    id: "CTR-002",
    projectId: "PRJ-108",
    name: "Harvest Grid Extension",
    client: "Harvest Grid",
    value: 88000,
    status: "At Risk",
    ownerDeveloperId: "DEV-003",
    startDate: "2026-07-01",
    renewalDate: "2026-11-10",
    progress: [
      {
        id: "p2",
        note: "Legal review comments received from client counsel.",
        createdAt: "2026-07-12T15:30:00.000Z",
        author: "Theo"
      }
    ]
  }
];

const seedTasks: Task[] = [
  {
    id: "TASK-001",
    projectId: "PRJ-101",
    title: "Launch Client Status Dashboard MVP",
    summary: "Finalize one clear dashboard flow for client demos.",
    status: "In Progress",
    priority: "High",
    dueDate: "2026-07-24",
    developerId: "DEV-002",
    contractId: "CTR-001"
  },
  {
    id: "TASK-002",
    projectId: "PRJ-108",
    title: "Complete API reliability pass",
    summary: "Reduce response failures and finalize service monitoring setup.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-07-27",
    developerId: "DEV-003",
    contractId: "CTR-002"
  }
];

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown time";
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function statusChipClass(status: TaskStatus | ContractStatus | ProjectStatus) {
  if (status === "Done" || status === "Active" || status === "On Track") {
    return "status-chip status-on-track";
  }

  if (status === "In Progress" || status === "Todo" || status === "Draft") {
    return "status-chip status-at-risk";
  }

  if (status === "Closed") {
    return "status-chip contract-pending";
  }

  return "status-chip status-blocked";
}

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "sun" | "forest" | "flare" | "earth";
}) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-icon">{icon}</div>
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-shell" aria-label={`Progress ${value}%`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

export default function Home() {
  const [developers, setDevelopers] = useState<Developer[]>(seedDevelopers);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [contractDrafts, setContractDrafts] = useState<Record<string, string>>({});

  const [projectForm, setProjectForm] = useState({
    name: "",
    client: "",
    status: "On Track" as ProjectStatus,
    ownerDeveloperId: "",
    summary: ""
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    summary: "",
    status: "Todo" as TaskStatus,
    priority: "Medium" as TaskPriority,
    dueDate: "",
    developerId: "",
    contractId: "",
    projectId: ""
  });

  const [contractForm, setContractForm] = useState({
    name: "",
    client: "",
    value: 0,
    status: "Draft" as ContractStatus,
    ownerDeveloperId: "",
    projectId: "",
    startDate: "",
    renewalDate: ""
  });

  const [developerForm, setDeveloperForm] = useState({
    name: "",
    role: "",
    focus: "",
    capacity: 70
  });

  const developerLookup = useMemo(() => new Map(developers.map((d) => [d.id, d])), [developers]);
  const contractLookup = useMemo(() => new Map(contracts.map((c) => [c.id, c])), [contracts]);

  const projectOverview = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const projectContracts = contracts.filter((contract) => contract.projectId === project.id);
      const doneTasks = projectTasks.filter((task) => task.status === "Done").length;
      const progressPct = projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

      return {
        project,
        tasks: projectTasks,
        contracts: projectContracts,
        progressPct,
        openTasks: projectTasks.filter((task) => task.status !== "Done").length
      };
    });
  }, [projects, tasks, contracts]);

  const taskDoneCount = tasks.filter((task) => task.status === "Done").length;
  const openTaskCount = tasks.length - taskDoneCount;
  const activeContracts = contracts.filter((contract) => contract.status === "Active").length;

  const activityFeed = useMemo(() => {
    const contractActivity = contracts.flatMap((contract) =>
      contract.progress.map((entry) => ({
        id: `${contract.id}-${entry.id}`,
        type: "Contract Update",
        title: contract.name,
        details: entry.note,
        createdAt: entry.createdAt
      }))
    );

    return [...contractActivity].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contracts]);

  const handleDeveloperAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!developerForm.name || !developerForm.role) {
      return;
    }

    const nextId = `DEV-${Date.now()}`;
    setDevelopers((current) => [
      {
        id: nextId,
        name: developerForm.name,
        role: developerForm.role,
        focus: developerForm.focus || "General",
        capacity: Number(developerForm.capacity)
      },
      ...current
    ]);

    setDeveloperForm({
      name: "",
      role: "",
      focus: "",
      capacity: 70
    });
  };

  const handleProjectAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectForm.name || !projectForm.client || !projectForm.ownerDeveloperId) {
      return;
    }

    const nextId = `PRJ-${Date.now()}`;
    setProjects((current) => [
      {
        id: nextId,
        name: projectForm.name,
        client: projectForm.client,
        status: projectForm.status,
        ownerDeveloperId: projectForm.ownerDeveloperId,
        summary: projectForm.summary || "No summary provided."
      },
      ...current
    ]);

    setProjectForm({
      name: "",
      client: "",
      status: "On Track",
      ownerDeveloperId: "",
      summary: ""
    });
  };

  const handleContractAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contractForm.name || !contractForm.client || !contractForm.ownerDeveloperId || !contractForm.projectId) {
      return;
    }

    setContracts((current) => [
      {
        id: `CTR-${Date.now()}`,
        projectId: contractForm.projectId,
        name: contractForm.name,
        client: contractForm.client,
        value: Number(contractForm.value),
        status: contractForm.status,
        ownerDeveloperId: contractForm.ownerDeveloperId,
        startDate: contractForm.startDate || new Date().toISOString().slice(0, 10),
        renewalDate: contractForm.renewalDate || new Date().toISOString().slice(0, 10),
        progress: []
      },
      ...current
    ]);

    setContractForm({
      name: "",
      client: "",
      value: 0,
      status: "Draft",
      ownerDeveloperId: "",
      projectId: "",
      startDate: "",
      renewalDate: ""
    });
  };

  const handleTaskAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskForm.title || !taskForm.projectId || !taskForm.developerId) {
      return;
    }

    setTasks((current) => [
      {
        id: `TASK-${Date.now()}`,
        projectId: taskForm.projectId,
        title: taskForm.title,
        summary: taskForm.summary || "No summary provided.",
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || new Date().toISOString().slice(0, 10),
        developerId: taskForm.developerId,
        contractId: taskForm.contractId
      },
      ...current
    ]);

    setTaskForm({
      title: "",
      summary: "",
      status: "Todo",
      priority: "Medium",
      dueDate: "",
      developerId: "",
      contractId: "",
      projectId: ""
    });
  };

  const handleContractProgressAdd = (event: React.FormEvent<HTMLFormElement>, contractId: string) => {
    event.preventDefault();
    const draft = (contractDrafts[contractId] ?? "").trim();
    if (!draft) {
      return;
    }

    const timestamp = new Date().toISOString();
    setContracts((current) =>
      current.map((contract) =>
        contract.id === contractId
          ? {
              ...contract,
              progress: [
                {
                  id: `p-${Date.now()}`,
                  note: draft,
                  createdAt: timestamp,
                  author: developerLookup.get(contract.ownerDeveloperId)?.name ?? "System"
                },
                ...contract.progress
              ]
            }
          : contract
      )
    );
    setContractDrafts((current) => ({ ...current, [contractId]: "" }));
  };

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="brand-row">
            <div className="brand-mark" aria-hidden="true">
              <span>MV</span>
            </div>
            <div>
              <p className="eyebrow">MyVillage Project</p>
              <h1>Project Portfolio Overview</h1>
            </div>
          </div>
          <p className="hero-copy">
            Unified overview of projects, tasks, contracts, and developer assignments with expandable project breakdowns.
          </p>
        </motion.div>
      </section>

      <section className="metrics-grid metrics-grid-four motion-section delay-1">
        <MetricCard icon={<FileText size={20} />} label="Projects" value={String(projects.length)} tone="sun" />
        <MetricCard icon={<ListTodo size={20} />} label="Open Tasks" value={String(openTaskCount)} tone="forest" />
        <MetricCard icon={<Handshake size={20} />} label="Active Contracts" value={String(activeContracts)} tone="flare" />
        <MetricCard icon={<UsersRound size={20} />} label="Developers" value={String(developers.length)} tone="earth" />
      </section>

      <section className="workspace-layout motion-section delay-2">
        <aside className="panel project-sidebar">
          <header className="panel-header">
            <h3>Projects</h3>
            <BriefcaseBusiness size={18} />
          </header>

          <div className="sidebar-project-list">
            {projectOverview.map(({ project, tasks: pTasks, contracts: pContracts, openTasks }) => (
              <article key={project.id} className="sidebar-project-item">
                <Link className="sidebar-project-toggle" href={`/projects/${project.id}`}>
                  <div>
                    <p className="project-id">{project.id}</p>
                    <h4>{project.name}</h4>
                    <p className="project-meta">{project.client}</p>
                  </div>
                  <span className={statusChipClass(project.status)}>{project.status}</span>
                </Link>
                <div className="sidebar-project-details">
                  <p>
                    <strong>Owner:</strong> {developerLookup.get(project.ownerDeveloperId)?.name ?? "Unknown"}
                  </p>
                  <p>
                    <strong>Tasks:</strong> {pTasks.length} ({openTasks} open)
                  </p>
                  <p>
                    <strong>Contracts:</strong> {pContracts.length}
                  </p>
                  <ul>
                    {pTasks.slice(0, 3).map((task) => (
                      <li key={task.id}>{task.title}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="workspace-main">
          <article className="panel">
            <header className="panel-header">
              <h3>Project Task Completion</h3>
              <CheckCircle2 size={18} />
            </header>
            <div className="project-overview-grid" role="list">
              {projectOverview.map(({ project, tasks: pTasks, progressPct }) => (
                <article key={project.id} className="project-overview-card" role="listitem">
                  <div className="contract-top">
                    <div>
                      <p className="project-id">{project.id}</p>
                      <h3>
                        <Link href={`/projects/${project.id}`}>{project.name}</Link>
                      </h3>
                      <p className="project-meta">{project.summary}</p>
                    </div>
                    <span className={statusChipClass(project.status)}>{project.status}</span>
                  </div>
                  <div className="progress-row">
                    <span>Task completion</span>
                    <strong>{progressPct}%</strong>
                  </div>
                  <ProgressBar value={progressPct} />
                  <div className="task-meta-grid">
                    <span>Total tasks: {pTasks.length}</span>
                    <span>Done: {pTasks.filter((task) => task.status === "Done").length}</span>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className="uniform-two-col">
            <article className="panel">
              <header className="panel-header">
                <h3>All Tasks</h3>
                <ListTodo size={18} />
              </header>
              <div className="task-list" role="list">
                {tasks.map((task) => (
                  <article key={task.id} className="task-item" role="listitem">
                    <div className="contract-top">
                      <div>
                        <p className="project-id">{task.id}</p>
                        <h3>{task.title}</h3>
                        <p className="project-meta">{task.summary}</p>
                      </div>
                      <span className={statusChipClass(task.status)}>{task.status}</span>
                    </div>
                    <div className="task-meta-grid">
                      <span>Priority: {task.priority}</span>
                      <span>Due: {task.dueDate}</span>
                      <span>Project: {projects.find((project) => project.id === task.projectId)?.name ?? "Unknown"}</span>
                      <span>Developer: {developerLookup.get(task.developerId)?.name ?? "Unassigned"}</span>
                      <span>Contract: {contractLookup.get(task.contractId)?.name ?? "Not linked"}</span>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel">
              <header className="panel-header">
                <h3>All Contracts</h3>
                <Handshake size={18} />
              </header>
              <div className="contract-stack" role="list">
                {contracts.map((contract) => (
                  <article key={contract.id} className="contract-item" role="listitem">
                    <div className="contract-top">
                      <div>
                        <p className="project-id">{contract.id}</p>
                        <h3>{contract.name}</h3>
                        <p className="project-meta">{contract.client}</p>
                      </div>
                      <span className={statusChipClass(contract.status)}>{contract.status}</span>
                    </div>
                    <div className="task-meta-grid">
                      <span>Project: {projects.find((project) => project.id === contract.projectId)?.name ?? "Unknown"}</span>
                      <span>Value: {formatCurrency(contract.value)}</span>
                      <span>Owner: {developerLookup.get(contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                      <span>Renewal: {contract.renewalDate}</span>
                    </div>
                    <form className="inline-form" onSubmit={(event) => handleContractProgressAdd(event, contract.id)}>
                      <input
                        value={contractDrafts[contract.id] ?? ""}
                        onChange={(event) =>
                          setContractDrafts((current) => ({ ...current, [contract.id]: event.target.value }))
                        }
                        placeholder="Add timestamped progress update"
                      />
                      <button type="submit">
                        <Plus size={14} />
                        Log
                      </button>
                    </form>
                    <ul className="contract-log-list">
                      {contract.progress.map((entry) => (
                        <li key={entry.id}>
                          <span>{entry.note}</span>
                          <span>
                            {entry.author} · {formatDateTime(entry.createdAt)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="builder-grid motion-section delay-3">
        <article className="panel">
          <header className="panel-header">
            <h3>Add Developer</h3>
            <UsersRound size={18} />
          </header>
          <form className="entry-form" onSubmit={handleDeveloperAdd}>
            <div className="field-row two-col">
              <label>
                Name
                <input
                  value={developerForm.name}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                Role
                <input
                  value={developerForm.role}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({ ...current, role: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="field-row two-col">
              <label>
                Focus Area
                <input
                  value={developerForm.focus}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({ ...current, focus: event.target.value }))
                  }
                />
              </label>
              <label>
                Capacity %
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={developerForm.capacity}
                  onChange={(event) =>
                    setDeveloperForm((current) => ({ ...current, capacity: Number(event.target.value) }))
                  }
                />
              </label>
            </div>
            <button type="submit">Add Developer</button>
          </form>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Add Project</h3>
            <BriefcaseBusiness size={18} />
          </header>
          <form className="entry-form" onSubmit={handleProjectAdd}>
            <div className="field-row two-col">
              <label>
                Project Name
                <input
                  value={projectForm.name}
                  onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                Client
                <input
                  value={projectForm.client}
                  onChange={(event) => setProjectForm((current) => ({ ...current, client: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row two-col">
              <label>
                Status
                <select
                  value={projectForm.status}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))
                  }
                >
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </label>
              <label>
                Project Owner
                <select
                  value={projectForm.ownerDeveloperId}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, ownerDeveloperId: event.target.value }))
                  }
                >
                  <option value="">Select developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-row">
              <label>
                Project Summary
                <textarea
                  rows={3}
                  value={projectForm.summary}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Add Project</button>
          </form>
        </article>
      </section>

      <section className="builder-grid motion-section delay-4">
        <article className="panel">
          <header className="panel-header">
            <h3>Add Task</h3>
            <ListTodo size={18} />
          </header>
          <form className="entry-form" onSubmit={handleTaskAdd}>
            <div className="field-row two-col">
              <label>
                Task Title
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label>
                Due Date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row three-col">
              <label>
                Project
                <select
                  value={taskForm.projectId}
                  onChange={(event) => setTaskForm((current) => ({ ...current, projectId: event.target.value }))}
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={taskForm.status}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, status: event.target.value as TaskStatus }))
                  }
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
            </div>
            <div className="field-row two-col">
              <label>
                Developer
                <select
                  value={taskForm.developerId}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, developerId: event.target.value }))
                  }
                >
                  <option value="">Select developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Linked Contract
                <select
                  value={taskForm.contractId}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, contractId: event.target.value }))
                  }
                >
                  <option value="">Optional</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-row">
              <label>
                Task Summary
                <textarea
                  rows={3}
                  value={taskForm.summary}
                  onChange={(event) => setTaskForm((current) => ({ ...current, summary: event.target.value }))}
                />
              </label>
            </div>
            <button type="submit">Add Task</button>
          </form>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Add Contract</h3>
            <Handshake size={18} />
          </header>
          <form className="entry-form" onSubmit={handleContractAdd}>
            <div className="field-row two-col">
              <label>
                Contract Name
                <input
                  value={contractForm.name}
                  onChange={(event) => setContractForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label>
                Client
                <input
                  value={contractForm.client}
                  onChange={(event) => setContractForm((current) => ({ ...current, client: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row three-col">
              <label>
                Project
                <select
                  value={contractForm.projectId}
                  onChange={(event) => setContractForm((current) => ({ ...current, projectId: event.target.value }))}
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Value
                <input
                  type="number"
                  min={0}
                  value={contractForm.value}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, value: Number(event.target.value) }))
                  }
                />
              </label>
              <label>
                Status
                <select
                  value={contractForm.status}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, status: event.target.value as ContractStatus }))
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
            </div>
            <div className="field-row three-col">
              <label>
                Contract Owner
                <select
                  value={contractForm.ownerDeveloperId}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, ownerDeveloperId: event.target.value }))
                  }
                >
                  <option value="">Select developer</option>
                  {developers.map((developer) => (
                    <option key={developer.id} value={developer.id}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start Date
                <input
                  type="date"
                  value={contractForm.startDate}
                  onChange={(event) => setContractForm((current) => ({ ...current, startDate: event.target.value }))}
                />
              </label>
              <label>
                Renewal Date
                <input
                  type="date"
                  value={contractForm.renewalDate}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, renewalDate: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Add Contract</button>
          </form>
        </article>
      </section>

      <section className="motion-section delay-5">
        <article className="panel">
          <header className="panel-header">
            <h3>Centralized Activity Feed</h3>
            <MessagesSquare size={18} />
          </header>
          <div className="activity-feed" role="list">
            {activityFeed.map((entry) => (
              <article key={entry.id} className="activity-item" role="listitem">
                <div className="activity-top">
                  <strong>{entry.type}</strong>
                  <span>{formatDateTime(entry.createdAt)}</span>
                </div>
                <p className="activity-title">{entry.title}</p>
                <p className="activity-details">{entry.details}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
