import 'dart:convert';
import 'package:http/http.dart' as http;

import '../../features/map/models/provider_search_request_model.dart';
import '../../features/map/models/provider_search_response_model.dart';
import '../config/api_config.dart';

class ProviderMapService {
  final http.Client _httpClient;
  final ApiConfig _apiConfig;

  ProviderMapService({
    http.Client? httpClient,
    ApiConfig? apiConfig,
  }) : 
    _httpClient = httpClient ?? http.Client(),
    _apiConfig = apiConfig ?? ApiConfig();

  /// Searches for providers using the POST endpoint with full request body
  Future<ProviderSearchResponse> searchProviders(ProviderSearchRequest request) async {
    final url = Uri.parse('${_apiConfig.baseUrl}/providers/search');
    
    try {
      final response = await _httpClient.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(request.toJson()),
      );

      if (response.statusCode == 200) {
        final decodedResponse = jsonDecode(response.body);
        return ProviderSearchResponse.fromJson(decodedResponse);
      } else {
        throw Exception('Failed to search providers: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error searching providers: $e');
    }
  }

  /// Gets providers using the simplified GET endpoint
  Future<ProviderSearchResponse> getProvidersInViewport({
    required double northLat,
    required double southLat,
    required double eastLng,
    required double westLng,
    String? searchTerm,
    List<int>? specialtyIds,
    List<int>? providerTypeIds,
    List<int>? languageIds,
    bool verifiedOnly = false,
    bool registeredOnly = false,
    int page = 1,
    int pageSize = 20,
    double? userLat,
    double? userLng,
    String sortBy = 'distance',
    String sortDirection = 'asc',
  }) async {
    final queryParams = {
      'northLat': northLat.toString(),
      'southLat': southLat.toString(),
      'eastLng': eastLng.toString(),
      'westLng': westLng.toString(),
      'verifiedOnly': verifiedOnly.toString(),
      'registeredOnly': registeredOnly.toString(),
      'page': page.toString(),
      'pageSize': pageSize.toString(),
      'sortBy': sortBy,
      'sortDirection': sortDirection,
    };

    if (searchTerm != null && searchTerm.isNotEmpty) {
      queryParams['searchTerm'] = searchTerm;
    }

    if (specialtyIds != null && specialtyIds.isNotEmpty) {
      for (var i = 0; i < specialtyIds.length; i++) {
        queryParams['specialtyIds[$i]'] = specialtyIds[i].toString();
      }
    }

    if (providerTypeIds != null && providerTypeIds.isNotEmpty) {
      for (var i = 0; i < providerTypeIds.length; i++) {
        queryParams['providerTypeIds[$i]'] = providerTypeIds[i].toString();
      }
    }

    if (languageIds != null && languageIds.isNotEmpty) {
      for (var i = 0; i < languageIds.length; i++) {
        queryParams['languageIds[$i]'] = languageIds[i].toString();
      }
    }

    if (userLat != null && userLng != null) {
      queryParams['userLat'] = userLat.toString();
      queryParams['userLng'] = userLng.toString();
    }

    final url = Uri.parse('${_apiConfig.baseUrl}/providers/map')
        .replace(queryParameters: queryParams);

    try {
      final response = await _httpClient.get(
        url,
        headers: {
          'Accept': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final decodedResponse = jsonDecode(response.body);
        return ProviderSearchResponse.fromJson(decodedResponse);
      } else {
        throw Exception('Failed to get providers: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error getting providers: $e');
    }
  }
} 