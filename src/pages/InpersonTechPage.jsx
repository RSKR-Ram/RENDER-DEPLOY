import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../auth/useAuth';
import { inpersonMarksSave, inpersonPipelineList, techSelect, testFailDecide } from '../api/candidates';
import { saveRejectRevertDraft } from '../utils/storage';
import { LoadingOverlay, Spinner } from '../components/ui/Spinner';
import { Collapsible } from '../components/ui/Collapsible';

function fmtDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function InpersonTechPage() {
  const { token, role, legacyRole, canPortal, canAction } = useAuth();

  function allowPortal_(portalKey, fallbackRoles) {
    const v = typeof canPortal === 'function' ? canPortal(portalKey) : null;
    if (v === true || v === false) return v;
    const r = String(legacyRole || role || '').toUpperCase();
    return Array.isArray(fallbackRoles) ? fallbackRoles.includes(r) : false;
  }

  function allowAction_(actionKey, fallbackRoles) {
    const v = typeof canAction === 'function' ? canAction(actionKey) : null;
    if (v === true || v === false) return v;
    const r = String(legacyRole || role || '').toUpperCase();
    return Array.isArray(fallbackRoles) ? fallbackRoles.includes(r) : false;
  }

  const portalAllowed = allowPortal_('PORTAL_HR_INPERSON', ['HR', 'ADMIN']);

  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState('ALL');
  const [items, setItems] = useState([]);
  const [marksDraft, setMarksDraft] = useState({});
  const [testsDraft, setTestsDraft] = useState({});
  const [busyKey, setBusyKey] = useState('');
  const [decisionCtx, setDecisionCtx] = useState(null);
  const [decisionRemark, setDecisionRemark] = useState('');

  function isContinued_(it, testType) {
    try {
      const obj = JSON.parse(String(it?.testDecisionsJson || '{}'));
      const entry = obj?.[testType];
      return String(entry?.decision || '').toUpperCase() === 'CONTINUE';
    } catch {
      return false;
    }
  }

  const roleTabs = useMemo(() => {
    const roles = Array.from(new Set(items.map((x) => x.jobRole).filter(Boolean)));
    roles.sort((a, b) => String(a).localeCompare(String(b)));
    return ['ALL', ...roles];
  }, [items]);

  async function load(nextRole) {
    if (!portalAllowed) return;
    if (!allowAction_('INPERSON_PIPELINE_LIST', ['HR', 'ADMIN'])) return;
    setLoading(true);
    try {
      const res = await inpersonPipelineList(token, { jobRole: nextRole && nextRole !== 'ALL' ? nextRole : '' });
      setItems(res.items ?? []);

      // initialize drafts
      const nextMarks = {};
      const nextTests = {};
      for (const it of res.items ?? []) {
        nextMarks[it.candidateId] = it.inPersonMarks ?? '';
        nextTests[it.candidateId] = Array.isArray(it.techSelectedTests) ? it.techSelectedTests : [];
      }
      setMarksDraft(nextMarks);
      setTestsDraft(nextTests);
    } catch (e) {
      toast.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(jobRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRole, portalAllowed]);

  const filtered = useMemo(() => {
    if (jobRole === 'ALL') return items;
    return items.filter((x) => x.jobRole === jobRole);
  }, [items, jobRole]);

  const pendingMarks = useMemo(() => filtered.filter((x) => x.inPersonMarks === '' || x.inPersonMarks == null), [filtered]);
  const afterMarks = useMemo(() => filtered.filter((x) => x.inPersonMarks !== '' && x.inPersonMarks != null), [filtered]);
  const decisionRequiredMarks = useMemo(
    () =>
      afterMarks.filter((x) => {
        const marks = Number(x.inPersonMarks);
        if (!Number.isFinite(marks)) return false;
        if (marks >= 6) return false;
        return !isContinued_(x, 'INPERSON_MARKS');
      }),
    [afterMarks]
  );

  async function onSaveMarks(it) {
    if (!allowAction_('INPERSON_MARKS_SAVE', ['HR', 'ADMIN'])) {
      toast.error('Not allowed');
      return;
    }
    const raw = marksDraft[it.candidateId];
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      toast.error('Enter marks (0-10)');
      return;
    }

    const key = `${it.candidateId}:MARKS`;
    setBusyKey(key);
    try {
      const res = await inpersonMarksSave(token, { requirementId: it.requirementId, candidateId: it.candidateId, marks: n });
      if (res.decisionRequired && String(res.passFail || '').toUpperCase() === 'FAIL') {
        toast.error('FAIL — HR decision required');
        setDecisionCtx({
          requirementId: it.requirementId,
          candidateId: it.candidateId,
          candidateName: it.candidateName,
          testType: res.testType || 'INPERSON_MARKS',
          stageTag: res.stageTag || 'In-person Marks',
          marks: { inPersonMarks: n },
        });
        setDecisionRemark('');
        return;
      }

      toast.success('Marks saved');
      setItems((prev) => prev.map((x) => (x.candidateId === it.candidateId ? { ...x, inPersonMarks: n, inPersonMarksAt: new Date().toISOString() } : x)));
    } catch (e) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusyKey('');
    }
  }

  function toggleTest(candidateId, testName) {
    setTestsDraft((prev) => {
      const cur = Array.isArray(prev[candidateId]) ? prev[candidateId] : [];
      const exists = cur.includes(testName);
      const next = exists ? cur.filter((t) => t !== testName) : [...cur, testName];
      return { ...prev, [candidateId]: next };
    });
  }

  async function onSaveTech(it) {
    if (!allowAction_('TECH_SELECT', ['HR', 'ADMIN'])) {
      toast.error('Not allowed');
      return;
    }
    const key = `${it.candidateId}:TECH`;
    setBusyKey(key);
    try {
      const tests = testsDraft[it.candidateId] ?? [];
      const res = await techSelect(token, { requirementId: it.requirementId, candidateId: it.candidateId, tests });
      toast.success('Tech tests saved');
      setItems((prev) => prev.map((x) => (x.candidateId === it.candidateId ? { ...x, techSelectedTests: res.tests ?? tests, techSelectedAt: res.techSelectedAt } : x)));
    } catch (e) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusyKey('');
    }
  }

  async function onCopyDetails(it) {
    const tests = Array.isArray(testsDraft[it.candidateId]) ? testsDraft[it.candidateId] : it.techSelectedTests || [];
    const text = [
      `Name: ${it.candidateName}`,
      `Mobile: ${it.mobile}`,
      `Role: ${it.jobRole}${it.jobTitle ? ` (${it.jobTitle})` : ''}`,
      `Online Test: ${it.onlineTestResult} ${it.onlineTestScore !== '' ? `(${it.onlineTestScore}/10)` : ''}`,
      `In-person Marks: ${marksDraft[it.candidateId] ?? it.inPersonMarks ?? ''}`,
      `Technical Tests: ${tests.join(', ')}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed');
    }
  }

  const fetchData = () => load(jobRole);

  return (
    <AppLayout>
      {decisionCtx ? (
        <div className="card" style={{ marginBottom: 12, border: '1px solid var(--gray-200)' }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>In-person FAIL — HR decision required</div>
          <div className="small" style={{ color: 'var(--gray-600)', marginBottom: 10 }}>
            {decisionCtx.candidateName || decisionCtx.candidateId} · {decisionCtx.stageTag}
          </div>

          <div className="small" style={{ marginBottom: 6, fontWeight: 700 }}>Remark (required only if Reject)</div>
          <textarea value={decisionRemark} onChange={(e) => setDecisionRemark(e.target.value)} rows={2} style={{ width: '100%' }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              className="button"
              type="button"
              onClick={async () => {
                try {
                  await testFailDecide(token, {
                    requirementId: decisionCtx.requirementId,
                    candidateId: decisionCtx.candidateId,
                    testType: decisionCtx.testType,
                    decision: 'CONTINUE',
                    remark: String(decisionRemark || '').trim(),
                    stageTag: decisionCtx.stageTag,
                    meta: { marks: decisionCtx.marks },
                  });
                  toast.success('Override applied (Continued)');
                  setDecisionCtx(null);
                  setDecisionRemark('');
                  await load(jobRole);
                } catch (e) {
                  toast.error(e?.message || 'Failed');
                }
              }}
              disabled={!!busyKey}
            >
              Continue
            </button>
            <button
              className="button danger"
              type="button"
              onClick={async () => {
                const r = String(decisionRemark || '').trim();
                if (!r) {
                  toast.error('Remark is required to Reject');
                  return;
                }
                try {
                  await testFailDecide(token, {
                    requirementId: decisionCtx.requirementId,
                    candidateId: decisionCtx.candidateId,
                    testType: decisionCtx.testType,
                    decision: 'REJECT',
                    remark: r,
                    stageTag: decisionCtx.stageTag,
                    meta: { marks: decisionCtx.marks },
                  });
                  saveRejectRevertDraft({ requirementId: decisionCtx.requirementId, candidateId: decisionCtx.candidateId });
                  toast.success('Rejected');
                  setDecisionCtx(null);
                  setDecisionRemark('');
                  await load(jobRole);
                } catch (e) {
                  toast.error(e?.message || 'Failed');
                }
              }}
              disabled={!!busyKey}
            >
              Reject
            </button>
            <button className="button" type="button" onClick={() => setDecisionCtx(null)} disabled={!!busyKey}>
              Close
            </button>
          </div>
        </div>
      ) : null}
      {!portalAllowed ? (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Not allowed</div>
          <div className="small" style={{ color: 'var(--gray-600)' }}>You don’t have access to In-person portal.</div>
        </div>
      ) : null}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title">In-person Interview + Technical Selection</h1>
        <p className="page-subtitle">Shows candidates who passed the online test</p>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button className="button" onClick={fetchData} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Spinner size={14} /> : null}
            Refresh
          </button>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge">{filtered.length} candidates</span>
          </div>
        </div>

        <div style={{ height: 12 }} />
        <div className="tabs">
          {roleTabs.map((r) => (
            <button
              key={r}
              className={['tab', jobRole === r ? 'active' : ''].join(' ')}
              onClick={() => setJobRole(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingOverlay text="Loading candidates..." />
      ) : (
        <>
          <Collapsible
            title="In-person Marks FAIL (Decision Required)"
            subtitle="Candidates with marks < 6 must be Continued/Rejected by HR"
            badge={decisionRequiredMarks.length}
            variant="card"
            defaultOpen={decisionRequiredMarks.length > 0}
          >
            {decisionRequiredMarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <div className="empty-state-text">No pending decisions</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {decisionRequiredMarks.map((it) => {
                  const marks = Number(it.inPersonMarks);
                  return (
                    <div key={it.candidateId} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
                      <div className="row" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 240 }}>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{it.candidateName}</div>
                          <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                            {it.jobTitle ? `${it.jobTitle} · ` : ''}{it.jobRole} · {it.mobile}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>
                              In-person: {it.inPersonMarks}/10
                            </span>
                            <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>Decision Required</span>
                          </div>
                        </div>

                        <div className="action-grid" style={{ marginLeft: 'auto' }}>
                          <button
                            className="button"
                            type="button"
                            onClick={() => {
                              setDecisionCtx({
                                requirementId: it.requirementId,
                                candidateId: it.candidateId,
                                candidateName: it.candidateName,
                                testType: 'INPERSON_MARKS',
                                stageTag: 'In-person Marks',
                                marks: { inPersonMarks: Number.isFinite(marks) ? marks : it.inPersonMarks },
                              });
                              setDecisionRemark('');
                            }}
                            disabled={!!busyKey || !allowAction_('TEST_FAIL_DECIDE', ['HR', 'ADMIN'])}
                          >
                            Decide (Continue/Reject)
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Collapsible>

          <div style={{ height: 16 }} />

          <Collapsible
            title="Pending In-person Marks"
            subtitle="Candidates awaiting in-person interview marks"
            badge={pendingMarks.length}
            variant="card"
            defaultOpen={true}
          >
            {pendingMarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <div className="empty-state-text">No candidates pending marks</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {pendingMarks.map((it) => {
                  const keyMarks = `${it.candidateId}:MARKS`;
                  return (
                    <div key={it.candidateId} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
                      <div className="row" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 240 }}>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{it.candidateName}</div>
                          <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                            {it.jobTitle ? `${it.jobTitle} · ` : ''}{it.jobRole} · {it.mobile}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: String(it.onlineTestResult || '').toUpperCase() === 'PASS' ? '#22c55e' : '#ef4444', color: '#fff' }}>
                              Online: {String(it.onlineTestResult || '').toUpperCase()}
                            </span>
                            {String(it.onlineTestResult || '').toUpperCase() === 'FAIL' && isContinued_(it, 'ONLINE_TEST') ? (
                              <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>HR Override Applied</span>
                            ) : null}
                            {it.onlineTestScore !== '' ? (
                              <span className="badge">Score: {it.onlineTestScore}/10</span>
                            ) : null}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
                          <input
                            style={{ width: 90 }}
                            placeholder="Marks"
                            value={marksDraft[it.candidateId] ?? ''}
                            onChange={(e) => setMarksDraft((p) => ({ ...p, [it.candidateId]: e.target.value }))}
                          />
                          <button
                            className="button primary"
                            type="button"
                            onClick={() => onSaveMarks(it)}
                            disabled={!!busyKey || !allowAction_('INPERSON_MARKS_SAVE', ['HR', 'ADMIN'])}
                          >
                            {busyKey === keyMarks ? <Spinner size={14} /> : null}
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Collapsible>
          <div style={{ height: 16 }} />

          <Collapsible
            title="Technical Selection (Marks ≥ 6 or HR override)"
            subtitle="Select technical tests for qualified candidates"
            badge={afterMarks.length}
            variant="card"
            defaultOpen={true}
          >
            {afterMarks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⚙️</div>
                <div className="empty-state-text">No candidates ready for technical selection</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {afterMarks.map((it) => {
                  const marks = Number(it.inPersonMarks);
                  const marksContinued = isContinued_(it, 'INPERSON_MARKS');
                  const canSelect = (Number.isFinite(marks) && marks >= 6) || marksContinued;
                  const allowed = it.allowedTechTests ?? [];
                  const selected = testsDraft[it.candidateId] ?? [];
                  const keyTech = `${it.candidateId}:TECH`;

                  return (
                    <div key={it.candidateId} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
                      <div className="row" style={{ alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ minWidth: 240 }}>
                          <div style={{ fontWeight: 700, fontSize: '15px' }}>{it.candidateName}</div>
                          <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                            {it.jobTitle ? `${it.jobTitle} · ` : ''}{it.jobRole} · {it.mobile}
                          </div>
                          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span className="badge" style={{ background: marks >= 6 ? '#22c55e' : '#ef4444', color: '#fff' }}>
                              In-person: {it.inPersonMarks}/10
                            </span>
                            {Number.isFinite(marks) && marks < 6 ? (
                              marksContinued ? (
                                <span className="badge" style={{ background: '#f59e0b', color: '#fff' }}>HR Override Applied</span>
                              ) : (
                                <span className="badge" style={{ background: '#ef4444', color: '#fff' }}>Decision Required</span>
                              )
                            ) : null}
                            {it.inPersonMarksAt ? (
                              <span className="badge">📅 {fmtDateTime(it.inPersonMarksAt)}</span>
                            ) : null}
                          </div>
                        </div>

                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <button className="button" type="button" onClick={() => onCopyDetails(it)}>
                            📋 Copy
                          </button>
                        </div>
                      </div>

                      {!canSelect ? (
                        <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef3c7', borderRadius: 'var(--radius)', fontSize: '13px' }}>
                          ⚠️ Technical Test selection disabled (marks must be ≥ 6 or HR override required)
                        </div>
                      ) : (
                        <>
                          <div style={{ height: 12 }} />
                          <div className="small" style={{ fontWeight: 600 }}>Select tests:</div>
                          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                            {allowed.map((t) => (
                              <label key={t} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: '14px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={selected.includes(t)} onChange={() => toggleTest(it.candidateId, t)} />
                                {t}
                              </label>
                            ))}
                          </div>

                          <div style={{ height: 12 }} />
                          <div className="row" style={{ alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                            <button
                              className="button primary"
                              type="button"
                              onClick={() => onSaveTech(it)}
                              disabled={!!busyKey || !allowAction_('TECH_SELECT', ['HR', 'ADMIN'])}
                            >
                              {busyKey === keyTech ? <Spinner size={14} /> : null}
                              Save Technical Tests
                            </button>
                            {it.techSelectedAt ? (
                              <span className="small" style={{ color: 'var(--gray-500)' }}>
                                ✓ Saved: {fmtDateTime(it.techSelectedAt)}
                              </span>
                            ) : null}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Collapsible>
        </>
      )}
    </AppLayout>
  );
}
