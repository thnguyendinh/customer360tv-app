"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { supabase } from "@/lib/supabase";

type DailyActivity = {
  file_date: string;
  active_customers: number;
  total_sessions: number;
  total_watch_duration: number;
  avg_session_duration: number;
  active_apps: number;
};

type SegmentRow = {
  contract: string;
  segment_name: string;
  total_watch_duration: number;
};

type TopCustomer = {
  contract: string;
  mac: string;
  total_watch_duration: number;
  total_sessions: number;
  active_days: number;
  last_active_date: string;
};

export default function DashboardPage() {
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [segmentRows, setSegmentRows] = useState<SegmentRow[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchDashboard() {
    const { data: dailyData, error: dailyError } = await supabase
      .from("daily_activity")
      .select("*")
      .order("file_date", { ascending: true });

    const { data: segmentsData, error: segmentsError } = await supabase
      .from("customer_segments")
      .select("contract, segment_name, total_watch_duration");

    const { data: customerData, error: customerError } = await supabase
      .from("customer_360")
      .select("contract, mac, total_watch_duration, total_sessions, active_days, last_active_date")
      .order("total_watch_duration", { ascending: false })
      .limit(10);

    console.log("dailyData:", dailyData, "dailyError:", dailyError);
    console.log("segmentsData:", segmentsData, "segmentsError:", segmentsError);
    console.log("customerData:", customerData, "customerError:", customerError);

    if (dailyError) console.error("daily_activity error:", dailyError);
    if (segmentsError) console.error("customer_segments error:", segmentsError);
    if (customerError) console.error("customer_360 error:", customerError);

    setDailyActivity((dailyData ?? []) as DailyActivity[]);
    setSegmentRows((segmentsData ?? []) as SegmentRow[]);
    setTopCustomers((customerData ?? []) as TopCustomer[]);
    setLoading(false);
  }

  fetchDashboard();
}, []);

  const totalCustomers = segmentRows.length;
  const totalSessions = useMemo(
    () => dailyActivity.reduce((sum, row) => sum + Number(row.total_sessions || 0), 0),
    [dailyActivity]
  );
  const totalWatchDuration = useMemo(
    () => dailyActivity.reduce((sum, row) => sum + Number(row.total_watch_duration || 0), 0),
    [dailyActivity]
  );

  const segmentChartData = useMemo(() => {
    const grouped = segmentRows.reduce<Record<string, number>>((acc, row) => {
      const key = row.segment_name || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([segment_name, count]) => ({
      segment_name,
      count,
    }));
  }, [segmentRows]);

  const lineChartData = useMemo(() => {
    return dailyActivity.map((row) => ({
      file_date: row.file_date,
      active_customers: Number(row.active_customers || 0),
      total_sessions: Number(row.total_sessions || 0),
      total_watch_duration: Number(row.total_watch_duration || 0),
    }));
  }, [dailyActivity]);

  if (loading) {
    return <main className="p-6">Loading dashboard...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer 360 Dashboard</h1>
          <p className="text-gray-500">Operational analytics from Supabase</p>
        </div>

        <div className="flex gap-3">
          <Link href="/customers" className="rounded-xl border bg-white px-4 py-2">
            Customers
          </Link>
          <Link href="/segments" className="rounded-xl border bg-white px-4 py-2">
            Segments
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="mt-2 text-3xl font-semibold">{totalCustomers}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Sessions</p>
          <p className="mt-2 text-3xl font-semibold">{totalSessions}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Watch Duration</p>
          <p className="mt-2 text-3xl font-semibold">{totalWatchDuration}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Daily Activity Trend</h2>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="file_date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="active_customers"
                  name="Active Customers"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="total_sessions"
                  name="Total Sessions"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Segment Distribution</h2>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="segment_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Customers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Top Customers</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-left">Contract</th>
                <th className="p-3 text-left">MAC</th>
                <th className="p-3 text-left">Watch Duration</th>
                <th className="p-3 text-left">Sessions</th>
                <th className="p-3 text-left">Active Days</th>
                <th className="p-3 text-left">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((row) => (
                <tr key={`${row.contract}-${row.mac}`} className="border-b">
                  <td className="p-3">
                    <Link href={`/customers/${row.contract}`} className="text-blue-600 underline">
                      {row.contract}
                    </Link>
                  </td>
                  <td className="p-3">{row.mac}</td>
                  <td className="p-3">{row.total_watch_duration}</td>
                  <td className="p-3">{row.total_sessions}</td>
                  <td className="p-3">{row.active_days}</td>
                  <td className="p-3">{row.last_active_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}