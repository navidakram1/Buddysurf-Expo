# BuddySurf - Universal Expo App

A comprehensive social platform built with Expo for iOS, Android, and Web platforms.

## 🚀 Features

### Core Functionality
- **Universal Platform Support**: iOS, Android, and Web
- **Real-time Chat**: WebSocket-based messaging with Supabase
- **Interactive Maps**: 3D Mapbox integration with real-time markers
- **Activity Management**: Create, join, and manage social activities
- **Service Marketplace**: Hire services and offer your skills
- **File Uploads**: Image and document sharing
- **Push Notifications**: Real-time notifications across platforms
- **Wallet System**: In-app payments and earnings tracking

### Technical Stack
- **Framework**: Expo SDK 50
- **Navigation**: React Navigation 6 (Stack, Tab, Drawer)
- **Database**: Supabase (PostgreSQL + Real-time)
- **Maps**: React Native Maps with Mapbox
- **Styling**: NativeWind + StyleSheet
- **State Management**: React Hooks
- **File Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## 📱 Screens

### Core Pages (24 total)
1. **Index/Landing** - Hero section and app introduction
2. **Home** - Dashboard with stats and quick actions
3. **Meet Map** - 3D map with user and activity markers
4. **MeetUp** - Activity browsing and creation
5. **Activities List** - Comprehensive activity management
6. **Activity Detail** - Detailed activity information
7. **Hire** - Service provider marketplace
8. **Gigs** - Gig marketplace and management
9. **Chat** - Real-time messaging system
10. **Profile** - User profiles and social connections
11. **Settings** - App preferences and account management
12. **Notifications** - Notification center
13. **Wallet** - Balance and transaction management
14. **Network** - Social connections
15. **Help** - Support and FAQ

## 🛠 Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd buddysurf-expo
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
   ```

3. **Start Development Server**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Platforms**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

### Supabase Setup

1. **Create a new Supabase project** (or use existing: njeboxbiwpixujnimtdg)

2. **Run the database initialization script**:
   ```sql
   -- Copy and run the contents of supabase/init.sql in your Supabase SQL editor
   -- This will create all tables, types, and policies
   ```

3. **Set up Storage buckets**:
   ```sql
   -- Run these commands in Supabase SQL editor
   INSERT INTO storage.buckets (id, name, public) VALUES
     ('avatars', 'avatars', true),
     ('activity-images', 'activity-images', true),
     ('gig-images', 'gig-images', true),
     ('chat-media', 'chat-media', false);
   ```

4. **Configure Storage policies**:
   ```sql
   -- Avatar upload policy
   CREATE POLICY "Users can upload their own avatar"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

   -- Avatar view policy
   CREATE POLICY "Avatars are publicly viewable"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');
   ```

5. **Enable Realtime** for tables:
   - Go to Database > Replication in Supabase dashboard
   - Enable realtime for: `messages`, `activities`, `user_locations`, `notifications`

### EAS Build Setup

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Configure EAS**
   ```bash
   eas build:configure
   ```

3. **Build for Production**
   ```bash
   # iOS
   eas build --platform ios
   
   # Android
   eas build --platform android
   
   # Both platforms
   eas build --platform all
   ```

## 🔧 Development

### Project Structure
```
├── App.tsx                 # Main app component
├── screens/               # Screen components
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
├── utils/                 # Constants and helpers
├── assets/                # Images and static files
└── app.json              # Expo configuration
```

### Key Hooks
- `useRealtimeChat` - Real-time messaging
- `useFileUpload` - File upload functionality
- `useNotifications` - Push notification management

### Navigation Structure
- **Stack Navigator** - Main navigation
- **Tab Navigator** - Bottom tabs (Home, Map, Chat, MeetUp)
- **Drawer Navigator** - Side menu (optional)

## 🚀 Deployment

### App Store Deployment
1. Build with EAS: `eas build --platform ios --profile production`
2. Submit to App Store: `eas submit --platform ios`

### Google Play Deployment
1. Build with EAS: `eas build --platform android --profile production`
2. Submit to Google Play: `eas submit --platform android`

### Web Deployment
1. Build for web: `npx expo export:web`
2. Deploy to hosting service (Vercel, Netlify, etc.)

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- JWT-based authentication
- Secure file upload with proper permissions
- Environment variables for sensitive data

## 📊 Features Overview

### Real-time Features
- Live chat messaging
- Real-time activity updates
- Live user location tracking
- Push notifications

### Social Features
- User profiles and connections
- Activity creation and joining
- Service marketplace
- Review and rating system

### Business Features
- In-app wallet and payments
- Service provider dashboard
- Earnings tracking
- Subscription management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the Help section in the app
- Review the documentation
- Contact support team

---

Built with ❤️ using Expo and Supabase
