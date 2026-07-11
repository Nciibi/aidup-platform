package com.aidup.app.network

import android.util.Log
import com.aidup.app.repository.AuthRepository
import kotlinx.coroutines.runBlocking
import okhttp3.Authenticator
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route

class TokenAuthenticator(
    private val authRepository: AuthRepository
) : Authenticator {

    companion object {
        private const val TAG = "TokenAuthenticator"
    }

    override fun authenticate(route: Route?, response: Response): Request? {
        Log.d(TAG, "authenticate() triggered for ${response.request.url} — HTTP ${response.code}")

        // 0. Check if the 401 is actually a JWT expiration error, and not a business logic error (like Organizer Not Verified)
        val responseText = response.peekBody(2048).string()
        val isTokenError = responseText.contains("Invalid token", ignoreCase = true) || 
                           responseText.contains("Token has expired", ignoreCase = true) ||
                           responseText.contains("No token provided", ignoreCase = true) ||
                           responseText.contains("Not an access token", ignoreCase = true)

        if (!isTokenError) {
            Log.w(TAG, "401 error is an application error (e.g. Organizer not verified), not a JWT expiry. Skipping token refresh.")
            return null
        }

        // 1. Prevent infinite loops
        if (response.request.header("X-Retry-Auth") != null) {
            Log.w(TAG, "Refresh retry also failed — logging out")
            authRepository.logout()
            return null
        }

        // 2. Try to refresh
        val newAccessToken = runBlocking {
            try {
                val refreshToken = authRepository.getRefreshToken()
                if (refreshToken == null) {
                    Log.w(TAG, "No refresh token stored — cannot refresh")
                    return@runBlocking null
                }
                Log.d(TAG, "Calling refresh endpoint with token: ${refreshToken.take(20)}...")

                val result = authRepository.refresh(refreshToken)
                Log.d(TAG, "Refresh response — accessToken=${result.accessToken?.take(20)}, refreshToken=${result.refreshToken?.take(20)}")

                val accessToken = result.accessToken
                val nextRefreshToken = result.refreshToken
                
                if (accessToken != null) {
                    if (nextRefreshToken != null) {
                        authRepository.saveTokens(accessToken, nextRefreshToken)
                        Log.d(TAG, "Both tokens saved")
                    } else {
                        // Backend grace period: only Access Token provided, current Refresh Token remains valid
                        TokenManager.saveToken(accessToken)
                        Log.d(TAG, "Access token saved (Refresh token not rotated by backend)")
                    }
                    accessToken
                } else {
                    Log.w(TAG, "Refresh returned null access token")
                    null
                }
            } catch (e: Exception) {
                Log.e(TAG, "Refresh failed with exception: ${e.message}", e)
                null
            }
        }

        if (newAccessToken == null) {
            Log.w(TAG, "Could not obtain new access token — logging out")
            authRepository.logout()
            return null
        }

        // 3. Retry original request with new token
        return response.request.newBuilder()
            .header("Authorization", "Bearer $newAccessToken")
            .header("X-Retry-Auth", "true") // prevent infinite loop
            .build()
    }
}
