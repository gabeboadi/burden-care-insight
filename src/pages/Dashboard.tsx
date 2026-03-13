import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Heart,
  Brain,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Moon,
  Zap,
  Loader2,
  RefreshCw,
  Info,
  Shield,
  AlertTriangle,
  ChevronsUpDown,
} from "lucide-react";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import caregiverProfiles from "@/data/caregiver_profiles.json";
import briefings from "@/data/briefings.json";
import realtimeSample from "@/data/realtime_sample.json";

type Profile = (typeof caregiverProfiles)[number];
type Briefing = (typeof briefings)[number];
type StressContextLabel = "Physical Labor" | "Cognitive/Emotional Burden" | "Recovery Window" | "Unknown or Mixed Context";
type ActivityCategory =
  | "Personal Care"
  | "Medication / Medical Coordination"
  | "Mobility / Transfers"
  | "Financial / Insurance Tasks"
  | "Household / Logistics"
  | "Emotional Supervision";
type ActivityContextAffinity = "physical" | "cognitive" | "mixed";
type ActivityProfileItem = {
  category: ActivityCategory;
  burdenPct: number;
  contextAffinity: ActivityContextAffinity;
};
type AlertLevel = "Normal" | "Watch" | "Urgent";
type SafetyEvent = {
  time: string;
  event: string;
  level: AlertLevel;
  source: string;
};
type RoutineAnomaly = {
  label: string;
  detail: string;
  level: AlertLevel;
};
type SafetyProfile = {
  moduleAlert: AlertLevel;
  fallRiskStatus: string;
  fallRiskScore: number;
  recentSafetyEvents: SafetyEvent[];
  routineAnomalies: RoutineAnomaly[];
};

const activityProfilesByCaregiver: Record<string, ActivityProfileItem[]> = {
  maria_santos: [
    { category: "Personal Care", burdenPct: 26, contextAffinity: "physical" },
    { category: "Emotional Supervision", burdenPct: 24, contextAffinity: "cognitive" },
    { category: "Medication / Medical Coordination", burdenPct: 18, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 15, contextAffinity: "mixed" },
    { category: "Mobility / Transfers", burdenPct: 10, contextAffinity: "physical" },
    { category: "Financial / Insurance Tasks", burdenPct: 7, contextAffinity: "cognitive" },
  ],
  james_chen: [
    { category: "Medication / Medical Coordination", burdenPct: 26, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 20, contextAffinity: "mixed" },
    { category: "Emotional Supervision", burdenPct: 18, contextAffinity: "cognitive" },
    { category: "Personal Care", burdenPct: 14, contextAffinity: "physical" },
    { category: "Financial / Insurance Tasks", burdenPct: 12, contextAffinity: "cognitive" },
    { category: "Mobility / Transfers", burdenPct: 10, contextAffinity: "physical" },
  ],
  aisha_williams: [
    { category: "Personal Care", burdenPct: 30, contextAffinity: "physical" },
    { category: "Mobility / Transfers", burdenPct: 22, contextAffinity: "physical" },
    { category: "Emotional Supervision", burdenPct: 20, contextAffinity: "cognitive" },
    { category: "Medication / Medical Coordination", burdenPct: 14, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 8, contextAffinity: "mixed" },
    { category: "Financial / Insurance Tasks", burdenPct: 6, contextAffinity: "cognitive" },
  ],
  robert_miller: [
    { category: "Mobility / Transfers", burdenPct: 28, contextAffinity: "physical" },
    { category: "Personal Care", burdenPct: 25, contextAffinity: "physical" },
    { category: "Medication / Medical Coordination", burdenPct: 20, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 12, contextAffinity: "mixed" },
    { category: "Emotional Supervision", burdenPct: 10, contextAffinity: "cognitive" },
    { category: "Financial / Insurance Tasks", burdenPct: 5, contextAffinity: "cognitive" },
  ],
  priya_patel: [
    { category: "Financial / Insurance Tasks", burdenPct: 31, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 24, contextAffinity: "mixed" },
    { category: "Emotional Supervision", burdenPct: 18, contextAffinity: "cognitive" },
    { category: "Medication / Medical Coordination", burdenPct: 12, contextAffinity: "cognitive" },
    { category: "Personal Care", burdenPct: 8, contextAffinity: "physical" },
    { category: "Mobility / Transfers", burdenPct: 7, contextAffinity: "physical" },
  ],
  david_thompson: [
    { category: "Medication / Medical Coordination", burdenPct: 27, contextAffinity: "cognitive" },
    { category: "Financial / Insurance Tasks", burdenPct: 25, contextAffinity: "cognitive" },
    { category: "Household / Logistics", burdenPct: 22, contextAffinity: "mixed" },
    { category: "Emotional Supervision", burdenPct: 15, contextAffinity: "cognitive" },
    { category: "Personal Care", burdenPct: 6, contextAffinity: "physical" },
    { category: "Mobility / Transfers", burdenPct: 5, contextAffinity: "physical" },
  ],
};

