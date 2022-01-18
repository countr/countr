import { docsUrl, inviteUrl, premiumHelpUrl, privacyUrl, sourceUrl, supportServerUrl, termsUrl, uptimeUrl } from "../../constants/links";

const basics: Array<{
  triggers: Array<string>;
  message: string;
}> = [
  {
    triggers: ["invite", "inviteme", "addme"],
    message: `🔗 Invite me: <${inviteUrl}>`,
  },
  {
    triggers: ["support"],
    message: `🔗 Support server: <${supportServerUrl}>`,
  },
  {
    triggers: ["privacy", "privacypolicy"],
    message: `🔗 Privacy Policy: <${privacyUrl}>`,
  },
  {
    triggers: ["terms", "termsofservice", "tos"],
    message: `🔗 Terms of Service: <${termsUrl}>`,
  },
  {
    triggers: ["source", "sourcecode", "code", "git"],
    message: `🔗 Source code: ${sourceUrl}`,
  },
  {
    triggers: ["docs", "documentation"],
    message: `🔗 Documentation: ${docsUrl}`,
  },
  {
    triggers: ["uptime", "status"],
    message: `🔗 Uptime: ${uptimeUrl}`,
  },
  {
    triggers: ["premium", "buy"],
    message: `🔗 Learn about Premium here: ${premiumHelpUrl}`,
  },
];

export default basics;
