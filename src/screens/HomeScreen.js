import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../constants/theme';
import { Card, Badge } from '../components';
import { useAuth } from '../hooks/useAuth';
import { pantryService, shoppingService, budgetService } from '../services/firebaseService';

export const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [shoppingItems, setShoppingItems] = useState([]);
  const [stats, setStats] = useState({
    pantryItems: 0,
    shoppingList: 0,
    outOfStock: 0,
    monthlyBudget: 0,
  });

  const fetchDashboardData = async () => {
    if (!user?.uid) return;
    try {
      const pantryItems = await pantryService.getItems(user.uid);
      const lowStockItemsData = await pantryService.getLowStockItems(user.uid);
      const shoppingItemsData = await shoppingService.getItems(user.uid);
      const budgets = await budgetService.getBudgets(user.uid);

      setLowStockItems(lowStockItemsData.slice(0, 5));
      setShoppingItems(shoppingItemsData.slice(0, 5));
      setStats({
        pantryItems: pantryItems.length,
        shoppingList: shoppingItemsData.filter(item => !item.completed).length,
        outOfStock: pantryItems.filter(item => item.quantity === 0).length,
        monthlyBudget: budgets.length > 0 ? budgets[0].limit : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchDashboardData();
    }, [user])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerSection}>
        <Text style={styles.greeting}>Welcome back, {user?.displayName || 'User'}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
      </View>

      {stats.outOfStock > 0 && (
        <Card style={styles.alertCard}>
          <Text style={styles.alertTitle}>⚠️ Out of Stock Alert</Text>
          <Text style={styles.alertText}>{stats.outOfStock} items need restocking</Text>
        </Card>
      )}

      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Pantry')}
        >
          <Text style={styles.statNumber}>{stats.pantryItems}</Text>
          <Text style={styles.statLabel}>Pantry Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Shopping')}
        >
          <Text style={styles.statNumber}>{stats.shoppingList}</Text>
          <Text style={styles.statLabel}>To Buy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Budget')}
        >
          <Text style={styles.statNumber}>${stats.monthlyBudget}</Text>
          <Text style={styles.statLabel}>Monthly Budget</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => navigation.navigate('Meals')}
        >
          <Text style={styles.statNumber}>🍽️</Text>
          <Text style={styles.statLabel}>Meal Plans</Text>
        </TouchableOpacity>
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Pantry')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={lowStockItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Card style={styles.itemCard}>
                <View style={styles.itemContent}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <Badge label={`${item.quantity} left`} variant={item.quantity === 0 ? 'error' : 'warning'} />
                </View>
              </Card>
            )}
          />
        </View>
      )}

      {shoppingItems.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shopping List</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shopping')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={shoppingItems}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <Card style={styles.itemCard}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </Card>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  date: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  alertCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: '#FEF3C7',
  },
  alertTitle: {
    ...typography.h4,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  alertText: {
    ...typography.body,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginRight: '4%',
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  statNumber: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  seeAll: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  itemCategory: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  itemQuantity: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
});
