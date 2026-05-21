package com.reddit.clone.dto;

import jakarta.validation.constraints.NotBlank;

public record SubredditRequest(
        @NotBlank String name,
        @NotBlank String description
) {
}
