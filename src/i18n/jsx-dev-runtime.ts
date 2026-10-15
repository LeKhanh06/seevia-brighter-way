import { jsx } from "./jsx-runtime";
export { Fragment } from "./jsx-runtime";
export type { JSX } from "react/jsx-dev-runtime";
export const jsxDEV: typeof import("react/jsx-dev-runtime").jsxDEV = (
  type,
  props,
  key,
) => jsx(type, props, key);
