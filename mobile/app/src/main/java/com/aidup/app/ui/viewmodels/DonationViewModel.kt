package com.aidup.app.ui.viewmodels

import android.content.Context
import android.net.Uri
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.models.donation.Donation
import com.aidup.app.models.donation.PaymentMethod
import com.aidup.app.network.RetrofitClient
import com.aidup.app.network.TokenManager
import com.aidup.app.repository.DonationRepository
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

sealed class DonationHistoryUiState {
    object Loading : DonationHistoryUiState()
    data class Success(val donations: List<Donation>) : DonationHistoryUiState()
    data class Error(val message: String) : DonationHistoryUiState()
}

sealed class SubmitDonationUiState {
    object Idle : SubmitDonationUiState()
    object Submitting : SubmitDonationUiState()
    object Success : SubmitDonationUiState()
    data class Error(val message: String) : SubmitDonationUiState()
}

class DonationViewModel : ViewModel() {

    private val repository = DonationRepository(RetrofitClient.instance)

    var historyUiState by mutableStateOf<DonationHistoryUiState>(DonationHistoryUiState.Loading)
        private set

    var submitUiState by mutableStateOf<SubmitDonationUiState>(SubmitDonationUiState.Idle)
        private set

    fun loadHistory(statusFilter: String? = null) {
        viewModelScope.launch {
            historyUiState = DonationHistoryUiState.Loading
            val result = repository.getDonationHistory(statusFilter)
            result.onSuccess { donations ->
                historyUiState = DonationHistoryUiState.Success(donations)
            }.onFailure { err ->
                historyUiState = DonationHistoryUiState.Error(err.message ?: "Failed to load donations")
            }
        }
    }

    /**
     * Converts content URIs to temporary files and uploads them as multipart evidence.
     */
    fun submitEvidence(
        context: Context,
        campaignId: String,
        description: String,
        paymentMethods: List<String>,
        imageUris: List<Uri>
    ) {
        viewModelScope.launch {
            submitUiState = SubmitDonationUiState.Submitting
            
            val donatorId = TokenManager.getUserId()
            if (donatorId == null) {
                submitUiState = SubmitDonationUiState.Error("You must be logged in to donate.")
                return@launch
            }

            try {
                // Convert Uris to MultipartBody.Part
                val imageParts = imageUris.mapIndexed { index, uri ->
                    val file = uriToFile(context, uri, "evidence_$index.jpg")
                    val requestBody = file.readBytes().toRequestBody("image/jpeg".toMediaTypeOrNull())
                    MultipartBody.Part.createFormData("images", file.name, requestBody)
                }

                val result = repository.submitDonationEvidence(
                    campaignId = campaignId,
                    donatorId = donatorId,
                    paymentMethods = paymentMethods,
                    description = description,
                    evidenceImages = imageParts
                )

                result.onSuccess {
                    submitUiState = SubmitDonationUiState.Success
                }.onFailure { err ->
                    submitUiState = SubmitDonationUiState.Error(err.message ?: "Upload failed")
                }

            } catch (e: Exception) {
                submitUiState = SubmitDonationUiState.Error(e.message ?: "File processing error")
            }
        }
    }

    fun resetSubmitState() {
        submitUiState = SubmitDonationUiState.Idle
    }

    // Helper to copy content URI to a temp file for Retrofit
    private fun uriToFile(context: Context, uri: Uri, fileName: String): File {
        val inputStream: InputStream? = context.contentResolver.openInputStream(uri)
        val tempFile = File(context.cacheDir, fileName)
        val outputStream = FileOutputStream(tempFile)
        inputStream?.copyTo(outputStream)
        inputStream?.close()
        outputStream.close()
        return tempFile
    }
}
