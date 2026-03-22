import { useState } from 'react';
import { Modal } from './Modal';
import { FileText, FileSpreadsheet, Download, Calendar } from 'lucide-react';

interface ExportReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    onExport: (format: 'pdf' | 'excel' | 'csv', startDate: string, endDate: string) => void;
}

export function ExportReportModal({ isOpen, onClose, title = "Export Report", onExport }: ExportReportModalProps) {
    const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleExport = () => {
        onExport(format, startDate, endDate);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="d-flex flex-column gap-4 py-2">
                <div>
                    <label className="fw-semibold text-dark text-sm mb-2 d-block">Select Format</label>
                    <div className="d-flex gap-2">
                        <button
                            className={`flex-fill d-flex align-items-center justify-content-center gap-2 py-2 rounded-xl transition-all border ${format === 'pdf' ? 'border-blue-500 bg-blue-50 text-blue-700 fw-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setFormat('pdf')}
                        >
                            <FileText size={16} /> PDF
                        </button>
                        <button
                            className={`flex-fill d-flex align-items-center justify-content-center gap-2 py-2 rounded-xl transition-all border ${format === 'excel' ? 'border-blue-500 bg-blue-50 text-blue-700 fw-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setFormat('excel')}
                        >
                            <FileSpreadsheet size={16} /> Excel
                        </button>
                        <button
                            className={`flex-fill d-flex align-items-center justify-content-center gap-2 py-2 rounded-xl transition-all border ${format === 'csv' ? 'border-blue-500 bg-blue-50 text-blue-700 fw-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            onClick={() => setFormat('csv')}
                        >
                            <FileText size={16} /> CSV
                        </button>
                    </div>
                </div>

                <div>
                    <label className="fw-semibold text-dark text-sm mb-2 d-block">Filter Options</label>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <label className="small text-muted mb-1 d-block">Start Date / Time</label>
                            <div className="position-relative">
                                <Calendar className="position-absolute ms-2 mt-2 text-muted" size={14} style={{ top: '2px' }} />
                                <input
                                    type="date"
                                    className="form-control form-control-sm ps-4 bg-light border-0"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ borderRadius: '8px', height: '34px' }}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="small text-muted mb-1 d-block">End Date / Time</label>
                            <div className="position-relative">
                                <Calendar className="position-absolute ms-2 mt-2 text-muted" size={14} style={{ top: '2px' }} />
                                <input
                                    type="date"
                                    className="form-control form-control-sm ps-4 bg-light border-0"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ borderRadius: '8px', height: '34px' }}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="small text-muted mt-2 mb-0">Leave dates blank to export all available records.</p>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-2 border-top pt-3">
                    <button
                        className="btn btn-light px-4 py-2 rounded-xl text-sm fw-medium border"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all d-flex align-items-center gap-2 border-0"
                        onClick={handleExport}
                    >
                        <Download size={14} /> Download Report
                    </button>
                </div>
            </div>
        </Modal>
    );
}
