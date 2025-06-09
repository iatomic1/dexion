"use server";

import { revalidateTag } from "next/cache";

export const revalidateTagServer = async (tag: string) => {
  revalidateTag(tag);
};
