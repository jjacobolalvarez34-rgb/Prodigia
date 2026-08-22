import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Link/useRouter/usePathname/redirect ya locale-aware — reemplazan a los
// de next/link y next/navigation en todo el código nuevo o retocado.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
