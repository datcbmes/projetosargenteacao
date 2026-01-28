package br.gov.cbmes.cat.sargentacao_api.boletim;

import br.gov.cbmes.cat.sargentacao_api.boletim.dto.OcorrenciaResumoResponse;
import br.gov.cbmes.cat.sargentacao_api.boletim.model.BoletimOcorrencia;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimOcorrenciaRepository;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimPaginaRepository;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimRepository;
import br.gov.cbmes.cat.sargentacao_api.militar.MilitarRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class BoletimOcorrenciaService {

    private static final Logger log = LoggerFactory.getLogger(BoletimOcorrenciaService.class);

    private final BoletimRepository boletimRepository;
    private final BoletimPaginaRepository boletimPaginaRepository;
    private final MilitarRepository militarRepository;
    private final BoletimOcorrenciaRepository ocorrenciaRepository;

    public BoletimOcorrenciaService(BoletimRepository boletimRepository,
                                    BoletimPaginaRepository boletimPaginaRepository,
                                    MilitarRepository militarRepository,
                                    BoletimOcorrenciaRepository ocorrenciaRepository) {
        this.boletimRepository = boletimRepository;
        this.boletimPaginaRepository = boletimPaginaRepository;
        this.militarRepository = militarRepository;
        this.ocorrenciaRepository = ocorrenciaRepository;
    }

    /**
     * Fluxo 2.1:
     * - Se já existem ocorrências persistidas, apenas retorna.
     * - Se não existem, extrai, persiste e retorna.
     */
    @Transactional
    public List<OcorrenciaResumoResponse> listarOuGerar(Long boletimId) {

        var boletim = boletimRepository.findById(boletimId)
                .orElseThrow(() -> new IllegalArgumentException("Boletim não encontrado: " + boletimId));

        if (!ocorrenciaRepository.existsByBoletimId(boletimId)) {
            gerarOcorrencias(boletimId);
        }

        return ocorrenciaRepository.findByBoletimIdOrderByStatusAscPaginaAscIdAsc(boletimId)
                .stream()
                .map(o -> toResumo(o, boletim.getNomeArquivo()))
                .toList();
    }

    /**
     * Busca filtrada: NF / NOME / AMBOS.
     *
     * Importante: a lógica aqui é explícita e não "defaulta" para TRUE quando o filtro veio.
     * Assim, evita o bug de "retornar a consulta anterior" ou "voltar lista cheia".
     */
    @Transactional
    public List<OcorrenciaResumoResponse> listarOuGerarFiltrado(
            Long boletimId,
            BoletimOcorrenciaController.ModoBusca modo,
            String nf,
            String nome
    ) {
        var boletim = boletimRepository.findById(boletimId)
                .orElseThrow(() -> new IllegalArgumentException("Boletim não encontrado: " + boletimId));

        if (!ocorrenciaRepository.existsByBoletimId(boletimId)) {
            gerarOcorrencias(boletimId);
        }

        var lista = ocorrenciaRepository.findByBoletimIdOrderByStatusAscPaginaAscIdAsc(boletimId);

        final BoletimOcorrenciaController.ModoBusca modoEfetivo =
                (modo == null ? BoletimOcorrenciaController.ModoBusca.NF : modo);

        final String nfFiltro = normalizarNF(nf);
        final String nomeFiltro = normalizarNome(nome);

        final boolean temNF = nfFiltro != null && !nfFiltro.isBlank();
        final boolean temNome = nomeFiltro != null && !nomeFiltro.isBlank();

        log.info("Filtro ocorrencias boletimId={} modo={} nf='{}' nome='{}' (antes={})",
                boletimId, modoEfetivo, nfFiltro, nomeFiltro, lista.size());

        // Se por algum motivo chegou aqui sem filtros, devolve tudo (mas isso não deveria acontecer)
        if (!temNF && !temNome) {
            return lista.stream().map(o -> toResumo(o, boletim.getNomeArquivo())).toList();
        }

        List<BoletimOcorrencia> filtrada = lista.stream()
                .filter(o -> {
                    var m = o.getMilitar();
                    String oNf = normalizarNF(m != null ? m.getNumeroFuncional() : null);
                    String oNome = normalizarNome(m != null ? m.getNome() : null);

                    boolean matchNF = temNF && oNf != null && oNf.contains(nfFiltro);
                    boolean matchNome = temNome && oNome != null && oNome.contains(nomeFiltro);

                    return switch (modoEfetivo) {
                        case NF -> matchNF;                       // se modo NF, TEM que casar NF
                        case NOME -> matchNome;                   // se modo NOME, TEM que casar Nome
                        case AMBOS -> {
                            // AMBOS:
                            // - se digitou os dois: exige os dois
                            // - se digitou só um: exige o que foi digitado
                            if (temNF && temNome) yield matchNF && matchNome;
                            if (temNF) yield matchNF;
                            if (temNome) yield matchNome;
                            yield false;
                        }
                    };
                })
                .toList();

        log.info("Filtro ocorrencias boletimId={} modo={} (depois={})",
                boletimId, modoEfetivo, filtrada.size());

        return filtrada.stream()
                .map(o -> toResumo(o, boletim.getNomeArquivo()))
                .toList();
    }

    private void gerarOcorrencias(Long boletimId) {
        var boletim = boletimRepository.findById(boletimId)
                .orElseThrow(() -> new IllegalArgumentException("Boletim não encontrado: " + boletimId));

        var paginas = boletimPaginaRepository.findByBoletimIdOrderByNumeroPaginaAsc(boletimId);
        var militares = militarRepository.findAll(); // MVP: simples; depois pode ser findByAtivoTrue()

        List<BoletimOcorrencia> paraSalvar = new ArrayList<>();

        for (var p : paginas) {
            String textoPagina = p.getTexto();
            if (textoPagina == null || textoPagina.isBlank()) continue;

            for (var m : militares) {
                String nf = m.getNumeroFuncional();
                if (nf == null || nf.isBlank()) continue;

                // regra MVP: achou o número funcional no texto => cria ocorrência
                if (textoPagina.contains(nf)) {
                    var oc = new BoletimOcorrencia();
                    oc.setBoletim(boletim);
                    oc.setMilitar(m);
                    oc.setPagina(p.getNumeroPagina());

                    // MVP: guarda o texto da página (depois a gente reduz para "trecho")
                    oc.setTrecho(textoPagina);

                    oc.setStatus(BoletimOcorrencia.Status.PENDENTE);

                    paraSalvar.add(oc);
                }
            }
        }

        for (var oc : paraSalvar) {
            try {
                ocorrenciaRepository.save(oc);
            } catch (DataIntegrityViolationException ignored) {
                // já existia (UNIQUE), segue o fluxo
            }
        }
    }

    @Transactional
    public OcorrenciaResumoResponse marcarTranscrito(Long ocorrenciaId, String transcritoPor) {

        var oc = ocorrenciaRepository.findById(ocorrenciaId)
                .orElseThrow(() -> new IllegalArgumentException("Ocorrência não encontrada: " + ocorrenciaId));

        oc.setStatus(BoletimOcorrencia.Status.TRANSCRITO);
        oc.setTranscritoEm(OffsetDateTime.now());
        oc.setTranscritoPor(transcritoPor);

        oc = ocorrenciaRepository.save(oc);

        String nomeArquivo = oc.getBoletim() != null ? oc.getBoletim().getNomeArquivo() : null;
        return toResumo(oc, nomeArquivo);
    }

    private static OcorrenciaResumoResponse toResumo(BoletimOcorrencia o, String nomeArquivo) {
        var militar = o.getMilitar();

        Long boletimId = (o.getBoletim() != null ? o.getBoletim().getId() : null);

        return new OcorrenciaResumoResponse(
                o.getId(),
                boletimId,
                nomeArquivo,
                o.getPagina(),
                militar != null ? militar.getId() : null,
                militar != null ? militar.getNumeroFuncional() : null,
                militar != null ? militar.getNome() : null,
                o.getTrecho(),
                o.getStatus(),
                o.getCreatedAt(),
                null
        );
    }

    // -----------------------
    // Normalizações
    // -----------------------

    private static String normalizarNF(String v) {
        if (v == null) return null;
        return v.trim().replace(" ", "").toLowerCase();
    }

    private static String normalizarNome(String v) {
        if (v == null) return null;
        String s = v.trim().toLowerCase();
        s = Normalizer.normalize(s, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        s = s.replaceAll("\\s+", " ");
        return s;
    }
}
