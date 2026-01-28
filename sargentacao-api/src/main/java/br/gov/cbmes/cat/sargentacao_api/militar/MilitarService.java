package br.gov.cbmes.cat.sargentacao_api.militar;

import br.gov.cbmes.cat.sargentacao_api.militar.dto.MilitarCreateRequest;
import br.gov.cbmes.cat.sargentacao_api.militar.dto.MilitarUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MilitarService {

    private final MilitarRepository repository;

    public MilitarService(MilitarRepository repository) {
        this.repository = repository;
    }

    public Militar create(MilitarCreateRequest req) {
        String nf = normalizeNumero(req.numeroFuncional());

        repository.findByNumeroFuncional(nf).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe militar com este número funcional: " + nf);
        });

        Militar m = new Militar();
        m.setNumeroFuncional(nf);
        m.setNome(req.nome().trim());
        m.setAtivo(true);
        return repository.save(m);
    }

    public Militar update(Long id, MilitarUpdateRequest req) {
        Militar m = getById(id);
        m.setNome(req.nome().trim());
        return repository.save(m);
    }

    public Militar setAtivo(Long id, boolean ativo) {
        Militar m = getById(id);
        m.setAtivo(ativo);
        return repository.save(m);
    }

    public Militar getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Militar não encontrado"));
    }

    public List<Militar> search(Boolean ativo, String q) {
        String qq = (q == null || q.isBlank()) ? null : q.trim();
        return repository.search(ativo, qq);
    }

    private String normalizeNumero(String numeroFuncional) {
        if (numeroFuncional == null) return null;
        return numeroFuncional.trim();
    }
}
