"use server";
import { ResetPasswordEmail } from "@repo/transactional/reset-password.tsx";
import { Resend } from "resend";
import { getOtpEmailHtml } from "./otp-template";
import { getVerificationEmailHtml } from "./verify-email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (
  email: string,
  type: "sign-in" | "email-verification" | "forget-password",
  otp: string,
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Dexion <no-reply@auth.dexion.pro>",
      to: [email],
      subject:
        type === "email-verification"
          ? "Verify your email address"
          : type === "sign-in"
            ? "Dexion OTP"
            : "Forget Password",
      html:
        type === "email-verification"
          ? getVerificationEmailHtml({
              username: email,
              verificationCode: otp,
            })
          : type === "sign-in"
            ? getOtpEmailHtml({ username: email, otp: otp })
            : "",
      react:
        type === "forget-password"
          ? ResetPasswordEmail({ resetPasswordLink: otp, userFirstname: email })
          : null,
    });

    if (error) {
      console.error(error);
    }

    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
};
