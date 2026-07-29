"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  FolderTree,
  Handshake,
  ListTodo,
  Mail,
  Slack,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import MyVillageLogo from "@/components/myvillage-logo";
import {
  seedContracts,
  seedDevelopers,
  seedProjects,
  seedTasks,
  workflowInbox,
  type Contract,
  type ContractStatus,
  type Developer,
  type NotificationChannel,
  type Project,
  type ProjectStatus,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type WorkflowSource
} from "@/lib/demo-data";
import type { IngestionResponseBody } from "@/lib/ingestion";

type TaskSummary = {
  label: string;
  count: number;
  color: string;
};

const DEFAULT_WORKFLOW_TEXT = `Meeting wrap-up from Ms. Valerie\n- finalize dashboard QA pass before next demo\n- draft client release notes and share for review\n- confirm API retry thresholds with backend team`;

function getActionItemPreview(rawText: string) {
  return rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^([-*•]|\d+[.)])\s+/.test(line))
    .map((line) => line.replace(/^([-*•]|\d+[.)])\s+/, ""));
}

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

function notificationLabel(channel: NotificationChannel) {
  if (channel === "Email") {
    return "Email alert";
  }

  if (channel === "Slack") {
    return "Slack alert";
  }

  return "No alert";
}

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: ReactNode;
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

