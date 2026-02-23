package com.codingmart.ecommerce;

import com.codingmart.ecommerce.service.ProductService;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Automatically syncs all MySQL products into Elasticsearch
 * once the Spring application is fully started and ready.
 *
 * Uses ApplicationReadyEvent (fired AFTER all beans and the web server are
 * up) to avoid race conditions that could occur with CommandLineRunner or
 * 
 * @PostConstruct which run before the context is fully ready.
 */
@Component
public class ElasticsearchSyncRunner implements ApplicationListener<ApplicationReadyEvent> {

    private final ProductService productService;

    public ElasticsearchSyncRunner(ProductService productService) {
        this.productService = productService;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        System.out.println("------------------------------------------");
        System.out.println("⚡ Application ready — starting Elasticsearch sync...");
        try {
            productService.syncAllProducts();
            System.out.println("✅ Elasticsearch sync complete! All products indexed.");
        } catch (Exception e) {
            // Log the error but do NOT crash the application.
            // The app still works; only search is degraded.
            System.err.println("⚠️  Elasticsearch sync FAILED (search may be degraded): " + e.getMessage());
        }
        System.out.println("------------------------------------------");
    }
}
