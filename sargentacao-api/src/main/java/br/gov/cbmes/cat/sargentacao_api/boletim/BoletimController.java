package br.gov.cbmes.cat.sargentacao_api.boletim;

import br.gov.cbmes.cat.sargentacao_api.boletim.dto.BoletimResumoResponse;
import br.gov.cbmes.cat.sargentacao_api.boletim.dto.BoletimUploadResponse;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimRepository;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/boletins")
public class BoletimController {

    private final BoletimService boletimService;
    private final BoletimRepository boletimRepository;

    public BoletimController(BoletimService boletimService, BoletimRepository boletimRepository) {
        this.boletimService = boletimService;
        this.boletimRepository = boletimRepository;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<BoletimUploadResponse> upload(@RequestPart("file") @NotNull MultipartFile file) {
        BoletimUploadResponse resp = boletimService.processarUpload(file);
        return ResponseEntity.ok(resp);
    }

    /**
     * Alimenta o combo de boletins importados no front.
     * GET /api/boletins
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public List<BoletimResumoResponse> listar() {
        return boletimRepository.listarResumos();
    }

    // Importante:
    // O endpoint de ocorrências NÃO fica aqui.
    // Ele deve ficar no BoletimOcorrenciaController:
    // GET /api/boletins/{boletimId}/ocorrencias
}
