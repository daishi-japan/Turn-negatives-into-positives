"use client";

import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    key: "input",
    label: "INPUT",
    path: "/",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-current fill-none" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    key: "result",
    label: "RESULT",
    path: "/result",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-current fill-none" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    key: "history",
    label: "HISTORY",
    path: "/history",
    icon: (
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-current fill-none" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveKey = () => {
    if (pathname === "/") return "input";
    if (pathname === "/result") return "result";
    if (pathname === "/history") return "history";
    return "input";
  };

  const activeKey = getActiveKey();

  return (
    <nav className="flex border-t-[3px] border-[#0a0a0a] shrink-0 bg-[#fafafa] sticky bottom-0 z-30">
      {NAV_ITEMS.map((item, i) => (
        <button
          key={item.key}
          onClick={() => router.push(item.path)}
          className={`flex-1 py-3.5 px-2 text-center cursor-pointer border-none font-[var(--font-dm-mono)] text-[9px] tracking-[1.5px] uppercase flex flex-col items-center gap-1.5 bottom-nav-item ${
            i > 0 ? "border-l-[3px] border-[#0a0a0a]" : ""
          } ${
            activeKey === item.key
              ? "bg-[#0a0a0a] text-white"
              : "bg-transparent text-[#999]"
          }`}
          style={{ fontFamily: "var(--font-dm-mono)" }}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {item.icon}
          </div>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
