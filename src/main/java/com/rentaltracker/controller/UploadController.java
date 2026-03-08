package com.rentaltracker.controller;

import com.rentaltracker.service.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    /**
     * Accepts a multipart file and a bucket name, uploads to Supabase Storage,
     * and returns the public URL.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("bucket") String bucket) {
        String url = uploadService.upload(file, bucket);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
