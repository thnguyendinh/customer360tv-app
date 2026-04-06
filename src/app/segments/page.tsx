"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SegmentRow = {
  contract: string;
  mac: string;
  segment_name: string;
  active_days: number;
  total_sessions: number;
  total_watch_duration: number;
};

export default function SegmentsPage() {
  const [rows, setRows] = useState<SegmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSegments() {
      const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .order("total_watch_duration", { ascending: false })
        .limit(200);

      if (error) {
        console.error("customer_segments error:", error);
      } else {
        setRows((data ?? []) as SegmentRow[]);
      }

      setLoading(false);
    }

    fetchSegments();
  }, []);

  const grouped = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      const key = row.segment_name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading segments...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Segments</h1>
        <p className="text-slate-600">Customer segmentation overview</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Segment Summary</h2>
        <div className="space-y-2">
          {Object.entries(grouped).map(([name, count]) => (
            <div key={name} className="flex items-center justify-between border-b pb-2">
              <span>{name}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Customer Segment List</h2>
        <div className="space-y-2">
          {rows.map((row) => (
            <div
              key={`${row.contract}-${row.mac}`}
              className="flex items-center justify-between border-b pb-2"
            >
              <span>{row.contract}</span>
              <span>{row.segment_name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}