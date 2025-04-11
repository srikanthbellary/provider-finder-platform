import 'package:flutter/material.dart';

import '../models/provider_model.dart';

class ProviderDetailBottomSheet extends StatelessWidget {
  final Provider provider;
  final ScrollController scrollController;
  final VoidCallback onBookAppointment;

  const ProviderDetailBottomSheet({
    super.key,
    required this.provider,
    required this.scrollController,
    required this.onBookAppointment,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: theme.scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(
          top: Radius.circular(20),
        ),
      ),
      child: ListView(
        controller: scrollController,
        padding: const EdgeInsets.all(16.0),
        children: [
          // Handle
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(10),
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          // Provider name and type
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      provider.name,
                      style: theme.textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (provider.providerType != null)
                      Text(
                        provider.providerType!,
                        style: theme.textTheme.titleMedium?.copyWith(
                          color: Colors.grey[700],
                        ),
                      ),
                  ],
                ),
              ),
              if (provider.isVerified)
                Tooltip(
                  message: 'Verified Provider',
                  child: CircleAvatar(
                    backgroundColor: Colors.green[100],
                    radius: 20,
                    child: Icon(
                      Icons.verified,
                      color: Colors.green[800],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Experience and specialties
          if (provider.experienceYears != null)
            ListTile(
              leading: const Icon(Icons.history),
              title: Text('${provider.experienceYears} years of experience'),
              dense: true,
              contentPadding: EdgeInsets.zero,
            ),
          
          // Specialties
          if (provider.specialties.isNotEmpty)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Specialties',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: provider.specialties
                      .map((specialty) => Chip(
                            label: Text(specialty),
                            backgroundColor: Colors.blue[50],
                          ))
                      .toList(),
                ),
              ],
            ),
          const SizedBox(height: 16),
          
          // Languages
          if (provider.languages.isNotEmpty)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Languages',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: provider.languages
                      .map((language) => Chip(
                            label: Text(language),
                            backgroundColor: Colors.purple[50],
                          ))
                      .toList(),
                ),
              ],
            ),
          const SizedBox(height: 16),
          
          // About
          if (provider.about != null && provider.about!.isNotEmpty)
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'About',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(provider.about!),
              ],
            ),
          const SizedBox(height: 16),
          
          // Location
          if (provider.locations.isNotEmpty) 
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Location',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ...provider.locations.map((location) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (location.name != null)
                            Text(
                              location.name!,
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          Text(location.formattedAddress),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              if (location.phone != null) 
                                TextButton.icon(
                                  icon: const Icon(Icons.phone),
                                  label: const Text('Call'),
                                  onPressed: () {
                                    // Launch phone call
                                  },
                                ),
                              if (location.email != null) 
                                TextButton.icon(
                                  icon: const Icon(Icons.email),
                                  label: const Text('Email'),
                                  onPressed: () {
                                    // Launch email
                                  },
                                ),
                              if (location.website != null) 
                                TextButton.icon(
                                  icon: const Icon(Icons.language),
                                  label: const Text('Website'),
                                  onPressed: () {
                                    // Launch website
                                  },
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          const SizedBox(height: 24),
          
          // Book appointment button
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: onBookAppointment,
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.primaryColor,
                foregroundColor: Colors.white,
              ),
              child: const Text('Book Appointment'),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
} 