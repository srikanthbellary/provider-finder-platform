import 'location_model.dart';

class Provider {
  final int id;
  final String name;
  final String? providerType;
  final String? about;
  final String? phone;
  final String? email;
  final bool isVerified;
  final bool isRegisteredUser;
  final int? experienceYears;
  final List<Location> locations;
  final List<String> specialties;
  final List<String> languages;
  final double? distanceInKm;

  Provider({
    required this.id,
    required this.name,
    this.providerType,
    this.about,
    this.phone,
    this.email,
    required this.isVerified,
    required this.isRegisteredUser,
    this.experienceYears,
    required this.locations,
    required this.specialties,
    required this.languages,
    this.distanceInKm,
  });

  factory Provider.fromJson(Map<String, dynamic> json) {
    return Provider(
      id: json['id'],
      name: json['name'],
      providerType: json['providerType'],
      about: json['about'],
      phone: json['phone'],
      email: json['email'],
      isVerified: json['isVerified'] ?? false,
      isRegisteredUser: json['isRegisteredUser'] ?? false,
      experienceYears: json['experienceYears'],
      locations: (json['locations'] as List?)
          ?.map((location) => Location.fromJson(location))
          .toList() ?? [],
      specialties: (json['specialties'] as List?)
          ?.map((specialty) => specialty.toString())
          .toList() ?? [],
      languages: (json['languages'] as List?)
          ?.map((language) => language.toString())
          .toList() ?? [],
      distanceInKm: json['distanceInKm'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'providerType': providerType,
      'about': about,
      'phone': phone,
      'email': email,
      'isVerified': isVerified,
      'isRegisteredUser': isRegisteredUser,
      'experienceYears': experienceYears,
      'locations': locations.map((location) => location.toJson()).toList(),
      'specialties': specialties,
      'languages': languages,
      'distanceInKm': distanceInKm,
    };
  }
} 