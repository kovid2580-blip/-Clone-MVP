package com.reddit.clone.dto;

import java.time.Instant;

public record CommentResponse(Long id, String text, String author, Instant createdDate) {
}
