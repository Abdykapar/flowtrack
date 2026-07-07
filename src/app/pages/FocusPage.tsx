import { useEffect, useRef, useState } from "react";
import { Coffee, Pause, Play, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { useAppData } from "../context/AppDataContext";
import type { Task } from "@/lib/api";

export default function FocusPage() {
  const { tasks } = useAppData();
  const POMODORO = 25 * 60;
  const [secs, setSecs] = useState(POMODORO);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selected, setSelected] = useState<Task | undefined>(undefined);
  const [phase, setPhase] = useState<"focus" | "break">("focus");
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const elapsedSecsRef = useRef(0);

  useEffect(() => {
    if (!selected) {
      const first = tasks.find((t) => t.status !== "completed");
      if (first) setSelected(first);
    }
  }, [tasks]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      elapsedSecsRef.current += 1;
      setSecs((s) => {
        if (s <= 1) {
          setRunning(false);
          if (phase === "focus") {
            setSessions((n) => n + 1);
            if (activeSessionId !== null) {
              const mins = Math.round(elapsedSecsRef.current / 60);
              api.focusSessions.update(activeSessionId, {
                endTime: new Date().toISOString(),
                durationMin: mins,
              }).catch(() => {});
              setActiveSessionId(null);
              elapsedSecsRef.current = 0;
            }
          }
          return POMODORO;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, phase, activeSessionId]);

  const handlePlayPause = async () => {
    if (!running && phase === "focus" && activeSessionId === null) {
      try {
        const session = await api.focusSessions.create(selected?.id);
        setActiveSessionId(session.id);
        elapsedSecsRef.current = 0;
      } catch {
        // proceed with local timer even if API fails
      }
    } else if (running && activeSessionId !== null) {
      try {
        await api.focusSessions.update(activeSessionId, { paused: true });
      } catch {
        // ignore
      }
    }
    setRunning((r) => !r);
  };

  const handleReset = async () => {
    if (activeSessionId !== null) {
      const mins = Math.round(elapsedSecsRef.current / 60);
      try {
        await api.focusSessions.update(activeSessionId, {
          endTime: new Date().toISOString(),
          durationMin: mins,
        });
      } catch {
        // ignore
      }
      setActiveSessionId(null);
      elapsedSecsRef.current = 0;
    }
    setSecs(POMODORO);
    setRunning(false);
  };

  const mm = Math.floor(secs / 60).toString().padStart(2, "0");
  const ss = (secs % 60).toString().padStart(2, "0");
  const pct = (secs / POMODORO) * 100;
  const R = 90;
  const C = 2 * Math.PI * R;

  return (
    <div className="h-full flex overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center gap-7 bg-gradient-to-b from-[#0C0F14] via-[#0F1115] to-[#0F1115]">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${running ? "bg-indigo-400 animate-pulse" : "bg-indigo-700"}`} />
          <span
            className="text-[12px] text-indigo-300 font-medium"
            style={{ fontFamily: "Onest, sans-serif" }}
          >
            {phase === "focus" ? "Focus Session" : "Short Break"}
          </span>
        </div>

        <div className="relative">
          <svg width="228" height="228" className="-rotate-90">
            <circle cx="114" cy="114" r={R} stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="none" />
            <circle
              cx="114"
              cy="114"
              r={R}
              stroke="url(#tGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (pct / 100) * C}
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
            />
            <defs>
              <linearGradient id="tGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className="text-[52px] font-bold text-white tracking-tight leading-none"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {mm}:{ss}
            </div>
            <div className="text-[11px] text-slate-600 mt-2 font-mono">remaining</div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[11px] text-slate-600 mb-1.5">Currently working on</p>
          <h2 className="text-[16px] font-semibold text-white" style={{ fontFamily: "Onest, sans-serif" }}>
            {selected?.title ?? "No task selected"}
          </h2>
          {selected?.category && (
            <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {selected.category.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/6 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={handlePlayPause}
            className="w-[68px] h-[68px] rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/35 hover:shadow-indigo-500/55 hover:scale-[1.04] active:scale-[0.97] transition-all"
          >
            {running ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <button
            onClick={() => {
              setPhase((p) => (p === "focus" ? "break" : "focus"));
              handleReset();
            }}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white/6 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all"
          >
            <Coffee size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i < sessions % 4 ? "bg-indigo-400 scale-110" : "bg-white/10"}`}
            />
          ))}
          <span className="text-[11px] text-slate-600 ml-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
            {sessions} sessions today
          </span>
        </div>
      </div>

      <div className="w-[240px] border-l border-white/5 bg-[#0D1017] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Select Task</p>
          <div className="space-y-1.5">
            {tasks
              .filter((t) => t.status !== "completed")
              .slice(0, 5)
              .map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelected(task)}
                  className={`w-full text-left p-2.5 rounded-lg text-[12px] transition-all ${
                    selected?.id === task.id
                      ? "bg-indigo-500/15 border border-indigo-500/25 text-indigo-200"
                      : "hover:bg-white/5 text-slate-400 border border-transparent"
                  }`}
                >
                  <div className="font-medium text-slate-200 truncate">{task.title}</div>
                  {task.category && (
                    <div className="text-[10px] text-slate-600 mt-0.5 truncate">{task.category.name}</div>
                  )}
                </button>
              ))}
          </div>
        </div>

        <div className="p-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Session Stats</p>
          <div className="space-y-3">
            {[
              { label: "Pomodoros", value: String(sessions) },
              { label: "Focus Time", value: `${sessions * 25}min` },
              { label: "Break Time", value: `${Math.floor(sessions / 4) * 15 + (sessions % 4) * 5}min` },
              { label: "Task Progress", value: `${selected?.completionPercent ?? 0}%` },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{s.label}</span>
                <span
                  className="text-[11px] text-white font-semibold"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Today&apos;s Goal</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  style={{ width: `${(sessions / 8) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-600 font-mono">{sessions}/8</span>
            </div>
            <p className="text-[10px] text-slate-700">{8 - Math.min(sessions, 8)} sessions to daily goal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
