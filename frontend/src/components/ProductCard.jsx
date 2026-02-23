import React, { useState } from 'react';

/**
 * Inline SVG placeholder — no external request, works offline.
 * Shows a camera icon with "No Image" text in a neutral grey box.
 */
const PLACEHOLDER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <rect width="300" height="200" fill="%23f1f5f9"/>
  <rect x="110" y="65" width="80" height="60" rx="6" fill="%23cbd5e1"/>
  <circle cx="150" cy="95" r="18" fill="%23f1f5f9"/>
  <circle cx="150" cy="95" r="11" fill="%2394a3b8"/>
  <rect x="126" y="68" width="12" height="7" rx="2" fill="%23f1f5f9"/>
  <text x="150" y="148" font-family="sans-serif" font-size="13" fill="%2394a3b8" text-anchor="middle">No Image</text>
</svg>`;

/** Backend base URL — Spring Boot serves static files on port 8080 */
const BACKEND_URL = 'http://localhost:8080';

/**
 * Resolves the image URL:
 * - Relative paths like /images/placeholder.png → http://localhost:8080/images/placeholder.png
 * - Already-absolute URLs (http/https) → used as-is
 * - null/undefined → falls back to the inline SVG placeholder
 */
function resolveImageUrl(rawUrl) {
    if (!rawUrl) return PLACEHOLDER_SVG;
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
    // Relative path: prepend backend origin
    return `${BACKEND_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
}

function ProductCard({ product }) {
    const name = product.productName;
    const description = product.productDescription;
    const price = product.productPrice;
    const rawImage = product.imageUrl;

    const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(rawImage));

    return (
        <div
            style={{
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Product Image */}
            <img
                src={imgSrc}
                alt={name}
                onError={() => setImgSrc(PLACEHOLDER_SVG)}
                style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    backgroundColor: '#f1f5f9',
                    display: 'block',
                }}
            />

            {/* Product Info */}
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b', lineHeight: 1.3 }}>
                    {name}
                </h3>
                <p style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    margin: '0 0 1rem 0',
                    flex: 1,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.2rem' }}>
                        ₹{Number(price).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
