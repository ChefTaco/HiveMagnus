# Embermend

Embermend tracks continuous hardening and vulnerability remediation for Magnus-managed hosts and applications. Use its recommendations and decisions in HiveXUI. Magnus remains responsible for enrollment, capability admission, isolated execution, resource ownership and receipts.

## Install

Install it with a signed Hive release and select the optional Embermend product; it is off by default. The tested combination is the one a signed release pins: Hive {{hm.suite}} pins Embermend {{hm.version:embermend}} (since {{hm.since:embermend}}) with Magnus {{hm.version:magnus}}, which speaks Embermend protocol 1. Select Magnus in the same installation, or explicitly configure an existing Magnus with the versioned Embermend bridge at the version that release pins. Embermend's README still names its oldest supported combination (Hive 3.2.2 with Magnus 2.5.0); a newer installation should use the current release, not that minimum.

```sh
git clone https://github.com/ChefTaco/hive.git && cd hive
./hive.sh --release latest
```

The launcher verifies the signed manifest and matching controller. Replace `latest` with an exact compatible release when reproducing an installation. Follow the [Hive guide](/guides/hive.md) for prerequisites, TLS, protected configuration and recovery. Inference services and model storage remain external.

For an existing installation, update its reviewed configuration, retain a verified backup and restore rehearsal, and use the owning installer's upgrade path with explicit migration approval. The 3.2.2 signed release also verifies and repairs the omitted database-format registration that can affect a new Embermend selection in 3.2.0. It refuses unknown database majors, runtime receipts or failed checksums. Embermend 0.3.0 adds a database migration, so upgrading an installation that already includes Embermend from a release before 3.6.0 needs `--allow-migrations`; see the [Hive guide](/guides/hive.md#upgrade). Embermend 0.5.0 adds the additive migration `list_paging`, which Hive 3.15.0 applies through Embermend's signed initialization, so an upgrade from Hive 3.14.x also needs `--allow-migrations`. Read Hive's [Suite 3.15.0 notes](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round) first: from Embermend 0.4.0, queued work and scheduled occurrences whose stored operator grant no longer matches `EMBERMEND_IDENTITY_GRANTS` fail with an `ACTOR_*` code or are blocked, so review the `job.authority-*` and `schedule.blocked` audit entries after the upgrade. From 0.5.0 an identity-provider outage answers 503 `IDENTITY_PROVIDER_UNAVAILABLE` instead of 401, the API health check reads `/health/ready`, which checks PostgreSQL, and list endpoints page with cursors.

## Start with assessment

Link the existing Oathweave operator by issuer and subject. Grant only the intended Embermend operations and application/target scopes; a broad role name is neither automatic approval nor a reason to reject an otherwise valid identity. A useful starting grant is `read`, `evidence` and `assess`. Browser permission ceilings and receiving-product grants both apply. Grants come from `EMBERMEND_IDENTITY_GRANTS` or, from 0.5.0, a grants file (`EMBERMEND_IDENTITY_GRANTS_FILE`) that the API and worker reload within seconds; removing or narrowing a grant stops the operator's stored work too. From 0.6.0 operator authority can instead come from Oathweave roles (`EMBERMEND_AUTHORITY_SOURCE=oathweave`); it is opt-in, the default stays the grants list, and Embermend's changelog says it is not yet exercised against a live Oathweave installation.

Publish reviewed, versioned profiles through an authorized operator, then request an assessment through the coordinator. Magnus must advertise the actual capabilities of each enrolled target. Missing support blocks the affected operation. Initial production rollout uses bounded inventory and assessment; it does not enable production mutation policies.

Ubuntu 24.04, GitHub TypeScript/JavaScript monorepos and Docker Compose are the reference targets. Vendor OVAL and supported Trivy assessments retain feed versions and applicability decisions. The custom scanner reports candidates and coverage; focused tests, supported static evidence or technical review must validate a defect and its repair. Missing results never close unexamined work.

## Explain, decide and verify

The Embermend section of HiveXUI shows a concise recommendation, exact revision, service impact, progress and evidence. Its durable explanation must be published before covered mutation. An explicit matching decision or deterministic standing policy authorizes only the bound targets, revision, parameters or patch, action versions and impact.

Preparation, branch/PR writing, host changes, merge, artifact publication, deployment, exception acceptance and recovery are separate permissions. The Ardent plugin supplies typed investigation and planning tools (from 0.6.1 also on npm as `@hivemagnus/embermend-ardent-plugin`); coordinator credentials cannot approve their own work or edit standing policy.

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

Release update, 2026-11-27: signed Hive `v3.15.1`, commit
`ac79185031440e1b76f5c62d4c8d0f83f19b98b7`, pins Embermend 0.6.1 (API and
worker), tag [`v0.6.1`](https://github.com/ChefTaco/Embermend/releases/tag/v0.6.1),
commit `22dd9816aa8450b0ab0d254e19b9b99a43460f37`, with Magnus 3.4.1,
Oathweave 2.7.0 and HiveXUI 0.14.0, as signed Hive `v3.15.0`, commit
`4055623fc57b804a27237e5e493bd2985dcd3cd6`, first did with Oathweave 2.6.0 and
HiveXUI 0.13.0 (Hive 3.12.9 to 3.14.3 pinned 0.3.4). Per its
[changelog](https://github.com/ChefTaco/Embermend/blob/v0.6.1/CHANGELOG.md),
0.4.0 checks stored work against the current grants, 0.5.0 adds the
`list_paging` migration, the hot-reloaded grants file, cursor paging, the 503
for identity-provider outages and the readiness health check, 0.6.0 adds opt-in
Oathweave role authority with no migration, and 0.6.1 changes only npm
publication, so its Ardent plugin, contracts and integrations packages are the
first on npm (checked with `npm view`). The upgrade text above also follows
Hive's [UPGRADING](https://github.com/ChefTaco/hive/blob/v3.15.1/UPGRADING.md#suite-3150-product-security-round).
Its [README](https://github.com/ChefTaco/Embermend/blob/v0.6.1/README.md)
still asks for Magnus 2.5.0 or newer with its explicit Embermend bridge, the
release's compatibility record and contracts keep protocol 1, and Magnus
`v3.4.1` still serves Embermend protocol 1. The
[acceptance ledger](https://github.com/ChefTaco/Embermend/blob/v0.6.1/docs/ACCEPTANCE.md)
is unchanged at that tag since the documentation commit above and was not
reviewed again; production access stays scoped assessment with mutation
policies disabled. No installation command was run for this update.

Earlier release records for this guide are kept in the site repository's [embermend release records](https://github.com/ChefTaco/HiveMagnus/blob/main/docs/release-records/embermend.md); what each Embermend release changed is in its [changelog](https://github.com/ChefTaco/Embermend/blob/main/CHANGELOG.md).
