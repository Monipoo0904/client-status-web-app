"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Blocks,
  Clock3,
  Compass,
  UsersRound
} from "lucide-react";
import { developerWorkstreams, projects, type Priority, type ProjectStatus } from "@/lib/demo-data";

const statusStyles: Record<ProjectStatus, string> = {
  "On Track": "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40",
  "At Risk": "bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/40",
  Blocked: "bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/40"
};

const priorityStyles: Record<Priority, string> = {
  High: "text-rose-300",
  Medium: "text-amber-300",
  Low: "text-sky-300"
};

function MetricCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "sun" | "sea" | "forest" | "flare";
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
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    if (selectedProjectId === "all") {
      return projects;
    }

    return projects.filter((project) => project.id === selectedProjectId);
  }, [selectedProjectId]);

  const visibleProjectNames = new Set(filteredProjects.map((project) => project.name));

  const filteredWorkstreams = developerWorkstreams.filter((item) =>
    visibleProjectNames.has(item.project)
  );

  const onTrack = filteredProjects.filter((project) => project.status === "On Track").length;
  const atRisk = filteredProjects.filter((project) => project.status === "At Risk").length;
  const blocked = filteredProjects.filter((project) => project.status === "Blocked").length;
  const villagerCount = filteredProjects.reduce((sum, project) => sum + project.villagers.length, 0);

  const flattenedNextSteps = filteredProjects
    .flatMap((project) =>
      project.nextSteps.map((step) => ({
        ...step,
        project: project.name
      }))
    )
    .sort((a, b) => (a.priority === b.priority ? 0 : a.priority === "High" ? -1 : 1));

  return (
    <main className="dashboard-shell">
      <section className="hero-panel">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="eyebrow">Client Status Command Center</p>
          <h1>Delivery Dashboard Demo</h1>
          <p className="hero-copy">
            Live-style view of developer project status, assigned villagers, and next steps for client check-ins.
          </p>
          <div className="project-filter-wrap">
            <label htmlFor="project-filter">Filter by project</label>
            <select
              id="project-filter"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              <option value="all">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.id} - {project.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          icon={<Blocks size={20} />}
          label="Active Projects"
          value={String(filteredProjects.length)}
          tone="sun"
        />
        <MetricCard
          icon={<BadgeCheck size={20} />}
          label="On Track"
          value={String(onTrack)}
          tone="forest"
        />
        <MetricCard
          icon={<AlertTriangle size={20} />}
          label="At Risk + Blocked"
          value={String(atRisk + blocked)}
          tone="flare"
        />
        <MetricCard
          icon={<UsersRound size={20} />}
          label="Villagers Assigned"
          value={String(villagerCount)}
          tone="sea"
        />
      </section>

      <section className="projects-grid">
        {filteredProjects.map((project, index) => (
          <motion.article
            key={project.id}
            className="project-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4 }}
          >
            <header className="project-top">
              <div>
                <p className="project-id">{project.id}</p>
                <h2>{project.name}</h2>
                <p className="project-meta">
                  {project.client} · Owner: {project.owner}
                </p>
              </div>
              <span className={`status-chip ${statusStyles[project.status]}`}>{project.status}</span>
            </header>

            <p className="sprint-goal">{project.sprintGoal}</p>

            <div className="progress-row">
              <span>Completion</span>
              <strong>{project.progress}%</strong>
            </div>
            <ProgressBar value={project.progress} />

            <div className="villagers-wrap">
              <h3>Assigned Villagers</h3>
              <ul>
                {project.villagers.map((villager) => (
                  <li key={`${project.id}-${villager.name}`}>
                    <span>
                      {villager.name} · {villager.role}
                    </span>
                    <span>{villager.capacity}% cap</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.article>
        ))}
      </section>

      <section className="lower-grid">
        <article className="panel">
          <header className="panel-header">
            <h3>Developer Workstream Status</h3>
            <Compass size={18} />
          </header>
          <div className="workstream-list" role="list">
            {filteredWorkstreams.map((item) => (
              <div className="workstream-item" key={`${item.developer}-${item.project}`} role="listitem">
                <div className="workstream-top">
                  <p>
                    <strong>{item.developer}</strong> on {item.project}
                  </p>
                  <span className={`status-chip ${statusStyles[item.status as ProjectStatus]}`}>{item.status}</span>
                </div>
                <p className="task-line">{item.currentTask}</p>
                <ProgressBar value={item.completion} />
              </div>
            ))}
            {filteredWorkstreams.length === 0 ? (
              <p className="empty-state">No developer workstreams for this filter.</p>
            ) : null}
          </div>
        </article>

        <article className="panel">
          <header className="panel-header">
            <h3>Next Steps Queue</h3>
            <Clock3 size={18} />
          </header>
          <ul className="next-step-list">
            {flattenedNextSteps.map((step, index) => (
              <li key={`${step.project}-${step.task}-${index}`}>
                <div>
                  <p className="next-step-task">{step.task}</p>
                  <p className="next-step-project">{step.project}</p>
                </div>
                <div className="next-step-meta">
                  <span className={priorityStyles[step.priority]}>{step.priority}</span>
                  <span>{step.due}</span>
                  <ArrowRight size={16} />
                </div>
              </li>
            ))}
            {flattenedNextSteps.length === 0 ? (
              <li className="empty-list-item">
                <p className="empty-state">No next steps for this filter.</p>
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </main>
  );
}
