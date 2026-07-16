import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../constants/theme';
import { Card, Button, TextInput_, Badge } from '../components';
import { useAuth } from '../hooks/useAuth';
import { budgetService } from '../services/firebaseService';

export const BudgetScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetFormData, setBudgetFormData] = useState({
    month: '',
    year: '',
    limit: '',
    category: 'Groceries',
  });
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'Groceries',
    date: '',
  });

  const categories = ['Groceries', 'Vegetables', 'Fruits', 'Dairy', 'Meat', 'Spices', 'Other'];

  const fetchBudgetData = async () => {
    if (!user?.uid) return;
    try {
      const budgetList = await budgetService.getBudgets(user.uid);
      const expenseList = await budgetService.getExpenses(user.uid);
      setBudgets(budgetList);
      setExpenses(expenseList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch budget data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBudgetData();
    }, [user])
  );

  const handleSetBudget = async () => {
    if (!budgetFormData.limit || !budgetFormData.month || !budgetFormData.year) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      if (editingBudget) {
        await budgetService.updateBudget(user.uid, editingBudget.id, budgetFormData);
      } else {
        await budgetService.setBudget(user.uid, budgetFormData);
      }
      setModalVisible(false);
      resetBudgetForm();
      fetchBudgetData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleAddExpense = async () => {
    if (!expenseFormData.description || !expenseFormData.amount || !expenseFormData.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      await budgetService.addExpense(user.uid, {
        ...expenseFormData,
        amount: parseFloat(expenseFormData.amount),
      });
      setExpenseModalVisible(false);
      resetExpenseForm();
      fetchBudgetData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    Alert.alert('Delete Budget', 'Remove this budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Note: Implement delete in firebaseService if needed
            fetchBudgetData();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete budget');
          }
        },
      },
    ]);
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      month: '',
      year: '',
      limit: '',
      category: 'Groceries',
    });
    setEditingBudget(null);
  };

  const resetExpenseForm = () => {
    setExpenseFormData({
      description: '',
      amount: '',
      category: 'Groceries',
      date: '',
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  };

  const getCurrentBudget = () => {
    const today = new Date();
    return budgets.find(b =>
      parseInt(b.month) === today.getMonth() + 1 &&
      parseInt(b.year) === today.getFullYear()
    );
  };

  const getSpendingPercentage = () => {
    const currentBudget = getCurrentBudget();
    if (!currentBudget) return 0;
    return Math.min(100, (getTotalExpenses() / currentBudget.limit) * 100);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentBudget = getCurrentBudget();
  const totalExpenses = getTotalExpenses();
  const spendingPercentage = getSpendingPercentage();

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          fetchBudgetData();
        }} />}
        ListHeaderComponent={
          <>
            {currentBudget && (
              <Card style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View>
                    <Text style={styles.budgetTitle}>Monthly Budget</Text>
                    <Text style={styles.budgetMonth}>{currentBudget.month}/{currentBudget.year}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditingBudget(currentBudget);
                      setBudgetFormData({
                        month: currentBudget.month,
                        year: currentBudget.year,
                        limit: currentBudget.limit.toString(),
                        category: currentBudget.category,
                      });
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.budgetAmount}>
                  <Text style={styles.budgetLabel}>Total Budget</Text>
                  <Text style={styles.budgetValue}>${currentBudget.limit.toFixed(2)}</Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${spendingPercentage}%`,
                          backgroundColor: spendingPercentage > 80 ? colors.error : spendingPercentage > 50 ? colors.warning : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.budgetStats}>
                  <View style={styles.budgetStat}>
                    <Text style={styles.statLabel}>Spent</Text>
                    <Text style={styles.statValue}>${totalExpenses.toFixed(2)}</Text>
                  </View>
                  <View style={styles.budgetStatDivider} />
                  <View style={styles.budgetStat}>
                    <Text style={styles.statLabel}>Remaining</Text>
                    <Text style={[styles.statValue, { color: (currentBudget.limit - totalExpenses) < 0 ? colors.error : colors.primary }]}>
                      ${(currentBudget.limit - totalExpenses).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.budgetStatDivider} />
                  <View style={styles.budgetStat}>
                    <Text style={styles.statLabel}>Used</Text>
                    <Text style={styles.statValue}>{spendingPercentage.toFixed(0)}%</Text>
                  </View>
                </View>
              </Card>
            )}

            {!currentBudget && (
              <Card style={styles.noBudgetCard}>
                <Text style={styles.noBudgetText}>No budget set for this month</Text>
                <Button
                  title="Set Budget"
                  onPress={() => {
                    resetBudgetForm();
                    setModalVisible(true);
                  }}
                  style={styles.noBudgetButton}
                />
              </Card>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Expenses</Text>
              <TouchableOpacity onPress={() => {
                resetExpenseForm();
                setExpenseModalVisible(true);
              }}>
                <Text style={styles.addExpenseText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.expenseCard}>
            <View style={styles.expenseContent}>
              <View style={styles.expenseIcon}>
                <Text style={styles.expenseIconText}>💰</Text>
              </View>
              <View style={styles.expenseDetails}>
                <Text style={styles.expenseDescription}>{item.description}</Text>
                <Text style={styles.expenseCategory}>{item.category} • {item.date}</Text>
              </View>
              <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No expenses recorded yet</Text>
            <Button
              title="Add Expense"
              onPress={() => {
                resetExpenseForm();
                setExpenseModalVisible(true);
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
          resetExpenseForm();
          setExpenseModalVisible(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Budget Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setModalVisible(false);
          resetBudgetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingBudget ? 'Edit Budget' : 'Set Monthly Budget'}</Text>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Month"
                  placeholder="1-12"
                  value={budgetFormData.month}
                  onChangeText={(text) => setBudgetFormData({ ...budgetFormData, month: text })}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Year"
                  placeholder="2024"
                  value={budgetFormData.year}
                  onChangeText={(text) => setBudgetFormData({ ...budgetFormData, year: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TextInput_
              label="Budget Limit ($)"
              placeholder="0.00"
              value={budgetFormData.limit}
              onChangeText={(text) => setBudgetFormData({ ...budgetFormData, limit: text })}
              keyboardType="decimal-pad"
            />

            <TextInput_
              label="Category"
              placeholder="Select category"
              value={budgetFormData.category}
              onChangeText={(text) => setBudgetFormData({ ...budgetFormData, category: text })}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  resetBudgetForm();
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleSetBudget}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Expense Modal */}
      <Modal
        visible={expenseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setExpenseModalVisible(false);
          resetExpenseForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>

            <TextInput_
              label="Description"
              placeholder="What did you buy?"
              value={expenseFormData.description}
              onChangeText={(text) => setExpenseFormData({ ...expenseFormData, description: text })}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Amount ($)"
                  placeholder="0.00"
                  value={expenseFormData.amount}
                  onChangeText={(text) => setExpenseFormData({ ...expenseFormData, amount: text })}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.halfInput}>
                <TextInput_
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={expenseFormData.date}
                  onChangeText={(text) => setExpenseFormData({ ...expenseFormData, date: text })}
                />
              </View>
            </View>

            <TextInput_
              label="Category"
              placeholder="Select category"
              value={expenseFormData.category}
              onChangeText={(text) => setExpenseFormData({ ...expenseFormData, category: text })}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setExpenseModalVisible(false);
                  resetExpenseForm();
                }}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleAddExpense}
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
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  budgetCard: {
    marginBottom: spacing.xl,
    backgroundColor: colors.primaryLight,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  budgetTitle: {
    ...typography.h3,
    color: colors.primary,
  },
  budgetMonth: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.sm,
  },
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  editButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  budgetAmount: {
    marginBottom: spacing.lg,
  },
  budgetLabel: {
    ...typography.caption,
    color: colors.text,
  },
  budgetValue: {
    ...typography.h2,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  progressContainer: {
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  budgetStat: {
    flex: 1,
    alignItems: 'center',
  },
  budgetStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  statLabel: {
    ...typography.caption,
    color: colors.text,
  },
  statValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  noBudgetCard: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  noBudgetText: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  noBudgetButton: {
    paddingHorizontal: spacing.xl,
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
  addExpenseText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  expenseCard: {
    marginBottom: spacing.md,
  },
  expenseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  expenseIconText: {
    fontSize: 20,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseDescription: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  expenseCategory: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  expenseAmount: {
    ...typography.body,
    color: colors.primary,
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
