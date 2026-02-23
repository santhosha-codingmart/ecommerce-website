package com.codingmart.ecommerce.service;

import com.codingmart.ecommerce.document.ProductDocument;
import com.codingmart.ecommerce.entity.Product;
import com.codingmart.ecommerce.exception.ResourceNotFoundException;
import com.codingmart.ecommerce.repository.ProductRepository;
import com.codingmart.ecommerce.repository.elastic.ProductElasticRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.StringQuery;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service class managing Product business logic and Smart Elasticsearch Search.
 *
 * Smart Search Features:
 * 1. Multi-field: searches productName (^3 boost), categoryName (^2 boost),
 * productDescription.
 * → "books" finds items under "Books" category even if "book" is not in the
 * product name.
 * 2. Price-aware: "phones under 5000 rupees" extracts max price and applies
 * filter.
 * → Handles: under, below, less than, upto, max, cheaper than + optional
 * rs/INR/rupees
 */
@Service
public class ProductService {

  @Autowired
  private ProductRepository productRepository;

  @Autowired
  private ProductElasticRepository productElasticRepository;

  @Autowired
  private ElasticsearchOperations elasticsearchOperations;

  /**
   * Price pattern: matches phrases like:
   * "phones under 5000 rupees", "laptop below 50000 INR",
   * "watches less than 2000", "jackets upto 3000 rs", "5000 or less"
   */
  private static final Pattern PRICE_PATTERN = Pattern.compile(
      "(?i)" +
          "(?:" +
          // Pattern A: "under 5000 [rupees/rs/INR]"
          "(?:under|below|less\\s+than|within|cheaper\\s+than|upto|up\\s+to|max(?:imum)?|<)" +
          "\\s*(?:rs\\.?|inr|rupees?)?\\s*([\\d,]+)(?:\\s*(?:rs\\.?|inr|rupees?))?" +
          "|" +
          // Pattern B: "5000 [rupees] or less / and below"
          "([\\d,]+)\\s*(?:rs\\.?|inr|rupees?)?\\s*(?:or\\s+less|and\\s+below|max(?:imum)?)" +
          ")");

  // ─── Standard Product CRUD ────────────────────────────────────────────────

  public Page<Product> getAllProducts(Pageable pageable) {
    return productRepository.findAll(pageable);
  }

  public Page<Product> getProductsByCategoryId(Long categoryId, Pageable pageable) {
    return productRepository.findByCategoryCategoryId(categoryId, pageable);
  }

  public Page<Product> filterByPrice(BigDecimal min, BigDecimal max, Pageable pageable) {
    return productRepository.findByProductPriceBetween(min, max, pageable);
  }

  public Product getProductById(Long id) {
    return productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
  }

  // ─── Smart Elasticsearch Search ──────────────────────────────────────────

  /**
   * Entry point: decides whether to do a plain multi-field search or a
   * price-filtered search.
   */
  public Page<ProductDocument> searchProducts(String rawQuery, Pageable pageable) {
    if (rawQuery == null || rawQuery.isBlank()) {
      return Page.empty(pageable);
    }

    Matcher matcher = PRICE_PATTERN.matcher(rawQuery);

    if (matcher.find()) {
      // Group 1: "under 5000" pattern. Group 2: "5000 or less" pattern.
      String priceStr = (matcher.group(1) != null ? matcher.group(1) : matcher.group(2))
          .replaceAll(",", "");
      BigDecimal maxPrice = new BigDecimal(priceStr);

      // Strip the matched price phrase from the query to get a clean keyword
      String keyword = (rawQuery.substring(0, matcher.start()) + " " + rawQuery.substring(matcher.end()))
          .replaceAll("(?i)\\b(rs\\.?|inr|rupees?)\\b", "")
          .trim();

      return searchWithPriceFilter(keyword.isEmpty() ? null : keyword, maxPrice, pageable);
    }

    return searchMultiField(rawQuery, pageable);
  }

