# KitchenKart - Smart Kitchen Management App

A comprehensive mobile application for managing your kitchen, pantry, shopping list, meal planning, and grocery budget. Built with React Native, Expo, and Firebase.

## Features

### 🏠 Dashboard
- Quick overview of pantry items
- Shopping list status
- Low stock alerts
- Budget summary
- Quick access to all features

### 📦 Pantry Management
- Track all pantry items with categories
- Monitor stock levels and expiry dates
- Search and filter by category
- Low stock alerts
- Add, edit, and delete items
- Quantity and unit tracking

### 🛒 Shopping List
- Create and manage shopping lists
- Mark items as purchased
- Estimate costs
- Add notes and categories
- Quick add functionality

### 🍽️ Meal Planner
- Plan meals for the week
- Track recipes and ingredients
- Prep time and servings
- Link meals to shopping lists
- Organize by meal type (Breakfast, Lunch, Dinner, Snack)

### 💰 Budget Tracker
- Set monthly budgets
- Track expenses
- Monitor spending vs. budget
- Category-based expense tracking
- Visual progress indicators
- Alerts when budget limit is approaching

### 🔐 Authentication
- Secure Firebase authentication
- Email/password sign up and login
- User profile management

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation (Stack & Bottom Tab)
- **Backend**: Firebase (Authentication & Firestore)
- **State Management**: React Context API
- **UI Components**: Custom built with React Native
- **Testing**: Jest & React Native Testing Library
- **Linting**: ESLint with React Native Community config

## Project Structure

```
Kitchen-kart/
├── App.js                          # Main app entry point with navigation
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel configuration
├── jest.config.js                  # Jest testing configuration
├── .eslintrc.js                    # ESLint configuration
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── src/
│   ├── config/
│   │   └── firebase.js             # Firebase initialization
│   ├── context/
│   │   └── AuthContext.js          # Authentication context
│   ├── hooks/
│   │   └── useAuth.js              # Auth custom hook
│   ├── services/
│   │   └── firebaseService.js      # Firestore database services
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PantryScreen.js
│   │   ├── ShoppingListScreen.js
│   │   ├── MealPlannerScreen.js
│   │   ├── BudgetScreen.js
│   │   └── index.js
│   ├── components/
│   │   └── index.js                # Reusable UI components
│   └── constants/
│       └── theme.js                # Design system & theme colors
└── package.json                    # Dependencies
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase project

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/kitchenkartapp-design/Kitchen-kart.git
   cd Kitchen-kart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Get your Firebase configuration credentials
   - Copy `.env.example` to `.env.local`
   - Add your Firebase credentials to `.env.local`:
     ```env
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_auth_domain
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_storage_bucket
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     FIREBASE_MEASUREMENT_ID=your_measurement_id
     ```

4. **Start the development server**
   ```bash
   expo start
   ```

5. **Run on your device**
   - iOS: Press `i` in the terminal or scan the QR code with Camera app
   - Android: Press `a` in the terminal or scan the QR code with Expo app

## Available Scripts

- `npm start` - Start Expo development server
- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run build:ios` - Build iOS app
- `npm run build:android` - Build Android app

## Firebase Setup

### Firestore Collections
```
users/
├── {userId}/
│   ├── pantryItems/
│   │   └── {itemId}
│   ├── shoppingLists/
│   │   └── {itemId}
│   ├── mealPlans/
│   │   └── {mealId}
│   ├── budgets/
│   │   └── {budgetId}
│   └── expenses/
│       └── {expenseId}
```

### Firebase Rules (Firestore Security Rules)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

## Usage

### Creating an Account
1. Open the app and tap "Sign Up"
2. Enter your full name, email, and password
3. Tap "Create Account"
4. Start managing your kitchen!

### Adding to Pantry
1. Go to Pantry tab
2. Tap the "+" button
3. Fill in item details (name, quantity, category, expiry date)
4. Tap "Save"

### Managing Shopping List
1. Go to Shopping tab
2. Tap "+" to add items
3. Add quantity and estimated price
4. Check off items as you purchase them

### Planning Meals
1. Go to Meals tab
2. Create new meal plans
3. Add ingredients and cooking time
4. Organize your weekly menu

### Tracking Budget
1. Go to Budget tab
2. Set your monthly budget limit
3. Add expenses as you shop
4. Monitor spending with visual indicators

## Demo Credentials

For testing without creating an account:
- **Email**: demo@kitchen-kart.com
- **Password**: Demo@123

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub Issues page.

## Roadmap

- [ ] Barcode scanner for quick pantry additions
- [ ] Recipe suggestions based on pantry items
- [ ] Nutritional tracking
- [ ] Shopping list price comparison
- [ ] Export reports and budgets
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Cloud backup and sync

## Acknowledgments

- React Native and Expo communities
- Firebase for backend services
- Design inspiration from modern kitchen apps

---

**Made with ❤️ by KitchenKart Team**
