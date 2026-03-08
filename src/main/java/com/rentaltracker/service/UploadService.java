package com.rentaltracker.service;

import com.rentaltracker.config.SupabaseConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final SupabaseConfig supabaseConfig;

    /**
     * Uploads a file to the specified Supabase Storage bucket and returns the public URL.
     *
     * @param file   the multipart file to upload
     * @param bucket the target Supabase Storage bucket name (e.g. "rental-agreements", "payment-proofs")
     * @return the public URL of the uploaded file
     */
    public String upload(MultipartFile file, String bucket) {
        throw new UnsupportedOperationException("TODO");
    }
}
