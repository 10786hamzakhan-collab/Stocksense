import { createFileRoute } from "@tanstack/react-router";
import { AdjustmentsPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/adjustments")({ component: AdjustmentsPage });
