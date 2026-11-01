import type { Metadata } from "next";
import JourneyManager from "./JourneyManager";
import "./manage.css";

export const metadata: Metadata = {
  title: "Our Private Planner — Dimas & Anita",
  description: "Ruang privat untuk merencanakan destinasi dan berbagi cerita.",
};

export const dynamic = "force-dynamic";

export default function ManagePage() {
  return <JourneyManager />;
}
