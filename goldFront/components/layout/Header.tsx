"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import Notifications from "./Notifications";
import { SidebarMenu } from "@/components/layout/sidebar/sidebar-menu";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { SafeCldImage } from "@/components/ui/safe-cld-image";

const Header = () => {
  const { user } = useRoleUI();

  return (
    <header className="sticky top-0 z-50 mx-auto flex h-[82px] items-center justify-between border-b bg-white px-10 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.25)] min-[1440px]:w-[1440px]! lg:mx-0! lg:w-5xl">
      <SidebarMenu />
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logos/logo.webp"
          alt="GolderaPharm"
          width={35}
          height={40}
        />
        <span className="text-gold text-[17px] font-normal">GolderaPharm</span>
      </Link>
      <div className="relative">
        <Search
          size={24}
          className="text-secondary-dark absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search doctors, reps, regions..."
          className="border-secondary-light bg-secondary-very-light h-10 w-[300px] rounded-md border px-4 py-2 pl-10 text-xs focus:ring-2 focus:ring-sky-100 focus:outline-none min-[1440px]:w-[650px]"
        />
      </div>
      <Select defaultValue="month">
        <SelectTrigger className="border-secondary-light bg-secondary-very-light flex h-10 w-32 cursor-pointer items-center gap-2 rounded-md border px-3 py-1 text-sm">
          <SelectValue placeholder="Timeline" />
        </SelectTrigger>
        <SelectContent className="rounded-[14px] p-4">
          <SelectGroup className="*:w-[142px] *:cursor-pointer *:px-3 *:py-4">
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="week">7 Days</SelectItem>
            <SelectItem value="month">30 Days</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex items-center gap-4">
        <Notifications />
        <div className="border-secondary-light flex h-10 w-10 overflow-hidden rounded-full border bg-slate-100">
          {user.profileImage?.public_id ? (
            <SafeCldImage
              src={user.profileImage.public_id}
              fallbackUrl={user.profileImage.url}
              alt={user.name}
              width={40}
              height={40}
              className="object-cover object-center"
            />
          ) : (
            <UserRound className="text-slate-500" size={20} />
          )}
        </div>
        <div className="hidden flex-col text-left sm:flex">
          <span className="text-[15px] font-semibold">{user.name}</span>
          <span className="text-secondary-dark text-xs">{user.email}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
