# Embermend guide: earlier release records

These dated records were moved verbatim out of [`public/guides/embermend.md`](../../public/guides/embermend.md) so that the published guide keeps only its current release record. They describe the guide as it was on each date: "above" and "below" refer to that version of the guide, and the versions they name are not current. For current instructions read the [published guide](https://hivemagnus.com/guides/embermend.md); for what each release changed, read the Embermend [changelog](https://github.com/ChefTaco/Embermend/blob/main/CHANGELOG.md).

Release update, 2026-11-13: signed Hive `v3.7.0` pins Embermend 0.3.0, tag
[`v0.3.0`](https://github.com/ChefTaco/Embermend/releases/tag/v0.3.0), commit
`b9b522b7ac750cb3160a3abd9a0e15906e44adf2`, with Magnus 2.9.1, Oathweave 2.2.0
and HiveXUI 0.7.0. Per its changelog, 0.2.0 adds the event feed for the HiveXUI
inbox and 0.3.0 adds the suite audit export, its database migration and an
opt-in `emberpath` inference preset. The acceptance record below was not
reviewed again for this update.

Release update, 2026-11-14: signed Hive `v3.8.0` pins Embermend 0.3.1, tag
[`v0.3.1`](https://github.com/ChefTaco/Embermend/releases/tag/v0.3.1), commit
`be7e60b09a1f1db6a234c904d1a4875dba3e2259`, with Magnus 2.10.0, Oathweave 2.3.0
and HiveXUI 0.8.0. Per its changelog, 0.3.1 keeps a policy authorization's ID
in the suite audit export and skips a source file that is not UTF-8 in a
repository scan instead of failing the scan. It adds no migration. The
acceptance record below was not reviewed again for this update.

Release update, 2026-11-15: signed Hive `v3.9.3` pins Embermend 0.3.2, tag
[`v0.3.2`](https://github.com/ChefTaco/Embermend/releases/tag/v0.3.2), commit
`0aefa2b1c87a95b32864a63bf20a090fe2bf6e36`, with Magnus 3.0.3, Oathweave 2.3.0
and HiveXUI 0.9.1. Its `compatibility.json` still asks for Magnus 2.5.0 or newer
with Embermend protocol 1. Per its changelog, 0.3.2 moves to
`@hivemagnus/hive-common` 0.5.0, so the suite audit export also masks URL
credentials without a user or without a password and detail values under keys
containing `jwt`, `bearer` or `signature`. It adds no migration. The acceptance
record below was not reviewed again for this update.

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
