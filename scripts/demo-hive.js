// Playwright CLI: run-code --filename scripts/demo-hive.js
// Run against the public Hive UI development server. All API data is synthetic.
async function demoHive(page) {
  const generatedAt = new Date().toISOString();
  const apps = [
    {
      key: "iam",
      name: "Hive IAM",
      role: "Identity and scoped access",
      summary: "Identity service ready",
    },
    {
      key: "memory",
      name: "Hive Memory",
      role: "Long-term agent memory",
      summary: "Memory service ready",
    },
    {
      key: "router",
      name: "Hive Router",
      role: "Model gateway and routing",
      summary: "Routing service ready",
    },
  ].map((app) => ({
    ...app,
    status: "online",
    internalUrl: "https://service.example.com",
    publicUrl: "https://service.example.com",
    consoleUrl: "https://service.example.com",
    latencyMs: 12,
    checks: [{ name: "Readiness", status: "pass" }],
    details:
      app.key === "router"
        ? {
            tlsCertificate: {
              configured: true,
              status: "pass",
              message: "Sample certificate valid",
              domains: ["hive.example.com"],
              hostnameMatched: true,
            },
            securityExporterJwks: {
              state: "healthy",
              remainingMs: 3600000,
              trustedKeyCount: 2,
            },
          }
        : {},
  }));
  await page.route("**/api/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body = { data: [] };
    if (path === "/api/auth/me" || path === "/api/auth/login")
      body = {
        ok: true,
        user: {
          id: "sample-admin",
          username: "demo",
          displayName: "Demo operator",
          roles: ["admin"],
          permissions: [],
        },
      };
    else if (path === "/api/hive/status")
      body = { generatedAt, uiUrl: "https://hive.example.com", apps };
    else if (path === "/api/hive/skills") body = { configured: false };
    else if (path === "/api/telemetry")
      body = { totals: { traces: 1248, failures: 0, failovers: 2 } };
    await route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
  await page.route("**/api-docs/index", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ docs: [], providers: [] }),
    }),
  );
  await page.reload();
  await page.locator(".hive-lattice").waitFor();
}
