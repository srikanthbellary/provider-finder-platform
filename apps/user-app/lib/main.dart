import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_maps_flutter_platform_interface/google_maps_flutter_platform_interface.dart';
import 'package:google_maps_flutter_web/google_maps_flutter_web.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

import 'features/map/screens/provider_map_screen.dart';
import 'services/api/provider_map_service.dart';
import 'services/config/api_config.dart';

void main() {
  // Initialize Google Maps for web
  if (kIsWeb) {
    setUrlStrategy(PathUrlStrategy());
    // Initialize the map platform
    GoogleMapsFlutterPlatform.instance = GoogleMapsPlugin();
  }
  runApp(const ProviderFinderApp());
}

class ProviderFinderApp extends StatelessWidget {
  const ProviderFinderApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialize services
    final apiConfig = ApiConfig(
      baseUrl: 'http://localhost:8081/api/map', // Update with the correct context path
    );
    
    final providerMapService = ProviderMapService(
      apiConfig: apiConfig,
    );

    return MaterialApp(
      title: 'Provider Finder',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        ),
        cardTheme: CardTheme(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('es'),
        // Add more supported languages here
      ],
      home: ProviderMapScreen(
        mapService: providerMapService,
      ),
    );
  }
} 