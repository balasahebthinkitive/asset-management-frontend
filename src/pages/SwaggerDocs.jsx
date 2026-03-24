export default function SwaggerDocs() {
  return (
    <iframe
      src={`${process.env.PUBLIC_URL}/swagger.html`}
      title="API Documentation"
      style={{ width: "100%", height: "calc(100vh - 60px)", border: "none" }}
    />
  );
}
