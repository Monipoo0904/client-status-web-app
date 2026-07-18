import Link from "next/link";
import { ArrowLeft, Handshake, ListTodo, UsersRound } from "lucide-react";

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
            <span>MV</span>
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
          <div className="task-meta-grid">
            <span>Project ID: {project.id}</span>
            <span>Client: {project.client}</span>
            <span>Owner: {owner?.name ?? "Unknown"}</span>
            <span>Owner Role: {owner?.role ?? "Unknown"}</span>
            <span>Status: <strong className={statusChipClass(project.status)}>{project.status}</strong></span>
            <span>Open Tasks: {projectTasks.filter((task) => task.status !== "Done").length}</span>
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
    </main>
  );
}
