class Location {
  final int id;
  final String? name;
  final String? addressLine1;
  final String? addressLine2;
  final String? city;
  final String? state;
  final String? postalCode;
  final String? country;
  final double latitude;
  final double longitude;
  final bool isPrimary;
  final String? phone;
  final String? email;
  final String? website;

  Location({
    required this.id,
    this.name,
    this.addressLine1,
    this.addressLine2,
    this.city,
    this.state,
    this.postalCode,
    this.country,
    required this.latitude,
    required this.longitude,
    required this.isPrimary,
    this.phone,
    this.email,
    this.website,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      id: json['id'],
      name: json['name'],
      addressLine1: json['addressLine1'],
      addressLine2: json['addressLine2'],
      city: json['city'],
      state: json['state'],
      postalCode: json['postalCode'],
      country: json['country'],
      latitude: json['latitude'],
      longitude: json['longitude'],
      isPrimary: json['isPrimary'] ?? false,
      phone: json['phone'],
      email: json['email'],
      website: json['website'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'state': state,
      'postalCode': postalCode,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
      'isPrimary': isPrimary,
      'phone': phone,
      'email': email,
      'website': website,
    };
  }

  String get formattedAddress {
    List<String> parts = [];
    if (addressLine1 != null && addressLine1!.isNotEmpty) parts.add(addressLine1!);
    if (addressLine2 != null && addressLine2!.isNotEmpty) parts.add(addressLine2!);
    
    String cityStateZip = '';
    if (city != null && city!.isNotEmpty) cityStateZip += city!;
    if (state != null && state!.isNotEmpty) {
      if (cityStateZip.isNotEmpty) cityStateZip += ', ';
      cityStateZip += state!;
    }
    if (postalCode != null && postalCode!.isNotEmpty) {
      if (cityStateZip.isNotEmpty) cityStateZip += ' ';
      cityStateZip += postalCode!;
    }
    
    if (cityStateZip.isNotEmpty) parts.add(cityStateZip);
    if (country != null && country!.isNotEmpty) parts.add(country!);
    
    return parts.join(', ');
  }
} 