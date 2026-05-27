class UserModel {
  final String id;
  final String email;
  final String name;
  final String? avatar;
  final String role;
  final String? roleId;
  final int roleLevel;
  final String? permissions;
  final String? employeeId;
  final String? companyId;
  final String? companyCode;
  final String? companyName;
  final String? dashboard;
  final String? menuItems;
  final String? roleColor;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.avatar,
    required this.role,
    this.roleId,
    this.roleLevel = 4,
    this.permissions,
    this.employeeId,
    this.companyId,
    this.companyCode,
    this.companyName,
    this.dashboard,
    this.menuItems,
    this.roleColor,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      avatar: json['avatar'],
      role: json['role'] ?? 'Employee',
      roleId: json['roleId'],
      roleLevel: json['roleLevel'] ?? 4,
      permissions: json['permissions'],
      employeeId: json['employeeId'],
      companyId: json['companyId'],
      companyCode: json['companyCode'],
      companyName: json['companyName'],
      dashboard: json['dashboard'],
      menuItems: json['menuItems'],
      roleColor: json['roleColor'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'avatar': avatar,
      'role': role,
      'roleId': roleId,
      'roleLevel': roleLevel,
      'permissions': permissions,
      'employeeId': employeeId,
      'companyId': companyId,
      'companyCode': companyCode,
      'companyName': companyName,
      'dashboard': dashboard,
      'menuItems': menuItems,
      'roleColor': roleColor,
    };
  }

  List<String> get allowedModules {
    if (menuItems == null || menuItems!.isEmpty) return [];
    try {
      return List<String>.from(
        menuItems!.split(',').map((e) => e.trim().replaceAll('[', '').replaceAll(']', '').replaceAll('"', '')),
      );
    } catch (_) {
      return [];
    }
  }

  String get initials {
    return name.split(' ').map((n) => n[0]).join('').substring(0, name.split(' ').length > 1 ? 2 : 1).toUpperCase();
  }
}

class CompanyModel {
  final String id;
  final String name;
  final String code;
  final String? industry;
  final String? city;
  final String? country;
  final String? email;
  final String? phone;
  final String? logo;
  final String? subscription;
  final bool isActive;

  CompanyModel({
    required this.id,
    required this.name,
    required this.code,
    this.industry,
    this.city,
    this.country,
    this.email,
    this.phone,
    this.logo,
    this.subscription,
    this.isActive = true,
  });

  factory CompanyModel.fromJson(Map<String, dynamic> json) {
    return CompanyModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      code: json['code'] ?? '',
      industry: json['industry'],
      city: json['city'],
      country: json['country'],
      email: json['email'],
      phone: json['phone'],
      logo: json['logo'],
      subscription: json['subscription'],
      isActive: json['isActive'] ?? true,
    );
  }
}