function PieChart({ segments }: { segments: TaskSummary[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const slices = segments
    .filter((segment) => segment.count > 0)
    .map((segment, index, list) => {
      const start = list.slice(0, index).reduce((sum, item) => sum + item.count, 0);
      const startPct = total ? (start / total) * 100 : 0;
      const endPct = total ? ((start + segment.count) / total) * 100 : 0;
      return `${segment.color} ${startPct}% ${endPct}%`;
    });

  return (
    <div className="analytics-chart-wrap">
      <div className="pie-chart" style={{ background: `conic-gradient(${slices.join(", ")})` }} aria-hidden="true" />
      <div className="pie-chart-center">
        <strong>{total}</strong>
        <span>Tasks</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [developers, setDevelopers] = useState<Developer[]>(seedDevelopers);
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [contracts, setContracts] = useState<Contract[]>(seedContracts);
  const [tasks, setTasks] = useState<Task[]>(seedTasks);
  const [workflowSources] = useState<WorkflowSource[]>(workflowInbox);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowSource[]>([]);
  const [contractDrafts, setContractDrafts] = useState<Record<string, string>>({});
  const [selectedContractId, setSelectedContractId] = useState(seedContracts[0]?.id ?? "");
  const [workflowMessage, setWorkflowMessage] = useState("");

  const [workflowForm, setWorkflowForm] = useState({
    sourceType: "Meeting Email" as WorkflowSource["sourceType"],
    notificationPreference: "Email" as NotificationChannel,
    sourceId: "",
    rawText: DEFAULT_WORKFLOW_TEXT
  });

  const [projectForm, setProjectForm] = useState({
    contractId: seedContracts[0]?.id ?? "",
    name: "",
    client: "",
    status: "On Track" as ProjectStatus,
    ownerDeveloperId: "",
    summary: ""
  });

  const [taskForm, setTaskForm] = useState({
    contractId: seedContracts[0]?.id ?? "",
    projectId: seedProjects[0]?.id ?? "",
    title: "",
    summary: "",
    status: "Todo" as TaskStatus,
    priority: "Medium" as TaskPriority,
    dueDate: "",
    developerId: "",
    notificationPreference: "Email" as NotificationChannel
  });

  const [contractForm, setContractForm] = useState({
    organization: "",
    name: "",
    client: "",
    value: 0,
    status: "Draft" as ContractStatus,
    ownerDeveloperId: "",
    workflowMode: "Email First" as Contract["workflowMode"],
    startDate: "",
    renewalDate: "",
    workflowNotes: ""
  });

  const [developerForm, setDeveloperForm] = useState({
    name: "",
    role: "",
    focus: "",
    capacity: 70
  });

  const developerLookup = useMemo(() => new Map(developers.map((developer) => [developer.id, developer])), [developers]);
  const contractLookup = useMemo(() => new Map(contracts.map((contract) => [contract.id, contract])), [contracts]);
  const projectLookup = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);

  const contractFolders = useMemo(() => {
    return contracts.map((contract) => {
      const linkedProjects = projects.filter((project) => project.contractId === contract.id);
      const linkedTasks = tasks.filter((task) => task.contractId === contract.id);
      const linkedDeveloperIds = new Set<string>([
        contract.ownerDeveloperId,
        ...linkedProjects.map((project) => project.ownerDeveloperId),
        ...linkedTasks
          .map((task) => task.developerId)
          .filter((developerId): developerId is string => Boolean(developerId))
      ]);

      return {
        contract,
        projects: linkedProjects,
        tasks: linkedTasks,
        developers: Array.from(linkedDeveloperIds)
          .map((developerId) => developerLookup.get(developerId))
          .filter((developer): developer is Developer => Boolean(developer)),
        openTasks: linkedTasks.filter((task) => task.status !== "Done").length,
        unassignedTasks: linkedTasks.filter((task) => !task.developerId).length
      };
    });
  }, [contracts, projects, tasks, developerLookup]);

  const selectedFolder =
    contractFolders.find((folder) => folder.contract.id === selectedContractId) ?? contractFolders[0] ?? null;

  const selectedWorkflow = useMemo(
    () => [...workflowRuns, ...workflowSources].filter((item) => item.contractId === selectedFolder?.contract.id),
    [selectedFolder, workflowSources, workflowRuns]
  );

  const workflowPreviewItems = useMemo(
    () => getActionItemPreview(workflowForm.rawText).slice(0, 5),
    [workflowForm.rawText]
  );

  const selectedProjectOptions = useMemo(
    () => projects.filter((project) => project.contractId === taskForm.contractId),
    [projects, taskForm.contractId]
  );

  const projectOverview = useMemo(() => {
    return projects.map((project) => {
      const projectTasks = tasks.filter((task) => task.projectId === project.id);
      const doneTasks = projectTasks.filter((task) => task.status === "Done").length;
      const progressPct = projectTasks.length ? Math.round((doneTasks / projectTasks.length) * 100) : 0;

      return {
        project,
        tasks: projectTasks,
        progressPct,
        contract: contractLookup.get(project.contractId),
        openTasks: projectTasks.filter((task) => task.status !== "Done").length
      };
    });
  }, [projects, tasks, contractLookup]);

  const taskDoneCount = tasks.filter((task) => task.status === "Done").length;
  const openTaskCount = tasks.length - taskDoneCount;
  const unassignedTaskCount = tasks.filter((task) => !task.developerId).length;
  const taskStatusSegments: TaskSummary[] = [
    { label: "Todo", count: tasks.filter((task) => task.status === "Todo").length, color: "#b07c00" },
    { label: "In Progress", count: tasks.filter((task) => task.status === "In Progress").length, color: "#4f392a" },
    { label: "Blocked", count: tasks.filter((task) => task.status === "Blocked").length, color: "#8a6200" },
    { label: "Done", count: tasks.filter((task) => task.status === "Done").length, color: "#1f5b3d" }
  ];

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

    const workflowActivity = workflowSources.map((item) => ({
      id: item.id,
      type: item.sourceType,
      title: item.title,
      details: item.action,
      createdAt: item.lastProcessedAt
    }));

    const workflowRunActivity = workflowRuns.map((item) => ({
      id: item.id,
      type: `${item.sourceType} Run`,
      title: item.title,
      details: item.action,
      createdAt: item.lastProcessedAt
    }));

    return [...contractActivity, ...workflowActivity, ...workflowRunActivity].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [contracts, workflowSources, workflowRuns]);

  const handleDeveloperAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!developerForm.name || !developerForm.role) {
      return;
    }

    const nextId = `DEV-${Date.now()}`;
    const safeName = developerForm.name.toLowerCase().replace(/\s+/g, ".");

    setDevelopers((current) => [
      {
        id: nextId,
        name: developerForm.name,
        role: developerForm.role,
        focus: developerForm.focus || "General",
        capacity: Number(developerForm.capacity),
        email: `${safeName}@myvillage.app`,
        slackHandle: `@${safeName.replace(/\./g, "")}`
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

  const handleProjectAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!projectForm.name || !projectForm.client || !projectForm.ownerDeveloperId || !projectForm.contractId) {
      return;
    }

    const nextId = `PRJ-${Date.now()}`;
    setProjects((current) => [
      {
        id: nextId,
        contractId: projectForm.contractId,
        name: projectForm.name,
        client: projectForm.client,
        status: projectForm.status,
        ownerDeveloperId: projectForm.ownerDeveloperId,
        summary: projectForm.summary || "No summary provided."
      },
      ...current
    ]);

    setProjectForm({
      contractId: selectedFolder?.contract.id ?? contracts[0]?.id ?? "",
      name: "",
      client: "",
      status: "On Track",
      ownerDeveloperId: "",
      summary: ""
    });
  };

  const handleContractAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!contractForm.name || !contractForm.client || !contractForm.ownerDeveloperId || !contractForm.organization) {
      return;
    }

    const nextId = `CTR-${Date.now()}`;
    setContracts((current) => [
      {
        id: nextId,
        organization: contractForm.organization,
        name: contractForm.name,
        client: contractForm.client,
        value: Number(contractForm.value),
        status: contractForm.status,
        ownerDeveloperId: contractForm.ownerDeveloperId,
        startDate: contractForm.startDate || new Date().toISOString().slice(0, 10),
        renewalDate: contractForm.renewalDate || new Date().toISOString().slice(0, 10),
        workflowMode: contractForm.workflowMode,
        workflowNotes: contractForm.workflowNotes || "Review email recap before routing assignments.",
        progress: []
      },
      ...current
    ]);

    setSelectedContractId(nextId);
    setContractForm({
      organization: "",
      name: "",
      client: "",
      value: 0,
      status: "Draft",
      ownerDeveloperId: "",
      workflowMode: "Email First",
      startDate: "",
      renewalDate: "",
      workflowNotes: ""
    });
  };

  const handleTaskAdd = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!taskForm.title || !taskForm.projectId || !taskForm.contractId) {
      return;
    }

    setTasks((current) => [
      {
        id: `TASK-${Date.now()}`,
        contractId: taskForm.contractId,
        projectId: taskForm.projectId,
        title: taskForm.title,
        summary: taskForm.summary || "No summary provided.",
        status: taskForm.status,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || new Date().toISOString().slice(0, 10),
        developerId: taskForm.developerId || null,
        notificationPreference: taskForm.notificationPreference,
        source: "Manual",
        awaitingAssignment: !taskForm.developerId
      },
      ...current
    ]);

    const nextProjectId = projects.find((project) => project.contractId === taskForm.contractId)?.id ?? "";
    setTaskForm({
      contractId: selectedFolder?.contract.id ?? contracts[0]?.id ?? "",
      projectId: nextProjectId,
      title: "",
      summary: "",
      status: "Todo",
      priority: "Medium",
      dueDate: "",
      developerId: "",
      notificationPreference: "Email"
    });
  };

  const handleTaskAssignment = (taskId: string, developerId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              developerId: developerId || null,
              awaitingAssignment: !developerId
            }
          : task
      )
    );
  };

  const handleTaskNotification = (taskId: string, notificationPreference: NotificationChannel) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              notificationPreference
            }
          : task
      )
    );
  };

  const handleContractProgressAdd = (event: FormEvent<HTMLFormElement>, contractId: string) => {
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

  const handleWorkflowRun = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFolder) {
      return;
    }

    if (!workflowForm.rawText.trim()) {
      setWorkflowMessage("Paste meeting notes or transcript content before running the workflow.");
      return;
    }

    setWorkflowMessage("Running ingestion workflow...");

    const endpoint =
      workflowForm.sourceType === "Meeting Email"
        ? "/api/ingestion/meeting-notes"
        : "/api/ingestion/transcripts";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          organization: selectedFolder.contract.organization,
          contractId: selectedFolder.contract.id,
          content: workflowForm.rawText,
          sourceId: workflowForm.sourceId || undefined,
          notificationPreference: workflowForm.notificationPreference
        })
      });

      const payload = (await response.json()) as IngestionResponseBody | { error?: string; existingRunId?: string };

      if (!response.ok) {
        const duplicateMessage =
          response.status === 409 && "existingRunId" in payload && payload.existingRunId
            ? ` Duplicate run: ${payload.existingRunId}.`
            : "";
        setWorkflowMessage(`${"error" in payload && payload.error ? payload.error : "Workflow failed."}${duplicateMessage}`);
        return;
      }

      let projectId = selectedFolder.projects[0]?.id ?? "";
      if (!projectId) {
        projectId = `PRJ-${Date.now()}`;
        setProjects((current) => [
          {
            id: projectId,
            contractId: selectedFolder.contract.id,
            name: `${selectedFolder.contract.organization} Delivery Queue`,
            client: selectedFolder.contract.client,
            status: "On Track",
            ownerDeveloperId: selectedFolder.contract.ownerDeveloperId,
            summary: "Auto-generated project for ingestion-created tasks."
          },
          ...current
        ]);
      }

      const typedPayload = payload as IngestionResponseBody;
      const generatedTasks: Task[] = typedPayload.taskDrafts.map((draft, index) => ({
        id: `TASK-${Date.now()}-${index}`,
        contractId: selectedFolder.contract.id,
        projectId,
        title: draft.title,
        summary: draft.summary,
        status: "Todo",
        priority: draft.priority,
        dueDate: draft.dueDate,
        developerId: null,
        notificationPreference: draft.notificationPreference,
        source: typedPayload.sourceType,
        awaitingAssignment: true
      }));

      setTasks((current) => [...generatedTasks, ...current]);
      setContracts((current) =>
        current.map((contract) =>
          contract.id === selectedFolder.contract.id
            ? {
                ...contract,
                status: typedPayload.statusSuggestion,
                progress: [
                  {
                    id: `p-${Date.now()}`,
                    note: `Workflow ingested ${generatedTasks.length} task${generatedTasks.length === 1 ? "" : "s"} from ${typedPayload.sourceType}.`,
                    createdAt: typedPayload.generatedAt,
                    author: "Workflow Bot"
                  },
                  ...contract.progress
                ]
              }
            : contract
        )
      );

      setWorkflowRuns((current) => [
        {
          id: typedPayload.runId,
          contractId: selectedFolder.contract.id,
          sourceType: typedPayload.sourceType,
          title: `${typedPayload.sourceType} import`,
          summary: `Created ${generatedTasks.length} draft task${generatedTasks.length === 1 ? "" : "s"} for assignment.`,
          reliability: typedPayload.sourceType === "Meeting Email" ? "Primary" : "Fallback",
          lastProcessedAt: typedPayload.generatedAt,
          action: `Generated ${generatedTasks.length} unassigned tasks with ${workflowForm.notificationPreference.toLowerCase()} notifications.`
        },
        ...current
      ]);

      const warnings = typedPayload.warnings.length ? ` Warnings: ${typedPayload.warnings.join(" ")}` : "";
      setWorkflowMessage(
        `Workflow complete: ${generatedTasks.length} task${generatedTasks.length === 1 ? "" : "s"} created for ${typedPayload.organization}.${warnings}`
      );
      setWorkflowForm((current) => ({
        ...current,
        sourceId: "",
        rawText: ""
      }));
    } catch {
      setWorkflowMessage("Workflow request failed. Check your network and try again.");
    }
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
              <MyVillageLogo size={50} />
            </div>
            <div>
              <p className="eyebrow">MyVillage Project</p>
              <h1>Contract Workspace</h1>
            </div>
          </div>
          <p className="hero-copy">
            Contracts are the top-level folder. Each workspace rolls up projects, tasks, developers, and an email-first automation path for post-meeting follow-through.
          </p>
        </motion.div>
      </section>

      <section className="metrics-grid metrics-grid-four motion-section delay-1">
        <MetricCard icon={<Handshake size={20} />} label="Contracts" value={String(contracts.length)} tone="sun" />
        <MetricCard icon={<BriefcaseBusiness size={20} />} label="Projects" value={String(projects.length)} tone="flare" />
        <MetricCard icon={<ListTodo size={20} />} label="Open Tasks" value={String(openTaskCount)} tone="forest" />
        <MetricCard icon={<UsersRound size={20} />} label="Unassigned Tasks" value={String(unassignedTaskCount)} tone="earth" />
      </section>

      <section className="workspace-layout motion-section delay-2">
        <aside className="panel project-sidebar">
          <header className="panel-header">
            <h3>Contract Folders</h3>
            <FolderTree size={18} />
          </header>

          <div className="sidebar-project-list">
            {contractFolders.map((folder) => (
              <article key={folder.contract.id} className="sidebar-project-item">
                <button
                  type="button"
                  className={`sidebar-project-toggle${selectedFolder?.contract.id === folder.contract.id ? " is-active" : ""}`}
                  onClick={() => {
                    setSelectedContractId(folder.contract.id);
                    setProjectForm((current) => ({ ...current, contractId: folder.contract.id }));
                    setTaskForm((current) => ({
                      ...current,
                      contractId: folder.contract.id,
                      projectId: projects.find((project) => project.contractId === folder.contract.id)?.id ?? ""
                    }));
                  }}
                >
                  <div>
                    <p className="project-id">{folder.contract.id}</p>
                    <h4>{folder.contract.organization}</h4>
                    <p className="project-meta">{folder.contract.name}</p>
                  </div>
                  <span className={statusChipClass(folder.contract.status)}>{folder.contract.status}</span>
                </button>
                <div className="sidebar-project-details">
                  <p>
                    <strong>Owner:</strong> {developerLookup.get(folder.contract.ownerDeveloperId)?.name ?? "Unknown"}
                  </p>
                  <p>
                    <strong>Projects:</strong> {folder.projects.length}
                  </p>
                  <p>
                    <strong>Tasks:</strong> {folder.tasks.length} ({folder.unassignedTasks} unassigned)
                  </p>
                  <ul>
                    {folder.projects.slice(0, 3).map((project) => (
                      <li key={project.id}>{project.name}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="workspace-main">
          {selectedFolder ? (
            <article className="panel folder-panel">
              <header className="panel-header">
                <div>
                  <h3>{selectedFolder.contract.organization}</h3>
                  <p className="panel-subtitle">{selectedFolder.contract.name}</p>
                </div>
                <span className={statusChipClass(selectedFolder.contract.status)}>{selectedFolder.contract.status}</span>
              </header>
              <div className="task-meta-grid folder-meta-grid">
                <span>Client: {selectedFolder.contract.client}</span>
                <span>Value: {formatCurrency(selectedFolder.contract.value)}</span>
                <span>Owner: {developerLookup.get(selectedFolder.contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                <span>Renewal: {formatDate(selectedFolder.contract.renewalDate)}</span>
                <span>Workflow: {selectedFolder.contract.workflowMode}</span>
                <span>Developers in folder: {selectedFolder.developers.length}</span>
              </div>
              <p className="automation-note">{selectedFolder.contract.workflowNotes}</p>
            </article>
          ) : null}

          <article className="panel analytics-panel">
            <header className="panel-header">
              <h3>Task Analytics</h3>
              <FileText size={18} />
            </header>
            <div className="analytics-grid">
              <PieChart segments={taskStatusSegments} />
              <div className="analytics-legend">
                {taskStatusSegments.map((segment) => (
                  <div key={segment.label} className="analytics-legend-item">
                    <span className="analytics-swatch" style={{ background: segment.color }} aria-hidden="true" />
                    <div>
                      <strong>{segment.label}</strong>
                      <p>{segment.count} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <div className="uniform-two-col">
            <article className="panel">
              <header className="panel-header">
                <h3>Automation Intake</h3>
                <Sparkles size={18} />
              </header>
              <p className="helper-copy">
                Use the meeting email as the primary source of truth. Let transcripts enrich the task description only when they include the full close-out.
              </p>
              <form className="entry-form workflow-form" onSubmit={handleWorkflowRun}>
                <div className="field-row two-col">
                  <label>
                    Source Message ID (optional)
                    <input
                      value={workflowForm.sourceId}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          sourceId: event.target.value
                        }))
                      }
                      placeholder="email-message-id or transcript-id"
                    />
                  </label>
                  <label>
                    Source
                    <select
                      value={workflowForm.sourceType}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          sourceType: event.target.value as WorkflowSource["sourceType"]
                        }))
                      }
                    >
                      <option value="Meeting Email">Meeting Email</option>
                      <option value="Otter Transcript">Otter Transcript</option>
                    </select>
                  </label>
                </div>
                <div className="field-row two-col">
                  <label>
                    Organization
                    <input value={selectedFolder?.contract.organization ?? ""} readOnly />
                  </label>
                  <label>
                    Notify New Assignees Via
                    <select
                      value={workflowForm.notificationPreference}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          notificationPreference: event.target.value as NotificationChannel
                        }))
                      }
                    >
                      <option value="None">No alert</option>
                      <option value="Email">Email</option>
                      <option value="Slack">Slack</option>
                    </select>
                  </label>
                </div>
                <div className="field-row">
                  <label>
                    Meeting Notes / Email Body
                    <textarea
                      rows={6}
                      value={workflowForm.rawText}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          rawText: event.target.value
                        }))
                      }
                      placeholder="Paste email or transcript with bullet-point action items"
                    />
                  </label>
                </div>
                <button type="submit">Run Workflow</button>
              </form>
              {workflowMessage ? <p className="workflow-message">{workflowMessage}</p> : null}
              <div className="workflow-preview">
                <p className="project-id">Detected Action Items ({workflowPreviewItems.length})</p>
                <ul>
                  {workflowPreviewItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="activity-feed" role="list">
                {selectedWorkflow.map((item) => (
                  <article key={item.id} className="activity-item" role="listitem">
                    <div className="activity-top">
                      <div>
                        <p className="project-id">{item.sourceType}</p>
                        <h3>{item.title}</h3>
                      </div>
                      <span className={item.reliability === "Primary" ? "status-chip status-on-track" : "status-chip status-at-risk"}>
                        {item.reliability}
                      </span>
                    </div>
                    <p className="activity-details">{item.summary}</p>
                    <p className="helper-copy">{item.action}</p>
                  </article>
                ))}
              </div>
            </article>

            <article className="panel">
              <header className="panel-header">
                <h3>Folder Team</h3>
                <UsersRound size={18} />
              </header>
              <div className="developer-grid" role="list">
                {selectedFolder?.developers.map((developer) => (
                  <article key={developer.id} className="task-item" role="listitem">
                    <div className="contract-top">
                      <div>
                        <p className="project-id">{developer.id}</p>
                        <h3>{developer.name}</h3>
                        <p className="project-meta">{developer.role}</p>
                      </div>
                      <span className="status-chip status-on-track">{developer.capacity}% capacity</span>
                    </div>
                    <div className="task-meta-grid">
                      <span>Focus: {developer.focus}</span>
                      <span>Email: {developer.email}</span>
                      <span>Slack: {developer.slackHandle}</span>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>

          <article className="panel">
            <header className="panel-header">
              <h3>Projects In This Workspace</h3>
              <CheckCircle2 size={18} />
            </header>
            <div className="project-overview-grid" role="list">
              {projectOverview
                .filter(({ project }) => project.contractId === selectedFolder?.contract.id)
                .map(({ project, tasks: projectTasks, progressPct, contract, openTasks }) => (
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
                      <span>{contract?.organization ?? "Contract"}</span>
                      <strong>{progressPct}%</strong>
                    </div>
                    <ProgressBar value={progressPct} />
                    <div className="task-meta-grid">
                      <span>Total tasks: {projectTasks.length}</span>
                      <span>Open tasks: {openTasks}</span>
                    </div>
                  </article>
                ))}
            </div>
          </article>

          <div className="uniform-two-col">
            <article className="panel">
              <header className="panel-header">
                <h3>Contract Tasks</h3>
                <ListTodo size={18} />
              </header>
              <div className="task-list" role="list">
                {tasks
                  .filter((task) => task.contractId === selectedFolder?.contract.id)
                  .map((task) => (
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
                        <span>Due: {formatDate(task.dueDate)}</span>
                        <span>Project: {projectLookup.get(task.projectId)?.name ?? "Unknown"}</span>
                        <span>Source: {task.source}</span>
                        <span>Assignee: {developerLookup.get(task.developerId ?? "")?.name ?? "Assign later"}</span>
                      </div>
                      <div className="task-controls">
                        <label>
                          Developer
                          <select
                            value={task.developerId ?? ""}
                            onChange={(event) => handleTaskAssignment(task.id, event.target.value)}
                          >
                            <option value="">Assign later</option>
                            {selectedFolder?.developers.map((developer) => (
                              <option key={developer.id} value={developer.id}>
                                {developer.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Notify via
                          <select
                            value={task.notificationPreference}
                            onChange={(event) =>
                              handleTaskNotification(task.id, event.target.value as NotificationChannel)
                            }
                          >
                            <option value="None">No alert</option>
                            <option value="Email">Email</option>
                            <option value="Slack">Slack</option>
                          </select>
                        </label>
                      </div>
                      <div className="tag-row">
                        <span className={`status-chip ${task.awaitingAssignment ? "status-at-risk" : "status-on-track"}`}>
                          {task.awaitingAssignment ? "Awaiting assignment" : "Assigned"}
                        </span>
                        <span className="status-chip contract-pending">{notificationLabel(task.notificationPreference)}</span>
                      </div>
                    </article>
                  ))}
              </div>
            </article>

            <article className="panel">
              <header className="panel-header">
                <h3>Contract Activity</h3>
                <FileText size={18} />
              </header>
              <div className="contract-stack" role="list">
                {contracts
                  .filter((contract) => contract.id === selectedFolder?.contract.id)
                  .map((contract) => (
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
                        <span>Owner: {developerLookup.get(contract.ownerDeveloperId)?.name ?? "Unknown"}</span>
                        <span>Start: {formatDate(contract.startDate)}</span>
                        <span>Renewal: {formatDate(contract.renewalDate)}</span>
                      </div>
                      <form className="inline-form" onSubmit={(event) => handleContractProgressAdd(event, contract.id)}>
                        <input
                          value={contractDrafts[contract.id] ?? ""}
                          onChange={(event) =>
                            setContractDrafts((current) => ({ ...current, [contract.id]: event.target.value }))
                          }
                          placeholder="Add timestamped progress update"
                        />
                        <button type="submit">Log</button>
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
                Contract Folder
                <select
                  value={projectForm.contractId}
                  onChange={(event) =>
                    setProjectForm((current) => ({ ...current, contractId: event.target.value }))
                  }
                >
                  <option value="">Select contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.organization}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Project Name
                <input
                  value={projectForm.name}
                  onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row two-col">
              <label>
                Client
                <input
                  value={projectForm.client}
                  onChange={(event) => setProjectForm((current) => ({ ...current, client: event.target.value }))}
                />
              </label>
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
            </div>
            <div className="field-row two-col">
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
            <h3>Add Contract</h3>
            <Handshake size={18} />
          </header>
          <form className="entry-form" onSubmit={handleContractAdd}>
            <div className="field-row two-col">
              <label>
                Organization
                <input
                  value={contractForm.organization}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, organization: event.target.value }))
                  }
                />
              </label>
              <label>
                Contract Name
                <input
                  value={contractForm.name}
                  onChange={(event) => setContractForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row two-col">
              <label>
                Client
                <input
                  value={contractForm.client}
                  onChange={(event) => setContractForm((current) => ({ ...current, client: event.target.value }))}
                />
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
                    setContractForm((current) => ({ ...current, status: event.target.value as ContractStatus }))
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Closed">Closed</option>
                </select>
              </label>
              <label>
                Workflow
                <select
                  value={contractForm.workflowMode}
                  onChange={(event) =>
                    setContractForm((current) => ({
                      ...current,
                      workflowMode: event.target.value as Contract["workflowMode"]
                    }))
                  }
                >
                  <option value="Email First">Email First</option>
                  <option value="Transcript Assisted">Transcript Assisted</option>
                </select>
              </label>
            </div>
            <div className="field-row">
              <label>
                Workflow Notes
                <textarea
                  rows={3}
                  value={contractForm.workflowNotes}
                  onChange={(event) =>
                    setContractForm((current) => ({ ...current, workflowNotes: event.target.value }))
                  }
                />
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

        <article className="panel">
          <header className="panel-header">
            <h3>Add Task</h3>
            <ListTodo size={18} />
          </header>
          <form className="entry-form" onSubmit={handleTaskAdd}>
            <div className="field-row two-col">
              <label>
                Contract Folder
                <select
                  value={taskForm.contractId}
                  onChange={(event) => {
                    const nextContractId = event.target.value;
                    const nextProjectId = projects.find((project) => project.contractId === nextContractId)?.id ?? "";
                    setTaskForm((current) => ({
                      ...current,
                      contractId: nextContractId,
                      projectId: nextProjectId
                    }));
                  }}
                >
                  <option value="">Select contract</option>
                  {contracts.map((contract) => (
                    <option key={contract.id} value={contract.id}>
                      {contract.organization}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Project
                <select
                  value={taskForm.projectId}
                  onChange={(event) => setTaskForm((current) => ({ ...current, projectId: event.target.value }))}
                >
                  <option value="">Select project</option>
                  {selectedProjectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
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
              <label>
                Developer
                <select
                  value={taskForm.developerId}
                  onChange={(event) =>
                    setTaskForm((current) => ({ ...current, developerId: event.target.value }))
                  }
                >
                  <option value="">Assign later</option>
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
                Notify via
                <select
                  value={taskForm.notificationPreference}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      notificationPreference: event.target.value as NotificationChannel
                    }))
                  }
                >
                  <option value="None">No alert</option>
                  <option value="Email">Email</option>
                  <option value="Slack">Slack</option>
                </select>
              </label>
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
      </section>

      <section className="uniform-two-col motion-section delay-5">
        <article className="panel">
          <header className="panel-header">
            <h3>Notification Rules</h3>
            <Mail size={18} />
          </header>
          <p className="helper-copy">
            Leave new tasks unassigned when needed. Once a developer is selected, the preferred channel can be email or Slack.
          </p>
          <div className="tag-row">
            <span className="status-chip contract-pending">Email for formal handoff</span>
            <span className="status-chip status-on-track">Slack for immediate routing</span>
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Recent Activity</h3>
            <Slack size={18} />
          </header>
          <div className="activity-feed" role="list">
            {activityFeed.slice(0, 4).map((item) => (
              <article key={item.id} className="activity-item" role="listitem">
                <div className="activity-top">
                  <p className="project-id">{item.type}</p>
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="activity-title">{item.title}</p>
                <p className="activity-details">{item.details}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
