package com.PA.ShadowAi.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "tasks")
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "completed", nullable = false)
    private boolean completed;

    @Column(name = "createdAt")
    private LocalDateTime createdAt;

    @Column(name = "completedAt")
    private LocalDateTime completedAt;

    @ManyToOne
    @JoinColumn(name = "user_Id", nullable = false)
    private User user;

    public Task(Long id, String description, String category, boolean completed, LocalDateTime createdAt,
            LocalDateTime completedAt, User user) {
        this.id = id;
        this.description = description;
        this.category = category;
        this.completed = completed;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

}