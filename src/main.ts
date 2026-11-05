import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";

type ProjectId = "hive" | "emberpath" | "oathweave" | "hivemem" | "hiveskills" | "hivexui" | "magnus" | "cindertrace" | "chattermost" | "emberfold";
type GalleryId = Exclude<ProjectId, "emberfold">;
type DemoId = "hive" | "magnus" | "cindertrace" | "chattermost" | "ardent";
// The suite's release version is not final. Fill this one constant, and the same token in
// public/guides/hive.md, when the release is published. See docs/deployment.md.
const HIVE_RELEASE = "__HIVE_RELEASE__";
type Step = { title: string; text: string; code?: string; note?: string; kind?: "address" };
type Demo = {
  label: string;
  kicker: string;
  title: string;
  intro: string;
  requires: string[];
  steps: Step[];
  guide: string;
  guideLabel: string;
};

const projects: Record<
  ProjectId,
  {
    name: string;
    role: string;
    summary: string;
    detail: string;
    href: string;
    connections: { to: string; how: string }[];
  }
> = {
  hive: {
    name: "Hive",
    role: "Install · upgrade · recover",
    summary: "Install a tested, signed set of independent products.",
    detail:
      "Hive is the Bash installer and controller. <code>hive.sh</code> deploys signed, digest-pinned releases to one or more hosts, then handles upgrades, backups and restore rehearsals. Every installation also runs a mandatory Hive Registry: its own install catalog and lookup API, which is separate from the HiveSkills registry.",
    href: "https://github.com/ChefTaco/hive",
    connections: [
      { to: "Oathweave / Emberpath / HiveMem / HiveSkills", how: "the core profile; each keeps its own data and credentials" },
      { to: "HiveXUI", how: "static console behind the HTTPS ingress Hive assembles" },
      { to: "Hive Registry", how: "what this installation offers and runs: written by hive.sh, read through /api/registry" },
      { to: "Magnus / Cindertrace / ChatterMost", how: "added by the full or custom profile" },
      { to: "External inference", how: "verified endpoints and protected references; no model or runtime provisioning" },
    ],
  },
  emberpath: {
    name: "Emberpath", role: "Models · routing · telemetry",
    summary: "Route model requests to the providers you choose.",
    detail: "An OpenAI-compatible model gateway with a separate administration API. Clients talk to one endpoint; Emberpath picks an upstream provider, fails over when it is safe to, enforces per-key quotas and records a trace for every request. Inference services stay external: it routes to them and never installs or manages them.",
    href: "https://github.com/ChefTaco/Emberpath",
    connections: [{ to: "HiveXUI", how: "models, providers, tests and traces through its administration API" }, { to: "Oathweave", how: "resource-specific suite access; native API keys remain separate" }, { to: "External inference", how: "OpenAI-compatible and native provider protocols" }],
  },
  oathweave: {
    name: "Oathweave", role: "Identity · access · enrollment",
    summary: "One sign-in, explicit access to each product.",
    detail: "Identity and access management: OAuth 2.0 and OpenID Connect, role-based access, MFA and passkeys, service identities and an append-only audit trail. Product accounts link explicitly by issuer and subject. Each receiving API validates its own audience and permissions; identities are never merged by email.",
    href: "https://github.com/ChefTaco/Oathweave",
    connections: [{ to: "HiveXUI", how: "public clients with Authorization Code and PKCE; browser tokens stay in memory" }, { to: "Product APIs", how: "independent resource authorization and explicit account links" }, { to: "Magnus", how: "identity mappings; approved host changes remain Magnus jobs" }],
  },
  hivemem: {
    name: "HiveMem", role: "Memory · retrieval · workspaces",
    summary: "Keep durable memory within its workspace.",
    detail: "Long-term memory for agents, backed by Qdrant: storage and retrieval, sessions, a knowledge graph, consolidation, webhooks and per-account workspace access. Native SDKs and the Hermes memory provider share one REST API. Its credentials and backups stay independent of model routing.",
    href: "https://github.com/ChefTaco/HiveMem",
    connections: [{ to: "HiveXUI", how: "memory, workspace and operation workflows through scoped APIs" }, { to: "Ardent / Hermes", how: "separate workspace-scoped memory credentials" }, { to: "Oathweave", how: "explicit identity links and resource authorization" }],
  },
  hiveskills: {
    name: "HiveSkills", role: "Skills registry · archives · assignments",
    summary: "Distribute reviewed, immutable skills.",
    detail: "The skills registry for agents: a digest-verified archive API with immutable releases, channels, assignments and audited distribution. It is unrelated to the Hive Registry, which catalogs one installation. Approved host deployment runs through Magnus jobs and agents.",
    href: "https://github.com/ChefTaco/HiveSkills",
    connections: [{ to: "HiveXUI", how: "catalogue, archive and assignment administration" }, { to: "Magnus", how: "approved host deployment execution" }, { to: "Agents", how: "authenticated manifests and immutable archive distribution" }],
  },
  hivexui: {
    name: "HiveXUI", role: "The console · browser only",
    summary: "One browser console for every product you install.",
    detail: "The single browser UI of a Hive installation: fleet, identity, models, memory, skills, security and chat in one shell, with sections only for the products you installed. It is a static TypeScript and React application, dark only for now, with no backend of its own. Every call goes to the owning product's API with your own credentials.",
    href: "https://github.com/ChefTaco/HiveXUI",
    connections: [{ to: "Oathweave", how: "one sign-in and resource-specific access" }, { to: "Product APIs", how: "same-origin HTTPS ingress; no database access or signing keys" }, { to: "Magnus", how: "the fleet console, as the module at /fleet" }],
  },
  magnus: {
    name: "Magnus",
    role: "Fleet · operations · Ardent",
    summary: "See and operate the hosts where your agents live.",
    detail:
      "Fleet inventory, jobs, skills, rollouts and audit for Linux hosts. In a Hive installation its console is the Magnus section of HiveXUI, signed in through Oathweave. Its Ardent runtime runs durable agent tasks on a host or under fleet management. The web terminal is a separate gateway requiring step-up, off unless you deploy it.",
    href: "https://github.com/ChefTaco/magnus",
    connections: [
      { to: "Ardent", how: "ships the runtime and can manage it on fleet hosts" },
      { to: "HiveXUI", how: "the fleet console, through an allowlist of browser routes" },
      { to: "Fleet gateway", how: "holds the restricted SSH key for the optional web terminal" },
      { to: "Oathweave / Emberpath / HiveMem", how: "optional sign-in, model routing and shared memory" },
      { to: "Cindertrace", how: "optional observations, fleet context, and approved host response" },
    ],
  },
  cindertrace: {
    name: "Cindertrace",
    role: "Security · cases · evidence",
    summary: "Turn security observations into an investigation.",
    detail:
      "Correlated cases, hashed evidence, investigations, policies and audit. In a Hive installation it is a section of HiveXUI, signed in through Oathweave. It also runs on its own with its retained console and local administrator login, then optionally connects Magnus fleet context and approved response. A separate disposable lab lets people and agents revise an investigation as evidence arrives.",
    href: "https://github.com/ChefTaco/cindertrace",
    connections: [
      { to: "HiveXUI", how: "the suite's security console, using resource tokens" },
      { to: "Oathweave / Emberpath", how: "optional sign-in and scoped identity and routing security metadata" },
      { to: "Magnus", how: "optional fleet context and execution of explicitly approved host responses" },
      { to: "Configured sources", how: "signed observations from endpoint, network, identity, and application adapters" },
    ],
  },
  chattermost: {
    name: "ChatterMost",
    role: "Conversation · channels",
    summary: "A self-hosted place to talk with people and agents.",
    detail:
      "A Mattermost-compatible chat backend for channels, direct messages, threads, and agent conversations. In a Hive installation its browser interface is a section of HiveXUI. The official Mattermost mobile and desktop apps connect directly, and the product keeps a small web UI that the desktop app loads and recovery relies on. Background mobile push and calls are not implemented.",
    href: "https://github.com/ChefTaco/ChatterMost",
    connections: [
      { to: "HiveXUI", how: "an explicitly linked identity exchanged for a short native session" },
      { to: "Hermes Agent", how: "documented setup through its Mattermost gateway" },
      { to: "Ardent", how: "optional Mattermost channel, configured in the Ardent profile" },
    ],
  },
  emberfold: {
    name: "Emberfold",
    role: "Context · continuity",
    summary: "Carry the right context into the next agent turn.",
    detail:
      "A portable context engine with a TypeScript library, CLI, HTTP service, and Hermes plugin. It has no console section. Ardent uses its library for context fitting while retaining its own authoritative history.",
    href: "https://github.com/ChefTaco/emberfold",
    connections: [
      { to: "Ardent", how: "pinned library for context fitting; the HTTP service is optional" },
      { to: "Hermes Agent", how: "standard context-engine plugin" },
    ],
  },
};

