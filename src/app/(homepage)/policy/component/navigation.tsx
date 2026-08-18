"use client";
import React from "react";
import Link from "next/link";

function Navigation() {
  const handleScroll = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    targetId: string
  ) => {
    event.preventDefault();
    const targetElement = document.getElementById(targetId);
    const offset = 90;
    if (targetElement) {
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="flex hidden w-full md:block mt-16" id="nav">
      <div>
        <p className="text-2xl font-semibold leading-8 text-stone-900">
          Contents
        </p>
        <ul className="list-decimal p-4 flex flex-col gap-5 text-zinc-800">
          <Link
            href="#info-collected"
            onClick={(e) => handleScroll(e, "info-collected")}
          >
            <li className="hover:text-blue-500">Information We Collect</li>
          </Link>
          <Link href="#how" onClick={(e) => handleScroll(e, "how")}>
            <li className="hover:text-blue-500">How We Use Your Information</li>
          </Link>
          <Link
            href="#disclosure"
            onClick={(e) => handleScroll(e, "disclosure")}
          >
            <li className="hover:text-blue-500">
              Disclosure of Your Information
            </li>
          </Link>
          <Link href="#security" onClick={(e) => handleScroll(e, "security")}>
            <li className="hover:text-blue-500">
              Security of Your Information
            </li>
          </Link>
          <Link href="#rights" onClick={(e) => handleScroll(e, "rights")}>
            <li className="hover:text-blue-500">Your Rights</li>
          </Link>
          <Link href="#policy" onClick={(e) => handleScroll(e, "policy")}>
            <li className="hover:text-blue-500">
              Changes to This Privacy Policy
            </li>
          </Link>
        </ul>
      </div>
    </nav>
  );
}
export default Navigation;
