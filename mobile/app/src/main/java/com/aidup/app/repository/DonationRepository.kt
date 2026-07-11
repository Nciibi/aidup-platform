package com.aidup.app.repository

import com.aidup.app.models.donation.Donation
import com.aidup.app.models.donation.PaymentMethod
import com.aidup.app.network.ApiService
import com.google.gson.Gson
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody

class DonationRepository(private val apiService: ApiService) {

    suspend fun submitDonationEvidence(
        campaignId:     String,
        donatorId:      String,
        paymentMethods: List<String>,
        description:    String?,
        evidenceImages: List<MultipartBody.Part>
    ): Result<Boolean> {
        return try {
            // Backend expects 'paiment_method' as a stringified JSON array
            val paymentMethodsJson = Gson().toJson(paymentMethods)

            val campaignIdPart    = campaignId.toRequestBody("text/plain".toMediaTypeOrNull())
            val donatorIdPart     = donatorId.toRequestBody("text/plain".toMediaTypeOrNull())
            val paymentMethodsPart = paymentMethodsJson.toRequestBody("application/json".toMediaTypeOrNull())
            val descriptionPart    = description?.toRequestBody("text/plain".toMediaTypeOrNull())

            val response = apiService.createDonation(
                campaignId         = campaignIdPart,
                donatorId          = donatorIdPart,
                paymentMethodsJson = paymentMethodsPart,
                description        = descriptionPart,
                evidance           = evidenceImages
            )

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(true)
            } else {
                val errorMessage = response.body()?.message ?: "Failed to submit donation"
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDonationHistory(status: String? = null): Result<List<Donation>> {
        return try {
            val response = if (status == null) {
                apiService.getDonationHistory()
            } else {
                apiService.getDonationHistoryByStatus(status)
            }

            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()?.data ?: emptyList())
            } else {
                Result.failure(Exception("Failed to load donation history"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
