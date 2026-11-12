# Embermend

Embermend tracks continuous hardening and vulnerability remediation for Magnus-managed hosts and applications. Use its recommendations and decisions in HiveXUI. Magnus remains responsible for enrollment, capability admission, isolated execution, resource ownership and receipts.

## Install

Use a compatible signed Hive release, starting with 3.2.2, and select the optional Embermend product. It is off by default. Select compatible Magnus 2.5.0 or newer, or explicitly configure an existing Magnus with the versioned Embermend bridge.

```sh
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

The launcher verifies the signed manifest and matching controller. Replace `latest` with an exact compatible release when reproducing an installation. Follow the [Hive guide](/guides/hive.md) for prerequisites, TLS, protected configuration and recovery. Inference services and model storage remain external.

For an existing installation, update its reviewed configuration, retain a verified backup and restore rehearsal, and use the owning installer's upgrade path with explicit migration approval. The 3.2.2 signed release also verifies and repairs the omitted database-format registration that can affect a new Embermend selection in 3.2.0. It refuses unknown database majors, runtime receipts or failed checksums.

## Start with assessment

Link the existing Oathweave operator by issuer and subject. Grant only the intended Embermend operations and application/target scopes; a broad role name is neither automatic approval nor a reason to reject an otherwise valid identity. A useful starting grant is `read`, `evidence` and `assess`. Browser permission ceilings and receiving-product grants both apply.

Publish reviewed, versioned profiles through an authorized operator, then request an assessment through the coordinator. Magnus must advertise the actual capabilities of each enrolled target. Missing support blocks the affected operation. Initial production rollout uses bounded inventory and assessment; it does not enable production mutation policies.

Ubuntu 24.04, GitHub TypeScript/JavaScript monorepos and Docker Compose are the reference targets. Vendor OVAL and supported Trivy assessments retain feed versions and applicability decisions. The custom scanner reports candidates and coverage; focused tests, supported static evidence or technical review must validate a defect and its repair. Missing results never close unexamined work.

## Explain, decide and verify

The Embermend section of HiveXUI shows a concise recommendation, exact revision, service impact, progress and evidence. Its durable explanation must be published before covered mutation. An explicit matching decision or deterministic standing policy authorizes only the bound targets, revision, parameters or patch, action versions and impact.

Preparation, branch/PR writing, host changes, merge, artifact publication, deployment, exception acceptance and recovery are separate permissions. The Ardent plugin supplies typed investigation and planning tools; coordinator credentials cannot approve their own work or edit standing policy.

Campaigns retain ordering, canaries, disruption limits and pause state. Source correction, build success, immutable image publication, deployed correction, security verification and operational health remain separate facts. Unknown outcomes retain their original operation identities; recovery never silently repeats them. Credential exposure stays outstanding until the owning system proves invalidation and required consumer migration.

## Inference and optional integrations

Configure an approved Codex local CLI, Claude local CLI, network llama.cpp server or OpenAI-compatible endpoint. Credentialed inference and provider brokers stay outside repository sandboxes. Rootless Magnus workers execute repository code with bounded resources, restricted egress and no management credentials or host sockets.

Cindertrace, ChatterMost, HiveMem and HiveSkills are optional. Their absence does not disable core remediation. Embermend has no separate endpoint agent, standalone host-management mode or direct SSH fallback.

## Evidence and limits

The [acceptance ledger](https://github.com/ChefTaco/Embermend/blob/main/docs/ACCEPTANCE.md) records the supported reference journeys, fault recovery, signed installation/restore proof and scoped production assessment. These are bounded demonstrations, not a claim that every host, deployment or file is assessed or secure. Unknown deployment exposure and unsupported coverage remain explicit. Public screenshots use synthetic documentation data.

- [Source and installation status](https://github.com/ChefTaco/Embermend)
- [Inference configuration](https://github.com/ChefTaco/Embermend/blob/main/docs/INFERENCE.md)
- [Provider authorization](https://github.com/ChefTaco/Embermend/blob/main/docs/GITHUB_PROVIDER_AUTH.md)
- [Recovery semantics](https://github.com/ChefTaco/Embermend/blob/main/docs/RECOVERY.md)

## Source review

Reviewed 2026-11-12 against Embermend `v0.1.0`, source
`f92a580e92e687cf105dec77a4b9d503b65e7215`, its product specification,
inference guide, provider authorization, recovery guide and acceptance ledger.
The compatible installer is reviewed against signed Hive `v3.2.2`,
Magnus `v2.5.0`, Oathweave `v2.2.0` and HiveXUI `v0.3.0`.
Signed Hive `v3.3.0` keeps Embermend 0.1.0, Magnus 2.5.0 and Oathweave 2.2.0
unchanged and pins HiveXUI 0.4.0.
The public example uses no operational configuration or credentials.

Operational acceptance was reviewed at documentation commit `31390ff520d13ed0faf598b4151dba424e095aea`: [AC-01–AC-24 ledger](https://github.com/ChefTaco/Embermend/blob/31390ff520d13ed0faf598b4151dba424e095aea/docs/ACCEPTANCE.md), [production scope and restore proof](https://github.com/ChefTaco/Embermend/blob/31390ff520d13ed0faf598b4151dba424e095aea/docs/acceptance/2026-11-12-production-assessment.json), and [permissions and operations](https://github.com/ChefTaco/Embermend/blob/31390ff520d13ed0faf598b4151dba424e095aea/docs/OPERATIONS.md). All three profiles completed after the signed upgrade; the Ubuntu baseline retains three unassessed checks. Initial production access is scoped assessment with mutation policies disabled.
