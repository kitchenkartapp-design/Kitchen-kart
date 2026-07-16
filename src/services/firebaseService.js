import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import uuid from 'react-native-uuid';

// Pantry Items Service
export const pantryService = {
  async addItem(userId, itemData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'pantryItems'), {
        ...itemData,
        id: uuid.v4(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding pantry item:', error);
      throw error;
    }
  },

  async updateItem(userId, itemId, itemData) {
    try {
      await updateDoc(doc(db, 'users', userId, 'pantryItems', itemId), {
        ...itemData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating pantry item:', error);
      throw error;
    }
  },

  async deleteItem(userId, itemId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'pantryItems', itemId));
    } catch (error) {
      console.error('Error deleting pantry item:', error);
      throw error;
    }
  },

  async getItems(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'pantryItems'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pantry items:', error);
      throw error;
    }
  },

  async getItemsByCategory(userId, category) {
    try {
      const q = query(
        collection(db, 'users', userId, 'pantryItems'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting pantry items by category:', error);
      throw error;
    }
  },

  async getLowStockItems(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'pantryItems'),
        where('quantity', '<=', 2),
        orderBy('quantity', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting low stock items:', error);
      throw error;
    }
  },
};

// Shopping List Service
export const shoppingService = {
  async addItem(userId, itemData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'shoppingLists'), {
        ...itemData,
        id: uuid.v4(),
        completed: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding shopping item:', error);
      throw error;
    }
  },

  async updateItem(userId, itemId, itemData) {
    try {
      await updateDoc(doc(db, 'users', userId, 'shoppingLists', itemId), {
        ...itemData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating shopping item:', error);
      throw error;
    }
  },

  async deleteItem(userId, itemId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'shoppingLists', itemId));
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      throw error;
    }
  },

  async getItems(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'shoppingLists'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting shopping items:', error);
      throw error;
    }
  },

  async toggleItem(userId, itemId, completed) {
    try {
      await updateDoc(doc(db, 'users', userId, 'shoppingLists', itemId), {
        completed,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error toggling shopping item:', error);
      throw error;
    }
  },
};

// Meal Plans Service
export const mealService = {
  async addMeal(userId, mealData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'mealPlans'), {
        ...mealData,
        id: uuid.v4(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding meal plan:', error);
      throw error;
    }
  },

  async updateMeal(userId, mealId, mealData) {
    try {
      await updateDoc(doc(db, 'users', userId, 'mealPlans', mealId), {
        ...mealData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  },

  async deleteMeal(userId, mealId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'mealPlans', mealId));
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  },

  async getMeals(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'mealPlans'),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting meal plans:', error);
      throw error;
    }
  },
};

// Budget Service
export const budgetService = {
  async setBudget(userId, budgetData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'budgets'), {
        ...budgetData,
        id: uuid.v4(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  },

  async updateBudget(userId, budgetId, budgetData) {
    try {
      await updateDoc(doc(db, 'users', userId, 'budgets', budgetId), {
        ...budgetData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  },

  async getBudgets(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'budgets'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting budgets:', error);
      throw error;
    }
  },

  async addExpense(userId, expenseData) {
    try {
      const docRef = await addDoc(collection(db, 'users', userId, 'expenses'), {
        ...expenseData,
        id: uuid.v4(),
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  async getExpenses(userId) {
    try {
      const q = query(
        collection(db, 'users', userId, 'expenses'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting expenses:', error);
      throw error;
    }
  },
};

// User Profile Service
export const userService = {
  async createUserProfile(userId, userData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, userData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...userData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};
