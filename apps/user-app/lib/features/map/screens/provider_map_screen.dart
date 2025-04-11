import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

import '../models/provider_model.dart';
import '../widgets/provider_map_widget.dart';
import '../widgets/provider_detail_bottom_sheet.dart';
import '../../../services/api/provider_map_service.dart';

class ProviderMapScreen extends StatefulWidget {
  final ProviderMapService mapService;

  const ProviderMapScreen({
    super.key,
    required this.mapService,
  });

  @override
  State<ProviderMapScreen> createState() => _ProviderMapScreenState();
}

class _ProviderMapScreenState extends State<ProviderMapScreen> {
  Provider? _selectedProvider;
  final PersistentBottomSheetController? _bottomSheetController = null;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text('Find Healthcare Providers'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // Navigate to search screen or show search dialog
              _showSearchDialog();
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {
              // Show filter options
              _showFilterDialog();
            },
          ),
        ],
      ),
      body: ProviderMapWidget(
        mapService: widget.mapService,
        onProviderSelected: _onProviderSelected,
        showUserLocation: true,
      ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.my_location),
        onPressed: () {
          // Re-center map on user location
          // This will be handled by the map widget directly
        },
      ),
    );
  }

  void _onProviderSelected(Provider provider) {
    setState(() {
      _selectedProvider = provider;
    });
    
    // Show bottom sheet with provider details
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.4,
        minChildSize: 0.2,
        maxChildSize: 0.95,
        builder: (_, controller) => ProviderDetailBottomSheet(
          provider: provider,
          scrollController: controller,
          onBookAppointment: () {
            // Navigate to appointment booking screen
            Navigator.pop(context); // Close bottom sheet
            // Navigate to appointment screen
          },
        ),
      ),
    );
  }

  void _showSearchDialog() {
    // Implement search dialog or navigate to search screen
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Search for Providers'),
        content: TextField(
          decoration: const InputDecoration(
            hintText: 'Enter provider name, specialty, etc.',
          ),
          onSubmitted: (value) {
            // Perform search
            Navigator.pop(context);
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Perform search
              Navigator.pop(context);
            },
            child: const Text('Search'),
          ),
        ],
      ),
    );
  }

  void _showFilterDialog() {
    // Implement filter dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Providers'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              CheckboxListTile(
                title: const Text('Verified Providers Only'),
                value: false,
                onChanged: (value) {},
              ),
              CheckboxListTile(
                title: const Text('Registered Providers Only'),
                value: false,
                onChanged: (value) {},
              ),
              // Add more filter options here
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              // Apply filters
              Navigator.pop(context);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }
} 