"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardPen,
  Handshake,
  ListTodo,
  MessagesSquare,
  Plus
} from "lucide-react";

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "Done";
type TaskPriority = "Low" | "Medium" | "High";

type DemoTask = {
  id: "TASK-001",
  title: string;
  project: string;
  owner: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  summary: string;
  checklist: ChecklistItem[];
};

type ProgressEntry = {
  id: string;
  note: string;
  createdAt: string;
};

type Contract = {
  id: string;
  title: string;
  owner: string;
  status: "Active" | "Pending" | "Review";
  progress: ProgressEntry[];
};

type MeetingNote = {
  id: string;
  title: string;
  meetingDate: string;
  attendees: string;
  notes: string;
  createdAt: string;
};

const initialTask: DemoTask = {
  id: "TASK-001",
  title: "Launch Client Status Dashboard MVP",
  project: "MyVillage Client Experience",
  owner: "Ari M.",
  status: "In Progress",
  priority: "High",
  dueDate: "2026-07-24",
  summary:
    "Finalize one clear dashboard flow for client demos: overview metrics, one featured task, and straightforward next steps.",
  checklist: [
    { id: "c1", label: "Finalize single-page information architecture", done: true },
    { id: "c2", label: "Lock brand colors and typography", done: true },
    { id: "c3", label: "Confirm deploy settings on Vercel", done: false },
    { id: "c4", label: "Walk through demo with stakeholders", done: false }
  ]
};

const initialContracts: Contract[] = [
  {
    id: "CTR-001",
    title: "Northwind Labs Service Agreement",
    owner: "Ari M.",
    status: "Active",
    progress: [
      {
        id: "p1",
        note: "Kickoff completed and statement of work approved.",
        createdAt: "2026-07-10T10:00:00.000Z"
      }
    ]
  },
  {
    id: "CTR-002",
    title: "Harvest Grid Extension",
    owner: "Liam K.",
    status: "Review",
    progress: [
      {
        id: "p2",
        note: "Legal review comments received from client counsel.",
        createdAt: "2026-07-12T15:30:00.000Z"
      }
    ]
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

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-shell" aria-label={`Progress ${value}%`}>
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
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
  const [task, setTask] = useState<DemoTask>(initialTask);
  const [checklistDraft, setChecklistDraft] = useState("");
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [contractDrafts, setContractDrafts] = useState<Record<string, string>>({});
  const [meetingNotes, setMeetingNotes] = useState<MeetingNote[]>(initialMeetings);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    meetingDate: "",
    attendees: "",
    notes: ""
  });

  const completedCount = task.checklist.filter((item) => item.done).length;
  const completionPct = task.checklist.length
    ? Math.round((completedCount / task.checklist.length) * 100)
    : 0;

  const activityFeed = useMemo(() => {
    const contractActivity = contracts.flatMap((contract) =>
      contract.progress.map((entry) => ({
        id: `${contract.id}-${entry.id}`,
        type: "Contract Update",
        title: contract.title,
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

  const handleChecklistToggle = (itemId: string) => {
    setTask((current) => ({
      ...current,
      checklist: current.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      )
    }));
  };

  const handleChecklistAdd = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = checklistDraft.trim();
    if (!trimmed) {
      return;
    }

    setTask((current) => ({
      ...current,
      checklist: [
        ...current.checklist,
        { id: `c-${Date.now()}`, label: trimmed, done: false }
      ]
    }));
    setChecklistDraft("");
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
                  createdAt: timestamp
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
          label="Checklist Complete"
          value={`${completionPct}%`}
          tone="forest"
        />
        <MetricCard icon={<Handshake size={20} />} label="Contracts" value={String(contracts.length)} tone="flare" />
        <MetricCard
          icon={<MessagesSquare size={20} />}
          label="Meeting Notes"
          value={String(meetingNotes.length)}
          tone="earth"
        />
      </section>

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Editable Demo Task</h3>
            <span className="status-chip status-at-risk">{task.status}</span>
          </header>

          <form className="entry-form" onSubmit={(event) => event.preventDefault()}>
            <div className="field-row two-col">
              <label>
                Task Title
                <input
                  value={task.title}
                  onChange={(event) => setTask((current) => ({ ...current, title: event.target.value }))}
                />
              </label>
              <label>
                Owner
                <input
                  value={task.owner}
                  onChange={(event) => setTask((current) => ({ ...current, owner: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row three-col">
              <label>
                Status
                <select
                  value={task.status}
                  onChange={(event) =>
                    setTask((current) => ({ ...current, status: event.target.value as TaskStatus }))
                  }
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </label>
              <label>
                Priority
                <select
                  value={task.priority}
                  onChange={(event) =>
                    setTask((current) => ({ ...current, priority: event.target.value as TaskPriority }))
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>
                Due Date
                <input
                  type="date"
                  value={task.dueDate}
                  onChange={(event) => setTask((current) => ({ ...current, dueDate: event.target.value }))}
                />
              </label>
            </div>
            <div className="field-row">
              <label>
                Summary
                <textarea
                  rows={3}
                  value={task.summary}
                  onChange={(event) => setTask((current) => ({ ...current, summary: event.target.value }))}
                />
              </label>
            </div>
          </form>

          <div className="progress-row">
            <span>Completion</span>
            <strong>{completionPct}%</strong>
          </div>
          <ProgressBar value={completionPct} />

          <div className="task-checklist">
            <h3>Checklist</h3>
            <ul>
              {task.checklist.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`check-toggle ${item.done ? "check-done" : "check-open"}`}
                    onClick={() => handleChecklistToggle(item.id)}
                  >
                    {item.done ? "Done" : "Open"}
                  </button>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <form className="inline-form" onSubmit={handleChecklistAdd}>
              <input
                value={checklistDraft}
                onChange={(event) => setChecklistDraft(event.target.value)}
                placeholder="Add checklist item"
              />
              <button type="submit">
                <Plus size={14} />
                Add
              </button>
            </form>
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Centralized Activity Feed</h3>
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

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Contract Progress Log</h3>
            <Handshake size={18} />
          </header>
          <div className="contract-stack">
            {contracts.map((contract) => (
              <article key={contract.id} className="contract-item">
                <div className="contract-top">
                  <div>
                    <p className="project-id">{contract.id}</p>
                    <p>
                      <strong>{contract.title}</strong>
                    </p>
                    <p className="project-meta">Owner: {contract.owner}</p>
                  </div>
                  <span className="status-chip status-on-track">{contract.status}</span>
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
                      <span>{formatDateTime(entry.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </article>

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
                  <span>{meeting.meetingDate}</span>
                </div>
                <p className="project-meta">Attendees: {meeting.attendees}</p>
                <p className="activity-details">{meeting.notes}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
