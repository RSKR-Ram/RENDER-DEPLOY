import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { trainingMasterList, trainingMasterUpsert } from '../../api/training';
import { Spinner } from '../ui/Spinner';

function joinDocLines(docs) {
  if (!Array.isArray(docs) || !docs.length) return '';
  return docs.filter(Boolean).map((x) => String(x)).join('\n');
}

export function AdminTrainingForm({ token }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    training_id: '',
    name: '',
    department: '',
    description: '',
    video_link: '',
    documentsLines: '',
  });

  async function load() {
    setLoading(true);
    try {
      const res = await trainingMasterList(token);
      setItems(res.items ?? []);
    } catch (e) {
      toast.error(e?.message || 'Failed to load trainings');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = useMemo(() => !!String(form.name || '').trim() && !!String(form.department || '').trim(), [form]);

  async function onSave(e) {
    e?.preventDefault?.();
    if (!canSave) {
      toast.error('Name and Department are required');
      return;
    }
    setBusy(true);
    try {
      const payload = {
        training_id: String(form.training_id || '').trim() || undefined,
        name: String(form.name || '').trim(),
        department: String(form.department || '').trim(),
        description: String(form.description || '').trim(),
        video_link: String(form.video_link || '').trim(),
        documentsLines: String(form.documentsLines || ''),
      };
      const res = await trainingMasterUpsert(token, payload);
      toast.success(payload.training_id ? 'Training updated' : 'Training created');
      setForm({ training_id: '', name: '', department: '', description: '', video_link: '', documentsLines: '' });
      await load();
      if (res?.training_id) {
        // no-op
      }
    } catch (e2) {
      toast.error(e2?.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ alignItems: 'center', gap: 10 }}>
        <h3 style={{ marginTop: 0, marginBottom: 0 }}>Training Builder (Templates)</h3>
        <div style={{ marginLeft: 'auto' }}>
          <button className="button" type="button" onClick={load} disabled={loading}>
            {loading ? <Spinner size={14} /> : null}
            Refresh
          </button>
        </div>
      </div>

      <div style={{ height: 10 }} />

      <form onSubmit={onSave} className="card" style={{ background: '#fafafa' }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <input
            placeholder="Training Name (e.g., CRM)"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            style={{ minWidth: 220 }}
          />
          <input
            placeholder="Department (e.g., Accounts)"
            value={form.department}
            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            style={{ minWidth: 180 }}
          />
          <input
            placeholder="Video Link"
            value={form.video_link}
            onChange={(e) => setForm((p) => ({ ...p, video_link: e.target.value }))}
            style={{ minWidth: 240 }}
          />
        </div>

        <div style={{ height: 10 }} />

        <div>
          <label className="small" style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ height: 10 }} />

        <div>
          <label className="small" style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Documents (one URL per line)</label>
          <textarea
            value={form.documentsLines}
            onChange={(e) => setForm((p) => ({ ...p, documentsLines: e.target.value }))}
            rows={3}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ height: 10 }} />

        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="button primary" type="submit" disabled={busy || !canSave}>
            {busy ? <Spinner size={14} /> : null}
            {form.training_id ? 'Update Template' : 'Create Template'}
          </button>
          <button
            className="button"
            type="button"
            onClick={() => setForm({ training_id: '', name: '', department: '', description: '', video_link: '', documentsLines: '' })}
            disabled={busy}
          >
            Clear
          </button>
        </div>
      </form>

      <div style={{ height: 12 }} />
      <div className="small">{loading ? 'Loading…' : `${items.length} templates`}</div>

      <div style={{ height: 10 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
        {items.map((t) => (
          <div key={t.training_id} className="card" style={{ background: '#fff', border: '1px solid var(--gray-200)' }}>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontWeight: 700 }}>{t.name}</div>
                <div className="small" style={{ color: 'var(--gray-500)', marginTop: 2 }}>{t.department}</div>
              </div>
              <button
                className="button"
                type="button"
                onClick={() =>
                  setForm({
                    training_id: t.training_id,
                    name: t.name || '',
                    department: t.department || '',
                    description: t.description || '',
                    video_link: t.video_link || '',
                    documentsLines: joinDocLines(t.documents),
                  })
                }
              >
                Edit
              </button>
            </div>
            {t.video_link ? (
              <div style={{ marginTop: 8 }}>
                <button className="button" type="button" onClick={() => window.open(t.video_link, '_blank', 'noopener,noreferrer')}>
                  Open Video
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
