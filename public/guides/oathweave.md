# Oathweave

> Identity, authentication, authorization, browser sign-in and service identities.

**Candidate extraction.** The new ecosystem has no official signed suite release yet. Independent product and installation acceptance must pass before replacing an existing deployment. This guide describes the candidate ownership boundary; it is not a published installation recipe.

## Responsibility

Browser sign-in uses Authorization Code with PKCE S256 and explicit resource audiences. Product APIs validate independently. Account links require an approved issuer/subject to existing product ID mapping; matching email never merges accounts. MFA, passkeys, recovery and consent remain identity-owned.

## Suite integration

Hive plans and installs selected product containers with independently pinned versions. Core includes Oathweave, Emberpath, HiveMem, HiveSkills and HiveXUI. Full adds Magnus/Ardent, Cindertrace, ChatterMost and optional Emberfold HTTP. Each product retains standalone operation and its own data, credentials and recovery lifecycle.

Do not copy a sibling backend source tree into the browser application. Products own their API specifications and browser-safe contracts. Native machine protocols remain separate from suite browser sign-in.

## Migration and recovery

Preserve existing databases, signing keys, native issuer URLs, client registrations, memberships and audit history. Restore a backup in isolation with dispatchers and collectors disabled before activation. Only one writer may be active during cutover. Existing frontends and published packages remain recovery paths until acceptance passes. No production cutover is authorized by a successful rehearsal.

## Source review

Reviewed against the local extracted candidate implementation on 2026-11-05, revision `c799515`. The extracted repository has not been published as part of an official suite release. Original source attribution, licenses and immutable history remain preserved in the [published Hive source](https://github.com/ChefTaco/hive).

[Product directory](/index.md) · [Hive installation boundary](/guides/hive.md)