const safetyProfilesByCaregiver: Record<string, SafetyProfile> = {
  maria_santos: {
    moduleAlert: "Watch",
    fallRiskStatus: "Moderate fall risk in evening hours",
    fallRiskScore: 42,
    recentSafetyEvents: [
      { time: "Mon 7:45 PM", event: "Nighttime wandering near front door", level: "Watch", source: "Door Sensor" },
      { time: "Tue 12:30 PM", event: "Missed meal window by 90 minutes", level: "Watch", source: "Routine Monitor" },
      { time: "Wed 8:10 PM", event: "Unsteady gait pattern detected", level: "Watch", source: "Mobility Sensor" },
    ],
    routineAnomalies: [
      { label: "Nighttime wandering", detail: "2 episodes after 7 PM this week.", level: "Watch" },
      { label: "Missed meal window", detail: "Lunch delayed on 2 days.", level: "Watch" },
      { label: "Disrupted sleep pattern", detail: "Restlessness increased over 3 nights.", level: "Watch" },
    ],
  },
  james_chen: {
    moduleAlert: "Normal",
    fallRiskStatus: "Low fall risk with stable mobility",
    fallRiskScore: 18,
    recentSafetyEvents: [
      { time: "Mon 8:20 AM", event: "Morning mobility check completed", level: "Normal", source: "Mobility Sensor" },
      { time: "Wed 1:00 PM", event: "Medication adherence confirmed", level: "Normal", source: "Medication Reminder" },
      { time: "Thu 9:30 PM", event: "Sleep routine stable", level: "Normal", source: "Sleep Monitor" },
    ],
    routineAnomalies: [
      { label: "Prolonged inactivity", detail: "One mild afternoon inactivity flag.", level: "Normal" },
    ],
  },
  aisha_williams: {
    moduleAlert: "Watch",
    fallRiskStatus: "Moderate transfer-related fall risk",
    fallRiskScore: 47,
    recentSafetyEvents: [
      { time: "Tue 6:10 AM", event: "Transfer assist delay >10 min", level: "Watch", source: "Care Routine Monitor" },
      { time: "Thu 8:40 PM", event: "Disrupted sleep sequence detected", level: "Watch", source: "Sleep Monitor" },
      { time: "Fri 11:50 AM", event: "Extended inactivity before scheduled therapy", level: "Watch", source: "Activity Sensor" },
    ],
    routineAnomalies: [
      { label: "Disrupted sleep pattern", detail: "Fragmented sleep on 3 nights.", level: "Watch" },
      { label: "Prolonged inactivity", detail: "Two daytime inactivity periods >2 hours.", level: "Watch" },
    ],
  },
  robert_miller: {
    moduleAlert: "Urgent",
    fallRiskStatus: "High fall risk requiring immediate supervision backup",
    fallRiskScore: 78,
    recentSafetyEvents: [
      { time: "Mon 9:05 PM", event: "Near-fall detected in bathroom", level: "Urgent", source: "Fall Sensor" },
      { time: "Wed 10:20 PM", event: "Nighttime wandering with prolonged standing", level: "Urgent", source: "Door + Motion Sensor" },
      { time: "Thu 1:15 PM", event: "Missed medication and meal sequence", level: "Watch", source: "Routine Monitor" },
    ],
    routineAnomalies: [
      { label: "Nighttime wandering", detail: "3 high-risk wandering episodes this week.", level: "Urgent" },
      { label: "Missed meal window", detail: "Two missed lunch windows following agitation.", level: "Watch" },
      { label: "Prolonged inactivity", detail: "Extended post-event inactivity observed.", level: "Watch" },
    ],
  },
  priya_patel: {
    moduleAlert: "Watch",
    fallRiskStatus: "Moderate risk during unsupervised evening periods",
    fallRiskScore: 44,
    recentSafetyEvents: [
      { time: "Tue 7:25 PM", event: "Evening wandering outside bedroom zone", level: "Watch", source: "Door Sensor" },
      { time: "Wed 12:50 PM", event: "Missed meal reminder acknowledged late", level: "Watch", source: "Routine Monitor" },
      { time: "Fri 2:40 PM", event: "Prolonged inactivity before caregiver check-in", level: "Watch", source: "Activity Sensor" },
    ],
    routineAnomalies: [
      { label: "Missed meal window", detail: "Late meals on 3 workdays.", level: "Watch" },
      { label: "Prolonged inactivity", detail: "Daytime inactivity spikes during remote meetings.", level: "Watch" },
    ],
  },
  david_thompson: {
    moduleAlert: "Watch",
    fallRiskStatus: "Moderate remote-monitoring fall risk",
    fallRiskScore: 49,
    recentSafetyEvents: [
      { time: "Mon 10:05 PM", event: "Nighttime wandering alert in hallway", level: "Watch", source: "Motion Sensor" },
      { time: "Thu 8:15 AM", event: "Disrupted sleep-to-wake routine", level: "Watch", source: "Sleep Monitor" },
      { time: "Fri 12:10 PM", event: "Missed meal window pending remote confirmation", level: "Watch", source: "Routine Monitor" },
    ],
    routineAnomalies: [
      { label: "Nighttime wandering", detail: "Two hallway movement clusters after bedtime.", level: "Watch" },
      { label: "Disrupted sleep pattern", detail: "Wake pattern shifted by 2+ hours.", level: "Watch" },
      { label: "Missed meal window", detail: "Lunch missed once during caregiver travel delay.", level: "Watch" },
    ],
  },
};

function getScoreColor(score: number) {
  if (score >= 70) return "hsl(160, 84%, 39%)";
  if (score >= 50) return "hsl(38, 92%, 50%)";
  if (score >= 30) return "hsl(25, 80%, 52%)";
  return "hsl(4, 72%, 57%)";
}

function getRiskLabel(score: number) {
  if (score >= 70) return { label: "Low Risk", color: "bg-emerald text-emerald-foreground" };
  if (score >= 50) return { label: "Moderate Risk", color: "bg-amber text-amber-foreground" };
  if (score >= 30) return { label: "High Risk", color: "bg-coral/80 text-coral-foreground" };
  return { label: "Critical", color: "bg-coral text-coral-foreground" };
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "positive": return "bg-emerald text-emerald-foreground";
    case "info": return "bg-sky text-sky-foreground";
    case "warning": return "bg-amber text-amber-foreground";
    case "alert": return "bg-coral text-coral-foreground";
    default: return "bg-muted text-muted-foreground";
  }
}

