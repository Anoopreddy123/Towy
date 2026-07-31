import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRequests, ServiceRequest } from '@/services/api';

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

function RequestCard({
  request,
  onPress,
  colors,
}: {
  request: ServiceRequest;
  onPress: () => void;
  colors: any;
}) {
  const isCompleted = request.status === 'completed';
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isCompleted}
      style={[
        styles.requestCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: isCompleted ? 0.6 : 1,
        },
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.requestCardContent}>
        <View style={styles.requestCardHeader}>
          <View style={styles.requestCardLeft}>
            <Text style={[styles.requestType, { color: colors.text }]}>
              {getServiceTypeLabel(request.serviceType)}
            </Text>
            <Text style={[styles.requestLocation, { color: colors.textSecondary }]}>
              {request.location || 'Location not specified'}
            </Text>
            {request.description && (
              <Text style={[styles.requestDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {request.description}
              </Text>
            )}
            <Text style={[styles.requestDate, { color: colors.textSecondary }]}>
              {formatDate(request.createdAt)}
            </Text>
            {!isCompleted && (
              <Text style={[styles.requestHint, { color: colors.green }]}>
                Tap to view details
              </Text>
            )}
          </View>
          <StatusBadge status={request.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#a0a0a0' : '#666666',
    green: '#22c55e',
    border: isDark ? '#333333' : '#e5e5e5',
  };

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const list = await getUserRequests();
      setRequests(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load requests');
      setRequests([]);
    }
  }, []);

  useEffect(() => {
    loadRequests().finally(() => setLoading(false));
  }, [loadRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [loadRequests]);

  const handleRequestPress = (requestId: string) => {
    router.push(`/request-details/${requestId}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading requests...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Hi {user?.name || user?.email || 'there'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your Service Requests</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/request-service')}
            style={[styles.newRequestButton, { backgroundColor: colors.green }]}
            activeOpacity={0.8}
          >
            <Text style={styles.newRequestButtonText}>+ New Request</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Requests List */}
        {requests.length > 0 ? (
          <View style={styles.requestsList}>
            {requests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onPress={() => handleRequestPress(request.id)}
                colors={colors}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No service requests yet</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Create your first service request to get started
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/request-service')}
              style={[styles.emptyButton, { backgroundColor: colors.green }]}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyButtonText}>Request Service</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    gap: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  newRequestButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  newRequestButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  requestsList: {
    gap: 16,
  },
  requestCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestCardContent: {
    gap: 8,
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  requestCardLeft: {
    flex: 1,
    gap: 4,
  },
  requestType: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  requestDate: {
    fontSize: 12,
    marginTop: 8,
  },
  requestHint: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

