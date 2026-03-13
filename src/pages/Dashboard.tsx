import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
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
import { Skeleton } from "@/components/ui/skeleton";
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
} from "lucide-react";

import caregiverProfiles from "@/data/caregiver_profiles.json";
import briefings from "@/data/briefings.json";
import realtimeSample from "@/data/realtime_sample.json";

type Profile = (typeof caregiverProfiles)[number];
type Briefing = (typeof briefings)[number];

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
          <p className="text-xs text-muted-foreground mb-1">EDA (μS)</p>
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

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      const random = briefings[Math.floor(Math.random() * briefings.length)];
      setGeneratedBriefing({ ...random, caregiver_id: selectedId, week: latestWeek.week + 1 } as any);
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
                  <Line type="monotone" dataKey="hrv_rmssd" name="HRV RMSSD" stroke="hsl(217, 91%, 60%)" strokeWidth={1.5} dot={false} />
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
              <p className="text-sm leading-relaxed">{latestBriefing?.briefing ?? "No briefing available."}</p>
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

          {/* Weekly Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Avg HR", value: `${latestWeek.avg_hr} bpm`, icon: Heart, color: "text-coral" },
              { label: "HRV RMSSD", value: `${latestWeek.hrv_rmssd.toFixed(1)} ms`, icon: Activity, color: "text-sky" },
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
        </div>
      </div>
    </div>
  );
}
