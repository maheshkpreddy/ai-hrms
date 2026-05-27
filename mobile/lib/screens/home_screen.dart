import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/auth_service.dart';
import '../config/app_config.dart';
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';

// Dashboard stats provider
final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final user = ref.watch(authProvider).value;
  if (user == null) return {};

  try {
    final response = await dio.get('/dashboard', queryParameters: {
      if (user.companyId != null) 'companyId': user.companyId,
    });
    return response.data ?? {};
  } catch (_) {
    return {};
  }
});

// Attendance today provider
final todayAttendanceProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final dio = ref.watch(dioProvider);
  final user = ref.watch(authProvider).value;
  if (user == null || user.employeeId == null) return null;

  try {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    final response = await dio.get('/attendance', queryParameters: {
      'employeeId': user.employeeId,
      'date': today,
    });
    final records = response.data['records'] as List?;
    if (records != null && records.isNotEmpty) return records[0] as Map<String, dynamic>;
    return null;
  } catch (_) {
    return null;
  }
});

// Leaves provider
final myLeavesProvider = FutureProvider<List<dynamic>>((ref) async {
  final dio = ref.watch(dioProvider);
  final user = ref.watch(authProvider).value;
  if (user == null || user.employeeId == null) return [];

  try {
    final response = await dio.get('/leaves', queryParameters: {
      'employeeId': user.employeeId,
      'limit': 20,
    });
    return response.data['leaves'] as List? ?? [];
  } catch (_) {
    return [];
  }
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final userAsync = ref.watch(authProvider);
    final user = userAsync.value;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Text(user?.companyName ?? Config.appName),
            if (user?.dashboard != null) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  _dashboardLabel(user!.dashboard!),
                  style: const TextStyle(fontSize: 10, color: Colors.white),
                ),
              ),
            ],
          ],
        ),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          PopupMenuButton(
            itemBuilder: (context) => [
              PopupMenuItem(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.teal,
                    child: Text(user?.initials ?? 'U', style: const TextStyle(color: Colors.white, fontSize: 14)),
                  ),
                  title: Text(user?.name ?? 'User'),
                  subtitle: Text(user?.role ?? 'Employee'),
                ),
                enabled: false,
              ),
              const PopupMenuEntry(divider: true),
              const PopupMenuItem(value: 'profile', child: Text('My Profile')),
              const PopupMenuItem(value: 'settings', child: Text('Settings')),
              const PopupMenuItem(value: 'logout', child: Text('Sign Out', style: TextStyle(color: Colors.red))),
            ],
            onSelected: (value) async {
              if (value == 'logout') {
                await ref.read(authProvider.notifier).logout();
              }
            },
          ),
        ],
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.access_time), label: 'Attendance'),
          NavigationDestination(icon: Icon(Icons.event_note), label: 'Leave'),
          NavigationDestination(icon: Icon(Icons.chat), label: 'AI Chat'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }

  String _dashboardLabel(String dashboard) {
    const labels = {
      'admin': 'Admin',
      'hr': 'HR',
      'payroll': 'Payroll',
      'manager': 'Manager',
      'employee': 'Employee',
      'recruiter': 'Recruiter',
      'learning': 'Learning',
    };
    return labels[dashboard] ?? dashboard;
  }

  List<Widget> get _screens => [
        const _DashboardTab(),
        const _AttendanceTab(),
        const _LeaveTab(),
        const _AIChatTab(),
        const _ProfileTab(),
      ];
}

class _DashboardTab extends ConsumerWidget {
  const _DashboardTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final statsAsync = ref.watch(dashboardStatsProvider);

