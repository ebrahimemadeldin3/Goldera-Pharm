import DoctorProfile from "@/features/doctors/components/DoctorProfile";
import { getDoctorByIdAction } from "@/features/doctors/api";
import { mapToDoctorProfile } from "@/features/doctors/lib/utils/mappers";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const result = await getDoctorByIdAction(id);

  if (!result.success || !result.data?.data) {
    throw new Error(result.error?.message || "Failed to fetch doctor");
    //@ TOTO not found
  }

  const doctor = mapToDoctorProfile(result.data.data);

  return <DoctorProfile doctor={doctor} />;
}
