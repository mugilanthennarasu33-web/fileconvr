import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { FileUploader } from '../components/FileUploader';
import { ProcessingModal } from '../components/ProcessingModal';
import { DownloadView } from '../components/DownloadView';
import { ToolPageLayout } from '../components/ToolPageLayout';
import { excelToPdfApi } from '../services/api';
import { TOOLS_SEO_DATA } from '../data/seoData';
import type { ProcessingResult, ProcessingState } from '../types';
import { formatFileSize } from '../utils/formatters';
import { FileFormatIcon } from '../components/FileFormatIcon';

interface ExcelToPdfPageProps {
  onBack: () => void;
  onSelectTool?: (toolId: string) => void;
}

export const ExcelToPdfPage: React.FC<ExcelToPdfPageProps> = ({ onBack, onSelectTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<ProcessingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);

  const handleFileSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
      setError(null);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select an Excel workbook to convert.');
      return;
    }

    try {
      setState('uploading');
      setError(null);

      setState('processing');
      const data = await excelToPdfApi(file);

      setResult(data);
      setState('success');
    } catch (err: any) {
      setError(err.message || 'An error occurred while converting the Excel spreadsheet to PDF.');
      setState('error');
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setState('idle');
    setError(null);
  };

  if (state === 'success' && result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <DownloadView
          result={result}
          toolName="Excel to PDF"
          onReset={handleReset}
          onBackToHome={onBack}
        />
      </div>
    );
  }

  return (
    <ToolPageLayout
      toolShortName="Excel to PDF"
      toolHeading="Excel to PDF Converter"
      toolSubtitle="Convert spreadsheets and workbooks (XLSX, XLS) into clean, tabular PDF files."
      onBack={onBack}
      seoContent={TOOLS_SEO_DATA['excel-to-pdf']}
      onNavigateTool={onSelectTool}
      benefit1Title="Table Preservation"
      benefit1Desc="Grid alignment intact"
      benefit2Title="Multi-Sheet Support"
      benefit2Desc="Converts all tabs"
      benefit3Title="Secure & Private"
      benefit3Desc="Your files are safe"
      step1Title="Upload"
      step1Desc="Select your spreadsheet"
      step2Title="Convert"
      step2Desc="Our system formats it"
      step3Title="Download"
      step3Desc="Get your PDF file"
    >
      {!file ? (
        <FileUploader
          accept=".xlsx,.xls"
          multiple={false}
          maxSizeMB={50}
          onFilesSelected={handleFileSelected}
          title="Drag & drop your Excel file here"
          subtitle="Supports XLSX and XLS spreadsheets with multi-worksheet preservation"
        />
      ) : (
        <div className="space-y-6">
          {/* Selected File Card */}
          <div className="saas-card p-5 flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0">
              <FileFormatIcon format="excel" size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
              </div>
            </div>

            <button
              onClick={() => setFile(null)}
              className="text-xs text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Change File
            </button>
          </div>

          {/* Conversion Details Card */}
          <div className="saas-card p-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Workbook Conversion Details
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every worksheet tab is scanned, grid margins and formulas are rendered accurately into print-ready PDF pages without horizontal text cutoff.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConvert}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              Convert to PDF →
            </button>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      <ProcessingModal state={state} sourceFormat="excel" targetFormat="pdf" />
    </ToolPageLayout>
  );
};
