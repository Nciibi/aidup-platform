package com.aidup.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.models.DonationCategory
import com.aidup.app.models.campaign.Campaign
import com.aidup.app.models.campaign.Category
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.components.AidUpTopBar
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.HomeFeedUiState
import com.aidup.app.ui.viewmodels.HomeFeedViewModel
import com.aidup.app.network.TokenManager
import com.aidup.app.utils.NetworkUtils


@Composable
fun HomeFeedScreen(navController: NavController,viewModel: HomeFeedViewModel = viewModel(),isDarkMode: Boolean,onToggleDarkMode: () -> Unit) {
    val uiState = viewModel.uiState
    var selectedCategory by remember { mutableStateOf(DonationCategory.ALL) }
    val userName = remember { TokenManager.getUserName() ?: "Supporter" }


    Scaffold(
        topBar = {
            AidUpTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = onToggleDarkMode,
                onQrClick = { navController.navigate(Screen.QRLogin.route) }
            )
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 100.dp)
        ) {
            Spacer(modifier = Modifier.height(8.dp))

            // ── Greeting Section ──────────────────────────────────────────
            Column(modifier = Modifier.padding(horizontal = 24.dp)) {
                Text(
                    text = "Hello,",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "$userName!",
                    style = MaterialTheme.typography.displaySmall.copy(fontWeight = FontWeight.Black),
                    color = MaterialTheme.colorScheme.primary
                )
            }

            // ── Featured Campaigns ────────────────────────────────────────
            SectionHeader(
                title = "Featured Campaigns",
                onViewAll = { navController.navigate(Screen.AllCampaigns.route) }
            )

            when (uiState) {
                is HomeFeedUiState.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(220.dp),
                        contentAlignment = Alignment.Center
                    ) { CircularProgressIndicator(color = MaterialTheme.colorScheme.primary) }
                }
                is HomeFeedUiState.Error -> {
                    Box(
                        modifier = Modifier.fillMaxWidth().height(220.dp),
                        contentAlignment = Alignment.Center
                    ) { Text(uiState.message, color = MaterialTheme.colorScheme.error) }
                }
                is HomeFeedUiState.Success -> {
                    val campaigns = uiState.campaigns
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 24.dp),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        modifier = Modifier.padding(bottom = 16.dp, top = 0.dp)
                    ) {
                        items(campaigns) { campaign ->
                            val categoryName = campaign.category?.name ?: "Other"
                            CampaignCard(
                                campaign = campaign,
                                categoryName = categoryName,
                                onClick = {
                                    navController.navigate(
                                        Screen.Details.createRoute(campaign._id)
                                    )
                                }
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(48.dp))

            // ── Collective Reach ──────────────────────────────────────────
            SectionCollectiveReach()

            Spacer(modifier = Modifier.height(48.dp))

            // ── Discover Your Interest ────────────────────────────────────
            if (uiState is HomeFeedUiState.Success) {
                SectionDiscoverInterest(navController, uiState.categories)
            }

            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}



// ── Campaign card ─────────────────────────────────────────────────────────────

@Composable
fun CampaignCard(campaign: Campaign, categoryName: String, onClick: () -> Unit) {
    Surface(
        modifier = Modifier.width(320.dp),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        shadowElevation = 2.dp,
        onClick = onClick
    ) {
        Column {
            // Image + category badge
            Box(modifier = Modifier.fillMaxWidth().height(180.dp)) {
                val displayImage = campaign.banner ?: campaign.images?.firstOrNull()
                if (displayImage != null) {
                    AsyncImage(
                        model = NetworkUtils.getFullImageUrl(displayImage),
                        contentDescription = campaign.title ?: "Campaign",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Box(
                        modifier = Modifier.fillMaxSize().background(MaterialTheme.colorScheme.surfaceContainerHighest),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(Icons.Default.Image, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                // Category badge — top right
                Surface(
                    color = Color.White.copy(alpha = 0.9f),
                    shape = RoundedCornerShape(full),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(12.dp)
                ) {
                    Text(
                        text = categoryName.uppercase(),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp,
                            fontSize = 9.sp
                        ),
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            // Text content
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    text = campaign.title ?: "Untitled Campaign",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = campaign.description ?: "No description provided",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(20.dp))

                // Progress
                val raised = campaign.raised_amount ?: 0.0
                val goal = campaign.goal_amount
                val progress = if (goal > 0) (raised / goal).toFloat().coerceIn(0f, 1f) else 0f
                val percent = (progress * 100).toInt()

                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        "$percent% Funded",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )
                    Text(
                        buildString {
                            append("$${raised.toInt()} ")
                            append("of $${(goal / 1000).toInt()}k")
                        },
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.ExtraBold
                        )
                    )
                }

                // Green-on-green progress bar per design system
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(full))
                            .background(MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f))
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth(progress)
                                .fillMaxHeight()
                                .clip(RoundedCornerShape(full))
                                .background(MaterialTheme.colorScheme.secondary)
                        )
                    }
            }
        }
    }
}

