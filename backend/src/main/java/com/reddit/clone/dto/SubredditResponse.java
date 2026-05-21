package com.reddit.clone.dto;

import java.time.Instant;

public record SubredditResponse(Long id, String name, String description, String creator, Instant createdDate) {
}
