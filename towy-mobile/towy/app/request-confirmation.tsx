import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getServiceRequest, getNearbyProviders, NearbyProvider, ServiceType } from '@/services/api';
import { Image } from 'react-native';

export default function RequestConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const requestId = params.requestId as string;
  const serviceType = params.serviceType as string;
  const location = params.location as string;
  const latitude = params.latitude ? parseFloat(params.latitude as string) : null;
  const longitude = params.longitude ? parseFloat(params.longitude as string) : null;

  const [radiusKm, setRadiusKm] = useState<number>(32); // Default 20 miles = 32km
  const [providers, setProviders] = useState<NearbyProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [request, setRequest] = useState<any>(null);

  // Radius options in miles (matching web app)
  const RADIUS_OPTIONS = [
    { label: '20 mi', value: 20, km: 32 },
    { label: '35 mi', value: 35, km: 56 },
    { label: '40 mi', value: 40, km: 64 },
    { label: '50 mi', value: 50, km: 80 },
  ];

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#a0a0a0' : '#666666',
    green: '#22c55e',
    greenDark: '#16a34a',
    border: isDark ? '#333333' : '#e5e5e5',
    success: '#10b981',
    inputBg: isDark ? '#2a2a2a' : '#FFFFFF',
  };

  useEffect(() => {
    loadRequestData();
  }, []);

  useEffect(() => {
    // Reload providers when radius changes or request is loaded
    if (request || (latitude && longitude)) {
      loadProviders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm, request]);

  const loadRequestData = async () => {
    setLoading(true);
    try {
      if (requestId) {
        const requestData = await getServiceRequest(requestId);
        setRequest(requestData);
      }
    } catch (e) {
      console.warn('Failed to load request details:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    setLoadingProviders(true);
    try {
      let lat: number | null = latitude;
      let lng: number | null = longitude;
      let svcType = serviceType;
      const currentRequest = request;

      // If we don't have coordinates from params, try to get from request
      if ((!lat || !lng) && currentRequest?.coordinates) {
        try {
          if (typeof currentRequest.coordinates === 'string') {
            // Parse comma-separated coordinates
            if (currentRequest.coordinates.includes(',')) {
              const coords = currentRequest.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
              if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                [lat, lng] = coords;
              }
            }
            // Try parsing as JSON
            else if (currentRequest.coordinates.startsWith('{')) {
              const parsed = JSON.parse(currentRequest.coordinates);
              if (parsed.lat && parsed.lng) {
                lat = parsed.lat;
                lng = parsed.lng;
              }
            }
          } else if (currentRequest.coordinates?.lat && currentRequest.coordinates?.lng) {
            lat = currentRequest.coordinates.lat;
            lng = currentRequest.coordinates.lng;
          }
        } catch (e) {
          console.warn('Failed to parse coordinates from request:', e);
        }
      }

      if (!svcType && currentRequest?.serviceType) {
        svcType = currentRequest.serviceType;
      }

      if (!lat || !lng || !svcType) {
        setProviders([]);
        return;
      }

      const nearbyProviders = await getNearbyProviders({
        latitude: lat,
        longitude: lng,
        radius: radiusKm,
        serviceType: svcType as ServiceType,
      });
      
      setProviders(nearbyProviders);
    } catch (e) {
      console.warn('Failed to load providers:', e);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleRadiusChange = (miles: number) => {
    const selectedOption = RADIUS_OPTIONS.find(opt => opt.value === miles);
    if (selectedOption) {
      setRadiusKm(selectedOption.km);
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const getServiceTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      towing: 'Towing',
      roadside_assistance: 'Roadside Assistance',
      vehicle_recovery: 'Vehicle Recovery',
      battery_jump: 'Battery Jump',
      tire_change: 'Tire Change',
      gas_delivery: 'Gas Delivery',
      lockout: 'Lockout',
      mechanic: 'Mechanic',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
      </View>
    );
  }

  const currentRadiusMiles = RADIUS_OPTIONS.find(opt => opt.km === radiusKm)?.value || 20;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Success Icon/Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/favicon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Success Message */}
      <View style={styles.header}>
        <Text style={[styles.successTitle, { color: colors.success }]}>✓ Request Submitted!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your service request has been created and providers have been notified
        </Text>
      </View>

      {/* Request Details */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Request Details</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Service Type:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {getServiceTypeLabel(serviceType || request?.serviceType || '')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{location || request?.location || 'N/A'}</Text>
        </View>
        {(() => {
          // Get coordinates from params or parsed from request
          let displayLat = latitude;
          let displayLng = longitude;
          
          if (!displayLat || !displayLng) {
            // Try to parse from request
            if (request?.coordinates) {
              try {
                if (typeof request.coordinates === 'string') {
                  if (request.coordinates.includes(',')) {
                    const coords = request.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
                    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                      displayLat = coords[0];
                      displayLng = coords[1];
                    }
                  } else if (request.coordinates.startsWith('{')) {
                    const parsed = JSON.parse(request.coordinates);
                    if (parsed.lat && parsed.lng) {
                      displayLat = parsed.lat;
                      displayLng = parsed.lng;
                    }
                  }
                } else if (request.coordinates?.lat && request.coordinates?.lng) {
                  displayLat = request.coordinates.lat;
                  displayLng = request.coordinates.lng;
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
          
          return (displayLat && displayLng) ? (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Coordinates:</Text>
              <Text style={[styles.detailValue, { color: colors.text, fontSize: 11 }]}>
                {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
              </Text>
            </View>
          ) : null;
        })()}
        {request?.vehicleType && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.vehicleType}</Text>
          </View>
        )}
        {request?.description && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.description}</Text>
          </View>
        )}
        {requestId && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Request ID:</Text>
            <Text style={[styles.detailValue, { color: colors.text, fontSize: 12 }]}>{requestId}</Text>
          </View>
        )}
      </View>

      {/* Providers Notified */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.providerHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Nearby Service Providers ({providers.length})
          </Text>
        </View>

        {/* Radius Selector */}
        <View style={[styles.radiusSelector, { borderBottomColor: colors.border }]}>
          <Text style={[styles.radiusLabel, { color: colors.text }]}>Search Radius:</Text>
          <View
            style={[
              styles.pickerContainer,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            {Platform.OS === 'ios' ? (
              <Picker
                selectedValue={currentRadiusMiles}
                onValueChange={handleRadiusChange}
                style={styles.picker}
                itemStyle={{ color: colors.text }}
              >
                {RADIUS_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </Picker>
            ) : (
              <Picker
                selectedValue={currentRadiusMiles}
                onValueChange={handleRadiusChange}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                {RADIUS_OPTIONS.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            )}
          </View>
        </View>

        {loadingProviders ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.green} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Searching for providers...
            </Text>
          </View>
        ) : (
          <Text style={[styles.providerSubtitle, { color: colors.textSecondary }]}>
            {providers.length > 0
              ? 'Nearby providers have been notified and may send you quotes soon.'
              : 'No service providers found in this area. Try expanding your search radius or check back later.'}
          </Text>
        )}

        {providers.length > 0 && (
          <View style={styles.providersList}>
            {providers.map((provider) => (
              <View
                key={provider.id}
                style={[styles.providerItem, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              >
                <View style={styles.providerHeader}>
                  <Text style={[styles.providerName, { color: colors.text }]}>
                    {provider.businessName || provider.name}
                  </Text>
                  {provider.isAvailable && (
                    <View style={[styles.availableBadge, { backgroundColor: colors.success }]}>
                      <Text style={styles.availableText}>Available</Text>
                    </View>
                  )}
                </View>
                {provider.distance !== undefined && (
                  <Text style={[styles.providerDistance, { color: colors.textSecondary }]}>
                    {formatDistance(provider.distance)}
                  </Text>
                )}
                {provider.services && provider.services.length > 0 && (
                  <Text style={[styles.providerServices, { color: colors.textSecondary }]}>
                    Services: {provider.services.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          style={[styles.primaryButton, { backgroundColor: colors.green }]}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Go to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/request-service')}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.green }]}>Create Another Request</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  providerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  radiusSelector: {
    gap: 12,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 50,
  },
  picker: {
    width: '100%',
    ...(Platform.OS === 'android' && { height: 50 }),
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
  },
  providerSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  providersList: {
    gap: 12,
    marginTop: 12,
  },
  providerItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  availableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  availableText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  providerDistance: {
    fontSize: 14,
  },
  providerServices: {
    fontSize: 12,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 50,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

