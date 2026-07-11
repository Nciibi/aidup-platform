package com.aidup.app.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.aidup.app.ui.viewmodels.CampaignCreationViewModel
import com.aidup.app.ui.viewmodels.CampaignSubmitUiState
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalLayoutApi::class, ExperimentalMaterial3Api::class)
@Composable
fun CampaignCreationScreen(
    onBack: () -> Unit,
    viewModel: CampaignCreationViewModel = viewModel()
) {
    val colors = MaterialTheme.colorScheme
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    val submitState = viewModel.submitUiState
    LaunchedEffect(submitState) {
        if (submitState is CampaignSubmitUiState.Success) {
            onBack()
        }
    }

    // Launchers
    val bannerLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) viewModel.bannerUri = uri
    }
    val galleryLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetMultipleContents()) { uris ->
        uris.forEach { viewModel.addGalleryImage(it) }
    }

    var showDatePicker by remember { mutableStateOf(false) }
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.goalDateMillis = datePickerState.selectedDateMillis
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("Cancel") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }

    Scaffold(
        topBar = {
            centerAlignedTopBar(onBack = onBack, title = "Create Campaign")
        },
        bottomBar = {
            SubmitButtonRow(submitState = submitState, onSubmit = { viewModel.submitCampaign(context) })
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.background)
                .padding(padding)
                .verticalScroll(scrollState)
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {

            // Header info
            Text(
                "Launch Your Initiative",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = colors.onSurface
            )
            
            if (submitState is CampaignSubmitUiState.Error) {
                Text(
                    text = submitState.message,
                    color = colors.error,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            // Category Selection
            Text("CATEGORY", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.primary)
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                viewModel.categories.forEach { category ->
                    val isSelected = viewModel.selectedCategoryId == category._id
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.selectedCategoryId = category._id ?: "" },
                        label = { Text(category.name ?: "Unknown") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = colors.primary,
                            selectedLabelColor = colors.onPrimary
                        )
                    )
                }
            }

            // Basic Info
            AidUpOutlinedField(
                label = "CAMPAIGN TITLE",
                value = viewModel.title,
                onValueChange = { viewModel.title = it },
                placeholder = "E.g., Clean Water for Village"
            )

            AidUpOutlinedField(
                label = "SHORT DESCRIPTION",
                value = viewModel.description,
                onValueChange = { viewModel.description = it },
                placeholder = "A brief summary of your cause",
                singleLine = false,
                lines = 2
            )

            AidUpOutlinedField(
                label = "FULL STORY",
                value = viewModel.story,
                onValueChange = { viewModel.story = it },
                placeholder = "Tell the full story of why this matters...",
                singleLine = false,
                lines = 6
            )

            // Financials & Dates
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Box(modifier = Modifier.weight(1f)) {
                    AidUpOutlinedField(
                        label = "GOAL AMOUNT (\$$)",
                        value = viewModel.goalAmount,
                        onValueChange = { viewModel.goalAmount = it },
                        placeholder = "5000",
                        keyboardType = KeyboardType.Number
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    Column {
                        Text("DEADLINE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.primary)
                        Spacer(modifier = Modifier.height(8.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp)
                                .border(1.dp, colors.outline.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
                                .clickable { showDatePicker = true }
                                .padding(horizontal = 16.dp),
                            contentAlignment = Alignment.CenterStart
                        ) {
                            val format = SimpleDateFormat("MMM dd, yyyy", Locale.US)
                            Text(
                                text = if (viewModel.goalDateMillis != null) format.format(Date(viewModel.goalDateMillis!!)) else "Select Date",
                                color = if (viewModel.goalDateMillis != null) colors.onSurface else colors.onSurfaceVariant.copy(alpha=0.6f)
                            )
                        }
                    }
                }
            }

            // Goals List
            GoalsSection(
                goals = viewModel.goals,
                onAddGoal = { viewModel.addGoal(it) },
                onRemoveGoal = { viewModel.removeGoal(it) }
            )

            // Images
            ImagesSection(
                bannerUri = viewModel.bannerUri,
                galleryUris = viewModel.galleryImages,
                onSelectBanner = { bannerLauncher.launch("image/*") },
                onSelectGallery = { galleryLauncher.launch("image/*") },
                onRemoveGalleryImage = { uri -> viewModel.galleryImages.remove(uri) }
            )

            // Payment Methods
            Text("PAYMENT METHODS ACCEPTED", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.primary)
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("Bank Transfer", "Credit Card", "PayPal", "USSD").forEach { method ->
                    val isSelected = viewModel.selectedPaymentMethods.contains(method)
                    FilterChip(
                        selected = isSelected,
                        onClick = { viewModel.togglePaymentMethod(method) },
                        label = { Text(method) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = colors.primaryContainer,
                            selectedLabelColor = colors.onPrimaryContainer
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

@Composable
fun centerAlignedTopBar(onBack: () -> Unit, title: String) {
    Surface(shadowElevation = 2.dp) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.primary)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(title, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SubmitButtonRow(submitState: CampaignSubmitUiState, onSubmit: () -> Unit) {
    Surface(shadowElevation = 8.dp) {
        Box(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
            Button(
                onClick = onSubmit,
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = submitState !is CampaignSubmitUiState.Submitting
            ) {
                if (submitState is CampaignSubmitUiState.Submitting) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("PUBLISH CAMPAIGN", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AidUpOutlinedField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
    lines: Int = 1
) {
    Column {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(8.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder) },
            modifier = Modifier.fillMaxWidth().defaultMinSize(minHeight = if (lines > 1) (lines * 24).dp else 56.dp),
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            singleLine = singleLine,
            maxLines = if (singleLine) 1 else lines,
            shape = RoundedCornerShape(12.dp)
        )
    }
}

@Composable
fun GoalsSection(goals: List<String>, onAddGoal: (String) -> Unit, onRemoveGoal: (String) -> Unit) {
    var newGoalText by remember { mutableStateOf("") }
    
    Column {
        Text("CAMPAIGN MILESTONES / GOALS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(8.dp))
        
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = newGoalText,
                onValueChange = { newGoalText = it },
                placeholder = { Text("E.g., Install 2 water pumps") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    onAddGoal(newGoalText)
                    newGoalText = ""
                },
                modifier = Modifier.size(56.dp).background(MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(12.dp))
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Goal", tint = MaterialTheme.colorScheme.onPrimaryContainer)
            }
        }
        
        if (goals.isNotEmpty()) {
            Spacer(modifier = Modifier.height(12.dp))
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                goals.forEach { goal ->
                    Row(
                        modifier = Modifier.fillMaxWidth().background(MaterialTheme.colorScheme.surfaceVariant, RoundedCornerShape(8.dp)).padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("• $goal", style = MaterialTheme.typography.bodyMedium)
                        Icon(Icons.Default.Close, contentDescription = "Remove", modifier = Modifier.size(20.dp).clickable { onRemoveGoal(goal) })
                    }
                }
            }
        }
    }
}

@Composable
fun ImagesSection(
    bannerUri: Uri?,
    galleryUris: List<Uri>,
    onSelectBanner: () -> Unit,
    onSelectGallery: () -> Unit,
    onRemoveGalleryImage: (Uri) -> Unit
) {
    Column {
        Text("CREATIVE ASSETS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Spacer(modifier = Modifier.height(16.dp))
        
        // Banner
        Text("Hero Banner (1 Image)", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
        Spacer(modifier = Modifier.height(8.dp))
        Box(
            modifier = Modifier.fillMaxWidth().height(160.dp).border(2.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(12.dp)).clip(RoundedCornerShape(12.dp)).background(MaterialTheme.colorScheme.surfaceVariant).clickable { onSelectBanner() },
            contentAlignment = Alignment.Center
        ) {
            if (bannerUri != null) {
                AsyncImage(model = bannerUri, contentDescription = "Banner", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
            } else {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Image, contentDescription = null, modifier = Modifier.size(32.dp), tint = MaterialTheme.colorScheme.outline)
                    Text("Tap to upload banner", color = MaterialTheme.colorScheme.outline)
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))
        
        // Gallery
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("Story Gallery", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            TextButton(onClick = onSelectGallery) { Text("+ Add Images") }
        }
        
        if (galleryUris.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(galleryUris) { uri ->
                    Box(modifier = Modifier.size(100.dp).clip(RoundedCornerShape(8.dp))) {
                        AsyncImage(model = uri, contentDescription = "Gallery Image", modifier = Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                        IconButton(
                            onClick = { onRemoveGalleryImage(uri) },
                            modifier = Modifier.align(Alignment.TopEnd).padding(4.dp).size(24.dp).background(Color.Black.copy(alpha=0.5f), CircleShape)
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Remove", tint = Color.White, modifier = Modifier.size(14.dp))
                        }
                    }
                }
            }
        } else {
            Text("No extra images added", fontSize = 12.sp, color = MaterialTheme.colorScheme.outline, modifier = Modifier.padding(top = 8.dp))
        }
    }
}
