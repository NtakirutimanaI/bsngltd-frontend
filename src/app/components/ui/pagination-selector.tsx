import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationSelectorProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalItems?: number;
}

export function PaginationSelector({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems
}: PaginationSelectorProps) {
  const pageSizes = [5, 10, 15];
  
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  return (
    <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted small">Items per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="form-select form-select-sm"
          style={{ 
            fontSize: '12px', 
            height: '30px', 
            borderRadius: '6px',
            border: '1px solid #dee2e6',
            minWidth: '60px'
          }}
        >
          {pageSizes.map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        {totalItems && (
          <span className="text-muted small">
            {startItem}-{endItem} of {totalItems}
          </span>
        )}
      </div>
      
      <div className="d-flex align-items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="btn btn-sm d-flex align-items-center gap-1"
          style={{
            background: currentPage === 1 ? '#f8f9fa' : '#16a085',
            border: '1px solid #dee2e6',
            color: currentPage === 1 ? '#6c757d' : '#fff',
            fontSize: '12px',
            height: '30px',
            borderRadius: '6px',
            padding: '0 8px'
          }}
        >
          <ChevronLeft size={12} />
          Previous
        </button>
        
        <span className="text-muted small px-2">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="btn btn-sm d-flex align-items-center gap-1"
          style={{
            background: currentPage === totalPages ? '#f8f9fa' : '#16a085',
            border: '1px solid #dee2e6',
            color: currentPage === totalPages ? '#6c757d' : '#fff',
            fontSize: '12px',
            height: '30px',
            borderRadius: '6px',
            padding: '0 8px'
          }}
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
