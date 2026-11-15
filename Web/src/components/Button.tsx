import { navigate, type Destination } from "../navigation";
export default function Button({
  children,
  to,
  light = false,
  outline = false,
}: {
  children: React.ReactNode;
  to: Destination;
  light?: boolean;
  outline?: boolean;
}) {
  return (
    <button
      className={`button ${light ? "button-light" : ""} ${outline ? "button-outline" : ""}`}
      onClick={() => navigate(to)}
    >
      {children}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