const demos: Record<DemoId, Demo> = {
  hive: {
    label: "Hive",
    kicker: "Suite installer",
    title: "Install from a signed release",
    intro:
      `Hive's Bash controller installs what a signed release lists and refuses anything it cannot verify. Check <a href="https://github.com/ChefTaco/hive/releases" target="_blank" rel="noopener noreferrer">Hive's releases page</a> for what is published. Choose the core, full or custom profile; inference stays external and Hive only verifies endpoints.`,
    requires: [
      "Bash, jq, OpenSSL and sha256sum on the controller",
      "Docker Compose on each host; ss, df and coreutils on the console host",
      "A signed release manifest, its signature and the publisher key",
      "An HTTPS origin with existing certificate and key files",
    ],
    steps: [
      {
        title: "Start setup",
        text: "Run the controller with the exact release. It verifies the manifest signature first, then asks for the installation name, hosts, console origin, profile and certificate references. It never asks for a password on the command line.",
        code: `./hive.sh --release ${HIVE_RELEASE}`,
        note: "The manifest defaults to <code>releases/VERSION.json</code>, its signature to the same path plus <code>.sig</code>, and the publisher key to <code>trust/publisher.pub</code>. Use <code>--manifest</code>, <code>--signature</code> and <code>--trust-key</code> for other paths.",
      },
      {
        title: "Review the plan",
        text: "Setup shows a plan and applies it only after you confirm. To repeat or automate it, keep the installation JSON and run the same reviewed configuration. Planning does not contact hosts, and retries check the exact inputs.",
        code: "./hive.sh plan --config installation.json\n./hive.sh install --config installation.json",
        note: "Secrets and identities are generated once into protected files. Existing data, configuration and model resources are never silently adopted or overwritten.",
      },
      {
        title: "Open the console",
        text: "Visit the HTTPS origin you configured and sign in through Oathweave. HiveXUI shows a section for each product in this installation, so a core install has no Magnus, Cindertrace or ChatterMost section.",
        code: "https://console.example.com/",
        kind: "address",
        note: "Initial sign-in instructions are in <code>config/initial-credentials.env</code> on the identity host. <code>./hive.sh status --config installation.json</code> and <code>./hive.sh registry list --config installation.json</code> report what is running.",
      },
    ],
    guide: "/guides/hive.md",
    guideLabel: "Hive installation guide",
  },
  magnus: {
    label: "Magnus",
    kicker: "Fleet manager",
    title: "Start with one host",
    intro:
      "Hive's full profile adds Magnus with HiveXUI as its console, at /fleet. To run Magnus without Hive, this published installer sets up the server and its own Next.js console on a single host, then gives you a path to add managed nodes.",
    requires: [
      "Linux with systemd",
      "Node.js 24.22.1+ or 26.13.0+",
      "Docker Compose or existing PostgreSQL and Redis",
    ],
    steps: [
      {
        title: "Initialize",
        text: "The installer creates a project in ~/.magnus, generates credentials and a self-signed certificate, and starts the server and console as systemd user services.",
        code: "npx @hivemagnus/magnus init",
        note: "User services start at boot only with lingering enabled: <code>loginctl enable-linger $USER</code>.",
      },
      {
        title: "Open the console",
        text: "Use the URL and login printed by the installer. The generated password is printed once, so save it. The self-signed certificate is for evaluation.",
        note: "This is the standalone path. In a Hive installation there is no separate console to open: sign in to HiveXUI and choose Magnus.",
      },
      {
        title: "Add a node",
        text: "Register a Linux host in the console, then follow the agent setup instructions to give it a node secret and start its service.",
        note: "Node registration and TLS configuration are host-specific. Follow the complete guide before enabling a remote agent.",
      },
    ],
    guide: "https://github.com/ChefTaco/magnus#quick-start",
    guideLabel: "Magnus installation guide",
  },
  cindertrace: {
    label: "Cindertrace",
    kicker: "Security investigations",
    title: "Run it on its own",
    intro:
      "In a Hive installation, Cindertrace is a section of HiveXUI. To run it alone, start its retained console, API, PostgreSQL, and Redis together. Local administrator login works without Hive or Magnus; collectors and integrations are opt-in.",
    requires: ["Node.js 24.22.1+ (24.x) or 26.13.0+ (26.x)", "npm and Git", "OpenSSL", "Docker Engine and Compose v2"],
    steps: [
      {
        title: "Get the reviewed release",
        text: "Clone the public repository at the first release into a new directory. Use a fresh environment for this walkthrough.",
        code: "git clone --branch v0.1.0 https://github.com/ChefTaco/cindertrace.git\ncd cindertrace\nnpm ci",
        note: "Use the repository’s release notes when choosing a version. There is no npm installer for Cindertrace.",
      },
      {
        title: "Generate secrets and start",
        text: "Initialize this installation once, then build and start its services. Initialization generates unique secrets, an administrator password hash, and a local TLS certificate.",
        code: "npm run init\ndocker compose up --build -d",
        note: "The initial login is written only to <code>state/initial-credentials.txt</code>. Keep it, <code>.env</code>, certificates, and state private. Initialization refuses to replace existing configuration.",
      },
      {
        title: "Open and configure",
        text: "Sign in to this standalone console with the generated local administrator login. It binds to loopback. Trust the generated local certificate for development; use your own certificate and explicit network settings for remote access.",
        code: "https://localhost:3444",
        kind: "address",
        note: "Source adapters start disabled. Configure sources before starting the optional collector. For later releases, use the dedicated upgrade command and recovery runbook linked in the guide.",
      },
    ],
    guide: "https://github.com/ChefTaco/cindertrace#install",
    guideLabel: "Cindertrace installation guide",
  },
  chattermost: {
    label: "ChatterMost",
    kicker: "Chat service",
    title: "Install the verified release bundle",
    intro:
      "ChatterMost ships as a versioned Compose distribution with a manager for setup and lifecycle operations.",
    requires: [
      "Linux AMD64 or ARM64",
      "Docker Engine and Compose v2.24+",
      "curl, tar, sha256sum, patched Python 3.11.4+",
      "An HTTPS reverse proxy and certificate",
    ],
    steps: [
      {
        title: "Get the release",
        text: "Download the pinned release and its checksum file into a new temporary directory. Keep the following steps in the same terminal.",
        code: 'VERSION=0.3.3\nDOWNLOAD_DIR="$(mktemp -d)"\ncd "$DOWNLOAD_DIR"\ncurl -fLO "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/chattermost-$VERSION.tar.gz" &&\n  curl -fLO "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/SHA256SUMS"',
      },
      {
        title: "Verify before setup",
        text: "Check the archive against the release's checksum list. The archive is extracted only if the check passes.",
        code: 'awk -v a="chattermost-$VERSION.tar.gz" \'$2 == a { print; found=1 } END { if (!found) exit 1 }\' SHA256SUMS > archive.sha256 &&\n  sha256sum --check archive.sha256 &&\n  tar xzf "chattermost-$VERSION.tar.gz"',
        note: "A matching hash shows the download is intact. To verify the publisher as well, use the optional <code>gh attestation verify</code> commands in the guide.",
      },
      {
        title: "Set up and start",
        text: "Before you run this, replace chat.example.com with the HTTPS origin your reverse proxy will serve. Setup refuses an existing directory, so use a new one outside a Git checkout.",
        code: 'INSTALL_DIR="$HOME/chattermost-installation"\n./chattermost-"$VERSION"/chattermost --directory "$INSTALL_DIR" setup --server-url https://chat.example.com &&\n  "$INSTALL_DIR/chattermost" --directory "$INSTALL_DIR" start',
        note: "The initial administrator login is in <code>$INSTALL_DIR/secrets/runtime.env</code>; keep it private. The bundle does not install a reverse proxy or certificate, so complete the HTTPS steps in the guide.",
      },
    ],
    guide:
      "https://github.com/ChefTaco/ChatterMost/blob/main/docs/containers.md#install-a-release",
    guideLabel: "ChatterMost container guide",
  },
  ardent: {
    label: "Ardent + Emberfold",
    kicker: "Agent runtime",
    title: "Give an agent a durable home",
    intro:
      "Ardent is part of Magnus. Its package includes the pinned Emberfold library for context fitting; the separate Emberfold server is optional. To use Emberfold without Ardent, start from its repository.",
    requires: [
      "Node.js 24.22.1+ or 26.13.0+",
      "An OpenAI-compatible model endpoint or Codex App Server",
    ],
    steps: [
      {
        title: "Install and initialize",
        text: "Create the assistant profile and check what configuration is still needed.",
        code: "npm i -g @hivemagnus/ardent\nardent init --non-interactive\nardent doctor",
      },
      {
        title: "Connect a model",
        text: "Point the profile at your model server, then run doctor again. Settings and provider credentials stay in the profile’s private .env file.",
        code: "cat >> ~/.ardent/profiles/assistant/.env <<'EOF'\nARDENT_LLAMA_BASE_URL=http://127.0.0.1:8080/\nARDENT_LLAMA_MODEL=your-model-name\nEOF\nardent doctor",
        note: "Replace the URL and model name with your own. The guide also covers the Codex App Server.",
      },
      {
        title: "Talk and continue",
        text: "Start a session. Ardent uses Emberfold for context fitting and keeps its own durable task and checkpoint history.",
        code: "ardent chat",
        note: "For the management API, channels, and scheduled jobs, use <code>ardent gateway run</code> and the full guide.",
      },
    ],
    guide:
      "https://github.com/ChefTaco/magnus/tree/main/packages/ardent#install",
    guideLabel: "Ardent installation guide",
  },
};

