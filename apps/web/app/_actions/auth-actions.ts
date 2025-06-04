"use server";
import { unauthenticatedAction } from "~/lib/safe-action";
import { authSchema } from "../schema";
import { APIError } from "better-auth/api";
import { auth } from "~/lib/auth";

export const authAction = unauthenticatedAction
  .createServerAction()
  .input(authSchema)
  .handler(async ({ input }) => {
    try {
      const { signUp, ...credentials } = input;

      if (signUp) {
        try {
          const res = await auth.api.signUpEmail({
            body: {
              name: "John Doe", // You might want to add a name field to your form
              email: credentials.email,
              password: credentials.password,
              type: "APP",
            },
          });

          console.log("SignUp successful:", res);

          // Return success response
          return {
            success: true,
            user: res.user,
            session: res.token,
          };
        } catch (error) {
          console.error("SignUp error:", error);

          if (error instanceof APIError) {
            switch (error.status) {
              case "UNPROCESSABLE_ENTITY":
                return {
                  success: false,
                  errorMessage: "User with this email already exists.",
                };
              case "BAD_REQUEST":
                return {
                  success: false,
                  errorMessage: "Invalid email or password format.",
                };
              default:
                return {
                  success: false,
                  errorMessage: "Something went wrong. Please try again.",
                };
            }
          }

          return {
            success: false,
            errorMessage: "Failed to create account. Please try again.",
          };
        }
      } else {
        try {
          const res = await auth.api.signInEmail({
            body: {
              email: credentials.email,
              password: credentials.password,
            },
          });

          console.log("SignIn successful:", res);

          return {
            success: true,
            user: res.user,
            session: res.token,
          };
        } catch (error) {
          console.error("SignIn error:", error);

          if (error instanceof APIError) {
            switch (error.status) {
              case "UNAUTHORIZED":
                return {
                  success: false,
                  errorMessage: "Invalid email or password.",
                };
              case "BAD_REQUEST":
                return {
                  success: false,
                  errorMessage: "Invalid email format.",
                };
              default:
                return {
                  success: false,
                  errorMessage: "Something went wrong. Please try again.",
                };
            }
          }

          return {
            success: false,
            errorMessage: "Failed to sign in. Please try again.",
          };
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      return {
        success: false,
        errorMessage: "An unexpected error occurred. Please try again.",
      };
    }
  });
