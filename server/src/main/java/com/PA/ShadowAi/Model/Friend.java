package com.PA.ShadowAi.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "friends")
public class Friend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "handle", nullable = false, length = 100)
    private String handle;

    @Column(name = "avatar", nullable = false, length = 100)
    private String avatar;

    @Column(name = "status", nullable = false, length = 100)
    private String status;
    private String personaPrompt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Friend() {
    }

    public Friend(Long id, String name, String handle, String avatar, String status, String personaPrompt, User user) {
        this.id = id;
        this.name = name;
        this.handle = handle;
        this.avatar = avatar;
        this.status = status;
        this.personaPrompt = personaPrompt;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPersonaPrompt() {
        return personaPrompt;
    }

    public void setPersonaPrompt(String personaPrompt) {
        this.personaPrompt = personaPrompt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
