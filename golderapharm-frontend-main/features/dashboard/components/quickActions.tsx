"use client";

import Image from "next/image";
import Link from "next/link";

import zapIcon from "@/features/dashboard/assets/icons/quickActions/zap.svg";
import { useRoleUI } from "@/core/ui/role-ui-context";

export default function QuickActions() {
  const { quickActions } = useRoleUI();

  return (
    <aside className="border-secondary-light rounded-[25px] border bg-white p-6 min-[1440px]:w-[345px]!">
      <div className="flex items-center gap-3 px-1 pb-3">
        <div className="bg-system-primary flex size-11 items-center justify-center rounded-[15px]">
          <Image src={zapIcon} alt="quick actions" width={24} height={24} />
        </div>
        <h4 className="text-[20px] font-semibold">Quick Actions</h4>
      </div>

      <ul className="mt-3 flex flex-col gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link
                href={action.href}
                className="border-secondary-light hover:border-system-primary flex w-full cursor-pointer items-center gap-4 rounded-[14px] border bg-white px-4 py-3 text-left transition duration-200 hover:border"
              >
                <div className="border-system-primary flex size-10 items-center justify-center rounded-[14px] border bg-transparent">
                  <Icon size={20} className="text-system-primary" />
                </div>

                <div className="flex-1">
                  <div className="text-[17px]">{action.title}</div>
                  <div className="text-secondary-dark mt-1 text-[15px]">
                    {action.desc}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
