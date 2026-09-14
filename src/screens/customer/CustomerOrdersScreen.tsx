import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Order } from '../../models/order';

export const CustomerOrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadOrders = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const res = await DatabaseService.getCustomerOrders(user.id);
      if (res.data) setOrders(res.data);
    } catch (e) {
      console.warn('Error fetching customer orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge label="DELIVERED" variant="success" />;
      case 'shipped':
        return <Badge label="SHIPPED" variant="primary" />;
      case 'processing':
        return <Badge label="ARTISAN CRAFTING" variant="outline" />;
      default:
        return <Badge label="ORDER CONFIRMED" variant="success" />;
    }
  };

  return (
    <View style={styles.screen}>
      <Header
        title="My Craft Orders"
        subtitle="Track orders placed directly with Indian artisans"
        showLanguageToggle
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders placed yet</Text>
            <Text style={styles.emptyDesc}>
              When you purchase handmade crafts, your orders and tracking status will appear here.
            </Text>
            <Button
              title="Explore Crafts"
              onPress={() => navigation.navigate('Discover')}
              size="sm"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={[styles.orderCard, Shadows.soft]}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id.substring(0, 8).toUpperCase()}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                {getStatusBadge(order.status)}
              </View>

              {/* Order Items */}
              <View style={styles.itemsBlock}>
                {(order.items || []).map(item => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={styles.itemName}>
                      {item.product?.titleEn || item.product?.titleHi || 'Handmade Item'}
                    </Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
                    <Text style={styles.itemPrice}>₹{item.totalPrice.toLocaleString()}</Text>
                  </View>
                ))}
              </View>

              {/* Footer */}
              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Amount Paid / COD:</Text>
                <Text style={styles.totalAmount}>₹{order.totalAmount.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  orderId: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  itemsBlock: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 2,
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.text,
  },
  itemQty: {
    flex: 0.5,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  itemPrice: {
    flex: 1,
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'right',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.secondary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: 30,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
