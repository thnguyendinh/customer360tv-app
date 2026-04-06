"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { supabase } from "@/lib/supabase";

type Customer360 = {
  contract: string;
  mac: string;
  total_watch_duration: number;
  avg_session_duration: number;
  active_days: number;
  last_active_date: string;
  first_active_date: string;
  total_sessions: number;
  avg_daily_duration: number;
  channels_used_text: string;
};

type AppUsage = {
  app_name: string;
  session_count: number;
  total_watch_duration: number;
  avg_session_duration: number;
  last_active_date: string;
};

export default function CustomerDetailPage() {
  const params = useParams<{ contract: string }>();
  const contract = Array.isArray(params.contract) ? params.contract[0] : params.contract;

  const [customer, setCustomer] = useState<Customer360 | null>(null);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([]);
  const [segment, setSegment] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!contract) return;

      const { data: customerRows, error: customerError } = await supabase
        .from("customer_360")
        .select("*")
        .eq("contract", contract)
        .order("total_watch_duration", { ascending: false });

      const { data: usageData, error: usageError } = await supabase
        .from("customer_app_usage")
        .select("*")
        .eq("contract", contract)
        .order("total_watch_duration", { ascending: false });

      const { data: segmentRows, error: segmentError } = await supabase
        .from("customer_segments")
        .select("segment_name")
        .eq("contract", contract);

      if (customerError) console.error("customer detail error:", customerError);
      if (usageError) console.error("app usage error:", usageError);
      if (segmentError) console.error("segment error:", segmentError);

      const selectedCustomer =
        customerRows && customerRows.length > 0 ? customerRows[0] : null;

      setCustomer(selectedCustomer as Customer360 | null);
      setAppUsage((usageData ?? []) as AppUsage[]);
      setSegment(
        segmentRows && segmentRows.length > 0 ? segmentRows[0].segment_name : ""
      );
      setLoading(false);
    }

    fetchDetail();
  }, [contract]);

  const chartData = useMemo(() => {
    return appUsage.slice(0, 8).map((row) => ({
      app_name: row.app_name,
      total_watch_duration: Number(row.total_watch_duration || 0),
      session_count: Number(row.session_count || 0),
    }));
  }, [appUsage]);

  const channels = useMemo(() => {
    if (!customer?.channels_used_text) return [];
    return customer.channels_used_text
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [customer]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading customer detail...</main>;
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 space-y-4">
        <p className="text-slate-800">Customer not found.</p>
        <Link href="/customers" className="text-blue-600 underline">
          Back to Customers
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer 360</h1>
          <p className="text-slate-600">Customer profile and usage analytics</p>
        </div>

        <Link
          href="/customers"
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-800 hover:bg-slate-100"
        >
          Back to Customers
        </Link>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Customer Profile</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Contract</p>
              <p className="text-lg font-semibold text-slate-900">{customer.contract}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">MAC</p>
              <p className="text-lg font-semibold text-slate-900 break-all">{customer.mac}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Segment</p>
              <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-sm font-medium text-white">
                {segment || "N/A"}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-2">Channels Used</p>
              <div className="flex flex-wrap gap-2">
                {channels.length > 0 ? (
                  channels.map((channel) => (
                    <span
                      key={channel}
                      className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-800"
                    >
                      {channel}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500">No channels</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Active Days</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{customer.active_days}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Sessions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{customer.total_sessions}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Avg Daily Duration</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{customer.avg_daily_duration}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Last Active</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{customer.last_active_date}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">Top App Usage</h2>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="app_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_watch_duration" name="Watch Duration" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">App Usage Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="p-3 text-left">App</th>
                    <th className="p-3 text-left">Sessions</th>
                    <th className="p-3 text-left">Watch Duration</th>
                    <th className="p-3 text-left">Avg Session Duration</th>
                    <th className="p-3 text-left">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {appUsage.map((row) => (
                    <tr key={`${row.app_name}-${row.last_active_date}`} className="border-b">
                      <td className="p-3">{row.app_name}</td>
                      <td className="p-3">{row.session_count}</td>
                      <td className="p-3">{row.total_watch_duration}</td>
                      <td className="p-3">{row.avg_session_duration}</td>
                      <td className="p-3">{row.last_active_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}