const icon = (name: string) => {
  const paths: Record<string, string> = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    external: '<path d="M7 17 17 7M8 7h9v9"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
    hive: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m12 8.5 3 1.75v3.5L12 15.5l-3-1.75v-3.5z"/>',
    magnus: '<rect x="3" y="4" width="18" height="6.5" rx="1.5"/><rect x="3" y="13.5" width="18" height="6.5" rx="1.5"/><path d="M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6"/>',
    cindertrace: '<path d="m12 3 8 3v6c0 4-3.7 7.5-8 9-4.3-1.5-8-5-8-9V6z"/><path d="M8 12h3l2-4 1 8 2-4h2"/>',
    chattermost: '<path d="M4 5h16v11H10l-6 4.5z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    hivexui: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M3 9h6"/>',
    oathweave: '<path d="m12 3 8 3v6c0 4-3.7 7.5-8 9-4.3-1.5-8-5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    emberpath: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>',
    hivemem: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    hiveskills: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    emberfold: '<path d="M12 3c.6 3.8 6 6.1 6 11.2A6 6 0 0 1 6 14.2c0-2.9 1.9-4.1 2.9-6.7 1.1.8 2 1.9 2.4 3.4.7-2.2.9-5.1.7-7.9z"/><path d="M12 21a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.7-2.4 2.8-4 1.1 1.6 2.8 2.4 2.8 4A2.8 2.8 0 0 1 12 21z"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.hive}</svg>`;
};

