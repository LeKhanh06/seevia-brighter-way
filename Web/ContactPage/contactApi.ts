const base = (import.meta.env.VITE_CONTACT_API_BASE || "").replace(/\/$/, "");
export const contactApi = (path: string) => `${base}/api/contact${path}`;
