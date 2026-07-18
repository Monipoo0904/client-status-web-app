import Link from "next/link";
import { ArrowLeft, Handshake, ListTodo, UsersRound } from "lucide-react";
import MyVillageLogo from "@/components/myvillage-logo";

type ProjectStatus = "On Track" | "At Risk" | "Blocked" | "Done";
type ContractStatus = "Draft" | "Active" | "At Risk" | "Closed";
type TaskStatus = "Todo" | "In Progress" | "Blocked" | "Done";

type Developer = {
  id: string;
  name: string;
  role: string;
};

type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  ownerDeveloperId: string;
  summary: string;
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
};

type Task = {
  id: string;
  projectId: string;
  title: string;
  summary: string;
  status: TaskStatus;
  dueDate: string;
  developerId: string;
};

type ProjectDetail = {
  phase: string;
  kickoffDate: string;
  targetLaunchDate: string;
  deliveryConfidence: "High" | "Medium" | "Low";
  focusAreas: string[];
  risks: string[];
  decisions: string[];
  notes: { id: string; title: string; body: string; updatedAt: string }[];
};

const developers: Developer[] = [
  {
    id: "DEV-001",
    name: "Ari M.",
    role: "Project Lead"
  },
  {
    id: "DEV-002",
    name: "Nia",
    role: "Frontend Engineer"
  },
  {
    id: "DEV-003",
    name: "Theo",
    role: "Backend Engineer"
  }
];

const projects: Project[] = [
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

const contracts: Contract[] = [
  {
    id: "CTR-001",
    projectId: "PRJ-101",
    name: "Northwind Labs Service Agreement",
    client: "Northwind Labs",
    value: 120000,
    status: "Active",
    ownerDeveloperId: "DEV-001",
    startDate: "2026-06-15",
    renewalDate: "2026-12-15"
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
    renewalDate: "2026-11-10"
  }
];

const tasks: Task[] = [
  {
    id: "TASK-001",
    projectId: "PRJ-101",
    title: "Launch Client Status Dashboard MVP",
    summary: "Finalize one clear dashboard flow for client demos.",
    status: "In Progress",
    dueDate: "2026-07-24",
    developerId: "DEV-002"
  },
  {
    id: "TASK-002",
    projectId: "PRJ-108",
    title: "Complete API reliability pass",
    summary: "Reduce response failures and finalize service monitoring setup.",
    status: "Todo",
    dueDate: "2026-07-27",
    developerId: "DEV-003"
  }
];

const projectDetailsById: Record<string, ProjectDetail> = {
  "PRJ-101": {
    phase: "Build + QA",
    kickoffDate: "2026-06-15",
    targetLaunchDate: "2026-08-04",
    deliveryConfidence: "High",
    focusAreas: [
      "Finalize responsive dashboard behavior",
      "Complete role-based activity stream filters",
      "Lock in client-safe export format"
    ],
    risks: [
      "Billing data source occasionally returns delayed records",
      "QA coverage on legacy tablet viewport still in progress"
    ],
    decisions: [
      "Prioritize task and contract visibility before analytics widgets",
      "Ship with lightweight export first, then expanded reporting in v2"
    ],
    notes: [
      {
        id: "n-101-1",
        title: "Demo Alignment",
        body: "Client wants the first click to always land on project health and current blockers.",
        updatedAt: "2026-07-16"
      },
      {
        id: "n-101-2",
        title: "Delivery",
        body: "Frontend and API integration are on track. QA sign-off is expected this sprint.",
        updatedAt: "2026-07-17"
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
      },
      {
        id: "n-108-2",
        title: "Execution Plan",
        body: "Team agreed to complete retry logic before introducing any new workflow customization.",
        updatedAt: "2026-07-17"
      }
    ]
  }
};

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

  return "status-chip status-blocked";
}

