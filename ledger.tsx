import { createFileRoute } from "@tanstack/react-router";
import { LedgerPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/ledger")({ component: LedgerPage });
