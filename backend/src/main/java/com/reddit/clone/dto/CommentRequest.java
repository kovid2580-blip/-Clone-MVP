package com.reddit.clone.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentRequest(@NotBlank String text) {
}
