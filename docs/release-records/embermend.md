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
