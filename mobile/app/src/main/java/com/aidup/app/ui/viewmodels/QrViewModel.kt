package com.aidup.app.ui.viewmodels

import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.network.RetrofitClient
import com.aidup.app.repository.QrAuthRepository
import kotlinx.coroutines.launch

sealed class QrUiState {
    object Idle : QrUiState()
    object Scanning : QrUiState()
    object Validating : QrUiState()
    data class AwaitingApproval(val sessionId: String) : QrUiState()
    object Approved : QrUiState()
    data class Error(val message: String) : QrUiState()
}

class QrViewModel : ViewModel() {

    private val qrRepository = QrAuthRepository(RetrofitClient.instance)

    var uiState by mutableStateOf<QrUiState>(QrUiState.Idle)
        private set

    fun startScan() {
        uiState = QrUiState.Scanning
    }

    fun onQrScanned(rawValue: String) {
        // Prevent multiple identical scans if already validating/approving
        if (uiState !is QrUiState.Scanning) return

        // Assume the raw value is either the sessionId directly or the URL: `/auth/qr/scan/{sessionId}`
        var sessionId = rawValue
        if (rawValue.contains("/auth/qr/scan/")) {
            try {
                // If it's a full URL `http://10.0.2.2:5000/auth/qr/scan/123456`, extract the last segment
                val uri = Uri.parse(rawValue)
                sessionId = uri.lastPathSegment ?: rawValue.substringAfterLast("/")
            } catch (e: Exception) {
                // fallback piece
                sessionId = rawValue.substringAfterLast("/")
            }
        }

        if (sessionId.isBlank()) {
            uiState = QrUiState.Error("Invalid QR code format")
            return
        }

        viewModelScope.launch {
            uiState = QrUiState.Validating
            val result = qrRepository.scanSession(sessionId)
            result.onSuccess {
                uiState = QrUiState.AwaitingApproval(sessionId)
            }.onFailure { err ->
                uiState = QrUiState.Error(err.message ?: "Failed to validate QR code. Note: You must be logged in to approve.")
            }
        }
    }

    fun approveLogin(sessionId: String) {
        viewModelScope.launch {
            uiState = QrUiState.Validating // reusing validating spinner for approve request
            val result = qrRepository.approveSession(sessionId)
            result.onSuccess {
                uiState = QrUiState.Approved
            }.onFailure { err ->
                uiState = QrUiState.Error(err.message ?: "Failed to approve login. Are you logged in on this device?")
            }
        }
    }

    fun resetState() {
        uiState = QrUiState.Idle
    }
}
