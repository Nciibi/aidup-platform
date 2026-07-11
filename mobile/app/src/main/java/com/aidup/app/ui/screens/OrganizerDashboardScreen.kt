package com.aidup.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.theme.full
import com.aidup.app.ui.viewmodels.DashboardCampaign
import com.aidup.app.ui.viewmodels.DashboardDonor
import com.aidup.app.ui.viewmodels.OrganizerDashboardUiState
import com.aidup.app.ui.viewmodels.OrganizerDashboardViewModel
import com.aidup.app.utils.NetworkUtils

private enum class CampaignStatusTab { Accepted, Pending, Rejected }

@Composable
fun OrganizerDashboardScreen(
    navController: NavController,
    isDarkMode: Boolean = false,
    onToggleDarkMode: () -> Unit = {},
    viewModel: OrganizerDashboardViewModel = viewModel()
) {
    val colors = MaterialTheme.colorScheme
    val uiState = viewModel.uiState
    var selectedTab by remember { mutableStateOf(CampaignStatusTab.Accepted) }
    var donorSearch by remember { mutableStateOf("") }

    var rotating by remember { mutableStateOf(false) }
    val rotation by animateFloatAsState(
        targetValue = if (rotating) 360f else 0f,
        animationSpec = tween(500, easing = FastOutSlowInEasing),
        finishedListener = { rotating = false },
        label = "theme_rotation"
    )

    Scaffold(containerColor = colors.background) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 100.dp)
        ) {

            // ── Top bar ───────────────────────────────────────────────
            item {
                Surface(
                    color = colors.background.copy(alpha = 0.92f),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.VolunteerActivism,
                                contentDescription = null,
                                tint = colors.primary,
                                modifier = Modifier.size(26.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "AidUp",
                                style = MaterialTheme.typography.titleLarge.copy(
                                    fontWeight = FontWeight.ExtraBold,
                                    color = colors.primary
                                )
                            )
                        }
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            IconButton(onClick = { navController.navigate(Screen.QRLogin.route) }) {
                                Icon(Icons.Default.QrCodeScanner, contentDescription = "QR", tint = colors.primary, modifier = Modifier.size(22.dp))
                            }
                            IconButton(onClick = { rotating = true; onToggleDarkMode() }) {
                                Icon(
                                    if (isDarkMode) Icons.Default.LightMode else Icons.Default.DarkMode,
                                    contentDescription = "Toggle theme",
                                    tint = colors.onSurfaceVariant,
                                    modifier = Modifier.size(22.dp).rotate(rotation)
                                )
                            }
                        }
                    }
                }
            }

            // ── Dashboard header (no buttons) ─────────────────────────
            item {
                Column(
                    modifier = Modifier.padding(
                        start = 24.dp, end = 24.dp, top = 16.dp, bottom = 8.dp
                    )
                ) {
                    Text(
                        "ORGANIZATION PORTAL",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 2.sp,
                            color = colors.primary
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Organizer Dashboard",
                        style = MaterialTheme.typography.displaySmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            color = colors.onSurface,
                            letterSpacing = (-0.5).sp
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Oversee your humanitarian efforts, manage campaign approvals, and track the real-time impact of your community's generosity.",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            color = colors.onSurfaceVariant,
                            lineHeight = 26.sp
                        )
                    )
                }
                Spacer(modifier = Modifier.height(24.dp))
            }

            // ── Content: loading / error / success ────────────────────
            item {
                when (uiState) {
                    is OrganizerDashboardUiState.Loading -> {
                        Box(
                            modifier = Modifier.fillMaxWidth().height(300.dp),
                            contentAlignment = Alignment.Center
                        ) { CircularProgressIndicator(color = colors.primary) }
                    }

                    is OrganizerDashboardUiState.Error -> {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(uiState.message, color = colors.error)
                                Spacer(modifier = Modifier.height(12.dp))
                                TextButton(onClick = { viewModel.loadDashboard() }) {
                                    Text("Retry", color = colors.primary)
                                }
                            }
                        }
                    }

                    is OrganizerDashboardUiState.Success -> {
                        val data = uiState.data

                        Column {
                            // ── Metrics bento grid ────────────────────
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 24.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Total Impact Funds — full width card
                                Surface(
                                    color = colors.surfaceContainerLowest,
                                    shape = RoundedCornerShape(20.dp),
                                    modifier = Modifier.fillMaxWidth(),
                                    shadowElevation = 1.dp
                                ) {
                                    Column(modifier = Modifier.padding(24.dp)) {
                                        Text(
                                            "Total Raised Amount",
                                            style = MaterialTheme.typography.labelMedium.copy(
                                                color = colors.onSurfaceVariant
                                            )
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                        Row(verticalAlignment = Alignment.Bottom) {
                                            Text(
                                                "$${"%,.2f".format(data.totalRaisedAmount ?: 0.0)}",
                                                style = MaterialTheme.typography.headlineLarge.copy(
                                                    fontWeight = FontWeight.ExtraBold,
                                                    color = colors.onSurface
                                                )
                                            )
                                        }
                                        Spacer(modifier = Modifier.height(20.dp))
                                        // Per-campaign raised bar chart
                                        val campaigns = data.campaigns ?: emptyList()
                                        if (campaigns.isNotEmpty()) {
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .height(56.dp),
                                                verticalAlignment = Alignment.Bottom,
                                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                                            ) {
                                                val maxRaised = campaigns.maxOfOrNull { it.raised_amount }?.takeIf { it > 0 } ?: 1.0
                                                campaigns.forEachIndexed { i, c ->
                                                    val frac = (c.raised_amount / maxRaised).toFloat().coerceIn(0.05f, 1f)
                                                    val isLast = i == campaigns.lastIndex
                                                    Box(
                                                        modifier = Modifier
                                                            .weight(1f)
                                                            .fillMaxHeight(frac)
                                                            .clip(
                                                                RoundedCornerShape(
                                                                    topStart = 4.dp,
                                                                    topEnd = 4.dp
                                                                )
                                                            )
                                                            .background(
                                                                if (isLast) colors.secondary
                                                                else colors.secondaryContainer.copy(
                                                                    alpha = 0.3f + i * 0.1f
                                                                )
                                                            )
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }

                                // Active Donors + Avg Campaign Success — side by side
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    // Active Donors
                                    Surface(
                                        color = colors.surfaceContainerLow,
                                        shape = RoundedCornerShape(20.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Column(modifier = Modifier.padding(20.dp)) {
                                            Text(
                                                "Active Donors",
                                                style = MaterialTheme.typography.labelMedium.copy(
                                                    color = colors.onSurfaceVariant
                                                )
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                "%,d".format(data.donorsCount ?: 0),
                                                style = MaterialTheme.typography.headlineMedium.copy(
                                                    fontWeight = FontWeight.ExtraBold,
                                                    color = colors.onSurface
                                                )
                                            )
                                            Spacer(modifier = Modifier.height(16.dp))
                                            // Overlapping avatar circles from actual donors
                                            val donors = data.donors ?: emptyList()
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .height(32.dp)
                                            ) {
                                                val displayDonors = donors.take(3)
                                                val avatarColors = listOf(
                                                    colors.primaryContainer,
                                                    colors.secondaryContainer,
                                                    colors.tertiaryContainer
                                                )
                                                displayDonors.forEachIndexed { i, donor ->
                                                    Box(
                                                        modifier = Modifier
                                                            .padding(start = (i * 20).dp)
                                                            .size(32.dp)
                                                            .clip(CircleShape)
                                                            .background(avatarColors[i % avatarColors.size])
                                                            .border(2.dp, colors.surfaceContainerLow, CircleShape),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        if (!donor.photo.isNullOrBlank()) {
                                                            AsyncImage(
                                                                model = NetworkUtils.getFullImageUrl(donor.photo),
                                                                contentDescription = null,
                                                                contentScale = ContentScale.Crop,
                                                                modifier = Modifier.fillMaxSize().clip(CircleShape)
                                                            )
                                                        } else {
                                                            Text(
                                                                (donor.name ?: donor.username ?: "?")
                                                                    .take(1).uppercase(),
                                                                style = MaterialTheme.typography.labelSmall.copy(
                                                                    fontWeight = FontWeight.Bold,
                                                                    color = colors.onSurface
                                                                )
                                                            )
                                                        }
                                                    }
                                                }
                                                if (donors.size > 3) {
                                                    Box(
                                                        modifier = Modifier
                                                            .padding(start = (3 * 20).dp)
                                                            .size(32.dp)
                                                            .clip(CircleShape)
                                                            .background(colors.surfaceContainerHighest)
                                                            .border(2.dp, colors.surfaceContainerLow, CircleShape),
                                                        contentAlignment = Alignment.Center
                                                    ) {
                                                        Text(
                                                            "+${donors.size - 3}",
                                                            style = MaterialTheme.typography.labelSmall.copy(
                                                                fontWeight = FontWeight.Bold
                                                            ),
                                                            color = colors.onSurfaceVariant
                                                        )
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    // Avg Campaign Success
                                    Surface(
                                        color = colors.surfaceContainerHigh,
                                        shape = RoundedCornerShape(20.dp),
                                        modifier = Modifier.weight(1f)
                                    ) {
                                        Column(modifier = Modifier.padding(20.dp)) {
                                            Text(
                                                "Avg. Campaign Success",
                                                style = MaterialTheme.typography.labelMedium.copy(
                                                    color = colors.onSurfaceVariant
                                                )
                                            )
                                            Spacer(modifier = Modifier.height(4.dp))
                                            Text(
                                                "${data.avgCampaignSuccessPercent.toInt()}%",
                                                style = MaterialTheme.typography.headlineMedium.copy(
                                                    fontWeight = FontWeight.ExtraBold,
                                                    color = colors.onSurface
                                                )
                                            )
                                            Spacer(modifier = Modifier.height(16.dp))
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .height(8.dp)
                                                    .clip(RoundedCornerShape(full))
                                                    .background(colors.surfaceContainerHighest)
                                            ) {
                                                val successPercent = data.avgCampaignSuccessPercent.toFloat()
                                                Box(
                                                    modifier = Modifier
                                                        .fillMaxWidth(
                                                            (successPercent / 100f)
                                                                .coerceIn(0f, 1f)
                                                        )
                                                        .fillMaxHeight()
                                                        .clip(RoundedCornerShape(full))
                                                        .background(colors.secondary)
                                                )
                                            }
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(32.dp))

                            // ── Campaign tabs ─────────────────────────
                            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                                // Header row: Title + Sort
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        "Campaigns",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            color = colors.onSurface
                                        )
                                    )
                                    
                                    Surface(
                                        color = colors.surfaceContainerHighest,
                                        shape = RoundedCornerShape(full),
                                        modifier = Modifier.clickable { /* handle sort */ }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                Icons.Default.Sort,
                                                contentDescription = null,
                                                tint = colors.onSurfaceVariant,
                                                modifier = Modifier.size(14.dp)
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(
                                                "SORT",
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = colors.onSurfaceVariant
                                                )
                                            )
                                        }
                                    }
                                }
                                
                                Spacer(modifier = Modifier.height(16.dp))

                                // Tab row
                                Row(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    CampaignStatusTab.values().forEach { tab ->
                                        val campaigns = data.campaigns ?: emptyList()
                                        val count = when (tab) {
                                            CampaignStatusTab.Accepted ->
                                                campaigns.count { it.status == "approved" }
                                            CampaignStatusTab.Pending ->
                                                campaigns.count { it.status == "pending" }
                                            CampaignStatusTab.Rejected ->
                                                campaigns.count { it.status == "rejected" }
                                        }
                                        val isSelected = tab == selectedTab
                                        
                                        Surface(
                                            color = if (isSelected) colors.primary else colors.surfaceContainerHighest,
                                            shape = RoundedCornerShape(full),
                                            modifier = Modifier.clickable { selectedTab = tab }
                                        ) {
                                            Text(
                                                "${tab.name} ($count)",
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                                style = MaterialTheme.typography.labelSmall.copy(
                                                    fontWeight = FontWeight.Bold,
                                                    color = if (isSelected) colors.onPrimary else colors.onSurfaceVariant
                                                )
                                            )
                                        }
                                    }
                                }

                                Spacer(modifier = Modifier.height(20.dp))

                                // Filtered campaign list
                                val tabCampaigns = (data.campaigns ?: emptyList()).filter {
                                    when (selectedTab) {
                                        CampaignStatusTab.Accepted -> it.status == "approved"
                                        CampaignStatusTab.Pending  -> it.status == "pending"
                                        CampaignStatusTab.Rejected -> it.status == "rejected"
                                    }
                                }

                                if (tabCampaigns.isEmpty()) {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 32.dp),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            "No ${selectedTab.name.lowercase()} campaigns",
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = colors.onSurfaceVariant
                                        )
                                    }
                                } else {
                                    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                                        tabCampaigns.forEach { campaign ->
                                            OrganizerCampaignCard(
                                                campaign = campaign,
                                                onClick = {
                                                    navController.navigate(
                                                        Screen.Details.createRoute(campaign.id)
                                                    )
                                                }
                                            )
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(32.dp))

                            // ── Donors Section ───────────────────────
                            Surface(
                                color = colors.surfaceContainerLow,
                                shape = RoundedCornerShape(24.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 24.dp)
                            ) {
                                Column(modifier = Modifier.padding(24.dp)) {
                                    Text(
                                        "Campaign Donors",
                                        style = MaterialTheme.typography.titleLarge.copy(
                                            fontWeight = FontWeight.ExtraBold,
                                            color = colors.onSurface
                                        )
                                    )
                                    Text(
                                        "Unique donors across all your campaigns.",
                                        style = MaterialTheme.typography.bodySmall.copy(
                                            color = colors.onSurfaceVariant
                                        )
                                    )

                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Search
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        TextField(
                                            value = donorSearch,
                                            onValueChange = { donorSearch = it },
                                            modifier = Modifier.weight(1f),
                                            placeholder = {
                                                Text("Search donors...", color = colors.onSurfaceVariant)
                                            },
                                            leadingIcon = {
                                                Icon(
                                                    Icons.Default.Search,
                                                    contentDescription = null,
                                                    tint = colors.onSurfaceVariant,
                                                    modifier = Modifier.size(18.dp)
                                                )
                                            },
                                            colors = TextFieldDefaults.colors(
                                                focusedContainerColor = colors.surfaceContainerLowest,
                                                unfocusedContainerColor = colors.surfaceContainerLowest,
                                                focusedIndicatorColor = Color.Transparent,
                                                unfocusedIndicatorColor = Color.Transparent,
                                                focusedTextColor = colors.onSurface,
                                                unfocusedTextColor = colors.onSurface
                                            ),
                                            shape = RoundedCornerShape(12.dp),
                                            singleLine = true
                                        )
                                        Surface(
                                            color = colors.surfaceContainerHigh,
                                            shape = RoundedCornerShape(12.dp),
                                            modifier = Modifier.size(48.dp),
                                            onClick = {}
                                        ) {
                                            Box(contentAlignment = Alignment.Center) {
                                                Icon(
                                                    Icons.Default.FilterList,
                                                    contentDescription = null,
                                                    tint = colors.onSurfaceVariant,
                                                    modifier = Modifier.size(20.dp)
                                                )
                                            }
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(16.dp))

                                    // Donor rows
                                    val donors = data.donors ?: emptyList()
                                    val filtered = if (donorSearch.isBlank())
                                        donors
                                    else donors.filter {
                                        (it.name ?: "").contains(donorSearch, ignoreCase = true) ||
                                        (it.username ?: "").contains(donorSearch, ignoreCase = true)
                                    }

                                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                        filtered.forEach { donor ->
                                            DonorRow(donor = donor)
                                        }
                                    }

                                    if (filtered.isEmpty()) {
                                        Box(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(vertical = 16.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                "No donors found",
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = colors.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Campaign card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun OrganizerCampaignCard(campaign: DashboardCampaign, onClick: () -> Unit) {
    val colors = MaterialTheme.colorScheme
    val raised = campaign.raised_amount
    val goal = campaign.goal_amount
    val progress = if (goal > 0) (raised / goal).toFloat().coerceIn(0f, 1f) else 0f
    val percent = (progress * 100).toInt()

    Surface(
        color = colors.surfaceContainerLowest,
        shape = RoundedCornerShape(20.dp),
        modifier = Modifier.fillMaxWidth(),
        shadowElevation = 1.dp,
        onClick = onClick
    ) {
        Column {
            // Image + status badge
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(160.dp)
            ) {
                if (!campaign.images.isNullOrEmpty()) {
                    AsyncImage(
                        model = NetworkUtils.getFullImageUrl(campaign.images.firstOrNull()),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else if (!campaign.banner.isNullOrBlank()) {
                    AsyncImage(
                        model = NetworkUtils.getFullImageUrl(campaign.banner),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(colors.surfaceContainerHighest)
                    )
                }
                // Status badge
                Surface(
                    color = when (campaign.status) {
                        "approved" -> colors.secondary
                        "pending"  -> colors.tertiary
                        else       -> colors.error
                    },
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp)
                ) {
                    Text(
                        campaign.status.uppercase(),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 9.sp,
                            letterSpacing = 1.sp
                        ),
                        color = Color.White
                    )
                }
            }

            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    campaign.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = colors.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    campaign.description,
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = colors.onSurfaceVariant,
                        lineHeight = 18.sp
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(12.dp))

                // Progress row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "Target: $${"%,.0f".format(goal)}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = colors.onSurface
                        )
                    )
                    Text(
                        "$percent% Funded",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = colors.secondary
                        )
                    )
                }
                Spacer(modifier = Modifier.height(6.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(full))
                        .background(colors.secondaryContainer)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progress)
                            .fillMaxHeight()
                            .clip(RoundedCornerShape(full))
                            .background(colors.secondary)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.History,
                            contentDescription = null,
                            tint = colors.primary,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            "${campaign.days_left} days left",
                            style = MaterialTheme.typography.labelSmall.copy(
                                color = colors.onSurfaceVariant
                            )
                        )
                    }
                    Text(
                        "View Details",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = colors.primary
                        )
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Donor row (replaces the old DonationLogRow)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun DonorRow(donor: DashboardDonor) {
    val colors = MaterialTheme.colorScheme
    Surface(
        color = colors.surfaceContainerLowest,
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar
            val displayName = donor.name ?: donor.username ?: "?"
            val initials = displayName
                .split(" ")
                .take(2)
                .joinToString("") { it.firstOrNull()?.uppercase() ?: "" }
            val avatarBg = listOf(
                colors.secondaryContainer,
                colors.primaryContainer,
                colors.tertiaryContainer
            )[displayName.length % 3]

            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(avatarBg),
                contentAlignment = Alignment.Center
            ) {
                if (!donor.photo.isNullOrBlank()) {
                    AsyncImage(
                        model = NetworkUtils.getFullImageUrl(donor.photo),
                        contentDescription = null,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize().clip(CircleShape)
                    )
                } else {
                    Text(
                        initials,
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = colors.onSurface
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    displayName,
                    style = MaterialTheme.typography.labelLarge.copy(
                        fontWeight = FontWeight.Bold,
                        color = colors.onSurface
                    )
                )
                if (!donor.username.isNullOrBlank() && donor.username != displayName) {
                    Text(
                        "@${donor.username}",
                        style = MaterialTheme.typography.labelSmall.copy(
                            color = colors.onSurfaceVariant
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.width(8.dp))

            Icon(
                Icons.Default.Verified,
                contentDescription = null,
                tint = colors.secondary,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}