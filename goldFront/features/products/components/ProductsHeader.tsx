"use client";

import Image from "next/image";
import { useRoleUI } from "@/core/ui/role-ui-context";
import { AddProductDialog } from "./AddProductDialog";

export default function ProductsHeader() {
  const { role } = useRoleUI();
  const isManager = role === "MANAGER";

  return (
    <section className="products-hero-shell relative isolate min-h-[304px] overflow-hidden rounded-[16px] border border-[#243A5B] bg-[#101D36] shadow-[0_8px_22px_rgba(16,29,54,0.10)] sm:min-h-[336px] lg:min-h-[352px]">
      <div className="products-hero-image absolute inset-0 opacity-45 sm:opacity-80 lg:top-0 lg:right-0 lg:bottom-0 lg:left-auto lg:w-[62%] lg:opacity-100">
        <Image
          src="/images/products/pharma-catalog-hero.jpg"
          alt="Pharmaceutical bottles and medicine containers representing the Goldera product catalog."
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 100vw"
          className="products-hero-photo object-cover"
          style={{ objectPosition: "center" }}
        />
      </div>

      <div className="products-hero-gradient absolute inset-0 z-10 bg-[linear-gradient(180deg,#101D36_0%,rgba(16,29,54,.98)_42%,rgba(16,29,54,.9)_68%,rgba(16,29,54,.78)_100%)] sm:bg-[linear-gradient(90deg,#101D36_0%,#101D36_42%,rgba(16,29,54,.97)_52%,rgba(16,29,54,.82)_62%,rgba(16,29,54,.52)_73%,rgba(16,29,54,.18)_84%,rgba(16,29,54,0)_94%)]" />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(115deg,rgba(27,53,88,.36)_0%,rgba(27,53,88,.16)_44%,rgba(11,22,42,0)_72%)]" />

      <div className="relative z-20 flex min-h-[304px] max-w-[720px] flex-col justify-center px-5 py-7 sm:min-h-[336px] sm:px-7 lg:min-h-[352px] lg:w-[52%] lg:px-8">
        <span className="products-hero-stagger products-hero-stagger-badge inline-flex w-fit items-center rounded-full border border-[#E3C46B]/30 bg-[#C9A44C]/12 px-3 py-1 text-[11px] font-semibold text-[#E3C46B]">
          Goldera Catalog
        </span>
        <h2 className="products-hero-stagger products-hero-stagger-heading mt-4 text-[28px] leading-[1.16] font-semibold text-white sm:text-[36px] lg:text-[40px]">
          Pharmaceutical Excellence, Managed with Precision
        </h2>
        <p className="products-hero-stagger products-hero-stagger-copy mt-4 max-w-[650px] text-[15px] leading-7 text-[#D8E1EF] sm:text-[16px]">
          Explore our complete product portfolio, categorized and optimized for
          pharmaceutical operations. Manage pricing, inventory status, and
          compliance documentation from a single interface.
        </p>

        {isManager && (
          <div className="products-hero-stagger products-hero-stagger-actions mt-6 flex flex-wrap gap-3">
            <AddProductDialog />
          </div>
        )}
      </div>
    </section>
  );
}
