package br.gov.cbmes.cat.sargentacao_api.boletim.repo;

import br.gov.cbmes.cat.sargentacao_api.boletim.model.BoletimPagina;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoletimPaginaRepository extends JpaRepository<BoletimPagina, Long> {

    int countByBoletimId(Long boletimId);

    List<BoletimPagina> findByBoletimIdOrderByNumeroPaginaAsc(Long boletimId);
}
