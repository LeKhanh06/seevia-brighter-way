// Kênh liên hệ chính thức của SeeVia, dùng chung cho chân trang và trang Liên hệ.
// Thêm mạng xã hội mới: thêm một mục vào CHANNELS kèm biểu tượng.
import { translate, useLanguage } from "../i18n/language";
export const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61595317996659";
export const EMAIL = "seevia2210@gmail.com";
export const PHONE = "0332 360 490";
export const PHONE_HREF = "tel:+84332360490";

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z"
      />
    </svg>
  );
}
export function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.6 3.5 9 3l1.6 4-2 1.4a11 11 0 0 0 7 7l1.4-2 4 1.6-.5 2.4a2.5 2.5 0 0 1-2.6 2A16 16 0 0 1 4.6 6.1a2.5 2.5 0 0 1 2-2.6Z" />
    </svg>
  );
}

type Channel = { id: string; label: string; value: string; href: string; external?: boolean; Icon: typeof FacebookIcon };
export const CHANNELS: Channel[] = [
  { id: "facebook", label: "Facebook", value: "SeeVia", href: FACEBOOK_URL, external: true, Icon: FacebookIcon },
  { id: "email", label: "Email", value: EMAIL, href: `mailto:${EMAIL}`, Icon: MailIcon },
  { id: "phone", label: "Điện thoại", value: PHONE, href: PHONE_HREF, Icon: PhoneIcon },
];

/** Danh sách kênh liên hệ; className đặt kiểu riêng cho từng nơi dùng. */
export function ContactChannels({ className }: { className: string }) {
  const language = useLanguage();
  const t = (s: string) => translate(s, language);
  return (
    <ul className={className}>
      {CHANNELS.map(({ id, label, value, href, external, Icon }) => (
        <li key={id}>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            aria-label={`${t(label)}: ${value}${external ? ` (${t("mở thẻ mới")})` : ""}`}
          >
            <span className="channel-icon">
              <Icon />
            </span>
            <span className="channel-copy">
              <small>{label}</small>
              <span translate="no">{value}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
