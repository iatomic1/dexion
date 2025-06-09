"use server";
import { headers } from "next/headers";
import { PUBLIC_BASE_URL } from "./constants";

export const withAuth = async () => {
  const headersList = await headers();
  const cookie = headersList.get("cookie");
  const url = PUBLIC_BASE_URL + "/api/auth/get-session";

  const session = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      cookie: cookie ?? "",
    },
  }).then((res) => res.json());

  return session ?? { user: null, session: null };
};
