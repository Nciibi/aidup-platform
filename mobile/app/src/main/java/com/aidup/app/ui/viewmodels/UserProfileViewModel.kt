package com.aidup.app.ui.viewmodels

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aidup.app.models.donation.Donation
import com.aidup.app.models.profile.DonatorData
import com.aidup.app.models.profile.DonatorProfileResponse
import com.aidup.app.repository.ProfileRepository
import com.aidup.app.repository.DonationRepository
import com.aidup.app.network.RetrofitClient
import kotlinx.coroutines.launch
import okhttp3.MultipartBody

data class UserProfileUiState(
    val isLoading: Boolean = false,
    val profileData: DonatorData? = null,
    val organizerData: com.aidup.app.models.organizer.OrganizerData? = null,
    val approvedDonations: List<Donation> = emptyList(),
    val pendingDonations: List<Donation> = emptyList(),
    val rejectedDonations: List<Donation> = emptyList(),
    val errorMessage: String? = null,
    val totalDonated: Double = 0.0,
    val campaignsSupported: Int = 0,
    val userRole: String = "donator"
)

class UserProfileViewModel(
    private val profileRepository: ProfileRepository = ProfileRepository(),
    private val donationRepository: DonationRepository = DonationRepository(RetrofitClient.instance)
) : ViewModel() {

    var uiState by mutableStateOf(UserProfileUiState())
        private set

    init {
        loadProfileData()
    }

    fun loadProfileData() {
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true, errorMessage = null)
            val role = com.aidup.app.network.TokenManager.getUserRole()?.lowercase() ?: "donator"
            uiState = uiState.copy(userRole = role)

            if (role == "organizer") {
                android.util.Log.d("ProfileVM", "Fetching Organizer Profile...")
                val orgResult = profileRepository.getOrganizerProfile()
                orgResult.onSuccess { orgData ->
                    android.util.Log.d("ProfileVM", "Organizer Profile Success: ${orgData.name}, verified=${orgData.isVerified}")
                    uiState = uiState.copy(
                        organizerData = orgData,
                        totalDonated = 0.0,
                        campaignsSupported = 0
                    )
                }.onFailure { e ->
                    android.util.Log.e("ProfileVM", "Organizer Profile Error: ${e.message}")
                    uiState = uiState.copy(errorMessage = e.message)
                }
            } else {
                android.util.Log.d("ProfileVM", "Fetching Donator Profile...")
                val profileResult = profileRepository.getDonatorProfile()
                profileResult.onSuccess { profileResp ->
                    android.util.Log.d("ProfileVM", "Donator Profile Success: ${profileResp.donator?.name}")
                    val donatorData = profileResp.donator
                    val totalVal = profileResp.totalAmount?.firstOrNull()?.total_amount ?: 0.0
                    val countVal = profileResp.count ?: 0
                    
                    uiState = uiState.copy(
                        profileData = donatorData,
                        totalDonated = totalVal,
                        campaignsSupported = countVal
                    )
                }.onFailure { e ->
                    android.util.Log.e("ProfileVM", "Donator Profile Error: ${e.message}")
                    uiState = uiState.copy(errorMessage = e.message)
                }
            }
            
            // 2. Fetch Donation History (only if donator?) 
            // Actually organizers see campaigns, not personal donations.
            // But the user said "keep the same functions of the bottom 5 buttons like it is for the donator"
            // and the 5 buttons are in the account settings.
            
            if (role == "donator") {
                val approvedResult = donationRepository.getDonationHistory("approved")
                val pendingResult  = donationRepository.getDonationHistory("pending")
                val rejectedResult = donationRepository.getDonationHistory("rejected")

                approvedResult.onSuccess { list ->
                    uiState = uiState.copy(approvedDonations = list)
                }
                pendingResult.onSuccess { list ->
                    uiState = uiState.copy(pendingDonations = list)
                }
                rejectedResult.onSuccess { list ->
                    uiState = uiState.copy(rejectedDonations = list)
                }
            }
            
            uiState = uiState.copy(isLoading = false)
        }
    }

    fun updateProfile(
        name: String? = null,
        username: String? = null,
        bio: String? = null,
        email: String? = null,
        phoneNumber: String? = null,
        location: String? = null,
        website: String? = null,
        contactEmail: String? = null,
        imagePart: MultipartBody.Part? = null,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            uiState = uiState.copy(isLoading = true)
            val role = uiState.userRole
            
            val result = if (role == "organizer") {
                profileRepository.updateOrganizerProfile(
                    name = name,
                    username = username,
                    bio = bio,
                    location = location,
                    website = website,
                    phoneNumber = phoneNumber,
                    email = email,
                    contactEmail = contactEmail,
                    imagePart = imagePart
                ).map { it.organizer != null } // Check for presence of organizer data in success case
            } else {
                profileRepository.updateDonatorProfile(
                    name = name,
                    username = username,
                    bio = bio,
                    email = email,
                    phoneNumber = phoneNumber,
                    imagePart = imagePart
                ).map { it.donator != null }
            }

            result.onSuccess {
                loadProfileData()
                onSuccess()
            }.onFailure { e ->
                uiState = uiState.copy(isLoading = false, errorMessage = e.message)
                onError(e.message ?: "Unknown error")
            }
        }
    }
}
