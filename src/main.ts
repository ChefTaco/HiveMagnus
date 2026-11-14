import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";

type ProjectId = "hive" | "emberpath" | "oathweave" | "hivemem" | "hiveskills" | "hivexui" | "magnus" | "cindertrace" | "chattermost" | "emberfold" | "ardent" | "embermend";
type GalleryId = Exclude<ProjectId, "emberfold" | "ardent">;
type DemoId = "embermend" | "hive" | "magnus" | "cindertrace" | "chattermost" | "ardent";
// The launcher resolves the published release at install time; source reviews stay versioned.
const HIVE_RELEASE_URL = "https://github.com/ChefTaco/hive/releases/latest";
// The signed suite release the product details are reviewed against. Bump this one value per release.
const HIVE_SUITE_VERSION = "3.8.1";
const HIVE_SUITE_RELEASE_URL = `https://github.com/ChefTaco/hive/releases/tag/v${HIVE_SUITE_VERSION}`;
type Step = { title: string; text: string; code?: string; note?: string; kind?: "address" };
type Demo = {
  label: string;
  kicker: string;
  title: string;
  intro: string;
  requires: string[];
  steps: [Step, ...Step[]];
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
      { to: "HiveXUI", how: "static browser UI behind the HTTPS ingress Hive assembles" },
      { to: "Hive Registry", how: "what this installation offers and runs: written by hive.sh, read through /api/registry" },
      { to: "Magnus / Cindertrace / ChatterMost", how: "added by the full or custom profile" },
      { to: "Embermend", how: "optional remediation; requires compatible Magnus" },
      { to: "Ardent Project Studio", how: "optional product; setup suggests it with the full profile" },
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
    name: "HiveXUI", role: "Browser UI · one sign-in",
    summary: "One browser UI for every product you install.",
    detail: "The single browser UI of a Hive installation: fleet, identity, models, memory, skills, security, chat and team projects in one shell, with sections only for the products you installed. It is a static TypeScript and React application, dark only for now, with no backend of its own. Every call goes to the owning product's API with your own credentials.",
    href: "https://github.com/ChefTaco/HiveXUI",
    connections: [{ to: "Oathweave", how: "one sign-in and resource-specific access" }, { to: "Product APIs", how: "same-origin HTTPS ingress; no database access or signing keys" }, { to: "Magnus", how: "the fleet pages, as the module at /fleet" }, { to: "Ardent Project Studio", how: "the Studio section, a fullscreen page at /studio" }],
  },
  magnus: {
    name: "Magnus",
    role: "Fleet · operations · hosts",
    summary: "See and operate the hosts where your agents live.",
    detail:
      "Fleet inventory, jobs, skills, rollouts and audit for Linux hosts. In a Hive installation its browser pages are the Magnus section of HiveXUI, signed in through Oathweave. It can install and manage Ardent, a separate agent runtime, on fleet hosts. The web terminal is a separate gateway requiring step-up, off unless you deploy it.",
    href: "https://github.com/ChefTaco/magnus",
    connections: [
      { to: "Ardent", how: "installs the pinned runtime package and manages it on fleet hosts" },
      { to: "HiveXUI", how: "the fleet pages, through an allowlist of browser routes" },
      { to: "Ardent Project Studio", how: "the only path from team projects to Ardent agents" },
      { to: "Fleet gateway", how: "holds the restricted SSH key for the optional web terminal" },
      { to: "Oathweave / Emberpath / HiveMem", how: "optional sign-in, model routing and shared memory" },
      { to: "Cindertrace", how: "optional observations, fleet context, and approved host response" },
      { to: "Embermend", how: "required execution boundary for independently authorized remediation" },
    ],
  },
  embermend: {
    name: "Embermend", role: "Hardening · remediation · verification",
    summary: "Turn security findings into reviewed, verified changes.",
    detail: "Continuous hardening and vulnerability remediation for Magnus-managed hosts and applications. Embermend records findings, evidence, recommendations, decisions and verification; Magnus owns enrollment, bounded execution and receipts. Source fixes, published images, deployed fixes and operational health stay separate. Available as an optional product from Hive 3.2.2 with compatible Magnus. Production automation starts disabled.",
    href: "https://github.com/ChefTaco/Embermend",
    connections: [{ to: "Magnus", how: "required capability admission, isolated workers, execution ownership and receipts" }, { to: "HiveXUI / Oathweave", how: "recommendations and decisions using scoped product access" }, { to: "Ardent", how: "typed investigation and planning tools; no self-approval" }, { to: "External inference", how: "approved Codex or Claude local CLI, llama.cpp, or OpenAI-compatible model endpoint" }, { to: "Cindertrace / ChatterMost / HiveMem / HiveSkills", how: "optional context and notifications" }],
  },
  cindertrace: {
    name: "Cindertrace",
    role: "Security · cases · evidence",
    summary: "Turn security observations into an investigation.",
    detail:
      "Correlated cases, hashed evidence, investigations, policies and audit. In a Hive installation it is a section of HiveXUI, signed in through Oathweave. It also runs on its own with its retained console and local administrator login, then optionally connects Magnus fleet context and approved response. A separate disposable lab lets people and agents revise an investigation as evidence arrives.",
    href: "https://github.com/ChefTaco/cindertrace",
    connections: [
      { to: "HiveXUI", how: "the suite's security section, using resource tokens" },
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
  ardent: {
    name: "Ardent", role: "Agent runtime · tasks · tools",
    summary: "Give your agents a durable place to work.",
    detail: `A headless agent runtime with durable tasks, typed tools, scheduled jobs and a task journal. Run it on its own or let Magnus manage it on fleet hosts. It uses a pinned Emberfold library for context fitting and can connect to HiveMem and ChatterMost. Hive ${HIVE_SUITE_VERSION} ships no Ardent container: the Magnus host agent stages the pinned package and Magnus installs it.`,
    href: "https://github.com/ChefTaco/Ardent",
    connections: [{ to: "Magnus", how: "optional installation and management on fleet hosts" }, { to: "Emberfold", how: "bundled library for context fitting; no HTTP service required" }, { to: "HiveMem / ChatterMost", how: "optional scoped memory and Mattermost chat channels" }, { to: "Model providers", how: "external OpenAI-compatible inference or Codex App Server" }, { to: "Ardent Project Studio", how: "optional team projects for several agents, through Magnus" }],
  },
  emberfold: {
    name: "Emberfold",
    role: "Context · continuity",
    summary: "Carry the right context into the next agent turn.",
    detail:
      "A portable context engine with a TypeScript library, CLI, HTTP service, and Hermes plugin. It has no HiveXUI section. Ardent uses its library for context fitting while retaining its own authoritative history.",
    href: "https://github.com/ChefTaco/emberfold",
    connections: [
      { to: "Ardent", how: "pinned library for context fitting; the HTTP service is optional" },
      { to: "Hermes Agent", how: "standard context-engine plugin" },
    ],
  },
};

const demos: Record<DemoId, Demo> = {
  embermend: {
    label: "Embermend", kicker: "Security remediation", title: "Assess first. Authorize each change.",
    intro: "Add Embermend through the signed Hive installer, connect a compatible Magnus and start with bounded inventory. Each proposed mutation needs a published explanation and a matching decision or standing policy.",
    requires: ["Hive 3.2.2 or a later compatible signed release", "Magnus 2.5.0 or newer with its explicitly scoped Embermend bridge", "An operator linked by issuer and subject with scoped Embermend access", "Approved inference and a rootless Magnus worker for code scanning"],
    steps: [
      { title: "Select the optional product", text: "Run the guided installer on a fresh installation and choose Embermend. Hive requires compatible Magnus, or a configured compatible external Magnus. For an existing installation, follow the upgrade guide and retain a verified backup and restore rehearsal.", code: "./hive.sh --release latest", note: "Embermend is off by default. Keep the exact signed release and immutable image references in the accepted configuration." },
      { title: "Start with scoped assessment", text: "Grant inventory and assessment only to the intended targets. Install reviewed versioned profiles and use the coordinator to assess. Unknown deployment exposure, unsupported checks and incomplete coverage remain visible.", note: "Magnus advertises actual capabilities; an unavailable action is a blocker. There is no direct SSH or arbitrary-shell fallback." },
      { title: "Review in HiveXUI", text: "Open Embermend to inspect the recommendation, exact revision, service impact and evidence. Approval, host changes, source writing, merge, artifact publication, deployment and recovery are separate permissions." },
      { title: "Verify the outcome", text: "Follow the retained operation through source, build and runtime verification. A successful command or healthy service alone does not close a security finding. Leave production mutation policy disabled until explicitly authorized." },
    ],
    guide: "/guides/embermend.md", guideLabel: "Read the Embermend guide",
  },
  hive: {
    label: "Hive",
    kicker: "Suite installer",
    title: "Install from a signed release",
    intro:
      `Hive's Bash controller installs what a signed release lists and refuses anything it cannot verify. Use the <a href="${HIVE_RELEASE_URL}" target="_blank" rel="noopener noreferrer">latest published suite release</a> or choose an exact version. Choose the core, full or custom profile; inference stays external and Hive only verifies endpoints.`,
    requires: [
      "Ubuntu 22.04 or 24.04, or Debian 12 or 13, on amd64 or arm64, with sudo",
      "2 CPUs, 4 GB of memory and 20 GB of disk for the full profile",
      "A DNS name for the browser address, with a certificate from Tailscale, your own CA or an ACME client",
      "Setup run as UID 1000 (usually the first account) or with sudo",
    ],
    steps: [
      {
        title: "Get the launcher",
        text: "Clone Hive. Its launcher selects the requested release and runs the matching tagged controller, which verifies the signed manifest and its controller source digest.",
        code: "git clone https://github.com/ChefTaco/hive.git && cd hive",
        note: `Each <a href="${HIVE_RELEASE_URL}" target="_blank" rel="noopener noreferrer">published release</a> attaches its manifest, signature and publisher key. To install from downloaded copies, check the key's fingerprint against the release notes first.`,
      },
      {
        title: "Install the prerequisites",
        text: "Guided local setup offers this step itself, with consent and no logout. To prepare a host yourself, the prerequisites script shows its plan, then installs Docker Engine and the Compose plugin from Docker's apt repository after checking its signing key, plus jq, OpenSSL, curl, git, iproute2 and the other tools hive.sh uses. It adds you to the docker group and creates the installation directory. It is safe to re-run.",
        code: "sudo ./scripts/install-prerequisites.sh --directory /opt/hive",
        note: "Log out and back in for the docker group, then run <code>./scripts/install-prerequisites.sh --check</code>. It refuses other distributions, other architectures and Docker from a snap. <code>--controller</code> installs only the tools on a machine that manages hosts over SSH.",
      },
      {
        title: "Get a certificate",
        text: "If Tailscale is already signed in with HTTPS Certificates enabled, guided setup can request this for you. Otherwise first install and sign into Tailscale, and enable MagicDNS and HTTPS Certificates in its admin console. On that host, this issues a certificate for the MagicDNS name into /etc/hive/tls, owned by you with an owner-only key. Otherwise bring your own certificate and key, or use an ACME client; Hive runs no ACME client itself.",
        code: "sudo ./scripts/console-certificate.sh tailscale",
        note: "Check your own files the way the installer will with <code>./scripts/console-certificate.sh check --cert FILE --key FILE --name NAME</code>.",
      },
      {
        title: "Start setup",
        text: "Use latest to select the published stable release, or replace it with an exact version. The launcher reports the version, verifies the signature, then asks for the installation name, directory, host, HTTPS origin, profile, bind address and certificate files. It never asks for a password on the command line. A setup that stopped after writing its configuration offers to continue with it.",
        code: "./hive.sh --release latest",
        note: `For example, <code>./hive.sh --release ${HIVE_SUITE_VERSION}</code> chooses that version. Use the matching release checkout for lifecycle commands and certificate renewal. If the launcher downloads one, it prints that retained path; otherwise keep using this checkout. Keep that directory. The signed services run as UID/GID 1000 (HiveXUI as 101).`,
      },
      {
        title: "Review the plan",
        text: "Setup shows a plan and applies it only after you confirm. To repeat or automate it, keep the installation JSON and run the same reviewed configuration. Planning does not contact hosts, and retries check the exact inputs.",
        code: "./hive.sh plan --config installation.json\n./hive.sh install --config installation.json",
        note: "Run these from the matching release checkout, with the installation file setup created. That keeps planning and applying on the same exact version. Secrets and identities are generated once into protected files. Existing data, configuration and model resources are never silently adopted or overwritten. Some upgrades need <code>--allow-migrations</code>, such as from 2.x with PostgreSQL stores, from a release before 3.4.0, or to 3.8.0 with Magnus; see the guide.",
      },
      {
        title: "Open HiveXUI",
        text: "Visit the HTTPS origin you configured and sign in through Oathweave. HiveXUI shows a section for each product in this installation, so a core install has no Magnus, Cindertrace or ChatterMost section.",
        code: "https://hive.example.com/",
        kind: "address",
        note: "The install ends by naming the HTTPS origin and the sign-in file: a fresh install stores the initial username and password in <code>/opt/hive/config/initial-credentials.env</code> on the identity host. <code>sudo ./scripts/console-certificate.sh schedule --config FILE</code> renews a Tailscale certificate weekly through <code>hive.sh tls-refresh</code>. An installation moved over with <code>hive.sh migrate-native</code> keeps its accounts and sets the administrator password once with a reset token; see the guide. <code>./hive.sh status --config installation.json</code> reports what is running and lists the setup steps still pending, which HiveXUI also shows to administrators.",
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
      "Hive's full profile adds Magnus as the fleet section of HiveXUI, at /fleet. To run Magnus without Hive, this published installer sets up the server and its own Next.js console on a single host, then gives you a path to add managed nodes.",
    requires: [
      "Linux with systemd",
      "Node.js 24.22.3+ or 26.13.1+",
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
        note: "This is the standalone path. In a Hive installation there is no separate Magnus UI to open: sign in to HiveXUI and choose Magnus.",
      },
      {
        title: "Add a node",
        text: "Register a Linux host in the console, then follow the agent setup instructions to give it a node secret and start its service.",
        note: "Node registration and TLS configuration are host-specific. Follow the complete guide before enabling a remote agent.",
      },
    ],
    guide: "https://github.com/ChefTaco/magnus#quick-start-standalone",
    guideLabel: "Magnus installation guide",
  },
  cindertrace: {
    label: "Cindertrace",
    kicker: "Security investigations",
    title: "Run it on its own",
    intro:
      "In a Hive installation, Cindertrace is a section of HiveXUI. To run it alone, start its retained console, API, PostgreSQL, and Redis together. Local administrator login works without Hive or Magnus; collectors and integrations are opt-in.",
    requires: ["Node.js 24.22.3+ (24.x) or 26.13.1+ (26.x)", "npm and Git", "OpenSSL", "Docker Engine and Compose v2"],
    steps: [
      {
        title: "Get the reviewed release",
        text: "Clone the public repository at the current release into a new directory. Use a fresh environment for this walkthrough.",
        code: "git clone --branch v0.7.0 https://github.com/ChefTaco/cindertrace.git\ncd cindertrace\nnpm ci",
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
        code: 'VERSION=0.6.1\nDOWNLOAD_DIR="$(mktemp -d)"\ncd "$DOWNLOAD_DIR"\ncurl -fLO "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/chattermost-$VERSION.tar.gz" &&\n  curl -fLO "https://github.com/ChefTaco/ChatterMost/releases/download/v$VERSION/SHA256SUMS"',
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
      "Ardent is its own product with its own repository; Magnus can manage it on fleet hosts. Its package includes the pinned Emberfold library for context fitting; the separate Emberfold server is optional. To use Emberfold without Ardent, start from its repository.",
    requires: [
      "Node.js 24.22.3+ or 26.13.1+",
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
    guide: "/guides/ardent.md",
    guideLabel: "Ardent guide",
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
    ardent: '<path d="m5 20 7-16 7 16M8 14h8M3 20h5M16 20h5"/>',
    magnus: '<rect x="3" y="4" width="18" height="6.5" rx="1.5"/><rect x="3" y="13.5" width="18" height="6.5" rx="1.5"/><path d="M7 7.25h.01M7 16.75h.01M11 7.25h6M11 16.75h6"/>',
    cindertrace: '<path d="m12 3 8 3v6c0 4-3.7 7.5-8 9-4.3-1.5-8-5-8-9V6z"/><path d="M8 12h3l2-4 1 8 2-4h2"/>',
    chattermost: '<path d="M4 5h16v11H10l-6 4.5z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    hivexui: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M3 9h6"/>',
    oathweave: '<path d="m12 3 8 3v6c0 4-3.7 7.5-8 9-4.3-1.5-8-5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    emberpath: '<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>',
    hivemem: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    hiveskills: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    embermend: '<path d="m12 3 8 3v6c0 4-3.7 7.5-8 9-4.3-1.5-8-5-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
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
  "embermend",
  "ardent",
  "cindertrace",
  "chattermost",
  "emberfold",
];
const demoOrder: [DemoId, ...DemoId[]] = ["hive", "magnus", "embermend", "cindertrace", "chattermost", "ardent"];
// Real synthetic captures from HiveXUI, the single browser UI.
type Capture = { label: string; file: string; alt: string };
type Gallery = { path: string; captures: [Capture, ...Capture[]]; title: string; copy: string; points: string[]; extra?: string };
const gallery = {
  embermend: {
    path: "EMBERMEND > RECOMMENDATIONS",
    captures: [{ label: "Recommendations", file: "embermend-recommendations.png", alt: "HiveXUI Embermend showing a synthetic recommendation awaiting a decision, distinct source and runtime outcomes, and supporting evidence" }],
    title: "Explain. Decide. Verify.",
    copy: "Review a proposed change and its impact, then follow authorized work to independently verified outcomes. Evidence and historical uncertainty remain available when work pauses or needs recovery.",
    points: ["Review the exact revision before dispatch", "Keep source, deployment and health evidence distinct", "Preserve unknown outcomes without replaying changes"],
    extra: '<p class="interface-limit">The image is a synthetic documentation example. Production rollout begins with scoped assessment; mutation policies remain disabled until explicitly granted. Supported reference journeys and remaining coverage are documented in <a href="https://github.com/ChefTaco/Embermend/blob/main/docs/ACCEPTANCE.md">the acceptance ledger</a>.</p>',
  },
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
    copy: "Magnus's browser pages are this section of HiveXUI, at /fleet: move from host inventory to the jobs, agents, and rollouts running across it.",
    points: ["Review host health and the fleet map", "Operate jobs and managed agents", "Inspect changes in the audit log"],
    extra: `<div class="response-note"><h4>The web terminal stays off.</h4><p>It runs through a separate fleet gateway that holds the SSH key, so neither the browser nor the Magnus API does. Until you deploy it, HiveXUI offers no terminal. Opening one needs an ADMIN link, the terminal permission, identity verified in the last five minutes and an approved host key.</p><a href="https://github.com/ChefTaco/magnus/tree/main/services/fleet-gateway" target="_blank" rel="noopener noreferrer">Fleet gateway security model ${icon("external")}</a></div>`,
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
    extra: `<div class="response-note"><h4>The lab runs apart from HiveXUI.</h4><p>The investigation lab is a separate disposable installation with synthetic evidence. It forbids external identity and integrations, so it keeps its own console with local login and is not reached through HiveXUI. Containment there is a human-approved simulation.</p><a href="/guides/cindertrace.md#try-the-evolving-investigation-lab">Try the disposable investigation lab ${icon("arrow")}</a></div><div class="response-note" id="security"><h4>Response stays deliberate.</h4><p>Administrator approval binds the exact plan, expires after ten minutes, and is used once. Optional Magnus executes host actions; response controls require its configured bridge.</p><a href="https://github.com/ChefTaco/cindertrace/blob/main/PRIVACY.md" target="_blank" rel="noopener noreferrer">Privacy and data handling ${icon("external")}</a></div>`,
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
    captures: [{ label: "Command palette", file: "palette", alt: "HiveXUI command palette listing screens across products" }],
    title: "One shell. Your own credentials.",
    copy: "Press Ctrl or Cmd + K to reach any screen you can use. Sections appear only for installed products. HiveXUI is dark only for now.",
    points: ["No backend, database access or signing keys", "Access tokens stay in memory", "Each call goes to the owning product's API"],
    extra: '<p class="interface-limit">HiveXUI\'s README tracks the workflows still under acceptance. Synthetic screenshots do not establish backend authorization or workflow parity.</p>',
  },
} satisfies Record<GalleryId, Gallery>;
const captureSrc = (capture: Capture) => `/captures/${capture.file.endsWith(".png") ? capture.file : capture.file + ".webp"}`;
function requiredElement<T extends Element>(selector: string, constructor: new () => T, root: ParentNode = document): T {
  const element = root.querySelector(selector);
  if (!(element instanceof constructor)) throw new Error(`Missing or invalid element: ${selector}`);
  return element;
}
function isProjectId(value: string | undefined): value is ProjectId {
  return value !== undefined && Object.hasOwn(projects, value);
}
function isDemoId(value: string | undefined): value is DemoId {
  return value !== undefined && Object.hasOwn(demos, value);
}
let activeProject: ProjectId = "hive";
let activeDemo: DemoId = "hive";
let activeStep = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root");

const installCommand = "git clone https://github.com/ChefTaco/hive.git && cd hive && ./hive.sh --release latest";
const guidePath = (id: ProjectId) => `/guides/${id}.md`;
const atlasNode = (id: ProjectId, label: string) => `<button type="button" class="atlas-node project-${id}${id === "hive" ? " is-active" : ""}" data-project="${id}" aria-pressed="${id === "hive"}">${icon(id)}<span><strong>${projects[id].name}</strong><small>${label}</small></span></button>`;
const emberfoldTerminal = `<div class="screen-terminal"><div class="terminal-top"><span>EMBERFOLD / CLI</span><span>SYNTHETIC INPUT</span></div><p><span>$</span> emberfold prepare --input emberfold.json --dry-run</p><pre tabindex="0" aria-label="Excerpt from actual Emberfold dry run output">{
  "tokens": {
    "input_tokens": 100,
    "max_input_tokens": 12000,
    "output_reserve_tokens": 4000,
    "method": "estimate"
  },
  "protected_spans_verified": 0,
  "compacted": false,
  "fits": true
}</pre><div class="terminal-foot">ACTUAL OUTPUT EXCERPT · NO MODEL CALLS</div></div>`;

function productSection(id: ProjectId) {
  const p = projects[id];
  const area: { title: string; copy: string; points: string[]; captures: Capture[]; extra?: string } = id === "ardent" ? {
    ...gallery.magnus, title: "An agent that can keep going.",
    copy: "Durable tasks, typed tools, scheduled jobs and a journal of every run. Ardent works on its own or under Magnus management, with Emberfold context fitting built in.",
    points: ["Run tasks, tools and scheduled jobs", "Connect optional memory and chat", "Install from npm or through Magnus"],
    captures: [gallery.magnus.captures[2]], extra: `<p>Ardent is headless. The image shows Magnus mission control in HiveXUI, where its host is managed. Hive ${HIVE_SUITE_VERSION} does not include an Ardent container: the Magnus host agent stages the pinned Ardent package, and Magnus installs and updates it.</p><p><a href="/guides/ardent-studio.md">Ardent Project Studio</a>, an optional suite product, gives a team of Ardent agents a shared project, a conversation room and deliverable review in HiveXUI's Studio section.</p>`,
  } : id === "emberfold" ? {
    title: "Bring the right context forward.",
    copy: "Fit context to the next model turn with a portable library, CLI, optional HTTP service or Hermes plugin. Ardent uses the library directly and keeps its own authoritative history.",
    points: ["Fit a context window’s token budget", "Preserve protected source spans", "Use it inside or outside the suite"],
    captures: [], extra: '<p>Emberfold is a context engine with no HiveXUI screen. This is an excerpt from a real CLI dry run using synthetic input.</p>',
  } : gallery[id];
  const first = area.captures[0];
  return `<article class="product-section project-${id}" id="interface-${id}" tabindex="-1" aria-labelledby="product-title-${id}">
    <div class="product-copy"><div class="product-label">${icon(id)}<span>${p.role}</span></div><h3 id="product-title-${id}">${p.name}</h3><h4>${area.title}</h4><p>${area.copy}</p><ul class="product-points">${area.points.map(point => `<li>${icon("check")}${point}</li>`).join("")}</ul><div class="product-links"><a class="text-link" href="${guidePath(id)}">Read the guide ${icon("arrow")}</a><a class="text-link source-link" href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} GitHub repository">Source ${icon("external")}</a></div>${area.extra ? `<details class="product-notes"><summary>More about ${p.name}</summary>${area.extra}</details>` : ""}</div>
    <div class="product-visual">${first ? `<div class="capture-window"><div class="window-bar"><span class="window-dots" aria-hidden="true">● ● ●</span><span>HiveXUI / ${id === "ardent" ? "Magnus mission control" : p.name}</span>${icon("hivexui")}</div><a class="capture-link" href="${captureSrc(first)}" target="_blank" rel="noopener noreferrer" aria-label="Open full ${p.name} capture"><img src="${captureSrc(first)}" alt="${first.alt}" loading="lazy" decoding="async" width="2880" height="1800" /></a></div><div class="capture-footer"><p class="capture-caption">${id === "ardent" ? "Managed through Magnus" : "HiveXUI"} · <span class="capture-name">${first.label}</span> · synthetic data</p>${area.captures.length > 1 ? `<div class="capture-switch" role="group" aria-label="${p.name} capture">${area.captures.map((capture, i) => `<button type="button" data-capture="${i}" aria-pressed="${i === 0}">${capture.label}</button>`).join("")}</div>` : ""}<a class="capture-full-link" href="${captureSrc(first)}" target="_blank" rel="noopener noreferrer" aria-label="Open full ${p.name} image">Full image ${icon("external")}</a></div>` : emberfoldTerminal}</div>
  </article>`;
}

app.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="#top" aria-label="Hive:Magnus home"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span>Hive<span class="brand-colon">:</span>Magnus</span></a>
    <nav class="main-nav" aria-label="Main navigation"><a href="#install">Install</a><a href="#atlas">Architecture</a><a href="#projects">Products</a><a href="#walkthroughs">Guides</a></nav>
    <a class="header-github" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">GitHub ${icon("external")}</a>
  </div></header>
  <main id="main">
    <section class="hero shell" id="top" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-prompt" aria-hidden="true">&gt;_</span> YOUR AGENTS. YOUR INFRASTRUCTURE.</div>
        <h1 id="hero-title">Full-stack<br/><em>agent management.</em></h1>
        <p class="hero-lede">Deploy the stack. Manage your fleet. Give your agents identity, model access, memory and skills — with security and conversation in the same browser UI.</p>
        <div class="hero-actions"><a class="button button-primary" href="#install">Install the full stack ${icon("down")}</a><a class="text-link" href="#atlas">See how it connects ${icon("arrow")}</a></div>
        <p class="hero-proof">Open source · Apache-2.0 · Self hosted</p>
      </div>
      <figure class="hero-console"><div class="hero-console-label"><span class="status-dot" aria-hidden="true"></span> ONE BROWSER UI. THE WHOLE PICTURE.</div><div class="capture-window"><div class="window-bar"><span class="window-dots" aria-hidden="true">● ● ●</span><span>HiveXUI / Magnus</span>${icon("hivexui")}</div><img src="/captures/fleet-overview.webp" alt="HiveXUI fleet overview with synthetic hosts, health gauges and recent commands" width="2880" height="1800" fetchpriority="high" /></div><figcaption>Fleet, identity, models, memory, skills, security and chat.<span>Real HiveXUI capture · synthetic data</span></figcaption></figure>
    </section>
    <div class="shell feature-strip" role="group" aria-label="Product features">
      <div>${icon("magnus")}<span><strong>Operate your fleet</strong><small>Hosts, jobs and agent rollouts</small></span></div><div>${icon("emberpath")}<span><strong>Connect your models</strong><small>Provider routing, quotas and traces</small></span></div><div>${icon("hivemem")}<span><strong>Give agents continuity</strong><small>Memory, skills and context</small></span></div><div>${icon("cindertrace")}<span><strong>Stay in control</strong><small>Identity, investigations and chat</small></span></div>
    </div>
    <section class="quick-start shell" id="install" aria-labelledby="install-title">
      <div class="quick-start-heading"><div><span class="section-kicker">START WITH HIVE</span><h2 id="install-title">One installer. A connected stack.</h2></div><div class="platforms" role="group" aria-label="Installer platforms"><span class="platform-current">Linux</span><span>macOS <small>coming</small></span><span>Windows <small>coming</small></span></div></div>
      <p>On a fresh Ubuntu or Debian host, run this line to open guided setup. It offers to install Docker Engine and the other prerequisites with your consent. Choose the <code>full</code> profile, review the plan, and confirm to install. Replace <code>latest</code> with an exact version to choose it, such as <code>${HIVE_SUITE_VERSION}</code>.</p>
      <div class="install-command"><span class="command-prompt" aria-hidden="true">$</span><pre tabindex="0" aria-label="Hive guided install command"><code>${installCommand}</code></pre><button type="button" data-copy-install aria-label="Copy Hive install command">${icon("copy")}<span>Copy</span></button></div>
      <div class="install-meta"><span><a href="${HIVE_RELEASE_URL}" target="_blank" rel="noopener noreferrer">Latest Hive release</a> · Guides reviewed for <a href="${HIVE_SUITE_RELEASE_URL}" target="_blank" rel="noopener noreferrer">${HIVE_SUITE_VERSION}</a> · Signed release · Ubuntu / Debian · amd64 / arm64</span><a class="text-link" href="#walkthroughs">Fresh host? Start here ${icon("arrow")}</a></div>
      <div class="tailscale-recommendation"><span class="recommendation-icon">${icon("oathweave")}</span><p><strong>Set up <a href="https://tailscale.com/download" target="_blank" rel="noopener noreferrer">Tailscale</a> first.</strong> Our recommended path to private access and an HTTPS certificate. Enable MagicDNS and HTTPS Certificates; guided setup can then request the certificate, or run Hive’s certificate helper before setup.</p><button class="text-link" type="button" data-open-tailscale>Setup guide ${icon("arrow")}</button></div>
      <p class="install-prerequisites">Before you run: Git, sudo, and a DNS name with a TLS certificate for the browser address. Guided setup can install Docker Engine with Compose and Hive’s other prerequisite tools. <a href="/guides/hive.md#prerequisites">All prerequisites</a> · <a href="/guides/hive.md#install">Use your own certificate</a>. Model inference stays external.</p>
    </section>
    <section class="atlas-section" id="atlas" aria-labelledby="atlas-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">THE ARCHITECTURE</span><h2 id="atlas-title">Independent tools.<br/><span>One connected system.</span></h2></div><p>Hive installs the suite. HiveXUI brings it together. Select a product to explore what it does and where it connects.</p></div>
      <div class="atlas-layout"><div class="atlas-map" role="group" aria-label="Interactive product architecture">
        <div class="architecture-layer deploy-layer"><span class="layer-label">DEPLOY & RECOVER</span>${atlasNode("hive", "Signed releases · backups · upgrades")}<p>Installs the services, their private datastores, HTTPS ingress and the Hive Registry.</p></div>
        <div class="architecture-flow" aria-hidden="true">↓ <span>ONE HTTPS ENTRY POINT</span></div>
        <div class="architecture-layer console-layer"><span class="layer-label">YOUR BROWSER UI & IDENTITY</span><div class="node-pair">${atlasNode("hivexui", "One browser UI")}${atlasNode("oathweave", "Sign-in & scoped access")}</div></div>
        <div class="architecture-flow" aria-hidden="true">↓ <span>EACH PRODUCT’S OWN API</span></div>
        <div class="architecture-layer services-layer"><span class="layer-label">SUITE SERVICES</span><div class="service-nodes">${atlasNode("magnus", "Fleet & host operations")}${atlasNode("emberpath", "Model routing")}${atlasNode("hivemem", "Durable memory")}${atlasNode("hiveskills", "Skill distribution")}${atlasNode("embermend", "Remediation & verification")}${atlasNode("cindertrace", "Security investigations")}${atlasNode("chattermost", "People & agent chat")}</div></div>
        <div class="architecture-flow"><span>MAGNUS CAN MANAGE ARDENT ON FLEET HOSTS</span> ↓</div>
        <div class="architecture-layer runtime-layer"><span class="layer-label">AGENT RUNTIME · CONFIGURED SEPARATELY</span><div class="runtime-nodes">${atlasNode("ardent", "Durable tasks & tools")}<span class="library-arrow"><span aria-hidden="true">→</span><small>bundles library</small></span>${atlasNode("emberfold", "Context fitting")}</div><p>The full profile also installs the optional Emberfold HTTP service. Ardent Project Studio, an optional suite product, brings teams of Ardent agents into HiveXUI.</p></div>
        <div class="external-inference"><span>${icon("emberpath")} EXTERNAL INFERENCE</span><p>Emberpath routes to your hosted APIs, Ollama or llama.cpp. Ardent can also use a provider directly. Models, storage and runtimes stay outside Hive.</p></div>
      </div><div class="atlas-detail" id="atlas-detail" aria-live="polite" aria-atomic="true"></div></div>
    </div></section>
    <section class="products-section shell" id="projects" aria-labelledby="projects-title"><span id="interfaces" class="anchor-alias" aria-hidden="true"></span>
      <div class="section-head"><div><span class="section-kicker">MEET THE PRODUCTS</span><h2 id="projects-title">The tools behind<br/><span>your agents.</span></h2></div><p>Each has a clear job. Together, they cover the stack. The screens below are areas of HiveXUI, one browser UI, captured with synthetic data.</p></div>
      <nav class="product-jump-links" aria-label="Explore products">${projectOrder.map(id => `<a href="#interface-${id}">${projects[id].name}</a>`).join("")}</nav>
      ${projectOrder.map(productSection).join("")}
    </section>
    <section class="install-section" id="walkthroughs" aria-labelledby="walkthroughs-title"><div class="shell"><div class="section-head"><div><span class="section-kicker">INSTALLATION GUIDES</span><h2 id="walkthroughs-title">From first host<br/><span>to your own stack.</span></h2></div><p>Start with Hive for the full suite, or follow a standalone product guide. These walkthroughs explain the commands without running them.</p></div>
      <div class="install-layout"><div class="demo-sidebar"><div class="demo-tabs" role="tablist" aria-orientation="vertical" aria-label="Choose an installation walkthrough">${demoOrder.map((id, i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="demo-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-demo="${id}"><span>${demos[id].label}</span>${icon("chevron")}</button>`).join("")}</div><p class="demo-disclaimer">Use a fresh host. For an existing installation, follow its upgrade guide.</p><button class="text-link" type="button" data-open-tailscale>Tailscale setup guide ${icon("arrow")}</button></div><div class="demo-panel" id="demo-panel" role="tabpanel" aria-labelledby="tab-hive" tabindex="0"></div></div>
    </div></section>
    <section class="agents-section shell" id="agents" aria-labelledby="agents-title"><div class="section-head"><div><span class="section-kicker">FOR PEOPLE & AGENTS</span><h2 id="agents-title">Docs you can work with.</h2></div><p>Plain Markdown guides with prerequisites, commands and reviewed source revisions.</p></div><div class="agent-index-links"><a class="text-link" href="/llms.txt">Read llms.txt ${icon("arrow")}</a><a class="text-link" href="/index.md">Site overview in Markdown ${icon("arrow")}</a></div><ul class="agent-guides">${projectOrder.map(id => `<li><a href="/guides/${id}.md"><span class="agent-guide-title">${projects[id].name} ${icon("arrow")}</span><span>${projects[id].role}</span></a></li>`).join("")}<li><a href="/guides/ardent-studio.md"><span class="agent-guide-title">Ardent Project Studio ${icon("arrow")}</span><span>Team projects · HiveXUI /studio</span></a></li></ul></section>
  </main>
  <footer class="site-footer" id="links"><div class="shell"><div class="footer-top"><div><a class="brand" href="#top"><span>Hive<span class="brand-colon">:</span>Magnus</span></a><p>Full-stack agent management.<br/>Open source. On your infrastructure.</p></div><div class="ecosystem-links"><a href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer"><small>EXPLORE THE SOURCE</small><strong>GitHub / ChefTaco ${icon("external")}</strong></a><a href="https://www.npmjs.com/~hivemagnus" target="_blank" rel="noopener noreferrer"><small>PACKAGES & SDKS</small><strong>npm / hivemagnus ${icon("external")}</strong></a></div></div><div class="footer-projects">${projectOrder.map(id => `<a href="${projects[id].href}">${projects[id].name}</a>`).join("")}<a href="https://github.com/ChefTaco/HiveMagnus">Site source</a><a href="/.well-known/security.txt">Security</a></div><p class="footer-legal">Apache-2.0. Product capabilities and release status are documented in each repository. ChatterMost is independently developed and Mattermost-compatible; Mattermost, Inc. does not affiliate with, endorse, or sponsor it.</p></div></footer>
  <dialog id="tailscale-dialog" aria-labelledby="tailscale-title" aria-describedby="tailscale-intro"><div class="modal-heading"><span class="section-kicker">BEFORE YOU INSTALL</span><button class="modal-close" type="button" aria-label="Close Tailscale setup guide" data-close-tailscale>×</button></div><h2 id="tailscale-title">Get your host ready<br/>with Tailscale.</h2><p id="tailscale-intro">A recommended, optional way to reach HiveXUI privately and get its HTTPS certificate. Hive does not install or sign you into Tailscale.</p><ol class="tailscale-steps"><li><h3>Install and sign in</h3><p>Install Tailscale on your Linux host and the computer you’ll use to open HiveXUI. Sign both into the same tailnet.</p><a class="text-link" href="https://tailscale.com/download" target="_blank" rel="noopener noreferrer">Download Tailscale ${icon("external")}</a></li><li><h3>Enable MagicDNS and HTTPS</h3><p>In your Tailscale admin console’s DNS settings, turn on MagicDNS and HTTPS Certificates.</p><a class="text-link" href="https://tailscale.com/docs/how-to/set-up-https-certificates" target="_blank" rel="noopener noreferrer">Follow Tailscale’s HTTPS guide ${icon("external")}</a></li><li><h3>Request the certificate</h3><p>After cloning the Hive release and installing its prerequisites, run this from the checkout. The helper discovers this host’s Tailscale name and calls <code>tailscale cert</code>.</p><div class="modal-command"><pre tabindex="0"><code>sudo ./scripts/console-certificate.sh tailscale</code></pre><button type="button" data-copy-text="sudo ./scripts/console-certificate.sh tailscale" aria-label="Copy Tailscale certificate command">${icon("copy")}</button></div><p>It prints the HTTPS origin and writes <code>/etc/hive/tls/console.crt</code> and <code>/etc/hive/tls/console.key</code>. Enter that origin and those paths when Hive setup asks. Certificate names appear in public Certificate Transparency logs.</p></li><li><h3>Schedule renewal after installing</h3><p>Run this with the protected installation file setup created. Replace <code>FILE</code> with that path. It schedules weekly renewal and refreshes Hive’s ingress certificate; rerun it from the new checkout after upgrades.</p><div class="modal-command"><pre tabindex="0"><code>sudo ./scripts/console-certificate.sh schedule --config FILE</code></pre><button type="button" data-copy-text="sudo ./scripts/console-certificate.sh schedule --config FILE" aria-label="Copy certificate renewal command">${icon("copy")}</button></div></li></ol><div class="modal-footer"><p>Using your own DNS and certificate? <a href="/guides/hive.md#install">Follow the Hive installation guide</a>.</p><button class="button button-primary" type="button" data-close-tailscale>Back to Hive setup ${icon("arrow")}</button></div></dialog>
  <div class="sr-only" id="announce" role="status" aria-live="polite"></div>
`;

function renderAtlas() {
  const p = projects[activeProject];
  requiredElement("#atlas-detail", HTMLDivElement).innerHTML = `<span class="detail-meta">EXPLORE THE SYSTEM</span><div class="detail-body">${icon(activeProject)}<h3>${p.name}</h3><p>${p.detail}</p><h4>How it connects</h4><ul class="detail-links">${p.connections.map(c => `<li><strong>${c.to}</strong><span>${c.how}</span></li>`).join("")}</ul><a href="#interface-${activeProject}">Explore ${p.name} ${icon("arrow")}</a></div>`;
  document.querySelectorAll<HTMLButtonElement>(".atlas-node").forEach(button => {
    const active = button.dataset.project === activeProject;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

projectOrder.forEach(id => {
  if (id === "emberfold" || id === "ardent") return;
  const panel = requiredElement(`#interface-${id}`, HTMLElement);
  panel.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(button => {
    button.addEventListener("click", () => {
      const capture = gallery[id].captures[Number(button.dataset.capture)];
      if (!capture) return;
      const img = requiredElement("img", HTMLImageElement, panel);
      img.src = captureSrc(capture);
      img.alt = capture.alt;
      panel.querySelectorAll<HTMLAnchorElement>(".capture-link, .capture-full-link").forEach(link => { link.href = captureSrc(capture); });
      requiredElement(".capture-name", HTMLElement, panel).textContent = capture.label;
      panel.querySelectorAll<HTMLButtonElement>("[data-capture]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    });
  });
});

const copyResets = new WeakMap<HTMLButtonElement, { original: string; timer: number }>();
async function copyText(button: HTMLButtonElement, value: string, feedback: { copiedHtml?: string; announcement?: string; failureText?: string; resetHtml?: string } = {}) {
  try {
    await navigator.clipboard.writeText(value);
    requiredElement("#announce", HTMLElement).textContent = feedback.announcement ?? "Command copied";
    // A second click while "Copied" shows must keep the first label, not capture "Copied" as the one to restore.
    const pending = copyResets.get(button);
    if (pending) window.clearTimeout(pending.timer);
    const original = pending?.original ?? feedback.resetHtml ?? button.innerHTML;
    button.innerHTML = feedback.copiedHtml ?? `${icon("check")}<span>Copied</span>`;
    const timer = window.setTimeout(() => { button.innerHTML = original; copyResets.delete(button); }, 2400);
    copyResets.set(button, { original, timer });
  } catch {
    if (feedback.failureText) button.textContent = feedback.failureText;
    requiredElement("#announce", HTMLElement).textContent = "Copy failed. Select the command text to copy it.";
  }
}
requiredElement("[data-copy-install]", HTMLButtonElement).addEventListener("click", event => { if (event.currentTarget instanceof HTMLButtonElement) void copyText(event.currentTarget, installCommand); });
document.querySelectorAll<HTMLButtonElement>("[data-copy-text]").forEach(button => button.addEventListener("click", () => { void copyText(button, button.dataset.copyText!); }));
const tailscaleDialog = requiredElement("#tailscale-dialog", HTMLDialogElement);
let modalTrigger: HTMLElement | null = null;
document.querySelectorAll<HTMLButtonElement>("[data-open-tailscale]").forEach(button => button.addEventListener("click", () => {
  modalTrigger = button;
  tailscaleDialog.showModal();
  document.body.classList.add("modal-open");
}));
document.querySelectorAll<HTMLButtonElement>("[data-close-tailscale]").forEach(button => button.addEventListener("click", () => tailscaleDialog.close()));
tailscaleDialog.addEventListener("click", event => {
  const bounds = tailscaleDialog.getBoundingClientRect();
  if (event.target === tailscaleDialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) tailscaleDialog.close();
});
tailscaleDialog.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;
  const focusable = Array.from(tailscaleDialog.querySelectorAll<HTMLElement>('a[href], button, [tabindex="0"]')).filter(el => !el.hasAttribute("disabled"));
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
tailscaleDialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  modalTrigger?.focus({ preventScroll: true });
});
tailscaleDialog.querySelectorAll<HTMLAnchorElement>('a[href^="/"]').forEach(link => link.addEventListener("click", () => tailscaleDialog.close()));
// Preserve legacy interface and security deep links; every product is now visible in the page.
function followProductHash() {
  if (location.hash === "#security") document.querySelector("#interface-cindertrace")?.scrollIntoView();
}
window.addEventListener("hashchange", followProductHash);

function renderDemo() {
  const d = demos[activeDemo];
  const s = d.steps[activeStep] ?? d.steps[0];
  const panel = requiredElement("#demo-panel", HTMLDivElement);
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
    ?.addEventListener("click", (event) => {
      if (!s.code || !(event.currentTarget instanceof HTMLButtonElement)) return;
      void copyText(event.currentTarget, s.code, {
        copiedHtml: `${icon("check")} Copied`,
        announcement: `${s.title} ${s.kind === "address" ? "address" : "command"} copied`,
        failureText: "Select text to copy",
        resetHtml: `${icon("copy")} Copy`,
      });
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
    const project = button.dataset.project;
    if (!isProjectId(project)) return;
    activeProject = project;
    renderAtlas();
  }),
);
document
  .querySelectorAll<HTMLButtonElement>('.demo-tabs [role="tab"]')
  .forEach((button) => {
    button.addEventListener("click", () => {
      const demo = button.dataset.demo;
      if (!isDemoId(demo)) return;
      activeDemo = demo;
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
      const demo = button.dataset.demo;
      if (!isDemoId(demo)) return;
      const current = demoOrder.indexOf(demo);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? demoOrder.length - 1
            : (current +
                (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) +
                demoOrder.length) %
              demoOrder.length;
      activeDemo = demoOrder[next] ?? demoOrder[0];
      activeStep = 0;
      renderDemo();
      document.querySelector<HTMLButtonElement>(`#tab-${activeDemo}`)?.focus();
    });
  });
renderAtlas();
renderDemo();
requestAnimationFrame(followProductHash);
