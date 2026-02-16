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
// Mimics the native Google Forms table structure
const StandardGrid: React.FC<{ item: FormItem, value: any, onChange: (v: any) => void }> = ({ item, value, onChange }) => {
  const rows = item.rows || [];
  const cols = item.columns || [];
  const isRadio = item.type === QuestionType.MULTIPLE_CHOICE_GRID;
  
  // Local state to allow user override of the "Limit one response per column" setting
  const [limitOnePerCol, setLimitOnePerCol] = useState(!!item.limitOneResponsePerColumn);
  
  // Current answers map: rowKey -> colLabel (string) or [colLabel] (array)
  // We use row.id as the key if available, otherwise row.label
  const answers = (value || {}) as Record<string, string | string[]>;

  const handleSelect = (rowId: string, colLabel: string) => {
    let newValue;
    if (isRadio) {
      // Single choice per row (Radio Logic)
      
      // Validation: Limit one response per column
      // If enabled, we check if this column is already used by another row.
      if (limitOnePerCol) {
         const existingRowId = Object.keys(answers).find(
           key => answers[key] === colLabel && key !== rowId
         );

         // Create the new state, setting the current row
         const nextAnswers = { ...answers, [rowId]: colLabel };
         
         // If found in another row, remove it from there (Swap behavior)
         if (existingRowId) {
           // We simply delete the key for the old row, effectively unselecting it
           delete nextAnswers[existingRowId];
         }
         
         newValue = nextAnswers;
      } else {
         // Standard behavior
         newValue = { ...answers, [rowId]: colLabel };
      }

    } else {
      // Multiple choice per row (Checkbox Logic)
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
       // --- LIMITED: Permutation Logic (e.g. 5! = 120 ways) ---
       // Shuffle the column labels array once
       const shuffled = [...colLabels].sort(() => Math.random() - 0.5);
       
       rows.forEach((row, idx) => {
         const rowKey = row.id || row.label;
         // Assign each row a unique column from the shuffled list
         if (idx < shuffled.length) {
            const val = shuffled[idx];
            newAnswers[rowKey] = isRadio ? val : [val];
         }
       });
    } else {
       // --- UNLIMITED: Independent Logic (e.g. 5^5 = 3,125 ways) ---
       // Each row picks a random column independently
       rows.forEach((row) => {
          const rowKey = row.id || row.label;
          const randomCol = colLabels[Math.floor(Math.random() * colLabels.length)];
          newAnswers[rowKey] = isRadio ? randomCol : [randomCol];
       });
    }
    
    onChange(newAnswers);
  };

  return (
    <div className="w-full mt-4">
      {/* Controls Bar */}
      <div className="flex justify-end items-center mb-2 space-x-3">
         {isRadio && (
           <label className="flex items-center space-x-2 text-xs text-gray-600 cursor-pointer select-none bg-gray-50 px-2 py-1 rounded border border-transparent hover:border-gray-200 transition-colors">
             <input 
               type="checkbox"
               checked={limitOnePerCol}
               onChange={(e) => setLimitOnePerCol(e.target.checked)}
               className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
             />
             <span>One response per column</span>
           </label>
         )}

         <button 
           type="button" 
           onClick={handleAutoFill}
           className="text-xs flex items-center text-purple-600 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded transition-colors"
           title={limitOnePerCol ? "Shuffle unique rankings" : "Randomize answers"}
         >
           <Shuffle className="w-3 h-3 mr-1" />
           {limitOnePerCol ? "Shuffle Rankings" : "Auto-fill"}
         </button>
      </div>

      <div className="overflow-x-auto pb-2">
        <table className="min-w-full border-collapse" role="grid">
          <thead>
            <tr>
              <th className="p-2 min-w-[150px]"></th>
              {cols.map((col, idx) => (
                <th 
                  key={idx} 
                  className="p-2 text-center text-sm font-medium text-gray-700 min-w-[80px]"
                  scope="col"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => {
              // Key for storage: ID is unique and stable; fallback to label
              const rowKey = row.id || row.label;
              const rowVal = answers[rowKey];
              
              return (
                <tr 
                  key={rIdx} 
                  className={`border-b border-gray-100 ${rIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                >
                  <td 
                    className="p-4 text-sm text-gray-800 font-medium min-w-[150px]" 
                    scope="row"
                  >
                    {row.label}
                  </td>
                  {cols.map((col, cIdx) => {
                    const isSelected = isRadio 
                      ? rowVal === col.label 
                      : Array.isArray(rowVal) && rowVal.includes(col.label);
                    
                    return (
                      <td 
                        key={cIdx} 
                        className="p-2 text-center cursor-pointer"
                        onClick={() => handleSelect(rowKey, col.label)}
                      >
                        <div className="flex items-center justify-center">
                          <div 
                            className={`
                              flex items-center justify-center transition-all duration-200
                              ${isRadio ? 'w-5 h-5 rounded-full border-2' : 'w-5 h-5 rounded border-2'}
                              ${isSelected 
                                  ? 'border-purple-600 bg-white' 
                                  : 'border-gray-400 hover:border-gray-600 bg-transparent'}
                            `}
                          >
                            {isSelected && (
                              isRadio ? (
                                <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-purple-600" strokeWidth={3} />
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
  const commonClasses = `bg-white p-6 rounded-lg border shadow-sm mb-4 transition-all hover:shadow-md ${error ? 'border-red-500' : 'border-gray-200'}`;
  const titleClasses = `text-base sm:text-lg font-medium ${error ? 'text-red-700' : 'text-gray-900'}`;
  const descClasses = "text-sm text-gray-500 mb-4";
  const requiredMark = <span className="text-red-500 ml-1">*</span>;

  // --- HEADER SECTION ---
  if (item.type === QuestionType.SECTION_HEADER) {
    return (
      <div className="bg-purple-700 text-white p-4 rounded-t-lg shadow-sm mb-4 -mx-1 mt-8">
        <h2 className="text-xl font-bold">{item.title}</h2>
        {item.description && <p className="text-purple-100 mt-1">{item.description}</p>}
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
          <div className="relative group pt-2">
            <input
              type="text"
              className="w-full sm:w-1/2 border-b border-gray-300 focus:border-purple-600 outline-none py-2 bg-transparent relative z-10"
              placeholder="Your answer"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="absolute bottom-0 left-0 h-[1px] bg-purple-600 w-0 group-focus-within:w-full sm:group-focus-within:w-1/2 transition-all duration-300 ease-out z-20"></div>
          </div>
        );

      case QuestionType.PARAGRAPH:
        return (
           <div className="relative group pt-2">
            <textarea
              className="w-full border-b border-gray-300 focus:border-purple-600 outline-none py-2 resize-none bg-transparent"
              placeholder="Your answer"
              rows={2}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <div className="absolute bottom-1.5 left-0 h-[1px] bg-purple-600 w-0 group-focus-within:w-full transition-all duration-300 ease-out"></div>
          </div>
        );

      case QuestionType.MULTIPLE_CHOICE:
        return (
          <div className="space-y-3 pt-2">
            {item.options?.map((opt, idx) => {
              const isSelected = value === opt.label;
              return (
                <div 
                  key={opt.id || idx} 
                  className={`flex items-center group cursor-pointer p-2 -ml-2 rounded-md transition-colors ${isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                  onClick={() => onChange(opt.label)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0 ${isSelected ? 'border-purple-600' : 'border-gray-400 group-hover:border-purple-500'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                  </div>
                  <span className={`text-sm sm:text-base ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
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
          <div className="space-y-3 pt-2">
            {item.options?.map((opt, idx) => {
              const isChecked = selected.includes(opt.label);
              return (
                <div 
                  key={opt.id || idx} 
                  className={`flex items-center group cursor-pointer p-2 -ml-2 rounded-md transition-colors ${isChecked ? 'bg-purple-50' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    const newValue = isChecked 
                      ? selected.filter(v => v !== opt.label)
                      : [...selected, opt.label];
                    onChange(newValue);
                  }}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mr-3 transition-colors flex-shrink-0 ${isChecked ? 'bg-purple-600 border-purple-600' : 'border-gray-400 group-hover:border-purple-500'}`}>
                    {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm sm:text-base ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-700 group-hover:text-gray-900'}`}>
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
          <div className="relative w-full sm:w-1/2 group pt-2">
            <select
              className="w-full border border-gray-300 rounded px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 cursor-pointer bg-white text-gray-700 shadow-sm"
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
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        );

      case QuestionType.LINEAR_SCALE: {
        const start = item.scaleStart || 1;
        const end = item.scaleEnd || 5;
        const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        
        return (
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center sm:justify-start py-4">
             {item.scaleStartLabel && (
                <span className="text-xs text-gray-500 mb-2 sm:mb-3 sm:mr-4 font-medium">{item.scaleStartLabel}</span>
             )}
             
             <div className="flex space-x-2 sm:space-x-4 overflow-x-auto max-w-full pb-2 px-2">
               {range.map((val) => {
                 const isSelected = value === val;
                 return (
                   <div 
                      key={val} 
                      className="flex flex-col items-center space-y-3 group cursor-pointer"
                      onClick={() => onChange(val)}
                    >
                     <span className={`text-sm transition-colors ${isSelected ? 'text-purple-700 font-bold' : 'text-gray-600 group-hover:text-black'}`}>{val}</span>
                     <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-purple-600 bg-purple-600 shadow-lg scale-110' : 'border-gray-300 group-hover:border-purple-400 bg-white'}`}>
                        {isSelected && <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white" />}
                     </div>
                   </div>
                 );
               })}
             </div>

             {item.scaleEndLabel && (
                <span className="text-xs text-gray-500 mt-2 sm:mt-0 sm:mb-3 sm:ml-4 font-medium">{item.scaleEndLabel}</span>
             )}
          </div>
        );
      }

      case QuestionType.FILE_UPLOAD:
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full sm:w-2/3 bg-gray-50 hover:bg-white hover:border-purple-300 transition-all text-center">
             {value ? (
               <div className="flex items-center justify-between bg-white border border-purple-100 p-3 rounded shadow-sm">
                 <div className="flex items-center space-x-3 truncate">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <CloudUpload className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                       <p className="text-sm font-medium text-gray-700 truncate max-w-[150px] sm:max-w-xs">{value.name || "Selected File"}</p>
                       <p className="text-xs text-gray-400">{(value.size / 1024).toFixed(1)} KB</p>
                    </div>
                 </div>
                 <button onClick={() => onChange(null)} className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors">
                    <X className="w-5 h-5" />
                 </button>
               </div>
             ) : (
                <label className="flex flex-col items-center cursor-pointer">
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                     <CloudUpload className="w-8 h-8 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Click to upload a file</span>
                  <span className="text-xs text-gray-400 mt-1">or drag and drop here</span>
                  <input 
                    type="file" 
                    className="hidden" 
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
          <div className="inline-block relative group pt-2">
            <input 
              type="date"
              className="block w-full pl-2 pr-8 py-2 border-b border-gray-300 focus:border-purple-600 focus:outline-none text-gray-700 bg-transparent"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <Calendar className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors pointer-events-none" />
          </div>
        );

      case QuestionType.TIME:
        return (
          <div className="inline-block relative group pt-2">
            <input 
              type="time"
              className="block w-full pl-2 pr-8 py-2 border-b border-gray-300 focus:border-purple-600 focus:outline-none text-gray-700 bg-transparent"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            <Clock className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors pointer-events-none" />
          </div>
        );

      default:
        return <p className="text-red-400 text-sm italic">Unsupported question type: {item.type}</p>;
    }
  };

  return (
    <div className={commonClasses}>
      <div className="flex justify-between items-start mb-2">
        <h3 className={titleClasses}>
          {item.title}
          {item.required && requiredMark}
        </h3>
        {item.limitOneResponsePerColumn && (
          <span className="ml-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded whitespace-nowrap">
            One selection per column allowed
          </span>
        )}
      </div>
      {item.description && <p className={descClasses}>{item.description}</p>}
      <div className="mt-4">
        {renderInput()}
      </div>
      {error && (
        <div className="flex items-center mt-3 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1.5" />
          {error}
        </div>
      )}
    </div>
  );
};