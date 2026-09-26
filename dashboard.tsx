import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/dashboard")({ component: DashboardPage });
