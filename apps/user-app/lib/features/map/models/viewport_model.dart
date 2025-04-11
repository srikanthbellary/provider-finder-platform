class Viewport {
  final double northLat;
  final double southLat;
  final double eastLng;
  final double westLng;
  final int? providersInViewport;
  final int? filteredCount;

  Viewport({
    required this.northLat,
    required this.southLat,
    required this.eastLng,
    required this.westLng,
    this.providersInViewport,
    this.filteredCount,
  });

  factory Viewport.fromJson(Map<String, dynamic> json) {
    return Viewport(
      northLat: json['northLat'],
      southLat: json['southLat'],
      eastLng: json['eastLng'],
      westLng: json['westLng'],
      providersInViewport: json['providersInViewport'],
      filteredCount: json['filteredCount'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'northLat': northLat,
      'southLat': southLat,
      'eastLng': eastLng,
      'westLng': westLng,
      'providersInViewport': providersInViewport,
      'filteredCount': filteredCount,
    };
  }

  // Helper method to check if a point is within this viewport
  bool contains(double lat, double lng) {
    return lat <= northLat && 
           lat >= southLat && 
           lng <= eastLng && 
           lng >= westLng;
  }

  // Create a viewport with some padding
  Viewport expandedBy(double latPadding, double lngPadding) {
    return Viewport(
      northLat: northLat + latPadding,
      southLat: southLat - latPadding,
      eastLng: eastLng + lngPadding,
      westLng: westLng - lngPadding,
    );
  }
} 