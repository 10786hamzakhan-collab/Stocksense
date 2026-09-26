import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/inventory-pages";
export const Route = createFileRoute("/_authenticated/profile")({ component: ProfilePage });
