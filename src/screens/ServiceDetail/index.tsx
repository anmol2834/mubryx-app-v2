import { Brand } from '@/constants/brand';
import { ServiceDetailData, ServiceItem } from '@/constants/serviceDetail';
import { useCartMutations } from '@/hooks/mutations/useCartMutations';
import { useCartQuery } from '@/hooks/queries/useCartQuery';
import { useServicesQuery } from '@/hooks/queries/useServicesQuery';
import { useCategory } from '@/hooks/useCategory';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { BottomBookingBar } from './components/BottomBookingBar';
import { ServiceCard } from './components/ServiceCard';
import { ServiceHeader } from './components/ServiceHeader';
import { ServiceOverview } from './components/ServiceOverview';
import { ServiceSelectionHeader } from './components/ServiceSelectionHeader';
import { TrustIndicators } from './components/TrustIndicators';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const { data: cart } = useCartQuery();
  const { addItem, removeItem } = useCartMutations();

  const params = useLocalSearchParams<{ categoryId?: string; slug?: string }>();
  const categoryId = params.categoryId;
  const slug = params.slug ?? 'microwave';

  const { data: apiServices = [] } = useServicesQuery({ categoryId });
  const { category: apiCategory } = useCategory(categoryId);

  const data: ServiceDetailData = useMemo(() => {
    const fallbackTitle = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const title = apiCategory?.name ?? fallbackTitle;
    const description =
      apiCategory?.description ?? `Professional ${fallbackTitle} services by certified technicians.`;
    const image = apiCategory?.image;
    const bgColor = apiCategory?.bgColor ?? '#EEF6FF';

    const mappedServices: ServiceItem[] = apiServices.map((apiService) => ({
      id: apiService.id,
      name: apiService.title,
      description: apiService.description,
      rating: String(apiService.rating),
      reviewCount: `${apiService.reviewCount}`,
      duration: apiService.duration,
      price: apiService.discountPrice ?? apiService.price,
      originalPrice: apiService.discountPrice ? apiService.price : undefined,
      successHighlight: '30-Day Warranty Included',
      image: apiService.image,
    }));

    return {
      id: categoryId ?? slug,
      title,
      category: title,
      description,
      image,
      bgColor,
      services: mappedServices,
    };
  }, [apiServices, slug, categoryId, apiCategory]);

  // Derive selected services directly from centralized cart query state
  const selectedCartItemMap = useMemo(() => {
    const map = new Map<string, string>(); // serviceId -> cartItemId
    if (cart?.items) {
      for (const item of cart.items) {
        map.set(item.serviceId, item.id);
        map.set(item.id, item.id);
      }
    }
    return map;
  }, [cart?.items]);

  const serverSelectedIds = useMemo(() => {
    const set = new Set<string>();
    for (const service of data.services) {
      if (selectedCartItemMap.has(service.id)) {
        set.add(service.id);
      }
    }
    return set;
  }, [data.services, selectedCartItemMap]);

  // Local optimistic overrides map: serviceId -> boolean (true = checked, false = unchecked)
  const [localOverrides, setLocalOverrides] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(() => {
    const set = new Set<string>();
    for (const service of data.services) {
      const isOverrideSet = localOverrides[service.id] !== undefined;
      const isSelected = isOverrideSet ? localOverrides[service.id] : serverSelectedIds.has(service.id);
      if (isSelected) {
        set.add(service.id);
      }
    }
    return set;
  }, [data.services, serverSelectedIds, localOverrides]);

  const handleToggle = useCallback(
    (serviceId: string) => {
      const isCurrentlySelected = selectedIds.has(serviceId);
      const nextSelected = !isCurrentlySelected;

      // 1. INSTANT 0ms UI Feedback
      setLocalOverrides((prev) => ({
        ...prev,
        [serviceId]: nextSelected,
      }));

      // 2. Trigger background mutation
      if (isCurrentlySelected) {
        const cartItemId = selectedCartItemMap.get(serviceId) || serviceId;
        removeItem.mutate({ itemId: cartItemId });
      } else {
        const serviceObj = data.services.find((s: any) => s.id === serviceId);
        addItem.mutate({
          serviceId,
          quantity: 1,
          serviceData: serviceObj
            ? {
                id: serviceObj.id,
                title: serviceObj.name,
                description: serviceObj.description,
                price: serviceObj.price,
                discountPrice: serviceObj.originalPrice,
                image: serviceObj.image,
                duration: serviceObj.duration,
              }
            : undefined,
        });
      }
    },
    [selectedIds, selectedCartItemMap, data.services, addItem, removeItem]
  );

  const totalPrice = useMemo(() => {
    return data.services
      .filter((s: any) => selectedIds.has(s.id))
      .reduce((sum: number, s: any) => sum + s.price, 0);
  }, [selectedIds, data.services]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  const handleContinue = useCallback(() => {
    if (selectedIds.size === 0) return;
    router.push('/checkout');
  }, [selectedIds.size, router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Brand.white} translucent={false} />
      <ServiceHeader onBack={handleBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <ServiceOverview data={data} />
        <TrustIndicators />

        <ServiceSelectionHeader serviceTitle={data.title} selectedCount={selectedIds.size} />

        <View style={styles.cardList}>
          {data.services.map((item: any, index: number) => (
            <ServiceCard
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onToggle={handleToggle}
              index={index}
            />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>

      <BottomBookingBar
        selectedCount={selectedIds.size}
        totalPrice={totalPrice}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: Brand.white,
  },
  cardList: {
    gap: 0,
  },
  bottomPad: {
    height: 100,
  },
});
