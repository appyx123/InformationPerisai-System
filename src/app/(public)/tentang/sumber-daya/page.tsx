import type { Metadata } from "next";
import { SumberDayaView } from "./SumberDayaView";
import { getPublicActiveMembers } from "@/features/members/queries.public";
import { getPublicDepartments } from "@/features/departments/queries.public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Sumber Daya & Fungsionaris — UKM PERISAI UMI",
  description:
    "Formasi hierarki kepengurusan, dewan pembina, pengurus harian, kepala departemen, staf ahli, dan 6 departemen pergerakan riset UKM PERISAI Universitas Muslim Indonesia.",
};

export default async function SumberDayaPage() {
  const [members, departments] = await Promise.all([
    getPublicActiveMembers(),
    getPublicDepartments(),
  ]);

  return <SumberDayaView members={members} departments={departments} />;
}