    return RefreshIndicator(
      onRefresh: () => ref.refresh(dashboardStatsProvider.future),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Good ${_greeting()}, ${user?.name?.split(' ').first ?? 'User'}!',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            if (user?.role != null) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.teal.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(user!.role!, style: const TextStyle(color: Colors.teal, fontSize: 13, fontWeight: FontWeight.w500)),
              ),
            ],
            const SizedBox(height: 20),
            // Quick Actions
            Text('Quick Actions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.4,
              children: [
                _QuickActionCard(icon: Icons.access_time, label: 'Mark Attendance', color: Colors.teal, onTap: () {
                  // Navigate to attendance tab
                }),
                _QuickActionCard(icon: Icons.event_note, label: 'Apply Leave', color: Colors.blue, onTap: () {
                  // Navigate to leave tab
                }),
                _QuickActionCard(icon: Icons.receipt_long, label: 'View Payslip', color: Colors.green, onTap: () {}),
                _QuickActionCard(icon: Icons.smart_toy, label: 'AI Assistant', color: Colors.purple, onTap: () {}),
              ],
            ),
            const SizedBox(height: 20),
            // Today's Status
            Text('Today\'s Status', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Consumer(builder: (context, ref, _) {
              final attendanceAsync = ref.watch(todayAttendanceProvider);
              return attendanceAsync.when(
                data: (attendance) {
                  if (attendance == null) {
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline, color: Colors.orange),
                            const SizedBox(width: 12),
                            const Expanded(child: Text('No attendance record for today', style: TextStyle(fontSize: 14))),
                          ],
                        ),
                      ),
                    );
                  }
                  return Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              _StatusItem(label: 'Check In', value: attendance['checkIn'] ?? '--:--', icon: Icons.login, color: Colors.green),
                              _StatusItem(label: 'Check Out', value: attendance['checkOut'] ?? '--:--', icon: Icons.logout, color: Colors.red),
                              _StatusItem(label: 'Status', value: (attendance['status'] ?? 'N/A').toString().toUpperCase(), icon: Icons.check_circle, color: Colors.teal),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                },
                loading: () => const Card(child: Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))),
                error: (_, __) => const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Could not load attendance status'))),
              );
            }),
          ],
        ),
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }
}

class _StatusItem extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatusItem({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 11)),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 32, color: color),
              const SizedBox(height: 8),
              Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
            ],
          ),
        ),
      ),
    );
  }
}

class _AttendanceTab extends ConsumerStatefulWidget {
  const _AttendanceTab();

  @override
  ConsumerState<_AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends ConsumerState<_AttendanceTab> {
  bool _checkingIn = false;
  String? _message;

  Future<void> _handleCheckIn() async {
    setState(() { _checkingIn = true; _message = null; });

    try {
      final user = ref.read(authProvider).value;
      if (user == null || user.employeeId == null) {
        setState(() { _message = 'User not associated with an employee record'; _checkingIn = false; });
        return;
      }

      final dio = ref.read(dioProvider);
      final now = DateTime.now();
      final timeStr = DateFormat('HH:mm').format(now);
      final dateStr = DateFormat('yyyy-MM-dd').format(now);

      // Try to get location
      String? location;
      try {
        final permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          await Geolocator.requestPermission();
        }
        final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.low);
        location = 'Mobile (${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)})';
      } catch (_) {
        location = 'Mobile (location unavailable)';
      }

      await dio.post('/attendance', data: {
        'employeeId': user.employeeId,
        'date': dateStr,
        'checkIn': timeStr,
        'status': now.hour >= 10 ? 'late' : 'present',
        'shift': 'morning',
        'location': location,
      });

      setState(() { _message = 'Checked in at $timeStr'; });
      ref.invalidate(todayAttendanceProvider);
    } on DioException catch (e) {
      final error = e.response?.data;
      if (error is Map && error['error'] != null) {
        // If already checked in, try to check out instead
        if (error['error'].toString().contains('already exists')) {
          await _handleCheckOut();
          return;
        }
        setState(() { _message = error['error'].toString(); });
      } else {
        setState(() { _message = 'Failed to check in. Please try again.'; });
      }
    } catch (e) {
      setState(() { _message = 'Error: $e'; });
    } finally {
      setState(() { _checkingIn = false; });
    }
  }

  Future<void> _handleCheckOut() async {
    setState(() { _checkingIn = true; _message = null; });

    try {
      final user = ref.read(authProvider).value;
      if (user == null || user.employeeId == null) return;

      final dio = ref.read(dioProvider);
      final attendanceAsync = ref.read(todayAttendanceProvider);

      final todayRecord = await ref.read(todayAttendanceProvider.future);
      if (todayRecord == null) {
        setState(() { _message = 'No check-in record found for today'; _checkingIn = false; });
        return;
      }

      final now = DateTime.now();
      final timeStr = DateFormat('HH:mm').format(now);

      await dio.patch('/attendance', data: {
        'id': todayRecord['id'],
        'checkOut': timeStr,
      });

      setState(() { _message = 'Checked out at $timeStr'; });
      ref.invalidate(todayAttendanceProvider);
    } catch (e) {
      setState(() { _message = 'Failed to check out: $e'; });
    } finally {
      setState(() { _checkingIn = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final attendanceAsync = ref.watch(todayAttendanceProvider);
    final now = DateTime.now();
    final timeStr = DateFormat('HH:mm:ss').format(now);

    return RefreshIndicator(
      onRefresh: () => ref.refresh(todayAttendanceProvider.future),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const SizedBox(height: 20),
            // Clock display
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.teal, width: 3),
              ),
              child: Column(
                children: [
                  Text(DateFormat('HH:mm').format(now), style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.teal)),
                  Text(DateFormat('dd MMM yyyy').format(now), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Today's attendance info
            attendanceAsync.when(
              data: (attendance) {
                final checkedIn = attendance?['checkIn'] != null;
                final checkedOut = attendance?['checkOut'] != null;
                final status = attendance?['status']?.toString() ?? 'Not recorded';

                return Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _TimeDisplay(label: 'Check In', time: attendance?['checkIn'] ?? '--:--', color: Colors.green),
                            Container(width: 1, height: 40, color: Colors.grey.shade300),
                            _TimeDisplay(label: 'Check Out', time: attendance?['checkOut'] ?? '--:--', color: Colors.red),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: _statusColor(status).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text('Status: ${status.toUpperCase()}', style: TextStyle(color: _statusColor(status), fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                );
              },
              loading: () => const Card(child: Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator()))),
              error: (_, __) => const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Could not load attendance'))),
            ),

            const SizedBox(height: 24),

            // Action buttons
            if (_message != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: _message!.contains('Failed') || _message!.contains('Error') ? Colors.red.withOpacity(0.1) : Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_message!, style: TextStyle(color: _message!.contains('Failed') || _message!.contains('Error') ? Colors.red : Colors.green)),
              ),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: _checkingIn ? null : _handleCheckIn,
                icon: _checkingIn
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.login),
                label: Text(_checkingIn ? 'Processing...' : 'Check In / Check Out'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'present': return Colors.green;
      case 'absent': return Colors.red;
      case 'late': return Colors.orange;
      case 'half-day': return Colors.amber;
      default: return Colors.grey;
    }
  }
}

