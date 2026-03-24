import { useEffect, useRef } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-bundle";
import "swagger-ui-dist/swagger-ui.css";

export default function SwaggerDocs() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ui = SwaggerUIBundle({
      url: `${process.env.PUBLIC_URL}/openapi.yaml`,
      domNode: containerRef.current,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: "BaseLayout",
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      displayRequestDuration: true,
    });
    return () => ui && ui.unmount && ui.unmount();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ background: "#fff", minHeight: "100vh" }}
    />
  );
}
