import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerDocs() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "0 0 40px" }}>
      <SwaggerUI
        url={`${process.env.PUBLIC_URL}/openapi.yaml`}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        displayRequestDuration
      />
    </div>
  );
}