  /**
   * Multi-field fuzzy search across productName, categoryName, and
   * productDescription.
   * Boosts: productName^3, categoryName^2 — so category matches surface relevant
   * products.
   * Uses ES AUTO fuzziness to handle typos.
   */
  private Page<ProductDocument> searchMultiField(String keyword, Pageable pageable) {
    String safe = escapeJson(keyword);
    String jsonQuery = """
        {
          "multi_match": {
            "query": "%s",
            "fields": ["productName^3", "categoryName^2", "productDescription"],
            "fuzziness": "AUTO"
          }
        }
        """.formatted(safe);

    StringQuery query = new StringQuery(jsonQuery, pageable);
    SearchHits<ProductDocument> hits = elasticsearchOperations.search(query, ProductDocument.class);
    List<ProductDocument> content = hits.getSearchHits().stream()
        .map(SearchHit::getContent)
        .collect(Collectors.toList());

    return new PageImpl<>(content, pageable, hits.getTotalHits());
  }

  /**
   * Price-filtered search: keyword (nullable) + max price ceiling.
   * e.g., "phones under 5000 rupees" → keyword="phones", maxPrice=5000
   * If only price given (keyword=null), returns ALL products within budget.
   */
  private Page<ProductDocument> searchWithPriceFilter(String keyword, BigDecimal maxPrice, Pageable pageable) {
    String jsonQuery;

    if (keyword == null || keyword.isBlank()) {
      // No keyword — match everything under the price
      jsonQuery = """
          {
            "bool": {
              "must": [{"match_all": {}}],
              "filter": [{"range": {"productPrice": {"lte": %s}}}]
            }
          }
          """.formatted(maxPrice.toPlainString());
    } else {
      String safe = escapeJson(keyword);
      jsonQuery = """
          {
            "bool": {
              "must": [{
                "multi_match": {
                  "query": "%s",
                  "fields": ["productName^3", "categoryName^2", "productDescription"],
                  "fuzziness": "AUTO"
                }
              }],
              "filter": [{"range": {"productPrice": {"lte": %s}}}]
            }
          }
          """.formatted(safe, maxPrice.toPlainString());
    }

    StringQuery query = new StringQuery(jsonQuery, pageable);
    SearchHits<ProductDocument> hits = elasticsearchOperations.search(query, ProductDocument.class);
    List<ProductDocument> content = hits.getSearchHits().stream()
        .map(SearchHit::getContent)
        .collect(Collectors.toList());

    return new PageImpl<>(content, pageable, hits.getTotalHits());
  }

  // ─── MySQL → Elasticsearch Sync ──────────────────────────────────────────

  /**
   * Maps a MySQL Product entity to an Elasticsearch ProductDocument.
   * Includes imageUrl and categoryName for richer search results.
   */
  public ProductDocument convertToDocument(Product product) {
    ProductDocument doc = new ProductDocument();
    doc.setId(product.getProductId().toString());
    doc.setProductName(product.getProductName());
    doc.setProductDescription(product.getProductDescription());
    doc.setProductPrice(product.getProductPrice());
    doc.setImageUrl(product.getImageUrl());
    if (product.getCategory() != null) {
      doc.setCategoryName(product.getCategory().getCategoryName());
    }
    return doc;
  }

  /**
   * Full re-index: clears Elasticsearch, then re-syncs all products from MySQL.
   * Call this after adding/editing products, or when ES index gets stale.
   * Endpoint: POST /api/products/sync
   */
  public void syncAllProducts() {
    List<Product> products = productRepository.findAll();
    List<ProductDocument> documents = products.stream()
        .map(this::convertToDocument)
        .toList();
    productElasticRepository.deleteAll(); // wipe old index first
    productElasticRepository.saveAll(documents);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Escapes special characters to make a string safe inside a JSON string value.
   */
  private String escapeJson(String input) {
    return input
        .replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\n", "\\n")
        .replace("\r", "\\r");
  }
}
