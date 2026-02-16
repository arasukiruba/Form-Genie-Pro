import React from 'react';
import { ParsedForm } from '../types';
import { WeightedAutomation } from './WeightedAutomation';

interface FormPreviewProps {
  form: ParsedForm;
  onBack: () => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({ form, onBack }) => {
  // Directly launch the Weighted Automation interface
  // ignoring single submission or manual loop modes as requested.
  return <WeightedAutomation form={form} onBack={onBack} />;
};
