package com.reddit.clone.dto;

import com.reddit.clone.model.VoteType;
import jakarta.validation.constraints.NotNull;

public record VoteRequest(@NotNull VoteType voteType) {
}
