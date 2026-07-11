package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.models.campaign.CampaignDetailResponse
import com.aidup.app.network.RetrofitClient
import com.aidup.app.repository.CampaignRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

sealed class CampaignDetailsUiState {
    object Loading : CampaignDetailsUiState()
    data class Success(val campaign: CampaignDetailResponse, val daysLeft: Int) : CampaignDetailsUiState()
    data class Error(val message: String) : CampaignDetailsUiState()
}

class CampaignDetailsViewModel : ViewModel() {
    private val repository = CampaignRepository(RetrofitClient.instance)

    var uiState: CampaignDetailsUiState by mutableStateOf(CampaignDetailsUiState.Loading)
        private set

    fun loadCampaign(id: String) {
        uiState = CampaignDetailsUiState.Loading
        viewModelScope.launch {
            val result = repository.getPublicCampaignById(id)
            result.onSuccess { detail ->
                val daysLeft = calculateDaysLeft(detail.goal_date)
                uiState = CampaignDetailsUiState.Success(
                    campaign = detail,
                    daysLeft = daysLeft
                )
            }.onFailure { error ->
                uiState = CampaignDetailsUiState.Error(error.message ?: "An error occurred")
            }
        }
    }

    /** Calculate remaining days from an ISO goal_date string. */
    private fun calculateDaysLeft(goalDate: String?): Int {
        if (goalDate.isNullOrBlank()) return 0
        return try {
            val formats = listOf(
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US),
                SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US),
                SimpleDateFormat("yyyy-MM-dd", Locale.US)
            )
            formats.forEach { it.timeZone = TimeZone.getTimeZone("UTC") }

            val parsed = formats.firstNotNullOfOrNull { fmt ->
                try { fmt.parse(goalDate) } catch (_: Exception) { null }
            } ?: return 0

            val diff = parsed.time - System.currentTimeMillis()
            if (diff <= 0) 0 else (diff / (1000 * 60 * 60 * 24)).toInt()
        } catch (_: Exception) {
            0
        }
    }
}
