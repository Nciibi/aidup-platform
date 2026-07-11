package com.aidup.app.repository

import com.aidup.app.models.auth.ApiResponse
import com.aidup.app.models.auth.QrApproveRequest
import com.aidup.app.models.auth.QrSessionResponse
import com.aidup.app.network.ApiService

class QrAuthRepository(private val apiService: ApiService) {

    /**
     * Called by the PC/Website to create a session. Not used by the Android app normally, 
     * but included for completeness.
     */
    suspend fun createSession(): Result<QrSessionResponse> {
        return try {
            val response = apiService.createQrSession()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to create QR session"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Step 2: Phone scans the QR code and validates that the session is still active/pending.
     */
    suspend fun scanSession(sessionId: String): Result<Boolean> {
        return try {
            val response = apiService.scanQrSession(sessionId)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(true)
            } else {
                val msg = response.body()?.message ?: "Invalid or expired QR session"
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Step 3: Phone explicitly approves the session (requires JWT token of the logged-in user).
     * This tells the backend to emit the WebSocket event to the PC.
     */
    suspend fun approveSession(sessionId: String): Result<Boolean> {
        return try {
            val response = apiService.approveQrSession(QrApproveRequest(sessionId))
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(true)
            } else {
                val msg = response.body()?.message ?: "Failed to approve QR login"
                Result.failure(Exception(msg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
