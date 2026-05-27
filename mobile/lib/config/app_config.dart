class Config {
  // Base URL for the AI-HRMS API - change this for your deployment
  static const String baseUrl = String.fromEnvironment(
    'BASE_URL',
    defaultValue: 'https://ai-hrms-rho.vercel.app',
  );

  static const String apiVersion = '/api';
  static String get apiUrl => '$baseUrl$apiVersion';

  // API Endpoints
  static String get authUrl => '$apiUrl/auth';
  static String get dashboardUrl => '$apiUrl/dashboard';
  static String get employeesUrl => '$apiUrl/employees';
  static String get companiesUrl => '$apiUrl/companies';
  static String get attendanceUrl => '$apiUrl/attendance';
  static String get leavesUrl => '$apiUrl/leaves';
  static String get payrollUrl => '$apiUrl/payroll';
  static String get expensesUrl => '$apiUrl/expenses';
  static String get performanceUrl => '$apiUrl/performance';
  static String get jobsUrl => '$apiUrl/jobs';
  static String get candidatesUrl => '$apiUrl/candidates';
  static String get skillsUrl => '$apiUrl/skills';
  static String get coursesUrl => '$apiUrl/courses';
  static String get documentsUrl => '$apiUrl/documents';
  static String get assetsUrl => '$apiUrl/assets';
  static String get shiftsUrl => '$apiUrl/shifts';
  static String get holidaysUrl => '$apiUrl/holidays';
  static String get policiesUrl => '$apiUrl/policies';
  static String get auditUrl => '$apiUrl/audit';
  static String get aiChatUrl => '$apiUrl/ai-chat';
  static String get rolesUrl => '$apiUrl/roles';

  // App Info
  static const String appName = 'AI-HRMS';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Smart HR Management';

  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String companyCodeKey = 'company_code';
  static const String biometricKey = 'biometric_enabled';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
