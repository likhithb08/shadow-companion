package com.PA.ShadowAi.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;
    private String text;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private FeedPost post;

    public Comment() {

    }

    public Comment(String author, String text, LocalDateTime timestamp, FeedPost post) {
        this.author = author;
        this.text = text;
        this.timestamp = timestamp;
        this.post = post;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public FeedPost getPost() {
        return post;
    }

    public void setPost(FeedPost post) {
        this.post = post;
    }
}
