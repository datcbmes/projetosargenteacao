package br.gov.cbmes.cat.sargentacao_api.boletim.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "boletim_pagina")
public class BoletimPagina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * IMPORTANTE:
     * - Ajuste o import/uso de "Boletim" conforme o pacote real da sua entidade.
     * - Ex.: se Boletim estiver em br.gov.cbmes.cat.sargentacao_api.boletim.model.Boletim
     *   então você precisa importar e usar esse tipo aqui.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "boletim_id", nullable = false)
    private Boletim boletim;

    @Column(name = "numero_pagina", nullable = false)
    private Integer numeroPagina;

    /**
     * Para Postgres, prefira TEXT.
     * NÃO use @Lob aqui se você quer evitar o mapeamento para OID.
     */
    @Column(name = "texto", nullable = false, columnDefinition = "text")
    private String texto;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters/Setters

    public Long getId() {
        return id;
    }

    public Boletim getBoletim() {
        return boletim;
    }

    public void setBoletim(Boletim boletim) {
        this.boletim = boletim;
    }

    public Integer getNumeroPagina() {
        return numeroPagina;
    }

    public void setNumeroPagina(Integer numeroPagina) {
        this.numeroPagina = numeroPagina;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
