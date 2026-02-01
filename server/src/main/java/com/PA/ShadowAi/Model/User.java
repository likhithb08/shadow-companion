package com.PA.ShadowAi.Model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "location", nullable = false, length = 100)
    private String location;

    @Column(name = "nationality", nullable = false, length = 100)
    private String nationality;

    @Column(name = "language", nullable = false, length = 100)
    private String language;

    @Column(name = "appLanguage", nullable = false, length = 100)
    private String appLanguage;

    @Column(name = "creditsUsed", nullable = false)
    private Integer creditsUsed;

    @Column(name = "avatarSeed", nullable = false, length = 100)
    private String avatarSeed;

    @Column(name = "focusStreak", nullable = false)
    private Integer focusStreak;

    @Column(name = "createdAt", nullable = false)
    private LocalDateTime createdAt;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "ego_stats_id")
    private EgoStats egoStats;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "preferences_id")
    private CompanionPreferences companionPreferences;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<ChatMessage> chatHistory;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<ActivityLog> activityLogs;

    public User() {
    }

    public User(Long id, String name, String email, String password, Integer age, String location, String nationality,
            String language, String appLanguage, Integer creditsUsed, String avatarSeed, Integer focusStreak,
            LocalDateTime createdAt, EgoStats egoStats, CompanionPreferences companionPreferences,
            List<ChatMessage> chatHistory, List<Task> tasks, List<ActivityLog> activityLogs) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.age = age;
        this.location = location;
        this.nationality = nationality;
        this.language = language;
        this.appLanguage = appLanguage;
        this.creditsUsed = creditsUsed;
        this.avatarSeed = avatarSeed;
        this.focusStreak = focusStreak;
        this.createdAt = createdAt;
        this.egoStats = egoStats;
        this.companionPreferences = companionPreferences;
        this.chatHistory = chatHistory;
        this.tasks = tasks;
        this.activityLogs = activityLogs;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getAppLanguage() {
        return appLanguage;
    }

    public void setAppLanguage(String appLanguage) {
        this.appLanguage = appLanguage;
    }

    public Integer getCreditsUsed() {
        return creditsUsed;
    }

    public void setCreditsUsed(Integer creditsUsed) {
        this.creditsUsed = creditsUsed;
    }

    public String getAvatarSeed() {
        return avatarSeed;
    }

    public void setAvatarSeed(String avatarSeed) {
        this.avatarSeed = avatarSeed;
    }

    public Integer getFocusStreak() {
        return focusStreak;
    }

    public void setFocusStreak(Integer focusStreak) {
        this.focusStreak = focusStreak;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public EgoStats getEgoStats() {
        return egoStats;
    }

    public void setEgoStats(EgoStats egoStats) {
        this.egoStats = egoStats;
    }

    public CompanionPreferences getCompanionPreferences() {
        return companionPreferences;
    }

    public void setCompanionPreferences(CompanionPreferences companionPreferences) {
        this.companionPreferences = companionPreferences;
    }

    public List<ChatMessage> getChatHistory() {
        return chatHistory;
    }

    public void setChatHistory(List<ChatMessage> chatHistory) {
        this.chatHistory = chatHistory;
    }

    public List<Task> getTasks() {
        return tasks;
    }

    public void setTasks(List<Task> tasks) {
        this.tasks = tasks;
    }

    public List<ActivityLog> getActivityLogs() {
        return activityLogs;
    }

    public void setActivityLogs(List<ActivityLog> activityLogs) {
        this.activityLogs = activityLogs;
    }

    @Override
    public String toString() {
        return "User [id=" + id + ", name=" + name + ", email=" + email + ", password=" + password + ", age=" + age
                + ", location=" + location + ", nationality=" + nationality + ", language=" + language
                + ", appLanguage=" + appLanguage + ", creditsUsed=" + creditsUsed + ", avatarSeed=" + avatarSeed
                + ", focusStreak=" + focusStreak + ", createdAt=" + createdAt + ", egoStats=" + egoStats
                + ", companionPreferences=" + companionPreferences + "]";
    }

}
