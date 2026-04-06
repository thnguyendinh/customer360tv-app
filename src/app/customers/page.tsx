"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Customer = {
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from("customer_360")
        .select("*")
        .order("total_watch_duration", { ascending: false })
        .limit(200);

      if (error) {
        console.error("customer_360 error:", error);
      } else {
        setCustomers((data ?? []) as Customer[]);
      }

      setLoading(false);
    }

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customers.filter((row) => {
      const kw = keyword.toLowerCase();
      return (
        row.contract?.toLowerCase().includes(kw) ||
        row.mac?.toLowerCase().includes(kw)
      );
    });
  }, [customers, keyword]);

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading customers...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
        <p className="text-slate-600">Search and browse customer profiles</p>
      </div>

      <input
        className="w-full max-w-md rounded-xl border border-slate-300 bg-white px-4 py-2 text-slate-900"
        placeholder="Search by contract or MAC"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-3">Contract</th>
              <th className="text-left p-3">MAC</th>
              <th className="text-left p-3">Active Days</th>
              <th className="text-left p-3">Total Sessions</th>
              <th className="text-left p-3">Last Active</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((row) => (
              <tr key={`${row.contract}-${row.mac}`} className="border-t">
                <td className="p-3">
                  <Link
                    href={`/customers/${row.contract}`}
                    className="text-blue-600 underline"
                  >
                    {row.contract}
                  </Link>
                </td>
                <td className="p-3">{row.mac}</td>
                <td className="p-3">{row.active_days}</td>
                <td className="p-3">{row.total_sessions}</td>
                <td className="p-3">{row.last_active_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}