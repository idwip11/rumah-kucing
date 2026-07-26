"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

let scrollLockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";

function lockPageScroll() {
  if (scrollLockCount === 0) {
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  scrollLockCount += 1;

  return () => {
    scrollLockCount = Math.max(0, scrollLockCount - 1);
    if (scrollLockCount === 0) {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    }
  };
}

export function ModalPortal({
  children,
  lockScroll = true,
}: {
  children: ReactNode;
  lockScroll?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !lockScroll) return;
    return lockPageScroll();
  }, [lockScroll, mounted]);

  if (!mounted) return null;

  return createPortal(children, document.body);
}
