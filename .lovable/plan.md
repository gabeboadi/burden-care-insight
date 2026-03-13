

# "The Invisible Burden Tracker" — Full Implementation Plan

A 5-page caregiver health monitoring dashboard built with React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, and Framer Motion.

## Step 1: Foundation Setup
- Install `framer-motion` dependency
- Copy all 5 uploaded JSON data files into `src/data/`
- Update design system colors in `index.css` (navy primary, coral/amber/emerald/sky accents)
- Add custom animations (counter, pulse, fade) to `tailwind.config.ts`

## Step 2: Navigation & Layout
- Create a responsive top nav bar with "The Invisible Burden Tracker" logo and 5 page links (Home, Dashboard, Models, Population, About)
- Mobile hamburger menu using Sheet component
- Layout wrapper with Framer Motion page transitions
- Update `App.tsx` with all 5 routes

## Step 3: Landing Page (`/`)
- Navy gradient hero with title, subtitle about 53M caregivers
- Three animated counter cards (53M, $600B, 2-3x) that count up on scroll
- "How It Works" 4-step flow with icons (Monitoring → AI Analysis → Health Scoring → Briefings)
- Impact quote section with CTA to dashboard

## Step 4: Individual Dashboard (`/dashboard`)
- Caregiver persona selector dropdown (6 profiles)
- **Left column**: Circular health score gauge (0-100, color-coded), 12-week multi-line trend chart (health score, stress, HRV), real-time animated signal visualization (HR, EDA, stress probability) using requestAnimationFrame with LIVE indicator
- **Right column**: Profile card with avatar/stats, AI weekly briefing card with severity badge and recommended actions, "Generate New Briefing" button with loading simulation, 2×3 weekly metrics grid with sparklines

## Step 5: Model Comparison (`/models`)
- Three toggle cards for model selection (All Signals, Wrist Only, Chest Only)
- Side-by-side metrics comparison table with best values highlighted green
- Confusion matrix heatmaps for each model
- Horizontal bar chart of top 15 feature importances color-coded by category
- Key insight callout about wrist-only viability
- Expandable methodology note

## Step 6: Population Dashboard (`/population`)
- 4 KPI summary cards (monitored count, at-risk %, avg score, savings)
- Regional visualization with colored circles sized by caregiver count
- Demographic and caregiving-type breakdown bar charts
- **Interactive "What If" slider**: drag 0-100% to dynamically update projected impact numbers
- National context statistics card

## Step 7: About Page (`/about`)
- Project overview (UW MSIS 522)
- Visual technical pipeline diagram (WESAD → Processing → ML → Scores → LLM)
- Dataset info, key innovations list
- Team placeholder section and references

## Cross-Cutting Concerns
- Framer Motion page transitions and micro-animations throughout
- Skeleton loaders for charts during data loading
- Fully responsive (2-col → 1-col on mobile)
- ARIA labels on all visualizations
- Print-friendly styles on population dashboard

