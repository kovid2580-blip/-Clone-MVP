package com.reddit.clone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PostRequest(
        @NotBlank String postName,
        String url,
        String description,
        @NotNull Long subredditId
) {
}
