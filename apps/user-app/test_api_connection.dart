import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  // Define the API URL with correct context path
  final apiUrl = 'http://localhost:8081/api/map/providers/map';
  
  // Create viewport query parameters (you may need to adjust these coordinates)
  final queryParams = {
    'northLat': '17.550',
    'southLat': '17.300',
    'eastLng': '78.600',
    'westLng': '78.300',
    'verifiedOnly': 'false',
    'registeredOnly': 'false',
    'page': '1',
    'pageSize': '20',
    'sortBy': 'distance',
    'sortDirection': 'asc',
  };
  
  // Build the URL with query parameters
  final url = Uri.parse(apiUrl).replace(queryParameters: queryParams);
  
  print('Connecting to: $url');
  
  try {
    // Send the request
    final response = await http.get(
      url,
      headers: {
        'Accept': 'application/json',
      },
    );
    
    // Check if successful
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      print('Connection successful!');
      print('Found ${data['totalCount']} providers');
      print('Providers in viewport: ${data['viewportMetadata']['providersInViewport']}');
      
      // Print all providers
      print('\nProviders in response:');
      for (var i = 0; i < data['providers'].length; i++) {
        final provider = data['providers'][i];
        print('\nProvider ${i+1}:');
        print('ID: ${provider['id']}');
        print('Name: ${provider['name']}');
        print('Type: ${provider['providerType']}');
        print('Verified: ${provider['isVerified']}');
        
        if (provider['locations'] != null && provider['locations'].isNotEmpty) {
          final location = provider['locations'][0];
          print('Location: ${location['city']}, ${location['state']}');
          print('Coordinates: (${location['latitude']}, ${location['longitude']})');
        } else {
          print('No location data available');
        }
        
        if (provider['specialties'] != null && provider['specialties'].isNotEmpty) {
          print('Specialties: ${provider['specialties'].join(', ')}');
        }
        
        if (provider['languages'] != null && provider['languages'].isNotEmpty) {
          print('Languages: ${provider['languages'].join(', ')}');
        }
      }
      print('\nPagination:');
      print('Page: ${data['page']}/${data['totalPages']}');
      print('Total providers: ${data['totalCount']}');
      print('Page size: ${data['pageSize']}');
    } else {
      print('API Error: Status code ${response.statusCode}');
      print('Response: ${response.body}');
    }
  } catch (e) {
    print('Connection failed: $e');
  }
} 