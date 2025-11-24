import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("framer-motion", async () => {
  const React = await import("react");
  const { createElement, forwardRef } = React;
  const handler = {
    get(_: unknown, element: string) {
      return forwardRef<any, any>((props, ref) =>
        createElement(element, { ref, ...props })
      );
    },
  };
  return { motion: new Proxy({}, handler) };
});
