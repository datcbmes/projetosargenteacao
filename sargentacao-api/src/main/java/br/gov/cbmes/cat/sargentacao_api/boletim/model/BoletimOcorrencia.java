package br.gov.cbmes.cat.sargentacao_api.boletim.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import br.gov.cbmes.cat.sargentacao_api.militar.Militar;


@Entity
@Table(
        name = "boletim_ocorrencia",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_boletim_ocorrencia_unica",
                        columnNames = {"boletim_id", "militar_id", "pagina"})
        }
)
public class BoletimOcorrencia {

    public enum Status {
        PENDENTE, TRANSCRITO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "boletim_id", nullable = false)
    private Boletim boletim;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "militar_id", nullable = false)
    private Militar militar;

    @Column(nullable = false)
    private Integer pagina;

    @Column(nullable = false, columnDefinition = "text")
    private String trecho;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDENTE;

    private OffsetDateTime transcritoEm;

    @Column(length = 120)
    private String transcritoPor;

    @Column(nullable = false)
    private OffsetDateTime createdAt;

    @Column(nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    void prePersist() {
        var now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = Status.PENDENTE;
    }

    @PreUpdate
    void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // getters/setters

    public Long getId() { return id; }

    public Boletim getBoletim() { return boletim; }
    public void setBoletim(Boletim boletim) { this.boletim = boletim; }

    public Militar getMilitar() { return militar; }
    public void setMilitar(Militar militar) { this.militar = militar; }

    public Integer getPagina() { return pagina; }
    public void setPagina(Integer pagina) { this.pagina = pagina; }

    public String getTrecho() { return trecho; }
    public void setTrecho(String trecho) { this.trecho = trecho; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public OffsetDateTime getTranscritoEm() { return transcritoEm; }
    public void setTranscritoEm(OffsetDateTime transcritoEm) { this.transcritoEm = transcritoEm; }

    public String getTranscritoPor() { return transcritoPor; }
    public void setTranscritoPor(String transcritoPor) { this.transcritoPor = transcritoPor; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
