import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  createServiceRequest,
  getNearbyProviders,
  parseVoiceTranscript,
  ServiceType,
  NearbyProvider,
  VoiceParseResult,
} from '@/services/api';

const SERVICE_TYPES: { label: string; value: ServiceType }[] = [
  { label: 'Towing', value: 'towing' },
  { label: 'Roadside Assistance', value: 'roadside_assistance' },
  { label: 'Vehicle Recovery', value: 'vehicle_recovery' },
  { label: 'Battery Jump', value: 'battery_jump' },
  { label: 'Tire Change', value: 'tire_change' },
  { label: 'Gas Delivery', value: 'gas_delivery' },
  { label: 'Lockout', value: 'lockout' },
  { label: 'Mechanic', value: 'mechanic' },
];

export default function RequestServiceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [serviceType, setServiceType] = useState<ServiceType>('towing');
  const [serviceTypeOpen, setServiceTypeOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationText, setLocationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState('');
  const [parsingVoice, setParsingVoice] = useState(false);
  const [voiceInfo, setVoiceInfo] = useState<Pick<VoiceParseResult, 'confidence' | 'serviceType'> | null>(null);

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#a0a0a0' : '#666666',
    green: '#22c55e',
    greenDark: '#16a34a',
    border: isDark ? '#333333' : '#e5e5e5',
    error: '#ef4444',
    inputBg: isDark ? '#2a2a2a' : '#FFFFFF',
    selected: isDark ? '#2a4a2a' : '#dcfce7',
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to create a service request');
        setLocationLoading(false);
        return;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = locationData.coords;
      setLocation({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      try {
        const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (addresses.length > 0) {
          const addr = addresses[0];
          const addressParts = [
            addr.street,
            addr.city,
            addr.region,
            addr.postalCode,
          ].filter(Boolean);
          setLocationText(addressParts.join(', ') || 'Current Location');
        } else {
          setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (e) {
        setLocationText(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (e: any) {
      setError('Failed to get location: ' + (e?.message || 'Unknown error'));
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      setError('Please enable location access');
      return;
    }

    if (!serviceType) {
      setError('Please select a service type');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Create service request
      const request = await createServiceRequest({
        serviceType,
        location: locationText,
        coordinates: location,
        description: description.trim() || undefined,
        vehicleType: vehicleType.trim() || undefined,
      });

      // Navigate to confirmation screen with request
      router.push({
        pathname: '/request-confirmation',
        params: {
          requestId: request.id,
          serviceType: request.serviceType,
          location: locationText,
          latitude: location.lat.toString(),
          longitude: location.lng.toString(),
        },
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to create service request');
      Alert.alert('Error', e?.message || 'Failed to create service request');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceLabel =
    SERVICE_TYPES.find((type) => type.value === serviceType)?.label || 'Select service type';

  const handleVoiceParse = async () => {
    const trimmed = voiceText.trim();
    if (!trimmed) {
      setError('Please dictate or type something in the voice box first.');
      return;
    }
    setError(null);
    setParsingVoice(true);
    try {
      const result = await parseVoiceTranscript(trimmed);
      setVoiceInfo({ confidence: result.confidence, serviceType: result.serviceType });
      if (result.serviceType) {
        setServiceType(result.serviceType);
      }
      if (result.description) {
        setDescription(result.description);
      }
    } catch (e: any) {
      setError(e?.message || 'Could not understand your voice text. Please try again or fill the form.');
    } finally {
      setParsingVoice(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.topBarButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.topBarButtonText, { color: colors.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Request Service</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Fill in the details below to request assistance
        </Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Voice to text helper (demo) */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Voice (demo)</Text>
        <Text style={[styles.helper, { color: colors.textSecondary }]}>
          Tap the mic on your keyboard to dictate in any language, then tap \"Use this text\" to fill in
          the details below.
        </Text>
        <TextInput
          placeholder="Describe what happened, in your own words…"
          placeholderTextColor={colors.textSecondary}
          value={voiceText}
          onChangeText={setVoiceText}
          multiline
          numberOfLines={3}
          style={[
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          textAlignVertical="top"
        />
        <TouchableOpacity
          onPress={handleVoiceParse}
          disabled={parsingVoice}
          style={[
            styles.voiceButton,
            {
              backgroundColor: parsingVoice ? colors.greenDark : colors.green,
              opacity: parsingVoice ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {parsingVoice ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.voiceButtonText}>Use this text to fill form</Text>
          )}
        </TouchableOpacity>
        {voiceInfo && (
          <Text style={[styles.voiceHint, { color: colors.textSecondary }]}>
            AI guess: {voiceInfo.serviceType || 'unknown'} (confidence: {voiceInfo.confidence})
          </Text>
        )}
      </View>

      {/* Service Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Service Type</Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setServiceTypeOpen((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownTriggerText, { color: colors.text }]}>{selectedServiceLabel}</Text>
          <Text style={[styles.dropdownChevron, { color: colors.textSecondary }]}>
            {serviceTypeOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {serviceTypeOpen && (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
              },
            ]}
          >
            {SERVICE_TYPES.map((type) => {
              const isSelected = type.value === serviceType;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dropdownItem,
                    isSelected && { backgroundColor: colors.selected },
                  ]}
                  onPress={() => {
                    setServiceType(type.value);
                    setServiceTypeOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      { color: colors.text },
                      isSelected && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Location</Text>
        <View style={[styles.locationContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          {locationLoading ? (
            <ActivityIndicator size="small" color={colors.green} />
          ) : (
            <>
              <Text style={[styles.locationText, { color: locationText ? colors.text : colors.textSecondary }]}>
                {locationText || 'Getting location...'}
              </Text>
              <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
                <Text style={[styles.refreshButtonText, { color: colors.green }]}>Refresh</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Vehicle Type */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Vehicle Type (Optional)</Text>
        <TextInput
          placeholder="e.g., Sedan, SUV, Truck"
          placeholderTextColor={colors.textSecondary}
          value={vehicleType}
          onChangeText={setVehicleType}
          style={[
            styles.input,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
        <TextInput
          placeholder="Describe your issue or special requirements"
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={[
            styles.textArea,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          style={[styles.cancelButton, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>{loading ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading || locationLoading || !location}
          style={[
            styles.submitButton,
            {
              backgroundColor: loading || locationLoading || !location ? colors.greenDark : colors.green,
              opacity: loading || locationLoading || !location ? 0.7 : 1,
            },
          ]}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Request Service</Text>
          )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  topBarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  topBarButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
  helper: {
    fontSize: 13,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 12,
    marginLeft: 10,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 15,
  },
  dropdownItemTextSelected: {
    fontWeight: '700',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
  },
  voiceButton: {
    marginTop: 8,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  voiceHint: {
    marginTop: 4,
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 50,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

