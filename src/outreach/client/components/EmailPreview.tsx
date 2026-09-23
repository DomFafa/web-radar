/** @jsxImportSource react */
import React, { useMemo } from "react";

export function EmailPreview({ html, height=540 }: { html: string; height?:number }) {
  const document = useMemo(() => {
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const style = parsed.createElement("style");
    style.textContent = `
      html, body { margin: 0; padding: 0; width: 100%; }
      body { padding: 12px; box-sizing: border-box; }
      *, *::before, *::after { box-sizing: border-box; }
      body * { max-width: 100% !important; min-width: 0 !important;
        overflow-wrap: anywhere; white-space: normal !important; }
      table { width: 100% !important; table-layout: fixed; }
      img, video { height: auto; }
      pre { white-space: pre-wrap !important; }
    `;
    parsed.head.appendChild(style);
    return "<!doctype html>" + parsed.documentElement.outerHTML;
  }, [html]);

  return <iframe title="邮件内容预览" sandbox="" srcDoc={document}
    style={{ display: "block", width: "100%", minWidth: 0, height,
      border: "1px solid var(--color-border)", borderRadius: 6, background: "white" }} />;
}
