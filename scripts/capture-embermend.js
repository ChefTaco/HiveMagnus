// Playwright CLI run-code callback. Use only the disposable signed-suite fixture.
// API responses below are synthetic documentation data, never acceptance evidence.
async function captureEmbermend(page) {
  if (!/^https:\/\/localhost:[0-9]+$/.test(new URL(page.url()).origin)) throw Error('Disposable localhost fixture required');
  const scope = { installationId: 'example-suite', applicationIds: ['example-api'], targetIds: ['node-1.example.com'] };
  const hash = 'a'.repeat(64), observedAt = '2026-11-12T08:00:00Z';
  const finding = { id: 'example-finding', scope, kind: 'hardening', identity: hash, component: 'example-api', weakness: 'configuration-permissions', title: 'Limit configuration access', severity: 'medium', confidence: 1, validity: 'validated', rationale: 'Managed inventory observed broader file access than the reviewed profile permits.', evidenceIds: ['example-evidence'], classifications: [], priority: 40 };
  const row = { plan: { id: 'example-plan', revision: 3, scope, campaignId: 'example-campaign', objective: 'Protect application configuration', findingIds: [finding.id], evidenceIds: ['example-evidence'], actions: [{ id: 'example-action', version: 'file-mode.v1', class: 'host-change', targetId: scope.targetIds[0], targetKind: 'host', requiredCapabilities: ['embermend:file-mode.v1'], parameters: { resourceId: 'application-configuration', mode: '0600', beforeDigest: hash }, preconditions: { environment: 'example' }, dependsOn: [], verificationIds: ['example-verification'], recovery: 'Separately authorized restoration of the original permissions', expectedRevision: null, patchDigest: null, disruption: 'none' }], explanation: 'Restrict the application configuration to its owner. After the change, independently verify effective permissions and confirm the application can still read its configuration.', impact: 'No planned restart. Consumer access requires a separate health check.', uncertainty: ['Deployment exposure remains unknown until assessed.'], notBefore: observedAt, expiresAt: '2099-01-01T00:00:00Z', stopConditions: ['failed-verification'], maxUnavailable: 1, canaryTargetId: scope.targetIds[0] }, digest: hash, status: 'explained', publications: [{ id: 'example-publication', planId: 'example-plan', revision: 3, digest: hash, surface: 'hivexui', explanation: 'Synthetic published recommendation', publishedAt: observedAt }], executions: [], campaign: { id: 'example-campaign', installationId: scope.installationId, paused: false, generation: 1, createdAt: observedAt } };
  const findings = [{ finding, occurrences: [{ id: 'example-occurrence', findingId: finding.id, subjectId: scope.targetIds[0], branch: null, revision: null, artifactDigest: null, sourceState: 'not-applicable', runtimeState: 'unknown', coverage: { status: 'partial', requested: ['configuration', 'deployment exposure'], examined: ['configuration'], excluded: [{ path: 'deployment exposure', reason: 'Not yet assessed' }], failures: [], mode: 'full', observedAt }, evidenceIds: ['example-evidence'], recurrenceOf: null }] }];
  await page.route('**/api/embermend/api/v1/**', async route => {
    if (route.request().method() !== 'GET') return route.fulfill({ status: 403, json: { error: 'DOCUMENTATION_ONLY' } });
    const path = new URL(route.request().url()).pathname;
    const body = path.endsWith('/recommendations') ? [row] : path.endsWith('/findings') ? findings : path.endsWith('/access') ? { actorId: 'example-operator', kind: 'operator', permissions: ['read', 'evidence', 'approve'], scope } : null;
    return route.fulfill({ status: body === null ? 404 : 200, json: body });
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  if (await page.evaluate(() => window.devicePixelRatio) !== 2) throw Error('Open the fixture browser with deviceScaleFactor 2');
  await page.reload();
  await page.getByRole('heading', { name: row.plan.objective, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Approve revision 3', exact: true }).waitFor();
  await page.screenshot({ path: 'output/captures/embermend-recommendations.png', scale: 'device', animations: 'disabled' });
  console.log(JSON.stringify({ syntheticDocumentation: true, productionData: false, cssViewport: '1440x900', deviceScaleFactor: 2, owningUI: 'HiveXUI 0.3.0' }));
}
