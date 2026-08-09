import { Brand, Spacing } from '@/constants/brand';
import type { CartItem } from '@/types/cart';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useCartMutations } from '@/hooks/mutations/useCartMutations';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CartHeader } from './components/CartHeader';
import { CartItemCard } from './components/CartItemCard';
import { EmptyCart } from './components/EmptyCart';
import { OrderSummaryCard } from './components/OrderSummaryCard';
import { StickyCheckoutBar } from './components/StickyCheckoutBar';

const ItemSeparator = memo(function ItemSeparator() {
  return <View style={{ height: Spacing.sm }} />;
});

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: cart, isLoading, refetch } = useCartQuery();
  const { removeItem, updateQuantity } = useCartMutations();

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, [router]);

  const handleExplore = useCallback(() => {
    router.replace('/');
  }, [router]);

  const isMutating = removeItem.isPending || updateQuantity.isPending;

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartItemCard
        item={item}
        onRemove={(id) => removeItem.mutate({ itemId: id, expectedVersion: cart?.version })}
        onUpdateQuantity={(id, qty) => updateQuantity.mutate({ itemId: id, quantity: qty, expectedVersion: cart?.version })}
        disabled={isMutating}
      />
    ),
    [isMutating, removeItem, updateQuantity, cart?.version]
  );

  const keyExtractor = useCallback((item: CartItem) => item.id, []);

  const CHECKOUT_BAR_HEIGHT = 88 + insets.bottom;
  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart?.summary.total || 0;

  if (isLoading && !cart) {
    return (
      <View style={[styles.root, styles.centerContent]}>
        <ActivityIndicator size="large" color={Brand.primary} />
        <Text style={styles.loadingText}>Fetching cart...</Text>
      </View>
    );
  }

  if (itemCount === 0 || !cart) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />
        <CartHeader onBack={handleBack} itemCount={0} />
        <EmptyCart onExplore={handleExplore} />
        <StickyCheckoutBar total={0} itemCount={0} onCheckout={handleCheckout} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />

      <CartHeader onBack={handleBack} itemCount={itemCount} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: CHECKOUT_BAR_HEIGHT + Spacing.base },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            colors={[Brand.primary]}
            tintColor={Brand.primary}
          />
        }
      >
        <OrderSummaryCard items={cart.items} summary={cart.summary} />

        <View style={styles.sectionGap} />

        <FlatList
          data={cart.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={ItemSeparator}
          scrollEnabled={false}
        />
      </ScrollView>

      <StickyCheckoutBar
        total={total}
        itemCount={itemCount}
        onCheckout={handleCheckout}
        disabled={isMutating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.offWhite,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Brand.textSecondary,
    fontSize: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.base,
  },
  sectionGap: {
    height: Spacing.base,
  },
});
