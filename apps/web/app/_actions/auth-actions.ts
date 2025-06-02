"use server";
import { unauthenticatedAction } from "~/lib/safe-action";
import { AuthSuccess } from "~/types/auth";
import { ApiResponse } from "~/types";
import makeFetch from "~/lib/helpers/fetch";
import { authSchema, baseAuthSchema, loginSchema } from "../schema";

export const authAction = unauthenticatedAction
  .createServerAction()
  .input(authSchema)
  .handler(async ({ input }) => {
    try {
      const { signUp, ...credentials } = input;

      return await makeFetch<ApiResponse<AuthSuccess>>(
        "dexion",
        `auth/${signUp ? "signup" : "login"}`,
        null,
        {
          method: "POST",
          body: {
            email: credentials.email,
            password: credentials.password,
            type: "APP",
          },
        },
      )();
    } catch (err) {
      console.error(err);
    }
  });
