import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  Lightbulb,
  FileText,
} from 'lucide-react';
import type { TimetableResult } from '../types';

interface ResultSummaryProps {
  result: TimetableResult | null;
  isValidating?: boolean;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ result, isValidating }) => {
  if (!result) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return <span className="cf-badge cf-badge-optimal"><CheckCircle2 size={13} /> Optimal Solution</span>;
      case 'FEASIBLE':
        return <span className="cf-badge cf-badge-feasible"><CheckCircle2 size={13} /> Feasible Schedule</span>;
      case 'PARTIAL':
        return <span className="cf-badge cf-badge-partial"><AlertTriangle size={13} /> Partial Schedule</span>;
      case 'INFEASIBLE':
        return <span className="cf-badge cf-badge-infeasible"><XCircle size={13} /> Infeasible Constraints</span>;
      case 'TIMEOUT':
        return <span className="cf-badge cf-badge-error"><Clock size={13} /> Solver Timeout</span>;
      default:
        return <span className="cf-badge">{status}</span>;
    }
  };

  const validation = result.validation;
  const diagnostics = result.diagnostics;

  return (
    <div className="cf-card">
      <div className="cf-card-header">
        <h2 className="cf-card-title">
          <FileText size={19} color="#7c3aed" />
          Generation Result & Independent Verification
        </h2>
        {result.generated_at && (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Generated: {result.generated_at}
          </span>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="cf-metrics-bar">
        <div className="cf-metric-card">
          <span className="cf-metric-label">Solver Status</span>
          <div style={{ marginTop: '2px' }}>{getStatusBadge(result.status)}</div>
        </div>

        <div className="cf-metric-card">
          <span className="cf-metric-label">Scheduled Sessions</span>
          <div className="cf-metric-value" style={{ color: '#16a34a' }}>
            {result.scheduled_sessions_count} / {result.total_required_sessions}
          </div>
        </div>

        <div className="cf-metric-card">
          <span className="cf-metric-label">Unassigned Sessions</span>
          <div className="cf-metric-value" style={{ color: result.unassigned_sessions_count > 0 ? '#dc2626' : '#1e293b' }}>
            {result.unassigned_sessions_count}
          </div>
        </div>

        <div className="cf-metric-card">
          <span className="cf-metric-label">Independent Validator</span>
          <div style={{ marginTop: '2px' }}>
            {isValidating ? (
              <span className="cf-badge cf-badge-feasible">Validating...</span>
            ) : validation?.is_valid ? (
              <span className="cf-badge cf-badge-optimal">
                <ShieldCheck size={13} /> 100% Valid (0 Violations)
              </span>
            ) : (
              <span className="cf-badge cf-badge-error">
                <XCircle size={13} /> {validation?.hard_violations_count || 0} Violations
              </span>
            )}
          </div>
        </div>

        <div className="cf-metric-card">
          <span className="cf-metric-label">Execution Time</span>
          <div className="cf-metric-value" style={{ fontSize: '18px' }}>
            {result.execution_time_seconds.toFixed(2)}s
          </div>
        </div>
      </div>

      {/* Hard Constraint Violations if any */}
      {validation && !validation.is_valid && validation.violations.length > 0 && (
        <div className="cf-diag-box" style={{ borderColor: '#fca5a5', backgroundColor: '#fff5f5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <XCircle size={18} color="#dc2626" />
            <strong style={{ color: '#b91c1c', fontSize: '14px' }}>
              Hard-Constraint Violations Detected by Independent Validator:
            </strong>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {validation.violations.map((v, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                <strong style={{ color: '#dc2626' }}>[{v.rule_id}] {v.category}: </strong>
                <span>{v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics for Unassigned Sessions / Infeasibility */}
      {diagnostics && diagnostics.has_unassigned && (
        <div className="cf-diag-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={18} color="#d97706" />
            <strong style={{ color: '#b45309', fontSize: '14px' }}>
              Diagnostic Report — Root Cause Analysis & Suggestions:
            </strong>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {diagnostics.overall_assessment}
          </p>

          {diagnostics.bottlenecks_detected.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>
                Resource Bottlenecks:
              </span>
              <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: '13px', color: '#991b1b' }}>
                {diagnostics.bottlenecks_detected.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {diagnostics.detailed_unassigned.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                Unassigned Sessions ({diagnostics.detailed_unassigned.length}):
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                {diagnostics.detailed_unassigned.map((u, i) => (
                  <div key={i} className="cf-diag-item error">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px' }}>
                        {u.subject_name} ({u.session_type.toUpperCase()}) — {u.division_name}
                      </strong>
                      <span className="cf-badge cf-badge-error">Unassigned</span>
                    </div>

                    {u.primary_reasons.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#dc2626' }}>
                        {u.primary_reasons.map((r, rIdx) => (
                          <div key={rIdx}>• {r}</div>
                        ))}
                      </div>
                    )}

                    {u.heuristic_notes.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {u.heuristic_notes.map((n, nIdx) => (
                          <div key={nIdx}>ℹ️ {n}</div>
                        ))}
                      </div>
                    )}

                    {u.actionable_suggestions.length > 0 && (
                      <div style={{ fontSize: '12px', color: '#0369a1', display: 'flex', alignItems: 'flex-start', gap: '6px', background: '#f0f9ff', padding: '6px 8px', borderRadius: '6px' }}>
                        <Lightbulb size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <strong>Suggestion: </strong>
                          {u.actionable_suggestions.join(' ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rules Checked Pill list */}
      {validation && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            VERIFIED CONSTRAINTS:
          </span>
          {validation.checked_rules.map((rule) => (
            <span
              key={rule}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                background: '#f1f5f9',
                borderRadius: '4px',
                color: '#475569',
              }}
            >
              {rule}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
