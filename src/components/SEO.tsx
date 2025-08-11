import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const ensureMeta = (name: string, attr: "name" | "property" = "name") => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}='${name}']`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  return el;
};

export function SEO({ title, description, canonical, jsonLd }: SEOProps) {
  useEffect(() => {
    document.title = title;

    if (description) {
      ensureMeta("description").setAttribute("content", description);
      ensureMeta("og:description", "property").setAttribute("content", description);
    }

    ensureMeta("og:title", "property").setAttribute("content", title);
    ensureMeta("og:type", "property").setAttribute("content", "website");

    if (canonical) {
      let link = document.head.querySelector<HTMLLinkElement>("link[rel='canonical']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    let script = document.getElementById("jsonld") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "jsonld";
      document.head.appendChild(script);
    }
    if (jsonLd) {
      script.textContent = JSON.stringify(jsonLd);
    }

    return () => {
      // keep SEO tags persistent; nothing to cleanup
    };
  }, [title, description, canonical, jsonLd]);

  return null;
}
