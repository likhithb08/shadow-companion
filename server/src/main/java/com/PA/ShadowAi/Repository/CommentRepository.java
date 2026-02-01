package com.PA.ShadowAi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.PA.ShadowAi.Model.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