// ── Search & filters ──────────────────────────────────────────────────────────

@Composable
fun SectionSearchAndFilters(selectedCategory: DonationCategory,onSelect: (DonationCategory) -> Unit) {
    Column {
        // Search bar
        TextField(
            value = "",
            onValueChange = {},
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp),
            placeholder = {
                Text("Search causes or organizations", color = MaterialTheme.colorScheme.onSurfaceVariant)
            },
            leadingIcon = {
                Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
            },
            colors = TextFieldDefaults.colors(
                focusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                unfocusedContainerColor = MaterialTheme.colorScheme.surfaceContainerHighest,
                focusedIndicatorColor = Color.Transparent,
                unfocusedIndicatorColor = Color.Transparent
            ),
            shape = RoundedCornerShape(16.dp),
            singleLine = true
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Category chips
        LazyRow(
            contentPadding = PaddingValues(horizontal = 24.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(DonationCategory.values()) { category ->
                val isSelected = category == selectedCategory
                Surface(
                    onClick = { onSelect(category) },
                    shape = RoundedCornerShape(full),
                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainerHigh
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val icon: ImageVector = when (category) {
                            DonationCategory.ALL         -> Icons.Default.GridView
                            DonationCategory.HEALTH      -> Icons.Default.MedicalServices
                            DonationCategory.ANIMALS     -> Icons.Default.Pets
                            DonationCategory.EDUCATION   -> Icons.Default.School
                            DonationCategory.ENVIRONMENT -> Icons.Default.Eco
                            else                         -> Icons.Default.Star
                        }
                        Icon(
                            icon,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp),
                            tint = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = category.name.lowercase().replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.SemiBold
                            ),
                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}

// ── Section header ────────────────────────────────────────────────────────────

@Composable
fun SectionHeader(title: String, onViewAll: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
    ) {
        Text(
            title,
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        )
        TextButton(onClick = onViewAll) {
            Text(
                "View all",
                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

// ── Collective reach ──────────────────────────────────────────────────────────

@Composable
fun SectionCollectiveReach() {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerLow,
        shape = RoundedCornerShape(32.dp)
    ) {
        Box(modifier = Modifier.fillMaxWidth()) {
            // Decorative circle top-right
            Box(
                modifier = Modifier
                    .size(200.dp)
                    .align(Alignment.TopEnd)
                    .offset(x = 60.dp, y = (-60).dp)
                    .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.05f), CircleShape)
            )

            Column(modifier = Modifier.padding(32.dp)) {
                Text(
                    "OUR COLLECTIVE REACH",
                    style = MaterialTheme.typography.labelSmall.copy(
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 2.sp
                    ),
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    "Real people, ",
                    style = MaterialTheme.typography.displayMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                )
                Text(
                    "real impact.",
                    style = MaterialTheme.typography.displayMedium.copy(
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                        fontStyle = FontStyle.Italic
                    )
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Stats — stacked vertically matching the screenshot
                StatRow(value = "1.2M+", label = "Total lives touched")
                Spacer(modifier = Modifier.height(20.dp))
                StatRow(value = "142",   label = "Global projects funded")
                Spacer(modifier = Modifier.height(20.dp))
                StatRow(value = "89k",   label = "Active donors")

                Spacer(modifier = Modifier.height(40.dp))

                // Overlapping avatars + caption
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(contentAlignment = Alignment.CenterStart) {
                        Surface(
                            modifier = Modifier.padding(start = 0.dp).size(44.dp)
                                .border(3.dp, MaterialTheme.colorScheme.surfaceContainerLow, CircleShape),
                            shape = CircleShape, color = MaterialTheme.colorScheme.primaryContainer
                        ) {}
                        Surface(
                            modifier = Modifier.padding(start = 28.dp).size(44.dp)
                                .border(3.dp, MaterialTheme.colorScheme.surfaceContainerLow, CircleShape),
                            shape = CircleShape, color = MaterialTheme.colorScheme.secondaryContainer
                        ) {}
                        Surface(
                            modifier = Modifier.padding(start = 56.dp).size(44.dp)
                                .border(3.dp, MaterialTheme.colorScheme.surfaceContainerLow, CircleShape),
                            shape = CircleShape, color = MaterialTheme.colorScheme.tertiaryContainer
                        ) {}
                        Surface(
                            modifier = Modifier.padding(start = 84.dp).size(44.dp)
                                .border(3.dp, MaterialTheme.colorScheme.surfaceContainerLow, CircleShape),
                            shape = CircleShape, color = MaterialTheme.colorScheme.primary
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    "+12",
                                    style = MaterialTheme.typography.labelSmall.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    Text(
                        "Join thousands of others making a difference every single day.",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun StatRow(value: String, label: String) {
    Column {
        Text(
            value,
            style = MaterialTheme.typography.headlineLarge.copy(
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface
            )
        )
        Text(
            label,
            style = MaterialTheme.typography.labelMedium.copy(
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )
    }
}

// ── Discover your interest ────────────────────────────────────────────────────
@Composable
fun SectionDiscoverInterest(navController: NavController, categories: List<Category>) {
    if (categories.isEmpty()) return

    Column(modifier = Modifier.padding(horizontal = 24.dp)) {
        Text(
            "Discover Your Interest",
            style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
        )
        Spacer(modifier = Modifier.height(20.dp))

        // First item as wide hero card
        val hero = categories.first()
        Surface(
            modifier = Modifier.fillMaxWidth().height(110.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.18f),
            onClick = { navController.navigate(Screen.AllCampaigns.route) }
        ) {
            Row(
                modifier = Modifier.padding(20.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(56.dp),
                    shape = RoundedCornerShape(16.dp),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.GridView, // Default icon for hero
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(28.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        (hero.name ?: "Category").lowercase().replaceFirstChar { it.uppercase() },
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        hero.description ?: "",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Remaining categories — 2 per row
        val rest = categories.drop(1)
        rest.chunked(2).forEach { pair ->
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                pair.forEach { category ->
                    Surface(
                        modifier = Modifier.weight(1f).height(130.dp),
                        shape = RoundedCornerShape(20.dp),
                        color = MaterialTheme.colorScheme.surfaceContainerLow,
                        onClick = { navController.navigate(Screen.AllCampaigns.route) }
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Surface(
                                modifier = Modifier.size(40.dp),
                                shape = RoundedCornerShape(12.dp),
                                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.Star, // Default icon
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(22.dp)
                                    )
                                }
                            }
                            Column {
                                Text(
                                    (category.name ?: "Category").lowercase().replaceFirstChar { it.uppercase() },
                                    style = MaterialTheme.typography.titleSmall.copy(
                                        fontWeight = FontWeight.Bold
                                    ),
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    category.description ?: "",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    maxLines = 2,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}