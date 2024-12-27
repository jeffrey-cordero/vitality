"use client";
import { useContext } from "react";

import { AuthenticationContext } from "@/app/layout";

export default function Layout({ children }: { children: React.ReactNode }) {
   const { user } = useContext(AuthenticationContext);

   return (
      <>
         { user?.id !== undefined && children }
      </>
   );
}