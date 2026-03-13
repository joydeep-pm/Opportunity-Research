"use client";

import Image from "next/image";
import { getAuthorColor, getAuthorInfo, getAuthorInitials } from "@/lib/authorAvatars";

type AuthorAvatarProps = {
  source?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showRole?: boolean;
};

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
};

export default function AuthorAvatar({ source, size = "sm", showName = false, showRole = false }: AuthorAvatarProps) {
  const author = getAuthorInfo(source);
  const initials = getAuthorInitials(author.name);
  const colorClass = getAuthorColor(author.name);

  return (
    <div className="flex items-center gap-2">
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          unoptimized
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${colorClass} flex items-center justify-center rounded-full font-semibold text-white`}
        >
          {initials}
        </div>
      )}

      {(showName || showRole) && (
        <div className="flex flex-col">
          {showName && <span className="text-sm font-medium text-zinc-900">{author.name}</span>}
          {showRole && author.role && <span className="text-xs text-zinc-500">{author.role}</span>}
        </div>
      )}
    </div>
  );
}
