package com.aidup.app.network

import com.aidup.app.repository.AuthRepository
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitClient {

    // 10.0.2.2 = localhost from Android emulator
    private const val BASE_URL = "http://10.0.2.2:5000/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    // 1. Plain client for auth/refresh calls to avoid infinite loops
    private val plainOkHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .build()

    // 2. Dedicated service and repository for auth/refresh logic
    private val authApiService = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(plainOkHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
        .create(ApiService::class.java)

    private val authRepository = AuthRepository(authApiService)

    // 3. Authenticated client for all other requests
    private val authInterceptor = okhttp3.Interceptor { chain ->
        val token = TokenManager.getToken()
        val request = chain.request().newBuilder()
            .apply {
                if (token != null) {
                    header("Authorization", "Bearer $token")
                }
            }
            .build()
        chain.proceed(request)
    }

    private val authenticatedOkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .authenticator(TokenAuthenticator(authRepository))
        .connectTimeout(90, TimeUnit.SECONDS)
        .readTimeout(90, TimeUnit.SECONDS)
        .writeTimeout(90, TimeUnit.SECONDS)
        .build()

    // Main instance for the app
    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(authenticatedOkHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    /**
     * Returns an AuthRepository that uses a plain (non-authenticating) client.
     * Ideal for login, register, and refresh activities.
     */
    fun getAuthRepository(): AuthRepository = authRepository
}
