import { createFileRoute } from "@tanstack/react-router";
import { DeliveriesPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/deliveries")({ component: DeliveriesPage });
