import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Activity, Brain, BarChart3, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function AnimatedCounter({ end, prefix = "", suffix = "", duration = 2000 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-bold text-primary-foreground">
      {prefix}{count}{suffix}
    </div>
  );
}

const steps = [
  { icon: Activity, title: "Continuous Monitoring", desc: "Wearable sensors track heart rate, skin conductance, temperature, and activity 24/7" },
  { icon: Brain, title: "AI Analysis", desc: "Machine learning models trained on clinical physiological data detect stress patterns invisible to the naked eye" },
  { icon: BarChart3, title: "Health Scoring", desc: "Personalized health scores quantify caregiver burden over time, catching gradual decline early" },
  { icon: Heart, title: "Empathetic Briefings", desc: "AI-generated weekly narratives provide actionable micro-interventions with warmth and understanding" },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-hero text-primary-foreground py-24 md:py-32">
        <div className="container text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            The Invisible Burden Tracker
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl max-w-3xl mx-auto mb-12 text-primary-foreground/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            53 million Americans provide unpaid caregiving. Their health deteriorates in silence. We're changing that.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {[
              { end: 53, suffix: "M", label: "Unpaid Caregivers in the US" },
              { end: 600, prefix: "$", suffix: "B", label: "Annual Economic Value of Unpaid Care" },
              { end: 3, prefix: "2-", suffix: "x", label: "Higher Rate of Depression & Chronic Disease" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <Card className="bg-primary-foreground/10 border-primary-foreground/20 backdrop-blur-sm">
                  <CardContent className="pt-6 text-center">
                    <AnimatedCounter end={item.end} prefix={item.prefix} suffix={item.suffix} />
                    <p className="mt-2 text-sm text-primary-foreground/70">{item.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button asChild size="lg" className="bg-coral text-coral-foreground hover:bg-coral/90 text-base px-8">
              <Link to="/dashboard">
                Explore the Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From wearable data to actionable health insights in four steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full text-center border-t-4 border-t-sky">
                  <CardContent className="pt-8 pb-6">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sky/10">
                      <step.icon className="h-7 w-7 text-sky" />
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 bg-muted">
        <div className="container max-w-3xl text-center">
          <motion.blockquote
            className="text-xl md:text-2xl font-medium italic text-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            "Early intervention for caregiver burnout saves an estimated $7,500 per caregiver per year in avoided healthcare costs."
          </motion.blockquote>
          <p className="text-sm text-muted-foreground mb-8">— Chari et al., Health Affairs 2015</p>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">
              See Individual Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
