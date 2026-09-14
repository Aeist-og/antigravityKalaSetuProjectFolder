import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { Cart } from '../../models/cart';
import { CustomerProfile } from '../../models/customer';

export const CustomerCartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [placingOrder, setPlacingOrder] = useState<boolean>(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'razorpay'>('cod');

  const loadCartData = async () => {
    const cartUserId = user?.id || 'guest_patron';
    try {
      const [cartRes, profRes] = await Promise.all([
        DatabaseService.getCart(cartUserId),
        user?.id ? DatabaseService.getCustomerProfile(user.id) : Promise.resolve({ data: null, error: null }),
      ]);
      if (cartRes.data) setCart(cartRes.data);
      if (profRes.data) {
        setProfile(profRes.data);
        setDeliveryAddress(profRes.data.deliveryAddress || '42 Janpath Crafts Lane, Connaught Place, New Delhi');
        setRecipientName(user?.fullName || 'Customer Patron');
        setRecipientPhone(user?.phone || '+91 98765 43210');
      } else {
        setDeliveryAddress('42 Janpath Crafts Lane, Connaught Place, New Delhi');
        setRecipientName(user?.fullName || 'Customer Patron');
        setRecipientPhone(user?.phone || '+91 98765 43210');
      }
    } catch (e) {
      console.warn('Error loading cart data:', e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCartData();
    }, [user?.id])
  );

  const handleUpdateQty = async (cartItemId: string, newQty: number) => {
    await DatabaseService.updateCartItemQuantity(cartItemId, newQty);
    loadCartData();
  };

  const handleRemove = async (cartItemId: string) => {
    await DatabaseService.removeFromCart(cartItemId);
    loadCartData();
  };

  const handleProceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      Alert.alert('Cart is empty', 'Please add handcrafted items before proceeding.');
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmOrder = async () => {
    const targetUserId = user?.id || 'guest_patron';
    if (!deliveryAddress.trim()) {
      Alert.alert('Shipping Address Required', 'Please enter your delivery destination.');
      return;
    }

    setPlacingOrder(true);
    try {
      const orderRes = await DatabaseService.createOrder({
        customerId: targetUserId,
        totalAmount: cart?.totalAmount || 0,
        shippingAddress: `${recipientName || 'Customer Patron'} (${recipientPhone || '+91 98765 43210'}) - ${deliveryAddress.trim()}`,
        paymentMethod: selectedPayment === 'cod' ? 'Cash on Delivery (Pay to Artisan)' : 'Razorpay (Test Mode)',
        items: (cart?.items || []).map(it => ({
          productId: it.productId,
          artisanId: 'artisan-direct',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
        })),
      });

      if (orderRes.data) {
        await DatabaseService.clearCart(targetUserId);
        setShowCheckoutModal(false);
        setCart(null);

        Alert.alert(
          'Order Confirmed! 🎉',
          `Order #${orderRes.data.id.substring(0, 8)} has been routed directly to the master artisans. Tracking updates will be delivered to your Activity feed.`,
          [
            {
              text: 'View My Orders',
              onPress: () => navigation.navigate('Orders'),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.navigate('Home'),
              style: 'cancel',
            },
          ]
        );
      }
    } catch {
      Alert.alert('Error', 'Unable to confirm order at this time. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalAmount || 0;
  const shipping = 0; // Handloom Bharat Free Delivery initiative
  const grandTotal = subtotal + shipping;

  return (
    <View style={styles.screen}>
      <Header
        title="Your Shopping Bag"
        subtitle={items.length > 0 ? `${items.length} unique handcrafted items` : 'Zero items in bag'}
        showLanguageToggle
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Your shopping bag is empty</Text>
            <Text style={styles.emptyDesc}>Discover authentic pottery, handlooms, woodwork, and jewellery directly from artisans.</Text>
            <Button
              title="Explore Marketplace"
              onPress={() => navigation.navigate('Discover')}
              size="md"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <View style={[styles.card, Shadows.soft]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.sectionHeader}>Selected Handcrafted Items ({items.length})</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
                  <Text style={styles.addMoreLink}>+ Add More</Text>
                </TouchableOpacity>
              </View>

              {items.map((item, idx) => (
                <View
                  key={item.id}
                  style={[styles.itemRow, idx < items.length - 1 && styles.itemRowBorder]}
                >
                  {item.product?.primaryImageUrl ? (
                    <Image source={{ uri: item.product.primaryImageUrl }} style={styles.itemThumb} />
                  ) : (
                    <View style={styles.thumbPlaceholder}>
                      <Text style={{ fontSize: 28 }}>🏺</Text>
                    </View>
                  )}

                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.product?.titleEn || item.product?.titleHi || 'Handmade Heritage Product'}
                    </Text>
                    {item.product?.craftType ? (
                      <Text style={styles.itemCraftTag}>🧵 {item.product.craftType}</Text>
                    ) : null}
                    <Text style={styles.itemPrice}>₹{item.unitPrice.toLocaleString()}</Text>

                    {/* Quantity Stepper */}
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQty(item.id, item.quantity - 1)}
                      >
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleUpdateQty(item.id, item.quantity + 1)}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleRemove(item.id)}
                      >
                        <Text style={styles.deleteText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Price Breakdown */}
            <View style={[styles.card, Shadows.soft]}>
              <Text style={styles.sectionHeader}>Price Breakdown</Text>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Bag Subtotal</Text>
                <Text style={styles.billVal}>₹{subtotal.toLocaleString()}</Text>
              </View>

              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Artisan Craft Delivery</Text>
                <Text style={[styles.billVal, { color: Colors.success }]}>FREE (Subsidized)</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                <Text style={styles.grandLabel}>Grand Total</Text>
                <Text style={styles.grandVal}>₹{grandTotal.toLocaleString()}</Text>
              </View>

              <Button
                title="Proceed to Checkout →"
                onPress={handleProceedToCheckout}
                size="lg"
                style={{ marginTop: Spacing.md }}
              />

              <TouchableOpacity
                style={styles.continueShoppingBtn}
                onPress={() => navigation.navigate('Discover')}
              >
                <Text style={styles.continueShoppingText}>← Continue Shopping</Text>
              </TouchableOpacity>

              <Text style={styles.codNote}>
                🔒 100% Fair Trade • Direct Payments to Artisan Self-Help Clusters
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Checkout Modal */}
      <Modal visible={showCheckoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, Shadows.card]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Order & Delivery Review</Text>
              <TouchableOpacity onPress={() => setShowCheckoutModal(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubHeader}>📍 Delivery Recipient</Text>
              <TextInput
                style={styles.modalInput}
                value={recipientName}
                onChangeText={setRecipientName}
                placeholder="Full Name"
                placeholderTextColor={Colors.textMuted}
              />
              <TextInput
                style={styles.modalInput}
                value={recipientPhone}
                onChangeText={setRecipientPhone}
                placeholder="Phone Number (+91)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.modalInput, { minHeight: 64 }]}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                placeholder="Street Address, City, State, PIN Code"
                placeholderTextColor={Colors.textMuted}
                multiline
              />

              <Text style={styles.modalSubHeader}>💳 Payment Method</Text>
              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'cod' && styles.paymentOptionSelected]}
                onPress={() => setSelectedPayment('cod')}
              >
                <View style={styles.radioDot}>
                  {selectedPayment === 'cod' && <View style={styles.radioDotInner} />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.paymentTitle}>Pay on Delivery / Cash on Delivery</Text>
                  <Text style={styles.paymentSub}>Inspect handcrafted items before releasing payment</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, selectedPayment === 'razorpay' && styles.paymentOptionSelected]}
                onPress={() => setSelectedPayment('razorpay')}
              >
                <View style={styles.radioDot}>
                  {selectedPayment === 'razorpay' && <View style={styles.radioDotInner} />}
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.paymentTitle}>Online Payment (Razorpay Test Mode)</Text>
                  <Text style={styles.paymentSub}>UPI, Cards, Netbanking • Integration Ready</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.orderSummaryBox}>
                <Text style={styles.summaryTitle}>Total Payable: ₹{grandTotal.toLocaleString()}</Text>
                <Text style={styles.summarySub}>Includes free insured delivery across India</Text>
              </View>

              <Button
                title={placingOrder ? 'Confirming Order...' : `Confirm Order (₹${grandTotal.toLocaleString()})`}
                onPress={handleConfirmOrder}
                loading={placingOrder}
                size="lg"
                style={{ marginTop: Spacing.md }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Spacing.sm,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.text,
  },
  itemPrice: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.secondary,
    marginVertical: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qtyBtn: {
    backgroundColor: Colors.surfaceAlt,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  qtyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteBtn: {
    marginLeft: Spacing.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.error,
  },
  addressInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  billVal: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  grandLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  grandVal: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.secondary,
  },
  codNote: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  addMoreLink: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemCraftTag: {
    fontSize: 10,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  continueShoppingBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  continueShoppingText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 25, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.textSecondary,
    padding: 4,
  },
  modalSubHeader: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.text,
  },
  paymentSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  orderSummaryBox: {
    backgroundColor: Colors.surfaceAlt,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  summarySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

