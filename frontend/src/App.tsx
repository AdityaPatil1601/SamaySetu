import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  GraduationCap,
} from 'lucide-react';
import {
  fetchDefaultConfig,
  fetchSavedConfig,
  saveActiveConfig,
  generateTimetableApi,
  validateTimetableApi,
  fetchCurrentTimetable,
} from './api';
import type { TimetableConfig, TimetableResult, ValidationReport } from './types';
import { ConfigSection } from './components/ConfigSection';
import { TimetableGrid } from './components/TimetableGrid';
import { ResultSummary } from './components/ResultSummary';

export const App: React.FC = () => {
  const [config, setConfig] = useState<TimetableConfig | null>(null);
  const [result, setResult] = useState<TimetableResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Load initial config and current timetable
  useEffect(() => {
    const init = async () => {
      try {
        const loadedCfg = await fetchSavedConfig().catch(() => fetchDefaultConfig());
        setConfig(loadedCfg);

        const currentResult = await fetchCurrentTimetable();
        if (currentResult) {
          setResult(currentResult);
        }
      } catch (err: any) {
        setErrorBanner(`Failed to load initial scheduling data: ${err.message}`);
      }
    };
    init();
  }, []);

  // Primary action: Generate Timetable
  const handleGenerate = async () => {
    if (!config || isGenerating) return;

    // 1. Client-side sanity check
    if (config.divisions.length === 0) {
      setErrorBanner('Please configure at least one student division before generating.');
      return;
    }
    if (config.requirements.length === 0) {
      setErrorBanner('Please configure curriculum session requirements before generating.');
      return;
    }

    setIsGenerating(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    // Save snapshot of previous result in case generation fails
    const previousResult = result;

    try {
      // 2. Submit real scheduling data to backend & start constraint solver
      const newResult = await generateTimetableApi(config);

      // 3. Receive and display actual result
      setResult(newResult);

      if (newResult.status === 'OPTIMAL' || newResult.status === 'FEASIBLE') {
        setSuccessBanner(
          `Timetable generated successfully! ${newResult.scheduled_sessions_count} sessions scheduled in ${newResult.execution_time_seconds.toFixed(2)}s.`
        );
      } else if (newResult.status === 'PARTIAL') {
        setErrorBanner(
          `Partial schedule generated (${newResult.scheduled_sessions_count}/${newResult.total_required_sessions} sessions). ${newResult.unassigned_sessions_count} unassigned sessions detected.`
        );
      } else if (newResult.status === 'INFEASIBLE') {
        setErrorBanner(
          'Problem proved INFEASIBLE: Given constraints cannot be satisfied simultaneously. Previous timetable preserved.'
        );
      } else {
        setErrorBanner(
          `Solver finished with status ${newResult.status}. Review diagnostics below.`
        );
      }
    } catch (err: any) {
      // 7. Preserve previously saved timetable if generation fails
      setResult(previousResult);
      setErrorBanner(
        `Generation failed: ${err.message || 'Unknown server error'}. Previous timetable was preserved.`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Independent re-validation
  const handleValidate = async () => {
    if (!config || !result || result.sessions.length === 0 || isValidating) return;

    setIsValidating(true);
    setErrorBanner(null);

    try {
      const validationReport: ValidationReport = await validateTimetableApi(
        config,
        result.sessions
      );
      setResult({ ...result, validation: validationReport });
      if (validationReport.is_valid) {
        setSuccessBanner('Independent validation passed: 0 hard-constraint violations found.');
      } else {
        setErrorBanner(
          `Validation failed: ${validationReport.hard_violations_count} hard-constraint violation(s) detected.`
        );
      }
    } catch (err: any) {
      setErrorBanner(`Independent validation request failed: ${err.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Save config
  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await saveActiveConfig(config);
      setSuccessBanner('Configuration successfully saved to backend storage.');
    } catch (err: any) {
      setErrorBanner(`Failed to save configuration: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default sample
  const handleResetDefaults = async () => {
    try {
      const defaultCfg = await fetchDefaultConfig();
      setConfig(defaultCfg);
      setSuccessBanner('Restored default college dataset (Computer Science Dept, 2 Divisions).');
    } catch (err: any) {
      setErrorBanner(`Failed to restore default dataset: ${err.message}`);
    }
  };

  return (
    <div className="cf-container">
      {/* Header */}
      <header className="cf-header">
        <div className="cf-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h1>CampusFlow — Automatic Timetable Generation</h1>
              <p>Constraint Optimization Engine powered by Google OR-Tools CP-SAT</p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="cf-actions-group">
          <button
            className="cf-btn cf-btn-secondary"
            onClick={handleResetDefaults}
            disabled={isGenerating}
            title="Reset scheduling data to default realistic college dataset"
          >
            <RotateCcw size={15} />
            Reset Defaults
          </button>

          {result && result.sessions.length > 0 && (
            <button
              className="cf-btn cf-btn-secondary"
              onClick={handleValidate}
              disabled={isValidating || isGenerating}
              title="Run independent validator on current schedule"
            >
              <ShieldCheck size={16} color="#7c3aed" />
              {isValidating ? 'Validating...' : 'Validate Schedule'}
            </button>
          )}

          <button
            className="cf-btn cf-btn-primary"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="cf-spinner" />
                <span>Solving Constraints...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Timetable</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Alert Banners */}
      {errorBanner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--pastel-rose-bg)',
            border: '1px solid var(--pastel-rose-border)',
            borderRadius: '10px',
            color: 'var(--pastel-rose-text)',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{errorBanner}</div>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => setErrorBanner(null)}
          >
            ✕
          </button>
        </div>
      )}

      {successBanner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'var(--pastel-green-bg)',
            border: '1px solid var(--pastel-green-border)',
            borderRadius: '10px',
            color: 'var(--pastel-green-text)',
            fontSize: '13px',
            marginBottom: '20px',
          }}
        >
          <CheckCircle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{successBanner}</div>
          <button
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
            onClick={() => setSuccessBanner(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Section A: Scheduling Configuration */}
      {config && (
        <ConfigSection
          config={config}
          onChange={setConfig}
          onSave={handleSaveConfig}
          isSaving={isSaving}
        />
      )}

      {/* Section D: Generation Result and Unresolved Sessions */}
      {result && <ResultSummary result={result} isValidating={isValidating} />}

      {/* Section C: Generated Timetable Grid */}
      {config && result && result.sessions.length > 0 && (
        <TimetableGrid config={config} sessions={result.sessions} />
      )}
    </div>
  );
};

export default App;