export default async function ProjectDetailsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project =
    projects.find((item) => item.id === projectId) ??
    {
      id: projectId,
      name: "Project Detail",
      client: "Not available",
      status: "At Risk" as ProjectStatus,
      ownerDeveloperId: "",
      summary: "This project was opened from the dashboard, but detailed demo data is not available yet."
    };

  const owner = developers.find((developer) => developer.id === project.ownerDeveloperId);
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const projectContracts = contracts.filter((contract) => contract.projectId === project.id);
  const detail =
    projectDetailsById[project.id] ??
    {
      phase: "Planning",
      kickoffDate: "TBD",
      targetLaunchDate: "TBD",
      deliveryConfidence: "Low" as const,
      focusAreas: ["Define scope", "Assign ownership", "Set delivery milestones"],
      risks: ["Detailed project record has not been entered yet"],
      decisions: ["Capture project context and stakeholder expectations"],
      notes: [
        {
          id: "n-default",
          title: "Project Notes",
          body: "Add project notes and key decisions here as delivery progresses.",
          updatedAt: "TBD"
        }
      ]
    };

  return (
    <main className="dashboard-shell project-page-shell">
      <section className="hero-panel">
        <div className="project-page-back-row">
          <Link href="/" className="project-page-back-link">
            <ArrowLeft size={14} />
            Back to dashboard
          </Link>
        </div>
        <div className="brand-row">
          <div className="brand-mark" aria-hidden="true">
            <MyVillageLogo size={50} />
          </div>
          <div>
            <p className="eyebrow">Project Detail</p>
            <h1>{project.name}</h1>
          </div>
        </div>
        <p className="hero-copy">{project.summary}</p>
      </section>

      <section className="uniform-two-col">
        <article className="panel">
          <header className="panel-header">
            <h3>Project Overview</h3>
            <UsersRound size={18} />
          </header>
          <div className="task-meta-grid detail-overview-grid">
            <span>Project ID: {project.id}</span>
            <span>Client: {project.client}</span>
            <span>Owner: {owner?.name ?? "Unknown"}</span>
            <span>Owner Role: {owner?.role ?? "Unknown"}</span>
            <span>
              Status: <strong className={statusChipClass(project.status)}>{project.status}</strong>
            </span>
            <span>Open Tasks: {projectTasks.filter((task) => task.status !== "Done").length}</span>
            <span>Current Phase: {detail.phase}</span>
            <span>Kickoff: {detail.kickoffDate}</span>
            <span>Target Launch: {detail.targetLaunchDate}</span>
            <span>
              Delivery Confidence:{" "}
              <strong className={
                detail.deliveryConfidence === "High"
                  ? "status-chip status-on-track"
                  : detail.deliveryConfidence === "Medium"
                    ? "status-chip status-at-risk"
                    : "status-chip status-blocked"
              }
              >
                {detail.deliveryConfidence}
              </strong>
            </span>
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Contracts</h3>
            <Handshake size={18} />
          </header>
          <div className="contract-stack" role="list">
            {projectContracts.map((contract) => (
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
                  <span>Owner: {developers.find((item) => item.id === contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                  <span>Start: {contract.startDate}</span>
                  <span>Renewal: {contract.renewalDate}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section>
        <article className="panel">
          <header className="panel-header">
            <h3>Tasks</h3>
            <ListTodo size={18} />
          </header>
          <div className="task-list" role="list">
            {projectTasks.map((task) => (
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
                  <span>Due: {task.dueDate}</span>
                  <span>Developer: {developers.find((item) => item.id === task.developerId)?.name ?? "Unassigned"}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="uniform-two-col">
        <article className="panel">
          <header className="panel-header">
            <h3>Detailed Project Overview</h3>
            <UsersRound size={18} />
          </header>
          <div className="detail-list-grid">
            <div>
              <p className="project-id">Focus Areas</p>
              <ul className="detail-list">
                {detail.focusAreas.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="project-id">Current Risks</p>
              <ul className="detail-list">
                {detail.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="project-id">Key Decisions</p>
              <ul className="detail-list">
                {detail.decisions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Project Notes</h3>
            <ListTodo size={18} />
          </header>
          <div className="notes-stack" role="list">
            {detail.notes.map((note) => (
              <article key={note.id} className="note-item" role="listitem">
                <div className="activity-top">
                  <strong>{note.title}</strong>
                  <span>{note.updatedAt}</span>
                </div>
                <p className="activity-details">{note.body}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
