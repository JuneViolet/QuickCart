"use client";

import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";

export default function ClientProvider({ children }) {
  return (
    <>
      <Toaster />
      <AppContextProvider>{children}</AppContextProvider>
    </>
  );
}