const projectOrder: ProjectId[] = [
  "hive",
  "hivexui",
  "oathweave",
  "emberpath",
  "hivemem",
  "hiveskills",
  "magnus",
  "cindertrace",
  "chattermost",
  "emberfold",
];
const demoOrder: DemoId[] = ["hive", "magnus", "cindertrace", "chattermost", "ardent"];
type AtlasId = ProjectId | "ardent";
const atlasEdges: { from: AtlasId; to: AtlasId; bundled?: boolean }[] = [
  { from: "hive", to: "hivexui" }, { from: "hivexui", to: "oathweave" },
  { from: "hivexui", to: "emberpath" }, { from: "hivexui", to: "hivemem" },
  { from: "hivexui", to: "hiveskills" }, { from: "hivexui", to: "cindertrace" },
  { from: "hivexui", to: "chattermost" }, { from: "hivexui", to: "magnus" }, { from: "magnus", to: "ardent", bundled: true },
  { from: "emberfold", to: "ardent", bundled: true }, { from: "cindertrace", to: "magnus" },
];
// One console, shown across its product areas. The order follows HiveXUI's sidebar; HiveXUI itself
// comes last because its capture shows the shell rather than a section. Emberfold has no console
// section, so it appears separately below the gallery.
const galleryOrder: GalleryId[] = ["hive", "magnus", "oathweave", "emberpath", "hivemem", "hiveskills", "cindertrace", "chattermost", "hivexui"];
type Capture = { label: string; file: string; alt: string };
const gallery: Record<GalleryId, { path: string; captures: Capture[]; title: string; copy: string; points: string[]; extra?: string }> = {
  hive: {
    path: "HIVE > INSTALLATION",
    captures: [{ label: "Installation", file: "hive-overview", alt: "HiveXUI installation overview showing seven synthetic products passing their readiness checks" }],
    title: "See the whole installation.",
    copy: "Hive's section checks that each installed product answers. Readiness shows availability; migration and workflow acceptance are recorded separately by the controller.",
    points: ["Readiness across installed products", "Incidents gathered from product APIs", "Configured products only"],
    extra: '<p class="interface-limit">The Hive Registry has no screen here. Use <code>hive.sh registry</code>, or the read-only lookups at <code>/api/registry</code>.</p>',
  },
  magnus: {
    path: "MAGNUS > FLEET",
    captures: [
      { label: "Overview", file: "fleet-overview", alt: "HiveXUI fleet overview with a radar of nineteen synthetic nodes, gauges and recent commands" },
      { label: "Fleet map", file: "fleet-map", alt: "HiveXUI fleet map showing synthetic nodes grouped by documentation subnet" },
      { label: "Mission control", file: "fleet-mission", alt: "HiveXUI mission control showing fleet posture, dependency health and synthetic fleet figures" },
    ],
    title: "Know your fleet.",
    copy: "Magnus's console is this section of HiveXUI, at /fleet: move from host inventory to the jobs, agents, and rollouts running across it.",
    points: ["Review host health and the fleet map", "Operate jobs and managed agents", "Inspect changes in the audit log"],
    extra: `<div class="response-note"><h4>The web terminal stays off.</h4><p>It runs through a separate fleet gateway that holds the SSH key, so neither the browser nor the Magnus API does. Until you deploy it, the console offers no terminal. Opening one needs an ADMIN link, the terminal permission, identity verified in the last five minutes and an approved host key.</p><a href="https://github.com/ChefTaco/magnus/tree/main/services/fleet-gateway" target="_blank" rel="noopener noreferrer">Fleet gateway security model ${icon("external")}</a></div>`,
  },
  oathweave: {
    path: "OATHWEAVE > USERS",
    captures: [{ label: "Users", file: "identity", alt: "HiveXUI identity directory listing synthetic example.com users with roles and status" }],
    title: "One sign-in. Explicit links.",
    copy: "Users, roles, clients, service accounts, sessions and audit, alongside the identity that signs you in to everything else.",
    points: ["Use PKCE and resource audiences", "Manage MFA, passkeys and recovery", "Link accounts by issuer and subject, never by email"],
  },
  emberpath: {
    path: "EMBERPATH > TRACES",
    captures: [{ label: "Traces", file: "models", alt: "HiveXUI request traces showing synthetic model requests, outcomes and status codes" }],
    title: "Routing has one owner.",
    copy: "Providers, routing rules, tests, client keys and a trace for every request. The inference services themselves stay external.",
    points: ["Manage providers and aliases", "Apply quotas and inspect traces", "Keep model and memory endpoints distinct"],
  },
  hivemem: {
    path: "HIVEMEM > MEMORIES",
    captures: [{ label: "Memories", file: "memories", alt: "HiveXUI memory page showing synthetic memory records, sessions and agents" }],
    title: "Memory stays with its workspace.",
    copy: "Search and create memories, then open sessions, webhooks, graph evidence, conflicts, consolidation and the reasoning queue.",
    points: ["Control workspace access", "Inspect consolidation and queued work", "Retain independent storage and backups"],
  },
  hiveskills: {
    path: "HIVESKILLS",
    captures: [{ label: "Skills", file: "skills", alt: "HiveXUI skills catalogue listing synthetic skills with their descriptions" }],
    title: "Review, assign, distribute.",
    copy: "Versioned archives, channels and assignments. This is the skills registry; approved host execution belongs to Magnus.",
    points: ["Keep release archives immutable", "Distribute scoped pull manifests", "Track deployment outcomes through jobs"],
  },
  cindertrace: {
    path: "CINDERTRACE",
    captures: [
      { label: "Overview", file: "cindertrace-overview", alt: "HiveXUI security overview showing synthetic open cases, confidence and source posture" },
      { label: "Investigation", file: "cindertrace-case", alt: "HiveXUI synthetic case showing the evidence braid, affected entities, and recommended investigation" },
    ],
    title: "Follow the evidence.",
    copy: "Connect security observations to a case, preserve evidence, and revise hypotheses, signed in through Oathweave like every other section.",
    points: ["Correlate signed observations", "Compare revisions as evidence arrives", "Keep containment under human approval"],
    extra: `<div class="response-note"><h4>The lab runs apart from this console.</h4><p>The investigation lab is a separate disposable installation with synthetic evidence. It forbids external identity and integrations, so it keeps its own console with local login and is not reached through HiveXUI. Containment there is a human-approved simulation.</p><a href="/guides/cindertrace.md#try-the-evolving-investigation-lab">Try the disposable investigation lab ${icon("arrow")}</a></div><div class="response-note" id="security"><h4>Response stays deliberate.</h4><p>Administrator approval binds the exact plan, expires after ten minutes, and is used once. Optional Magnus executes host actions; response controls require its configured bridge.</p><a href="https://github.com/ChefTaco/cindertrace/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy and data handling ${icon("external")}</a></div>`,
  },
  chattermost: {
    path: "CHATTERMOST",
    captures: [{ label: "Channels", file: "chat", alt: "HiveXUI chat showing a synthetic operations channel between fictional users" }],
    title: "Keep the conversation together.",
    copy: "Channels, direct messages, threads, files and search for people and agents, in a Mattermost-compatible service.",
    points: ["Talk in channels and threads", "Connect an agent gateway", "Use compatible mobile and desktop apps"],
    extra: '<p class="interface-limit">Background mobile push and calls are not implemented. Native Mattermost sessions remain available for the official apps.</p>',
  },
  hivexui: {
    path: "SEARCH EVERY SCREEN",
    captures: [{ label: "Command palette", file: "palette", alt: "HiveXUI command palette open over the console, listing screens across products" }],
    title: "One shell. Your own credentials.",
    copy: "Press Ctrl or Cmd + K to reach any screen you can use. Sections appear only for installed products. The console is dark only for now.",
    points: ["No backend, database access or signing keys", "Access tokens stay in memory", "Each call goes to the owning product's API"],
    extra: '<p class="interface-limit">HiveXUI\'s README tracks the workflows still under acceptance. Synthetic screenshots do not establish backend authorization or workflow parity.</p>',
  },
};
const captureSrc = (capture: Capture) => `/captures/${capture.file}.webp`;
let activeInterface: GalleryId = "magnus";
const isGalleryId = (id: string): id is GalleryId => (galleryOrder as string[]).includes(id);
const initialInterface = location.hash === "#security" ? "cindertrace" : location.hash.replace("#interface-", "");
if (isGalleryId(initialInterface)) activeInterface = initialInterface;
let activeProject: ProjectId = "hive";
let activeDemo: DemoId = "hive";
let activeStep = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root");

