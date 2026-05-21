package com.reddit.clone.dto;

import java.time.Instant;

public record PostResponse(
        Long postId,
        String postName,
        String url,
        String description,
        Integer voteCount,
        String author,
        Long subredditId,
        String subredditName,
        Instant createdDate
) {
}
