package br.gov.cbmes.cat.sargentacao_api.boletim;

import br.gov.cbmes.cat.sargentacao_api.boletim.dto.OcorrenciaResumoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boletins")
public class BoletimOcorrenciaController {

    private static final Logger log = LoggerFactory.getLogger(BoletimOcorrenciaController.class);

    private final BoletimOcorrenciaService ocorrenciaService;

    public BoletimOcorrenciaController(BoletimOcorrenciaService ocorrenciaService) {
        this.ocorrenciaService = ocorrenciaService;
    }

    public enum ModoBusca {
        NF, NOME, AMBOS
    }

    @GetMapping("/{boletimId}/ocorrencias")
    public ResponseEntity<List<OcorrenciaResumoResponse>> listarOuGerar(
            @PathVariable Long boletimId,
            @RequestParam(value = "modo", required = false) String modo,
            @RequestParam(value = "nf", required = false) String nf,
            @RequestParam(value = "nome", required = false) String nome
    ) {
        String nfTrim = (nf == null ? null : nf.trim());
        String nomeTrim = (nome == null ? null : nome.trim());

        boolean nfOk = nfTrim != null && !nfTrim.isBlank();
        boolean nomeOk = nomeTrim != null && !nomeTrim.isBlank();

        log.info("GET /api/boletins/{}/ocorrencias?modo={}&nf={}&nome={}", boletimId, modo, nfTrim, nomeTrim);

        // Sem filtro nenhum -> lista tudo (ou gera)
        if (!nfOk && !nomeOk) {
            return ResponseEntity.ok(ocorrenciaService.listarOuGerar(boletimId));
        }

        // ✅ Inferência automática (retrocompatível):
        // Se o front não mandar 'modo', a API decide pelo que foi enviado.
        ModoBusca modoEfetivo = inferirModo(modo, nfOk, nomeOk);

        return ResponseEntity.ok(
                ocorrenciaService.listarOuGerarFiltrado(
                        boletimId,
                        modoEfetivo,
                        nfOk ? nfTrim : null,
                        nomeOk ? nomeTrim : null
                )
        );
    }

    private ModoBusca inferirModo(String modo, boolean nfOk, boolean nomeOk) {
        // Se modo veio, respeita (case-insensitive)
        if (modo != null && !modo.isBlank()) {
            try {
                return ModoBusca.valueOf(modo.trim().toUpperCase());
            } catch (Exception ignored) {
                // cai pra inferência abaixo
            }
        }

        // Inferência baseada nos parâmetros presentes
        if (nfOk && nomeOk) return ModoBusca.AMBOS;
        if (nomeOk) return ModoBusca.NOME;
        return ModoBusca.NF;
    }

    public record TranscreverRequest(String transcritoPor) {}

    @PatchMapping("/ocorrencias/{ocorrenciaId}/transcrever")
    public ResponseEntity<OcorrenciaResumoResponse> transcrever(
            @PathVariable Long ocorrenciaId,
            @RequestBody TranscreverRequest body
    ) {
        String transcritoPor = (body != null ? body.transcritoPor() : null);
        return ResponseEntity.ok(ocorrenciaService.marcarTranscrito(ocorrenciaId, transcritoPor));
    }
}
