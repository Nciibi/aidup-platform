package com.aidup.app.network

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Manages JWT token storage using EncryptedSharedPreferences. Call TokenManager.init(context) once
 * at app startup (in MainActivity or Application).
 */
object TokenManager {

    private const val PREFS_FILE = "aidup_secure_prefs"
    private const val KEY_ACCESS_TOKEN = "access_token"
    private const val KEY_REFRESH_TOKEN = "refresh_token"
    private const val KEY_USER_ID = "user_id"
    private const val KEY_USER_ROLE = "user_role"
    private const val KEY_USER_NAME = "user_name"
    private const val KEY_USER_EMAIL = "user_email"
    private const val KEY_USER_IS_VERIFIED = "user_is_verified"

    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        val masterKey =
                MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()

        prefs =
                EncryptedSharedPreferences.create(
                        context,
                        PREFS_FILE,
                        masterKey,
                        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
                )
    }

    fun saveToken(token: String) {
        prefs.edit().putString(KEY_ACCESS_TOKEN, token).apply()
        Log.d("TokenManager", "Access token saved")
    }
    fun getToken(): String? = prefs.getString(KEY_ACCESS_TOKEN, null)
    fun clearToken() = prefs.edit().remove(KEY_ACCESS_TOKEN).apply()

    fun saveRefreshToken(token: String) {
        prefs.edit().putString(KEY_REFRESH_TOKEN, token).apply()
        Log.d("TokenManager", "Refresh token saved")
    }
    fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH_TOKEN, null)
    fun clearRefreshToken() = prefs.edit().remove(KEY_REFRESH_TOKEN).apply()

    fun saveUser(
            id: String,
            role: String,
            name: String,
            email: String,
            isVerified: Boolean? = null
    ) {
        val editor =
                prefs.edit()
                        .putString(KEY_USER_ID, id)
                        .putString(KEY_USER_ROLE, role)
                        .putString(KEY_USER_NAME, name)
                        .putString(KEY_USER_EMAIL, email)

        if (isVerified != null) {
            editor.putBoolean(KEY_USER_IS_VERIFIED, isVerified) // Boolean storage
        } else {
            editor.remove(KEY_USER_IS_VERIFIED)
        }
        editor.apply()
        Log.d("TokenManager", "User saved: $role, $email, verified: $isVerified")
    }

    fun saveProfileInfo(name: String, role: String) {
        prefs.edit().putString(KEY_USER_NAME, name).putString(KEY_USER_ROLE, role).apply()
    }

    fun getUserId(): String? = prefs.getString(KEY_USER_ID, null)
    fun getUserRole(): String? = prefs.getString(KEY_USER_ROLE, null)
    fun getUserName(): String? = prefs.getString(KEY_USER_NAME, null)
    fun getUserEmail(): String? = prefs.getString(KEY_USER_EMAIL, null)
    fun isVerifiedOrganizer(): Boolean = prefs.getBoolean(KEY_USER_IS_VERIFIED, false) // Boolean storage

    fun clearAll() = prefs.edit().clear().apply()

    fun isLoggedIn(): Boolean = getToken() != null || getRefreshToken() != null
}
