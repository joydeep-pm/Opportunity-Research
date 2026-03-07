"use client";

import { ReactNode, useState } from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
};

export default function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
          {content}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-zinc-900" />
        </div>
      )}
    </div>
  );
}
