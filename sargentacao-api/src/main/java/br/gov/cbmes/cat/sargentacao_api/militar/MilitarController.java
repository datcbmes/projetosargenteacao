package br.gov.cbmes.cat.sargentacao_api.militar;

import br.gov.cbmes.cat.sargentacao_api.militar.dto.MilitarCreateRequest;
import br.gov.cbmes.cat.sargentacao_api.militar.dto.MilitarResponse;
import br.gov.cbmes.cat.sargentacao_api.militar.dto.MilitarUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/militares")
public class MilitarController {

    private final MilitarService service;

    public MilitarController(MilitarService service) {
        this.service = service;
    }

    @GetMapping
    public List<MilitarResponse> list(
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(required = false, name = "q") String q
    ) {
        return service.search(ativo, q).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public MilitarResponse get(@PathVariable Long id) {
        return toResponse(service.getById(id));
    }

    @PostMapping
    public MilitarResponse create(@RequestBody @Valid MilitarCreateRequest req) {
        return toResponse(service.create(req));
    }

    @PutMapping("/{id}")
    public MilitarResponse update(@PathVariable Long id, @RequestBody @Valid MilitarUpdateRequest req) {
        return toResponse(service.update(id, req));
    }

    @PatchMapping("/{id}/ativar")
    public MilitarResponse ativar(@PathVariable Long id) {
        return toResponse(service.setAtivo(id, true));
    }

    @PatchMapping("/{id}/inativar")
    public MilitarResponse inativar(@PathVariable Long id) {
        return toResponse(service.setAtivo(id, false));
    }

    private MilitarResponse toResponse(Militar m) {
        return new MilitarResponse(m.getId(), m.getNumeroFuncional(), m.getNome(), m.isAtivo());
    }
}
