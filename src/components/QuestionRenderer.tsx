import React, { useState } from 'react';
import { FormItem, QuestionType } from '../types';
import {
  Calendar, Clock, ChevronDown, CloudUpload, X, Check, AlertCircle, Shuffle, Settings2
} from 'lucide-react';

interface QuestionRendererProps {
  item: FormItem;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

// --- STANDARD GRID SYSTEM ---
const StandardGrid: React.FC<{ item: FormItem, value: any, onChange: (v: any) => void }> = ({ item, value, onChange }) => {
  const rows = item.rows || [];
  const cols = item.columns || [];
  const isRadio = item.type === QuestionType.MULTIPLE_CHOICE_GRID;

  const [limitOnePerCol, setLimitOnePerCol] = useState(!!item.limitOneResponsePerColumn);
  const answers = (value || {}) as Record<string, string | string[]>;

  const handleSelect = (rowId: string, colLabel: string) => {
    let newValue;
    if (isRadio) {
      if (limitOnePerCol) {
        const existingRowId = Object.keys(answers).find(
          key => answers[key] === colLabel && key !== rowId
        );
        const nextAnswers = { ...answers, [rowId]: colLabel };
        if (existingRowId) {
          delete nextAnswers[existingRowId];
        }
        newValue = nextAnswers;
      } else {
        newValue = { ...answers, [rowId]: colLabel };
      }
    } else {
      const current = (answers[rowId] as string[]) || [];
      const updated = current.includes(colLabel)
        ? current.filter(c => c !== colLabel)
        : [...current, colLabel];
      newValue = { ...answers, [rowId]: updated };
    }
    onChange(newValue);
  };

  const handleAutoFill = () => {
    const colLabels = cols.map(c => c.label);
    const newAnswers: Record<string, string | string[]> = {};
    if (limitOnePerCol) {
      const shuffled = [...colLabels].sort(() => Math.random() - 0.5);
      rows.forEach((row, idx) => {
        const rowKey = row.id || row.label;
        if (idx < shuffled.length) {
          const val = shuffled[idx];
          newAnswers[rowKey] = isRadio ? val : [val];
        }
      });
    } else {
      rows.forEach((row) => {
        const rowKey = row.id || row.label;
        const randomCol = colLabels[Math.floor(Math.random() * colLabels.length)];
        newAnswers[rowKey] = isRadio ? randomCol : [randomCol];
      });
    }
    onChange(newAnswers);
  };

  return (
    <div style={{ width: '100%', marginTop: '1rem' }}>
      {/* Controls Bar */}
      <div className="qr-controls-bar">
        {isRadio && (
          <label className="qr-controls-label">
            <input
              type="checkbox"
              checked={limitOnePerCol}
              onChange={(e) => setLimitOnePerCol(e.target.checked)}
              style={{ borderRadius: '4px', width: '14px', height: '14px' }}
            />
            <span>One response per column</span>
          </label>
        )}
        <button
          type="button"
          onClick={handleAutoFill}
          className="qr-autofill-btn"
          title={limitOnePerCol ? "Shuffle unique rankings" : "Randomize answers"}
        >
          <Shuffle style={{ width: 12, height: 12, marginRight: '4px' }} />
          {limitOnePerCol ? "Shuffle Rankings" : "Auto-fill"}
        </button>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        <table className="qr-grid-table" role="grid">
          <thead>
            <tr>
              <th className="qr-grid-th" style={{ minWidth: '150px' }}></th>
              {cols.map((col, idx) => (
                <th key={idx} className="qr-grid-th" scope="col">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              const rowKey = row.id || row.label;
              const rowVal = answers[rowKey];
              return (
                <tr key={rIdx} className="qr-grid-row">
                  <td className="qr-grid-cell-label" scope="row">{row.label}</td>
                  {cols.map((col, cIdx) => {
                    const isSelected = isRadio
                      ? rowVal === col.label
                      : Array.isArray(rowVal) && rowVal.includes(col.label);
                    return (
                      <td key={cIdx} className="qr-grid-cell" onClick={() => handleSelect(rowKey, col.label)}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div className={`${isRadio ? 'qr-grid-radio' : 'qr-grid-checkbox'} ${isSelected ? 'selected' : ''}`}>
                            {isSelected && (
                              isRadio ? (
                                <div style={{ width: '10px', height: '10px', background: '#7c3aed', borderRadius: '50%' }} />
                              ) : (
                                <Check style={{ width: 14, height: 14, color: '#7c3aed' }} strokeWidth={3} />
                              )
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ item, value, onChange, error }) => {
  const requiredMark = <span className="qr-required">*</span>;

  // --- HEADER SECTION ---
  if (item.type === QuestionType.SECTION_HEADER) {
    return (
      <div className="qr-section-header">
        <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{item.title}</h2>
        {item.description && <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '4px', marginBottom: 0 }}>{item.description}</p>}
      </div>
    );
  }

  const renderInput = () => {
    switch (item.type) {
      case QuestionType.MULTIPLE_CHOICE_GRID:
      case QuestionType.CHECKBOX_GRID:
        return <StandardGrid item={item} value={value} onChange={onChange} />;

      case QuestionType.SHORT_ANSWER:
        return (
          <div className="qr-input-group">
            <input
              type="text"
              className="qr-text-input qr-text-input-half"
              placeholder="Your answer"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="qr-underline qr-underline-half"></div>
          </div>
        );

      case QuestionType.PARAGRAPH:
        return (
          <div className="qr-input-group">
            <textarea
              className="qr-text-input"
              placeholder="Your answer"
              rows={2}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              style={{ resize: 'none' }}
            />
            <div className="qr-underline"></div>
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            {item.options?.map((opt, idx) => {
              const isSelected = value === opt.label;
              return (
                <div
                  key={opt.id || idx}
                  className={`qr-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => onChange(opt.label)}
                >
                  <div className={`qr-radio ${isSelected ? 'selected' : ''}`}>
                    {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }} />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: isSelected ? 500 : 400, color: isSelected ? '#111827' : '#374151' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        );

      case QuestionType.CHECKBOXES: {
        const selected = (value as string[]) || [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
            {item.options?.map((opt, idx) => {
              const isChecked = selected.includes(opt.label);
              return (
                <div
                  key={opt.id || idx}
                  className={`qr-option ${isChecked ? 'selected' : ''}`}
                  onClick={() => {
                    const newValue = isChecked
                      ? selected.filter(v => v !== opt.label)
                      : [...selected, opt.label];
                    onChange(newValue);
                  }}
                >
                  <div className={`qr-checkbox ${isChecked ? 'selected' : ''}`}>
                    {isChecked && <Check style={{ width: 14, height: 14, color: 'white' }} />}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: isChecked ? 500 : 400, color: isChecked ? '#111827' : '#374151' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      case QuestionType.DROPDOWN:
        return (
          <div className="qr-select-wrap" style={{ position: 'relative', paddingTop: '8px' }}>
            <select
              className="qr-select"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
            >
              <option value="" disabled>Choose</option>
              {item.options?.map((opt, idx) => (
                <option key={opt.id || idx} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#6b7280', pointerEvents: 'none' }} />
          </div>
        );

      case QuestionType.LINEAR_SCALE: {
        const start = item.scaleStart || 1;
        const end = item.scaleEnd || 5;
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);

        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem 0' }}>
            {item.scaleStartLabel && (
              <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 500 }}>{item.scaleStartLabel}</span>
            )}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '8px', padding: '0 8px' }}>
              {range.map((val) => {
                const isSelected = value === val;
                return (
                  <div
                    key={val}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    onClick={() => onChange(val)}
                  >
                    <span style={{ fontSize: '14px', color: isSelected ? '#5b21b6' : '#4b5563', fontWeight: isSelected ? 700 : 400, transition: 'color 0.15s' }}>{val}</span>
                    <div className={`qr-scale-btn ${isSelected ? 'selected' : ''}`}>
                      {isSelected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
            {item.scaleEndLabel && (
              <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', fontWeight: 500 }}>{item.scaleEndLabel}</span>
            )}
          </div>
        );
      }

      case QuestionType.FILE_UPLOAD:
        return (
          <div className="qr-dropzone">
            {value ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #ddd6fe', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '50%' }}>
                    <CloudUpload style={{ width: 20, height: 20, color: '#7c3aed' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{value.name || "Selected File"}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{(value.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => onChange(null)} style={{ color: '#9ca3af', background: 'transparent', border: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', transition: 'color 0.15s' }}>
                  <X style={{ width: 20, height: 20 }} />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                  <CloudUpload style={{ width: 32, height: 32, color: '#7c3aed' }} />
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Click to upload a file</span>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>or drag and drop here</span>
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onChange(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </div>
        );

      case QuestionType.DATE:
        return (
          <div className="qr-input-group" style={{ display: 'inline-block' }}>
            <input
              type="date"
              className="qr-text-input"
              style={{ paddingRight: '2rem' }}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <Calendar style={{ position: 'absolute', right: '8px', top: '10px', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
          </div>
        );

      case QuestionType.TIME:
        return (
          <div className="qr-input-group" style={{ display: 'inline-block' }}>
            <input
              type="time"
              className="qr-text-input"
              style={{ paddingRight: '2rem' }}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <Clock style={{ position: 'absolute', right: '8px', top: '10px', width: 16, height: 16, color: '#9ca3af', pointerEvents: 'none' }} />
          </div>
        );

      default:
        return <p style={{ color: '#f87171', fontSize: '14px', fontStyle: 'italic' }}>Unsupported question type: {item.type}</p>;
    }
  };

  return (
    <div className={`qr-card ${error ? 'has-error' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 className={`qr-title ${error ? 'has-error' : ''}`}>
          {item.title}
          {item.required && requiredMark}
        </h3>
        {item.limitOneResponsePerColumn && (
          <span className="qr-badge">
            One selection per column allowed
          </span>
        )}
      </div>
      {item.description && <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '1rem' }}>{item.description}</p>}
      <div style={{ marginTop: '1rem' }}>
        {renderInput()}
      </div>
      {error && (
        <div className="qr-error">
          <AlertCircle style={{ width: 16, height: 16, marginRight: '6px' }} />
          {error}
        </div>
      )}
    </div>
  );
};