class _TimeDisplay extends StatelessWidget {
  final String label;
  final String time;
  final Color color;

  const _TimeDisplay({required this.label, required this.time, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(time, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }
}

class _LeaveTab extends ConsumerStatefulWidget {
  const _LeaveTab();

  @override
  ConsumerState<_LeaveTab> createState() => _LeaveTabState();
}

class _LeaveTabState extends ConsumerState<_LeaveTab> {
  final _formKey = GlobalKey<FormState>();
  String _leaveType = 'casual';
  final _reasonController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  bool _submitting = false;

  Future<void> _submitLeave() async {
    if (!_formKey.currentState!.validate() || _startDate == null || _endDate == null) return;

    setState(() => _submitting = true);

    try {
      final user = ref.read(authProvider).value;
      if (user == null || user.employeeId == null) return;

      final dio = ref.read(dioProvider);
      final days = _endDate!.difference(_startDate!).inDays + 1;

      await dio.post('/leaves', data: {
        'employeeId': user.employeeId,
        'leaveType': _leaveType,
        'startDate': DateFormat('yyyy-MM-dd').format(_startDate!),
        'endDate': DateFormat('yyyy-MM-dd').format(_endDate!),
        'days': days,
        'reason': _reasonController.text.trim(),
      });

      _reasonController.clear();
      setState(() { _startDate = null; _endDate = null; });
      ref.invalidate(myLeavesProvider);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Leave application submitted!'), backgroundColor: Colors.green));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to submit: $e'), backgroundColor: Colors.red));
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final leavesAsync = ref.watch(myLeavesProvider);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Apply Leave Form
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Apply for Leave', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _leaveType,
                      decoration: const InputDecoration(
                        labelText: 'Leave Type',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'casual', child: Text('Casual Leave')),
                        DropdownMenuItem(value: 'sick', child: Text('Sick Leave')),
                        DropdownMenuItem(value: 'earned', child: Text('Earned Leave')),
                        DropdownMenuItem(value: 'maternity', child: Text('Maternity Leave')),
                        DropdownMenuItem(value: 'paternity', child: Text('Paternity Leave')),
                      ],
                      onChanged: (v) => setState(() => _leaveType = v!),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              final date = await showDatePicker(context: context, initialDate: DateTime.now(), firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
                              if (date != null) setState(() => _startDate = date);
                            },
                            icon: const Icon(Icons.calendar_today, size: 16),
                            label: Text(_startDate != null ? DateFormat('dd MMM').format(_startDate!) : 'Start Date'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () async {
                              final date = await showDatePicker(context: context, initialDate: _startDate ?? DateTime.now(), firstDate: _startDate ?? DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 365)));
                              if (date != null) setState(() => _endDate = date);
                            },
                            icon: const Icon(Icons.calendar_today, size: 16),
                            label: Text(_endDate != null ? DateFormat('dd MMM').format(_endDate!) : 'End Date'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _reasonController,
                      decoration: const InputDecoration(labelText: 'Reason', border: OutlineInputBorder()),
                      maxLines: 2,
                      validator: (v) => v?.trim().isEmpty == true ? 'Reason is required' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _submitting ? null : _submitLeave,
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.teal, foregroundColor: Colors.white),
                        child: _submitting
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Submit Leave'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          // Leave History
          const Text('Leave History', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          leavesAsync.when(
            data: (leaves) {
              if (leaves.isEmpty) return const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('No leave records found')));
              return Column(
                children: leaves.map((leave) {
                  final status = leave['status']?.toString() ?? 'pending';
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: Icon(Icons.event_note, color: _leaveStatusColor(status)),
                      title: Text('${leave['leaveType']?.toString().toUpperCase() ?? 'Leave'} - ${leave['days'] ?? 0} day(s)'),
                      subtitle: Text('${leave['startDate'] ?? ''} to ${leave['endDate'] ?? ''}'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: _leaveStatusColor(status).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(status.toUpperCase(), style: TextStyle(color: _leaveStatusColor(status), fontSize: 11, fontWeight: FontWeight.w600)),
                      ),
                    ),
                  );
                }).toList(),
              );
            },
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (_, __) => const Center(child: Text('Could not load leaves')),
          ),
        ],
      ),
    );
  }

  Color _leaveStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'approved': return Colors.green;
      case 'rejected': return Colors.red;
      case 'pending': return Colors.orange;
      default: return Colors.grey;
    }
  }
}

