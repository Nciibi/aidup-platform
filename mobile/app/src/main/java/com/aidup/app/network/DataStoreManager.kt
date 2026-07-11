package com.aidup.app.network

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "aidup_datastore")

class DataStoreManager(private val context: Context) {

    companion object {
        private val REJECTION_TIMESTAMP = longPreferencesKey("rejection_timestamp")
    }

    val rejectionTimestamp: Flow<Long?> = context.dataStore.data.map { preferences ->
        preferences[REJECTION_TIMESTAMP]
    }

    suspend fun saveRejectionTimestamp(timestamp: Long) {
        context.dataStore.edit { preferences ->
            preferences[REJECTION_TIMESTAMP] = timestamp
        }
    }

    suspend fun clearRejectionTimestamp() {
        context.dataStore.edit { preferences ->
            preferences.remove(REJECTION_TIMESTAMP)
        }
    }
}
