import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  return AuthNotifier(ref.watch(dioProvider));
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final Dio _dio;
  static const _storage = FlutterSecureStorage();

  AuthNotifier(this._dio) : super(const AsyncValue.data(null)) {
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

      // Login via NextAuth credentials
      final loginRes = await _dio.post('/auth/callback/credentials', data: {
        'email': email,
        'password': password,
        'companyCode': companyCode.toUpperCase(),
      });

      if (loginRes.statusCode == 200) {
        // Get session to retrieve user data
        final sessionRes = await _dio.get('/auth/session');
        if (sessionRes.statusCode == 200 && sessionRes.data['user'] != null) {
          final user = UserModel.fromJson(sessionRes.data['user']);

          // Save token and user
          await _storage.write(key: Config.tokenKey, value: sessionRes.data['accessToken'] ?? 'session');
          await _storage.write(key: Config.userKey, value: json.encode(user.toJson()));
          await _storage.write(key: Config.companyCodeKey, value: companyCode.toUpperCase());

          state = AsyncValue.data(user);
          return true;
        }
      }

      state = AsyncValue.error('Login failed', StackTrace.current);
      return false;
    } on DioException catch (e) {
      final message = e.response?.data?.toString() ?? 'Network error. Please try again.';
      state = AsyncValue.error(message, e.stackTrace);
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e.toString(), st);
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: Config.tokenKey);
    await _storage.delete(key: Config.userKey);
    state = const AsyncValue.data(null);
  }

  UserModel? get currentUser {
    return state.value;
  }
}
