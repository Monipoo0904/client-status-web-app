// Standalone read-only detail page for a single project, linked from the
// dashboard's project cards ("/projects/[projectId]").
//
// IMPORTANT: this is a server component that reads directly from the static
// seed* arrays in demo-data.ts — it does NOT see edits made in the
// dashboard's client-side state (src/app/page.tsx), since there's no shared
// backend. E.g. renaming a project via the dashboard's inline edit form
// won't be reflected here until the seed data itself is updated. If you need
// this page to reflect live edits, it would need to become a client
// component reading from the same lifted state as page.tsx (or a real
// backend), not a quick tweak here.
import Link from "next/link";
import { ArrowLeft, Handshake, ListTodo, Mail, UsersRound } from "lucide-react";
import MyVillageLogo from "@/components/myvillage-logo";
import {
  projectDetailsById,
  seedContracts,
  seedDevelopers,
  seedProjects,
  seedTasks,
  type ContractStatus,
  type ProjectStatus,
  type TaskStatus
} from "@/lib/demo-data";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
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
  // Falls back to a placeholder for any project not in the static seed
  // list — this is what a visitor sees if they click into a project that
  // was only created live in the dashboard (see file-top note).
  const project =
    seedProjects.find((item) => item.id === projectId) ??
    {
      id: projectId,
      contractId: "",
      name: "Project Detail",
      client: "Not available",
      status: "At Risk" as ProjectStatus,
      ownerDeveloperId: "",
      summary: "This project was opened from the dashboard, but detailed demo data is not available yet."
    };

  const contract = seedContracts.find((item) => item.id === project.contractId);
  const owner = seedDevelopers.find((developer) => developer.id === project.ownerDeveloperId);
  const projectTasks = seedTasks.filter((task) => task.projectId === project.id);
  const projectDevelopers = seedDevelopers.filter(
    (developer) =>
      developer.id === project.ownerDeveloperId || projectTasks.some((task) => task.developerId === developer.id)
  );
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
        {contract ? <p className="helper-copy">Contract folder: {contract.organization}</p> : null}
      </section>

      <section className="uniform-two-col">
        <article className="panel">
          <header className="panel-header">
            <h3>Project Overview</h3>
            <UsersRound size={18} />
          </header>
          <div className="task-meta-grid detail-overview-grid">
            <span>Project ID: {project.id}</span>
            <span>Contract: {contract?.name ?? "Not linked"}</span>
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
            <span>Next Meeting: {detail.nextMeetingAt ? formatDateTime(detail.nextMeetingAt) : "Not scheduled"}</span>
            <span>
              Delivery Confidence:{" "}
              <strong
                className={
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
            <h3>Contract Folder</h3>
            <Handshake size={18} />
          </header>
          {contract ? (
            <div className="contract-stack" role="list">
              <article key={contract.id} className="contract-item" role="listitem">
                <div className="contract-top">
                  <div>
                    <p className="project-id">{contract.id}</p>
                    <h3>{contract.name}</h3>
                    <p className="project-meta">{contract.organization}</p>
                  </div>
                  <span className={statusChipClass(contract.status)}>{contract.status}</span>
                </div>
                <div className="task-meta-grid">
                  <span>Value: {formatCurrency(contract.value)}</span>
                  <span>Owner: {seedDevelopers.find((item) => item.id === contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                  <span>Start: {formatDate(contract.startDate)}</span>
                  <span>Renewal: {formatDate(contract.renewalDate)}</span>
                  <span>Workflow: {contract.workflowMode}</span>
                </div>
                <p className="helper-copy">{contract.workflowNotes}</p>
              </article>
            </div>
          ) : (
            <p className="helper-copy">This project is not currently linked to a contract folder.</p>
          )}
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
                  <span>Due: {formatDate(task.dueDate)}</span>
                  <span>Developer: {seedDevelopers.find((item) => item.id === task.developerId)?.name ?? "Assign later"}</span>
                  <span>Notify: {task.notificationPreference}</span>
                  <span>Source: {task.source}</span>
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
            <h3>Assignment Roster</h3>
            <Mail size={18} />
          </header>
          <div className="notes-stack" role="list">
            {projectDevelopers.map((developer) => (
              <article key={developer.id} className="note-item" role="listitem">
                <p className="project-id">{developer.role}</p>
                <h3>{developer.name}</h3>
                <p className="project-meta">{developer.focus}</p>
                <p className="helper-copy">
                  {developer.email} · {developer.slackHandle}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section>
        <article className="panel">
          <header className="panel-header">
            <h3>Project Notes</h3>
            <ListTodo size={18} />
          </header>
          <div className="notes-stack" role="list">
            {detail.notes.map((note) => (
              <article key={note.id} className="note-item" role="listitem">
                <p className="project-id">Updated {note.updatedAt}</p>
                <h3>{note.title}</h3>
                <p className="project-meta">{note.body}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
