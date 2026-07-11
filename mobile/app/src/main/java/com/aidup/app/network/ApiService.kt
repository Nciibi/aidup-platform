package com.aidup.app.network

import com.aidup.app.models.auth.*
import com.aidup.app.models.campaign.*
import com.aidup.app.models.donation.*
import com.aidup.app.models.profile.DonatorProfileResponse
import com.aidup.app.models.search.*
import com.aidup.app.models.organizer.*
import com.aidup.app.ui.viewmodels.DashboardApiResponse
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ========================
    // Auth Routes
    // ========================

    // Backend: register() reads name, email, password, role, phoneNumber from req.body
    // photo comes from req.uploadedFile (multipart middleware), not req.body
    @Multipart
    @POST("auth/register")
    suspend fun register(
            @Part("name") name: RequestBody,
            @Part("email") email: RequestBody,
            @Part("password") password: RequestBody,
            @Part("role") role: RequestBody,
            @Part("phoneNumber") phoneNumber: RequestBody? = null,
            @Part photo: MultipartBody.Part? = null
    ): Response<AuthResponse>

    // Backend: login() reads email, password, role from req.body
    // Response: { success, message, accessToken, tokenType, expiresIn, userinfo }
    @POST("auth/login") suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    // Backend: logout() clears the refresh token cookie
    // Response: { message: "Cookie cleared" }
    @POST("auth/logout") suspend fun logout(): Response<ApiResponse>

    // Backend: googleLogin() reads credential, role from req.body
    // Response: { success, message, accessToken, tokenType, expiresIn, userinfo }
    @POST("auth/google-login")
    suspend fun googleLogin(@Body request: GoogleLoginRequest): Response<AuthResponse>

    // Backend: verifyEmailCode() reads email, code from req.body
    // Response: { success, message, accessToken, tokenType, expiresIn, userinfo }
    @POST("auth/verify-registration-email")
    suspend fun verifyEmail(@Body request: VerifyEmailRequest): Response<AuthResponse>

    // Backend: GET refresh/refresh — token sent via x-refresh-token header
    // Backend reads: req.headers['x-refresh-token'] || req.body?.refreshToken || cookies?.jwt
    // Response: { success, accessToken, refreshToken }
    @GET("refresh/refresh")
    suspend fun refresh(@Header("x-refresh-token") refreshToken: String): Response<AuthResponse>

    // ========================
    // QR Login Routes
    // ========================

    // Backend: createQrSession() — no body needed
    // Response: { success, sessionId, qrUrl, expiresAt }
    @POST("auth/qr/create") suspend fun createQrSession(): Response<QrSessionResponse>

    // Backend: scanQrSession() reads sessionId from req.params
    // Response: { success, message, sessionId }
    @GET("auth/qr/scan/{sessionId}")
    suspend fun scanQrSession(@Path("sessionId") sessionId: String): Response<ApiResponse>

    // Backend: approveQrLogin() reads sessionId from req.body, userId from JWT middleware
    // Response: { success, message }
    @POST("auth/qr/approve")
    suspend fun approveQrSession(@Body request: QrApproveRequest): Response<ApiResponse>

    // ========================
    // Public Campaigns (no auth required)
    // ========================

    // Backend: getAllpublicCampains() — returns array of campaigns directly (not wrapped)
    // Response: Campaign[]  →  use CampaignListResponse which wraps the array
    @GET("publicca/all") suspend fun getPublicCampaigns(): Response<List<Campaign>>

    // Backend: getpublicCampainById() — returns { ...campaign, uniqueDonors, campainDonation }
    @GET("publicca/one/{id}")
    suspend fun getPublicCampaignById(
            @Path("id") id: String
    ): Response<com.aidup.app.models.campaign.CampaignDetailResponse>

    @GET("publicdo/all") suspend fun getPublicDonators(): Response<List<DonatorSearchResult>>

    @GET("publicor/all") suspend fun getPublicOrganizers(): Response<List<OrganizerSearchResult>>

    // ========================
    // Organizer Routes (requires auth + verified organizer)
    // ========================

    // Backend: getAllCampainsByOrganizer() — organizer_id comes from JWT middleware (req.userId)
    // Response: Campaign[]
    @GET("organizor/readcampains/all") suspend fun getOrganizerCampaigns(): Response<List<Campaign>>

    // Backend: getOrganizerDashboard() — organizer dashboard data
    @GET("organizor/dashboard")
    suspend fun getOrganizerDashboard():
            Response<DashboardApiResponse>

    // Backend: getOrganizerSituation() — check verification status
    @GET("organizor/organizerSituation")
    suspend fun getOrganizerSituation(): Response<OrganizerSituationResponse>

    // Backend: getOrganizor() — get organizer account details
    @GET("organizor/getaccount")
    suspend fun getOrganizerProfile(): Response<OrganizerData>

    // Backend: submitVerification() — submit verification documents
    @Multipart
    @POST("organizor/submitVerification")
    suspend fun submitVerification(
        @Part("name") name: RequestBody,
        @Part("phone") phone: RequestBody,
        @Part images: List<MultipartBody.Part>
    ): retrofit2.Response<Any>

    // ========================
    // Donator Account Routes (requires auth)
    // ========================

    // Backend: getonepublicdonator() reads id from req.params
    // Response: { donator: {...}, donations: [...] }
    @GET("donator/getaccount") suspend fun getDonatorProfile(): Response<DonatorProfileResponse>

    // Backend: updateDonatorProfile — field names from req.body: name, phone, preferences
    // photo comes from req.uploadedFile (multipart middleware)
    // NOTE: current backend in donatorController only exposes public read — check your
    // actual route file for the edit endpoint field names. Keeping as-is based on existing code.
    @Multipart
    @POST("donator/editaccount")
    suspend fun updateDonatorProfile(
        @Part name: MultipartBody.Part? = null,
        @Part username: MultipartBody.Part? = null,
        @Part bio: MultipartBody.Part? = null,
        @Part email: MultipartBody.Part? = null,
        @Part phoneNumber: MultipartBody.Part? = null,
        @Part photo: MultipartBody.Part? = null
    ): Response<DonatorProfileResponse>

    // Backend: updateOrganizor — field names from req.body: name, username, bio, location, website, phone_number, email, contactemail
    // photo comes from req.uploadedFile (mapped from 'images' or 'evidance' in route)
    @Multipart
    @POST("organizor/editaccount")
    suspend fun updateOrganizerProfile(
        @Part name: MultipartBody.Part? = null,
        @Part username: MultipartBody.Part? = null,
        @Part bio: MultipartBody.Part? = null,
        @Part location: MultipartBody.Part? = null,
        @Part website: MultipartBody.Part? = null,
        @Part phone_number: MultipartBody.Part? = null,
        @Part email: MultipartBody.Part? = null,
        @Part contactemail: MultipartBody.Part? = null,
        @Part images: MultipartBody.Part? = null // Mapped to req.file in backend
    ): Response<com.aidup.app.models.organizer.OrganizerProfileResponse>

    // ========================
    // Donation History Routes (requires auth)
    // ========================

    // Backend: getAllDonationsByDonator() — donator_id comes from JWT (req.userId),
    // Response: { success, message, data: Donation[] }
    @GET("donator/readdonaions/all")
    suspend fun getDonationHistory(): Response<DonationListResponse>

    // Backend: getDonationHistoryByStatus() — status is "approved" | "pending" | "rejected"
    // Response: { success, message, data: Donation[] }
    @GET("donator/readdonaions/all/{status}")
    suspend fun getDonationHistoryByStatus(
            @Path("status") status: String
    ): Response<DonationListResponse>

    // ========================
    // Create Donation (requires auth)
    // ========================

    // Backend: createDonation() reads from req.body:
    //   campaign_id, donator_id, evidance (not "evidence"), amount, paiment_method (array)
    // evidance = the proof images — sent as multipart file parts
    // paiment_method = stringified JSON array passed as a text part
    // Response: { success, message, data: Donation }
    @Multipart
    @POST("donation/createDonation")
    suspend fun createDonation(
            @Part("campaign_id") campaignId: RequestBody,
            @Part("donator_id") donatorId: RequestBody,
            @Part("paiment_method") paymentMethodsJson: RequestBody,
            @Part("description") description: RequestBody? = null,
            @Part evidance: List<MultipartBody.Part>
    ): Response<ApiResponse>

    // Backend: addCampain() reads multipart text fields from req.body and expects files in req.files
    @Multipart
    @POST("campain/managecampain/add")
    suspend fun createCampaign(
        @Part("title") title: RequestBody,
        @Part("description") description: RequestBody,
        @Part("story") story: RequestBody,
        @Part("category") categoryId: RequestBody,
        @Part("goal_amount") goalAmount: RequestBody,
        @Part("goal_date") goalDate: RequestBody,
        @Part("goal") goalsJson: RequestBody,
        @Part("paiment_methods") paymentMethodsJson: RequestBody,
        @Part("organizer_id") organizerId: RequestBody,
        @Part("banner") bannerUrl: RequestBody, // the backend currently needs this in req.body
        @Part("images") imagesUrlJson: RequestBody, // placeholder for req.body.images check
        @Part("videos") videosUrlJson: RequestBody, // placeholder for req.body.videos check
        @Part images: List<MultipartBody.Part>
    ): Response<ApiResponse>

    // Backend: GET /category/getall
    @GET("category/getall") suspend fun getCategories(): Response<List<Category>>
}
