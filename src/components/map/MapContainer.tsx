"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Importing the actual map component dynamically with SSR disabled
const DynamicMap = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full rounded-none" />,
});

export function MapContainer() {
  return <DynamicMap />;
}
