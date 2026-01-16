// ScrollToTopOnce.jsx
import { useLayoutEffect } from "react";

export default function ScrollToTopOnce() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
