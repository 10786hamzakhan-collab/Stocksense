import { createFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/products")({ component: ProductsPage });
