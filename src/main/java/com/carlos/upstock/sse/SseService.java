package com.carlos.upstock.sse;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final ConcurrentHashMap<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String email, String role) {
        SseEmitter old = emitters.remove(email);
        if (old != null) old.complete();

        SseEmitter emitter = new SseEmitter(1_800_000L);

        emitters.put(email, emitter);

        emitter.onCompletion(() -> emitters.remove(email, emitter));
        emitter.onTimeout(() -> emitters.remove(email, emitter));
        emitter.onError(e -> emitters.remove(email, emitter));

        return emitter;
    }

    public void broadcast(String eventName, Object data) {
        emitters.forEach((email, emitter) -> {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                emitters.remove(email);
            }
        });
    }
}
