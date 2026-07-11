package com.aidup.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.CampaignDetailsUiState
import com.aidup.app.ui.viewmodels.CampaignDetailsViewModel
import com.aidup.app.utils.NetworkUtils

@Composable
fun DetailsScreen(
    navController: NavController,
    itemId: String?,
    viewModel: CampaignDetailsViewModel = viewModel()
) {
    LaunchedEffect(itemId) {
        if (itemId != null) viewModel.loadCampaign(itemId)
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = { DetailsTopBar(navController) },
        bottomBar = { DetailsBottomBar(onDonateClick = {
            val userId = com.aidup.app.network.TokenManager.getUserId()
            if (userId != null && itemId != null) {
                navController.navigate(Screen.DonationEvidence.createRoute(itemId, userId))
            }
        }) }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(bottom = paddingValues.calculateBottomPadding())) {
            when (val uiState = viewModel.uiState) {
                is CampaignDetailsUiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                    }
                }
                is CampaignDetailsUiState.Error -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(uiState.message, color = MaterialTheme.colorScheme.error)
                    }
                }
                is CampaignDetailsUiState.Success -> {
                    val campaign = uiState.campaign
                    val daysLeft = uiState.daysLeft
                    val categoryName = campaign.category?.name ?: "Other"

                    val raised = campaign.campainDonation?.donated_amount ?: 0.0
                    val goal = campaign.goal_amount
                    val progress = if (goal > 0) (raised / goal).toFloat().coerceIn(0f, 1f) else 0f
                    val percent = (progress * 100).toInt()
                    val donorsCount = campaign.count
                    val donations = campaign.campainDonation?.donations

                    LazyColumn(modifier = Modifier.fillMaxSize()) {

                        // ── Hero banner image ─────────────────────────────
                        item {
                            Box(modifier = Modifier.fillMaxWidth().height(400.dp)) {
                                AsyncImage(
                                    model = NetworkUtils.getFullImageUrl(campaign.banner ?: campaign.images?.firstOrNull()),
                                    contentDescription = campaign.title,
                                    modifier = Modifier.fillMaxSize(),
                                    contentScale = ContentScale.Crop
                                )
                                // Gradient overlay — fades to background at bottom
                                Box(
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .background(
                                            Brush.verticalGradient(
                                                colorStops = arrayOf(
                                                    0.0f to Color.Transparent,
                                                    0.55f to MaterialTheme.colorScheme.background.copy(alpha = 0.2f),
                                                    1.0f to MaterialTheme.colorScheme.background
                                                )
                                            )
                                        )
                                )
                                // Category badge + title at bottom of hero
                                Column(
                                    modifier = Modifier
                                        .align(Alignment.BottomStart)
                                        .padding(start = 24.dp, end = 24.dp, bottom = 32.dp)
                                ) {
                                    Surface(
                                        color = MaterialTheme.colorScheme.primary,
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            categoryName.uppercase(),
                                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                            style = MaterialTheme.typography.labelSmall.copy(
                                                fontWeight = FontWeight.ExtraBold,
                                                letterSpacing = 1.sp
                                            ),
                                            color = MaterialTheme.colorScheme.onPrimary
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text(
                                        campaign.title ?: "Untitled Campaign",
                                        style = MaterialTheme.typography.displaySmall.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            lineHeight = 40.sp,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                    )
                                }
                            }
                        }

                        // ── Progress card ─────────────────────────────────
                        item {
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 24.dp)
                                    .offset(y = (-8).dp),
                                shape = RoundedCornerShape(28.dp),
                                color = MaterialTheme.colorScheme.surfaceContainerLowest,
                                shadowElevation = 4.dp
                            ) {
                                Column(modifier = Modifier.padding(24.dp)) {
                                    // Raised + percent
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.Bottom
                                    ) {
                                        Column {
                                            Text(
                                                "Raised so far",
                                                style = MaterialTheme.typography.labelMedium,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Row(verticalAlignment = Alignment.Bottom) {
                                                Text(
                                                    "$${raised.toInt()}",
                                                    style = MaterialTheme.typography.headlineSmall.copy(
                                                        fontWeight = FontWeight.Bold,
                                                        color = MaterialTheme.colorScheme.primary
                                                    )
                                                )
                                                Spacer(modifier = Modifier.width(6.dp))
                                                Text(
                                                    "of $${goal.toInt()} goal",
                                                    style = MaterialTheme.typography.bodySmall.copy(
                                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                                    ),
                                                    modifier = Modifier.padding(bottom = 2.dp)
                                                )
                                            }
                                        }
                                        Text(
                                            "$percent%",
                                            style = MaterialTheme.typography.titleLarge.copy(
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.secondary
                                            )
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Progress bar
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(10.dp)
                                            .clip(RoundedCornerShape(full))
                                            .background(MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f))
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth(progress)
                                                .fillMaxHeight()
                                                .clip(RoundedCornerShape(full))
                                                .background(MaterialTheme.colorScheme.secondary)
                                        )
                                    }

                                    Spacer(modifier = Modifier.height(20.dp))
                                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.15f))
                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Stats — label ON TOP, value BELOW (as requested)
                                    Row(modifier = Modifier.fillMaxWidth()) {
                                        StatColumn(
                                            label = "DONORS",
                                            value = donorsCount.toString(),
                                            modifier = Modifier.weight(1f)
                                        )
                                        Box(modifier = Modifier.width(1.dp).height(40.dp).background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.15f)).align(Alignment.CenterVertically))
                                        StatColumn(
                                            label = "DAYS LEFT",
                                            value = if (daysLeft > 0) daysLeft.toString() else "0",
                                            modifier = Modifier.weight(1f)
                                        )
                                        Box(modifier = Modifier.width(1.dp).height(40.dp).background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.15f)).align(Alignment.CenterVertically))
                                        StatColumn(
                                            label = "IMPACT",
                                            value = if (donorsCount > 0) "${donorsCount}+" else "—",
                                            modifier = Modifier.weight(1f)
                                        )
                                    }
                                }
                            }
                        }

                        // ── Organizer chip ────────────────────────────────
                        item {
                            Spacer(modifier = Modifier.height(16.dp))
                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 24.dp),
                                shape = RoundedCornerShape(20.dp),
                                color = MaterialTheme.colorScheme.surfaceContainerLow
                            ) {
                                Row(
                                    modifier = Modifier.padding(16.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        // Organizer avatar
                                        Box {
                                            Surface(
                                                modifier = Modifier.size(48.dp),
                                                shape = RoundedCornerShape(12.dp),
                                                color = MaterialTheme.colorScheme.surfaceContainerHighest
                                            ) {
                                                val photoUrl = NetworkUtils.getFullImageUrl(campaign.organizer_id?.photo)
                                                if (photoUrl != null) {
                                                    AsyncImage(
                                                        model = photoUrl,
                                                        contentDescription = null,
                                                        contentScale = ContentScale.Crop,
                                                        modifier = Modifier.fillMaxSize()
                                                    )
                                                }
                                            }
                                            Icon(
                                                Icons.Default.Verified,
                                                contentDescription = null,
                                                tint = MaterialTheme.colorScheme.primary,
                                                modifier = Modifier
                                                    .align(Alignment.BottomEnd)
                                                    .size(16.dp)
                                                    .background(MaterialTheme.colorScheme.surfaceContainerLow, CircleShape)
                                            )
                                        }
                                        Spacer(modifier = Modifier.width(14.dp))
                                        Column {
                                            Text(
                                                campaign.organizer_id?.username ?: "Unknown Organizer",
                                                style = MaterialTheme.typography.titleSmall.copy(
                                                    fontWeight = FontWeight.Bold
                                                ),
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                            Row(verticalAlignment = Alignment.CenterVertically) {
                                                Icon(
                                                    Icons.Default.Verified,
                                                    contentDescription = null,
                                                    tint = MaterialTheme.colorScheme.primary,
                                                    modifier = Modifier.size(12.dp)
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    "Verified Organizer",
                                                    style = MaterialTheme.typography.labelSmall,
                                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                                )
                                            }
                                        }
                                    }
                                    TextButton(onClick = {}) {
                                        Text(
                                            "Contact",
                                            style = MaterialTheme.typography.labelLarge.copy(
                                                fontWeight = FontWeight.SemiBold,
                                                color = MaterialTheme.colorScheme.primary
                                            )
                                        )
                                    }
                                }
                            }
                        }

                        // ── The Story ─────────────────────────────────────
                        item {
                            Spacer(modifier = Modifier.height(32.dp))
                            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                                Text(
                                    "The Story",
                                    style = MaterialTheme.typography.headlineSmall.copy(
                                        fontWeight = FontWeight.ExtraBold
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(16.dp))
                                Text(
                                    (campaign.story ?: campaign.description ?: "No story available."),
                                    style = MaterialTheme.typography.bodyLarge.copy(
                                        lineHeight = 28.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                )

                                // Extra images (under the story)
                                val extraImages = campaign.images
                                if (!extraImages.isNullOrEmpty()) {
                                    Spacer(modifier = Modifier.height(20.dp))
                                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                        extraImages.chunked(2).forEach { rowImages ->
                                            Row(
                                                modifier = Modifier.fillMaxWidth(),
                                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                                            ) {
                                                rowImages.forEach { imageUrl ->
                                                    AsyncImage(
                                                        model = NetworkUtils.getFullImageUrl(imageUrl),
                                                        contentDescription = null,
                                                        contentScale = ContentScale.Crop,
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .aspectRatio(16f / 9f)
                                                            .clip(RoundedCornerShape(16.dp))
                                                    )
                                                }
                                                if (rowImages.size == 1) {
                                                    Spacer(modifier = Modifier.weight(1f))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // ── Goals / Direct Impact Breakdown ───────────────
                        item {
                            Spacer(modifier = Modifier.height(32.dp))
                            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                                Text(
                                    "Direct Impact Breakdown",
                                    style = MaterialTheme.typography.titleLarge.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Spacer(modifier = Modifier.height(16.dp))

                                val goals = campaign.goal
                                if (goals.isNullOrEmpty()) {
                                    Text(
                                        "Goals will be listed here.",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                } else {
                                    goals.forEach { goal ->
                                        GoalItem(text = goal)
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }
                                }
                            }
                        }

                        // ── Top Donors ────────────────────────────────────
                        item {
                            Spacer(modifier = Modifier.height(32.dp))
                            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "Top Donors",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.Bold
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        "VIEW ALL",
                                        style = MaterialTheme.typography.labelSmall.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            letterSpacing = 1.sp,
                                            color = MaterialTheme.colorScheme.primary
                                        ),
                                        modifier = Modifier.clickable { }
                                    )
                                }
                                Spacer(modifier = Modifier.height(16.dp))

                                if (donations.isNullOrEmpty()) {
                                    Text(
                                        "No donors yet. Be the first!",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                } else {
                                    donations.forEach { donation ->
                                        DonorRow(
                                            name = donation.donator_id?.username,
                                            photo = donation.donator_id?.photo,
                                            amount = "$${donation.amount.toInt()}",
                                            time = formatDonationTime(donation.submitted_date)
                                        )
                                        Spacer(modifier = Modifier.height(16.dp))
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // ── Donation Methods ─────────────────────────────
                                val paymentMethods = campaign.paiment_methods
                                if (!paymentMethods.isNullOrEmpty()) {
                                    Spacer(modifier = Modifier.height(32.dp))
                                    Text(
                                        "Donation Methods",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.Bold
                                        ),
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Spacer(modifier = Modifier.height(16.dp))
                                    paymentMethods.forEach { method ->
                                        PaymentMethodCard(method)
                                        Spacer(modifier = Modifier.height(12.dp))
                                    }
                                }

                                Spacer(modifier = Modifier.height(16.dp))

                                // Verified impact badge
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(16.dp),
                                    color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.3f)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(16.dp),
                                        verticalAlignment = Alignment.Top
                                    ) {
                                        Icon(
                                            Icons.Default.VerifiedUser,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary,
                                            modifier = Modifier.size(20.dp)
                                        )
                                        Spacer(modifier = Modifier.width(12.dp))
                                        Column {
                                            Text(
                                                "Verified Impact",
                                                style = MaterialTheme.typography.labelLarge.copy(
                                                    fontWeight = FontWeight.Bold
                                                ),
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                            Spacer(modifier = Modifier.height(2.dp))
                                            Text(
                                                "AidUp guarantees that 100% of these funds are deployed directly to the project partner.",
                                                style = MaterialTheme.typography.bodySmall.copy(
                                                    lineHeight = 18.sp
                                                ),
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(32.dp))
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat column — label on top, value below (as requested)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun StatColumn(label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            label,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 1.5.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            value,
            style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface
            )
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Goal item — green check circle + phrase
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun GoalItem(text: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Surface(
            modifier = Modifier.size(24.dp),
            shape = CircleShape,
            color = MaterialTheme.colorScheme.secondaryContainer
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.secondary,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Text(
            text,
            style = MaterialTheme.typography.bodyMedium.copy(
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                lineHeight = 22.sp
            ),
            modifier = Modifier.weight(1f)
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Donor row — photo, name, time, amount
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun DonorRow(name: String?, photo: String?, amount: String?, time: String?) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Avatar
        Surface(
            modifier = Modifier.size(48.dp),
            shape = CircleShape,
            color = MaterialTheme.colorScheme.surfaceContainerHighest
        ) {
            val photoUrl = NetworkUtils.getFullImageUrl(photo)
            if (photoUrl != null) {
                AsyncImage(
                    model = photoUrl,
                    contentDescription = name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Box(contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Person, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(24.dp))
                }
            }
        }
        Spacer(modifier = Modifier.width(14.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(
                name ?: "Anonymous",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                time ?: "Recently",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            amount ?: "$0",
            style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.secondary
            )
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Top bar
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun DetailsTopBar(navController: NavController) {
    Surface(
        color = MaterialTheme.colorScheme.background.copy(alpha = 0.85f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = MaterialTheme.colorScheme.onSurface
                    )
                }
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    "AidUp",
                    style = MaterialTheme.typography.titleLarge.copy(
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                )
            }
            Row {
                // Share button
                Surface(
                    modifier = Modifier.size(40.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    onClick = {}
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Share, contentDescription = "Share", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom bar — bookmark + donate now
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun DetailsBottomBar(onDonateClick: () -> Unit) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceContainerLowest.copy(alpha = 0.9f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Donate now button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        Brush.linearGradient(listOf(MaterialTheme.colorScheme.primaryContainer, MaterialTheme.colorScheme.primary))
                    )
                    .clickable { onDonateClick() },
                contentAlignment = Alignment.Center
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.Favorite,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Donate Now",
                        style = MaterialTheme.typography.titleMedium.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onPrimary
                        )
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper — format ISO date string to relative time (e.g. "2 days ago")
// ─────────────────────────────────────────────────────────────────────────────

private fun formatDonationTime(isoDate: String?): String {
    if (isoDate.isNullOrBlank()) return "Recently"
    return try {
        val formats = listOf(
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US),
            java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", java.util.Locale.US),
            java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
        )
        formats.forEach { it.timeZone = java.util.TimeZone.getTimeZone("UTC") }

        val parsed = formats.firstNotNullOfOrNull { fmt ->
            try { fmt.parse(isoDate) } catch (_: Exception) { null }
        } ?: return "Recently"

        val diffMs = System.currentTimeMillis() - parsed.time
        val minutes = diffMs / (1000 * 60)
        val hours = minutes / 60
        val days = hours / 24

        when {
            days > 30 -> "${days / 30} months ago"
            days > 0  -> "$days days ago"
            hours > 0 -> "$hours hours ago"
            minutes > 0 -> "$minutes min ago"
            else -> "Just now"
        }
    } catch (_: Exception) {
        "Recently"
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Payment Method Card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun PaymentMethodCard(method: com.aidup.app.models.campaign.PaymentMethod) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceContainerHigh
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                method.method_type ?: "Payment Method",
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                method.details ?: "",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
