package com.codingmart.ecommerce.repository.elastic;

import com.codingmart.ecommerce.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

/**
 * Elasticsearch Repository for ProductDocument.
 *
 * Complex queries (smart price-aware search) are executed via
 * ElasticsearchOperations
 * injected in ProductService. This repository provides the baseline method.
 */
@Repository
public interface ProductElasticRepository extends ElasticsearchRepository<ProductDocument, String> {
    // Defined as empty — all search logic is in ProductService using
    // ElasticsearchOperations
    // for full control over multi-field, price-filtered, fuzziness-enabled queries.
}
