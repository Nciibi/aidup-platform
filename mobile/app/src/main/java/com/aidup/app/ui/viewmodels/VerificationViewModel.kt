package com.aidup.app.ui.viewmodels

import android.app.Application
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.network.RetrofitClient
import com.aidup.app.utils.FileUtils
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

sealed class VerificationUiState {
    object Idle : VerificationUiState()
    object Loading : VerificationUiState()
    object Success : VerificationUiState()
    data class Error(val message: String) : VerificationUiState()
}

class VerificationViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = RetrofitClient.instance

    var name by mutableStateOf("")
    var phone by mutableStateOf("")
    val selectedImages = mutableStateListOf<Uri>()

    var uiState by mutableStateOf<VerificationUiState>(VerificationUiState.Idle)
        private set

    fun addImage(uri: Uri) {
        if (selectedImages.size < 5) {
            selectedImages.add(uri)
        }
    } fun removeImage(uri: Uri) {
        selectedImages.remove(uri)
    }

    fun submitVerification(onSuccess: () -> Unit) {
        if (name.isBlank() || phone.isBlank() || selectedImages.isEmpty()) {
            uiState = VerificationUiState.Error("Please fill all fields and upload at least one image.")
            return
        }

        viewModelScope.launch {
            uiState = VerificationUiState.Loading
            try {
                val namePart = name.toRequestBody("text/plain".toMediaTypeOrNull())
                val phonePart = phone.toRequestBody("text/plain".toMediaTypeOrNull())
                
                val imageParts = selectedImages.mapNotNull { uri ->
                    FileUtils.uriToMultipart(getApplication(), uri, "images")
                }

                val response = apiService.submitVerification(namePart, phonePart, imageParts)
                if (response.isSuccessful) {
                    uiState = VerificationUiState.Success
                    onSuccess()
                } else {
                    val errorMsg = try {
                        val errorJson = org.json.JSONObject(response.errorBody()?.string() ?: "")
                        errorJson.getString("error")
                    } catch (e: Exception) {
                        "Submission failed"
                    }
                    uiState = VerificationUiState.Error(errorMsg)
                }
            } catch (e: Exception) {
                uiState = VerificationUiState.Error(e.message ?: "An unknown error occurred")
            }
        }
    }
}
