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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRequests, ServiceRequest } from '@/services/api';

interface Statistics {
  totalRequests: number;
  totalCost: number;
  pendingRequests: number;
  completedRequests: number;
  cancelledRequests: number;
}

const MS_DAY = 24 * 60 * 60 * 1000;

function requestsCreatedBetween(reqs: ServiceRequest[], start: Date, end: Date): ServiceRequest[] {
  const a = start.getTime();
  const b = end.getTime();
  return reqs.filter((r) => {
    const t = new Date(r.createdAt).getTime();
    return t >= a && t < b;
  });
}

function buildTotalRequestsSubtitle(reqs: ServiceRequest[], total: number): string {
  if (total === 0) return 'Create a request from Home';
  const now = Date.now();
  const last30Start = new Date(now - 30 * MS_DAY);
  const prev30Start = new Date(now - 60 * MS_DAY);
  const inLast30 = requestsCreatedBetween(reqs, last30Start, new Date(now)).length;
  const inPrev30 = requestsCreatedBetween(reqs, prev30Start, last30Start).length;
  if (inLast30 === 0) return 'None created in the last 30 days';
  if (inPrev30 === 0) return `${inLast30} created in the last 30 days`;
  const delta = inLast30 - inPrev30;
  if (delta === 0) return `${inLast30} in the last 30 days — same as prior 30 days`;
  return `${inLast30} in the last 30 days (${delta > 0 ? '+' : ''}${delta} vs prior 30 days)`;
}

