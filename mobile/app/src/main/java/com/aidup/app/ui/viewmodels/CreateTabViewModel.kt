package com.aidup.app.ui.viewmodels

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.network.DataStoreManager
import com.aidup.app.network.RetrofitClient
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

enum class CreateTabState { LOADING, FORM, PENDING, VERIFIED, REJECTED }

class CreateTabViewModel(application: Application) : AndroidViewModel(application) {
    private val apiService = RetrofitClient.instance
    private val dataStore = DataStoreManager(application)

    var uiState by mutableStateOf(CreateTabState.LOADING)
        private set

    var rejectionTimeLeft by mutableStateOf("")
        private set

    init {
        checkSituation()
    }

    fun checkSituation() {
        viewModelScope.launch {
            uiState = CreateTabState.LOADING
            try {
                // First check DataStore for rejection within 24h
                val lastRejection = dataStore.rejectionTimestamp.first()
                if (lastRejection != null) {
                    val currentTime = System.currentTimeMillis()
                    val diff = currentTime - lastRejection
                    val twentyFourHours = 24 * 60 * 60 * 1000L
                    if (diff < twentyFourHours) {
                        uiState = CreateTabState.REJECTED
                        val remaining = twentyFourHours - diff
                        val hours = remaining / (60 * 60 * 1000)
                        val minutes = (remaining % (60 * 60 * 1000)) / (60 * 1000)
                        rejectionTimeLeft = "${hours}h ${minutes}m"
                        return@launch
                    } else {
                        // Clear if expired
                        dataStore.clearRejectionTimestamp()
                    }
                }

                val response = apiService.getOrganizerSituation()
                if (response.isSuccessful && response.body() != null) {
                    val sit = response.body()!!
                    uiState = when {
                        sit.isVerified -> CreateTabState.VERIFIED
                        sit.status?.lowercase() == "pending" -> CreateTabState.PENDING
                        sit.status?.lowercase() == "rejected" -> {
                            // If rejected but no timestamp in DataStore, save current as "just happened"
                            // Or better, if the backend doesn't provide it, we save it here.
                            dataStore.saveRejectionTimestamp(System.currentTimeMillis())
                            uiState = CreateTabState.REJECTED
                            rejectionTimeLeft = "24h 0m"
                            CreateTabState.REJECTED
                        }
                        else -> CreateTabState.FORM
                    }
                } else {
                    uiState = CreateTabState.FORM // fallback
                }
            } catch (e: Exception) {
                uiState = CreateTabState.FORM // fallback
            }
        }
    }
}
