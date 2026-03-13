import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Watch, HeartPulse, Cpu, ChevronDown, Lightbulb, Info } from "lucide-react";

import modelMetrics from "@/data/model_metrics.json";

const models = modelMetrics.models;
const modelKeys = ["all_signals", "wrist_only", "chest_only"] as const;
type ModelKey = (typeof modelKeys)[number];

const modelIcons: Record<ModelKey, typeof Watch> = {
  all_signals: Cpu,
  wrist_only: Watch,
  chest_only: HeartPulse,
};

function getFeatureCategory(feature: string) {
  if (feature.startsWith("hrv") || feature.startsWith("bvp")) return { cat: "HRV", color: "hsl(4, 72%, 57%)" };
  if (feature.includes("eda")) return { cat: "EDA", color: "hsl(217, 91%, 60%)" };
  if (feature.includes("resp")) return { cat: "Respiration", color: "hsl(160, 84%, 39%)" };
  if (feature.includes("temp")) return { cat: "Temperature", color: "hsl(38, 92%, 50%)" };
  if (feature.includes("acc")) return { cat: "Accelerometer", color: "hsl(280, 60%, 55%)" };
  return { cat: "Other", color: "hsl(var(--muted-foreground))" };
}

function ConfusionMatrix({ matrix, label }: { matrix: number[][]; label: string }) {
  const labels = ["Non-Stress", "Stress"];
  const maxVal = Math.max(...matrix.flat());
  return (
    <div>
      <p className="text-xs font-medium text-center mb-2 text-muted-foreground">{label}</p>
      <div className="grid grid-cols-3 gap-0.5 text-xs max-w-[200px] mx-auto">
        <div />
        {labels.map((l) => <div key={l} className="text-center font-medium text-muted-foreground p-1">{l}</div>)}
        {matrix.map((row, ri) => (
          <>
            <div key={`l${ri}`} className="flex items-center justify-end pr-2 font-medium text-muted-foreground">{labels[ri]}</div>
            {row.map((val, ci) => {
              const intensity = val / maxVal;
              const isCorrect = ri === ci;
              return (
                <div
                  key={`${ri}-${ci}`}
                  className="aspect-square flex items-center justify-center rounded font-bold"
                  style={{
                    background: isCorrect
                      ? `hsla(160, 84%, 39%, ${0.15 + intensity * 0.6})`
                      : `hsla(4, 72%, 57%, ${0.1 + intensity * 0.4})`,
                  }}
                >
                  {val}
                </div>
              );
            })}
          </>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-1 text-[10px] text-muted-foreground">
        <span>← Predicted →</span>
      </div>
    </div>
  );
}

export default function Models() {
  const [selected, setSelected] = useState<ModelKey>("all_signals");
  const m = models[selected] as any;

  const metrics = [
    { label: "Accuracy", key: "accuracy" },
    { label: "F1 Score", key: "f1_score" },
    { label: "ROC-AUC", key: "roc_auc" },
    { label: "Features", key: "n_features" },
    { label: "Best Algorithm", key: "best_algorithm" },
  ];

  const featureData = m.feature_importance.slice(0, 15).map((f: any) => ({
    ...f,
    ...getFeatureCategory(f.feature),
  }));

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-1">Model Performance: Accessibility vs Accuracy</h1>
      <p className="text-muted-foreground mb-8">
        Three stress detection models using different sensor configurations to understand the tradeoff between accuracy and real-world deployability.
      </p>

      {/* Model selector cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {modelKeys.map((key) => {
          const mod = models[key] as any;
          const Icon = modelIcons[key];
          const isActive = key === selected;
          return (
            <motion.div key={key} whileTap={{ scale: 0.98 }}>
              <Card
                className={`cursor-pointer transition-all ${isActive ? "ring-2 ring-sky border-sky" : "hover:border-muted-foreground/30"}`}
                onClick={() => setSelected(key)}
              >
                <CardContent className="pt-6 text-center">
                  <Icon className={`h-8 w-8 mx-auto mb-2 ${isActive ? "text-sky" : "text-muted-foreground"}`} />
                  <h3 className="font-semibold text-sm">{mod.display_name}</h3>
                  <p className="text-2xl font-bold mt-1">{(mod.accuracy * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Accuracy</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Metrics comparison table */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                {modelKeys.map((k) => (
                  <TableHead key={k} className="text-center">{(models[k] as any).display_name.split(" (")[0]}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => {
                const vals = modelKeys.map((k) => (models[k] as any)[metric.key]);
                const numVals = vals.filter((v: any) => typeof v === "number") as number[];
                const best = metric.key === "n_features" ? Math.min(...numVals) : Math.max(...numVals);
                return (
                  <TableRow key={metric.key}>
                    <TableCell className="font-medium">{metric.label}</TableCell>
                    {modelKeys.map((k, i) => {
                      const val = vals[i];
                      const isBest = typeof val === "number" && val === best;
                      const display = typeof val === "number" && metric.key !== "n_features"
                        ? `${(val * 100).toFixed(1)}%`
                        : val;
                      return (
                        <TableCell key={k} className={`text-center ${isBest ? "font-bold text-emerald" : ""}`}>
                          {display}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Confusion matrices */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Confusion Matrices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modelKeys.map((k) => (
              <ConfusionMatrix
                key={k}
                matrix={(models[k] as any).confusion_matrix}
                label={(models[k] as any).display_name}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature importance */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Feature Importance — {m.display_name}</CardTitle>
          <CardDescription>Top 15 features, colored by sensor category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            {[...new Set(featureData.map((f: any) => f.cat))].map((cat: any) => {
              const c = featureData.find((f: any) => f.cat === cat);
              return (
                <div key={cat} className="flex items-center gap-1 text-xs">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c?.color }} />
                  {cat}
                </div>
              );
            })}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={featureData} layout="vertical" margin={{ left: 10, right: 10 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 10 }} width={100} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
              <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                {featureData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key insight */}
      <Card className="mb-8 border-l-4 border-l-emerald bg-emerald/5">
        <CardContent className="pt-6 flex gap-4">
          <Lightbulb className="h-6 w-6 text-emerald shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Key Insight</p>
            <p className="text-sm text-muted-foreground">
              The wrist-only model achieves {((models.wrist_only as any).accuracy * 100).toFixed(1)}% accuracy using only a consumer wearable.
              This means mass deployment through Apple Watch or Fitbit is viable, reaching millions of caregivers without clinical equipment.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Methodology Note</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-180" />
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              All models evaluated using Leave-One-Subject-Out (LOSO) cross-validation on the WESAD dataset (15 subjects).
              This ensures the model generalizes to unseen individuals, not just unseen time windows from the same subject.
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
