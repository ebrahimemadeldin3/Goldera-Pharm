// "use client";

// import { useState, useTransition } from "react";
// import { User } from "@/features/team/lib/types";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Users } from "lucide-react";
// import { toast } from "@/lib/utils/toast";
// import { toggleHRMemberAction } from "../api";

// type AddMemberDialogProps = {
//   allMembers: User[];
// };

// export function AddMemberDialog({ allMembers }: AddMemberDialogProps) {
//   const [open, setOpen] = useState(false);
//   const [isPending, startTransition] = useTransition();
//   const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

//   const handleToggle = (userId: string, userName: string, isInHR: boolean) => {
//     setPendingIds((prev) => new Set(prev).add(userId));

//     startTransition(async () => {
//       try {
//         const result = await toggleHRMemberAction(userId, !isInHR);

//         if (result.success) {
//           toast.success({
//             title: isInHR ? "Member removed" : "Member added",
//             description: `${userName} ${isInHR ? "removed from" : "added to"} HR management system`,
//           });
//         } else {
//           toast.error({
//             title: "Operation failed",
//             description: result.error?.message || "Please try again",
//           });
//         }
//       } catch {
//         toast.error({
//           title: "An error occurred",
//           description: "Please try again later",
//         });
//       } finally {
//         setPendingIds((prev) => {
//           const next = new Set(prev);
//           next.delete(userId);
//           return next;
//         });
//       }
//     });
//   };

//   return (
//     <Dialog open={open} onOpenChange={setOpen}>
//       <DialogTrigger asChild>
//         <Button className="button-system-gradient-primary ml-auto">
//           <Users className="h-4 w-4" />
//           Add Member
//         </Button>
//       </DialogTrigger>
//       <DialogContent className="max-h-[80vh] min-w-fit overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Manage HR Members</DialogTitle>
//           <DialogDescription>
//             Add or remove team members from the HR management system
//           </DialogDescription>
//         </DialogHeader>
//         <div className="mt-4 flex space-x-6">
//           <div>
//             <h3 className="mb-3 text-lg font-semibold text-black">
//               Supervisors
//             </h3>
//             <div className="space-y-2">
//               {allMembers
//                 .filter((m) => m.role === "SUPERVISOR")
//                 .map((member) => (
//                   <div
//                     key={member.id}
//                     className="border-dashboard-blue flex items-center justify-between gap-5 rounded-lg border p-3"
//                   >
//                     <div className="flex-1">
//                       <p className="font-medium text-black">{member.name}</p>
//                       <p className="text-secondary-dark text-sm">
//                         {member.email}
//                       </p>
//                     </div>
//                     <Switch
//                       className="cursor-pointer"
//                       checked={member.inHR || false}
//                       disabled={pendingIds.has(member.id) || isPending}
//                       onCheckedChange={() =>
//                         handleToggle(
//                           member.id,
//                           member.name,
//                           member.inHR || false,
//                         )
//                       }
//                     />
//                   </div>
//                 ))}
//             </div>
//           </div>
//           <div>
//             <h3 className="mb-3 text-lg font-semibold text-black">
//               Medical Representatives
//             </h3>
//             <div className="space-y-2">
//               {allMembers
//                 .filter((m) => m.role === "MEDICAL_REP")
//                 .map((member) => (
//                   <div
//                     key={member.id}
//                     className="border-dashboard-green flex items-center justify-between gap-5 rounded-lg border p-3"
//                   >
//                     <div className="flex-1">
//                       <p className="font-medium text-black">{member.name}</p>
//                       <p className="text-secondary-dark text-sm">
//                         {member.email}
//                       </p>
//                     </div>
//                     <Switch
//                       className="cursor-pointer"
//                       checked={member.inHR || false}
//                       disabled={pendingIds.has(member.id) || isPending}
//                       onCheckedChange={() =>
//                         handleToggle(
//                           member.id,
//                           member.name,
//                           member.inHR || false,
//                         )
//                       }
//                     />
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
