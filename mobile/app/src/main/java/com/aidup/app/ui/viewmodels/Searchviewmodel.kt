package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.network.RetrofitClient
import com.aidup.app.network.TokenManager
import com.aidup.app.models.search.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch


class SearchViewModel : ViewModel() {

    var donators by mutableStateOf<List<DonatorSearchResult>>(emptyList())
        private set

    var organizers by mutableStateOf<List<OrganizerSearchResult>>(emptyList())
        private set

    var isLoadingDonators by mutableStateOf(false)
        private set

    var isLoadingOrganizers by mutableStateOf(false)
        private set

    // Profile photo from TokenManager for the top bar avatar
    val profilePhotoUrl: String? get() = null // pulled from TokenManager if needed

    private var donatorJob: Job? = null
    private var organizerJob: Job? = null

    fun searchDonators(query: String) {
        donatorJob?.cancel()
        donatorJob = viewModelScope.launch {
            delay(300) // debounce
            isLoadingDonators = true
            try {
                val response = RetrofitClient.instance.getPublicDonators()
                if (response.isSuccessful) {
                    val all = response.body() ?: emptyList()
                    donators = all.filter {
                        (it.name?.contains(query, ignoreCase = true) == true) ||
                        (it.username?.contains(query, ignoreCase = true) == true) ||
                        (it.bio?.contains(query, ignoreCase = true) == true)
                    }
                }
            } catch (e: Exception) {
                donators = emptyList()
            } finally {
                isLoadingDonators = false
            }
        }
    }

    fun searchOrganizers(query: String) {
        organizerJob?.cancel()
        organizerJob = viewModelScope.launch {
            delay(300) // debounce
            isLoadingOrganizers = true
            try {
                val response = RetrofitClient.instance.getPublicOrganizers()
                if (response.isSuccessful) {
                    val all = response.body() ?: emptyList()
                    organizers = all.filter {
                        (it.name?.contains(query, ignoreCase = true) == true) ||
                        (it.username?.contains(query, ignoreCase = true) == true) ||
                        (it.bio?.contains(query, ignoreCase = true) == true) ||
                        (it.location?.contains(query, ignoreCase = true) == true)
                    }
                }
            } catch (e: Exception) {
                organizers = emptyList()
            } finally {
                isLoadingOrganizers = false
            }
        }
    }
}