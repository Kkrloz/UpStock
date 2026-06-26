package com.carlos.upstock.sse;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class SseService {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email, String role) {
        SseEmitter old = emitters.remove(email);
        if (old != null) old.complete();

        SseEmitter emitter = new SseEmitter(1_800_000L);

        emitters.put(email, emitter);
        log.debug("SSE subscribed: {} ({} active)", email, emitters.size());

        emitter.onCompletion(() -> {
            emitters.remove(email, emitter);
            log.debug("SSE completed: {}", email);
        });
        emitter.onTimeout(() -> {
            emitters.remove(email, emitter);
            log.debug("SSE timeout: {}", email);
        });
        emitter.onError(e -> {
            emitters.remove(email, emitter);
            log.debug("SSE error: {} - {}", email, e.getMessage());
        });

        return emitter;
    }

    public void broadcast(String eventName, Object data) {
        log.debug("SSE broadcast: {} to {} clients", eventName, emitters.size());
        emitters.forEach((email, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                log.warn("SSE send failed for {}, removing", email);
                emitters.remove(email);
            }
        });
    }
}
