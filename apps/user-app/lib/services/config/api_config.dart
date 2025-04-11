class ApiConfig {
  final String baseUrl;
  final int timeout;

  ApiConfig({
    String? baseUrl,
    int? timeout,
  })  : baseUrl = baseUrl ?? 'http://localhost:8081',
        timeout = timeout ?? 30; // Default timeout in seconds
} 