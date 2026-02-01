package com.PA.ShadowAi.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "feedposts")
public class FeedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "author", nullable = false, length = 100)
    private String author;

    @Column(name = "handle", nullable = false, length = 100)
    private String handle;

    @Column(name = "avatar", nullable = false, length = 100)
    private String avatar;

    @Column(name = "content", nullable = false, length = 100)
    private String content;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "likes", nullable = false)
    private Integer likes;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true) // Updated comments field
    private List<Comment> comments = new ArrayList<>(); // Initialize to prevent NullPointerException

    public FeedPost() {
    }

    public FeedPost(String author, String handle, String avatar, String content, String category, Integer likes,
            LocalDateTime timestamp, List<Comment> comments) {
        this.author = author;
        this.handle = handle;
        this.avatar = avatar;
        this.content = content;
        this.category = category;
        this.likes = likes;

        this.timestamp = timestamp;
        this.comments = comments;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getLikes() {
        return likes;
    }

    public void setLikes(Integer likes) {
        this.likes = likes;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
