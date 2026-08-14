interface RequestStatusCardsProps {
  pending: number;
  approved: number;
  rejected: number;
}

export default function RequestStatusCards({
  pending,
  approved,
  rejected,
}: RequestStatusCardsProps) {
  return (
    <div className="*:bg-secondary-very-light *:border-secondary-light *:text-secondary-dark flex w-full max-w-75 flex-col gap-6 *:flex *:flex-col *:gap-2 *:rounded-md *:border *:p-8 *:text-base/6 *:font-normal">
      <p className="">
        Pending Request
        <span className="text-dashboard-orange text-base/6 font-medium">
          {pending}
        </span>
      </p>
      <p className="">
        Approved Request
        <span className="text-dashboard-green text-base/6 font-medium">
          {approved}
        </span>
      </p>
      <p className="">
        Rejected Request
        <span className="text-dashboard-red text-base/6 font-medium">
          {rejected}
        </span>
      </p>
    </div>
  );
}
