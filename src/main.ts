import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";

type ProjectId = "hive" | "emberpath" | "oathweave" | "hivemem" | "hiveskills" | "hivexui" | "magnus" | "cindertrace" | "chattermost" | "emberfold";
type DemoId = "hive" | "magnus" | "cindertrace" | "chattermost" | "ardent";
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
    candidate?: boolean;
    image?: string;
    imageAlt?: string;
    connections: { to: string; how: string }[];
  }
> = {
  hive: {
    name: "Hive",
    role: "Install · upgrade · recover",
    summary: "A tested deployment of independent products.",
    detail:
      "Hive is becoming the Bash installer and recovery controller for the ecosystem. It pins tested product versions, coordinates Compose deployments per host, and preserves installation boundaries. The new suite is a candidate; published legacy packages remain available for recovery.",
    href: "https://github.com/ChefTaco/hive",
    image: "/captures/hive-console.webp",
    imageAlt:
      "Retained legacy Hive console with sample data; the shared console is moving to HiveXUI",
    connections: [
      { to: "Oathweave / Emberpath / HiveMem / HiveSkills", how: "core API products with independent data and credentials" },
      { to: "HiveXUI", how: "static TypeScript console behind HTTPS ingress" },
      { to: "Magnus", how: "authenticated host jobs and native agent execution" },
      { to: "External inference", how: "verified endpoints and protected references; no model or runtime provisioning" },
    ],
  },
  emberpath: {
    name: "Emberpath", role: "Models · routing · telemetry", candidate: true,
    summary: "Route requests to the providers you choose.",
    detail: "Emberpath owns external providers, aliases, quotas, inference requests and routing telemetry. Ollama, llama.cpp and hosted APIs remain independently operated dependencies. Hive verifies endpoints; it never installs or stores inference services or models.",
    href: "/guides/emberpath.md",
    connections: [{ to: "HiveXUI", how: "models, providers, tests and traces through authorized APIs" }, { to: "Oathweave", how: "resource-specific suite access; native API keys remain separate" }, { to: "External inference", how: "OpenAI-compatible and native provider protocols" }],
  },
  oathweave: {
    name: "Oathweave", role: "Identity · access · enrollment", candidate: true,
    summary: "One sign-in, explicit access to each product.",
    detail: "Oathweave owns identity, browser sign-in, MFA, passkeys, recovery, roles and service identities. Product accounts link explicitly by issuer and subject. Each receiving API validates its own audience and permissions; identities are never merged by email.",
    href: "/guides/oathweave.md",
    connections: [{ to: "HiveXUI", how: "public clients with Authorization Code and PKCE; browser tokens stay in memory" }, { to: "Product APIs", how: "independent resource authorization and explicit account links" }, { to: "Magnus", how: "identity mappings; approved host changes remain Magnus jobs" }],
  },
  hivemem: {
    name: "HiveMem", role: "Memory · retrieval · workspaces", candidate: true,
    summary: "Keep durable memory within its workspace.",
    detail: "HiveMem owns memory storage and retrieval, sessions, graph evidence, consolidation, webhooks and workspace access. Existing storage formats and native SDKs remain available. Its credentials and backup lifecycle stay independent of model routing.",
    href: "/guides/hivemem.md",
    connections: [{ to: "HiveXUI", how: "memory, workspace and operation workflows through scoped APIs" }, { to: "Ardent / Hermes", how: "separate workspace-scoped memory credentials" }, { to: "Oathweave", how: "explicit identity links and resource authorization" }],
  },
  hiveskills: {
    name: "HiveSkills", role: "Registry · archives · assignments", candidate: true,
    summary: "Distribute reviewed, immutable skills.",
    detail: "HiveSkills owns the registry, versioned archives, channels, assignments and distribution contracts. Privileged deployment execution belongs to Magnus authenticated jobs and agents. Existing native compatibility paths remain until replacement acceptance passes.",
    href: "/guides/hiveskills.md",
    connections: [{ to: "HiveXUI", how: "catalogue, archive and assignment administration" }, { to: "Magnus", how: "approved host deployment execution" }, { to: "Agents", how: "authenticated manifests and immutable archive distribution" }],
  },
  hivexui: {
    name: "HiveXUI", role: "Shared console · browser only", candidate: true,
    summary: "A common workspace across the product APIs.",
    detail: "HiveXUI is a strict TypeScript, React and Vite browser application served as static assets. HTTPS ingress routes same-origin API calls without administrator credential injection. Identity, models, memory, skills, security and chat share one shell. Magnus remains a linked console until a later merge.",
    href: "/guides/hivexui.md",
    connections: [{ to: "Oathweave", how: "browser sign-in and resource-specific access" }, { to: "Product APIs", how: "released browser-safe contracts; no database access or signing keys" }, { to: "Magnus", how: "separate console, prepared for later integration" }],
  },
  magnus: {
    name: "Magnus",
    role: "Fleet · operations · Ardent",
    summary: "See and operate the hosts where your agents live.",
    detail:
      "Magnus brings fleet inventory, jobs, skills, rollouts, and audit into one web console. Its Ardent runtime runs durable agent tasks on a host or under fleet management.",
    href: "https://github.com/ChefTaco/magnus",
    image: "/captures/magnus-console.webp",
    imageAlt: "Magnus fleet console with synthetic host information",
    connections: [
      { to: "Ardent", how: "ships the runtime and can manage it on fleet hosts" },
      { to: "Oathweave / Emberpath / HiveMem", how: "optional sign-in, model routing and shared memory" },
      { to: "Cindertrace", how: "optional observations, fleet context, and approved host response" },
    ],
  },
  cindertrace: {
    name: "Cindertrace",
    role: "Security · cases · evidence",
    summary: "Turn security observations into an investigation.",
    detail:
      "A standalone security console for correlated cases, hashed evidence, investigations, policies, and audit. Use local administrator login, then optionally connect Oathweave identity or Magnus fleet context and approved response. A separate disposable lab lets people and agents revise an investigation as evidence arrives.",
    href: "https://github.com/ChefTaco/cindertrace",
    image: "/captures/cindertrace-overview.webp",
    imageAlt: "Cindertrace security overview showing a synthetic authentication case and source posture",
    connections: [
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
      "A Mattermost-compatible chat backend for channels, direct messages, threads, and agent conversations. It includes a compact web UI and connects to the official Mattermost mobile and desktop apps. Background mobile push and calls are not implemented. Suite browser identity is a candidate integration; native Mattermost sessions remain available.",
    href: "https://github.com/ChefTaco/ChatterMost",
    image: "/captures/chattermost-chat.webp",
    imageAlt:
      "ChatterMost channel conversation in a disposable sample environment",
    connections: [
      { to: "Hermes Agent", how: "documented setup through its Mattermost gateway" },
      { to: "Ardent", how: "optional Mattermost channel, configured in the Ardent profile" },
    ],
  },
  emberfold: {
    name: "Emberfold",
    role: "Context · continuity",
    summary: "Carry the right context into the next agent turn.",
    detail:
      "A portable context engine with a TypeScript library, CLI, HTTP service, and Hermes plugin. Ardent uses its library for context fitting while retaining its own authoritative history.",
    href: "https://github.com/ChefTaco/emberfold",
    connections: [
      { to: "Ardent", how: "pinned library for context fitting; the HTTP service is optional" },
      { to: "Hermes Agent", how: "standard context-engine plugin" },
    ],
  },
};

const demos: Record<DemoId, Demo> = {
  hive: {
    label: "Hive (published legacy)",
    kicker: "Recovery-compatible release",
    title: "Explore the published launcher",
    intro:
      "This walkthrough describes the existing published launcher. The new Bash/Compose suite is under isolated acceptance and has no official signed release bundle yet. Preserve existing installations and use their upgrade procedures.",
    requires: [
      "Linux or macOS",
      "Node.js 24.22.1+ or 26.13.0+",
      "OpenSSL",
      "Docker, or your own Qdrant and Redis",
      "flock for HiveMem (macOS: brew install flock)",
    ],
    steps: [
      {
        title: "Initialize",
        text: "Choose the services for this host. The launcher asks before it installs packages or starts containers, then prepares local configuration and TLS.",
        code: "npx @hivemagnus/hive init",
        note: "For the optional Skills registry, use <code>npx @hivemagnus/hive init --services all</code>.",
      },
      {
        title: "Start the stack",
        text: "Run the selected services in the foreground for your first look. Ctrl-C stops them.",
        code: "npx @hivemagnus/hive start",
      },
      {
        title: "Open the console",
        text: "Visit the local HTTPS console and sign in as admin with the password IAM writes on its first start.",
        code: "https://localhost:9443/",
        kind: "address",
        note: "The password is in <code>~/.hive/iam/initial-credentials.env</code>; keep that file private. The certificate comes from a local CA that <code>hive init</code> creates, so your browser warns the first time.",
      },
    ],
    guide: "https://github.com/ChefTaco/hive#quick-start-with-npm",
    guideLabel: "Hive installation guide",
  },
  magnus: {
    label: "Magnus",
    kicker: "Fleet manager",
    title: "Start with one host",
    intro:
      "The managed installer starts the server and console on a single host, then gives you a path to add managed nodes.",
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
        note: "The console URL depends on your host name, so use the one the installer prints.",
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
    title: "Start a standalone security console",
    intro:
      "Run the console, API, PostgreSQL, and Redis together. Local administrator login works without Hive or Magnus; collectors and integrations are opt-in.",
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
        text: "Sign in with the generated local administrator login. The console binds to loopback. Trust the generated local certificate for development; use your own certificate and explicit network settings for remote access.",
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
  { from: "hivexui", to: "chattermost" }, { from: "magnus", to: "ardent", bundled: true },
  { from: "emberfold", to: "ardent", bundled: true }, { from: "cindertrace", to: "magnus" },
];
const interfaceNotes: Record<ProjectId, { title: string; copy: string; points: string[] }> = {
  hive: { title: "Preserve the recovery path.", copy: "This capture shows the retained legacy console. Hive is becoming the suite installer; HiveXUI owns the shared browser application. Replacement workflows and recovery gates must pass before legacy frontends retire.", points: ["Pin independent product releases", "Plan, install, upgrade and recover", "Keep existing installations separate"] },
  emberpath: { title: "Routing has one owner.", copy: "A standalone model API, extracted from Hive. The model module belongs in HiveXUI; inference services remain external.", points: ["Manage providers and aliases", "Apply quotas and inspect traces", "Keep model and memory endpoints distinct"] },
  oathweave: { title: "Identity, with explicit boundaries.", copy: "A standalone identity API with browser authentication and explicit product account links.", points: ["Use PKCE and resource audiences", "Manage MFA, passkeys and recovery", "Preserve native identities and memberships"] },
  hivemem: { title: "Memory stays with its workspace.", copy: "A standalone memory API and native SDKs. HiveXUI provides search, sessions, graph evidence and operations.", points: ["Control workspace access", "Inspect consolidation and queued work", "Retain independent storage and backups"] },
  hiveskills: { title: "Review, assign, distribute.", copy: "An independent skills registry. Immutable archives and assignments stay here; approved host execution belongs to Magnus.", points: ["Keep release archives immutable", "Distribute scoped pull manifests", "Track deployment outcomes through jobs"] },
  hivexui: { title: "One shell. Authorized product APIs.", copy: "The shared console is a static browser application. Its candidate modules are under workflow and migration acceptance; the Magnus console remains separate.", points: ["Identity, models, memory and skills", "Security investigations and chat", "No infrastructure credentials in the browser"] },
  magnus: { title: "Know your fleet.", copy: "Move from host inventory to the jobs, agents, and rollouts running across it.", points: ["Review host health and inventory", "Operate jobs and managed agents", "Inspect changes in the audit log"] },
  cindertrace: { title: "Follow the evidence.", copy: "Connect security observations to a case, preserve evidence, and revise hypotheses. Try the evolving investigation lab in a separate disposable installation.", points: ["Correlate signed observations", "Compare revisions as evidence arrives", "Keep containment under human approval"] },
  chattermost: { title: "Keep the conversation together.", copy: "Channels, direct messages, and threads for people and agents, in a Mattermost-compatible service.", points: ["Talk in channels and threads", "Connect an agent gateway", "Use compatible mobile and desktop apps"] },
  emberfold: { title: "See what fits the next turn.", copy: "Inspect a context preparation result before using it in an agent. This excerpt is from a real synthetic CLI dry run.", points: ["Review the token budget", "Check protected spans", "Use the library, CLI, or optional HTTP service"] },
};
let activeInterface: ProjectId = "cindertrace";
const initialInterface = location.hash.replace("#interface-", "");
if (projectOrder.includes(initialInterface as ProjectId)) activeInterface = initialInterface as ProjectId;
let activeProject: ProjectId = "hive";
let activeDemo: DemoId = "hive";
let activeStep = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root");

app.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="#top" aria-label="Hive:Magnus home"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span>Hive<span class="brand-colon">:</span>Magnus</span></a>
    <nav class="main-nav" aria-label="Main navigation"><a href="#atlas">The system</a><a href="#projects">Projects</a><a href="#interfaces">Interfaces</a><a href="#install">Install lab</a><a href="#agents">For agents</a></nav>
    <a class="header-github" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">GitHub ${icon("external")}</a>
  </div></header>
  <main id="main">
    <section class="hero shell" id="top" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-line"></span> OPEN SOURCE · SELF HOSTED</div>
        <h1 id="hero-title">Run your stack.<br/><em>On your terms.</em></h1>
        <p class="hero-lede">Identity, fleet operations, security, conversation, and context. Independent products, a shared console, and an installer that keeps their boundaries clear.</p>
        <div class="hero-actions"><a class="button button-primary" href="#interfaces">See the interfaces ${icon("arrow")}</a><a class="text-link" href="#install">Find your starting point ${icon("down")}</a></div>
        <p class="hero-proof">Apache-2.0 · Your host · Your choice of integrations</p>
      </div>
      <div class="stack-index"><div class="stack-index-heading"><span class="mini-label">CHOOSE A PIECE</span><span class="stack-index-caption">Independent product boundaries</span></div>
        ${projectOrder.map((id, i) => `<a class="stack-entry project-${id}" href="#interface-${id}" data-interface-link="${id}"><span class="stack-number">${String(i + 1).padStart(2, "0")}</span><span class="stack-icon">${icon(id)}</span><span class="stack-name">${projects[id].name}<small>${projects[id].role}</small></span>${icon("arrow")}</a>`).join("")}
        <p class="stack-index-foot">Start with one. Connect the rest when you need them.</p>
      </div>
    </section>
    <section class="atlas-section" id="atlas" aria-labelledby="atlas-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">SYSTEM ATLAS / 01</span><h2 id="atlas-title">See how the pieces fit.</h2></div><p>Explore each part of the stack. Dashed lines are optional integrations. Solid lines show Ardent within Magnus and its bundled Emberfold library.</p></div>
      <div class="atlas-layout"><div class="atlas-map" role="group" aria-label="Interactive system atlas">
        <div class="atlas-grid" aria-hidden="true"></div><svg class="atlas-lines" aria-hidden="true">${atlasEdges.map(edge => `<path data-from="${edge.from}" data-to="${edge.to}" class="${edge.bundled ? "atlas-line-bundled" : ""}"/>`).join("")}</svg>
        <a href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" class="atlas-center" target="_blank" rel="noopener noreferrer" aria-label="Ardent agent runtime, part of Magnus"><span>ARDENT<small>AGENT RUNTIME</small></span><i></i></a>
        ${projectOrder.map((id, i) => `<button type="button" class="atlas-node node-${id}${i === 0 ? " is-active" : ""}" data-project="${id}" aria-pressed="${i === 0}"><span class="node-index">${String(i + 1).padStart(2, "0")}</span><span class="node-name">${projects[id].name}</span><span class="node-role">${projects[id].role}</span></button>`).join("")}
        <div class="atlas-annotation"><span class="line-key"></span> OPTIONAL <span class="line-key bundled"></span> BUNDLED</div>
      </div><div class="atlas-detail" id="atlas-detail" aria-live="polite"></div></div>
    </div></section>
    <section class="projects-section shell" id="projects" aria-labelledby="projects-title"><div class="section-head"><div><span class="section-kicker">OPEN PROJECTS / 02</span><h2 id="projects-title">Pick the tool<br/><span>for the work.</span></h2></div><p>Every project has its own source and installation path. Choose the capability you need first.</p></div>
      <div class="project-grid">${projectOrder.map((id, i) => {
        const p = projects[id];
        return `<article class="project-card project-${id}"><div class="project-identity"><span class="project-number">${String(i + 1).padStart(2, "0")}</span><span class="project-glyph">${icon(id)}</span><div><h3>${p.name}</h3><span class="project-role">${p.role}</span></div></div><p class="project-summary">${p.summary}</p><div class="project-actions"><a href="#interface-${id}" data-interface-link="${id}">See interface ${icon("arrow")}</a><a href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} ${p.candidate ? "candidate guide" : "GitHub repository"}">${p.candidate ? "Candidate guide" : "Source"} ${icon("external")}</a></div></article>`;
      }).join("")}</div>
      <div class="ardent-note"><span class="ardent-symbol" aria-hidden="true">A<span>:</span>E</span><div><span class="mini-label">INSIDE MAGNUS</span><h3>Ardent runs the work. Emberfold carries the context.</h3><p>Ardent is Magnus’s headless agent runtime. It can run on its own or under Magnus management; its pinned Emberfold library helps fit context for the next turn.</p></div><a class="text-link" href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" target="_blank" rel="noopener noreferrer">Explore Ardent ${icon("external")}</a></div>
    </section>
    <section class="screens-section" id="interfaces" aria-labelledby="screens-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">IN THE INTERFACE / 03</span><h2 id="screens-title">See the tools at work.</h2></div><p>Retained interfaces, candidate product boundaries, and a verified CLI example. Captures use synthetic or disposable data.</p></div>
      <div class="interface-tabs" role="tablist" aria-label="Choose a project interface">${projectOrder.map((id, i) => `<button type="button" role="tab" class="project-${id}" id="interface-tab-${id}" aria-controls="interface-${id}" aria-selected="${id === activeInterface}" tabindex="${id === activeInterface ? 0 : -1}" data-interface="${id}"><span class="interface-tab-number">${String(i + 1).padStart(2, "0")}</span><span>${projects[id].name}</span><span class="interface-tab-icon">${icon(id)}</span></button>`).join("")}</div>
      ${projectOrder.map(id => {
        const p = projects[id], note = interfaceNotes[id];
        return `<section class="interface-panel project-${id}" id="interface-${id}" role="tabpanel" aria-labelledby="interface-tab-${id}" tabindex="0" ${id !== activeInterface ? "hidden" : ""}>
          <div class="interface-toolbar"><span>${p.candidate ? "PRODUCT BOUNDARY / CANDIDATE" : id === "emberfold" ? "CLI / VERIFIED DRY RUN" : id === "hive" ? "LEGACY CONSOLE / SYNTHETIC DATA" : "CONSOLE / SYNTHETIC DATA"}</span>${id === "cindertrace" ? `<div class="capture-switch" role="group" aria-label="Cindertrace capture"><button type="button" data-capture="overview" aria-pressed="true">Overview</button><button type="button" data-capture="case" aria-pressed="false">Investigation</button></div>` : `<span>${p.candidate ? "INDEPENDENT RELEASES" : id === "emberfold" ? "NO MODEL CALLS" : "SELECT IMAGE TO OPEN FULL SIZE"}</span>`}</div>
          <figure class="interface-figure"><div class="interface-visual"><div class="screen-frame">${p.candidate ? `<div class="boundary-panel"><span class="mini-label">${p.role.toUpperCase()}</span><h4>${p.name}</h4><p>${p.summary}</p><dl>${p.connections.map(connection => `<div><dt>${connection.to}</dt><dd>${connection.how}</dd></div>`).join("")}</dl><p class="boundary-status">Candidate implementation · release and migration acceptance in progress</p></div>` : p.image ? `<a class="capture-link" href="${p.image}" target="_blank" rel="noopener noreferrer" aria-label="Open full ${p.name} capture"><img src="${p.image}" alt="${p.imageAlt}" loading="lazy" decoding="async" width="${id === "cindertrace" ? 1440 : 1280}" height="${id === "cindertrace" ? 900 : 720}" /></a>` : `<div class="screen-terminal"><div class="terminal-top"><span>EMBERFOLD / CLI</span><span>SYNTHETIC INPUT</span></div><p><span>$</span> emberfold prepare --input emberfold.json --dry-run</p><pre tabindex="0" aria-label="Excerpt from actual Emberfold dry run output">{
  "tokens": {
    "input_tokens": 100,
    "max_input_tokens": 12000,
    "output_reserve_tokens": 4000,
    "method": "estimate"
  },
  "protected_spans_verified": 0,
  "compacted": false,
  "fits": true
}</pre><div class="terminal-foot">OUTPUT EXCERPT · NO MODEL CALLS</div></div>`}</div><p class="capture-caption">${p.candidate ? "Product ownership diagram · see guide for verification limits" : id === "emberfold" ? "Actual output excerpt · synthetic input" : `${p.name} · ${id === "cindertrace" ? '<span class="capture-name">Overview</span>' : 'sample environment'} · <a class="capture-full-link" href="${p.image}" target="_blank" rel="noopener noreferrer">Open full capture ${icon("external")}</a>`}</p></div>
          <figcaption class="interface-story"><span class="mini-label">${p.role}</span><h3>${note.title}</h3><p>${note.copy}</p><ul>${note.points.map(point => `<li>${point}</li>`).join("")}</ul><a class="text-link" href="/guides/${id}.md">${p.name} guide ${icon("arrow")}</a>${id === "cindertrace" ? `<div class="response-note"><h4>One incident. Evolving evidence.</h4><p>Investigate a suspicious login, weigh a benign explanation, then assess corroborating activity. Compare cited claims and confidence across revisions. Containment stays a human-approved simulation.</p><a href="/guides/cindertrace.md#try-the-evolving-investigation-lab">Try the disposable investigation lab ${icon("arrow")}</a></div><div class="response-note" id="security"><h4>Response stays deliberate.</h4><p>Administrator approval binds the exact plan, expires after ten minutes, and is used once. Optional Magnus executes host actions; response controls require its configured bridge.</p><a href="https://github.com/ChefTaco/cindertrace/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy and data handling ${icon("external")}</a></div>` : ""}${id === "chattermost" ? '<p class="interface-limit">Background mobile push and calls are not implemented. Suite browser identity is a candidate integration; native Mattermost sessions remain available.</p>' : ""}</figcaption></figure>
        </section>`;
      }).join("")}
      <p class="interface-footnote">You are viewing documentation and sample captures. This site does not connect to an operational fleet or security installation.</p>
    </div></section>
    <section class="suite-boundary shell" aria-label="Suite release status"><h2>A suite under acceptance.</h2><p>The extracted products and Bash installer are being verified in isolated installations. No official signed suite release has been published. Keep the existing frontends and recovery artifacts until the replacement gates pass. Ollama, llama.cpp and hosted providers remain external; Hive only verifies and registers their endpoints.</p></section>
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
  <footer class="site-footer"><div class="shell footer-inner"><a class="brand" href="#top"><span>Hive<span class="brand-colon">:</span>Magnus</span></a><p>Open source tools for self-hosted agents.</p><div><a href="https://github.com/ChefTaco/hive">Hive</a><a href="https://github.com/ChefTaco/magnus">Magnus</a><a href="https://github.com/ChefTaco/cindertrace">Cindertrace</a><a href="https://github.com/ChefTaco/ChatterMost">ChatterMost</a><a href="https://github.com/ChefTaco/emberfold">Emberfold</a><a href="https://github.com/ChefTaco/HiveMagnus">Site source</a></div><p class="footer-legal">Each project is licensed under Apache-2.0. ChatterMost is independently developed and Mattermost-compatible; Mattermost is a trademark of Mattermost, Inc., which does not affiliate with, endorse, or sponsor it.</p></div></footer>
  <div class="sr-only" id="announce" role="status" aria-live="polite"></div>
`;

function renderAtlas() {
  const p = projects[activeProject];
  const detail = document.querySelector<HTMLDivElement>("#atlas-detail")!;
  detail.innerHTML = `<span class="detail-meta">SELECTED SYSTEM / ${p.role.toUpperCase()}</span><div class="detail-body"><h3>${p.name}</h3><p>${p.detail}</p><h4>Connects to</h4><ul class="detail-links">${p.connections.map((c) => `<li><strong>${c.to}</strong> <span>${c.how}</span></li>`).join("")}</ul><a href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="Open ${p.name} ${p.candidate ? "candidate guide" : "GitHub repository"}">${p.candidate ? "Candidate guide" : "Project source"} ${icon("external")}</a></div>`;
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

function selectInterface(id: ProjectId, focus = false) {
  activeInterface = id;
  document.querySelectorAll<HTMLButtonElement>("[data-interface]").forEach(button => {
    const active = button.dataset.interface === id;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active && focus) button.focus();
  });
  projectOrder.forEach(project => {
    document.querySelector<HTMLElement>(`#interface-${project}`)!.hidden = project !== id;
  });
}

document.querySelectorAll<HTMLButtonElement>("[data-interface]").forEach(button => {
  button.addEventListener("click", () => selectInterface(button.dataset.interface as ProjectId));
  button.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = projectOrder.indexOf(activeInterface);
    const next = event.key === "Home" ? 0 : event.key === "End" ? projectOrder.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + projectOrder.length) % projectOrder.length;
    selectInterface(projectOrder[next], true);
  });
});
document.querySelectorAll<HTMLAnchorElement>("[data-interface-link]").forEach(link => {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const id = link.dataset.interfaceLink as ProjectId;
    selectInterface(id);
    history.pushState(null, "", `#interface-${id}`);
    document.querySelector<HTMLElement>("#interfaces")!.scrollIntoView();
    document.querySelector<HTMLElement>(`#interface-${id}`)!.focus({ preventScroll: true });
  });
});
window.addEventListener("hashchange", () => {
  const id = location.hash === "#security" ? "cindertrace" : location.hash.replace("#interface-", "");
  if (projectOrder.includes(id as ProjectId)) {
    selectInterface(id as ProjectId);
    document.querySelector<HTMLElement>("#interfaces")!.scrollIntoView();
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(button => {
  button.addEventListener("click", () => {
    const investigation = button.dataset.capture === "case";
    const panel = document.querySelector<HTMLElement>("#interface-cindertrace")!;
    const src = `/captures/cindertrace-${investigation ? "case" : "overview"}.webp`;
    const img = panel.querySelector<HTMLImageElement>("img")!;
    img.src = src;
    img.alt = investigation ? "Cindertrace synthetic case showing the evidence braid, affected entities, and recommended investigation" : projects.cindertrace.imageAlt!;
    panel.querySelectorAll<HTMLAnchorElement>(".capture-link, .capture-full-link").forEach(link => { link.href = src; });
    panel.querySelector(".capture-name")!.textContent = investigation ? "Investigation" : "Overview";
    panel.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
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
  requestAnimationFrame(() => document.querySelector("#interfaces")!.scrollIntoView());
}
