import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Boxes, ArrowRightLeft, ClipboardCheck, LineChart, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockSense — Real-time Inventory Management" },
      {
        name: "description",
        content:
          "Digitise receipts, deliveries, internal transfers and stock counts. StockSense keeps every warehouse location accurate in real time.",
      },
      { property: "og:title", content: "StockSense — Real-time Inventory Management" },
      {
        property: "og:description",
        content:
          "A complete inventory management system: products, warehouses, operations, stock ledger and low-stock alerts.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Boxes, title: "Product catalogue", text: "SKUs, categories, units of measure and reorder levels in one place." },
  { icon: Truck, title: "Receipts & deliveries", text: "Validate a document and stock moves automatically — never by hand." },
  { icon: ArrowRightLeft, title: "Internal transfers", text: "Move stock between racks, floors and warehouses with full traceability." },
  { icon: ClipboardCheck, title: "Stock counts", text: "Reconcile recorded quantities against physical counts in seconds." },
  { icon: LineChart, title: "Live dashboard", text: "KPIs, movement trends and low-stock alerts refreshed on every operation." },
  { icon: ShieldCheck, title: "Full audit ledger", text: "Every movement records before/after quantities, user and document." },
];

function Landing() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="brand-gradient flex h-9 w-9 items-center justify-center rounded-xl">
            <Boxes className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">StockSense</span>
        </div>
        <Button asChild variant={checking ? "ghost" : "default"}>
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        <section className="py-14 sm:py-20">
          <p className="inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            Odoo x LPU Jalandhar Hackathon 2026
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Inventory that stays{" "}
            <span className="bg-clip-text text-transparent brand-gradient">accurate by design</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            StockSense centralises every stock operation — goods in, goods out, transfers between
            locations and physical counts — and recalculates real quantities the moment a document is
            validated.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Open the dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ mode: "signup" }}>
                Create an account
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface-panel p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
