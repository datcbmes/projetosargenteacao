package br.gov.cbmes.cat.sargentacao_api.militar;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MilitarRepository extends JpaRepository<Militar, Long> {

    Optional<Militar> findByNumeroFuncional(String numeroFuncional);

    @Query("""
        select m
        from Militar m
        where (:ativo is null or m.ativo = :ativo)
          and (
               :q is null
               or :q = ''
               or lower(m.nome) like lower(concat('%', :q, '%'))
               or lower(m.numeroFuncional) like lower(concat('%', :q, '%'))
          )
        order by m.nome asc
    """)
    List<Militar> search(@Param("ativo") Boolean ativo, @Param("q") String q);
}
