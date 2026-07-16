import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../constants/theme';
import { Card, Button, TextInput_ } from '../components';
import { useAuth } from '../hooks/useAuth';
import { mealService } from '../services/firebaseService';

export const MealPlannerScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    mealName: '',
    date: '',
    mealType: 'Breakfast',
    ingredients: '',
    servings: '',
    prepTime: '',
    notes: '',
  });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const fetchMeals = async () => {
    if (!user?.uid) return;
    try {
      const mealPlans = await mealService.getMeals(user.uid);
      setMeals(mealPlans.sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch meal plans');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchMeals();
    }, [user])
  );

  const handleAddMeal = async () => {
    if (!formData.mealName || !formData.date) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      if (editingMeal) {
        await mealService.updateMeal(user.uid, editingMeal.id, formData);
      } else {
        await mealService.addMeal(user.uid, formData);
      }
      setModalVisible(false);
      resetForm();
      fetchMeals();
    } catch (error) {
      Alert.alert('Error', 'Failed to save meal plan');
    }
  };

  const handleDeleteMeal = async (mealId) => {
    Alert.alert('Delete Meal', 'Remove this meal from your plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await mealService.deleteMeal(user.uid, mealId);
            fetchMeals();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete meal');
          }
        },
      },
    ]);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setFormData({
      mealName: meal.mealName,
      date: meal.date,
      mealType: meal.mealType,
      ingredients: meal.ingredients,
      servings: meal.servings?.toString() || '',
      prepTime: meal.prepTime?.toString() || '',
      notes: meal.notes || '',
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      mealName: '',
      date: '',
      mealType: 'Breakfast',
      ingredients: '',
      servings: '',
      prepTime: '',
      notes: '',
    });
    setEditingMeal(null);
  };

  const getMealIcon = (type) => {
    switch (type) {
      case 'Breakfast': return '🥐';
      case 'Lunch': return '🍽️';
      case 'Dinner': return '🍴';
      case 'Snack': return '🍿';
      default: return '🥘';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={meals}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchMeals();
        }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Weekly Meal Plan</Text>
            <Text style={styles.headerSubtitle}>Plan your meals and organize shopping</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View style={styles.mealTypeIcon}>
                <Text style={styles.icon}>{getMealIcon(item.mealType)}</Text>
              </View>
              <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.mealName}</Text>
                <Text style={styles.mealDate}>{item.date} • {item.mealType}</Text>
              </View>
            </View>

            {item.ingredients && (
              <View style={styles.mealDetail}>
                <Text style={styles.mealDetailLabel}>Ingredients:</Text>
                <Text style={styles.mealDetailText}>{item.ingredients}</Text>
              </View>
            )}

            <View style={styles.mealMetaRow}>
              {item.servings && (
                <View style={styles.mealMeta}>
                  <Text style={styles.metaLabel}>Servings</Text>
                  <Text style={styles.metaValue}>{item.servings}</Text>
                </View>
              )}
              {item.prepTime && (
                <View style={styles.mealMeta}>
                  <Text style={styles.metaLabel}>Prep Time</Text>
                  <Text style={styles.metaValue}>{item.prepTime} min</Text>
                </View>
              )}
            </View>

            {item.notes && (
              <View style={styles.mealDetail}>
                <Text style={styles.mealDetailLabel}>Notes:</Text>
                <Text style={styles.mealDetailText}>{item.notes}</Text>
              </View>
            )}

            <View style={styles.mealActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditMeal(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteMeal(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No meals planned yet</Text>
            <Button
              title="Plan a Meal"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={styles.emptyButton}
            />
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingMeal ? 'Edit Meal' : 'Add Meal to Plan'}</Text>

            <TextInput_
              label="Meal Name"
              placeholder="e.g., Grilled Chicken"
              value={formData.mealName}
              onChangeText={(text) => setFormData({ ...formData, mealName: text })}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Meal Type"
                  placeholder="Select type"
                  value={formData.mealType}
                  onChangeText={(text) => setFormData({ ...formData, mealType: text })}
                />
              </View>
            </View>

            <TextInput_
              label="Ingredients"
              placeholder="List ingredients"
              value={formData.ingredients}
              onChangeText={(text) => setFormData({ ...formData, ingredients: text })}
              multiline
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Servings"
                  placeholder="e.g., 4"
                  value={formData.servings}
                  onChangeText={(text) => setFormData({ ...formData, servings: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Prep Time (min)"
                  placeholder="e.g., 30"
                  value={formData.prepTime}
                  onChangeText={(text) => setFormData({ ...formData, prepTime: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TextInput_
              label="Notes"
              placeholder="Any special notes?"
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleAddMeal}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textLight,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  mealCard: {
    marginBottom: spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  mealTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  mealDate: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  mealDetail: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  mealDetailLabel: {
    ...typography.caption,
    color: colors.textLight,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  mealDetailText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  mealMetaRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  mealMeta: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textLight,
  },
  metaValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  mealActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  deleteText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});
