import { getMetricValue } from "@/utils/swap-events";
import type { Alert } from "@/workers/swap-events-worker";
import type { TokenMetadata } from "@dexion/tokens/types";

export const getAlertEmail = ({
	token,
	alert,
}: {
	token: TokenMetadata;
	alert: Alert;
}) => {
	return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html dir="ltr" lang="en">
    <head>
      <meta name="viewport" content="width=device-width" />
      <link rel="preload" as="image" href="https://maily.to/brand/logo.png" />
      <link
        rel="preload"
        as="image"
        href="https://ik.imagekit.io/rhmwnsdz3/Private/Logo2-2-1.png" />
      <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="x-apple-disable-message-reformatting" />
      <meta
        name="format-detection"
        content="telephone=no,address=no,email=no,date=no,url=no" />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <!--$-->
      <style>
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          mso-font-alt: 'sans-serif';
          src: url(https://rsms.me/inter/font-files/Inter-Regular.woff2?v=3.19) format('woff2');
        }

        * {
          font-family: 'Inter', sans-serif;
        }
      </style>
      <style>
        blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}@media only screen and (max-width:425px){.tab-row-full{width:100%!important}.tab-col-full{display:block!important;width:100%!important}.tab-pad{padding:0!important}}
      </style>
    </head>
    <body style="background-color:#ffffff">
      <table
        border="0"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        role="presentation"
        align="center">
        <tbody>
          <tr>
            <td
              style="margin:0px;background-color:#ffffff;padding-top:0px;padding-right:0px;padding-bottom:0px;padding-left:0px">
              <table
                align="center"
                width="100%"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="max-width:600px;width:100%;margin-left:auto;margin-right:auto;border-style:solid;background-color:#ffffff;min-width:300px;padding-top:0.5rem;padding-right:0.5rem;padding-bottom:0.5rem;padding-left:0.5rem;border-radius:0px;border-width:0px;border-color:transparent">
                <tbody>
                  <tr style="width:100%">
                    <td>
                      <h3
                        style="margin-left:0px;margin-right:0px;margin-top:0px;margin-bottom:12px;text-align:left;color:#111827;font-size:24px;line-height:38px;font-weight:600">
                        🚨 Price Alert Triggered
                      </h3>
                      <p
                        style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 20px 0;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0">
                        <strong>Your alert condition has been met!</strong>
                      </p>
                      <p
                        style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 20px 0;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0">
                        <img
                          src="${token.image_url}"
                          width="45"
                          height="45"
                          style="display:inline;vertical-align:middle;width:45px;height:45px;outline:none;border:none;text-decoration:none" /> <strong
                          >${token.name} (${token.symbol})</strong
                        >
                      </p>
                      <p
                        style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 20px 0;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0">
                        📊 Metric Tracked: <strong>${alert.metric}</strong>
                      </p>
                      <table
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="max-width:100%;margin-top:0px;margin-bottom:20px">
                        <tbody>
                          <tr style="width:100%">
                            <td>
                              <ul style="padding-left:26px;list-style-type:disc">
                                <li
                                  style="margin-bottom:8px;margin-top:8px;padding-left:6px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                                  <p
                                    style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 0px 0;margin-top:0;margin-right:0;margin-bottom:0px;margin-left:0">
                                    <strong>Condition Set:</strong> ${alert.operator} ${alert.value}
                                    $100
                                  </p>
                                </li>
                                <li
                                  style="margin-bottom:8px;margin-top:8px;padding-left:6px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                                  <p
                                    style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 0px 0;margin-top:0;margin-right:0;margin-bottom:0px;margin-left:0">
                                    <strong>Current Value:</strong> ${getMetricValue(alert.metric, token)}
                                  </p>
                                </li>
                                <li
                                  style="margin-bottom:8px;margin-top:8px;padding-left:6px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                                  <p
                                    style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 0px 0;margin-top:0;margin-right:0;margin-bottom:0px;margin-left:0">
                                    <strong>Repeatable Alert:</strong> ${alert.repeatable ? "Yes" : "No"}
                                  </p>
                                </li>
                              </ul>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p
                        style="font-size:15px;line-height:26.25px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;color:#374151;margin:0 0 20px 0;margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0">
                        Stay ahead of the market. You can manage or update your
                        alerts anytime in your
                        <a
                          href="https://www.dexion.pro/alerts"
                          rel="noopener noreferrer nofollow"
                          style="color:#111827;text-decoration-line:none;font-weight:500;text-decoration:none"
                          target="_blank"
                          ><u>dashboard</u></a
                        >.
                      </p>
                      <table
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="margin-top:0px;margin-bottom:0px">
                        <tbody style="width:100%">
                          <tr style="width:100%">
                            <td align="left" data-id="__react-email-column">
                              <img
                                title="Image"
                                alt="Image"
                                src="https://ik.imagekit.io/rhmwnsdz3/Private/Logo2-2-1.png"
                                style="display:block;outline:none;border:none;text-decoration:none;width:42px;height:42px;max-width:100%;border-radius:24px" />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table
                        align="center"
                        width="100%"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        role="presentation"
                        style="max-width:37.5em;height:16px">
                        <tbody>
                          <tr style="width:100%">
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                      <p
                        style="font-size:14px;line-height:24px;color:#64748B;margin-top:0px;margin-bottom:20px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
                        <strong>Got thoughts about this alert?</strong><br />We’d
                        love your feedback! Just say hi in our
                        <a
                          href="https://discord.gg/MxMeB2N5rJ"
                          rel="noopener noreferrer nofollow"
                          style="color:#111827;text-decoration-line:none;font-weight:500;text-decoration:none"
                          target="_blank"
                          ><u>Discord community</u></a
                        >.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
      <!--/$-->
    </body>
  </html>
`;
};
