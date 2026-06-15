export function Pagination({
  currentPage = 2,
  totalPages = 12,
  visiblePages = [1, 2, 3],
}) {
  return (
    <nav className="ui-pagination" aria-label="Pagination">
      <button className="ui-pagination-control" type="button">
        Prev
      </button>
      <div className="ui-pagination-pages" role="list">
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            className={`ui-pagination-page${
              page === currentPage ? " is-active" : ""
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
        <span className="ui-pagination-ellipsis" aria-hidden="true">
          ...
        </span>
        <button
          type="button"
          className={`ui-pagination-page${
            totalPages === currentPage ? " is-active" : ""
          }`}
          aria-current={totalPages === currentPage ? "page" : undefined}
        >
          {totalPages}
        </button>
      </div>
      <button className="ui-pagination-control" type="button">
        Next
      </button>
    </nav>
  );
}
