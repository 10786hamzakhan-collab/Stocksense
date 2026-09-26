import { createFileRoute } from "@tanstack/react-router";
import { TransfersPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/transfers")({ component: TransfersPage });
