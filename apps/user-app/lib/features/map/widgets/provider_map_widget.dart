import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';

import '../models/provider_model.dart';
import '../models/provider_search_request_model.dart';
import '../models/provider_search_response_model.dart';
import '../../../services/api/provider_map_service.dart';

class ProviderMapWidget extends StatefulWidget {
  final ProviderMapService mapService;
  final Function(Provider) onProviderSelected;
  final LatLng? initialLocation;
  final bool showUserLocation;

  const ProviderMapWidget({
    super.key,
    required this.mapService,
    required this.onProviderSelected,
    this.initialLocation,
    this.showUserLocation = true,
  });

  @override
  State<ProviderMapWidget> createState() => _ProviderMapWidgetState();
}

class _ProviderMapWidgetState extends State<ProviderMapWidget> {
  final Completer<GoogleMapController> _controller = Completer();
  final Set<Marker> _markers = {};
  late CameraPosition _initialCameraPosition;
  
  LatLng? _userLocation;
  bool _isLoading = false;
  List<Provider> _providers = [];
  
  // Debounce for map movement
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _initialCameraPosition = CameraPosition(
      target: widget.initialLocation ?? const LatLng(37.42796133580664, -122.085749655962),
      zoom: 14.0,
    );
    
    if (widget.showUserLocation) {
      _getUserLocation();
    }
  }
  
  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Stack(
        children: [
          GoogleMap(
            mapType: MapType.normal,
            initialCameraPosition: _initialCameraPosition,
            markers: _markers,
            myLocationEnabled: widget.showUserLocation,
            myLocationButtonEnabled: widget.showUserLocation,
            onMapCreated: (GoogleMapController controller) {
              _controller.complete(controller);
              _fetchProvidersInCurrentViewport();
            },
            onCameraIdle: () {
              // Camera movement stopped, fetch providers
              _fetchProvidersInCurrentViewport();
            },
            onCameraMove: (_) {
              // Debounce camera movement
              if (_debounce?.isActive ?? false) _debounce?.cancel();
              _debounce = Timer(const Duration(milliseconds: 500), () {
                // This will be called when camera movement stops for 500ms
              });
            },
          ),
          if (_isLoading) 
            const Center(
              child: CircularProgressIndicator(),
            ),
        ],
      ),
    );
  }

  Future<void> _getUserLocation() async {
    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      setState(() {
        _userLocation = LatLng(position.latitude, position.longitude);
      });
      
      // Move camera to user location
      final GoogleMapController controller = await _controller.future;
      controller.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            target: _userLocation!,
            zoom: 14.0,
          ),
        ),
      );
    } catch (e) {
      debugPrint('Error getting user location: $e');
    }
  }

  Future<void> _fetchProvidersInCurrentViewport() async {
    final GoogleMapController controller = await _controller.future;
    final LatLngBounds bounds = await controller.getVisibleRegion();
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final response = await widget.mapService.getProvidersInViewport(
        northLat: bounds.northeast.latitude,
        southLat: bounds.southwest.latitude,
        eastLng: bounds.northeast.longitude,
        westLng: bounds.southwest.longitude,
        userLat: _userLocation?.latitude,
        userLng: _userLocation?.longitude,
        sortBy: 'distance',
        sortDirection: 'asc',
        page: 1,
        pageSize: 50,
      );
      
      setState(() {
        _providers = response.providers;
        _updateMarkers();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      debugPrint('Error fetching providers: $e');
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading providers: $e')),
      );
    }
  }
  
  void _updateMarkers() {
    final Set<Marker> markers = {};
    
    // Add provider markers
    for (final provider in _providers) {
      if (provider.locations.isEmpty) continue;
      
      final location = provider.locations.first;
      final marker = Marker(
        markerId: MarkerId('provider_${provider.id}'),
        position: LatLng(location.latitude, location.longitude),
        infoWindow: InfoWindow(
          title: provider.name,
          snippet: provider.providerType ?? 'Healthcare Provider',
          onTap: () {
            widget.onProviderSelected(provider);
          },
        ),
      );
      
      markers.add(marker);
    }
    
    setState(() {
      _markers.clear();
      _markers.addAll(markers);
    });
  }
} 