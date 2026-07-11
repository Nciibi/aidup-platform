package com.aidup.app.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.models.campaign.Campaign
import com.aidup.app.navigation.Screen
import com.aidup.app.ui.components.AidUpTopBar
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.HomeFeedUiState
import com.aidup.app.ui.viewmodels.HomeFeedViewModel
import com.aidup.app.utils.NetworkUtils


private const val PAGE_SIZE = 10

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AllCampaignsScreen(
    navController: NavController,
    isDarkMode: Boolean,
    onToggleDarkMode: () -> Unit,
    viewModel: HomeFeedViewModel = viewModel()
) {
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var currentPage by remember { mutableStateOf(1) }
    val uiState = viewModel.uiState

    LaunchedEffect(selectedCategory) { currentPage = 1 }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            AidUpTopBar(
                isDarkMode = isDarkMode,
                onToggleDarkMode = onToggleDarkMode,
                onQrClick = { navController.navigate(Screen.QRLogin.route) }
            )
        }
    ) { padding ->
        when (uiState) {
            is HomeFeedUiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                }
            }
            is HomeFeedUiState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.message, color = MaterialTheme.colorScheme.error)
                }
            }
            is HomeFeedUiState.Success -> {
                val filtered = uiState.campaigns.filter { c ->
                    selectedCategory == null ||
                        c.category?.name?.equals(selectedCategory, ignoreCase = true) == true
                }

                val totalPages = maxOf(1, (filtered.size + PAGE_SIZE - 1) / PAGE_SIZE)
                val pageClamped = currentPage.coerceIn(1, totalPages)
                val pageItems = filtered
                    .drop((pageClamped - 1) * PAGE_SIZE)
                    .take(PAGE_SIZE)

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(bottom = 32.dp)
                ) {
                    // ── Category filter row ───────────────────────────────
                    item {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            // "All" chip
                            item {
                                val isSelected = selectedCategory == null
                                Surface(
                                    onClick = { selectedCategory = null },
                                    shape = RoundedCornerShape(full),
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainerHigh
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.GridView,
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            "All",
                                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }

                            items(uiState.categories) { category ->
                                val isSelected = selectedCategory == category.name
                                Surface(
                                    onClick = { selectedCategory = if (isSelected) null else category.name },
                                    shape = RoundedCornerShape(full),
                                    color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainerHigh
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.Star, // Default star icon for dynamic categories
                                            contentDescription = null,
                                            modifier = Modifier.size(16.dp),
                                            tint = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                        )
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            (category.name ?: "Category").lowercase().replaceFirstChar { it.uppercase() },
                                            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                            color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // ── Count label ───────────────────────────────────────
                    item {
                        Text(
                            "Showing ${pageItems.size} of ${filtered.size} active campaigns",
                            modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp),
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // ── Campaign cards ────────────────────────────────────
                    items(pageItems) { campaign ->
                        AllCampaignCard(
                            campaign = campaign,
                            onClick = {
                                navController.navigate(Screen.Details.createRoute(campaign._id))
                            }
                        )
                    }

                    // ── Pagination ────────────────────────────────────────
                    item {
                        Spacer(modifier = Modifier.height(24.dp))
                        PaginationBar(
                            currentPage = pageClamped,
                            totalPages = totalPages,
                            onPageSelected = { currentPage = it }
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Full-width campaign card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun AllCampaignCard(campaign: Campaign, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 8.dp),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surfaceContainerLowest,
        shadowElevation = 1.dp,
        onClick = onClick
    ) {
        Column {
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
                Surface(
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.9f),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier.align(Alignment.TopStart).padding(12.dp)
                ) {
                    Text(
                        (campaign.category?.name ?: "Other").uppercase(),
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.sp,
                            fontSize = 9.sp
                        ),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }

            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    campaign.title ?: "Untitled Campaign",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    campaign.description ?: "No description provided",
                    style = MaterialTheme.typography.bodySmall.copy(
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    ),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(16.dp))

                val raised = campaign.raised_amount ?: 0.0
                val goal = campaign.goal_amount
                val progress = if (goal > 0.0) ((raised).toDouble() / (goal).toDouble()).toFloat().coerceIn(0f, 1f) else 0f
                val percent = (progress * 100).toInt()

                Row(
                    modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        "$${"%.0f".format(raised)} of $${"%.0f".format(goal)}",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    )
                    Text(
                        "$percent%",
                        style = MaterialTheme.typography.labelMedium.copy(
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.secondary
                        )
                    )
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(full))
                        .background(MaterialTheme.colorScheme.secondaryContainer)
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

// ─────────────────────────────────────────────────────────────────────────────
// Pagination bar
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun PaginationBar(
    currentPage: Int,
    totalPages: Int,
    onPageSelected: (Int) -> Unit
) {
    if (totalPages <= 1) return

    Row(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        PageButton(
            enabled = currentPage > 1,
            onClick = { onPageSelected(currentPage - 1) }
        ) {
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                contentDescription = "Previous",
                modifier = Modifier.size(20.dp)
            )
        }

        Spacer(modifier = Modifier.width(4.dp))

        val pagesToShow = buildPageList(currentPage, totalPages)
        pagesToShow.forEach { page ->
            if (page == -1) {
                Box(modifier = Modifier.size(40.dp), contentAlignment = Alignment.Center) {
                    Text("...", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            } else {
                val isActive = page == currentPage
                PageButton(
                    enabled = !isActive,
                    onClick = { onPageSelected(page) },
                    active = isActive
                ) {
                    Text(
                        page.toString(),
                        style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold)
                    )
                }
            }
            Spacer(modifier = Modifier.width(4.dp))
        }

        PageButton(
            enabled = currentPage < totalPages,
            onClick = { onPageSelected(currentPage + 1) }
        ) {
            Icon(
                Icons.AutoMirrored.Filled.KeyboardArrowRight,
                contentDescription = "Next",
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@Composable
private fun PageButton(
    enabled: Boolean,
    onClick: () -> Unit,
    active: Boolean = false,
    content: @Composable () -> Unit
) {
    Surface(
        modifier = Modifier.size(40.dp),
        shape = RoundedCornerShape(12.dp),
        color = if (active) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceContainerHigh,
        onClick = { if (enabled) onClick() }
    ) {
        Box(contentAlignment = Alignment.Center) {
            CompositionLocalProvider(
                LocalContentColor provides when {
                    active   -> MaterialTheme.colorScheme.onPrimary
                    !enabled -> MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                    else     -> MaterialTheme.colorScheme.onSurface
                }
            ) { content() }
        }
    }
}

private fun buildPageList(current: Int, total: Int): List<Int> {
    if (total <= 7) return (1..total).toList()
    val result = mutableListOf<Int>()
    result.add(1)
    if (current > 3) result.add(-1)
    for (p in (current - 1)..(current + 1)) {
        if (p in 2 until total) result.add(p)
    }
    if (current < total - 2) result.add(-1)
    result.add(total)
    return result.distinct()
}