package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.models.campaign.Campaign
import com.aidup.app.models.campaign.Category
import com.aidup.app.network.RetrofitClient
import com.aidup.app.repository.CampaignRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.launch

sealed class HomeFeedUiState {
    object Loading : HomeFeedUiState()
    data class Success(val campaigns: List<Campaign>, val categories: List<Category>) : HomeFeedUiState()
    data class Error(val message: String) : HomeFeedUiState()
}

class HomeFeedViewModel : ViewModel() {

    private val campaignRepository = CampaignRepository(RetrofitClient.instance)

    var uiState by mutableStateOf<HomeFeedUiState>(HomeFeedUiState.Loading)
        private set

    init {
        loadCampaigns()
    }

    fun loadCampaigns() {
        viewModelScope.launch {
            uiState = HomeFeedUiState.Loading
            
            val campaignsDeferred = async { campaignRepository.getPublicCampaigns() }
            val categoriesDeferred = async { campaignRepository.getCategories() }
            
            val campaignsResult = campaignsDeferred.await()
            val categoriesResult = categoriesDeferred.await()
            
            if (campaignsResult.isSuccess && categoriesResult.isSuccess) {
                uiState = HomeFeedUiState.Success(
                    campaigns = campaignsResult.getOrDefault(emptyList()),
                    categories = categoriesResult.getOrDefault(emptyList())
                )
            } else {
                val errorMsg = when {
                    campaignsResult.isFailure -> campaignsResult.exceptionOrNull()?.message ?: "Failed to load campaigns"
                    categoriesResult.isFailure -> categoriesResult.exceptionOrNull()?.message ?: "Failed to load categories"
                    else -> "An unknown error occurred"
                }
                uiState = HomeFeedUiState.Error(errorMsg)
            }
        }
    }
}
