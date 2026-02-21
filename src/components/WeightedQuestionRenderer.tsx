import React, { useRef, useState, useCallback, useEffect } from 'react';
import { FormItem, QuestionType } from '../types';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

interface WeightedQuestionRendererProps {
  item: FormItem;
  weights: any;
  onWeightChange: (newWeights: any) => void;
  specialMode?: 'GENDER' | 'NAME';
  onToggleSpecialMode?: (mode: 'GENDER' | 'NAME' | undefined) => void;
  showGenderToggle?: boolean;
}

const questionTypeLabel = (type: QuestionType): string => {
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE: return 'Multiple Choice';
    case QuestionType.DROPDOWN: return 'Dropdown';
    case QuestionType.CHECKBOXES: return 'Checkboxes';
    case QuestionType.LINEAR_SCALE: return 'Linear Scale';
    case QuestionType.MULTIPLE_CHOICE_GRID: return 'MCQ Grid';
    case QuestionType.CHECKBOX_GRID: return 'Checkbox Grid';
    default: return type.replace(/_/g, ' ').toLowerCase();
  }
};

/* ─── Spring Physics Slider ─── */
const SpringSlider: React.FC<{
  label: string;
  value: number;
  onChange: (val: number) => void;
  isIndependent?: boolean;
  animDelay?: number;
}> = ({ label, value, onChange, isIndependent = false, animDelay = 0 }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pct = Math.max(0, Math.min(100, value || 0));

  // Spring for tooltip lag
  const springPct = useSpring(pct, { stiffness: 300, damping: 30 });

  useEffect(() => {
    springPct.set(pct);
  }, [pct, springPct]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), animDelay * 1000);
    return () => clearTimeout(t);
  }, [animDelay]);

  const updateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newPct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    onChange(Math.round(newPct * 10) / 10);
  }, [onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX);
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
  }, [updateValue]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    updateValue(e.clientX);
  }, [isDragging, updateValue]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getValueStyle = (val: number): React.CSSProperties => {
    if (val >= 70) return { color: isIndependent ? '#2563eb' : '#4285F4', background: '#eff6ff' };
    if (val >= 30) return { color: isIndependent ? '#3b82f6' : 'rgba(66,133,244,0.8)', background: 'rgba(239,246,255,0.5)' };
    return { color: 'rgba(0,0,0,0.4)', background: '#f9fafb' };
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', padding: '2px 0' }}>
      <div style={{ width: '35%', fontSize: '14px', color: '#000', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={label}>{label}</div>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Track */}
        <div
          ref={trackRef}
          className="slider-track"
          style={{ animation: mounted ? undefined : `trackDraw 0.6s cubic-bezier(0.22,1,0.36,1) ${animDelay}s both` }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Fill */}
          <div
            className={`slider-track-fill ${isIndependent ? 'independent' : ''}`}
            style={{ width: `${pct}%` }}
          />

          {/* Thumb with spring physics */}
          <motion.div
            className={`slider-thumb ${isIndependent ? 'independent' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
              left: `calc(${pct}% - 12px)`,
              top: '50%',
              marginTop: '-12px',
              animation: mounted ? undefined : `thumbPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${animDelay + 0.3}s both`,
            }}
            animate={{
              scale: isDragging ? 1.15 : 1,
            }}
            transition={{
              type: 'spring', stiffness: 400, damping: 25,
            }}
            onPointerDown={handlePointerDown}
          >
            {/* Floating tooltip */}
            <div className="slider-tooltip">{Math.round(pct)}%</div>
          </motion.div>
        </div>
      </div>
      {/* Value badge */}
      <motion.div
        style={{ width: '56px', textAlign: 'center', fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '9999px', ...getValueStyle(value) }}
        animate={{ scale: isDragging ? 1.08 : 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      >
        {Math.round(value)}%
      </motion.div>
    </div>
  );
};

/* ─── iOS Toggle ─── */
const IOSToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  variant?: 'blue' | 'pink';
}> = ({ checked, onChange, variant = 'blue' }) => {
  const activeClass = variant === 'pink' ? 'active-pink' : 'active';
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`toggle-track ${checked ? activeClass : ''}`}
    >
      <div className={`toggle-knob ${checked ? 'active' : ''}`} />
    </button>
  );
};

/* ─── Main Component ─── */
export const WeightedQuestionRenderer: React.FC<WeightedQuestionRendererProps> = ({
  item, weights, onWeightChange, specialMode, onToggleSpecialMode, showGenderToggle = true
}) => {
  if (!weights) return null;

  const handleBalancedChange = (id: string, newVal: number, currentSet: Record<string, number>) => {
    const keys = Object.keys(currentSet);
    const otherKeys = keys.filter(k => k !== id);
    const clampedVal = Math.max(0, Math.min(100, newVal));
    if (otherKeys.length === 0) { onWeightChange({ [id]: 100 }); return; }
    const newSet = { ...currentSet, [id]: clampedVal };
    const remaining = 100 - clampedVal;
    const currentSumOthers = otherKeys.reduce((sum, k) => sum + currentSet[k], 0);
    if (currentSumOthers === 0) {
      const share = remaining / otherKeys.length;
      otherKeys.forEach(k => newSet[k] = share);
    } else {
      const ratio = remaining / currentSumOthers;
      otherKeys.forEach(k => { newSet[k] = Math.round((currentSet[k] * ratio) * 10) / 10; });
    }
    onWeightChange(newSet);
  };

  const handleIndependentChange = (id: string, newVal: number, currentSet: Record<string, number>) => {
    onWeightChange({ ...currentSet, [id]: Math.max(0, Math.min(100, newVal)) });
  };

  const renderContent = () => {
    switch (item.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.DROPDOWN:
        return (
          <div style={{ paddingTop: '8px' }}>
            {item.options?.map((opt, idx) => {
              const key = opt.id || opt.label;
              return (
                <SpringSlider
                  key={idx}
                  label={opt.label}
                  value={weights[key] || 0}
                  onChange={(v) => handleBalancedChange(key, v, weights)}
                  animDelay={idx * 0.05}
                />
              );
            })}
          </div>
        );

      case QuestionType.CHECKBOXES:
        return (
          <div style={{ paddingTop: '8px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', fontStyle: 'italic' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', marginRight: '8px', flexShrink: 0 }}></span>
              Independent probabilities — each option selected independently
            </div>
            {item.options?.map((opt, idx) => {
              const key = opt.id || opt.label;
              return (
                <SpringSlider
                  key={idx}
                  label={opt.label}
                  value={weights[key] || 0}
                  onChange={(v) => handleIndependentChange(key, v, weights)}
                  isIndependent
                  animDelay={idx * 0.05}
                />
              );
            })}
          </div>
        );

      case QuestionType.LINEAR_SCALE: {
        const start = item.scaleStart || 1;
        const end = item.scaleEnd || 5;
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        return (
          <div style={{ paddingTop: '8px' }}>
            {range.map((val, idx) => (
              <SpringSlider
                key={val}
                label={val.toString()}
                value={weights[val] || 0}
                onChange={(v) => handleBalancedChange(val.toString(), v, weights)}
                animDelay={idx * 0.05}
              />
            ))}
          </div>
        );
      }

      case QuestionType.MULTIPLE_CHOICE_GRID:
      case QuestionType.CHECKBOX_GRID: {
        const isCheckboxGrid = item.type === QuestionType.CHECKBOX_GRID;
        return (
          <div className="space-y-5" style={{ paddingTop: '8px' }}>
            {item.rows?.map((row, rIdx) => {
              const rowKey = row.id || row.label;
              const rowWeights = weights[rowKey] || {};
              const handleRowWeightChange = (newRowWeights: any) => {
                onWeightChange({ ...weights, [rowKey]: newRowWeights });
              };
              return (
                <div key={rIdx} style={{ borderLeft: '2px solid #bfdbfe', paddingLeft: '16px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#000', marginBottom: '8px' }}>{row.label}</div>
                  {item.columns?.map((col, cIdx) => {
                    const colKey = col.label;
                    const val = rowWeights[colKey] || 0;
                    return (
                      <SpringSlider
                        key={cIdx}
                        label={col.label}
                        value={val}
                        onChange={(v) => isCheckboxGrid
                          ? handleIndependentChange(colKey, v, rowWeights)
                          : handleBalancedChange(colKey, v, rowWeights)
                        }
                        isIndependent={isCheckboxGrid}
                        animDelay={cIdx * 0.05}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      }

      default:
        return <div style={{ color: '#9ca3af', fontSize: '14px', fontStyle: 'italic' }}>Weighted automation not supported for this type.</div>;
    }
  };

  return (
    <motion.div
      className="card card-lift"
      style={{ padding: '1.5rem', marginBottom: '1rem' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '15px', color: '#000', fontWeight: 600, lineHeight: 1.3, margin: 0 }}>{item.title}</h4>
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4285F4', background: '#eff6ff', padding: '4px 10px', borderRadius: '9999px', whiteSpace: 'nowrap', marginLeft: '12px' }}>
          {questionTypeLabel(item.type)}
        </span>
      </div>

      {/* Gender Toggle — smoke exit / fade entry */}
      {(item.type === QuestionType.MULTIPLE_CHOICE || item.type === QuestionType.DROPDOWN) && onToggleSpecialMode && (
        <AnimatePresence mode="wait">
          {showGenderToggle && (
            <motion.div
              key={`gender-toggle-${item.id}`}
              style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, scale: 1.3, filter: 'blur(12px)', transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
            >
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none', fontSize: '12px', color: 'rgba(0,0,0,0.5)', gap: '12px', transition: 'color 0.15s' }}>
                <span style={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Gender?</span>
                <IOSToggle
                  checked={specialMode === 'GENDER'}
                  onChange={(checked) => onToggleSpecialMode(checked ? 'GENDER' : undefined)}
                  variant="pink"
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {renderContent()}
    </motion.div>
  );
};