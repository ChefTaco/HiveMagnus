import "@fontsource/dm-sans/latin-400.css";
import "@fontsource/dm-sans/latin-500.css";
import "@fontsource/dm-sans/latin-600.css";
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./style.css";

type ProjectId = "hive" | "magnus" | "chattermost" | "emberfold";
type DemoId = Exclude<ProjectId, "emberfold"> | "ardent";
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
    image?: string;
    imageAlt?: string;
    connections: { to: string; how: string }[];
  }
> = {
  hive: {
    name: "Hive",
    role: "Identity · memory · models",
    summary: "One control plane for the services an agent shares.",
    detail:
      "Hive brings identity, long-term memory, and model routing into a single self-hosted console. Start the core services together, then connect the agents and apps you trust.",
    href: "https://github.com/ChefTaco/hive",
    image: "/captures/hive-console.webp",
    imageAlt:
      "Hive console showing its self-hosted service overview with sample data",
    connections: [
      { to: "Magnus", how: "optional IAM sign-in, Router model routing, and HiveMem memory" },
      { to: "Ardent", how: "optional HiveMem long-term memory" },
    ],
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
      { to: "Hive", how: "optional sign-in, model routing, and shared memory" },
    ],
  },
  chattermost: {
    name: "ChatterMost",
    role: "Conversation · channels",
    summary: "A self-hosted place to talk with people and agents.",
    detail:
      "A Mattermost-compatible chat backend for channels, direct messages, threads, and agent conversations. It includes a compact web UI and connects to the official Mattermost mobile and desktop apps. Background mobile push, calls, and SSO are not implemented.",
    href: "https://github.com/ChefTaco/ChatterMost",
    image: "/captures/chattermost-chat.webp",
    imageAlt:
      "ChatterMost channel conversation in a disposable sample environment",
    connections: [
      { to: "Hermes Agent", how: "documented setup through its Mattermost gateway" },
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
    label: "Hive",
    kicker: "Control plane",
    title: "Bring up the shared services",
    intro:
      "The launcher installs the selected Hive services, generates local secrets, and gives you a console to sign in to.",
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
    chattermost: '<path d="M4 5h16v11H10l-6 4.5z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>',
    emberfold: '<path d="M12 3c.6 3.8 6 6.1 6 11.2A6 6 0 0 1 6 14.2c0-2.9 1.9-4.1 2.9-6.7 1.1.8 2 1.9 2.4 3.4.7-2.2.9-5.1.7-7.9z"/><path d="M12 21a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.7-2.4 2.8-4 1.1 1.6 2.8 2.4 2.8 4A2.8 2.8 0 0 1 12 21z"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
};

const projectOrder: ProjectId[] = [
  "hive",
  "magnus",
  "chattermost",
  "emberfold",
];
const demoOrder: DemoId[] = ["hive", "magnus", "chattermost", "ardent"];
let activeProject: ProjectId = "hive";
let activeDemo: DemoId = "hive";
let activeStep = 0;

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing app root");

app.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="shell header-inner">
    <a class="brand" href="#top" aria-label="Hive:Magnus home"><span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span><span></span></span><span>Hive<span class="brand-colon">:</span>Magnus</span></a>
    <nav class="main-nav" aria-label="Main navigation"><a href="#atlas">The system</a><a href="#projects">Projects</a><a href="#install">Install lab</a></nav>
    <a class="header-github" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">GitHub ${icon("external")}</a>
  </div></header>
  <main id="main">
    <section class="hero shell" id="top" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow"><span class="eyebrow-line"></span> OPEN SOURCE · SELF HOSTED</div>
        <h1 id="hero-title">An open system <em>for agents.</em></h1>
        <p class="hero-lede">The pieces you need to run agents on your own terms: shared identity and memory, fleet operations, conversation, and context that carries forward.</p>
        <div class="hero-actions"><a class="button button-primary" href="#atlas">Explore the system ${icon("arrow")}</a><a class="text-link" href="#install">Try it on your host ${icon("down")}</a></div>
        <div class="hero-proof"><span class="proof-pulse"></span><span>Four public projects. One connected idea.</span></div>
      </div>
      <div class="hero-visual" aria-hidden="true"><svg class="hero-orbits" viewBox="-320 -315 640 630"><g class="orbit orbit-a"><ellipse rx="285" ry="150" transform="rotate(-19)"/><circle class="dot-amber" cx="-269" cy="93" r="6"/><circle class="dot-teal" cx="269" cy="-93" r="6"/></g><g class="orbit orbit-b"><ellipse rx="165" ry="275" transform="rotate(27)"/><circle class="dot-teal" cx="125" cy="-245" r="6"/><circle class="dot-amber" cx="-125" cy="245" r="6"/></g><circle class="orbit-ring" r="205"/></svg><div class="hero-core"><span class="core-small">HIVE</span><span class="core-colon">:</span><span class="core-large">MAGNUS</span></div><div class="hero-tag tag-a">IDENTITY + MEMORY</div><div class="hero-tag tag-b">FLEET OPERATIONS</div><div class="hero-tag tag-c">CONVERSATION</div><div class="hero-tag tag-d">CONTEXT CONTINUITY</div></div>
    </section>
    <section class="section-intro shell"><div class="intro-label">THE IDEA <span>↘</span></div><p>Every agent has a place to run, a way to remember, and a way to reach people. These projects make those parts <strong>visible, inspectable, and yours to host.</strong></p></section>
    <section class="atlas-section" id="atlas" aria-labelledby="atlas-title"><div class="shell">
      <div class="section-head"><div><span class="section-kicker">SYSTEM ATLAS / 01</span><h2 id="atlas-title">See how the pieces fit.</h2></div><p>Explore each part of the stack. Lines show possible connections; you choose which integrations to configure.</p></div>
      <div class="atlas-layout"><div class="atlas-map" role="group" aria-label="Interactive system atlas">
        <div class="atlas-grid" aria-hidden="true"></div><svg class="atlas-lines" viewBox="0 0 800 520" preserveAspectRatio="none" aria-hidden="true"><path d="M402 255 210 112M402 255 593 112M402 255 605 390"/><path class="atlas-line-active" d="M402 255 210 112"/></svg>
        <a href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" class="atlas-center" target="_blank" rel="noopener noreferrer" aria-label="Ardent agent runtime, part of Magnus"><span>ARDENT<small>AGENT RUNTIME</small></span><i></i></a>
        ${projectOrder.map((id, i) => `<button type="button" class="atlas-node node-${id}${i === 0 ? " is-active" : ""}" data-project="${id}" aria-pressed="${i === 0}"><span class="node-index">0${i + 1}</span><span class="node-name">${projects[id].name}</span><span class="node-role">${projects[id].role}</span></button>`).join("")}
        <div class="atlas-annotation">A SELF-HOSTED AGENT STACK</div>
      </div><div class="atlas-detail" id="atlas-detail" aria-live="polite"></div></div>
    </div></section>
    <section class="projects-section shell" id="projects" aria-labelledby="projects-title"><div class="section-head"><div><span class="section-kicker">OPEN PROJECTS / 02</span><h2 id="projects-title">Built to work together.<br/><span>Useful on their own.</span></h2></div><p>Start with the part you need. Each project has its own repository and installation guide.</p></div>
      <div class="project-grid">${projectOrder
        .map((id, i) => {
          const p = projects[id];
          return `<article class="project-card project-${id}"><div class="project-top"><span class="project-number">0${i + 1} / ${p.role.toUpperCase()}</span><span class="project-glyph">${icon(id)}</span></div><h3>${p.name}</h3><p class="project-summary">${p.summary}</p><p class="project-detail">${p.detail}</p><div class="project-bottom"><a href="${p.href}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} GitHub repository">View repository ${icon("external")}</a></div></article>`;
        })
        .join("")}</div>
      <div class="ardent-note"><span class="ardent-symbol" aria-hidden="true">A<span>:</span>E</span><div><span class="mini-label">INSIDE MAGNUS</span><h3>Ardent runs the work. Emberfold carries the context.</h3><p>Ardent is Magnus’s headless agent runtime. It can run on its own or under Magnus management; its pinned Emberfold library helps fit context for the next turn.</p></div><a class="text-link" href="https://github.com/ChefTaco/magnus/tree/main/packages/ardent" target="_blank" rel="noopener noreferrer">Explore Ardent ${icon("external")}</a></div>
    </section>
    <section class="screens-section" aria-labelledby="screens-title"><div class="shell"><div class="section-head"><div><span class="section-kicker">IN THE INTERFACE / 03</span><h2 id="screens-title">From diagram to daily use.</h2></div><p>Real project interfaces, captured from disposable environments with sample information.</p></div><div class="screen-grid">
      ${(["hive", "magnus", "chattermost", "emberfold"] as ProjectId[])
        .map((id, i) => {
          const p = projects[id];
          return `<figure class="screen-card screen-${id}"><div class="screen-frame">${
            p.image
              ? `<a href="${p.image}" target="_blank" rel="noopener noreferrer" aria-label="Open full ${p.name} capture"><img src="${p.image}" alt="${p.imageAlt}" loading="lazy" decoding="async" width="1280" height="720" /></a>`
              : `<div class="screen-terminal"><div class="terminal-top"><span>EMBERFOLD / CLI</span><span>SYNTHETIC INPUT</span></div><p><span>$</span> emberfold prepare --input emberfold.json --dry-run</p><pre tabindex="0" aria-label="Excerpt from actual Emberfold dry run output">{
  "tokens": {
    "input_tokens": 100,
    "max_input_tokens": 12000,
    "output_reserve_tokens": 4000,
    "method": "estimate"
  },
  "protected_spans_verified": 0,
  "compacted": false,
  "fits": true
}</pre><div class="terminal-foot">OUTPUT EXCERPT · NO MODEL CALLS</div></div>`
          }</div><figcaption><span>0${i + 1} / ${p.name}</span><span>${id === "emberfold" ? "Verified dry run · output excerpt" : "Sample data · open full capture ↗"}</span></figcaption></figure>`;
        })
        .join("")}
    </div></div></section>
    <section class="install-section shell" id="install" aria-labelledby="install-title"><div class="section-head"><div><span class="section-kicker">INSTALL LAB / 04</span><h2 id="install-title">Try it on your host.</h2></div><p>Follow the first steps here, then continue with each project’s full guide. These walkthroughs explain commands; they do not run them for you.</p></div>
      <div class="install-layout"><div class="demo-sidebar"><div class="demo-tabs" role="tablist" aria-orientation="vertical" aria-label="Choose an installation walkthrough">${demoOrder.map((id, i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="demo-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-demo="${id}"><span class="tab-counter">0${i + 1}</span><span>${demos[id].label}</span>${icon("chevron")}</button>`).join("")}</div><p class="demo-disclaimer">Use a fresh environment for a first install. Existing installations follow their own upgrade guides.</p></div><div class="demo-panel" id="demo-panel" role="tabpanel" aria-labelledby="tab-hive" tabindex="0"></div></div>
    </section>
    <section class="closing"><div class="shell closing-inner"><div><span class="section-kicker">YOUR INFRASTRUCTURE. YOUR CHOICE.</span><h2>Start with one piece.<br/><em>Make it yours.</em></h2></div><a class="button button-light" href="https://github.com/ChefTaco" target="_blank" rel="noopener noreferrer">Explore the repositories ${icon("arrow")}</a></div></section>
  </main>
  <footer class="site-footer"><div class="shell footer-inner"><a class="brand" href="#top"><span>Hive<span class="brand-colon">:</span>Magnus</span></a><p>Open source tools for self-hosted agents.</p><div><a href="https://github.com/ChefTaco/hive">Hive</a><a href="https://github.com/ChefTaco/magnus">Magnus</a><a href="https://github.com/ChefTaco/ChatterMost">ChatterMost</a><a href="https://github.com/ChefTaco/emberfold">Emberfold</a><a href="https://github.com/ChefTaco/HiveMagnus">Site source</a></div><p class="footer-legal">Each project is licensed under Apache-2.0. ChatterMost is independently developed and Mattermost-compatible; Mattermost is a trademark of Mattermost, Inc., which does not affiliate with, endorse, or sponsor it.</p></div></footer>
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
  const paths: Record<ProjectId, string> = {
    hive: "M402 255 210 112",
    magnus: "M402 255 593 112",
    chattermost: "",
    emberfold: "M402 255 605 390",
  };
  document
    .querySelector(".atlas-line-active")
    ?.setAttribute("d", paths[activeProject]);
}

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
    .querySelectorAll<HTMLButtonElement>('[role="tab"]')
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
  .querySelectorAll<HTMLButtonElement>('[role="tab"]')
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
renderDemo();
