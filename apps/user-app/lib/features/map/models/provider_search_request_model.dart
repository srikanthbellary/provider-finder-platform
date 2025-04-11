class ProviderSearchRequest {
  final double northLat;
  final double southLat;
  final double eastLng;
  final double westLng;
  final String? searchTerm;
  final List<int>? specialtyIds;
  final List<int>? providerTypeIds;
  final List<int>? languageIds;
  final bool isVerifiedOnly;
  final bool isRegisteredOnly;
  final int page;
  final int pageSize;
  final double? userLat;
  final double? userLng;
  final String sortBy;
  final String sortDirection;

  ProviderSearchRequest({
    required this.northLat,
    required this.southLat,
    required this.eastLng,
    required this.westLng,
    this.searchTerm,
    this.specialtyIds,
    this.providerTypeIds,
    this.languageIds,
    this.isVerifiedOnly = false,
    this.isRegisteredOnly = false,
    this.page = 1,
    this.pageSize = 20,
    this.userLat,
    this.userLng,
    this.sortBy = 'distance',
    this.sortDirection = 'asc',
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {
      'northLat': northLat,
      'southLat': southLat,
      'eastLng': eastLng,
      'westLng': westLng,
      'isVerifiedOnly': isVerifiedOnly,
      'isRegisteredOnly': isRegisteredOnly,
      'page': page,
      'pageSize': pageSize,
      'sortBy': sortBy,
      'sortDirection': sortDirection,
    };

    if (searchTerm != null && searchTerm!.isNotEmpty) {
      data['searchTerm'] = searchTerm;
    }
    
    if (specialtyIds != null && specialtyIds!.isNotEmpty) {
      data['specialtyIds'] = specialtyIds;
    }
    
    if (providerTypeIds != null && providerTypeIds!.isNotEmpty) {
      data['providerTypeIds'] = providerTypeIds;
    }
    
    if (languageIds != null && languageIds!.isNotEmpty) {
      data['languageIds'] = languageIds;
    }
    
    if (userLat != null && userLng != null) {
      data['userLat'] = userLat;
      data['userLng'] = userLng;
    }

    return data;
  }

  // Helper method to create a new request with updated pagination
  ProviderSearchRequest copyWithNextPage() {
    return ProviderSearchRequest(
      northLat: northLat,
      southLat: southLat,
      eastLng: eastLng,
      westLng: westLng,
      searchTerm: searchTerm,
      specialtyIds: specialtyIds,
      providerTypeIds: providerTypeIds,
      languageIds: languageIds,
      isVerifiedOnly: isVerifiedOnly,
      isRegisteredOnly: isRegisteredOnly,
      page: page + 1,
      pageSize: pageSize,
      userLat: userLat,
      userLng: userLng,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }

  // Helper method to create a new request with updated viewport
  ProviderSearchRequest copyWithViewport({
    required double northLat,
    required double southLat,
    required double eastLng,
    required double westLng,
  }) {
    return ProviderSearchRequest(
      northLat: northLat,
      southLat: southLat,
      eastLng: eastLng,
      westLng: westLng,
      searchTerm: searchTerm,
      specialtyIds: specialtyIds,
      providerTypeIds: providerTypeIds,
      languageIds: languageIds,
      isVerifiedOnly: isVerifiedOnly,
      isRegisteredOnly: isRegisteredOnly,
      page: 1, // Reset to first page when viewport changes
      pageSize: pageSize,
      userLat: userLat,
      userLng: userLng,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }
} 