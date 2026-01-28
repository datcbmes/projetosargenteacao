package br.gov.cbmes.cat.sargentacao_api.boletim;

import br.gov.cbmes.cat.sargentacao_api.boletim.dto.BoletimUploadResponse;
import br.gov.cbmes.cat.sargentacao_api.boletim.model.Boletim;
import br.gov.cbmes.cat.sargentacao_api.boletim.model.BoletimPagina;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimPaginaRepository;
import br.gov.cbmes.cat.sargentacao_api.boletim.repo.BoletimRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.time.OffsetDateTime;
import java.util.HexFormat;

@Service
public class BoletimService {

    private final BoletimRepository boletimRepository;
    private final BoletimPaginaRepository boletimPaginaRepository;

    public BoletimService(BoletimRepository boletimRepository,
                          BoletimPaginaRepository boletimPaginaRepository) {
        this.boletimRepository = boletimRepository;
        this.boletimPaginaRepository = boletimPaginaRepository;
    }

    @Transactional
    public BoletimUploadResponse processarUpload(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo PDF não informado.");
        }

        try (InputStream is = file.getInputStream()) {
            byte[] bytes = is.readAllBytes();

            String hash = sha256Hex(bytes);

            var existenteOpt = boletimRepository.findByHashSha256(hash);
            if (existenteOpt.isPresent()) {
                Boletim existente = existenteOpt.get();
                int total = boletimPaginaRepository.countByBoletimId(existente.getId());

                return new BoletimUploadResponse(
                        existente.getId(),
                        existente.getNomeArquivo(),
                        existente.getHashSha256(),
                        total,
                        true
                );
            }

            return importarPdf(bytes, file.getOriginalFilename(), hash);

        } catch (Exception e) {
            throw new RuntimeException("Falha ao importar PDF: " + e.getMessage(), e);
        }
    }

    private BoletimUploadResponse importarPdf(byte[] bytes, String nomeArquivo, String hash) throws Exception {

        try (PDDocument doc = Loader.loadPDF(bytes)) {

            Boletim boletim = new Boletim();
            boletim.setNomeArquivo(nomeArquivo == null ? "boletim.pdf" : nomeArquivo);
            boletim.setHashSha256(hash);
            boletim.setCriadoEm(OffsetDateTime.now());

            try {
                boletim = boletimRepository.save(boletim);
            } catch (DataIntegrityViolationException ex) {
                Boletim existente = boletimRepository.findByHashSha256(hash)
                        .orElseThrow(() -> ex);

                int total = boletimPaginaRepository.countByBoletimId(existente.getId());
                return new BoletimUploadResponse(
                        existente.getId(),
                        existente.getNomeArquivo(),
                        existente.getHashSha256(),
                        total,
                        true
                );
            }

            PDFTextStripper stripper = new PDFTextStripper();
            int totalPaginas = doc.getNumberOfPages();

            for (int pagina = 1; pagina <= totalPaginas; pagina++) {
                stripper.setStartPage(pagina);
                stripper.setEndPage(pagina);

                String texto = stripper.getText(doc);
                if (texto != null) texto = texto.trim();

                BoletimPagina bp = new BoletimPagina();
                bp.setBoletim(boletim);
                bp.setNumeroPagina(pagina);
                bp.setTexto(texto == null ? "" : texto);

                boletimPaginaRepository.save(bp);
            }

            return new BoletimUploadResponse(
                    boletim.getId(),
                    boletim.getNomeArquivo(),
                    boletim.getHashSha256(),
                    totalPaginas,
                    false
            );
        }
    }

    private static String sha256Hex(byte[] data) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(data);
        return HexFormat.of().formatHex(digest);
    }
}
