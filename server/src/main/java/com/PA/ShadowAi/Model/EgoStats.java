package com.PA.ShadowAi.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "egostats")
public class EgoStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "focus", nullable = false)
    private Integer focus;

    @Column(name = "discipline", nullable = false)
    private Integer discipline;

    @Column(name = "skill", nullable = false)
    private Integer skill;

    @Column(name = "speed", nullable = false)
    private Integer speed;

    @Column(name = "creativity", nullable = false)
    private Integer creativity;

    @Column(name = "mentalStrength", nullable = false)
    private Integer mentalStrength;

    @OneToOne(mappedBy = "egoStats")
    private User user;

    public EgoStats() {
    }

    public EgoStats(Long id, Integer focus, Integer discipline, Integer skill, Integer speed, Integer creativity,
            Integer mentalStrength, User user) {
        this.id = id;
        this.focus = focus;
        this.discipline = discipline;
        this.skill = skill;
        this.speed = speed;
        this.creativity = creativity;
        this.mentalStrength = mentalStrength;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getFocus() {
        return focus;
    }

    public void setFocus(Integer focus) {
        this.focus = focus;
    }

    public Integer getDiscipline() {
        return discipline;
    }

    public void setDiscipline(Integer discipline) {
        this.discipline = discipline;
    }

    public Integer getSkill() {
        return skill;
    }

    public void setSkill(Integer skill) {
        this.skill = skill;
    }

    public Integer getSpeed() {
        return speed;
    }

    public void setSpeed(Integer speed) {
        this.speed = speed;
    }

    public Integer getCreativity() {
        return creativity;
    }

    public void setCreativity(Integer creativity) {
        this.creativity = creativity;
    }

    public Integer getMentalStrength() {
        return mentalStrength;
    }

    public void setMentalStrength(Integer mentalStrength) {
        this.mentalStrength = mentalStrength;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
