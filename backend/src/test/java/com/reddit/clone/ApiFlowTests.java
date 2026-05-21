package com.reddit.clone;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiFlowTests {
    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void userCanCreateCommunityPostCommentAndVote() throws Exception {
        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"alice","email":"alice@example.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String token = objectMapper.readTree(registerResponse).get("token").asText();

        String subredditResponse = mockMvc.perform(post("/api/subreddits")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"java","description":"Java discussions"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("java"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode subreddit = objectMapper.readTree(subredditResponse);

        String postResponse = mockMvc.perform(post("/api/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"postName":"Hello","description":"First post","subredditId":%d}
                                """.formatted(subreddit.get("id").asLong())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.postName").value("Hello"))
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode post = objectMapper.readTree(postResponse);

        mockMvc.perform(post("/api/posts/" + post.get("postId").asLong() + "/comments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"text":"Nice one"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Nice one"));

        mockMvc.perform(post("/api/posts/" + post.get("postId").asLong() + "/vote")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"voteType":"UPVOTE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voteCount").value(1));

        mockMvc.perform(get("/api/posts?sort=popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].postName").value("Hello"));

        mockMvc.perform(get("/api/subreddits/" + subreddit.get("id").asLong() + "/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subredditName").value("java"))
                .andExpect(jsonPath("$[0].postName").value("Hello"));
    }
}
