package com.aidup.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.*
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.aidup.app.navigation.Screen
import com.aidup.app.network.TokenManager
import com.aidup.app.ui.theme.*
import com.aidup.app.ui.viewmodels.AuthUiState
import com.aidup.app.ui.viewmodels.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OTPVerificationScreen(
    navController: NavController,
    viewModel: AuthViewModel = viewModel()
) {
    var otpValue by remember { mutableStateOf("") }
    val uiState = viewModel.uiState
    val snackbarHostState = remember { SnackbarHostState() }
    val userEmail = TokenManager.getUserEmail() ?: "your email"

    LaunchedEffect(uiState) {
        when (uiState) {
            is AuthUiState.Success -> {
                val role = TokenManager.getUserRole()?.lowercase() ?: "donator"
                val destination = if (role == "organizer") Screen.OrganizerDashboard.route else Screen.HomeFeed.route
                
                navController.navigate(destination) {
                    popUpTo(Screen.Login.route) { inclusive = true }
                    // Also pop the OTP screen itself
                    popUpTo(Screen.OTPVerification.route) { inclusive = true }
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
        containerColor = Background,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Verification", style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold)) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryContainer)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Background)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(32.dp))
            // Shield Icon
            Surface(
                modifier = Modifier.size(64.dp),
                shape = CircleShape,
                color = SecondaryFixed
            ) {
                Icon(Icons.Default.Security, contentDescription = null, tint = Secondary, modifier = Modifier.padding(16.dp))
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Text("Enter Verification Code", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.ExtraBold), color = OnSurface)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                "We've sent a 6-digit code to $userEmail. Please enter it below to continue.",
                style = MaterialTheme.typography.bodyMedium,
                color = OnSurfaceVariant,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // OTP Input
            BasicTextField(
                value = otpValue,
                onValueChange = { if (it.length <= 6) otpValue = it },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                decorationBox = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        repeat(6) { index ->
                            val char = when {
                                index >= otpValue.length -> ""
                                else -> otpValue[index].toString()
                            }
                            val isFocused = otpValue.length == index
                            
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .aspectRatio(1f)
                                    .padding(4.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(SurfaceContainerLowest)
                                    .border(
                                        2.dp,
                                        if (isFocused) PrimaryContainer else Color.Transparent,
                                        RoundedCornerShape(12.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = char,
                                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                                    color = if (char.isNotEmpty()) Primary else OnSurface.copy(alpha = 0.2f)
                                )
                                if (isFocused) {
                                    Text("|", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold), color = PrimaryContainer)
                                } else if (char.isEmpty() && !isFocused) {
                                    Text("0", style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold), color = OnSurface.copy(alpha = 0.2f))
                                }
                            }
                        }
                    }
                }
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Row(horizontalArrangement = Arrangement.Center, modifier = Modifier.fillMaxWidth()) {
                Text("Didn't receive the code? ", style = MaterialTheme.typography.labelLarge, color = OnSurfaceVariant)
                Text("Resend in 00:54", style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold), color = PrimaryContainer)
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            Button(
                onClick = {
                    if (otpValue.length == 6) {
                        viewModel.verifyEmail(userEmail, otpValue)
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                contentPadding = PaddingValues(0.dp),
                shape = RoundedCornerShape(12.dp),
                enabled = uiState !is AuthUiState.Loading
            ) {
                Box(modifier = Modifier.fillMaxSize().background(Brush.linearGradient(listOf(PrimaryContainer, Primary))), contentAlignment = Alignment.Center) {
                    if (uiState is AuthUiState.Loading) {
                        CircularProgressIndicator(color = OnPrimary, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Verify & Continue", style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold))
                    }
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