app.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="#top" aria-label="Hive:Magnus home"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span>Hive<span class="brand-colon">:</span>Magnus</span></a>
    <nav class="main-nav" aria-label="Main navigation"><a href="#atlas">The system</a><a href="#projects">Projects</a><a href="#interfaces">The console</a><a href="#install">Install lab</a><a href="#agents">For agents</a></nav>
    <a class="header-github" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">GitHub ${icon("external")}</a>
  </div></header>
  <main id="main">
    <section class="hero shell" id="top" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-prompt" aria-hidden="true">&gt;_</span> OPEN SOURCE · SELF HOSTED</div>
        <h1 id="hero-title">Run your stack.<br/><em>On your terms.</em></h1>
        <p class="hero-lede">Identity, fleet operations, security, conversation, and context. Independent products, one browser console, and a signed installer that keeps their boundaries clear.</p>
        <div class="hero-actions"><a class="button button-primary" href="#interfaces">See the console ${icon("arrow")}</a><a class="text-link" href="#install">Find your starting point ${icon("down")}</a></div>
        <p class="hero-proof">Apache-2.0 · Your host · Your choice of integrations</p>
      </div>
      <div class="stack-index"><div class="stack-index-heading"><span class="mini-label">CHOOSE A PIECE</span><span class="stack-index-caption">Independent product boundaries</span></div>
        ${projectOrder.map((id, i) => `<a class="stack-entry project-${id}" href="#interface-${id}" data-interface-link="${id}"><span class="stack-number">${String(i + 1).padStart(2, "0")}</span><span class="stack-icon">${icon(id)}</span><span class="stack-name">${projects[id].name}<small>${projects[id].role}</small></span>${icon("arrow")}</a>`).join("")}
        <p class="stack-index-foot">Start with one. Connect the rest when you need them.</p>
      </div>
    </section>
    <section class="atlas-section" id="atlas" aria-labelledby="atlas-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">SYSTEM ATLAS / 01</span><h2 id="atlas-title">See how the pieces fit.</h2></div><p>Explore each part of the stack. Dashed lines are connections you select or configure. Solid lines show Ardent within Magnus and its bundled Emberfold library.</p></div>
      <div class="atlas-layout"><div class="atlas-map" role="group" aria-label="Interactive system atlas">
        <div class="atlas-grid" aria-hidden="true"></div><svg class="atlas-lines" aria-hidden="true">${atlasEdges.map(edge => `<path data-from="${edge.from}" data-to="${edge.to}" class="${edge.bundled ? "atlas-line-bundled" : ""}"/>`).join("")}</svg>
        <a href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" class="atlas-center" target="_blank" rel="noopener noreferrer" aria-label="Ardent agent runtime, part of Magnus"><span>ARDENT<small>AGENT RUNTIME</small></span><i></i></a>
        ${projectOrder.map((id, i) => `<button type="button" class="atlas-node node-${id}${i === 0 ? " is-active" : ""}" data-project="${id}" aria-pressed="${i === 0}"><span class="node-index">${String(i + 1).padStart(2, "0")}</span><span class="node-name">${projects[id].name}</span><span class="node-role">${projects[id].role}</span></button>`).join("")}
        <div class="atlas-annotation"><span class="line-key"></span> CONFIGURED <span class="line-key bundled"></span> BUNDLED</div>
      </div><div class="atlas-detail" id="atlas-detail" aria-live="polite"></div></div>
    </div></section>
    <section class="projects-section shell" id="projects" aria-labelledby="projects-title"><div class="section-head"><div><span class="section-kicker">OPEN PROJECTS / 02</span><h2 id="projects-title">Pick the tool<br/><span>for the work.</span></h2></div><p>Every project has its own source and installation path. Choose the capability you need first.</p></div>
      <div class="project-grid">${projectOrder.map((id, i) => {
        const p = projects[id];
        return `<article class="project-card project-${id}"><div class="project-identity"><span class="project-number">${String(i + 1).padStart(2, "0")}</span><span class="project-glyph">${icon(id)}</span><div><h3>${p.name}</h3><span class="project-role">${p.role}</span></div></div><p class="project-summary">${p.summary}</p><div class="project-actions"><a href="#interface-${id}" data-interface-link="${id}">${id === "emberfold" ? "See its CLI" : "See in console"} ${icon("arrow")}</a><a href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} GitHub repository">Source ${icon("external")}</a></div></article>`;
      }).join("")}</div>
      <div class="ardent-note"><span class="ardent-symbol" aria-hidden="true">A<span>:</span>E</span><div><span class="mini-label">INSIDE MAGNUS</span><h3>Ardent runs the work. Emberfold carries the context.</h3><p>Ardent is Magnus’s headless agent runtime. It can run on its own or under Magnus management; its pinned Emberfold library helps fit context for the next turn.</p></div><a class="text-link" href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" target="_blank" rel="noopener noreferrer">Explore Ardent ${icon("external")}</a></div>
    </section>
    <section class="screens-section" id="interfaces" aria-labelledby="screens-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">// IN THE CONSOLE / 03</span><h2 id="screens-title">One console.<br/><span>Every product you install.</span></h2></div><p>HiveXUI is the single browser UI of a Hive installation. These captures are the real console with synthetic data, shown across its product areas.</p></div>
      <div class="interface-tabs" role="tablist" aria-label="Choose a console area">${galleryOrder.map(id => `<button type="button" role="tab" class="project-${id}" id="interface-tab-${id}" aria-controls="interface-${id}" aria-selected="${id === activeInterface}" tabindex="${id === activeInterface ? 0 : -1}" data-interface="${id}"><span class="interface-tab-icon">${icon(id)}</span><span>${projects[id].name}</span></button>`).join("")}</div>
      ${galleryOrder.map(id => {
        const p = projects[id], area = gallery[id], first = area.captures[0];
        return `<section class="interface-panel project-${id}" id="interface-${id}" role="tabpanel" aria-labelledby="interface-tab-${id}" tabindex="0" ${id !== activeInterface ? "hidden" : ""}>
          <div class="interface-toolbar"><span><span class="interface-prompt" aria-hidden="true">&gt;_</span> ${area.path}</span>${area.captures.length > 1 ? `<div class="capture-switch" role="group" aria-label="${p.name} capture">${area.captures.map((capture, i) => `<button type="button" data-capture="${i}" aria-pressed="${i === 0}">${capture.label}</button>`).join("")}</div>` : `<span>SELECT IMAGE TO OPEN FULL SIZE</span>`}</div>
          <figure class="interface-figure"><div class="interface-visual"><div class="screen-frame"><a class="capture-link" href="${captureSrc(first)}" target="_blank" rel="noopener noreferrer" aria-label="Open full ${p.name} capture"><img src="${captureSrc(first)}" alt="${first.alt}" loading="lazy" decoding="async" width="1440" height="900" /></a></div><p class="capture-caption">HiveXUI · <span class="capture-name">${first.label}</span> · synthetic data · <a class="capture-full-link" href="${captureSrc(first)}" target="_blank" rel="noopener noreferrer">Open full capture ${icon("external")}</a></p></div>
          <figcaption class="interface-story"><span class="mini-label">${p.role}</span><h3>${area.title}</h3><p>${area.copy}</p><ul>${area.points.map(point => `<li>${point}</li>`).join("")}</ul><a class="text-link" href="/guides/${id}.md">${p.name} guide ${icon("arrow")}</a>${area.extra ?? ""}</figcaption></figure>
        </section>`;
      }).join("")}
      <section class="console-aside project-emberfold" id="interface-emberfold" tabindex="-1" aria-labelledby="emberfold-aside-title"><div class="screen-terminal"><div class="terminal-top"><span>EMBERFOLD / CLI</span><span>SYNTHETIC INPUT</span></div><p><span>$</span> emberfold prepare --input emberfold.json --dry-run</p><pre tabindex="0" aria-label="Excerpt from actual Emberfold dry run output">{
  "tokens": {
    "input_tokens": 100,
    "max_input_tokens": 12000,
    "output_reserve_tokens": 4000,
    "method": "estimate"
  },
  "protected_spans_verified": 0,
  "compacted": false,
  "fits": true
}</pre><div class="terminal-foot">OUTPUT EXCERPT · NO MODEL CALLS</div></div><div class="console-aside-copy"><span class="mini-label">${projects.emberfold.role}</span><h3 id="emberfold-aside-title">Emberfold has no screen.</h3><p>It is a library, CLI and optional HTTP service, so it is not a console section. This excerpt is from a real synthetic CLI dry run: inspect a context preparation result before using it in an agent.</p><ul><li>Review the token budget</li><li>Check protected spans</li><li>Use the library, CLI, or optional HTTP service</li></ul><a class="text-link" href="/guides/emberfold.md">Emberfold guide ${icon("arrow")}</a></div></section>
      <p class="interface-footnote">You are viewing documentation and sample captures. This site does not connect to an operational fleet or security installation.</p>
    </div></section>
    <section class="suite-boundary shell" aria-label="Release and acceptance status"><h2>Know what you are installing.</h2><p>Hive installs only from a signed release, listed on the <a href="https://github.com/ChefTaco/hive/releases" target="_blank" rel="noopener noreferrer">Hive releases page</a>. A passing disposable rehearsal is not production cutover approval, physical multi-host certification or ARM64 certification. Existing installations keep their own recovery paths and upgrade guides. Ollama, llama.cpp and hosted providers remain external; Hive only verifies and registers their endpoints.</p></section>
    <section class="install-section shell" id="install" aria-labelledby="install-title"><div class="section-head"><div><span class="section-kicker">INSTALL LAB / 04</span><h2 id="install-title">Try it on your host.</h2></div><p>Follow the first steps here, then continue with each project’s full guide. These walkthroughs explain commands; they do not run them for you.</p></div>
      <div class="install-layout"><div class="demo-sidebar"><div class="demo-tabs" role="tablist" aria-orientation="vertical" aria-label="Choose an installation walkthrough">${demoOrder.map((id, i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="demo-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-demo="${id}"><span class="tab-counter">${String(i + 1).padStart(2, "0")}</span><span>${demos[id].label}</span>${icon("chevron")}</button>`).join("")}</div><p class="demo-disclaimer">Use a fresh environment for a first install. Existing installations follow their own upgrade guides.</p></div><div class="demo-panel" id="demo-panel" role="tabpanel" aria-labelledby="tab-hive" tabindex="0"></div></div>
    </section>
    <section class="agents-section shell" id="agents" aria-labelledby="agents-title">
      <div class="section-head"><div><span class="section-kicker">FOR AGENTS / 05</span><h2 id="agents-title">A direct path into the docs.</h2></div><p>Plain Markdown guides with prerequisites, commands, expected results, and reviewed source revisions. Start with the part you need.</p></div>
      <div class="agent-index-links"><a class="text-link" href="/llms.txt" type="text/plain">Read llms.txt ${icon("arrow")}</a><a class="text-link" href="/index.md" type="text/markdown">Site overview in Markdown ${icon("arrow")}</a></div>
      <ul class="agent-guides" aria-label="Project guides in Markdown">${projectOrder.map((id, i) => `<li><a href="/guides/${id}.md" type="text/markdown"><span class="mini-label">${String(i + 1).padStart(2, "0")} / MARKDOWN GUIDE</span><span class="agent-guide-title">${projects[id].name}${id === "magnus" ? " + Ardent" : ""} ${icon("arrow")}</span><span>${projects[id].role}</span></a></li>`).join("")}</ul>
    </section>
    <section class="closing"><div class="shell closing-inner"><div><span class="section-kicker">YOUR INFRASTRUCTURE. YOUR CHOICE.</span><h2>Start with one piece.<br/><em>Make it yours.</em></h2></div><a class="button button-light" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">Explore the repositories ${icon("arrow")}</a></div></section>
  </main>
  <footer class="site-footer"><div class="shell footer-inner"><a class="brand" href="#top"><span>Hive<span class="brand-colon">:</span>Magnus</span></a><p>Open source tools for self-hosted agents.</p><div><a href="https://github.com/ChefTaco/hive">Hive</a><a href="https://github.com/ChefTaco/HiveXUI">HiveXUI</a><a href="https://github.com/ChefTaco/Oathweave">Oathweave</a><a href="https://github.com/ChefTaco/Emberpath">Emberpath</a><a href="https://github.com/ChefTaco/HiveMem">HiveMem</a><a href="https://github.com/ChefTaco/HiveSkills">HiveSkills</a><a href="https://github.com/ChefTaco/magnus">Magnus</a><a href="https://github.com/ChefTaco/cindertrace">Cindertrace</a><a href="https://github.com/ChefTaco/ChatterMost">ChatterMost</a><a href="https://github.com/ChefTaco/emberfold">Emberfold</a><a href="https://github.com/ChefTaco/HiveMagnus">Site source</a></div><p class="footer-legal">Each project is licensed under Apache-2.0. ChatterMost is independently developed and Mattermost-compatible; Mattermost is a trademark of Mattermost, Inc., which does not affiliate with, endorse, or sponsor it.</p></div></footer>
  <div class="sr-only" id="announce" role="status" aria-live="polite"></div>
`;

function renderAtlas() {
  const p = projects[activeProject];
  const detail = document.querySelector<HTMLDivElement>("#atlas-detail")!;
  detail.innerHTML = `<span class="detail-meta">SELECTED SYSTEM / ${p.role.toUpperCase()}</span><div class="detail-body"><h3>${p.name}</h3><p>${p.detail}</p><h4>Connects to</h4><ul class="detail-links">${p.connections.map((c) => `<li><strong>${c.to}</strong> <span>${c.how}</span></li>`).join("")}</ul><a href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="Open ${p.name} GitHub repository">Project source ${icon("external")}</a></div>`;
  document
    .querySelectorAll<HTMLButtonElement>(".atlas-node")
    .forEach((button) => {
      const active = button.dataset.project === activeProject;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  renderAtlasLines();
}

function renderAtlasLines() {
  const map = document.querySelector<HTMLElement>(".atlas-map")!;
  const svg = map.querySelector<SVGSVGElement>(".atlas-lines")!;
  const bounds = map.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
  const center = (id: string) => {
    const node = map.querySelector<HTMLElement>(id === "ardent" ? ".atlas-center" : `.node-${id}`)!;
    const rect = node.getBoundingClientRect();
    return [rect.left - bounds.left + rect.width / 2, rect.top - bounds.top + rect.height / 2];
  };
  svg.querySelectorAll<SVGPathElement>("path").forEach(path => {
    const from = path.dataset.from!, to = path.dataset.to!;
    path.setAttribute("d", `M${center(from).join(" ")} L${center(to).join(" ")}`);
    path.classList.toggle("atlas-line-active", from === activeProject || to === activeProject);
  });
}

function selectInterface(id: GalleryId, focus = false) {
  activeInterface = id;
  document.querySelectorAll<HTMLButtonElement>("[data-interface]").forEach(button => {
    const active = button.dataset.interface === id;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  galleryOrder.forEach(area => {
    document.querySelector<HTMLElement>(`#interface-${area}`)!.hidden = area !== id;
  });
}

