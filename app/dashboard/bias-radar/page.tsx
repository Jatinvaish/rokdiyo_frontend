
"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { Download, Filter, CheckCircle2, AlertTriangle } from "lucide-react";
import DynamicSummaryCards, { SummaryCardData } from "@/components/dynamicSummaryCard";

type SliceKey =
  | "age"
  | "sex"
  | "raceEthnicity"
  | "state"
  | "lob"
  | "providerSpecialty";

type FairnessRow = {
  group: string;
  air: number; // adverse impact ratio (e.g., denial rate ratio vs reference)
  humanOverrideRate: number; // %
  appealReversalRate: number; // %
};

const modelOptions = [
  {
    id: "priorauth-denial-assist-v3",
    name: "PriorAuth Denial Assist v3",
    label: "PA / UM denial recommendation model"
  },
  {
    id: "auto-adjudication-v2",
    name: "Auto-Adjudication v2",
    label: "Low-risk claims straight-through processing"
  },
  {
    id: "siu-triage-v1",
    name: "SIU Triage v1",
    label: "Fraud/Waste/Abuse triage model (non-denial)"
  }
] as const;

const sliceOptions: Array<{ key: SliceKey; label: string }> = [
  { key: "age", label: "Age Band" },
  { key: "sex", label: "Sex" },
  { key: "raceEthnicity", label: "Race / Ethnicity" },
  { key: "state", label: "State" },
  { key: "lob", label: "Line of Business" },
  { key: "providerSpecialty", label: "Provider Specialty" }
];

const fairnessThresholds = {
  airMin: 0.8,
  airMax: 1.25
};

const bySlice: Record<SliceKey, FairnessRow[]> = {
  age: [
    { group: "0–17", air: 1.18, humanOverrideRate: 4.1, appealReversalRate: 1.7 },
    { group: "18–34", air: 0.96, humanOverrideRate: 3.2, appealReversalRate: 1.1 },
    { group: "35–49", air: 1.03, humanOverrideRate: 3.5, appealReversalRate: 1.2 },
    { group: "50–64", air: 1.09, humanOverrideRate: 3.9, appealReversalRate: 1.5 },
    { group: "65+", air: 1.22, humanOverrideRate: 5.0, appealReversalRate: 2.3 }
  ],
  sex: [
    { group: "Female", air: 1.04, humanOverrideRate: 3.6, appealReversalRate: 1.3 },
    { group: "Male", air: 0.98, humanOverrideRate: 3.4, appealReversalRate: 1.2 },
    { group: "Unknown/Other", air: 1.27, humanOverrideRate: 6.4, appealReversalRate: 3.0 }
  ],
  raceEthnicity: [
    { group: "Asian", air: 0.92, humanOverrideRate: 3.1, appealReversalRate: 1.0 },
    { group: "Black", air: 1.19, humanOverrideRate: 4.8, appealReversalRate: 2.1 },
    { group: "Hispanic", air: 1.12, humanOverrideRate: 4.1, appealReversalRate: 1.8 },
    { group: "White", air: 1.00, humanOverrideRate: 3.4, appealReversalRate: 1.2 },
    { group: "Other/Unknown", air: 1.28, humanOverrideRate: 6.8, appealReversalRate: 3.4 }
  ],
  state: [
    { group: "CA", air: 1.06, humanOverrideRate: 3.9, appealReversalRate: 1.5 },
    { group: "CO", air: 1.11, humanOverrideRate: 4.2, appealReversalRate: 1.9 },
    { group: "NY", air: 1.03, humanOverrideRate: 3.6, appealReversalRate: 1.3 },
    { group: "TX", air: 0.95, humanOverrideRate: 3.1, appealReversalRate: 1.0 },
    { group: "Other (18)", air: 1.08, humanOverrideRate: 3.7, appealReversalRate: 1.4 }
  ],
  lob: [
    { group: "Medicare Advantage", air: 1.17, humanOverrideRate: 4.7, appealReversalRate: 2.2 },
    { group: "Commercial", air: 0.99, humanOverrideRate: 3.3, appealReversalRate: 1.1 },
    { group: "Medicaid", air: 1.10, humanOverrideRate: 4.0, appealReversalRate: 1.7 },
    { group: "Exchange", air: 1.05, humanOverrideRate: 3.8, appealReversalRate: 1.4 }
  ],
  providerSpecialty: [
    { group: "Primary Care", air: 1.02, humanOverrideRate: 3.4, appealReversalRate: 1.2 },
    { group: "Ortho", air: 1.14, humanOverrideRate: 4.3, appealReversalRate: 1.9 },
    { group: "Cardiology", air: 0.93, humanOverrideRate: 3.0, appealReversalRate: 0.9 },
    { group: "Oncology", air: 1.20, humanOverrideRate: 5.2, appealReversalRate: 2.6 },
    { group: "Behavioral Health", air: 1.26, humanOverrideRate: 6.1, appealReversalRate: 3.2 }
  ]
};

