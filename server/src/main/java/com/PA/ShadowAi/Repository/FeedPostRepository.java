package com.PA.ShadowAi.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.PA.ShadowAi.Model.FeedPost;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {
}
