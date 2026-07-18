"use client";

import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, Flag, ListTodo } from "lucide-react";

type ChecklistItem = {
  label: string;
  done: boolean;
};

const demoTask = {
  id: "TASK-001",
  title: "Launch Client Status Dashboard MVP",
  project: "MyVillage Client Experience",
  owner: "Ari M.",
  status: "In Progress",
  priority: "High",
  dueDate: "Jul 24, 2026",
  summary:
    "Finalize one clear dashboard flow for client demos: overview metrics, one featured task, and straightforward next steps.",
  checklist: [
    { label: "Finalize single-page information architecture", done: true },
    { label: "Lock brand colors and typography", done: true },
    { label: "Confirm deploy settings on Vercel", done: false },
    { label: "Walk through demo with stakeholders", done: false }
  ] satisfies ChecklistItem[]
};

const completedCount = demoTask.checklist.filter((item) => item.done).length;
const completionPct = Math.round((completedCount / demoTask.checklist.length) * 100);

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
              <h1>Task Tracker Overview</h1>
            </div>
          </div>
          <p className="hero-copy">
            A simplified demo view with one featured task and a clear tracker overview for client reviews.
          </p>
        </motion.div>
      </section>

      <section className="metrics-grid metrics-grid-four">
        <MetricCard icon={<ListTodo size={20} />} label="Total Tasks" value="1" tone="sun" />
        <MetricCard icon={<CheckCircle2 size={20} />} label="Completed" value={String(completedCount)} tone="forest" />
        <MetricCard icon={<Flag size={20} />} label="Priority" value={demoTask.priority} tone="flare" />
        <MetricCard icon={<CalendarClock size={20} />} label="Due Date" value={demoTask.dueDate} tone="earth" />
      </section>

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Demo Task</h3>
            <span className="status-chip status-at-risk">{demoTask.status}</span>
          </header>

          <p className="project-id">{demoTask.id}</p>
          <h2>{demoTask.title}</h2>
          <p className="project-meta">
            {demoTask.project} · Owner: {demoTask.owner}
          </p>

          <p className="sprint-goal">{demoTask.summary}</p>

          <div className="progress-row">
            <span>Completion</span>
            <strong>{completionPct}%</strong>
          </div>
          <ProgressBar value={completionPct} />

          <div className="task-checklist">
            <h3>Checklist</h3>
            <ul>
              {demoTask.checklist.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <span className={`check-pill ${item.done ? "check-done" : "check-open"}`}>
                    {item.done ? "Done" : "Open"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Tracker Overview</h3>
          </header>
          <ul className="overview-list">
            <li>
              <strong>Current Focus:</strong> One demo task is tracked end-to-end.
            </li>
            <li>
              <strong>Cadence:</strong> Daily status check and weekly client summary.
            </li>
            <li>
              <strong>Signals:</strong> Track completion %, due date, and open checklist items.
            </li>
            <li>
              <strong>Next Step:</strong> Complete deployment verification and run client walkthrough.
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
