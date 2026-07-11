package com.aidup.app.ui.screens

import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.compose.animation.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.aidup.app.network.TokenManager
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.UserProfileViewModel
import com.aidup.app.utils.NetworkUtils

import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.FileOutputStream

@Composable
fun EditProfileScreen(
    navController: NavController,
    viewModel: UserProfileViewModel = viewModel()
) {
    val uiState = viewModel.uiState
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val snackbarHostState = remember { SnackbarHostState() }

    val isOrganizer = uiState.userRole == "organizer"

    // Form state — pre-filled from profile data
    var name by remember(uiState.profileData, uiState.organizerData) {
        mutableStateOf(if (isOrganizer) uiState.organizerData?.name ?: "" else uiState.profileData?.name ?: "")
    }
    var username by remember(uiState.profileData, uiState.organizerData) {
        mutableStateOf(if (isOrganizer) uiState.organizerData?.username ?: "" else uiState.profileData?.username ?: "")
    }
    var bio by remember(uiState.profileData, uiState.organizerData) {
        mutableStateOf(if (isOrganizer) uiState.organizerData?.bio ?: "" else uiState.profileData?.bio ?: "")
    }
    var email by remember(uiState.profileData, uiState.organizerData) {
        mutableStateOf(if (isOrganizer) uiState.organizerData?.email ?: "" else uiState.profileData?.email ?: "")
    }
    var phone by remember(uiState.profileData, uiState.organizerData) {
        mutableStateOf(if (isOrganizer) uiState.organizerData?.phoneNumber ?: "" else uiState.profileData?.phoneNumber ?: "")
    }
    
    // Organizer-only fields
    var location by remember(uiState.organizerData) {
        mutableStateOf(uiState.organizerData?.location ?: "")
    }
    var website by remember(uiState.organizerData) {
        mutableStateOf(uiState.organizerData?.website ?: "")
    }
    var contactEmail by remember(uiState.organizerData) {
        mutableStateOf(uiState.organizerData?.contactemail ?: "")
    }

    var selectedImageUri by remember { mutableStateOf<android.net.Uri?>(null) }

    // Password change state
    var showPasswordFields by remember { mutableStateOf(false) }
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var currentPasswordVisible by remember { mutableStateOf(false) }
    var newPasswordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    // Photo picker
    val imagePickerLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        selectedImageUri = uri
    }

    // Biometric authentication for password change
    fun launchBiometric() {
        val biometricManager = BiometricManager.from(context)
        val canAuthenticate = biometricManager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG or
            BiometricManager.Authenticators.DEVICE_CREDENTIAL
        )

        if (canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS) {
            val executor = ContextCompat.getMainExecutor(context)
            val biometricPrompt = BiometricPrompt(
                context as FragmentActivity,
                executor,
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        showPasswordFields = true
                    }
                    override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                        scope.launch {
                            snackbarHostState.showSnackbar("Authentication failed: $errString")
                        }
                    }
                    override fun onAuthenticationFailed() {
                        scope.launch {
                            snackbarHostState.showSnackbar("Authentication failed")
                        }
                    }
                }
            )

            val promptInfo = BiometricPrompt.PromptInfo.Builder()
                .setTitle("Verify your identity")
                .setSubtitle("Confirm it's you before changing your password")
                .setAllowedAuthenticators(
                    BiometricManager.Authenticators.BIOMETRIC_STRONG or
                    BiometricManager.Authenticators.DEVICE_CREDENTIAL
                )
                .build()

            biometricPrompt.authenticate(promptInfo)
        } else {
            // Device has no biometrics — skip straight to password fields
            showPasswordFields = true
        }
    }

    Scaffold(
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            Surface(
                color = Background.copy(alpha = 0.9f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Primary
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Edit Profile",
                        style = MaterialTheme.typography.titleLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = OnSurface
                        )
                    )
                }
            }
        },
        bottomBar = {
            Surface(
                color = SurfaceContainerLowest.copy(alpha = 0.9f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Save Changes
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                Brush.linearGradient(listOf(PrimaryContainer, Primary))
                            )
                            .clickable {
                                scope.launch {
                                    var imagePart: MultipartBody.Part? = null
                                    selectedImageUri?.let { uri ->
                                        val file = File(context.cacheDir, "profile_picture.jpg")
                                        context.contentResolver.openInputStream(uri)?.use { input ->
                                            FileOutputStream(file).use { output -> input.copyTo(output) }
                                        }
                                        val requestFile = file.asRequestBody("image/jpeg".toMediaTypeOrNull())
                                        // Backend routes for organizers map 'images' field to req.file
                                        val fieldName = if (isOrganizer) "images" else "photo"
                                        imagePart = MultipartBody.Part.createFormData(fieldName, file.name, requestFile)
                                    }

                                    fun getChangedValue(current: String, original: String?): String? {
                                        val trimmed = current.trim()
                                        val normalizedOriginal = original?.trim() ?: ""
                                        return if (trimmed.isNotEmpty() && trimmed != normalizedOriginal) trimmed else null
                                    }

                                    val nameToSend = getChangedValue(name, if (isOrganizer) uiState.organizerData?.name else uiState.profileData?.name)
                                    val usernameToSend = getChangedValue(username, if (isOrganizer) uiState.organizerData?.username else uiState.profileData?.username)
                                    val bioToSend = getChangedValue(bio, if (isOrganizer) uiState.organizerData?.bio else uiState.profileData?.bio)
                                    val emailToSend = getChangedValue(email, if (isOrganizer) uiState.organizerData?.email else uiState.profileData?.email)
                                    val phoneToSend = getChangedValue(phone, if (isOrganizer) uiState.organizerData?.phoneNumber else uiState.profileData?.phoneNumber)
                                    
                                    val locationToSend = if (isOrganizer) getChangedValue(location, uiState.organizerData?.location) else null
                                    val websiteToSend = if (isOrganizer) getChangedValue(website, uiState.organizerData?.website) else null
                                    val contactEmailToSend = if (isOrganizer) getChangedValue(contactEmail, uiState.organizerData?.contactemail) else null

                                    viewModel.updateProfile(
                                        name = nameToSend,
                                        username = usernameToSend,
                                        bio = bioToSend,
                                        email = emailToSend,
                                        phoneNumber = phoneToSend,
                                        location = locationToSend,
                                        website = websiteToSend,
                                        contactEmail = contactEmailToSend,
                                        imagePart = imagePart,
                                        onSuccess = {
                                            scope.launch {
                                                snackbarHostState.showSnackbar("Profile updated successfully")
                                                navController.popBackStack()
                                            }
                                        },
                                        onError = { error ->
                                            scope.launch {
                                                snackbarHostState.showSnackbar("Update failed: $error")
                                            }
                                        }
                                    )
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "Save Changes",
                            style = MaterialTheme.typography.titleMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = OnPrimary
                            )
                        )
                    }
                    Spacer(modifier = Modifier.width(16.dp))
                    // Cancel
                    TextButton(onClick = { navController.popBackStack() }) {
                        Text(
                            "Cancel",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.SemiBold,
                                color = OnSurfaceVariant
                            )
                        )
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // ── Profile picture ───────────────────────────────────────
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box {
                    Surface(
                        shape = CircleShape,
                        modifier = Modifier.size(120.dp),
                        color = SurfaceContainerHighest
                    ) {
                        val rawPhotoUrl = if (isOrganizer) uiState.organizerData?.photo else uiState.profileData?.photo
                        val photoModel = selectedImageUri ?: NetworkUtils.getFullImageUrl(rawPhotoUrl) ?: "https://www.w3schools.com/howto/img_avatar.png"
                        
                        AsyncImage(
                            model = photoModel,
                            contentDescription = null,
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Surface(
                        shape = CircleShape,
                        color = PrimaryContainer,
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .offset(x = 4.dp, y = 4.dp)
                            .clickable { imagePickerLauncher.launch("image/*") },
                        shadowElevation = 4.dp
                    ) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Change photo",
                            tint = OnPrimary,
                            modifier = Modifier.padding(8.dp).size(16.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    if (isOrganizer) uiState.organizerData?.name ?: "" else uiState.profileData?.name ?: "",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                    color = OnSurface
                )
                Text(
                    if (isOrganizer) uiState.organizerData?.email ?: "" else uiState.profileData?.email ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = OnSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // ── Personal information ──────────────────────────────────
            Surface(
                color = SurfaceContainerLow,
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        "PERSONAL INFORMATION",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.ExtraBold,
                            letterSpacing = 1.5.sp,
                            color = OnSurfaceVariant
                        )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // Full Name
                    FieldLabel("Full Name")
                    ProfileTextField(
                        value = name,
                        onValueChange = { name = it },
                        placeholder = "e.g. Sarah Jenkins"
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Username
                    FieldLabel("Username")
                    ProfileTextField(
                        value = username,
                        onValueChange = { username = it },
                        placeholder = "e.g. sarah_j",
                        prefix = "@"
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bio
                    FieldLabel("Bio")
                    TextField(
                        value = bio,
                        onValueChange = { bio = it },
                        modifier = Modifier.fillMaxWidth().heightIn(min = 100.dp),
                        placeholder = { Text("Tell us about yourself...", color = Outline) },
                        shape = RoundedCornerShape(12.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = SurfaceContainerHighest,
                            unfocusedContainerColor = SurfaceContainerHighest,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = OnSurface,
                            unfocusedTextColor = OnSurface
                        ),
                        maxLines = 5
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Email
                    FieldLabel("Email Address")
                    ProfileTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "sarah@example.com",
                        keyboardType = KeyboardType.Email,
                        enabled = true
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // Phone
                    FieldLabel("Phone Number")
                    ProfileTextField(
                        value = phone,
                        onValueChange = { phone = it },
                        placeholder = "+1 (555) 012-3456",
                        keyboardType = KeyboardType.Phone
                    )

                    if (isOrganizer) {
                        Spacer(modifier = Modifier.height(16.dp))

                        // Location
                        FieldLabel("Location")
                        ProfileTextField(
                            value = location,
                            onValueChange = { location = it },
                            placeholder = "e.g. New York, NY"
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Website
                        FieldLabel("Website")
                        ProfileTextField(
                            value = website,
                            onValueChange = { website = it },
                            placeholder = "https://your-charity.org",
                            keyboardType = KeyboardType.Uri
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Contact Email
                        FieldLabel("Public Contact Email")
                        ProfileTextField(
                            value = contactEmail,
                            onValueChange = { contactEmail = it },
                            placeholder = "contact@charity.org",
                            keyboardType = KeyboardType.Email
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Security section ──────────────────────────────────────
            Surface(
                color = SurfaceContainerLow,
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                "Security",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = OnSurface
                                )
                            )
                            Text(
                                "Manage your password and authentication.",
                                style = MaterialTheme.typography.bodySmall.copy(
                                    color = OnSurfaceVariant,
                                    lineHeight = 18.sp
                                )
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        if (!showPasswordFields) {
                            Surface(
                                color = SurfaceContainerHigh,
                                shape = RoundedCornerShape(12.dp),
                                onClick = { launchBiometric() }
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        Icons.Default.Lock,
                                        contentDescription = null,
                                        tint = OnSurface,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        "Change Password",
                                        style = MaterialTheme.typography.labelMedium.copy(
                                            fontWeight = FontWeight.SemiBold,
                                            color = OnSurface
                                        )
                                    )
                                }
                            }
                        }
                    }

                    // Password fields — revealed after biometric
                    AnimatedVisibility(
                        visible = showPasswordFields,
                        enter = fadeIn() + expandVertically(),
                        exit = fadeOut() + shrinkVertically()
                    ) {
                        Column {
                            Spacer(modifier = Modifier.height(20.dp))
                            HorizontalDivider(color = OutlineVariant.copy(alpha = 0.15f))
                            Spacer(modifier = Modifier.height(20.dp))

                            FieldLabel("Current Password")
                            PasswordField(
                                value = currentPassword,
                                onValueChange = { currentPassword = it },
                                placeholder = "Enter current password",
                                visible = currentPasswordVisible,
                                onToggleVisible = { currentPasswordVisible = !currentPasswordVisible }
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            FieldLabel("New Password")
                            PasswordField(
                                value = newPassword,
                                onValueChange = { newPassword = it },
                                placeholder = "Min. 12 characters",
                                visible = newPasswordVisible,
                                onToggleVisible = { newPasswordVisible = !newPasswordVisible }
                            )

                            Spacer(modifier = Modifier.height(14.dp))

                            FieldLabel("Confirm New Password")
                            PasswordField(
                                value = confirmPassword,
                                onValueChange = { confirmPassword = it },
                                placeholder = "Repeat new password",
                                visible = confirmPasswordVisible,
                                onToggleVisible = { confirmPasswordVisible = !confirmPasswordVisible },
                                isError = confirmPassword.isNotEmpty() && confirmPassword != newPassword
                            )

                            if (confirmPassword.isNotEmpty() && confirmPassword != newPassword) {
                                Text(
                                    "Passwords do not match",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = Tertiary,
                                    modifier = Modifier.padding(start = 4.dp, top = 4.dp)
                                )
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            // Cancel password change
                            TextButton(
                                onClick = {
                                    showPasswordFields = false
                                    currentPassword = ""
                                    newPassword = ""
                                    confirmPassword = ""
                                },
                                modifier = Modifier.align(Alignment.End)
                            ) {
                                Text(
                                    "Cancel",
                                    style = MaterialTheme.typography.labelLarge,
                                    color = OnSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ── Humanity First verified badge ─────────────────────────
            Surface(
                color = SecondaryContainer.copy(alpha = 0.2f),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        Icons.Default.VerifiedUser,
                        contentDescription = null,
                        tint = Secondary,
                        modifier = Modifier.size(22.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            "Humanity First Verified",
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = Secondary
                            )
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            "Your profile information is used for tax receipting and secure donation processing.",
                            style = MaterialTheme.typography.bodySmall.copy(
                                color = OnSurfaceVariant,
                                lineHeight = 18.sp
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable field components
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun FieldLabel(text: String) {
    Text(
        text,
        style = MaterialTheme.typography.labelSmall.copy(
            fontWeight = FontWeight.SemiBold,
            color = OnSurfaceVariant
        ),
        modifier = Modifier.padding(start = 4.dp, bottom = 6.dp)
    )
}

@Composable
private fun ProfileTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    prefix: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    enabled: Boolean = true
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text(placeholder, color = Outline) },
        prefix = if (prefix != null) {
            { Text(prefix, color = OnSurfaceVariant, fontWeight = FontWeight.Medium) }
        } else null,
        shape = RoundedCornerShape(12.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = SurfaceContainerHighest,
            unfocusedContainerColor = SurfaceContainerHighest,
            disabledContainerColor = SurfaceContainerHighest.copy(alpha = 0.6f),
            focusedIndicatorColor = Color.Transparent,
            unfocusedIndicatorColor = Color.Transparent,
            disabledIndicatorColor = Color.Transparent,
            focusedTextColor = OnSurface,
            unfocusedTextColor = OnSurface,
            disabledTextColor = OnSurface.copy(alpha = 0.5f)
        ),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        enabled = enabled,
        singleLine = true
    )
}

@Composable
private fun PasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    visible: Boolean,
    onToggleVisible: () -> Unit,
    isError: Boolean = false
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        placeholder = { Text(placeholder, color = Outline) },
        visualTransformation = if (visible) VisualTransformation.None
                               else PasswordVisualTransformation(),
        trailingIcon = {
            IconButton(onClick = onToggleVisible) {
                Icon(
                    if (visible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                    contentDescription = null,
                    tint = OnSurfaceVariant
                )
            }
        },
        shape = RoundedCornerShape(12.dp),
        colors = TextFieldDefaults.colors(
            focusedContainerColor = SurfaceContainerHighest,
            unfocusedContainerColor = SurfaceContainerHighest,
            focusedIndicatorColor = if (isError) Tertiary else Color.Transparent,
            unfocusedIndicatorColor = if (isError) Tertiary.copy(alpha = 0.5f) else Color.Transparent,
            focusedTextColor = OnSurface,
            unfocusedTextColor = OnSurface
        ),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
        singleLine = true,
        isError = isError
    )
}