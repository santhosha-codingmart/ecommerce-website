package com.codingmart.ecommerce.document;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.math.BigDecimal;

/**
 * ProductDocument for Elasticsearch.
 * Includes all fields needed to render a product card directly from search
 * results.
 * Also stores categoryName so we can search by category (e.g., "books" finds
 * items in "Books" category).
 */
@Data
@Document(indexName = "products")
public class ProductDocument {

    @Id
    private String id;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String productName;

    @Field(type = FieldType.Text, analyzer = "standard")
    private String productDescription;

    @Field(type = FieldType.Double)
    private BigDecimal productPrice;

    /**
     * Denormalized: stored as keyword for exact filtering AND text for full-text
     * search.
     * This is how "books" query finds products under "Books" category.
     */
    @Field(type = FieldType.Text, analyzer = "standard")
    private String categoryName;

    /**
     * Image URL preserved from MySQL so search results can display product images.
     */
    @Field(type = FieldType.Keyword, index = false)
    private String imageUrl;
}
