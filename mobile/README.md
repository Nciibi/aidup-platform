<h1 align="center">
  🕊️ AidUp
</h1>

<p align="center">
  <strong>A modern Android platform built to assist those in need, support animal adoption, and provide humanitarian relief.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=flat-square&logo=android" alt="Platform">
  <img src="https://img.shields.io/badge/Language-Kotlin-7F52FF?style=flat-square&logo=kotlin" alt="Language">
  <img src="https://img.shields.io/badge/UI-Jetpack_Compose-4285F4?style=flat-square&logo=android" alt="Jetpack Compose">
</p>

---

## 📖 Overview

**AidUp** is designed to connect individuals willing to help with causes that desperately need attention. Whether it's feeding the hungry, adopting a rescue dog, or sending relief supplies to international conflict zones like Ukraine and Palestine, AidUp provides a seamless, beautiful, and intuitive interface to discover and support these missions.

## ✨ Features

- 🌟 **Welcome Experience:** A beautiful onboarding screen inviting users to explore ways to help.
- 🗂️ **Categorized Listings:** Easily find causes categorized by:
  - 🧍 **People:** Medical aid, food, shelter.
  - 🐾 **Animals:** Adoptions, shelter support, veterinary assistance.
  - 🌍 **Countries:** Emergency humanitarian aid for regions like Ukraine and Palestine.
- 🔍 **Detailed Insights:** View comprehensive descriptions, funding progress (Raised vs. Goal), and specific calls to action for every single cause.
- 🎨 **Modern Design:** Built entirely with Jetpack Compose using Material Design 3 guidelines, complete with dynamic theming and responsive layouts.

## 🛠️ Tech Stack

- **[Kotlin](https://kotlinlang.org/):** First-class and official programming language for Android development.
- **[Jetpack Compose](https://developer.android.com/jetpack/compose):** Android’s modern toolkit for building native UI. It simplifies and accelerates UI development on Android.
- **[Navigation Compose](https://developer.android.com/jetpack/compose/navigation):** Handling transitions and data passing between screens.
- **Material Design 3:** For cutting-edge standard styling and fluid UI components.

## 📂 Project Structure

```text
app/src/main/java/com/aidup/app/
│
├── models/
│   ├── AidItem.kt          # Data structure representing a donation/cause
│   └── DonationCategory.kt # Enum for People, Animals, Countries
│
├── navigation/
│   └── AppNavigation.kt    # Compose Navigation definitions
│
├── ui/
│   ├── screens/
│   │   ├── WelcomeScreen.kt # Landing page
│   │   ├── ListingScreen.kt # Tabbed listings for all causes
│   │   └── DetailsScreen.kt # Detailed description and donation interaction
│   │
│   └── theme/
│       ├── Color.kt         # Color palette definitions
│       └── Theme.kt         # Material theme setup
│
└── MainActivity.kt         # Entry point and NavHost
```

## 🚀 Getting Started

To run this application, you will need Android Studio.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/AidUp.git
   ```
2. **Open the project** in Android Studio (Arctic Fox or newer recommended).
3. **Sync Project with Gradle Files** to ensure all dependencies are downloaded.
4. **Run the app** on an emulator or a physical Android device.

## 🤝 How to Contribute

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<p align="center">
  <i>"No one has ever become poor by giving." - Anne Frank</i>
</p>