// Emberfold sits below the gallery rather than in it, so its links scroll there instead of selecting.
function showInterface(id: string) {
  if (isGalleryId(id)) {
    selectInterface(id);
    document.querySelector<HTMLElement>("#interfaces")!.scrollIntoView();
  } else if (id === "emberfold") {
    document.querySelector<HTMLElement>("#interface-emberfold")!.scrollIntoView();
  }
}

document.querySelectorAll<HTMLButtonElement>("[data-interface]").forEach(button => {
  button.addEventListener("click", () => selectInterface(button.dataset.interface as GalleryId));
  button.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = galleryOrder.indexOf(activeInterface);
    const next = event.key === "Home" ? 0 : event.key === "End" ? galleryOrder.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + galleryOrder.length) % galleryOrder.length;
    selectInterface(galleryOrder[next], true);
  });
});
document.querySelectorAll<HTMLAnchorElement>("[data-interface-link]").forEach(link => {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.dataset.interfaceLink!;
    showInterface(id);
    history.pushState(null, "", `#interface-${id}`);
    document.querySelector<HTMLElement>(`#interface-${id}`)!.focus({ preventScroll: true });
  });
});
window.addEventListener("hashchange", () => {
  showInterface(location.hash === "#security" ? "cindertrace" : location.hash.replace("#interface-", ""));
});
galleryOrder.forEach(id => {
  const panel = document.querySelector<HTMLElement>(`#interface-${id}`)!;
  panel.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(button => {
    button.addEventListener("click", () => {
      const capture = gallery[id].captures[Number(button.dataset.capture)];
      const img = panel.querySelector<HTMLImageElement>("img")!;
      img.src = captureSrc(capture);
      img.alt = capture.alt;
      panel.querySelectorAll<HTMLAnchorElement>(".capture-link, .capture-full-link").forEach(link => { link.href = captureSrc(capture); });
      panel.querySelector(".capture-name")!.textContent = capture.label;
      panel.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    });
  });
});

