import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../constants/theme';
import { Card, Button, TextInput_, Badge } from '../components';
import { useAuth } from '../hooks/useAuth';
import { pantryService } from '../services/firebaseService';

export const PantryScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
  });

  const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Other'];

  const fetchItems = async () => {
    if (!user?.uid) return;
    try {
      const pantryItems = await pantryService.getItems(user.uid);
      setItems(pantryItems);
      filterItems(pantryItems, selectedCategory, searchText);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pantry items');
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

  const filterItems = (itemsList, category, search) => {
    let filtered = itemsList;
    if (category !== 'All') {
      filtered = filtered.filter(item => item.category === category);
    }
    if (search) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    filterItems(items, category, searchText);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    filterItems(items, selectedCategory, text);
  };

  const handleAddItem = async () => {
    if (!formData.name || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        await pantryService.updateItem(user.uid, editingItem.id, {
          ...formData,
          quantity: parseInt(formData.quantity),
        });
      } else {
        await pantryService.addItem(user.uid, {
          ...formData,
          quantity: parseInt(formData.quantity),
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
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await pantryService.deleteItem(user.uid, itemId);
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
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      expiryDate: item.expiryDate || '',
    });
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Vegetables',
      quantity: '',
      unit: 'kg',
      expiryDate: '',
    });
    setEditingItem(null);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { color: colors.error, label: 'Out of Stock' };
    if (quantity <= 2) return { color: colors.warning, label: 'Low Stock' };
    return { color: colors.success, label: 'In Stock' };
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
        data={filteredItems}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchItems();
        }} />}
        ListHeaderComponent={
          <>
            <TextInput_
              placeholder="Search pantry items..."
              value={searchText}
              onChangeText={handleSearch}
              style={styles.searchInput}
            />
            <View style={styles.categoryContainer}>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={cat => cat}
                renderItem={({ item: cat }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => handleCategoryFilter(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{filteredItems.length}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </Card>
              <Card style={styles.statCard}>
                <Text style={styles.statValue}>{filteredItems.filter(i => i.quantity === 0).length}</Text>
                <Text style={styles.statLabel}>Out of Stock</Text>
              </Card>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const status = getStockStatus(item.quantity);
          return (
            <Card style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <Badge label={status.label} variant={item.quantity === 0 ? 'error' : item.quantity <= 2 ? 'warning' : 'primary'} />
              </View>
              <View style={styles.itemFooter}>
                <Text style={styles.itemQuantity}>{item.quantity} {item.unit}</Text>
                {item.expiryDate && <Text style={styles.expiryDate}>Expires: {item.expiryDate}</Text>}
              </View>
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditItem(item)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items in pantry</Text>
            <Button
              title="Add First Item"
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={styles.addButton}
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
            <Text style={styles.modalTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</Text>

            <TextInput_
              label="Item Name"
              placeholder="Enter item name"
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
                  label="Unit"
                  placeholder="kg, pcs, etc"
                  value={formData.unit}
                  onChangeText={(text) => setFormData({ ...formData, unit: text })}
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
              label="Expiry Date (optional)"
              placeholder="YYYY-MM-DD"
              value={formData.expiryDate}
              onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchInput: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textLight,
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    marginRight: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  itemCard: {
    marginBottom: spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  itemDetails: {
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
  itemFooter: {
    marginBottom: spacing.md,
  },
  itemQuantity: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  expiryDate: {
    ...typography.caption,
    color: colors.warning,
    marginTop: spacing.sm,
  },
  itemActions: {
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
  emptyText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.lg,
  },
  addButton: {
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