const chartConfig = {
  air: { label: "Adverse Impact Ratio (AIR)", color: "#3b82f6" },
  humanOverrideRate: { label: "Human Override Rate", color: "#22c55e" },
  appealReversalRate: { label: "Appeal Reversal Rate", color: "#f59e0b" }
} satisfies ChartConfig;

function isAirInRange(air: number) {
  return air >= fairnessThresholds.airMin && air <= fairnessThresholds.airMax;
}

function riskBucket(air: number) {
  // A simple operationalization: out-of-range = higher compliance risk
  if (air < fairnessThresholds.airMin || air > fairnessThresholds.airMax) return "High";
  if (air < 0.9 || air > 1.15) return "Medium";
  return "Low";
}

export default function BiasRadarPage() {
  const [selectedModel, setSelectedModel] = useState<string>(modelOptions[0].id);
  const [selectedSlice, setSelectedSlice] = useState<SliceKey>("age");

  const rows = useMemo(() => bySlice[selectedSlice], [selectedSlice]);

  const summary = useMemo(() => {
    const total = rows.length;
    const inRange = rows.filter(r => isAirInRange(r.air)).length;
    const alerts = total - inRange;

    // Simple “score”: center on 100, subtract for AIR deviations
    const avgDeviation =
      rows.reduce((acc, r) => acc + Math.abs(1 - r.air), 0) / Math.max(total, 1);
    const fairnessScore = Math.max(0, Math.min(100, 100 - avgDeviation * 120));

    const avgOverride =
      rows.reduce((acc, r) => acc + r.humanOverrideRate, 0) / Math.max(total, 1);
    const avgAppeal =
      rows.reduce((acc, r) => acc + r.appealReversalRate, 0) / Math.max(total, 1);

    return {
      fairnessScore,
      inRange,
      total,
      alerts,
      avgOverride,
      avgAppeal
    };
  }, [rows]);

  const riskDistribution = useMemo(() => {
    const buckets = rows.map(r => riskBucket(r.air));
    const low = buckets.filter(b => b === "Low").length;
    const medium = buckets.filter(b => b === "Medium").length;
    const high = buckets.filter(b => b === "High").length;

    return [
      { name: "Low Risk", value: low, fill: "#22c55e" },
      { name: "Medium Risk", value: medium, fill: "#eab308" },
      { name: "High Risk", value: high, fill: "#ef4444" }
    ];
  }, [rows]);

  const radarData = useMemo(() => {
    // A compact radar view across key governance dimensions (still “radiology-style”)
    // Values are in “% compliance/health” space for visualization (not claiming real accuracy).
    const base = [
      { category: "AIR Range", value: (summary.inRange / summary.total) * 100, threshold: 90 },
      { category: "Human Review", value: 100 - Math.min(15, summary.avgOverride * 2), threshold: 90 },
      { category: "Appeals", value: 100 - Math.min(20, summary.avgAppeal * 3), threshold: 90 },
      { category: "Audit Trail", value: 96, threshold: 90 },
      { category: "Explainability", value: 92, threshold: 90 },
      { category: "Privacy", value: 95, threshold: 90 }
    ];
    return base.map(x => ({
      category: x.category,
      parity: Math.round(x.value * 10) / 10,
      threshold: x.threshold
    }));
  }, [summary]);

  const summaryCards: SummaryCardData[] = [
    {
      title: "Overall Fairness Score",
      value: Math.round(summary.fairnessScore * 10) / 10,
      changeValue: 1.1,
      icon: "checkCircle",
      bgColor: "green",
      suffix: "%",
      changeLabel: "vs last validation run"
    },
    {
      title: "Groups in AIR Range",
      value: summary.inRange,
      changeValue: 0,
      icon: "users",
      bgColor: "blue",
      changeLabel: `${Math.round((summary.inRange / summary.total) * 100)}% meeting AIR ${fairnessThresholds.airMin}–${fairnessThresholds.airMax}`
    },
    {
      title: "Disparity Alerts",
      value: summary.alerts,
      changeValue: 0,
      icon: "alertCircle",
      bgColor: "yellow",
      changeLabel: "Out-of-range AIR requires mitigation"
    }
  ];

  const modelMeta = useMemo(() => {
    const m = modelOptions.find(x => x.id === selectedModel) ?? modelOptions[0];
    return {
      name: m.name,
      label: m.label,
      // Dummy governance tags to align with your narrative
      tags: [
        { text: "Human-in-the-loop for denials", ok: true },
        { text: "Quantitative fairness testing", ok: true },
        { text: "Patient-friendly explanation available (CA)", ok: true },
        { text: "Third-party vendor audit package", ok: selectedModel !== "siu-triage-v1" }
      ]
    };
  }, [selectedModel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Disparate Impact & Bias Radar</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Quantitative fairness testing for payer AI: AIR thresholds, override patterns, and appeal reversals.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Model governance tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Applied Model Governance Snapshot</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {modelMeta.name} — {modelMeta.label}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {modelMeta.tags.map((t, idx) => (
              <Badge
                key={idx}
                className={t.ok ? "bg-green-500" : ""}
                variant={t.ok ? "default" : "destructive"}>
                {t.ok ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                {t.text}
              </Badge>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs sm:text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">AIR policy</p>
              <p className="font-medium mt-1">
                {fairnessThresholds.airMin}–{fairnessThresholds.airMax} (flag outside range)
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Protected slices</p>
              <p className="font-medium mt-1">Age, Sex, Race/Ethnicity + Operational slices</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Evidence artifacts</p>
              <p className="font-medium mt-1">Validation report + audit log export</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <DynamicSummaryCards cards={summaryCards} />

      {/* Slice selector + charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Radar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Governance Radar</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Snapshot across fairness + oversight + documentation controls
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 w-fit">
                  <Filter className="h-3 w-3 mr-1" />
                  Quantitative testing
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ChartContainer config={{}} className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar
                    name="Current"
                    dataKey="parity"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Threshold"
                    dataKey="threshold"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.15}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Strength</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Most slices remain within AIR range and show low appeal reversal signals.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 sm:p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">Watchlist</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Out-of-range AIR groups should trigger mitigation + documented remediation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Risk distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Risk Distribution</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Based on AIR deviation</p>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={
                {
                  low: { label: "Low", color: "#22c55e" },
                  medium: { label: "Medium", color: "#eab308" },
                  high: { label: "High", color: "#ef4444" }
                } satisfies ChartConfig
              }
              className="mx-auto aspect-square max-h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={riskDistribution} dataKey="value" nameKey="name" innerRadius={55} strokeWidth={5}>
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="mt-4 grid gap-2 text-xs sm:text-sm">
              {riskDistribution.map((d, idx) => (
                <div key={idx} className="bg-muted flex items-center justify-between rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-muted-foreground">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Slice detail table + bar chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Slice-Level Quantitative Testing</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                AIR + operational safety signals (override & appeal reversals)
              </p>
            </div>

            <Select value={selectedSlice} onValueChange={v => setSelectedSlice(v as SliceKey)}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sliceOptions.map(s => (
                  <SelectItem key={s.key} value={s.key}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <ChartContainer config={chartConfig} className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 1.6]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="group" width={120} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="air" fill="var(--color-air)" name="AIR" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <div className="rounded-lg border overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Group</th>
                  <th className="text-left p-3 font-medium">AIR</th>
                  <th className="text-left p-3 font-medium">Override Rate</th>
                  <th className="text-left p-3 font-medium">Appeal Reversal</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const ok = isAirInRange(r.air);
                  return (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{r.group}</td>
                      <td className="p-3 font-medium">{r.air.toFixed(2)}</td>
                      <td className="p-3">{r.humanOverrideRate.toFixed(1)}%</td>
                      <td className="p-3">{r.appealReversalRate.toFixed(1)}%</td>
                      <td className="p-3">
                        {ok ? (
                          <Badge className="bg-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            In range
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Out of range
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs sm:text-sm">
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Mitigation guidance</p>
              <p className="font-medium mt-1">
                Rebalance training / recalibrate thresholds + document remediation.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Human oversight requirement</p>
              <p className="font-medium mt-1">
                Denials must be physician-reviewed where required; log “time on task”.
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-muted-foreground">Auditability</p>
              <p className="font-medium mt-1">
                Exportable audit trail: inputs, outputs, overrides, and patient-facing rationale.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}