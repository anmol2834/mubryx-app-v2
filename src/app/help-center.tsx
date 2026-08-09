import { Brand, Radius, Shadow, Spacing, Typography } from '@/constants/brand';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Linking } from 'react-native';
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

// --- Icons ---
function BackIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M15 18l-6-6 6-6" stroke={Brand.textPrimary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="11" cy="11" r="8" stroke={Brand.textMuted} strokeWidth={2} />
      <Path d="M21 21l-4.35-4.35" stroke={Brand.textMuted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDown({ color = Brand.textPrimary }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Polyline points="6 9 12 15 18 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// --- Data ---
const CATEGORIES = ['All', 'Booking', 'Payments', 'Warranty', 'Trust & Safety'];

const FAQS = [
  {
    id: '1',
    category: 'Booking',
    question: 'How do I reschedule or cancel my booking?',
    answer: 'You can reschedule or cancel your booking for free up to 2 hours before the scheduled time. Go to the "History" tab, select your upcoming booking, and tap "Reschedule" or "Cancel".'
  },
  {
    id: '2',
    category: 'Warranty',
    question: 'Is there a warranty on the repairs?',
    answer: 'Yes! We provide a 30-day service warranty on all our repairs. If the same issue occurs within 30 days, we will fix it completely free of charge. Spare parts come with their own manufacturer warranty.'
  },
  {
    id: '3',
    category: 'Payments',
    question: 'What are the available payment options?',
    answer: 'You can pay securely via UPI, Credit/Debit Cards, Net Banking, or choose Pay on Service (Cash) after the job is completed.'
  },
  {
    id: '4',
    category: 'Trust & Safety',
    question: 'Are the technicians background-verified?',
    answer: 'Absolutely. Every professional on our platform undergoes a strict background check, identity verification, and rigorous skills training before they are assigned to any job.'
  },
  {
    id: '5',
    category: 'Booking',
    question: 'How can I track my assigned technician?',
    answer: 'Once a technician is assigned, you will see a "Track" button on your Home and History screens. You can view their real-time location on the map and call them directly.'
  }
];

// --- Components ---
const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Animation values
  const heightValue = useSharedValue(0);
  const rotationValue = useSharedValue(0);
  
  const contentRef = useAnimatedRef<View>();

  const toggle = () => {
    if (expanded) {
      heightValue.value = withTiming(0, { duration: 300 });
      rotationValue.value = withTiming(0, { duration: 300 });
    } else {
      runOnUI(() => {
        'worklet';
        const measurement = measure(contentRef);
        if (measurement) {
          heightValue.value = withTiming(measurement.height, { duration: 300 });
        }
      })();
      rotationValue.value = withTiming(180, { duration: 300 });
    }
    setExpanded(!expanded);
  };

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: heightValue.value,
    opacity: heightValue.value > 0 ? withTiming(1) : withTiming(0)
  }));

  const animatedRotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationValue.value}deg` }]
  }));

  return (
    <View style={styles.faqCard}>
      <Pressable style={styles.faqHeader} onPress={toggle} android_ripple={{ color: Brand.surface }}>
        <Text style={[styles.faqQuestion, expanded && { color: Brand.primary }]}>{question}</Text>
        <Animated.View style={animatedRotationStyle}>
          <ChevronDown color={expanded ? Brand.primary : Brand.textMuted} />
        </Animated.View>
      </Pressable>
      <Animated.View style={[styles.faqContentWrap, animatedHeightStyle]}>
        <View style={styles.faqContentInner} ref={contentRef}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <BackIcon />
        </Pressable>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]} showsVerticalScrollIndicator={false}>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.heroText}>How can we help you?</Text>
          <View style={styles.searchBar}>
            <SearchIcon />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search for articles, guides..."
              placeholderTextColor={Brand.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map(cat => (
            <Pressable 
              key={cat} 
              style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Top Questions</Text>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map(faq => (
              <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Still need help?</Text>
          <View style={styles.contactCardsRow}>
            
            <Pressable 
              style={styles.contactCard} 
              android_ripple={{ color: Brand.surface }}
              onPress={() => Linking.openURL('whatsapp://send?phone=919875134775')}
            >
              <View style={[styles.contactIconBg, { backgroundColor: Brand.primarySoft }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={Brand.primary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.contactTitle}>Chat Support</Text>
              <Text style={styles.contactSub}>Usually replies in 2 mins</Text>
            </Pressable>

            <Pressable 
              style={styles.contactCard} 
              android_ripple={{ color: Brand.surface }}
              onPress={() => Linking.openURL('tel:+919875134775')}
            >
              <View style={[styles.contactIconBg, { backgroundColor: Brand.successSoft }]}>
                <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                  <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.89-1.89a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke={Brand.success} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.contactTitle}>Call Support</Text>
              <Text style={styles.contactSub}>Available 9am to 9pm</Text>
            </Pressable>

          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Brand.offWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.base,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.borderLight,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...Typography.h3, color: Brand.textPrimary },
  scroll: { flex: 1 },
  content: {},
  
  // Search
  searchContainer: {
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.lg,
    backgroundColor: Brand.white,
    paddingBottom: Spacing.xl,
  },
  heroText: {
    ...Typography.h1,
    color: Brand.textPrimary,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: Brand.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
  },

  // Categories
  categoriesScroll: {
    marginTop: -20, // Overlap the search container slightly
  },
  categoriesContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },
  categoryPill: {
    backgroundColor: Brand.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    ...Shadow.sm,
  },
  categoryPillActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  categoryText: {
    ...Typography.smallMedium,
    color: Brand.textSecondary,
  },
  categoryTextActive: {
    color: Brand.white,
  },

  // FAQs
  faqSection: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Brand.textPrimary,
    marginBottom: Spacing.md,
  },
  faqCard: {
    backgroundColor: Brand.white,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  faqQuestion: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Brand.textPrimary,
    fontWeight: '600',
    paddingRight: Spacing.sm,
  },
  faqContentWrap: {
    overflow: 'hidden',
  },
  faqContentInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    paddingTop: 0,
  },
  faqAnswer: {
    ...Typography.body,
    color: Brand.textSecondary,
    lineHeight: 22,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Brand.textMuted,
  },

  // Contact Support
  contactSection: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xl,
  },
  contactCardsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactCard: {
    flex: 1,
    backgroundColor: Brand.white,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderLight,
    alignItems: 'center',
    ...Shadow.sm,
  },
  contactIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  contactTitle: {
    ...Typography.smallMedium,
    color: Brand.textPrimary,
    marginBottom: 4,
  },
  contactSub: {
    ...Typography.caption,
    color: Brand.textMuted,
    textAlign: 'center',
  },
});
