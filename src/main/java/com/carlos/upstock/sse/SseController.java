package com.carlos.upstock.sse;

import com.carlos.upstock.security.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Tag(name = "SSE", description = "Server-Sent Events para atualizações em tempo real")
@Slf4j
@RestController
@RequestMapping("/api/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "Inscrever-se em eventos", description = "Conecta ao stream de eventos em tempo real via SSE")
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam("token") String token) {
        if (!jwtUtil.isValid(token)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }
        String email = jwtUtil.extractEmail(token);
        String role = jwtUtil.extractRole(token);
        return sseService.subscribe(email, role);
    }
}