class _AIChatTab extends ConsumerStatefulWidget {
  const _AIChatTab();

  @override
  ConsumerState<_AIChatTab> createState() => _AIChatTabState();
}

class _AIChatTabState extends ConsumerState<_AIChatTab> {
  final _controller = TextEditingController();
  final List<_ChatMessage> _messages = [];
  bool _loading = false;

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
      _loading = true;
    });
    _controller.clear();

    try {
      final dio = ref.read(dioProvider);
      final response = await dio.post('/ai-chat', data: {'message': text});
      final reply = response.data['response']?.toString() ?? 'I couldn\'t process that. Please try again.';
      setState(() {
        _messages.add(_ChatMessage(text: reply, isUser: false));
      });
    } catch (e) {
      setState(() {
        _messages.add(_ChatMessage(text: 'Sorry, I couldn\'t connect to the AI service. Please try again later.', isUser: false));
      });
    } finally {
      setState(() { _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: _messages.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.smart_toy, size: 64, color: Colors.purple),
                      const SizedBox(height: 16),
                      const Text('AI HR Assistant', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      const Text('Ask me anything about HR policies,\nleave rules, company benefits, etc.', style: TextStyle(color: Colors.grey), textAlign: TextAlign.center),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) => _messages[index],
                ),
        ),
        if (_loading) const Padding(padding: EdgeInsets.all(8), child: CircularProgressIndicator()),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Colors.grey.shade300)),
          ),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: InputDecoration(
                    hintText: 'Ask something...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  ),
                  onSubmitted: (_) => _sendMessage(),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: _loading ? null : _sendMessage,
                icon: const Icon(Icons.send, color: Colors.teal),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ChatMessage extends StatelessWidget {
  final String text;
  final bool isUser;

  const _ChatMessage({required this.text, required this.isUser});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isUser ? Colors.teal : Colors.grey.shade200,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(text, style: TextStyle(color: isUser ? Colors.white : Colors.black87, fontSize: 14)),
      ),
    );
  }
}

class _ProfileTab extends ConsumerWidget {
  const _ProfileTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 16),
          CircleAvatar(
            radius: 48,
            backgroundColor: Colors.teal,
            child: Text(user?.initials ?? 'U', style: const TextStyle(fontSize: 24, color: Colors.white)),
          ),
          const SizedBox(height: 16),
          Text(user?.name ?? 'User', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(user?.role ?? 'Employee', style: const TextStyle(color: Colors.grey, fontSize: 16)),
          if (user?.companyName != null) ...[
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.teal.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(user!.companyName!, style: const TextStyle(color: Colors.teal, fontSize: 13)),
            ),
          ],
          if (user?.dashboard != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text('Dashboard: ${user!.dashboard!}', style: const TextStyle(color: Colors.blue, fontSize: 12)),
            ),
          ],
          const SizedBox(height: 32),
          ListTile(leading: const Icon(Icons.email), title: Text(user?.email ?? ''), subtitle: const Text('Email')),
          ListTile(leading: const Icon(Icons.business), title: Text(user?.companyCode ?? 'N/A'), subtitle: const Text('Company Code')),
          ListTile(leading: const Icon(Icons.badge), title: Text(user?.role ?? 'Employee'), subtitle: const Text('Role')),
          ListTile(leading: const Icon(Icons.dashboard), title: Text(user?.dashboard ?? 'employee'), subtitle: const Text('Dashboard Type')),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
            onTap: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
    );
  }
}
