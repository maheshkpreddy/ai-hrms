import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/app_config.dart';
import '../models/user_model.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: Config.apiUrl,
    connectTimeout: Config.connectTimeout,
    receiveTimeout: Config.receiveTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(ref));
  return dio;
});

// Raw Dio without auth interceptor for login
final rawDioProvider = Provider<Dio>((ref) {
  return Dio(BaseOptions(
    baseUrl: Config.baseUrl,
    connectTimeout: Config.connectTimeout,
    receiveTimeout: Config.receiveTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));
});

class AuthInterceptor extends Interceptor {
  final Ref ref;
  AuthInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: Config.tokenKey);
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  return AuthNotifier(ref.watch(dioProvider), ref.watch(rawDioProvider));
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final Dio _dio;
  final Dio _rawDio;
  static const _storage = FlutterSecureStorage();

  AuthNotifier(this._dio, this._rawDio) : super(const AsyncValue.data(null)) {
    _loadSavedUser();
  }

  Future<void> _loadSavedUser() async {
    try {
      final userJson = await _storage.read(key: Config.userKey);
      if (userJson != null) {
        final user = UserModel.fromJson(json.decode(userJson));
        state = AsyncValue.data(user);
      }
    } catch (_) {}
  }

  Future<bool> login({
    required String companyCode,
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      // First verify company
      final companyRes = await _dio.get(
        '/companies',
        queryParameters: {'code': companyCode.toUpperCase()},
      );

      if (companyRes.statusCode == 200) {
        final companies = companyRes.data['companies'] as List?;
        if (companies == null || companies.isEmpty) {
          state = AsyncValue.error('Invalid company code', StackTrace.current);
          return false;
        }
      }

      // Login via NextAuth CSRF-protected endpoint
      // 1. Get CSRF token
      final csrfRes = await _rawDio.get('/api/auth/csrf');
      final csrfToken = csrfRes.data['csrfToken'];

      // 2. Sign in with credentials
      final loginRes = await _rawDio.post(
        '/api/auth/callback/credentials',
        data: 'csrfToken=${Uri.encodeComponent(csrfToken)}&email=${Uri.encodeComponent(email)}&password=${Uri.encodeComponent(password)}&companyCode=${Uri.encodeComponent(companyCode.toUpperCase())}',
        options: Options(
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          maxRedirects: 0,
          validateStatus: (status) => status != null && (status < 400 || status == 302),
        ),
      );

      // 3. Get session to retrieve user data
      final sessionRes = await _rawDio.get('/api/auth/session');
      if (sessionRes.statusCode == 200 && sessionRes.data['user'] != null) {
        final userData = sessionRes.data['user'] as Map<String, dynamic>;
        final user = UserModel.fromJson(userData);

        // Save token and user
        await _storage.write(key: Config.tokenKey, value: sessionRes.data['accessToken'] ?? 'session-token');
        await _storage.write(key: Config.userKey, value: json.encode(user.toJson()));
        await _storage.write(key: Config.companyCodeKey, value: companyCode.toUpperCase());

        state = AsyncValue.data(user);
        return true;
      }

      state = AsyncValue.error('Login failed - invalid credentials', StackTrace.current);
      return false;
    } on DioException catch (e) {
      // If redirect (302), it likely means login succeeded - try to get session
      if (e.response?.statusCode == 302) {
        try {
          final sessionRes = await _rawDio.get('/api/auth/session');
          if (sessionRes.statusCode == 200 && sessionRes.data['user'] != null) {
            final userData = sessionRes.data['user'] as Map<String, dynamic>;
            final user = UserModel.fromJson(userData);

            await _storage.write(key: Config.tokenKey, value: 'session-token');
            await _storage.write(key: Config.userKey, value: json.encode(user.toJson()));
            await _storage.write(key: Config.companyCodeKey, value: companyCode.toUpperCase());

            state = AsyncValue.data(user);
            return true;
          }
        } catch (_) {}
      }

      final message = e.response?.data?.toString() ?? 'Network error. Please try again.';
      state = AsyncValue.error(message, e.stackTrace);
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e.toString(), st);
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _rawDio.get('/api/auth/signout');
    } catch (_) {}
    await _storage.delete(key: Config.tokenKey);
    await _storage.delete(key: Config.userKey);
    state = const AsyncValue.data(null);
  }

  UserModel? get currentUser => state.value;
}
