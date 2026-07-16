import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, RefreshControl, ActivityIndicator, CheckBox } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../constants/theme';
import { Card, Button, TextInput_, Badge } from '../components';
import { useAuth } from '../hooks/useAuth';
import { shoppingService } from '../services/firebaseService';

export const ShoppingListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: 'Groceries',
    estimatedPrice: '',
    notes: '',
  });

  const categories = ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Bread', 'Other'];

  const fetchItems = async () => {
    if (!user?.uid) return;
    try {
      const shoppingItems = await shoppingService.getItems(user.uid);
      setItems(shoppingItems.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1)));
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch shopping list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchItems();
    }, [user])
  );

  const handleToggleItem = async (item) => {
    try {
      await shoppingService.toggleItem(user.uid, item.id, !item.completed);
      fetchItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.quantity) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      if (editingItem) {
        await shoppingService.updateItem(user.uid, editingItem.id, {
          ...formData,
          quantity: parseInt(formData.quantity),
          estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : 0,
        });
      } else {
        await shoppingService.addItem(user.uid, {
          ...formData,
          quantity: parseInt(formData.quantity),
          estimatedPrice: formData.estimatedPrice ? parseFloat(formData.estimatedPrice) : 0,
        });
      }
      setModalVisible(false);
      resetForm();
      fetchItems();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    Alert.alert('Delete Item', 'Remove this item from shopping list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await shoppingService.deleteItem(user.uid, itemId);
            fetchItems();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      category: item.category,
      estimatedPrice: item.estimatedPrice?.toString() || '',
      notes: item.notes || '',
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      category: 'Groceries',
      estimatedPrice: '',
      notes: '',
    });
    setEditingItem(null);
  };

  const completedCount = items.filter(i => i.completed).length;
  const totalPrice = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0);

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
        data={items}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchItems();
        }} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{items.length}</Text>
                <Text style={styles.summaryLabel}>Total Items</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{completedCount}</Text>
                <Text style={styles.summaryLabel}>Purchased</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
                <Text style={styles.summaryLabel}>Est. Cost</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={[styles.itemCard, item.completed && styles.itemCardCompleted]}>
            <View style={styles.itemContent}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleItem(item)}
              >
                <View style={[styles.checkboxInner, item.completed && styles.checkboxInnerChecked]}>
                  {item.completed && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
                  {item.name}
                </Text>
                <View style={styles.itemMeta}>
                  <Badge label={item.category} variant="primary" />
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  {item.estimatedPrice > 0 && (
                    <Text style={styles.itemPrice}>${item.estimatedPrice.toFixed(2)}</Text>
                  )}
                </View>
                {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteActionButton]}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Text style={styles.deleteActionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Your shopping list is empty</Text>
            <Button
              title="Add Items"
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
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add to Shopping List'}</Text>

            <TextInput_
              label="Item Name"
              placeholder="What to buy?"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Quantity"
                  placeholder="0"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Price (optional)"
                  placeholder="0.00"
                  value={formData.estimatedPrice}
                  onChangeText={(text) => setFormData({ ...formData, estimatedPrice: text })}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TextInput_
              label="Category"
              placeholder="Select category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />

            <TextInput_
              label="Notes (optional)"
              placeholder="Any special instructions?"
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
                onPress={handleAddItem}
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
    paddingBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    flexDirection: 'row',
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.text,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemCardCompleted: {
    backgroundColor: colors.surface,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: spacing.md,
    marginTop: spacing.sm,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInnerChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  itemNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  itemQuantity: {
    ...typography.caption,
    color: colors.textLight,
  },
  itemPrice: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  itemNotes: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionButton: {
    backgroundColor: '#FEE2E2',
  },
  actionIcon: {
    fontSize: 16,
  },
  deleteActionIcon: {
    fontSize: 16,
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
