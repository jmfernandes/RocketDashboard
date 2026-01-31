interface PaginationProps {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
  onPageChange: (page: number) => void
}

export default function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label="Telemetry pagination">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${hasPrevious ? '' : 'disabled'}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
          >
            &laquo; Previous
          </button>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? 'active' : ''}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${hasNext ? '' : 'disabled'}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
          >
            Next &raquo;
          </button>
        </li>
      </ul>
    </nav>
  )
}
