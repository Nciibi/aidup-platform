package com.aidup.app.utils

object NetworkUtils {
    private const val BASE_URL = "http://10.0.2.2:5000"

    /**
     * Converts a potentially relative backend URL into a full absolute URL for Coil/AsyncImage.
     * Handles:
     * 1. Null/Empty -> returns null
     * 2. Leading http/https -> returns as-is
     * 3. Leading / -> prepends base URL
     * 4. No leading / -> prepends base URL with a /
     */
    fun getFullImageUrl(url: String?): String? {
        if (url.isNullOrEmpty()) return null
        if (url.startsWith("http")) return url
        
        return if (url.startsWith("/")) {
            "$BASE_URL$url"
        } else {
            "$BASE_URL/$url"
        }
    }
}
