"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

const navigationItems = [
  "宿泊",
  "レストラン・バー",
  "ホテルショップ",
  "宴会・会議",
  "ウエディング",
  "イベント",
  "館内施設・アクセス",
];

type HeaderIconType = "language" | "search" | "location" | "login" | "shop" | "calendar";

function HeaderIcon({ type }: { type: HeaderIconType }) {
  const paths: Record<HeaderIconType, ReactNode> = {
    language: (
      <>
        <circle cx="10" cy="10" r="7.5" />
        <path d="M2.8 10h14.4M10 2.5c2.1 2.2 3.1 4.7 3.1 7.5s-1 5.3-3.1 7.5M10 2.5C7.9 4.7 6.9 7.2 6.9 10s1 5.3 3.1 7.5" />
      </>
    ),
    search: (
      <>
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="m13 13 4 4" />
      </>
    ),
    location: (
      <>
        <path d="M16 8c0 4.4-6 9.5-6 9.5S4 12.4 4 8a6 6 0 1 1 12 0Z" />
        <circle cx="10" cy="8" r="2" />
      </>
    ),
    login: (
      <>
        <circle cx="10" cy="6" r="3.5" />
        <path d="M3.5 17c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5" />
      </>
    ),
    shop: (
      <>
        <path d="M3 7h14l-1 10H4L3 7Z" />
        <path d="M7 8V5a3 3 0 0 1 6 0v3" />
      </>
    ),
    calendar: <path d="M3 6h14v11H3V6ZM6 3v4M14 3v4M3 10h14" />,
  };

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 20 20">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2">
        {paths[type]}
      </g>
    </svg>
  );
}

function HotelLogo() {
  return (
    <Image
      alt="ホテルワセリコ"
      className="h-16 w-auto object-contain xl:h-28"
      height={736}
      priority
      src="/images/log.jpeg"
      width={1254}
    />
  );
}

export default function HotelSiteHeader({ onReservationOpen }: { onReservationOpen: () => void }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_-2px_20px_rgba(26,21,10,0.10)]">
      <div className="relative flex h-20 items-stretch justify-between xl:hidden">
        <button
          aria-expanded={isMobileMenuOpen}
          aria-label="メニューを開く"
          className="flex w-20 flex-col items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a1a1a]"
          onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          <span className="relative block h-4 w-7">
            <span
              className={`absolute left-0 top-1/2 h-px w-7 bg-[#856c34] transition ${isMobileMenuOpen ? "rotate-[-30deg]" : "-translate-y-1"}`}
            />
            <span
              className={`absolute left-0 top-1/2 h-px w-7 bg-[#856c34] transition ${isMobileMenuOpen ? "rotate-[30deg]" : "translate-y-1"}`}
            />
          </span>
          menu
        </button>
        <a
          aria-label="ホテルワセリコ ホーム"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          href="#top"
        >
          <HotelLogo />
        </a>
        <button
          className="flex w-20 flex-col items-center justify-center gap-1 bg-[#856c34] text-[11px] text-white transition hover:bg-[#755f2d]"
          onClick={() => {
            setIsMobileMenuOpen(false);
            onReservationOpen();
          }}
          type="button"
        >
          <HeaderIcon type="calendar" />
          ご予約
        </button>
      </div>

      {isMobileMenuOpen && (
        <nav className="absolute left-0 right-0 top-20 border-t border-[#e6e6e6] bg-white px-6 py-7 shadow-lg xl:hidden">
          <ul>
            {navigationItems.map((item) => (
              <li className="border-b border-[#e6e6e6]" key={item}>
                <button
                  className="flex w-full items-center justify-between py-4 text-left text-sm tracking-[0.1em]"
                  type="button"
                >
                  {item}
                  <span className="text-[#856c34]">›</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="relative hidden h-32 items-stretch justify-between xl:flex">
        <div className="flex items-stretch pl-4">
          {(
            [
              ["language", "日本語"],
              ["search", "検索"],
              ["location", "ホテルを選ぶ"],
            ] as const
          ).map(([icon, label]) => (
            <button
              className="group relative flex min-w-24 flex-col items-center justify-center gap-2 px-3 text-xs transition hover:text-[#856c34]"
              key={label}
              type="button"
            >
              <span className="text-[#856c34]">
                <HeaderIcon type={icon} />
              </span>
              {label}
              <span className="absolute bottom-0 h-0.5 w-0 bg-[#856c34] transition-all group-hover:w-12" />
            </button>
          ))}
        </div>
        <a
          aria-label="ホテルワセリコ ホーム"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          href="#top"
        >
          <HotelLogo />
        </a>
        <div className="flex items-stretch">
          <Link
            className="group relative flex min-w-24 flex-col items-center justify-center gap-2 px-3 text-xs transition hover:text-[#856c34]"
            href="/reservations"
          >
            <span className="text-[#856c34]">
              <HeaderIcon type="login" />
            </span>
            予約確認
            <span className="absolute bottom-0 h-0.5 w-0 bg-[#856c34] transition-all group-hover:w-12" />
          </Link>
          <button
            className="flex aspect-square flex-col items-center justify-center gap-2 bg-[#1a1a1a] px-3 text-xs leading-tight text-white transition hover:bg-[#2e2e2e]"
            type="button"
          >
            <HeaderIcon type="shop" />
            <span>
              オンライン
              <br />
              モール
            </span>
          </button>
          <button
            className="flex min-w-32 flex-col items-center justify-center gap-2 bg-[#856c34] px-4 text-sm text-white transition hover:bg-[#755f2d]"
            onClick={onReservationOpen}
            type="button"
          >
            <HeaderIcon type="calendar" />
            ご予約
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-[#e6e6e6] xl:block">
        <ul className="flex h-16 items-stretch justify-center">
          {navigationItems.map((item) => (
            <li className="flex" key={item}>
              <button
                className="group relative px-6 text-sm tracking-[0.12em] transition hover:text-[#856c34]"
                onClick={item === "宿泊" ? onReservationOpen : undefined}
                type="button"
              >
                {item}
                <span className="absolute bottom-0 left-1/2 h-0.5 w-0 -translate-x-1/2 bg-[#856c34] transition-all group-hover:w-[calc(100%-3rem)]" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
