import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { try { return NextResponse.json(getDashboardData()); } catch (e:any) { return NextResponse.json({error:e.message},{status:500}); } }
