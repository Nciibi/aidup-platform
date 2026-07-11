package com.aidup.app.repository

import com.aidup.app.models.campaign.Campaign
import com.aidup.app.network.ApiService
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody

class CampaignRepository(private val apiService: ApiService) {

    suspend fun getPublicCampaigns(): Result<List<Campaign>> {
        return try {
            val response = apiService.getPublicCampaigns()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load campaigns"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getPublicCampaignById(id: String): Result<com.aidup.app.models.campaign.CampaignDetailResponse> {
        return try {
            val response = apiService.getPublicCampaignById(id)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) }
                    ?: Result.failure(Exception("Campaign data is empty"))
            } else {
                Result.failure(Exception("Failed to load campaign details"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrganizerCampaigns(): Result<List<Campaign>> {
        return try {
            val response = apiService.getOrganizerCampaigns()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load your campaigns"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCategories(): Result<List<com.aidup.app.models.campaign.Category>> {
        return try {
            val response = apiService.getCategories()
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createCampaign(
        title: String,
        description: String,
        story: String,
        categoryId: String,
        goalAmount: Double,
        goalDate: String,
        goals: List<String>,
        paymentMethods: List<Map<String, String>>,
        organizerId: String,
        bannerUrl: String,
        galleryImages: List<okhttp3.MultipartBody.Part>
    ): Result<Boolean> {
        return try {
            val gson = com.google.gson.Gson()
            val textPlain = "text/plain".toMediaTypeOrNull()
            val appJson = "application/json".toMediaTypeOrNull()

            val titlePart = title.toRequestBody(textPlain)
            val descPart = description.toRequestBody(textPlain)
            val storyPart = story.toRequestBody(textPlain)
            val catPart = categoryId.toRequestBody(textPlain)
            val amountPart = goalAmount.toString().toRequestBody(textPlain)
            val datePart = goalDate.toRequestBody(textPlain)
            val orgPart = organizerId.toRequestBody(textPlain)
            val bannerPart = bannerUrl.toRequestBody(textPlain)

            val goalsJson = gson.toJson(goals).toRequestBody(appJson)
            val paymentsJson = gson.toJson(paymentMethods).toRequestBody(appJson)
            val imagesProxy = gson.toJson(listOf("uploaded_via_multipart")).toRequestBody(appJson)
            val videosProxy = gson.toJson(emptyList<String>()).toRequestBody(appJson)

            val response = apiService.createCampaign(
                title = titlePart,
                description = descPart,
                story = storyPart,
                categoryId = catPart,
                goalAmount = amountPart,
                goalDate = datePart,
                goalsJson = goalsJson,
                paymentMethodsJson = paymentsJson,
                organizerId = orgPart,
                bannerUrl = bannerPart,
                imagesUrlJson = imagesProxy,
                videosUrlJson = videosProxy,
                images = galleryImages
            )

            if (response.isSuccessful) {
                Result.success(true)
            } else {
                val errorMsg = response.message() ?: "Failed to create campaign"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