function renderDemo() {
  const d = demos[activeDemo];
  const s = d.steps[activeStep];
  const panel = document.querySelector<HTMLDivElement>("#demo-panel")!;
  panel.setAttribute("aria-labelledby", `tab-${activeDemo}`);
  panel.innerHTML = `<div class="demo-heading"><span class="mini-label">${d.kicker.toUpperCase()} / WALKTHROUGH</span><h3>${d.title}</h3><p>${d.intro}</p></div>
    <div class="requirements"><span>BEFORE YOU BEGIN</span><ul>${d.requires.map((item) => `<li>${item}</li>`).join("")}</ul></div>
    <div class="step-head"><span>STEP 0${activeStep + 1} / 0${d.steps.length}</span><div class="step-progress" aria-hidden="true">${d.steps.map((_, i) => `<i class="${i <= activeStep ? "done" : ""}"></i>`).join("")}</div></div>
    <div class="step-content"><h4>${s.title}</h4><p>${s.text}</p>${s.code ? `<div class="code-block"><div class="code-top"><span>${s.kind === "address" ? "BROWSER ADDRESS" : "HOST TERMINAL"}</span><button type="button" class="copy-command" aria-label="Copy ${s.kind === "address" ? "address" : "command"} for ${s.title}">${icon("copy")} Copy</button></div><pre tabindex="0" aria-label="${s.kind === "address" ? "Address" : "Commands"} for ${s.title}"><code></code></pre></div>` : ""}${s.note ? `<p class="step-note"><strong>Keep in mind</strong> ${s.note}</p>` : ""}</div>
    <div class="demo-controls"><button type="button" class="step-button" data-direction="prev" ${activeStep === 0 ? "disabled" : ""}>← Previous</button><span>${activeStep + 1} of ${d.steps.length}</span><button type="button" class="step-button next" data-direction="next" ${activeStep === d.steps.length - 1 ? "disabled" : ""}>Next step →</button></div><a class="guide-link" href="${d.guide}" target="_blank" rel="noopener noreferrer">Continue with the ${d.guideLabel} ${icon("external")}</a>`;
  const code = panel.querySelector("pre code");
  if (code && s.code) code.textContent = s.code;
  panel
    .querySelector<HTMLButtonElement>(".copy-command")
    ?.addEventListener("click", async (event) => {
      if (!s.code) return;
      const button = event.currentTarget as HTMLButtonElement;
      try {
        await navigator.clipboard.writeText(s.code);
        button.innerHTML = `${icon("check")} Copied`;
        document.querySelector("#announce")!.textContent =
          `${s.title} ${s.kind === "address" ? "address" : "command"} copied`;
        window.setTimeout(() => {
          button.innerHTML = `${icon("copy")} Copy`;
        }, 2400);
      } catch {
        button.textContent = "Select text to copy";
        document.querySelector("#announce")!.textContent =
          "Copy failed. Select the command text to copy it.";
      }
    });
  panel
    .querySelectorAll<HTMLButtonElement>("[data-direction]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        activeStep += button.dataset.direction === "next" ? 1 : -1;
        renderDemo();
        panel.focus({ preventScroll: true });
      }),
    );
  document
    .querySelectorAll<HTMLButtonElement>('.demo-tabs [role="tab"]')
    .forEach((button) => {
      const active = button.dataset.demo === activeDemo;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
}

document.querySelectorAll<HTMLButtonElement>(".atlas-node").forEach((button) =>
  button.addEventListener("click", () => {
    activeProject = button.dataset.project as ProjectId;
    renderAtlas();
  }),
);
document
  .querySelectorAll<HTMLButtonElement>('.demo-tabs [role="tab"]')
  .forEach((button) => {
    button.addEventListener("click", () => {
      activeDemo = button.dataset.demo as DemoId;
      activeStep = 0;
      renderDemo();
    });
    button.addEventListener("keydown", (event) => {
      if (
        ![
          "ArrowDown",
          "ArrowUp",
          "ArrowRight",
          "ArrowLeft",
          "Home",
          "End",
        ].includes(event.key)
      )
        return;
      event.preventDefault();
      const current = demoOrder.indexOf(button.dataset.demo as DemoId);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? demoOrder.length - 1
            : (current +
                (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) +
                demoOrder.length) %
              demoOrder.length;
      activeDemo = demoOrder[next];
      activeStep = 0;
      renderDemo();
      document.querySelector<HTMLButtonElement>(`#tab-${activeDemo}`)?.focus();
    });
  });
renderAtlas();
new ResizeObserver(renderAtlasLines).observe(document.querySelector(".atlas-map")!);
void document.fonts.ready.then(renderAtlasLines);
renderDemo();
if (location.hash === "#security" || location.hash.startsWith("#interface-")) {
  requestAnimationFrame(() => showInterface(location.hash === "#security" ? "cindertrace" : location.hash.replace("#interface-", "")));
}