function buildTotalCostSubtitle(reqs: ServiceRequest[], totalCost: number): string {
  if (totalCost <= 0) return 'Sum of quoted prices on your requests';
  const withQuote = reqs.filter((r) => (r.quotedPrice ?? 0) > 0).length;
  return `${withQuote} request(s) include a quote`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  colors,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.statCardHeader}>
        <Text style={[styles.statCardTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={[styles.statCardValue, { color: colors.text }]}>{value}</Text>
      {subtitle && <Text style={[styles.statCardSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
}

function ActivityItem({
  title,
  description,
  time,
  status,
  colors,
}: {
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'pending' | 'new' | 'cancelled';
  colors: any;
}) {
  const statusColors = {
    completed: '#10b981',
    pending: '#f59e0b',
    new: '#3b82f6',
    cancelled: '#6b7280',
  };

  return (
    <View style={styles.activityItem}>
      <View style={[styles.activityDot, { backgroundColor: statusColors[status] }]} />
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.activityDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{time}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    totalRequests: 0,
    totalCost: 0,
    pendingRequests: 0,
    completedRequests: 0,
    cancelledRequests: 0,
  });
  const [loadError, setLoadError] = useState<string | null>(null);

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
      setLoadError(null);
      const requestsList = await getUserRequests();
      setRequests(requestsList);

      const norm = (s: string) => String(s).toLowerCase();
      const stats: Statistics = {
        totalRequests: requestsList.length,
        totalCost: requestsList.reduce((sum: number, req: ServiceRequest) => sum + (req.quotedPrice || 0), 0),
        pendingRequests: requestsList.filter(
          (req: ServiceRequest) => norm(req.status) === 'pending' || norm(req.status) === 'accepted'
        ).length,
        completedRequests: requestsList.filter((req: ServiceRequest) => norm(req.status) === 'completed').length,
        cancelledRequests: requestsList.filter((req: ServiceRequest) => norm(req.status) === 'cancelled').length,
      };
      setStatistics(stats);
    } catch (e: any) {
      setLoadError(e?.message || 'Could not load your requests');
      setRequests([]);
      setStatistics({
        totalRequests: 0,
        totalCost: 0,
        pendingRequests: 0,
        completedRequests: 0,
        cancelledRequests: 0,
      });
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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  };

  type ActivityRow = {
    id: string;
    title: string;
    description: string;
    time: string;
    status: 'completed' | 'pending' | 'new' | 'cancelled';
  };

  const getRecentActivity = (): ActivityRow[] => {
    const sorted = [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recent = sorted.slice(0, 5);
    const norm = (s: string) => String(s).toLowerCase();

    return recent.map((req) => {
      const ns = norm(req.status);
      const activityStatus: ActivityRow['status'] =
        ns === 'completed'
          ? 'completed'
          : ns === 'cancelled'
            ? 'cancelled'
            : ns === 'pending' || ns === 'accepted'
              ? 'pending'
              : 'new';
      return {
        id: req.id,
        title: `${getServiceTypeLabel(req.serviceType)} — ${getStatusLabel(req.status)}`,
        description: getActivityDescription(req),
        time: formatTimeAgo(req.updatedAt || req.createdAt),
        status: activityStatus,
      };
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

  const getStatusLabel = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === 'completed') return 'completed';
    if (s === 'pending' || s === 'accepted') return 'in progress';
    if (s === 'cancelled') return 'cancelled';
    return status || 'updated';
  };

  const getActivityDescription = (req: ServiceRequest) => {
    const s = String(req.status).toLowerCase();
    if (s === 'completed') {
      return `Your ${getServiceTypeLabel(req.serviceType).toLowerCase()} service has been completed`;
    }
    if (s === 'accepted') {
      return 'Provider has accepted your request and is on the way';
    }
    if (s === 'pending') {
      return 'Waiting for provider response';
    }
    if (s === 'cancelled') {
      return 'This request was cancelled';
    }
    return `${getServiceTypeLabel(req.serviceType)} — ${req.location || 'location on file'}`;
  };

  const completionRate =
    statistics.totalRequests > 0
      ? Math.round((statistics.completedRequests / statistics.totalRequests) * 100)
      : 0;

  const totalRequestsSubtitle = buildTotalRequestsSubtitle(requests, statistics.totalRequests);
  const totalCostSubtitle = buildTotalCostSubtitle(requests, statistics.totalCost);
  const pendingSubtitle =
    statistics.pendingRequests > 0
      ? `${statistics.pendingRequests} active (pending or accepted)`
      : 'No open requests';
  const completedDetails =
    statistics.totalRequests > 0
      ? `${statistics.completedRequests}/${statistics.totalRequests} done${
          statistics.cancelledRequests > 0 ? `, ${statistics.cancelledRequests} cancelled` : ''
        }`
      : '';

  const activityRows = getRecentActivity();

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.green} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading profile...</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {loadError ? (
          <View style={[styles.errorBanner, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.errorBannerText, { color: '#b91c1c' }]}>{loadError}</Text>
            <Text style={[styles.errorBannerHint, { color: colors.textSecondary }]}>
              Pull down to retry. Showing zeros until requests load.
            </Text>
          </View>
        ) : null}

        {/* Personal Information */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <View style={styles.cardHeaderTextBlock}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Personal Information</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Your account details and preferences
              </Text>
            </View>
          </View>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Name</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Role</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {(user?.role || 'customer').charAt(0).toUpperCase() + (user?.role || 'customer').slice(1)}
              </Text>
            </View>
            {user?.businessName && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Business Name</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{user.businessName}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: '#b91c1c' }]}>Log out</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Requests"
            value={statistics.totalRequests}
            subtitle={totalRequestsSubtitle}
            icon="📋"
            colors={colors}
          />
          <StatCard
            title="Total Cost"
            value={`$${statistics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`}
            subtitle={totalCostSubtitle}
            icon="💰"
            colors={colors}
          />
          <StatCard
            title="Pending Requests"
            value={statistics.pendingRequests}
            subtitle={pendingSubtitle}
            icon="⏱️"
            colors={colors}
          />
          <StatCard
            title="Completed Requests"
            value={statistics.completedRequests}
            subtitle={
              statistics.totalRequests > 0
                ? `${completionRate}% completed · ${completedDetails}`
                : 'No requests yet'
            }
            icon="✅"
            colors={colors}
          />
        </View>

        {/* Recent Activity */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeaderStack}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Recent Activity</Text>
            <Text style={[styles.cardSubtitle, styles.cardSubtitleWrap, { color: colors.textSecondary }]}>
              Your latest service requests and updates
            </Text>
          </View>
          <View style={styles.activityList}>
            {activityRows.length === 0 ? (
              <Text style={[styles.emptyActivity, { color: colors.textSecondary }]}>
                No activity yet. When you create service requests, your latest updates will show here.
              </Text>
            ) : (
              activityRows.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  time={activity.time}
                  status={activity.status}
                  colors={colors}
                />
              ))
            )}
          </View>
        </View>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  cardHeaderTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardHeaderStack: {
    marginBottom: 20,
    gap: 6,
    alignSelf: 'stretch',
    width: '100%',
  },
  cardIcon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  cardSubtitleWrap: {
    flexShrink: 1,
    width: '100%',
  },
  infoGrid: {
    gap: 16,
    marginBottom: 20,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  errorBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorBannerHint: {
    fontSize: 12,
  },
  logoutButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyActivity: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statIcon: {
    fontSize: 18,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 11,
    flexShrink: 1,
    width: '100%',
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityDescription: {
    fontSize: 13,
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
    flexShrink: 0,
    maxWidth: 88,
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});

