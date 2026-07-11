package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.network.RetrofitClient
import com.google.gson.annotations.SerializedName
import kotlinx.coroutines.launch
import kotlin.math.ceil
import kotlin.math.max

// ─────────────────────────────────────────────────────────────────────────────
// Data models matching the actual backend response for GET /organizor/dashboard
// ─────────────────────────────────────────────────────────────────────────────

/** Donor object as returned by populated donator_id */
data class DashboardDonor(
    @SerializedName("_id")
    val id: String,
    val name: String? = null,
    val username: String? = null,
    val photo: String? = null,
    val email: String? = null
)

/** Campaign object as returned raw from the backend */
data class DashboardCampaign(
    @SerializedName("_id")
    val id: String,
    val title: String = "",
    val description: String = "",
    val status: String = "",
    val goal_amount: Double = 0.0,
    val raised_amount: Double = 0.0,
    val images: List<String>? = null,
    val banner: String? = null,
    val goal_date: String? = null,
    val story: String? = null,
    val goal: List<String>? = null
) {
    /** Compute days left from goal_date */
    val days_left: Int
        get() {
            if (goal_date == null) return 0
            return try {
                val sdf = java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
                val target = sdf.parse(goal_date.take(10))
                if (target != null) {
                    val diff = target.time - System.currentTimeMillis()
                    max(0, ceil(diff.toDouble() / 86400000.0).toInt())
                } else 0
            } catch (_: Exception) { 0 }
        }
}

/** The "data" field inside the backend response */
data class OrganizerDashboardData(
    val donors: List<DashboardDonor>? = null,
    val donorsCount: Int? = null,
    val avgCampaignSuccess: Double? = null,   // ratio 0..1 from backend
    val totalRaisedAmount: Double? = null,
    val campaigns: List<DashboardCampaign>? = null
) {
    /** Convert the 0..1 ratio to a 0..100 percentage for display */
    val avgCampaignSuccessPercent: Double
        get() = ((avgCampaignSuccess ?: 0.0) * 100)
}

/** Top-level backend response wrapper: { success, data } */
data class DashboardApiResponse(
    val success: Boolean,
    val data: OrganizerDashboardData?
)

// ─────────────────────────────────────────────────────────────────────────────
// UI State
// ─────────────────────────────────────────────────────────────────────────────

sealed class OrganizerDashboardUiState {
    object Loading : OrganizerDashboardUiState()
    data class Success(val data: OrganizerDashboardData) : OrganizerDashboardUiState()
    data class Error(val message: String) : OrganizerDashboardUiState()
}

// ─────────────────────────────────────────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────────────────────────────────────────

class OrganizerDashboardViewModel : ViewModel() {

    var uiState by mutableStateOf<OrganizerDashboardUiState>(OrganizerDashboardUiState.Loading)
        private set

    init {
        loadDashboard()
    }

    fun loadDashboard() {
        viewModelScope.launch {
            uiState = OrganizerDashboardUiState.Loading
            try {
                val response = RetrofitClient.instance.getOrganizerDashboard()
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.data != null) {
                        uiState = OrganizerDashboardUiState.Success(body.data)
                    } else {
                        uiState = OrganizerDashboardUiState.Error("Empty response")
                    }
                } else {
                    uiState = OrganizerDashboardUiState.Error("Error ${response.code()}")
                }
            } catch (e: Exception) {
                uiState = OrganizerDashboardUiState.Error(e.message ?: "Unknown error")
            }
        }
    }
}