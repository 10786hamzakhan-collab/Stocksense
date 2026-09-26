import { createFileRoute } from "@tanstack/react-router";
import { ReceiptsPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/receipts")({ component: ReceiptsPage });
