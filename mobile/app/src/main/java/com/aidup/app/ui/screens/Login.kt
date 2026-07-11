package com.aidup.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.VolunteerActivism
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.aidup.app.navigation.Screen
import com.aidup.app.models.auth.LoginRequest
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.AuthUiState
import com.aidup.app.ui.viewmodels.AuthViewModel
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(
    navController: NavController,
    viewModel: AuthViewModel = viewModel()
) {
    var isDonator by remember { mutableStateOf(true) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    val uiState = viewModel.uiState
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current

    LaunchedEffect(uiState) {
        when (uiState) {
            is AuthUiState.Success -> {
                val role = uiState.user?.role?.lowercase() ?: "donator"
                val destination = if (role == "organizer") Screen.OrganizerDashboard.route else Screen.HomeFeed.route
                
                navController.navigate(destination) {
                    popUpTo(Screen.Login.route) { inclusive = true }
                }
                viewModel.resetState()
            }
            is AuthUiState.Error -> {
                snackbarHostState.showSnackbar(uiState.message)
                viewModel.resetState()
            }
            else -> {}
        }
    }

    Scaffold(
        containerColor = Surface,
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
            ) {
                // ── Top bar ──────────────────────────────────────────────
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.VolunteerActivism,
                            contentDescription = null,
                            tint = Primary,
                            modifier = Modifier.size(26.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "AidUp",
                            style = MaterialTheme.typography.headlineMedium.copy(
                                fontWeight = FontWeight.ExtraBold,
                                color = Primary
                            )
                        )
                    }
                    Surface(
                        color = SurfaceContainerHigh,
                        shape = RoundedCornerShape(12.dp),
                        onClick = {}
                    ) {
                        Text(
                            text = "Help",
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                            style = MaterialTheme.typography.labelLarge.copy(
                                fontWeight = FontWeight.Bold,
                                color = OnSurface
                            )
                        )
                    }
                }

                // ── Content ───────────────────────────────────────────────
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    Spacer(modifier = Modifier.height(16.dp))

                    // Title
                    Text(
                        text = "Welcome to AidUp",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            fontWeight = FontWeight.Bold,
                            color = OnSurface
                        )
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Choose your path to start making a difference today.",
                        style = MaterialTheme.typography.bodyLarge.copy(
                            color = OnSurfaceVariant
                        )
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // ── Donator / Organizer toggle ────────────────────────
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(SurfaceContainerLow, RoundedCornerShape(16.dp))
                            .padding(6.dp)
                    ) {
                        // Donator pill
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    if (isDonator)
                                        Brush.linearGradient(listOf(PrimaryContainer, Primary))
                                    else
                                        Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                                )
                                .clickable { isDonator = true }
                                .padding(vertical = 14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Donator",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (isDonator) OnPrimary else OnSurfaceVariant
                                )
                            )
                        }
                        // Organizer pill
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(
                                    if (!isDonator)
                                        Brush.linearGradient(listOf(PrimaryContainer, Primary))
                                    else
                                        Brush.linearGradient(listOf(Color.Transparent, Color.Transparent))
                                )
                                .clickable { isDonator = false }
                                .padding(vertical = 14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Organizer",
                                style = MaterialTheme.typography.labelLarge.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = if (!isDonator) OnPrimary else OnSurfaceVariant
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // ── Google button ─────────────────────────────────────
                    Surface(
                        onClick = {
                            scope.launch {
                                try {
                                    val credentialManager = androidx.credentials.CredentialManager.create(context)
                                    val clientId = context.getString(com.aidup.app.R.string.google_web_client_id)
                                    val googleIdOption = com.google.android.libraries.identity.googleid.GetGoogleIdOption.Builder()
                                        .setFilterByAuthorizedAccounts(false)
                                        .setServerClientId(clientId)
                                        .setAutoSelectEnabled(false)
                                        .build()
                                    val request = androidx.credentials.GetCredentialRequest.Builder()
                                        .addCredentialOption(googleIdOption)
                                        .build()
                                    val result = credentialManager.getCredential(request = request, context = context)
                                    val credential = result.credential
                                    if (credential is androidx.credentials.CustomCredential &&
                                        credential.type == com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                                    ) {
                                        val googleIdTokenCredential = com.google.android.libraries.identity.googleid.GoogleIdTokenCredential.createFrom(credential.data)
                                        val roleString = if (isDonator) "Donator" else "Organizer"
                                        viewModel.googleLogin(googleIdTokenCredential.idToken, roleString)
                                    } else {
                                        snackbarHostState.showSnackbar("Unexpected credential type")
                                    }
                                } catch (e: androidx.credentials.exceptions.GetCredentialException) {
                                    snackbarHostState.showSnackbar("Google Sign-in failed: ${e.message}")
                                } catch (e: Exception) {
                                    snackbarHostState.showSnackbar("Error: ${e.message}")
                                }
                            }
                        },
                        shape = RoundedCornerShape(16.dp),
                        color = SurfaceContainerLowest,
                        shadowElevation = 2.dp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(60.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxSize(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Real Google G icon using Canvas paths
                            androidx.compose.foundation.Canvas(modifier = Modifier.size(20.dp)) {
                                // Blue
                                drawArc(color = Color(0xFF4285F4), startAngle = -90f, sweepAngle = 180f, useCenter = false)
                                // Green
                                drawArc(color = Color(0xFF34A853), startAngle = 90f, sweepAngle = 90f, useCenter = false)
                                // Yellow
                                drawArc(color = Color(0xFFFBBC05), startAngle = 180f, sweepAngle = 90f, useCenter = false)
                                // Red
                                drawArc(color = Color(0xFFEA4335), startAngle = 270f, sweepAngle = 90f, useCenter = false)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "Continue with Google",
                                style = MaterialTheme.typography.titleSmall.copy(
                                    fontWeight = FontWeight.SemiBold,
                                    color = OnSurface
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // ── OR EMAIL divider ──────────────────────────────────
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = OutlineVariant.copy(alpha = 0.2f)
                        )
                        Text(
                            text = "Or Email",
                            modifier = Modifier.padding(horizontal = 16.dp),
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = Outline
                            )
                        )
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = OutlineVariant.copy(alpha = 0.2f)
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // ── Email field ───────────────────────────────────────
                    Text(
                        text = "EMAIL ADDRESS",
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = OnSurfaceVariant
                        ),
                        modifier = Modifier.padding(start = 4.dp, bottom = 6.dp)
                    )
                    TextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = { Text("name@company.com", color = Outline) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = SurfaceContainerHighest,
                            unfocusedContainerColor = SurfaceContainerHighest,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = OnSurface,
                            unfocusedTextColor = OnSurface
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    // ── Password field ────────────────────────────────────
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 4.dp, bottom = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "PASSWORD",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = OnSurfaceVariant
                            )
                        )
                        Text(
                            text = "Forgot?",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                color = Primary
                            ),
                            modifier = Modifier.clickable { }
                        )
                    }
                    TextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = { Text("••••••••", color = Outline) },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = SurfaceContainerHighest,
                            unfocusedContainerColor = SurfaceContainerHighest,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent,
                            focusedTextColor = OnSurface,
                            unfocusedTextColor = OnSurface
                        ),
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // ── Sign In button ────────────────────────────────────
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(60.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                brush = Brush.linearGradient(
                                    listOf(PrimaryContainer, Primary)
                                )
                            )
                            .clickable {
                                if (email.isBlank() || password.isBlank()) {
                                    scope.launch { snackbarHostState.showSnackbar("Please fill all fields") }
                                    return@clickable
                                }
                                if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                                    scope.launch { snackbarHostState.showSnackbar("Invalid email format") }
                                    return@clickable
                                }
                                val role = if (isDonator) "Donator" else "Organizer"
                                viewModel.login(LoginRequest(email.trim(), password, role))
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (uiState is AuthUiState.Loading) {
                            CircularProgressIndicator(
                                color = OnPrimary,
                                modifier = Modifier.size(24.dp),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Sign In",
                                style = MaterialTheme.typography.titleMedium.copy(
                                    fontWeight = FontWeight.Bold,
                                    color = OnPrimary
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // ── Create account link ───────────────────────────────
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Don't have an account? ",
                            style = MaterialTheme.typography.bodyMedium.copy(color = OnSurfaceVariant)
                        )
                        Text(
                            text = "Create an account",
                            modifier = Modifier.clickable {
                                navController.navigate(Screen.Register.route)
                            },
                            style = MaterialTheme.typography.bodyMedium.copy(
                                fontWeight = FontWeight.Bold,
                                color = Primary
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(40.dp))

                    // ── Footer links ──────────────────────────────────────
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "PRIVACY POLICY",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = Outline
                            ),
                            modifier = Modifier.clickable { }
                        )
                        Text(
                            text = "  ·  ",
                            style = MaterialTheme.typography.labelSmall.copy(color = Outline)
                        )
                        Text(
                            text = "TERMS OF SERVICE",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = Outline
                            ),
                            modifier = Modifier.clickable { }
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "COOKIE SETTINGS",
                            style = MaterialTheme.typography.labelSmall.copy(
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = Outline
                            ),
                            modifier = Modifier.clickable { }
                        )
                    }

                    Spacer(modifier = Modifier.height(32.dp))
                }
            }

            // ── Loading overlay ───────────────────────────────────────────
            if (uiState is AuthUiState.Loading) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.3f))
                        .clickable(enabled = false) {},
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Primary)
                }
            }
        }
    }
}