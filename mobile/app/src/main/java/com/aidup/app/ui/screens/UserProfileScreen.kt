package com.aidup.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.models.donation.Donation
import com.aidup.app.navigation.Screen
import com.aidup.app.network.TokenManager
import com.aidup.app.ui.components.AidUpTopBar
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.UserProfileViewModel
import com.aidup.app.utils.NetworkUtils

import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

// ─────────────────────────────────────────────────────────────────────────────
// Tab enum
// ─────────────────────────────────────────────────────────────────────────────
private enum class DonationTab { Approved, Pending, Rejected }

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun UserProfileScreen(
    navController: NavController,
    viewModel: UserProfileViewModel = viewModel(),
    isDarkMode: Boolean = false,
    onToggleDarkMode: () -> Unit = {}
) {
    val uiState = viewModel.uiState
    var selectedTab by remember { mutableStateOf(DonationTab.Approved) }
    val snackbarHostState = remember { SnackbarHostState() }
    var showDeleteDialog by remember { mutableStateOf(false) }



    val onLogout: () -> Unit = {
        TokenManager.clearAll()
        navController.navigate(Screen.Login.route) {
            popUpTo(0) { inclusive = true }
        }
    }

    // Delete account confirmation dialog
    if (showDeleteDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = {
                Text(
                    "Delete Account",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)
                )
            },
            text = {
                Text(
                    "This action is permanent and cannot be undone. All your data will be erased.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showDeleteDialog = false
                    // TODO: call delete account API then logout
                    onLogout()
                }) {
                    Text("Delete", color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("Cancel")
                }
            },
            containerColor = MaterialTheme.colorScheme.surfaceContainerLowest,
            shape = RoundedCornerShape(20.dp)
        )
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        if (uiState.isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
            ) {

                // ── Top bar ───────────────────────────────────────────────
                AidUpTopBar(
                    isDarkMode = isDarkMode,
                    onToggleDarkMode = onToggleDarkMode,
                    onQrClick = { navController.navigate(Screen.QRLogin.route) }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // ── Profile header ────────────────────────────────────────
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box {
                        Surface(
                            shape = CircleShape,
                            modifier = Modifier.size(96.dp),
                            border = BorderStroke(4.dp, MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.2f))
                        ) {
                            AsyncImage(
                                model = NetworkUtils.getFullImageUrl(if (uiState.userRole == "organizer") uiState.organizerData?.photo
                                    else uiState.profileData?.photo
                                    ?: "https://www.w3schools.com/howto/img_avatar.png"),
                                contentDescription = if (uiState.userRole == "organizer") uiState.organizerData?.name else uiState.profileData?.name,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        if (uiState.userRole == "organizer") uiState.organizerData?.name ?: "Guest Organizer"
                        else uiState.profileData?.name ?: "Guest User",
                        style = MaterialTheme.typography.headlineMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    val username = if (uiState.userRole == "organizer") uiState.organizerData?.username else uiState.profileData?.username
                    username?.let {
                        Text(
                            "@$it",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    val isVerified = if (uiState.userRole == "organizer") {
                        uiState.organizerData?.isVerified == true
                    } else {
                        true // Existing donators seem to be assumed verified in UI
                    }

                    if (isVerified) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Verified,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                "VERIFIED ${uiState.userRole.uppercase()}",
                                style = MaterialTheme.typography.labelMedium.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    letterSpacing = 1.sp,
                                    color = MaterialTheme.colorScheme.secondary
                                )
                            )
                        }
                    }
                    val bio = if (uiState.userRole == "organizer") uiState.organizerData?.bio else uiState.profileData?.bio
                    bio?.let {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            it,
                            style = MaterialTheme.typography.bodySmall,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(horizontal = 48.dp),
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    if (uiState.userRole == "organizer") {
                        uiState.organizerData?.let { org ->
                            org.location?.let {
                                ProfileInfoRow(Icons.Default.LocationOn, it)
                            }
                            org.website?.let {
                                ProfileInfoRow(Icons.Default.Language, it)
                            }
                            org.contactemail?.let {
                                ProfileInfoRow(Icons.Default.Email, it)
                            }
                            org.phoneNumber?.let {
                                ProfileInfoRow(Icons.Default.Phone, it)
                            }
                        }
                    }
                }

                if (uiState.userRole == "donator") {
                    Spacer(modifier = Modifier.height(28.dp))

                    // ── Stats grid ────────────────────────────────────────────
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        ProfileStatCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Default.Payments,
                            tint = MaterialTheme.colorScheme.primary,
                            label = "Total Donated",
                            value = "$${String.format("%.0f", uiState.totalDonated)}"
                        )
                        ProfileStatCard(
                            modifier = Modifier.weight(1f),
                            icon = Icons.Default.Campaign,
                            tint = MaterialTheme.colorScheme.tertiary,
                            label = "Campaigns Supported",
                            value = uiState.campaignsSupported.toString()
                        )
                    }

                    Spacer(modifier = Modifier.height(36.dp))

                    // ── Impact History ────────────────────────────────────────
                    Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                        Text(
                            "Impact History",
                            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(14.dp))

                        // Tab switcher
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceContainerLow,
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(modifier = Modifier.padding(4.dp)) {
                                DonationTab.values().forEach { tab ->
                                    val isSelected = tab == selectedTab
                                    Surface(
                                        modifier = Modifier.weight(1f),
                                        color = if (isSelected) MaterialTheme.colorScheme.surfaceContainerLowest else Color.Transparent,
                                        shape = RoundedCornerShape(10.dp),
                                        shadowElevation = if (isSelected) 1.dp else 0.dp,
                                        onClick = { selectedTab = tab }
                                    ) {
                                        Text(
                                            tab.name,
                                            modifier = Modifier.padding(vertical = 10.dp),
                                            style = MaterialTheme.typography.labelLarge.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                            ),
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // Use separate lists instead of filtering a single list
                        val filteredDonations = when (selectedTab) {
                            DonationTab.Approved -> uiState.approvedDonations
                            DonationTab.Pending  -> uiState.pendingDonations
                            DonationTab.Rejected -> uiState.rejectedDonations
                        }

                        if (filteredDonations.isEmpty()) {
                            Box(
                                modifier = Modifier.fillMaxWidth().padding(vertical = 32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    "No ${selectedTab.name.lowercase()} donations",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        } else {
                            filteredDonations.forEach { donation ->
                                DonationHistoryCard(donation = donation, tab = selectedTab)
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(36.dp))
                }

                // ── Account Settings ──────────────────────────────────────
                Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                    Text(
                        "Account Settings",
                        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Spacer(modifier = Modifier.height(14.dp))

                    Surface(
                        color = MaterialTheme.colorScheme.surfaceContainerLow,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column {
                            SettingsRow(
                                icon = Icons.Default.Person,
                                label = "Edit Profile",
                                onClick = { navController.navigate(Screen.EditProfile.route) }
                            )
                            SettingsDivider()
                            SettingsRow(
                                icon = Icons.Default.Security,
                                label = "Security",
                                onClick = { /* TODO */ }
                            )
                            SettingsDivider()
                            SettingsRow(
                                icon = Icons.AutoMirrored.Filled.Help,
                                label = "Help & Support",
                                onClick = { /* TODO */ }
                            )
                            SettingsDivider()
                            SettingsRow(
                                icon = Icons.Default.DeleteOutline,
                                label = "Delete Account",
                                tint = MaterialTheme.colorScheme.error,
                                isDestructive = true,
                                showChevron = false,
                                onClick = { showDeleteDialog = true }
                            )
                            SettingsDivider()
                            SettingsRow(
                                icon = Icons.AutoMirrored.Filled.Logout,
                                label = "Sign Out",
                                tint = MaterialTheme.colorScheme.error,
                                isDestructive = true,
                                showChevron = false,
                                onClick = onLogout
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun ProfileStatCard(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    tint: Color,
    label: String,
    value: String
) {
    Surface(
        modifier = modifier,
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        shape = RoundedCornerShape(16.dp),
        shadowElevation = 1.dp
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Icon(icon, contentDescription = null, tint = tint, modifier = Modifier.size(28.dp))
            Text(
                label,
                style = MaterialTheme.typography.labelMedium.copy(
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
            Text(
                value,
                style = MaterialTheme.typography.headlineSmall.copy(
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Donation history card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun DonationHistoryCard(donation: Donation, tab: DonationTab) {
    val iconBg = when (tab) {
        DonationTab.Approved -> MaterialTheme.colorScheme.secondaryContainer
        DonationTab.Pending  -> MaterialTheme.colorScheme.tertiaryContainer
        DonationTab.Rejected -> MaterialTheme.colorScheme.errorContainer
    }
    val statusColor = when (tab) {
        DonationTab.Approved -> MaterialTheme.colorScheme.secondary
        DonationTab.Pending  -> MaterialTheme.colorScheme.tertiary
        DonationTab.Rejected -> MaterialTheme.colorScheme.error
    }
    val statusBg = when (tab) {
        DonationTab.Approved -> MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
        DonationTab.Pending  -> MaterialTheme.colorScheme.tertiaryContainer.copy(alpha = 0.4f)
        DonationTab.Rejected -> MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)
    }
    val icon = when (tab) {
        DonationTab.Approved -> Icons.Default.CheckCircle
        DonationTab.Pending  -> Icons.Default.Schedule
        DonationTab.Rejected -> Icons.Default.Cancel
    }

    Surface(
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        shape = RoundedCornerShape(16.dp),
        shadowElevation = 1.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Surface(
                    color = iconBg,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.size(48.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            icon,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Campaign: ${donation.campaign_id.title}",
                        style = MaterialTheme.typography.titleSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        ),
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                    )
                    Text(
                        donation.submittedDate?.substringBefore("T") ?: "Recent",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "$${donation.amount}",
                    style = MaterialTheme.typography.titleSmall.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )
                Spacer(modifier = Modifier.height(4.dp))
                Surface(
                    color = statusBg,
                    shape = RoundedCornerShape(full)
                ) {
                    Text(
                        donation.status.uppercase(),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 10.sp,
                            color = statusColor
                        )
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings row
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SettingsRow(
    icon: ImageVector,
    label: String,
    tint: Color = Color.Unspecified, // Default to unspecified to use onSurface
    isDestructive: Boolean = false,
    showChevron: Boolean = true,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                icon,
                contentDescription = null,
                tint = if (isDestructive) tint else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                label,
                style = MaterialTheme.typography.titleSmall.copy(
                    fontWeight = FontWeight.Medium,
                    color = if (isDestructive) tint else MaterialTheme.colorScheme.onSurface
                )
            )
        }
        if (showChevron) {
            Icon(
                Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.outlineVariant,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun ProfileInfoRow(icon: ImageVector, text: String) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(top = 8.dp)
    ) {
        Icon(
            icon,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(16.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun SettingsDivider() {
    HorizontalDivider(
        color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.15f),
        modifier = Modifier.padding(horizontal = 16.dp)
    )
} 