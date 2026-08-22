package es.buscadorcromos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la API de Buscador Cromos (álbum Liga Este 2026/27).
 *
 * <p>Al arrancar ocurre lo siguiente, en orden:</p>
 * <ol>
 *   <li>Flyway aplica las migraciones de {@code db/migration} (crea las tablas si no existen).</li>
 *   <li>{@link es.buscadorcromos.catalog.CatalogSeeder} carga/actualiza el catálogo
 *       desde {@code catalog/liga-este-2026-27.json} (493 cromos).</li>
 *   <li>Tomcat queda escuchando en el puerto {@code PORT} (8080 por defecto).</li>
 * </ol>
 */
@SpringBootApplication
public class BuscadorCromosApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BuscadorCromosApiApplication.class, args);
	}

}
