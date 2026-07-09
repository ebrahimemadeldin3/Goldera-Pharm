import DoctorProfile from "@/features/doctors/components/DoctorProfile";
import { getDoctorByIdAction } from "@/features/doctors/api";
import { mapToDoctorProfile } from "@/features/doctors/lib/utils/mappers";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const result = await getDoctorByIdAction(id);

  if (!result.success || !result.data?.data) {
    notFound();
  }

  const doctor = mapToDoctorProfile(result.data.data);

  return <DoctorProfile doctor={doctor} />;
}
