import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Database, Brain, BarChart3, FileText, Cpu, Sparkles } from "lucide-react";

const pipelineSteps = [
  { icon: Database, label: "WESAD Data", desc: "15 subjects, chest + wrist sensors", color: "bg-sky/10 text-sky" },
  { icon: Cpu, label: "Signal Processing", desc: "Filtering, segmentation, normalization", color: "bg-amber/10 text-amber" },
  { icon: BarChart3, label: "Feature Extraction", desc: "25+ physiological features", color: "bg-emerald/10 text-emerald" },
  { icon: Brain, label: "ML Models", desc: "RF, XGBoost, Logistic Regression", color: "bg-coral/10 text-coral" },
  { icon: BarChart3, label: "Stress Scores", desc: "Continuous probability output", color: "bg-sky/10 text-sky" },
  { icon: Sparkles, label: "LLM Briefings", desc: "Empathetic health narratives", color: "bg-amber/10 text-amber" },
];

const innovations = [
  "Three-model comparison evaluating accessibility vs accuracy tradeoff",
  "Simulated longitudinal caregiving trajectories from acute laboratory data",
  "Empathetic AI-generated health narratives with actionable micro-interventions",
  "Policy-level impact quantification with interactive scenario modeling",
  "Real-time signal visualization demonstrating continuous monitoring capability",
];

const references = [
  {
    title: "WESAD: Wearable Stress and Affect Detection",
    authors: "Schmidt, P., Reiss, A., Duerichen, R., Marberger, C., & Van Laerhoven, K.",
    venue: "Proceedings of ICMI 2018",
  },
  {
    title: "Caregiving in the U.S. 2020",
    authors: "AARP and National Alliance for Caregiving",
    venue: "AARP Public Policy Institute, 2020",
  },
  {
    title: "The Impact of Caregiving on Health and Health Care Utilization",
    authors: "Chari, A. V., Engberg, J., Ray, K. N., & Mehrotra, A.",
    venue: "Health Affairs, 34(10), 2015",
  },
];

export default function About() {
  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">About The Invisible Burden Tracker</h1>
      <p className="text-muted-foreground mb-8">
        University of Washington · MSIS 522 — Team 5 Purple (Taashi, Mirell, Priyanka, Gabriel)
      </p>

      {/* Project overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Project Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            The Invisible Burden Tracker is a caregiver health monitoring platform that combines wearable sensor data
            with machine learning to detect stress and prevent burnout among the 53 million Americans providing unpaid care.
          </p>
          <p>
            Using physiological signals — heart rate variability, electrodermal activity, skin temperature, and movement patterns —
            our models identify stress states that are invisible to the naked eye and often go unnoticed until
            caregivers reach crisis point.
          </p>
          <p>
            The platform translates raw physiological data into personalized health scores, trend visualizations,
            and AI-generated weekly briefings that provide actionable micro-interventions with warmth and clinical rigor.
          </p>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Technical Pipeline</CardTitle>
          <CardDescription>End-to-end flow from raw sensor data to health narratives</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pipelineSteps.map((step, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${step.color}`}>
                  <step.icon className="h-4 w-4" />
                  <div>
                    <p className="text-xs font-semibold">{step.label}</p>
                    <p className="text-[10px] opacity-70">{step.desc}</p>
                  </div>
                </div>
                {i < pipelineSteps.length - 1 && (
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dataset */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Dataset</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>WESAD</strong> — Wearable Stress and Affect Detection</p>
          <p>15 subjects wore both a RespiBAN chest sensor and an Empatica E4 wrist device during controlled stress protocols (Trier Social Stress Test).</p>
          <p>Signals captured: ECG, EDA, EMG, respiration, temperature, and 3-axis accelerometry at multiple sampling rates.</p>
        </CardContent>
      </Card>

      {/* Key innovations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Key Innovations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {innovations.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">Team</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">University of Washington MSIS 522 — Team 5 Purple (Taashi, Mirell, Priyanka, Gabriel)</p>
          <p>Built with Python, scikit-learn, XGBoost, React, TypeScript, and Claude AI.</p>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">References</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {references.map((ref, i) => (
            <div key={i} className="text-sm">
              <p className="font-medium">{ref.title}</p>
              <p className="text-muted-foreground">{ref.authors}</p>
              <p className="text-xs text-muted-foreground italic">{ref.venue}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
