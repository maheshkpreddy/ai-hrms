# AI-HRMS Mobile App

A Flutter-based mobile application for AI-HRMS, providing on-the-go access to HR functions.

## Features
- Company-wise login with role-based access
- Employee self-service portal
- Attendance marking with geolocation
- Leave application and tracking
- Payroll and payslip viewing
- AI HR Assistant chatbot
- Push notifications
- Biometric authentication

## Setup
```bash
flutter pub get
flutter run
```

## Building
```bash
flutter build apk --release  # Android
flutter build ios --release   # iOS
```

## Architecture
- **State Management**: Riverpod
- **HTTP Client**: Dio
- **Local Storage**: Hive
- **Authentication**: JWT + Biometric
- **API**: Connects to AI-HRMS backend at configured BASE_URL
