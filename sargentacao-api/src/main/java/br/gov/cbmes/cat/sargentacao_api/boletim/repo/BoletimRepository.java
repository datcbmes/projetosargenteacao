package br.gov.cbmes.cat.sargentacao_api.boletim.repo;

import br.gov.cbmes.cat.sargentacao_api.boletim.dto.BoletimResumoResponse;
import br.gov.cbmes.cat.sargentacao_api.boletim.model.Boletim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface BoletimRepository extends JpaRepository<Boletim, Long> {

    Optional<Boletim> findByHashSha256(String hashSha256);

    @Query("""
        select new br.gov.cbmes.cat.sargentacao_api.boletim.dto.BoletimResumoResponse(
            b.id,
            b.nomeArquivo,
            b.hashSha256,
            b.criadoEm,
            (select count(p) from BoletimPagina p where p.boletim.id = b.id)
        )
        from Boletim b
        order by b.criadoEm desc
    """)
    List<BoletimResumoResponse> listarResumos();
}
