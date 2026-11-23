import DecisionDashboard from "@/components/DecisionDashboard";
import { getDashboardData } from "@/lib/data";
export const dynamic = "force-dynamic";
export default function Home() { const data = getDashboardData(); return <DecisionDashboard data={data} />; }