function getTrend(data: Profile["weekly_data"]) {
  if (data.length < 2) return "stable";
  const last = data[data.length - 1].health_score;
  const prev = data[data.length - 2].health_score;
  if (last - prev > 3) return "up";
  if (prev - last > 3) return "down";
  return "stable";
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

type AliSnapshot = {
  score: number;
  signals: {
    hrDrift: number;
    hrvDecline: number;
    sleepDecline: number;
    stressLoad: number;
    recoveryDeterioration: number;
  };
};

type AliSummary = {
  current: AliSnapshot;
  lastMonth: AliSnapshot;
  pctChange: number;
  trendLabel: string;
  trendTone: "stable" | "rising" | "recovering" | "high";
};

function calculateAliSnapshot(recentWeeks: Profile["weekly_data"], priorWeeks: Profile["weekly_data"]): AliSnapshot {
  const recentAvgHr = average(recentWeeks.map((w) => w.avg_hr));
  const priorAvgHr = average(priorWeeks.map((w) => w.avg_hr));
  const recentAvgHrv = average(recentWeeks.map((w) => w.hrv_rmssd));
  const priorAvgHrv = average(priorWeeks.map((w) => w.hrv_rmssd));
  const recentAvgSleep = average(recentWeeks.map((w) => w.sleep_quality));
  const priorAvgSleep = average(priorWeeks.map((w) => w.sleep_quality));
  const recentAvgStress = average(recentWeeks.map((w) => w.stress_score));
  const recentAvgActivity = average(recentWeeks.map((w) => w.activity_minutes));
  const priorAvgActivity = average(priorWeeks.map((w) => w.activity_minutes));

  // Each signal maps to 0..1 risk, then averaged to produce a simple 0..5 prototype ALI.
  const hrDrift = clamp(((recentAvgHr - priorAvgHr) / Math.max(priorAvgHr, 1)) / 0.12, 0, 1);
  const hrvDecline = clamp(((priorAvgHrv - recentAvgHrv) / Math.max(priorAvgHrv, 1)) / 0.25, 0, 1);
  const sleepDecline = clamp(((priorAvgSleep - recentAvgSleep) / Math.max(priorAvgSleep, 1)) / 0.2, 0, 1);
  const stressLoad = clamp((recentAvgStress - 0.35) / 0.35, 0, 1);
  const recoveryDeterioration = clamp(((priorAvgActivity - recentAvgActivity) / Math.max(priorAvgActivity, 1)) / 0.3, 0, 1);

  const score = Number((average([hrDrift, hrvDecline, sleepDecline, stressLoad, recoveryDeterioration]) * 5).toFixed(1));
  return {
    score,
    signals: { hrDrift, hrvDecline, sleepDecline, stressLoad, recoveryDeterioration },
  };
}

function calculateAliSummary(data: Profile["weekly_data"]): AliSummary {
  const currentRecent = data.slice(-4);
  const currentPrior = data.slice(-8, -4);
  const lastRecent = data.slice(-8, -4);
  const lastPrior = data.slice(-12, -8);

  const fallbackRecent = data.slice(Math.max(0, data.length - 4));
  const fallbackPrior = data.slice(Math.max(0, data.length - 8), Math.max(0, data.length - 4));

  const current = calculateAliSnapshot(
    currentRecent.length > 0 ? currentRecent : fallbackRecent,
    currentPrior.length > 0 ? currentPrior : fallbackPrior,
  );
  const lastMonth = calculateAliSnapshot(
    lastRecent.length > 0 ? lastRecent : fallbackPrior,
    lastPrior.length > 0 ? lastPrior : fallbackRecent,
  );

  const pctChange = lastMonth.score === 0
    ? 0
    : Number((((current.score - lastMonth.score) / lastMonth.score) * 100).toFixed(0));

  let trendLabel = "Stable cumulative load";
  let trendTone: AliSummary["trendTone"] = "stable";

  if (current.score >= 4.2) {
    trendLabel = "High risk physiological strain";
    trendTone = "high";
  } else if (pctChange >= 12 || current.score >= 3.2) {
    trendLabel = "Rising physiological strain";
    trendTone = "rising";
  } else if (pctChange <= -10 && current.score < 3.2) {
    trendLabel = "Recovery trend";
    trendTone = "recovering";
  }

  return { current, lastMonth, pctChange, trendLabel, trendTone };
}

function getAliTrendClasses(trendTone: AliSummary["trendTone"]) {
  switch (trendTone) {
    case "high":
      return "bg-coral text-coral-foreground";
    case "rising":
      return "bg-amber text-amber-foreground";
    case "recovering":
      return "bg-emerald text-emerald-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function buildAliBriefingReference(ali: AliSummary) {
  if (ali.current.score >= 3.8 || ali.pctChange >= 12) {
    return `ALI is ${ali.current.score}/5 (${ali.pctChange > 0 ? "+" : ""}${ali.pctChange}% vs last month), indicating rising cumulative strain.`;
  }

  if (ali.current.score <= 2.2 && ali.pctChange <= -10) {
    return `ALI improved to ${ali.current.score}/5 (${ali.pctChange}% vs last month), suggesting better recovery capacity.`;
  }

  return null;
}

type StressContextEvent = {
  week: number;
  label: StressContextLabel;
  stressScore: number;
  activityMinutes: number;
  reason: string;
  timeWindow: string;
};

type StressContextSummary = {
  recentEvents: StressContextEvent[];
  counts: Record<StressContextLabel, number>;
  dominantStrain: Exclude<StressContextLabel, "Recovery Window" | "Unknown or Mixed Context"> | "Balanced";
};

type ActivityProfileSummary = {
  ranked: ActivityProfileItem[];
  primary: ActivityProfileItem;
  contextIntegratedSummary: string;
};
type SafetySummary = {
  profile: SafetyProfile;
  topEvent: SafetyEvent | null;
  topAnomaly: RoutineAnomaly | null;
};
type DyadicDataPoint = {
  time: string;
  caregiverStress: number;
  recipientAgitation: number;
};
type CoRegulationAlert = {
  time: string;
  message: string;
  level: AlertLevel;
};
type DyadicSummary = {
  timeline: DyadicDataPoint[];
  synchronyScore: number;
  alerts: CoRegulationAlert[];
};

function getContextBadgeClass(label: StressContextLabel) {
  switch (label) {
    case "Physical Labor":
      return "bg-amber text-amber-foreground";
    case "Cognitive/Emotional Burden":
      return "bg-coral text-coral-foreground";
    case "Recovery Window":
      return "bg-emerald text-emerald-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getSimulatedTimeWindow(week: number) {
  const slot = week % 3;
  if (slot === 0) return "Morning care tasks";
  if (slot === 1) return "Midday coordination";
  return "Evening care transition";
}

function classifyStressContext(
  weekData: Profile["weekly_data"][number],
  baselineStress: number,
  baselineActivity: number,
): Omit<StressContextEvent, "week" | "timeWindow"> {
  const stressDelta = weekData.stress_score - baselineStress;
  const activityDelta = weekData.activity_minutes - baselineActivity;
  const elevatedStress = weekData.stress_score >= 0.55 || stressDelta >= 0.1;
  const lowMovement = weekData.activity_minutes <= 30 || activityDelta <= -5;
  const highMovement = weekData.activity_minutes >= 36 || activityDelta >= 6;

  // Prototype context inference only: deterministic heuristics from available wearable proxies.
  if (weekData.stress_score <= 0.3 && weekData.sleep_quality >= 7.0 && weekData.hrv_rmssd >= 48) {
    return {
      label: "Recovery Window",
      stressScore: weekData.stress_score,
      activityMinutes: weekData.activity_minutes,
      reason: "Lower stress with stronger recovery markers (sleep + HRV).",
    };
  }

  if (elevatedStress && highMovement) {
    return {
      label: "Physical Labor",
      stressScore: weekData.stress_score,
      activityMinutes: weekData.activity_minutes,
      reason: "Higher movement intensity during elevated stress periods.",
    };
  }

  if (elevatedStress && lowMovement) {
    return {
      label: "Cognitive/Emotional Burden",
      stressScore: weekData.stress_score,
      activityMinutes: weekData.activity_minutes,
      reason: "Elevated strain without corresponding physical activity.",
    };
  }

  if (weekData.stress_score <= 0.35 && weekData.sleep_quality >= 7.2) {
    return {
      label: "Recovery Window",
      stressScore: weekData.stress_score,
      activityMinutes: weekData.activity_minutes,
      reason: "Calmer week with solid sleep-based recovery.",
    };
  }

  return {
    label: "Unknown or Mixed Context",
    stressScore: weekData.stress_score,
    activityMinutes: weekData.activity_minutes,
    reason: "Signals are blended across movement and stress indicators.",
  };
}

function summarizeStressContext(data: Profile["weekly_data"]): StressContextSummary {
  const recentWeeks = data.slice(-6);
  const baselineWindow = data.slice(-12, -6);
  const baselineStress = average((baselineWindow.length ? baselineWindow : data).map((w) => w.stress_score));
  const baselineActivity = average((baselineWindow.length ? baselineWindow : data).map((w) => w.activity_minutes));

  const recentEvents = recentWeeks.map((w) => {
    const classified = classifyStressContext(w, baselineStress, baselineActivity);
    return {
      week: w.week,
      timeWindow: getSimulatedTimeWindow(w.week),
      ...classified,
    };
  }).reverse();

  const counts: Record<StressContextLabel, number> = {
    "Physical Labor": 0,
    "Cognitive/Emotional Burden": 0,
    "Recovery Window": 0,
    "Unknown or Mixed Context": 0,
  };
  for (const event of recentEvents) counts[event.label] += 1;

  const dominantStrain = counts["Cognitive/Emotional Burden"] === counts["Physical Labor"]
    ? "Balanced"
    : counts["Cognitive/Emotional Burden"] > counts["Physical Labor"]
      ? "Cognitive/Emotional Burden"
      : "Physical Labor";

  return { recentEvents, counts, dominantStrain };
}

function buildStressContextBriefingReference(context: StressContextSummary) {
  if (context.dominantStrain === "Balanced") {
    return "This week strain was mixed between physical effort and cognitive/emotional load.";
  }

  if (context.dominantStrain === "Physical Labor") {
    return "This week your highest strain came from repeated physical labor patterns.";
  }

  return "This week your highest strain came from repeated cognitive/emotional burden rather than physical effort.";
}

function getActivityAffinityClasses(affinity: ActivityContextAffinity) {
  if (affinity === "physical") return "bg-amber";
  if (affinity === "cognitive") return "bg-coral";
  return "bg-sky";
}

function getAlertBadgeClasses(level: AlertLevel) {
  if (level === "Urgent") return "bg-coral text-coral-foreground";
  if (level === "Watch") return "bg-amber text-amber-foreground";
  return "bg-emerald text-emerald-foreground";
}

function getAlertPriority(level: AlertLevel) {
  if (level === "Urgent") return 3;
  if (level === "Watch") return 2;
  return 1;
}

function summarizeCaregivingActivityProfile(
  caregiverId: string,
  context: StressContextSummary,
): ActivityProfileSummary {
  const baseProfile = activityProfilesByCaregiver[caregiverId] || [
    { category: "Personal Care", burdenPct: 22, contextAffinity: "physical" as const },
    { category: "Medication / Medical Coordination", burdenPct: 21, contextAffinity: "cognitive" as const },
    { category: "Household / Logistics", burdenPct: 20, contextAffinity: "mixed" as const },
    { category: "Emotional Supervision", burdenPct: 15, contextAffinity: "cognitive" as const },
    { category: "Financial / Insurance Tasks", burdenPct: 12, contextAffinity: "cognitive" as const },
    { category: "Mobility / Transfers", burdenPct: 10, contextAffinity: "physical" as const },
  ];

  const ranked = [...baseProfile].sort((a, b) => b.burdenPct - a.burdenPct);
  const primary = ranked[0];
  const contextSummary = context.dominantStrain === "Physical Labor"
    ? "This aligns with the current physical-labor stress pattern."
    : context.dominantStrain === "Cognitive/Emotional Burden"
      ? "This aligns with the current cognitive/emotional strain pattern."
      : "This appears balanced across physical and cognitive demands.";

  return {
    ranked,
    primary,
    contextIntegratedSummary: `Primary burden driver this month: ${primary.category}. ${contextSummary}`,
  };
}

function summarizeSafetyProfile(caregiverId: string): SafetySummary {
  const fallback: SafetyProfile = {
    moduleAlert: "Normal",
    fallRiskStatus: "Low fall risk with no critical anomalies",
    fallRiskScore: 20,
    recentSafetyEvents: [
      { time: "Wed 9:10 AM", event: "Routine check-in completed", level: "Normal", source: "Routine Monitor" },
    ],
    routineAnomalies: [
      { label: "Disrupted sleep pattern", detail: "Minor drift only, no urgent concern.", level: "Normal" },
    ],
  };

  const profile = safetyProfilesByCaregiver[caregiverId] || fallback;
  const topEvent = [...profile.recentSafetyEvents].sort((a, b) => getAlertPriority(b.level) - getAlertPriority(a.level))[0] || null;
  const topAnomaly = [...profile.routineAnomalies].sort((a, b) => getAlertPriority(b.level) - getAlertPriority(a.level))[0] || null;
  return { profile, topEvent, topAnomaly };
}

function buildSafetyBriefingReference(safety: SafetySummary) {
  if (!safety.topEvent) return null;
  if (safety.profile.moduleAlert === "Urgent") {
    return `Urgent safety signal: ${safety.topEvent.event}. Consider immediate supervision escalation.`;
  }
  if (safety.profile.moduleAlert === "Watch") {
    return `Safety watch item: ${safety.topEvent.event}. Continue proactive monitoring this week.`;
  }
  return "Safety monitoring remains stable with no urgent recipient-side events.";
}

function buildDyadicMonitoring(
  caregiverId: string,
  weeklyData: Profile["weekly_data"],
  safetyAlert: AlertLevel,
): DyadicSummary {
  const times = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "2:15 PM", "3:00 PM", "4:30 PM", "6:00 PM"];
  const avgStress = average(weeklyData.slice(-4).map((w) => w.stress_score));
  const stressScale = clamp(avgStress / 0.7, 0.45, 1.25);
  const safetyLift = safetyAlert === "Urgent" ? 1.2 : safetyAlert === "Watch" ? 1.0 : 0.82;

  // Recipient pattern is simulated; caregiver stress is shifted to model a short lag response.
  const recipientBase = [30, 36, 42, 55, 76, 60, 45, 34];
  const caregiverBase = [28, 31, 35, 41, 52, 72, 58, 44];
  const caregiverOffsets: Record<string, number> = {
    maria_santos: 2,
    james_chen: -4,
    aisha_williams: 4,
    robert_miller: 8,
    priya_patel: 5,
    david_thompson: 3,
  };
  const offset = caregiverOffsets[caregiverId] ?? 0;

  const timeline = times.map((time, i) => ({
    time,
    recipientAgitation: Math.round(clamp(recipientBase[i] * safetyLift, 10, 95)),
    caregiverStress: Math.round(clamp(caregiverBase[i] * stressScale + offset, 10, 95)),
  }));

  const alerts: CoRegulationAlert[] = [];
  for (let i = 0; i < timeline.length - 1; i++) {
    const recipientDelta = timeline[i].recipientAgitation - (i > 0 ? timeline[i - 1].recipientAgitation : timeline[i].recipientAgitation);
    const caregiverNextDelta = timeline[i + 1].caregiverStress - timeline[i].caregiverStress;
    if (recipientDelta >= 12 && caregiverNextDelta >= 10) {
      alerts.push({
        time: timeline[i + 1].time,
        level: caregiverNextDelta >= 14 ? "Urgent" : "Watch",
        message: `The care recipient's agitation spike at ${timeline[i].time} appears to align with a sharp caregiver stress response. Consider a brief step-away or breathing intervention.`,
      });
    }
  }

  const n = timeline.length;
  const avgCaregiver = average(timeline.map((p) => p.caregiverStress));
  const avgRecipient = average(timeline.map((p) => p.recipientAgitation));
  let cov = 0;
  let varX = 0;
  let varY = 0;
  for (const point of timeline) {
    const x = point.caregiverStress - avgCaregiver;
    const y = point.recipientAgitation - avgRecipient;
    cov += x * y;
    varX += x * x;
    varY += y * y;
  }
  const corr = n > 1 && varX > 0 && varY > 0 ? cov / Math.sqrt(varX * varY) : 0;
  const synchronyScore = Math.round(clamp((corr + 1) * 50, 15, 96));

  return { timeline, synchronyScore, alerts };
}

function buildDyadicBriefingReference(dyadic: DyadicSummary) {
  if (dyadic.alerts.length > 0) {
    return `Dyadic monitoring flagged ${dyadic.alerts.length} co-regulation alert${dyadic.alerts.length > 1 ? "s" : ""} this week (Synchrony Score ${dyadic.synchronyScore}/100).`;
  }
  return `Dyadic signals remained comparatively stable this week (Synchrony Score ${dyadic.synchronyScore}/100).`;
}

function HealthGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (score / 100) * circumference;
  const risk = getRiskLabel(score);

  return (
    <div className="flex flex-col items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" aria-label={`Health score: ${score}`}>
        <circle cx="90" cy="90" r="70" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <circle
          cx="90" cy="90" r="70" fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="90" y="82" textAnchor="middle" className="fill-foreground text-3xl font-bold" fontSize="36">{score}</text>
        <text x="90" y="105" textAnchor="middle" className="fill-muted-foreground" fontSize="12">Health Score</text>
      </svg>
      <Badge className={`mt-2 ${risk.color}`}>{risk.label}</Badge>
    </div>
  );
}

function RealtimeSignals() {
  const [visibleIndex, setVisibleIndex] = useState(30);
  const animRef = useRef<number>();
  const lastTime = useRef(Date.now());
  const windowSize = 60;

  const animate = useCallback(() => {
    const now = Date.now();
    if (now - lastTime.current >= 100) {
      lastTime.current = now;
      setVisibleIndex((prev) => {
        if (prev >= realtimeSample.timestamps.length - 1) return 30;
        return prev + 1;
      });
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate]);

  const data = useMemo(() => {
    const start = Math.max(0, visibleIndex - windowSize);
    const slice: { t: number; hr: number; eda: number; stress: number; condition: string }[] = [];
    for (let i = start; i <= visibleIndex && i < realtimeSample.timestamps.length; i++) {
      slice.push({
        t: realtimeSample.timestamps[i],
        hr: realtimeSample.heart_rate[i],
        eda: realtimeSample.eda[i],
        stress: realtimeSample.stress_probability[i],
        condition: realtimeSample.condition_label[i],
      });
    }
    return slice;
  }, [visibleIndex]);

  const currentCondition = data.length > 0 ? data[data.length - 1].condition : "baseline";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Real-Time Signals</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={currentCondition === "stress" ? "bg-coral text-coral-foreground" : "bg-emerald text-emerald-foreground"}>
              {currentCondition === "stress" ? "Stress" : "Baseline"}
            </Badge>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald animate-pulse-live" />
              <span className="text-xs font-medium text-emerald">LIVE</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Heart Rate (BPM)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="hr" stroke="hsl(4, 72%, 57%)" dot={false} strokeWidth={1.5} />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <XAxis hide dataKey="t" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Skin Conductance (EDA)</p>
          <ResponsiveContainer width="100%" height={80}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="eda" stroke="hsl(217, 91%, 60%)" dot={false} strokeWidth={1.5} />
              <YAxis hide domain={['dataMin - 0.5', 'dataMax + 0.5']} />
              <XAxis hide dataKey="t" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Stress Probability</p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(4, 72%, 57%)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="stress" fill="url(#stressGrad)" stroke="hsl(38, 92%, 50%)" strokeWidth={1.5} />
              <YAxis hide domain={[0, 1]} />
              <XAxis hide dataKey="t" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState("maria_santos");
  const [generating, setGenerating] = useState(false);
  const [generatedBriefing, setGeneratedBriefing] = useState<Briefing | null>(null);

  const profile = caregiverProfiles.find((p) => p.id === selectedId)!;
  const profileBriefings = briefings.filter((b) => b.caregiver_id === selectedId);
  const latestBriefing = generatedBriefing || profileBriefings[profileBriefings.length - 1];
  const latestWeek = profile.weekly_data[profile.weekly_data.length - 1];
  const trend = getTrend(profile.weekly_data);
  const isAisha = selectedId === "aisha_williams";
  const ali = useMemo(() => calculateAliSummary(profile.weekly_data), [profile.weekly_data]);
  const aliBriefingReference = useMemo(() => buildAliBriefingReference(ali), [ali]);
  const stressContext = useMemo(() => summarizeStressContext(profile.weekly_data), [profile.weekly_data]);
  const activityProfile = useMemo(
    () => summarizeCaregivingActivityProfile(selectedId, stressContext),
    [selectedId, stressContext],
  );
  const safety = useMemo(() => summarizeSafetyProfile(selectedId), [selectedId]);
  const dyadic = useMemo(
    () => buildDyadicMonitoring(selectedId, profile.weekly_data, safety.profile.moduleAlert),
    [selectedId, profile.weekly_data, safety.profile.moduleAlert],
  );
  const stressContextBriefingReference = useMemo(
    () => buildStressContextBriefingReference(stressContext),
    [stressContext],
  );
  const activityBriefingReference = useMemo(
    () => `Primary caregiving burden is concentrated in ${activityProfile.primary.category}.`,
    [activityProfile],
  );
  const safetyBriefingReference = useMemo(() => buildSafetyBriefingReference(safety), [safety]);
  const dyadicBriefingReference = useMemo(() => buildDyadicBriefingReference(dyadic), [dyadic]);
  const prototypeInsightSummary = useMemo(
    () => `${stressContextBriefingReference} ${dyadicBriefingReference}`,
    [stressContextBriefingReference, dyadicBriefingReference],
  );
  const AliTrendIcon = ali.pctChange > 0 ? TrendingUp : ali.pctChange < 0 ? TrendingDown : Minus;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const random = briefings[Math.floor(Math.random() * briefings.length)];
      setGeneratedBriefing({ ...random, caregiver_id: selectedId, week: latestWeek.week + 1 });
      setGenerating(false);
    }, 2000);
  };

  useEffect(() => {
    setGeneratedBriefing(null);
  }, [selectedId]);

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="container py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Individual Caregiver Dashboard</h1>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {caregiverProfiles.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}, {p.age} — {p.caregiving_context.slice(0, 40)}…
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left column */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                Health Score
                <TrendIcon className={`h-4 w-4 ${trend === "up" ? "text-emerald" : trend === "down" ? "text-coral" : "text-muted-foreground"}`} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <HealthGauge score={Math.round(latestWeek.health_score)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">12-Week Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={profile.weekly_data} aria-label="12-week health trend chart">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} label={{ value: "Week", position: "insideBottom", offset: -5 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="health_score" name="Health Score" stroke="hsl(160, 84%, 39%)" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="stress_score" name="Stress Score" stroke="hsl(4, 72%, 57%)" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
                  <Line type="monotone" dataKey="hrv_rmssd" name="Recovery Variability (HRV)" stroke="hsl(217, 91%, 60%)" strokeWidth={1.5} dot={false} />
                  {isAisha && <ReferenceLine x={6} stroke="hsl(160, 84%, 39%)" strokeDasharray="4 4" label={{ value: "Respite Care Started", position: "top", fontSize: 10 }} />}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <RealtimeSignals />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback style={{ background: profile.avatar_color }} className="text-lg font-bold text-white">
                    {profile.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.age} · {profile.occupation}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{profile.caregiving_context}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-muted p-2">
                  <p className="text-lg font-bold">{profile.caregiving_hours_per_week}</p>
                  <p className="text-xs text-muted-foreground">hrs/week</p>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <p className="text-lg font-bold">{profile.weeks_monitored}</p>
                  <p className="text-xs text-muted-foreground">weeks</p>
                </div>
                <div className="rounded-md bg-muted p-2">
                  <p className="text-lg font-bold" style={{ color: getScoreColor(latestWeek.health_score) }}>{Math.round(latestWeek.health_score)}</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Briefing */}
          <Card className="border-l-4" style={{ borderLeftColor: getScoreColor(latestBriefing?.health_score ?? 50) }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-sky" />
                  Weekly Health Briefing
                </CardTitle>
                {latestBriefing && (
                  <Badge className={getSeverityColor(latestBriefing.severity)}>
                    {latestBriefing.severity}
                  </Badge>
                )}
              </div>
              <CardDescription>Week {latestBriefing?.week ?? "—"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Care Path Narrative</p>
                <ol className="space-y-1 text-sm">
                  <li><span className="font-medium">1. Burden:</span> {activityBriefingReference}</li>
                  <li><span className="font-medium">2. Physiological Strain:</span> ALI {ali.current.score.toFixed(1)}/5 ({ali.pctChange > 0 ? "+" : ""}{ali.pctChange}% vs last month).</li>
                  <li><span className="font-medium">3. AI Insight:</span> {prototypeInsightSummary}</li>
                  <li><span className="font-medium">4. Action:</span> Review and prioritize the recommended interventions below.</li>
                </ol>
              </div>
              <p className="text-sm leading-relaxed">{latestBriefing?.briefing ?? "Briefing will appear after profile selection."}</p>
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Stress Context Signal</p>
                <p className="text-sm">{stressContextBriefingReference}</p>
              </div>
              {safetyBriefingReference && (
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Safety Monitoring Signal</p>
                  <p className="text-sm">{safetyBriefingReference}</p>
                </div>
              )}
              {aliBriefingReference && (
                <div className="rounded-md border bg-muted/40 p-3">
                  <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">ALI Context</p>
                  <p className="text-sm">{aliBriefingReference}</p>
                </div>
              )}
              {latestBriefing?.micro_interventions && (
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Recommended Actions</p>
                  <ul className="space-y-1.5">
                    {latestBriefing.micro_interventions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Heart className="h-3.5 w-3.5 mt-0.5 text-coral shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button onClick={handleGenerate} disabled={generating} className="w-full" variant="outline">
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Generate New Briefing
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Allostatic Load Index</CardTitle>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Explain Allostatic Load Index"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      Prototype score combining resting HR drift, HRV decline, sleep/recovery decline,
                      stress load, and activity recovery deterioration over recent weeks.
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <CardDescription>Cumulative physiological wear-and-tear estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current ALI</p>
                  <p className="text-3xl font-bold">{ali.current.score.toFixed(1)} <span className="text-base text-muted-foreground">/ 5</span></p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${ali.pctChange > 0 ? "text-coral" : ali.pctChange < 0 ? "text-emerald" : "text-muted-foreground"}`}>
                  <AliTrendIcon className="h-4 w-4" />
                  <span>{ali.pctChange > 0 ? "+" : ""}{ali.pctChange}% vs last month</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge className={getAliTrendClasses(ali.trendTone)}>{ali.trendLabel}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Prototype burnout forecast derived from longitudinal wearable patterns. For demonstration only.
              </p>
            </CardContent>
          </Card>

          {/* Weekly Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Avg HR", value: `${latestWeek.avg_hr} bpm`, icon: Heart, color: "text-coral" },
              { label: "Recovery Variability", value: `${latestWeek.hrv_rmssd.toFixed(1)} ms`, icon: Activity, color: "text-sky" },
              { label: "EDA Peaks", value: `${latestWeek.eda_peaks_per_hour}/hr`, icon: Zap, color: "text-amber" },
              { label: "Sleep Quality", value: `${latestWeek.sleep_quality}/10`, icon: Moon, color: "text-sky" },
              { label: "Activity", value: `${latestWeek.activity_minutes} min/day`, icon: Activity, color: "text-emerald" },
              { label: "Stress Episodes", value: `${latestWeek.stress_episodes}/week`, icon: Brain, color: "text-coral" },
            ].map((m, i) => (
              <Card key={i}>
                <CardContent className="pt-4 pb-3 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-lg font-bold">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Collapsible defaultOpen={false}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">Prototype Intelligence Modules</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Expand <ChevronsUpDown className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CardDescription>
                  Future-facing intelligence layers for contextual burden understanding
                </CardDescription>
              </CardHeader>
            </Card>
            <CollapsibleContent className="space-y-6 mt-3">

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Caregiving Activity Profile</CardTitle>
              <CardDescription>
                Simulated task-burden mix tied to caregiver persona and current stress context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-sm font-medium">{activityProfile.contextIntegratedSummary}</p>
              </div>

              <div className="space-y-2">
                {activityProfile.ranked.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="font-semibold">{item.burdenPct}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${getActivityAffinityClasses(item.contextAffinity)}`}
                        style={{ width: `${item.burdenPct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-semibold text-foreground">Legend:</span> Amber = more physical demand, Coral = more cognitive/emotional demand, Sky = mixed logistics.
                </p>
                <p>Persona-specific activity shares are simulated for demo decision support and not clinically measured task-time logs.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky" />
                  Safety Monitoring
                </CardTitle>
                <Badge className={getAlertBadgeClasses(safety.profile.moduleAlert)}>
                  {safety.profile.moduleAlert}
                </Badge>
              </div>
              <CardDescription>
                Future-facing safety intelligence module for care-recipient fall and routine risk signals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3">
                <p className="text-xs font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Fall Risk Status</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{safety.profile.fallRiskStatus}</p>
                  <p className="text-xs text-muted-foreground">{safety.profile.fallRiskScore}% weekly risk</p>
                </div>
              </div>

              <Collapsible defaultOpen={false}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent Safety Events</p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                      Timeline <ChevronsUpDown className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="mt-2 space-y-2">
                  {safety.profile.recentSafetyEvents.map((event, i) => (
                    <div key={`${event.time}-${i}`} className="rounded-md border p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs text-muted-foreground">{event.time} · {event.source}</p>
                        <Badge className={getAlertBadgeClasses(event.level)}>{event.level}</Badge>
                      </div>
                      <p className="text-sm">{event.event}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <div>
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Routine Anomalies</p>
                <div className="space-y-2">
                  {safety.profile.routineAnomalies.map((item, i) => (
                    <div key={`${item.label}-${i}`} className="rounded-md border p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <Badge className={getAlertBadgeClasses(item.level)}>
                          {item.level === "Urgent" ? <AlertTriangle className="h-3 w-3 mr-1" /> : null}
                          {item.level}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Prototype module only: simulated events illustrate how recipient-side safety intelligence could reduce supervision burden.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Dyadic Stress Monitoring</CardTitle>
                <Badge className="bg-sky text-sky-foreground">
                  Synchrony Score: {dyadic.synchronyScore}
                </Badge>
              </div>
              <CardDescription>
                Future-facing prototype exploring shared caregiver-recipient burden and co-regulation dynamics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ResponsiveContainer width="100%" height={170}>
                <LineChart data={dyadic.timeline} aria-label="Dyadic stress alignment timeline">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  />
                  <Line type="monotone" dataKey="caregiverStress" name="Caregiver Stress" stroke="hsl(4, 72%, 57%)" strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line type="monotone" dataKey="recipientAgitation" name="Recipient Agitation" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Caregiver stress trend</p>
                  <p className="font-semibold">Reactive rise after agitation peaks</p>
                </div>
                <div className="rounded-md bg-muted/50 p-2">
                  <p className="text-muted-foreground">Recipient agitation trend</p>
                  <p className="font-semibold">Midday-to-afternoon escalation window</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Concept prototype only. Alignment patterns are simulated to demonstrate potential shared-burden insights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Co-Regulation Alerts</CardTitle>
                <Badge className={dyadic.alerts.length > 0 ? "bg-amber text-amber-foreground" : "bg-emerald text-emerald-foreground"}>
                  {dyadic.alerts.length} this week
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {dyadic.alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No significant dyadic synchrony alerts detected this week.</p>
              ) : (
                dyadic.alerts.map((alert, idx) => (
                  <div key={`${alert.time}-${idx}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                      <Badge className={getAlertBadgeClasses(alert.level)}>{alert.level}</Badge>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Stress Context</CardTitle>
                <Badge className="bg-sky text-sky-foreground">
                  Dominant: {stressContext.dominantStrain}
                </Badge>
              </div>
              <CardDescription>
                Prototype context labels inferred from stress + activity patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {stressContext.recentEvents.slice(0, 4).map((event) => (
                  <div key={`${event.week}-${event.label}`} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs text-muted-foreground">Week {event.week} · {event.timeWindow}</p>
                      <Badge className={getContextBadgeClass(event.label)}>{event.label}</Badge>
                    </div>
                    <p className="text-sm">{event.reason}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {(["Physical Labor", "Cognitive/Emotional Burden", "Recovery Window"] as const).map((label) => {
                  const total = stressContext.recentEvents.length || 1;
                  const pct = Math.round((stressContext.counts[label] / total) * 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{pct}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full ${label === "Physical Labor" ? "bg-amber" : label === "Cognitive/Emotional Burden" ? "bg-coral" : "bg-emerald"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Legend:</span> Physical Labor = high movement + elevated stress.</p>
                <p>Cognitive/Emotional Burden = elevated stress during low movement/coordination periods.</p>
                <p>Recovery Window = lower stress with better sleep/HRV indicators.</p>
                <p>Prototype decision support only. Not a clinical diagnosis.</p>
              </div>
            </CardContent>
          </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
