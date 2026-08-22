package es.buscadorcromos;

import static org.assertj.core.api.Assertions.assertThat;

import es.buscadorcromos.catalog.StickerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class BuscadorCromosApiApplicationTests {

    @Autowired
    StickerRepository stickers;

    @Test
    void contextLoadsAndCatalogIsSeeded() {
        assertThat(stickers.count()).isEqualTo(493L);
    }
}
