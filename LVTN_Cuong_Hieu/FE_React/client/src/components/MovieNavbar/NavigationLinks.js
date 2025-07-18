import React from "react";


export default function NavigationLinks() {
  const navLinks = [

    { href: "/schedule", label: "Lịch chiếu" },
    { href: "/movies", label: "Phim" },
    { href: "/cinemas", label: "Rạp" },
    { href: "/blogs", label: "Tin tức" },
    { href: "/members", label: "Thành viên" }
  ];

  return (
    <div className="hidden md:block">
      <div className="ml-10 flex items-baseline space-x-5">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="hover:text-yellow-400 px-3 py-2 transition"
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}