"use client";

import { useEffect, useRef } from "react";

export default function MermaidDiagram({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const id = `mmd${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

    (async () => {
      const { default: mermaid } = await import("mermaid");
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          primaryColor: "#e0e7ff",
          primaryTextColor: "#3730a3",
          primaryBorderColor: "#a5b4fc",
          lineColor: "#6366f1",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#f8fafc",
          edgeLabelBackground: "#ffffff",
          fontFamily: "inherit",
          fontSize: "13px",
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "basis",
        },
        sequence: {
          useMaxWidth: true,
          messageAlign: "center",
        },
      });

      container.innerHTML = "";
      try {
        const { svg } = await mermaid.render(id, content);
        container.innerHTML = svg;
      } catch (err) {
        console.error("Mermaid render error:", err);
        container.innerHTML = `<pre class="text-sm text-gray-400 whitespace-pre-wrap p-4">${content}</pre>`;
      }
    })();
  }, [content]);

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto rounded-xl bg-white border border-indigo-100 p-4 [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:mx-auto [&>svg]:block"
    />
  );
}
