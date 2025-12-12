const parseAdminEmails = () =>
  (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const parseOwnerEmails = () =>
  (process.env.NEXT_PUBLIC_OWNER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return parseAdminEmails().includes(email.trim().toLowerCase());
};

export const adminEmailsList = () => parseAdminEmails();

export const isOwnerEmail = (email?: string | null) => {
  if (!email) return false;
  return parseOwnerEmails().includes(email.trim().toLowerCase());
};

export const ownerEmailsList = () => parseOwnerEmails();



