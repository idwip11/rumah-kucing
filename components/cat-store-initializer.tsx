"use client";

import { useRef } from "react";
import { useCatStore, CatProfile } from "@/store/use-cat-store";

export function CatStoreInitializer({ cats }: { cats: CatProfile[] }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useCatStore.setState({ 
      cats,
      activeCatId: cats.length > 0 ? cats[0].id : null
    });
    initialized.current = true;
  }
  
  return null;
}
