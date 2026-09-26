import { createFileRoute } from "@tanstack/react-router";
import { WarehousesPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/warehouses")({ component: WarehousesPage });
