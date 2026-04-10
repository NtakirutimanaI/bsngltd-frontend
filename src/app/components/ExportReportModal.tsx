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
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
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
                            <div className="d-flex align-items-center bg-light rounded-lg px-2 border" style={{ height: '34px' }}>
                                <Calendar className="text-muted flex-shrink-0" size={14} />
                                <input
                                    type="date"
                                    className="form-control form-control-sm border-0 bg-transparent flex-fill"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ outline: 'none', boxShadow: 'none', fontSize: '12px' }}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <label className="small text-muted mb-1 d-block">End Date / Time</label>
                            <div className="d-flex align-items-center bg-light rounded-lg px-2 border" style={{ height: '34px' }}>
                                <Calendar className="text-muted flex-shrink-0" size={14} />
                                <input
                                    type="date"
                                    className="form-control form-control-sm border-0 bg-transparent flex-fill"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ outline: 'none', boxShadow: 'none', fontSize: '12px' }}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="small text-muted mt-2 mb-0">Leave dates blank to export all available records.</p>
                </div>

                <div className="modal-footer border-0 pt-0 pb-4 px-4 gap-2">
                    <button
                        className="btn btn-light px-4 fw-semibold"
                        onClick={onClose}
                        style={{ borderRadius: '8px', fontSize: '13px', height: '38px', minWidth: '100px' }}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
                        onClick={handleExport}
                        disabled={!format || !startDate || !endDate}
                        style={{ 
                            borderRadius: '8px', 
                            fontSize: '13px', 
                            height: '38px', 
                            backgroundColor: (!format || !startDate || !endDate) ? '#e9ecef' : '#009CFF',
                            borderColor: (!format || !startDate || !endDate) ? '#e9ecef' : '#009CFF',
                            color: (!format || !startDate || !endDate) ? '#adb5bd' : '#fff',
                            minWidth: '150px',
                            justifyContent: 'center'
                        }}
                    >
                        <Download size={14} />
                        {(!format || !startDate || !endDate) ? 'Selection Required' : 'Download Report'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
