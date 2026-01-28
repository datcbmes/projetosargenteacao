package br.gov.cbmes.cat.sargentacao_api.boletim.repo;

import br.gov.cbmes.cat.sargentacao_api.boletim.model.BoletimOcorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoletimOcorrenciaRepository extends JpaRepository<BoletimOcorrencia, Long> {

    boolean existsByBoletimId(Long boletimId);

    long countByBoletimId(Long boletimId);

    List<BoletimOcorrencia> findByBoletimIdOrderByStatusAscPaginaAscIdAsc(Long boletimId);
}
