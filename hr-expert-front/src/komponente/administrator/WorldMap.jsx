// src/components/CorporationMap.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Stack,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet’s icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Locations
const LOCATIONS = [
  { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA', employees: 120 },
  { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK', employees: 85 },
  { lat: 35.6895, lng: 139.6917, city: 'Tokyo', country: 'Japan', employees: 230 },
  { lat: -33.8688, lng: 151.2093, city: 'Sydney', country: 'Australia', employees: 47 },
  { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'France', employees: 156 },
  { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'Germany', employees: 98 },
  { lat: -23.5505, lng: -46.6333, city: 'São Paulo', country: 'Brazil', employees: 177 },
  { lat: -33.9249, lng: 18.4241, city: 'Cape Town', country: 'South Africa', employees: 62 },
  { lat: 55.7558, lng: 37.6173, city: 'Moscow', country: 'Russia', employees: 145 },
  { lat: 19.0760, lng: 72.8777, city: 'Mumbai', country: 'India', employees: 202 },
  { lat: 49.2827, lng: -123.1207, city: 'Vancouver', country: 'Canada', employees: 53 },
  { lat: -34.6037, lng: -58.3816, city: 'Buenos Aires', country: 'Argentina', employees: 89 },
];

// GeoJSON URL
const COUNTRIES_URL =
  'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

export default function CorporationMap() {
  const [geoData, setGeoData] = useState(null);

  // Brand colors
  const brandPrimary = '#F06A6A';
  const brandDark = '#0D0E10';
  const brandWhite = '#FFFFFF';

  // Load GeoJSON
  useEffect(() => {
    fetch(COUNTRIES_URL)
      .then(res => res.json())
      .then(json => setGeoData(json))
      .catch(err => console.error('Failed to load GeoJSON', err));
  }, []);

  // Map border style
  const borderStyle = {
    color: brandPrimary,
    weight: 1,
    fillOpacity: 0,
  };

  return (
    <Box p={6} bg={brandWhite} color={brandDark} minH="100vh">
      <Heading mb={4} size="lg" color={brandPrimary}>
        Global Corporation Map
      </Heading>

      <Box
        w="100%"
        h="600px"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
        border={`2px solid ${brandPrimary}`}
      >
        {geoData ? (
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ width: '100%', height: '100%' }}
          >
            {/* Subtle light base */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Country borders */}
            <GeoJSON data={geoData} style={borderStyle} />

            {/* Markers */}
            {LOCATIONS.map(loc => (
              <Marker key={loc.city} position={[loc.lat, loc.lng]}>
                <Popup>
                  <Stack spacing={1}>
                    <Text fontWeight="bold" color={brandPrimary}>
                      Corporation {loc.city}
                    </Text>
                    <Text fontSize="sm" color={brandDark}>
                      {loc.city}, {loc.country}
                    </Text>
                    <Text fontSize="sm" color={brandDark}>
                      Employees: {loc.employees}
                    </Text>
                  </Stack>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <Flex justify="center" align="center" height="100%">
            <Spinner size="xl" color={brandPrimary} />
          </Flex>
        )}
      </Box>
    </Box>
  );
}
