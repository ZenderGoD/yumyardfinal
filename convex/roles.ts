const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email: string) => {
  const normalized = email.trim().toLowerCase();
  const admins = parseAdminEmails();
  return admins.includes(normalized);
};



