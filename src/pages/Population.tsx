import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  AlertTriangle,
  Gauge,
  DollarSign,
  TrendingUp,
  MapPin,
} from "lucide-react";

import populationData from "@/data/population_dashboard.json";

function getScoreColor(score: number) {
  if (score >= 60) return "hsl(160, 84%, 39%)";
  if (score >= 55) return "hsl(38, 92%, 50%)";
  return "hsl(4, 72%, 57%)";
}

function RegionalMap() {
  const regions = populationData.regional_breakdown;
  // Normalize to SVG viewport
  const minLat = 25, maxLat = 50, minLng = -130, maxLng = -65;
  const w = 600, h = 350;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-2xl mx-auto" aria-label="Regional caregiver distribution map">
      {/* Simple US outline hint */}
      <rect x="0" y="0" width={w} height={h} fill="hsl(var(--muted))" rx="12" opacity="0.3" />
      {regions.map((r, i) => {
        const x = ((r.lng - minLng) / (maxLng - minLng)) * (w - 60) + 30;
        const y = h - ((r.lat - minLat) / (maxLat - minLat)) * (h - 60) - 30;
        const size = Math.sqrt(r.count) * 1.8;
        const color = getScoreColor(r.avg_score);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={size} fill={color} opacity={0.6} stroke={color} strokeWidth={1.5} />
            <text x={x} y={y - size - 4} textAnchor="middle" className="fill-foreground" fontSize="10" fontWeight="600">
              {r.region}
            </text>
            <text x={x} y={y + 3} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="bold">
              {r.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Population() {
  const [reachPct, setReachPct] = useState(50);

  const interpolated = useMemo(() => {
    const scenarios = populationData.intervention_effectiveness.scenarios;
    const atRisk = populationData.summary_stats.at_risk_count;
    const caregiversHelped = Math.round((reachPct / 100) * atRisk);
    const savingsPerCaregiver = populationData.estimated_impact.annual_healthcare_savings_per_caregiver;
    const savings = caregiversHelped * savingsPerCaregiver;
    const avgImprovement = populationData.estimated_impact.avg_score_improvement_with_intervention;

    return {
      caregivers_helped: caregiversHelped,
      savings: savings >= 1_000_000 ? `$${(savings / 1_000_000).toFixed(1)}M` : `$${(savings / 1_000).toFixed(0)}K`,
      avg_improvement: avgImprovement,
    };
  }, [reachPct]);

  const stats = populationData.summary_stats;

  const kpis = [
    { label: "Total Monitored", value: populationData.total_caregivers_monitored.toLocaleString(), icon: Users, color: "text-sky" },
    { label: "At-Risk", value: `${stats.at_risk_percentage}%`, icon: AlertTriangle, color: "text-amber" },
    { label: "Avg Health Score", value: stats.avg_health_score.toString(), icon: Gauge, color: "text-sky" },
    { label: "Est. Annual Savings", value: populationData.estimated_impact.total_monitored_savings, icon: DollarSign, color: "text-emerald" },
  ];

  const demoData = populationData.demographic_breakdown.map((d) => ({
    ...d,
    color: getScoreColor(d.avg_score),
  }));

  const careTypeData = populationData.caregiving_type_breakdown.map((d) => ({
    ...d,
    name: d.type.length > 20 ? d.type.slice(0, 18) + "…" : d.type,
    color: getScoreColor(d.avg_score),
  }));

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-1">Policy Dashboard: Scaling Impact</h1>
      <p className="text-muted-foreground mb-8">
        Simulated data showing what a national deployment could achieve for policymakers and healthcare systems.
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <kpi.icon className={`h-6 w-6 mx-auto mb-2 ${kpi.color}`} />
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Regional map */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Regional Distribution
          </CardTitle>
          <CardDescription>Circle size = caregiver count, color = avg health score (green = healthy, red = at-risk)</CardDescription>
        </CardHeader>
        <CardContent>
          <RegionalMap />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Demographic breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Demographic Group</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={demoData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" domain={[40, 70]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="group" tick={{ fontSize: 10 }} width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="avg_score" name="Avg Health Score" radius={[0, 4, 4, 0]}>
                  {demoData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Caregiving type */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Caregiving Type</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={careTypeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <XAxis type="number" domain={[40, 70]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={100} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Bar dataKey="avg_score" name="Avg Health Score" radius={[0, 4, 4, 0]}>
                  {careTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* What If slider */}
      <Card className="mb-8 border-l-4 border-l-sky">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-sky" />
            "What If" Intervention Simulator
          </CardTitle>
          <CardDescription>
            What if we could reach {reachPct}% of at-risk caregivers?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Slider
            value={[reachPct]}
            onValueChange={([v]) => setReachPct(v)}
            min={0}
            max={100}
            step={1}
            className="mb-6"
            aria-label="Intervention reach percentage"
          />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold text-sky">{interpolated.caregivers_helped.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Caregivers Helped</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold text-emerald">{interpolated.savings}</p>
              <p className="text-xs text-muted-foreground">Projected Savings</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-2xl font-bold text-amber">+{interpolated.avg_improvement}</p>
              <p className="text-xs text-muted-foreground">Avg Score Improvement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* National context */}
      <Card className="bg-gradient-hero text-primary-foreground print-break">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">National Context</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-bold">53M</p>
              <p className="text-xs text-primary-foreground/70">Unpaid Caregivers</p>
            </div>
            <div>
              <p className="text-xl font-bold">$600B</p>
              <p className="text-xs text-primary-foreground/70">Annual Value</p>
            </div>
            <div>
              <p className="text-xl font-bold">40%</p>
              <p className="text-xs text-primary-foreground/70">Burnout Rate</p>
            </div>
            <div>
              <p className="text-xl font-bold">$7,500</p>
              <p className="text-xs text-primary-foreground/70">Avg Cost Increase/yr</p>
            </div>
          </div>
          <p className="text-xs text-primary-foreground/50 mt-4">
            Source: {populationData.national_context.source}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
