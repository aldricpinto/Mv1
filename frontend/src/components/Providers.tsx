"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  clientId: string;
};

export function Providers({ children, clientId }: Props) {
  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
