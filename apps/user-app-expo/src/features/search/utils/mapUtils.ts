import { MapViewData, Provider } from '../types';

export const generateMapHtml = (mapData: MapViewData, providers: Provider[]): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${mapData.centerLat}, ${mapData.centerLng}], ${mapData.zoomLevel});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const markers = ${JSON.stringify(providers.map(p => ({
          id: p.id,
          lat: p.latitude,
          lng: p.longitude,
          name: p.name,
          specialty: p.specialty,
          distance: p.distance,
        })))};

        markers.forEach(marker => {
          const popupContent = \`
            <div style="min-width: 200px; padding: 8px;">
              <h3 style="margin: 0 0 8px 0;">\${marker.name}</h3>
              <p style="margin: 0 0 4px 0;">\${marker.specialty}</p>
              \${marker.distance ? \`<p style="margin: 0;">\${marker.distance.toFixed(1)} km away</p>\` : ''}
            </div>
          \`;

          L.marker([marker.lat, marker.lng])
            .bindPopup(popupContent)
            .on('click', () => {
              window.ReactNativeWebView.postMessage(marker.id.toString());
            })
            .addTo(map);
        });

        // Fit bounds if available
        ${mapData.bounds ? `
        const bounds = L.latLngBounds(
          [${mapData.bounds.southWestLat}, ${mapData.bounds.southWestLng}],
          [${mapData.bounds.northEastLat}, ${mapData.bounds.northEastLng}]
        );
        map.fitBounds(bounds);
        ` : ''}
      </script>
    </body>
    </html>
  `;
}; 