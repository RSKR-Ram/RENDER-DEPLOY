import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../auth/useAuth';
import { finalInterviewList, finalSendOwner } from '../api/candidates';
import { LoadingOverlay, Spinner } from '../components/ui/Spinner';
import { Collapsible } from '../components/ui/Collapsible';

function fmtDateTime(value) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export function FinalInterviewPage() {
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

  const portalAllowed = allowPortal_('PORTAL_HR_FINAL', ['HR', 'ADMIN']);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('PASSED');
  const [busyKey, setBusyKey] = useState('');

  async function load() {
    if (!portalAllowed) return;
    if (!allowAction_('FINAL_INTERVIEW_LIST', ['HR', 'ADMIN'])) return;
    setLoading(true);
    try {
      const res = await finalInterviewList(token);
      setItems(res.items ?? []);
    } catch (e) {
      toast.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portalAllowed]);

  const passed = useMemo(
    () => items.filter((x) => String(x.status || '').toUpperCase() !== 'FINAL_OWNER_PENDING'),
    [items]
  );
  const pendingOwner = useMemo(
    () => items.filter((x) => String(x.status || '').toUpperCase() === 'FINAL_OWNER_PENDING'),
    [items]
  );

  async function onSendToOwner(it) {
    if (!allowAction_('FINAL_SEND_OWNER', ['HR', 'ADMIN'])) {
      toast.error('Not allowed');
      return;
    }
    const key = `${it.requirementId}:${it.candidateId}:SEND_OWNER`;
    setBusyKey(key);
    try {
      await finalSendOwner(token, { requirementId: it.requirementId, candidateId: it.candidateId });
      toast.success('Sent to Owner');
      setItems((prev) => prev.map((x) => (x.candidateId === it.candidateId ? { ...x, status: 'FINAL_OWNER_PENDING' } : x)));
      setTab('PENDING_OWNER');
    } catch (e) {
      toast.error(e?.message || 'Failed');
    } finally {
      setBusyKey('');
    }
  }

  return (
    <AppLayout>
      {!portalAllowed ? (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Not allowed</div>
          <div className="small" style={{ color: 'var(--gray-600)' }}>You don’t have access to Final Interview portal.</div>
        </div>
      ) : null}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="page-title">Final Interview</h1>
        <p className="page-subtitle">Candidates who passed technical tests</p>
      </div>

      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <button className="button" onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Spinner size={14} /> : null}
            Refresh
          </button>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge">{items.length} candidates</span>
          </div>
        </div>

        <div style={{ height: 12 }} />
        <div className="tabs">
          <button
            type="button"
            className={['tab', tab === 'PASSED' ? 'active' : ''].join(' ')}
            onClick={() => setTab('PASSED')}
          >
            Passed ({passed.length})
          </button>
          <button
            type="button"
            className={['tab', tab === 'PENDING_OWNER' ? 'active' : ''].join(' ')}
            onClick={() => setTab('PENDING_OWNER')}
          >
            Pending Owner ({pendingOwner.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingOverlay text="Loading candidates..." />
      ) : (
        <>
          {tab === 'PASSED' ? (
            <Collapsible
              title="Ready for Final Interview"
              subtitle="Send these candidates to Owner for final interview"
              badge={passed.length}
              variant="card"
              defaultOpen={true}
            >
              {passed.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div className="empty-state-text">No candidates ready</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {passed.map((it) => {
                    const key = `${it.requirementId}:${it.candidateId}:SEND_OWNER`;
                    return (
                      <div key={it.candidateId} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
                        <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '15px' }}>{it.candidateName}</div>
                            <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                              {it.jobTitle ? `${it.jobTitle} · ` : ''}{it.jobRole} · {it.mobile}
                            </div>
                            <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <span className="badge" style={{ background: '#22c55e', color: '#fff' }}>
                                In-person: {it.inPersonMarks}/10
                              </span>
                              {it.tallyMarks !== '' && it.tallyMarks != null ? <span className="badge">Tally: {it.tallyMarks}/10</span> : null}
                              {it.voiceMarks !== '' && it.voiceMarks != null ? <span className="badge">Voice: {it.voiceMarks}/10</span> : null}
                              {it.excelMarks !== '' && it.excelMarks != null ? <span className="badge">Excel: {it.excelMarks}/10</span> : null}

                              {
                              (it.techReview || it.excelReview) ? (
                                <div className="small" style={{ marginTop: 6 }}>
                                  {it.techReview ? <div>Tech Review: {it.techReview}</div> : null}
                                  {it.excelReview ? <div>Excel Review: {it.excelReview}</div> : null}
                                </div>
                              ) : null
                            }
                            {it.techEvaluatedAt ? (
                                <span className="badge">Tech Passed: {fmtDateTime(it.techEvaluatedAt)}</span>
                              ) : null}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              className="button primary"
                              type="button"
                              onClick={() => onSendToOwner(it)}
                              disabled={!!busyKey || !allowAction_('FINAL_SEND_OWNER', ['HR', 'ADMIN'])}
                            >
                              {busyKey === key ? <Spinner size={14} /> : null}
                              Send to Owner
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Collapsible>
          ) : (
            <Collapsible
              title="Pending Final Interview (Owner)"
              subtitle="Waiting for Owner's final decision"
              badge={pendingOwner.length}
              variant="card"
              defaultOpen={true}
            >
              {pendingOwner.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">⏳</div>
                  <div className="empty-state-text">No candidates pending</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {pendingOwner.map((it) => (
                    <div key={it.candidateId} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{it.candidateName}</div>
                      <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>
                        {it.jobTitle ? `${it.jobTitle} · ` : ''}{it.jobRole} · {it.mobile}
                      </div>
                      <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: '#22c55e', color: '#fff' }}>
                          In-person: {it.inPersonMarks}/10
                        </span>
                        {it.techEvaluatedAt ? (
                          <span className="badge">Tech Passed: {fmtDateTime(it.techEvaluatedAt)}</span>
                        ) : null}
                      </div>
                      <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef3c7', borderRadius: 'var(--radius)', fontSize: '13px' }}>
                        ⏳ Pending Final Interview (Owner) — Locked
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Collapsible>
          )}
        </>
      )}
    </AppLayout>
  );
}
