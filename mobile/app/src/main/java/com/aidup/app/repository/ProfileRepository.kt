package com.aidup.app.repository

import com.aidup.app.models.donation.DonationListResponse
import com.aidup.app.models.profile.DonatorProfileResponse
import com.aidup.app.network.RetrofitClient
import com.aidup.app.network.ApiService
import com.aidup.app.network.TokenManager
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class ProfileRepository {
    private val apiService: ApiService = RetrofitClient.instance

    suspend fun getDonatorProfile(): Result<DonatorProfileResponse> {
        return try {
            val response = apiService.getDonatorProfile()
            if (response.isSuccessful && response.body()?.donator != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load profile: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrganizerProfile(): Result<com.aidup.app.models.organizer.OrganizerData> {
        return try {
            val response = apiService.getOrganizerProfile()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load organizer profile: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateDonatorProfile(
        name: String?,
        username: String?,
        bio: String?,
        email: String?,
        phoneNumber: String?,
        imagePart: MultipartBody.Part?
    ): Result<DonatorProfileResponse> {
        return try {
            val namePart     = name?.let { MultipartBody.Part.createFormData("name", it) }
            val usernamePart = username?.let { MultipartBody.Part.createFormData("username", it) }
            val bioPart      = bio?.let { MultipartBody.Part.createFormData("bio", it) }
            val emailPart    = email?.let { MultipartBody.Part.createFormData("email", it) }
            val phonePart    = phoneNumber?.let { MultipartBody.Part.createFormData("phoneNumber", it) }

            val response = apiService.updateDonatorProfile(
                name = namePart,
                username = usernamePart,
                bio = bioPart,
                email = emailPart,
                phoneNumber = phonePart,
                photo = imagePart
            )

            if (response.isSuccessful && response.body()?.donator != null) {
                // Update the local name if it was changed
                if (name != null) {
                    TokenManager.saveProfileInfo(name, TokenManager.getUserRole() ?: "Donator")
                }
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update profile: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateOrganizerProfile(
        name: String? = null,
        username: String? = null,
        bio: String? = null,
        location: String? = null,
        website: String? = null,
        phoneNumber: String? = null,
        email: String? = null,
        contactEmail: String? = null,
        imagePart: MultipartBody.Part? = null
    ): Result<com.aidup.app.models.organizer.OrganizerProfileResponse> {
        return try {
            val namePart         = name?.let { MultipartBody.Part.createFormData("name", it) }
            val usernamePart     = username?.let { MultipartBody.Part.createFormData("username", it) }
            val bioPart          = bio?.let { MultipartBody.Part.createFormData("bio", it) }
            val locationPart     = location?.let { MultipartBody.Part.createFormData("location", it) }
            val websitePart      = website?.let { MultipartBody.Part.createFormData("website", it) }
            val phonePart        = phoneNumber?.let { MultipartBody.Part.createFormData("phone_number", it) }
            val emailPart        = email?.let { MultipartBody.Part.createFormData("email", it) }
            val contactEmailPart = contactEmail?.let { MultipartBody.Part.createFormData("contactemail", it) }

            val response = apiService.updateOrganizerProfile(
                name = namePart,
                username = usernamePart,
                bio = bioPart,
                location = locationPart,
                website = websitePart,
                phone_number = phonePart,
                email = emailPart,
                contactemail = contactEmailPart,
                images = imagePart
            )

            if (response.isSuccessful) {
                if (name != null) {
                    TokenManager.saveProfileInfo(name, TokenManager.getUserRole() ?: "Organizer")
                }
                Result.success(response.body() ?: com.aidup.app.models.organizer.OrganizerProfileResponse(null))
            } else {
                Result.failure(Exception("Failed to update organizer profile: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDonationHistoryByStatus(status: String): Result<DonationListResponse> {
        return try {
            val response = apiService.getDonationHistoryByStatus(status)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch $status donations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
