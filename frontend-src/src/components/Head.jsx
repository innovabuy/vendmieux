import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEO from "../seo";

/**
 * Updates document <title> and <meta name="description"> on client-side navigation.
 * Server-side injection handles initial load; this handles SPA transitions.
 */
export default function Head() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = SEO[pathname] || SEO["/"];
    document.title = seo.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", seo.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", seo.description);
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", `https://vendmieux.fr${pathname === "/" ? "/" : pathname}`);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", `https://vendmieux.fr${pathname === "/" ? "/" : pathname}`);
  }, [pathname]);

  return null;
}
