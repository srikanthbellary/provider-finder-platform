import 'provider_model.dart';
import 'viewport_model.dart';

class ProviderSearchResponse {
  final List<Provider> providers;
  final int totalCount;
  final int page;
  final int pageSize;
  final int totalPages;
  final Viewport viewportMetadata;

  ProviderSearchResponse({
    required this.providers,
    required this.totalCount,
    required this.page,
    required this.pageSize,
    required this.totalPages,
    required this.viewportMetadata,
  });

  factory ProviderSearchResponse.fromJson(Map<String, dynamic> json) {
    return ProviderSearchResponse(
      providers: (json['providers'] as List)
          .map((provider) => Provider.fromJson(provider))
          .toList(),
      totalCount: json['totalCount'],
      page: json['page'],
      pageSize: json['pageSize'],
      totalPages: json['totalPages'],
      viewportMetadata: Viewport.fromJson(json['viewportMetadata']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'providers': providers.map((provider) => provider.toJson()).toList(),
      'totalCount': totalCount,
      'page': page,
      'pageSize': pageSize,
      'totalPages': totalPages,
      'viewportMetadata': viewportMetadata.toJson(),
    };
  }

  bool get hasMorePages => page < totalPages;
} 