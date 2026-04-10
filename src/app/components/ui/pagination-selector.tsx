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
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="premium-pagination">
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px', fontSize: '10px' }}>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
            }}
            className="page-size-select"
          >
            {[5, 10, 20, 1000].map(size => (
              <option key={size} value={size}>
                {size === 1000 ? "All" : size}
              </option>
            ))}
          </select>
        </div>
        {totalItems !== undefined && (
          <div className="text-muted small fw-medium d-none d-sm-block">
            Showing <span className="text-dark fw-bold">{startItem}</span> to <span className="text-dark fw-bold">{endItem}</span> of <span className="text-dark fw-bold">{totalItems}</span>
          </div>
        )}
      </div>

      <div className="d-flex align-items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="d-none d-md-flex align-items-center gap-1 mx-1">
          {getPageNumbers().map((p, i) => (
            typeof p === 'number' ? (
              <button
                key={i}
                onClick={() => onPageChange(p)}
                className={`pagination-btn ${currentPage === p ? 'active' : ''}`}
                style={{ minWidth: '36px', justifyContent: 'center' }}
              >
                {p}
              </button>
            ) : (
              <span key={i} className="text-muted px-1">...</span>
            )
          ))}
        </div>

        <div className="d-md-none text-muted small fw-bold px-2">
          {currentPage} / {totalPages}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
