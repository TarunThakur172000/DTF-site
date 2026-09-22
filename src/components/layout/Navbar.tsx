import { getCurrentUser } from "@/lib/server/auth/session";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <NavbarClient
      isLoggedIn={Boolean(user)}
    />
  );
}