package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.models.auth.GoogleLoginRequest
import com.aidup.app.models.auth.LoginRequest
import com.aidup.app.models.auth.UserProfile
import com.aidup.app.network.RetrofitClient
import com.aidup.app.network.TokenManager
import com.aidup.app.repository.AuthRepository
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class Success(val user: UserProfile?) : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}

class AuthViewModel : ViewModel() {

    private val authRepository = AuthRepository(RetrofitClient.instance)

    var uiState by mutableStateOf<AuthUiState>(AuthUiState.Idle)
        private set

    init {
        if (TokenManager.isLoggedIn()) {
            uiState = AuthUiState.Success(
                UserProfile(
                    _id      = TokenManager.getUserId() ?: "",
                    name     = TokenManager.getUserName() ?: "",
                    email    = TokenManager.getUserEmail() ?: "",
                    role     = TokenManager.getUserRole() ?: "donator",
                    photo    = null   // was "image" — field is "photo" in UserProfile
                )
            )
        }
    }

    fun login(request: LoginRequest) {
        viewModelScope.launch {
            uiState = AuthUiState.Loading
            val result = authRepository.login(request)
            result.onSuccess { response ->
                uiState = AuthUiState.Success(response.userinfo) // was response.user
            }.onFailure { err ->
                uiState = AuthUiState.Error(err.message ?: "An unknown error occurred")
            }
        }
    }

    // register() now takes individual fields + optional photo part
    // instead of a RegisterRequest, because the endpoint is @Multipart
    fun register(
        name: String,
        email: String,
        password: String,
        role: String,
        phoneNumber: String? = null,
        photo: MultipartBody.Part? = null
    ) {
        viewModelScope.launch {
            uiState = AuthUiState.Loading
            val result = authRepository.register(name, email, password, role, phoneNumber, photo)
            result.onSuccess { response ->
                uiState = AuthUiState.Success(response.userinfo) // was response.user
            }.onFailure { err ->
                uiState = AuthUiState.Error(err.message ?: "An unknown error occurred")
            }
        }
    }

    fun googleLogin(idToken: String, role: String) {
        viewModelScope.launch {
            uiState = AuthUiState.Loading
            val result = authRepository.googleLogin(GoogleLoginRequest(idToken, role))
            result.onSuccess { response ->
                uiState = AuthUiState.Success(response.userinfo) // was response.user
            }.onFailure { err ->
                uiState = AuthUiState.Error(err.message ?: "Google login failed")
            }
        }
    }

    fun verifyEmail(email: String, code: String) {
        viewModelScope.launch {
            uiState = AuthUiState.Loading
            val result = authRepository.verifyEmail(email, code)
            result.onSuccess { response ->
                uiState = AuthUiState.Success(response.userinfo) // was response.user
            }.onFailure { err ->
                uiState = AuthUiState.Error(err.message ?: "An unknown error occurred")
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            uiState = AuthUiState.Loading
            authRepository.logout()
            TokenManager.clearAll()
            uiState = AuthUiState.Idle
        }
    }

    fun resetState() {
        uiState = AuthUiState.Idle
    }
}