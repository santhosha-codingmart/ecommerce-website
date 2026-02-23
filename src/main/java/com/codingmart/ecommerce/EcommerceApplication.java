package com.codingmart.ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * The entry point for our E-commerce application.
 * Elasticsearch sync on startup is handled by {@link ElasticsearchSyncRunner}.
 */
@SpringBootApplication
public class EcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}
}