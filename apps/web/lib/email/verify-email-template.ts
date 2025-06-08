export const getVerificationEmailHtml = ({
  username,
  verificationCode,
}: {
  username: string;
  verificationCode: string;
}) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
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
      blockquote,h1,h2,h3,img,li,ol,p,ul{margin-top:0;margin-bottom:0}
      @media only screen and (max-width:425px){
        .tab-row-full{width:100%!important}
        .tab-col-full{display:block!important;width:100%!important}
        .tab-pad{padding:0!important}
      }
    </style>
  </head>
  <body style="margin:0px;background-color:#ffffff;padding:0">
    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" id="__react-email-preview">
      [dexion] OTP for verifying your email account is ${verificationCode}
    </div>
    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
      style="max-width:600px;width:100%;margin:auto;background-color:#ffffff;padding:0.5rem;border-radius:0;border-width:0;border-color:transparent">
      <tbody>
        <tr>
          <td>
            <p style="font-size:15px;line-height:26.25px;margin:16px 0;color:#374151;">
              Hi, <strong>${username}</strong>!
            </p>
            <p style="font-size:15px;line-height:26.25px;margin:16px 0;color:#374151;">
              To complete your registration on Dexion, please verify your email address by entering the verification code provided below.
            </p>
            <p style="font-size:15px;line-height:26.25px;margin:16px 0;color:#374151;">
              If you did not create an account on Dexion, please ignore this email.
            </p>
            <p style="font-size:15px;line-height:26.25px;margin:16px 0;color:#374151;">
              Your verification code is: <strong>${verificationCode}</strong>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;
