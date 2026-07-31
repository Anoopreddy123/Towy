import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getServiceRequest, updateRequestStatus, ServiceRequest } from '@/services/api';

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  accepted: { bg: '#d1fae5', text: '#065f46' },
  completed: { bg: '#dbeafe', text: '#1e40af' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

function StatusBadge({ status }: { status: string }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const statusLower = status.toLowerCase();
  const colors = STATUS_COLORS[statusLower as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: isDark ? '#333333' : colors.bg,
        },
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          {
            color: isDark ? '#FFFFFF' : colors.text,
          },
        ]}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

export default function RequestDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const requestIdParam = params.requestId;
  const requestId = Array.isArray(requestIdParam) ? requestIdParam[0] : requestIdParam;

  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#a0a0a0' : '#666666',
    green: '#22c55e',
    border: isDark ? '#333333' : '#e5e5e5',
  };

  useEffect(() => {
    if (!requestId) {
      setError('Invalid request. Please open it again from My Requests.');
      setLoading(false);
      return;
    }
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    if (!requestId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getServiceRequest(requestId);
      setRequest(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = () => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this service request as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Complete',
          style: 'default',
          onPress: async () => {
            setUpdating(true);
            try {
              await updateRequestStatus(requestId, 'completed');
              await loadRequest();
              Alert.alert('Success', 'Service request marked as complete', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (e: any) {
              Alert.alert('Error', e?.message || 'Failed to update status');
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleViewProviders = () => {
    if (!request?.coordinates) {
      Alert.alert('Error', 'Location data not available for this request');
      return;
    }

    // Parse coordinates - handle string format (comma-separated or JSON)
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      if (typeof request.coordinates === 'string') {
        // Try comma-separated format first
        if (request.coordinates.includes(',')) {
          const coords = request.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            [lat, lng] = coords;
          }
        }
        // Try JSON format
        else if (request.coordinates.startsWith('{')) {
          const parsed = JSON.parse(request.coordinates);
          if (parsed.lat && parsed.lng) {
            lat = parsed.lat;
            lng = parsed.lng;
          }
        }
      }
      // Handle object format (if API returns object)
      else if (typeof request.coordinates === 'object' && request.coordinates !== null) {
        const coords = request.coordinates as any;
        if (coords.lat && coords.lng) {
          lat = coords.lat;
          lng = coords.lng;
        }
      }

      if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
        router.push({
          pathname: '/request-confirmation',
          params: {
            requestId: request.id,
            serviceType: request.serviceType,
            location: request.location || '',
            latitude: lat.toString(),
            longitude: lng.toString(),
          },
        });
      } else {
        Alert.alert('Error', 'Invalid location data format');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to parse location data');
    }
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading request details...</Text>
      </View>
    );
  }

  if (error || !request) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: '#ef4444' }]}>
          {error || 'Request not found'}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: colors.border }]}
        >
          <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isCompleted = request.status === 'completed';
  const canMarkComplete = request.status === 'pending' || request.status === 'accepted';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Header with Status */}
      <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.serviceType, { color: colors.text }]}>
            {getServiceTypeLabel(request.serviceType)}
          </Text>
          <StatusBadge status={request.status} />
        </View>
        <Text style={[styles.requestId, { color: colors.textSecondary }]}>ID: {request.id}</Text>
      </View>

      {/* Request Details */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Request Details</Text>

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{request.location || 'N/A'}</Text>
        </View>

        {request.vehicleType && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle Type:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.vehicleType}</Text>
          </View>
        )}

        {request.description && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{request.description}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created:</Text>
          <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(request.createdAt)}</Text>
        </View>

        {request.updatedAt && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Last Updated:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatDate(request.updatedAt)}</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {!isCompleted && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleViewProviders}
            style={[styles.primaryButton, { backgroundColor: colors.green }]}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>View Nearby Providers</Text>
          </TouchableOpacity>

          {canMarkComplete && (
            <TouchableOpacity
              onPress={handleMarkComplete}
              disabled={updating}
              style={[
                styles.secondaryButton,
                { borderColor: colors.border },
                updating && styles.disabledButton,
              ]}
              activeOpacity={0.7}
            >
              {updating ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
                  Mark as Complete
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {isCompleted && (
        <View style={[styles.completedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.completedText, { color: colors.textSecondary }]}>
            This service request has been completed.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  requestId: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  actionsContainer: {
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
  disabledButton: {
    opacity: 0.5,
  },
  completedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  completedText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

