import type { HodlmmNotificationPayload } from "@/core/queues";

export const getHodlmmAlertEmail = (payload: HodlmmNotificationPayload) => {
	const { alert, currentStatus, positionValue } = payload;
	const isOutOfRange = currentStatus === "out-of-range";

	const headerColor = isOutOfRange ? "#DC2626" : "#16A34A"; // Red vs Green
	const headerText = isOutOfRange
		? "⚠️ Position Out of Range"
		: "✅ Position Back in Range";
	const bodyText = isOutOfRange
		? `Your HODLMM position <strong>${alert.displayName}</strong> is no longer earning trading fees.`
		: `Your HODLMM position <strong>${alert.displayName}</strong> is now active and earning trading fees again.`;

	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" lang="en">
    <head>
      <meta name="viewport" content="width=device-width" />
      <style>
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          mso-font-alt: 'sans-serif';
          src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
        }
        * { font-family: 'Inter', sans-serif; }
      </style>
    </head>
    <body style="background-color:#ffffff">
      <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
        <tbody>
          <tr>
            <td style="background-color:#ffffff;padding:20px;">
              <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;margin:auto;">
                <tbody>
                  <tr>
                    <td>
                      <h3 style="color:${headerColor};font-size:24px;font-weight:600;margin-bottom:12px;">
                        ${headerText}
                      </h3>
                      <p style="font-size:16px;color:#374151;line-height:24px;margin-bottom:20px;">
                        ${bodyText}
                      </p>
                      
                      <table width="100%" style="margin-bottom:20px;">
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                            <strong style="color:#374151">Pool:</strong>
                            <span style="float:right;color:#111827">${alert.displayName}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;">
                            <strong style="color:#374151">Status:</strong>
                            <span style="float:right;color:${headerColor};font-weight:600;text-transform:capitalize;">${currentStatus.replace("-", " ")}</span>
                          </td>
                        </tr>
                      </table>

                      <div style="text-align:center;margin-top:30px;">
                        <a href="https://hodlmm.bitflow.finance" 
                           style="background-color:#000000;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500;">
                           Manage Position
                        </a>
                      </div>
                      
                      <p style="font-size:14px;color:#6b7280;margin-top:30px;text-align:center;">
                        You can manage your alert settings on <a href="https://www.dexion.pro/alerts/hodlmm" style="color:#374151;">Dexion</a>.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </body>
  </html>
`;
};
