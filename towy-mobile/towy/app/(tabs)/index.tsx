import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createServiceRequest, getUserRequests, parseVoiceTranscript, ServiceRequest, ServiceType } from '@/services/api';
import * as Location from 'expo-location';
import Voice from '@react-native-voice/voice';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice demo state (push-to-talk)
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [creatingFromVoice, setCreatingFromVoice] = useState(false);

  const colors = {
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1a1a1a' : '#F9FAFB',
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#a0a0a0' : '#666666',
    green: '#22c55e',
    greenDark: '#16a34a',
    border: isDark ? '#333333' : '#e5e5e5',
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      const t = e?.value?.[0];
      if (typeof t === 'string') setVoiceTranscript(t);
    };
    Voice.onSpeechPartialResults = (e: any) => {
      const t = e?.value?.[0];
      if (typeof t === 'string') setVoiceTranscript(t);
    };
    Voice.onSpeechError = (e: any) => {
      console.warn('Voice error', e);
      setIsListening(false);
    };
    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      setVoiceTranscript('');
      setIsListening(true);
      // Let the platform auto-detect language.
      await Voice.start('');
    } catch (e: any) {
      setIsListening(false);
      Alert.alert('Voice Error', e?.message || 'Could not start listening');
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch {}
    setIsListening(false);
  }, []);

  const createRequestFromVoice = useCallback(async () => {
    const transcript = voiceTranscript.trim();
    if (!transcript) {
      Alert.alert('Say something', 'Please speak your issue first (e.g. “flat tire, need help”).');
      return;
    }
    setCreatingFromVoice(true);
    try {
      // 1) Get live location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location required', 'Please allow location access so we can create your request.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      // 2) Parse transcript to service type
      const parsed = await parseVoiceTranscript(transcript);
      const inferred = parsed.serviceType as ServiceType | null;
      const serviceType: ServiceType = inferred || 'roadside_assistance';

      // 3) Create the request
      const created = await createServiceRequest({
        serviceType,
        coordinates: { lat: latitude, lng: longitude },
        description: transcript,
      });

      // 4) Go to confirmation/details
      setVoiceOpen(false);
      router.push({
        pathname: '/request-confirmation',
        params: {
          requestId: created.id,
          serviceType: created.serviceType,
          location: created.location || '',
          latitude: String(latitude),
          longitude: String(longitude),
        },
      });
    } catch (e: any) {
      Alert.alert('Could not create request', e?.message || 'Please try again.');
    } finally {
      setCreatingFromVoice(false);
      setIsListening(false);
    }
  }, [router, voiceTranscript]);

  const loadRequests = useCallback(async () => {
    try {
      setError(null);
      const list = await getUserRequests();
      setRequests(list);
    } catch (e: any) {
      setError(e?.message || 'Failed to load active requests');
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

  const activeRequests = useMemo(
    () =>
      requests
        .filter((r) => {
          const s = String(r.status).toLowerCase();
          return s === 'pending' || s === 'accepted';
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [requests]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <ThemedText type="title">Welcome to Towy!</ThemedText>
              <TouchableOpacity
                onPress={() => setVoiceOpen(true)}
                style={[styles.micButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.micButtonText, { color: colors.text }]}>🎤</Text>
              </TouchableOpacity>
            </View>
            {user && (
              <ThemedText type="defaultSemiBold">
                {user.name || user.email} ({user.role})
              </ThemedText>
            )}
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle">Active Requests</ThemedText>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.green} />
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Loading your requests...</Text>
              </View>
            ) : error ? (
              <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
            ) : activeRequests.length === 0 ? (
              <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                No active requests right now.
              </Text>
            ) : (
              <View style={styles.requestList}>
                {activeRequests.map((request) => (
                  <TouchableOpacity
                    key={request.id}
                    style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    activeOpacity={0.75}
                    onPress={() =>
                      router.push({
                        pathname: '/request-details/[requestId]',
                        params: { requestId: String(request.id) },
                      })
                    }
                  >
                    <View style={styles.requestHeader}>
                      <Text style={[styles.requestType, { color: colors.text }]}>{request.serviceType}</Text>
                      <Text style={[styles.requestStatus, { color: colors.green }]}>{request.status}</Text>
                    </View>
                    <Text style={[styles.requestLocation, { color: colors.textSecondary }]} numberOfLines={2}>
                      {request.location || 'Location not available'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Existing action buttons moved below active requests */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={() => router.push('/request-service')}
              style={[styles.primaryButton, { backgroundColor: colors.green }]}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Request Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(tabs)/dashboard')}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>My Requests</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal visible={voiceOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Request by voice</Text>
              <TouchableOpacity onPress={() => setVoiceOpen(false)} activeOpacity={0.7}>
                <Text style={[styles.modalClose, { color: colors.textSecondary }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
              Say something like: “My car broke down, I need help with a flat tire.”
            </Text>

            <TextInput
              value={voiceTranscript}
              onChangeText={setVoiceTranscript}
              placeholder="Transcript will appear here…"
              placeholderTextColor={colors.textSecondary}
              style={[
                styles.modalTranscript,
                { borderColor: colors.border, backgroundColor: colors.surface, color: colors.text },
              ]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={isListening ? stopListening : startListening}
                disabled={creatingFromVoice}
                style={[
                  styles.modalPrimary,
                  { backgroundColor: isListening ? '#ef4444' : colors.green, opacity: creatingFromVoice ? 0.7 : 1 },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.modalPrimaryText}>{isListening ? 'Stop' : 'Speak'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={createRequestFromVoice}
                disabled={creatingFromVoice}
                style={[styles.modalSecondary, { borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                {creatingFromVoice ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={[styles.modalSecondaryText, { color: colors.text }]}>Create request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
  titleContainer: {
    gap: 8,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonText: {
    fontSize: 18,
  },
  section: {
    gap: 8,
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helperText: {
    fontSize: 14,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestList: {
    gap: 10,
    marginTop: 6,
  },
  requestCard: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  requestStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  requestLocation: {
    fontSize: 13,
  },
  actionsContainer: {
    gap: 12,
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

  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    padding: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalHint: {
    fontSize: 13,
    marginBottom: 10,
  },
  modalTranscript: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 110,
    maxHeight: 180,
  },
  modalActions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  modalPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
