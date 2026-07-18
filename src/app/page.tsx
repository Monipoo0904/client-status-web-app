"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardPen,
  FileText,
  Handshake,
  ListTodo,
  MessagesSquare,
  Plus,
  UsersRound
} from "lucide-react";

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

type ContractProgressEntry = {
  id: string;
  note: string;
  createdAt: string;
  author: string;
};

type Contract = {
  id: string;
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
  title: string;
  summary: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  developerId: string;
  contractId: string;
};

type MeetingNote = {
  id: string;
  title: string;
  meetingDate: string;
  attendees: string;
  notes: string;
  createdAt: string;
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

const seedContracts: Contract[] = [
  {
    id: "CTR-001",
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
    title: "Complete API reliability pass",
    summary: "Reduce response failures and finalize service monitoring setup.",
    status: "Todo",
    priority: "Medium",
    dueDate: "2026-07-27",
    developerId: "DEV-003",
    contractId: "CTR-002"
  }
];

const initialMeetings: MeetingNote[] = [
  {
    id: "M-001",
    title: "Weekly Client Sync",
    meetingDate: "2026-07-16",
    attendees: "Ari M., Client PM, Tech Lead",
    notes: "Aligned on deployment timeline and demo scope.",
    createdAt: "2026-07-16T18:20:00.000Z"
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

function statusChipClass(status: TaskStatus | ContractStatus) {
  if (status === "Done" || status === "Active") {
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

export default function Home() {
  const [developers, setDevelopers] = useState<Developer[]>(seedDevelopers);
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [contractDrafts, setContractDrafts] = useState<Record<string, string>>({});
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(initialMeetings);
  const [developerForm, setDeveloperForm] = useState({
    name: "",
    role: "",
    focus: "",
    capacity: 70
  });
  const [contractForm, setContractForm] = useState({
    name: "",
    client: "",
    value: 0,
    status: "Draft" as ContractStatus,
    ownerDeveloperId: "",
    startDate: "",
    renewalDate: ""
  });
  const [taskForm, setTaskForm] = useState({
    title: "",
    summary: "",
    status: "Todo" as TaskStatus,
    priority: "Medium" as TaskPriority,
    dueDate: "",
    developerId: "",
    contractId: ""
  });
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meetingDate: "",
    attendees: "",
    notes: ""
  });

  const taskDoneCount = tasks.filter((task) => task.status === "Done").length;
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

    const meetingActivity = meetingNotes.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      type: "Meeting Note",
      title: meeting.title,
      details: meeting.notes,
      createdAt: meeting.createdAt
    }));

    return [...contractActivity, ...meetingActivity].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contracts, meetingNotes]);

  const developerLookup = useMemo(() => {
    return new Map(developers.map((developer) => [developer.id, developer]));
  }, [developers]);

  const handleDeveloperAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!developerForm.name || !developerForm.role) {
      return;
    }

    setDevelopers((current) => [
      {
        id: `DEV-${Date.now()}`,
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

  const handleContractAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contractForm.name || !contractForm.client || !contractForm.ownerDeveloperId) {
      return;
    }

    setContracts((current) => [
      {
        id: `CTR-${Date.now()}`,
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
      startDate: "",
      renewalDate: ""
    });
  };

  const handleTaskAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskForm.title || !taskForm.developerId || !taskForm.contractId) {
      return;
    }

    setTasks((current) => [
      {
        id: `TASK-${Date.now()}`,
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
      contractId: ""
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

  const handleMeetingAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!meetingForm.title || !meetingForm.meetingDate || !meetingForm.notes) {
      return;
    }

    const createdAt = new Date().toISOString();
    setMeetingNotes((current) => [
      {
        id: `M-${Date.now()}`,
        title: meetingForm.title,
        meetingDate: meetingForm.meetingDate,
        attendees: meetingForm.attendees || "Not specified",
        notes: meetingForm.notes,
        createdAt
      },
      ...current
    ]);

    setMeetingForm({
      title: "",
      meetingDate: "",
      attendees: "",
      notes: ""
    });
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
              <h1>Centralized Tracker Workspace</h1>
            </div>
          </div>
          <p className="hero-copy">
            Edit one demo task, log timestamped contract progress, and record meeting notes in one location.
          </p>
        </motion.div>
      </section>

      <section className="metrics-grid metrics-grid-four">
        <MetricCard icon={<ListTodo size={20} />} label="Total Tasks" value="1" tone="sun" />
        <MetricCard
          icon={<CheckCircle2 size={20} />}
          label="Tasks Done"
          value={`${taskDoneCount}/${tasks.length}`}
          tone="forest"
        />
        <MetricCard icon={<Handshake size={20} />} label="Active Contracts" value={String(activeContracts)} tone="flare" />
        <MetricCard
          icon={<MessagesSquare size={20} />}
          label="Meeting Notes"
          value={String(meetingNotes.length)}
          tone="earth"
        />
      </section>

      <section className="builder-grid">
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
            <h3>Add Contract</h3>
            <BriefcaseBusiness size={18} />
          </header>
          <form className="entry-form" onSubmit={handleContractAdd}>
            <div className="field-row two-col">
              <label>
                Contract Name
                <input
                  value={contractForm.name}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </label>
              <label>
                Client
                <input
                  value={contractForm.client}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, client: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="field-row three-col">
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
                    setContractForm((current) => ({
                      ...current,
                      status: event.target.value as ContractStatus
                    }))
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
              <label>
                Owner
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
            </div>
            <div className="field-row two-col">
              <label>
                Start Date
                <input
                  type="date"
                  value={contractForm.startDate}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, startDate: event.target.value }))
                  }
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

      <section className="builder-grid">
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
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Due Date
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="field-row three-col">
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
                    setTaskForm((current) => ({
                      ...current,
                      priority: event.target.value as TaskPriority
                    }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
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
            </div>
            <div className="field-row two-col">
              <label>
                Linked Contract
                <select
                  value={taskForm.contractId}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, contractId: event.target.value }))
                  }
                >
                  <option value="">Select contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Summary
                <input
                  value={taskForm.summary}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, summary: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Add Task</button>
          </form>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Team Overview</h3>
            <UsersRound size={18} />
          </header>
          <div className="developer-grid" role="list">
            {developers.map((developer) => {
              const assignedTasks = tasks.filter((task) => task.developerId === developer.id).length;
              const ownedContracts = contracts.filter(
                (contract) => contract.ownerDeveloperId === developer.id
              ).length;

              return (
                <article key={developer.id} className="developer-card" role="listitem">
                  <p className="project-id">{developer.id}</p>
                  <h3>{developer.name}</h3>
                  <p className="project-meta">{developer.role}</p>
                  <p className="task-line">Focus: {developer.focus}</p>
                  <div className="developer-meta">
                    <span>Capacity: {developer.capacity}%</span>
                    <span>Tasks: {assignedTasks}</span>
                    <span>Contracts: {ownedContracts}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>All Tasks</h3>
            <FileText size={18} />
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
                  <span>Developer: {developerLookup.get(task.developerId)?.name ?? "Unassigned"}</span>
                  <span>
                    Contract: {contracts.find((contract) => contract.id === task.contractId)?.name ?? "None"}
                  </span>
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
                  <span>Value: {formatCurrency(contract.value)}</span>
                  <span>Owner: {developerLookup.get(contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                  <span>Start: {contract.startDate}</span>
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
      </section>

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Meeting Notes Recorder</h3>
            <ClipboardPen size={18} />
          </header>
          <form className="entry-form" onSubmit={handleMeetingAdd}>
            <div className="field-row two-col">
              <label>
                Meeting Title
                <input
                  value={meetingForm.title}
                  onChange={(event) =>
                    setMeetingForm((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </label>
              <label>
                Meeting Date
                <input
                  type="date"
                  value={meetingForm.meetingDate}
                  onChange={(event) =>
                    setMeetingForm((current) => ({ ...current, meetingDate: event.target.value }))
                  }
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Attendees
                <input
                  value={meetingForm.attendees}
                  onChange={(event) =>
                    setMeetingForm((current) => ({ ...current, attendees: event.target.value }))
                  }
                  placeholder="Name, Name, Name"
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Notes
                <textarea
                  rows={4}
                  value={meetingForm.notes}
                  onChange={(event) =>
                    setMeetingForm((current) => ({ ...current, notes: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Save Meeting Note</button>
          </form>

          <div className="meeting-list" role="list">
            {meetingNotes.map((meeting) => (
              <article key={meeting.id} className="meeting-item" role="listitem">
                <div className="activity-top">
                  <strong>{meeting.title}</strong>
                  <span>{formatDateTime(meeting.createdAt)}</span>
                </div>
                <p className="project-meta">
                  Date: {meeting.meetingDate} · Attendees: {meeting.attendees}
                </p>
                <p className="activity-details">{meeting.notes}</p>
              </article>
            ))}
          </div>
        </article>

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
