package com.aidup.app.repository

import com.aidup.app.models.auth.*
import com.aidup.app.network.ApiService
import com.aidup.app.network.TokenManager
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class AuthRepository(private val apiService: ApiService) {

    suspend fun login(request: LoginRequest): Result<AuthResponse> {
        return try {
            val response = apiService.login(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                // Save token & user info securely
                android.util.Log.d("AuthRepo", "Login success! accessToken=${body.accessToken?.take(10)}..., refreshToken=${body.refreshToken?.take(10)}...")
                body.accessToken?.let { TokenManager.saveToken(it) }
                body.refreshToken?.let { 
                    android.util.Log.d("AuthRepo", "Saving refresh token to TokenManager: ${it.take(10)}...")
                    TokenManager.saveRefreshToken(it) 
                } // Save refresh token
                body.userinfo?.let {
                    TokenManager.saveUser(it._id, it.role, it.name, it.email, it.is_verified)
                }
                Result.success(body)
            } else {
                val errorMessage = response.body()?.message ?: "Login failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        role: String,
        phoneNumber: String? = null,
        photo: okhttp3.MultipartBody.Part? = null
    ): Result<AuthResponse> {
        return try {
            val plainText = "text/plain".toMediaTypeOrNull()
            val nameBody = name.toRequestBody(plainText)
            val emailBody = email.toRequestBody(plainText)
            val passwordBody = password.toRequestBody(plainText)
            val roleBody = role.toRequestBody(plainText)
            val phoneBody = phoneNumber?.toRequestBody(plainText)

            val response = apiService.register(nameBody, emailBody, passwordBody, roleBody, phoneBody, photo)
            if (response.isSuccessful && response.body()?.success == true) {
                // Backend may or may not log the user in automatically on register
                val body = response.body()!!
                body.accessToken?.let { TokenManager.saveToken(it) }
                body.refreshToken?.let { TokenManager.saveRefreshToken(it) } // Save refresh token
                
                val user = body.userinfo
                if (user != null) {
                    TokenManager.saveUser(user._id, user.role, user.name, user.email, user.is_verified)
                } else {
                    // Fallback to saving at least the email from the request
                    TokenManager.saveUser("", role, name, email, false)
                }
                Result.success(body)
            } else {
                val errorMessage = response.body()?.message ?: "Registration failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun googleLogin(request: GoogleLoginRequest): Result<AuthResponse> {
        return try {
            val response = apiService.googleLogin(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                body.accessToken?.let { TokenManager.saveToken(it) }
                body.refreshToken?.let { TokenManager.saveRefreshToken(it) } // Save refresh token
                val user = body.userinfo
                user?.let {
                    TokenManager.saveUser(it._id, it.role, it.name, it.email, it.is_verified)
                }
                Result.success(body)
            } else {
                val errorMessage = response.body()?.message ?: "Google Login failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun getAccessToken(): String? = TokenManager.getToken()
    fun getRefreshToken(): String? = TokenManager.getRefreshToken()

    fun saveTokens(accessToken: String, refreshToken: String) {
        TokenManager.saveToken(accessToken)
        TokenManager.saveRefreshToken(refreshToken)
    }

    suspend fun refresh(refreshToken: String): AuthResponse {
        val response = apiService.refresh(refreshToken)
        if (response.isSuccessful && response.body()?.accessToken != null) {
            return response.body()!!
        } else {
            throw Exception("Refresh failed: ${response.code()}")
        }
    }

    fun logout() {
        // Clear local tokens
        TokenManager.clearAll()
        // We can't easily call apiService.logout() synchronously here without runBlocking,
        // and Authenticator should be fast. Since local clear is the priority:
    }

    suspend fun logoutRemote(): Result<Boolean> {
        return try {
            apiService.logout()
            TokenManager.clearAll()
            Result.success(true)
        } catch (e: Exception) {
            TokenManager.clearAll()
            Result.success(true)
        }
    }

    suspend fun verifyEmail(email: String, code: String): Result<AuthResponse> {
        return try {
            val response = apiService.verifyEmail(VerifyEmailRequest(email, code))
            if (response.isSuccessful && response.body()?.success == true) {
                val body = response.body()!!
                
                // Save token & user info on verification success
                body.accessToken?.let { TokenManager.saveToken(it) }
                body.refreshToken?.let { TokenManager.saveRefreshToken(it) } // Save refresh token
                val user = body.userinfo
                user?.let {
                    TokenManager.saveUser(it._id, it.role, it.name, it.email, it.is_verified)
                }
                
                Result.success(body)
            } else {
                val errorMessage = response.body()?.message ?: "Verification failed"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
