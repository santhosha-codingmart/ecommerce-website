import React from 'react';

/**
 * Professional Pagination Component
 * Features:
 * - Amazon-style sliding window (e.g. 1 ... 4 5 6 ... 20)
 * - Accessible and sleek design
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const renderPageButton = (pageNumber, label = pageNumber + 1) => {
        const isActive = pageNumber === currentPage;
        return (
            <button
                key={pageNumber}
                onClick={() => onPageChange(pageNumber)}
                style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #6366f1' : '1px solid #e2e8f0',
                    background: isActive ? '#6366f1' : '#fff',
                    color: isActive ? '#fff' : '#1e293b',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    minWidth: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.backgroundColor = '#fff')}
            >
                {label}
            </button>
        );
    };

    const renderEllipsis = (key) => (
        <span key={key} style={{ padding: '0 0.5rem', color: '#94a3b8', alignSelf: 'center' }}>...</span>
    );

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5; // How many neighbors to show around current page

        if (totalPages <= 7) {
            // Show all if few pages
            for (let i = 0; i < totalPages; i++) pages.push(i);
        } else {
            // Complex sliding window logic
            pages.push(0); // Always show first

            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            // Neighbors
            const start = Math.max(1, currentPage - 1);
            const end = Math.min(totalPages - 2, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 4) {
                pages.push('ellipsis-end');
            }

            pages.push(totalPages - 1); // Always show last
        }
        return pages;
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
        }}>
            {/* Prev Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: currentPage === 0 ? '#f1f5f9' : '#fff',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    color: currentPage === 0 ? '#94a3b8' : '#1e293b',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}
            >
                ← Previous
            </button>

            {getPageNumbers().map((p, idx) => (
                p === 'ellipsis-start' || p === 'ellipsis-end'
                    ? renderEllipsis(p)
                    : renderPageButton(p)
            ))}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: currentPage === totalPages - 1 ? '#f1f5f9' : '#fff',
                    cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                    color: currentPage === totalPages - 1 ? '#94a3b8' : '#1e293b',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}
            >
                Next →
            </button>
        </div>
    );
}

export default Pagination;
