# Embermend

Embermend tracks continuous hardening and vulnerability remediation for Magnus-managed hosts and applications. Use its recommendations and decisions in HiveXUI. Magnus remains responsible for enrollment, capability admission, isolated execution, resource ownership and receipts.

## Install

Install it with a signed Hive release and select the optional Embermend product; it is off by default. The tested combination is the one a signed release pins: Hive {{hm.suite}} pins Embermend {{hm.version:embermend}} (since {{hm.since:embermend}}) with Magnus {{hm.version:magnus}}, which speaks Embermend protocol 1. Select Magnus in the same installation, or explicitly configure an existing Magnus with the versioned Embermend bridge at the version that release pins. Embermend's README still names its oldest supported combination (Hive 3.2.2 with Magnus 2.5.0); a newer installation should use the current release, not that minimum.

```sh
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

The launcher verifies the signed manifest and matching controller. Replace `latest` with an exact compatible release when reproducing an installation. Follow the [Hive guide](/guides/hive.md) for prerequisites, TLS, protected configuration and recovery. Inference services and model storage remain external.

For an existing installation, update its reviewed configuration, retain a verified backup and restore rehearsal, and use the owning installer's upgrade path with explicit migration approval. The 3.2.2 signed release also verifies and repairs the omitted database-format registration that can affect a new Embermend selection in 3.2.0. It refuses unknown database majors, runtime receipts or failed checksums. Embermend 0.3.0 adds a database migration, so upgrading an installation that already includes Embermend from a release before 3.6.0 needs `--allow-migrations`; see the [Hive guide](/guides/hive.md#upgrade).

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

Release update, 2026-11-20: signed Hive `v3.12.9`, commit
`353eb340634ae2fe8d63ae97360f701b9acb2a7b`, pins Embermend 0.3.4, tag
[`v0.3.4`](https://github.com/ChefTaco/Embermend/releases/tag/v0.3.4), commit
`24c17dcd7ae9f9a6d91b49b8b1721f3b219a8578`, with Magnus 3.1.5, Oathweave 2.3.2
and HiveXUI 0.10.3 (Hive 3.9.3 to 3.12.7 pinned 0.3.2; the unpublished Hive
3.12.8 pinned 0.3.3). Per its
[changelog](https://github.com/ChefTaco/Embermend/blob/v0.3.4/CHANGELOG.md),
0.3.3 redacts private-key blocks with a linear scan instead of a regular
expression that took quadratic time on text with many unmatched
`-----BEGIN …PRIVATE KEY-----` markers (CodeQL `js/polynomial-redos`), keeping
the same blocks and their line count, and 0.3.4 forces `effect` to 3.22.1
through an npm override, fixing CVE-2026-121707 in the container images, where
its only consumer is the Prisma CLI configuration loader used for migrations.
Its [README](https://github.com/ChefTaco/Embermend/blob/v0.3.4/README.md) still
asks for Magnus 2.5.0 or newer with its explicit Embermend bridge, and the
protocol stays 1. Neither adds a migration. The acceptance record below was not
reviewed again for this update.

Earlier release records for this guide are kept in the site repository's [embermend release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/embermend.md); what each Embermend release changed is in its [changelog](https://github.com/ChefTaco/Embermend/blob/main/CHANGELOG.md).
