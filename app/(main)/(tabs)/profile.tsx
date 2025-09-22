import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar, GlassModal } from '../../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem,
  StaggeredFadeInView 
} from '../../../components/animations';
import { glassTheme } from '../../../constants/theme';
import { useUser, useApp, useOrder } from '../../../contexts';
import { mockUser, mockOrderHistory } from '../../../constants/mockData';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);
  
  // Profile editing state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const { user, updatePreferences } = useUser();
  const { state: appState, setTheme, resetApp } = useApp();
  const { state: orderState } = useOrder();

  // Animation values
  const statsAnimation = useSharedValue(0);
  const profileScale = useSharedValue(1);

  const currentUser = user || mockUser;
  const userOrders = orderState.orderHistory.length > 0 ? orderState.orderHistory : mockOrderHistory;

  // Calculate user statistics
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const favoriteRestaurant = 'Bella Italia'; // Mock data
  const avgRating = 4.8; // Mock data

  useEffect(() => {
    // Animate statistics on mount
    const timer = setTimeout(() => {
      setStatsAnimated(true);
      statsAnimation.value = withSpring(1, { duration: 1000 });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const statsAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(statsAnimation.value, [0, 1], [0.8, 1]);
    const opacity = statsAnimation.value;
    
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const profileAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: profileScale.value }],
  }));

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    resetApp();
    setShowLogoutModal(false);
    router.replace('/(auth)/onboarding');
  };

  const handleEditProfile = () => {
    profileScale.value = withSequence(
      withSpring(1.05, { duration: 200 }),
      withSpring(1, { duration: 200 })
    );
    
    // Initialize form with current user data
    setEditForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone,
    });
    setFormErrors({ name: '', email: '', phone: '' });
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = { name: '', email: '', phone: '' };
    let isValid = true;

    // Name validation
    if (!editForm.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (editForm.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(editForm.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!editForm.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(editForm.phone)) {
      errors.phone = 'Please enter a valid phone number';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
      // In a real app, this would update the user profile
      console.log('Saving profile:', editForm);
      
      // Simulate API call with animation
      profileScale.value = withSequence(
        withSpring(0.95, { duration: 150 }),
        withSpring(1, { duration: 150 })
      );
      
      // Close modal after a brief delay
      setTimeout(() => {
        setShowEditModal(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }, 300);
    }
  };

  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    // In a real app, this would update user preferences
  };

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    setTheme(value ? 'dark' : 'light');
  };

  const renderProfileHeader = () => (
    <FadeInView style={styles.profileHeader} delay={200}>
      <Animated.View style={profileAnimatedStyle}>
        <GlassCard intensity={25} tint="dark" style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                <Text style={styles.editButtonText}>✏️</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
              <Text style={styles.userPhone}>{currentUser.phone}</Text>
              
              <View style={styles.userPreferences}>
                <Text style={styles.preferencesTitle}>Preferences:</Text>
                <View style={styles.preferencesTags}>
                  {currentUser.preferences.cuisines.map((cuisine) => (
                    <View key={cuisine} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{cuisine}</Text>
                    </View>
                  ))}
                  {currentUser.preferences.dietary.map((diet) => (
                    <View key={diet} style={styles.preferenceTag}>
                      <Text style={styles.preferenceTagText}>{diet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </FadeInView>
  );

  const renderStatistics = () => (
    <FadeInView style={styles.statsSection} delay={400}>
      <Text style={styles.sectionTitle}>Your Statistics</Text>
      <Animated.View style={statsAnimatedStyle}>
        <View style={styles.statsGrid}>
          <GlassCard intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statValue}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </GlassCard>
          
          <GlassCard intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={styles.statValue}>${totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </GlassCard>
          
          <GlassCard intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={styles.statValue}>{avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </GlassCard>
          
          <GlassCard intensity={20} tint="dark" style={styles.statCard}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>Gold</Text>
            <Text style={styles.statLabel}>Member</Text>
          </GlassCard>
        </View>
      </Animated.View>
    </FadeInView>
  );

  const renderOrderHistory = () => (
    <FadeInView style={styles.historySection} delay={600}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      {/* Timeline Container */}
      <View style={styles.timelineContainer}>
        <StaggeredFadeInView staggerDelay={100}>
          {userOrders.slice(0, 3).map((order, index) => (
            <View key={order.id} style={styles.timelineItem}>
              {/* Timeline Line */}
              <View style={styles.timelineLine}>
                <View style={[
                  styles.timelineDot,
                  { backgroundColor: 
                    order.status === 'delivered' ? '#48BB78' :
                    order.status === 'out_for_delivery' ? '#F6AD55' :
                    order.status === 'preparing' ? '#9F7AEA' : '#FC8181'
                  }
                ]} />
                {index < userOrders.slice(0, 3).length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>
              
              {/* Order Card */}
              <ScaleButton
                onPress={() => console.log(`View order ${order.id}`)}
                scaleValue={0.98}
                style={styles.timelineCardContainer}
              >
                <GlassCard intensity={20} tint="dark" style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderRestaurant}>
                        {order.restaurantId === '1' ? 'Bella Italia' : 
                         order.restaurantId === '2' ? 'Sushi Zen' : 'Burger Palace'}
                      </Text>
                      <Text style={styles.orderDate}>
                        {order.createdAt.toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <View style={styles.orderStatus}>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: 
                          order.status === 'delivered' ? '#48BB78' :
                          order.status === 'out_for_delivery' ? '#F6AD55' :
                          order.status === 'preparing' ? '#9F7AEA' : '#FC8181'
                        }
                      ]} />
                      <Text style={styles.orderStatusText}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderItems}>
                      {order.items.length} items • ${order.totalAmount.toFixed(2)}
                    </Text>
                    <Text style={styles.orderAction}>View Details →</Text>
                  </View>
                </GlassCard>
              </ScaleButton>
            </View>
          ))}
        </StaggeredFadeInView>
      </View>
    </FadeInView>
  );

  const renderSettings = () => (
    <FadeInView style={styles.settingsSection} delay={800}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <GlassCard intensity={20} tint="dark" style={styles.settingsCard}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🔔</Text>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Get notified about order updates
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: glassTheme.colors.primary }}
            thumbColor={glassTheme.colors.text.light}
          />
        </View>
        
        <View style={styles.settingDivider} />
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingIcon}>🌙</Text>
            <View style={styles.settingDetails}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>
                Switch to dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={handleToggleDarkMode}
            trackColor={{ false: 'rgba(255,255,255,0.2)', true: glassTheme.colors.primary }}
            thumbColor={glassTheme.colors.text.light}
          />
        </View>
      </GlassCard>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <ScaleButton onPress={() => console.log('Manage addresses')}>
          <GlassCard intensity={18} tint="dark" style={styles.actionCard}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>Addresses</Text>
          </GlassCard>
        </ScaleButton>
        
        <ScaleButton onPress={() => console.log('Payment methods')}>
          <GlassCard intensity={18} tint="dark" style={styles.actionCard}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionText}>Payment</Text>
          </GlassCard>
        </ScaleButton>
        
        <ScaleButton onPress={() => router.push('/(main)/chat')}>
          <GlassCard intensity={18} tint="dark" style={styles.actionCard}>
            <Text style={styles.actionIcon}>🤖</Text>
            <Text style={styles.actionText}>AI Chat</Text>
          </GlassCard>
        </ScaleButton>
        
        <ScaleButton onPress={() => console.log('Help & Support')}>
          <GlassCard intensity={18} tint="dark" style={styles.actionCard}>
            <Text style={styles.actionIcon}>❓</Text>
            <Text style={styles.actionText}>Help</Text>
          </GlassCard>
        </ScaleButton>
      </View>
    </FadeInView>
  );

  const renderEditProfileModal = () => (
    <GlassModal
      visible={showEditModal}
      onClose={() => setShowEditModal(false)}
      animationType="slide"
      intensity={30}
      tint="dark"
    >
      <View style={styles.editModalContent}>
        <Text style={styles.editModalTitle}>Edit Profile</Text>
        <Text style={styles.editModalSubtitle}>Update your personal information</Text>
        
        <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
          {/* Name Field */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <GlassContainer intensity={15} tint="dark" style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={editForm.name}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                placeholder="Enter your full name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </GlassContainer>
            {formErrors.name ? (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            ) : null}
          </View>

          {/* Email Field */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <GlassContainer intensity={15} tint="dark" style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={editForm.email}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </GlassContainer>
            {formErrors.email ? (
              <Text style={styles.errorText}>{formErrors.email}</Text>
            ) : null}
          </View>

          {/* Phone Field */}
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <GlassContainer intensity={15} tint="dark" style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={editForm.phone}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                placeholder="Enter your phone number"
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="phone-pad"
              />
            </GlassContainer>
            {formErrors.phone ? (
              <Text style={styles.errorText}>{formErrors.phone}</Text>
            ) : null}
          </View>
        </ScrollView>
        
        <View style={styles.editModalActions}>
          <GlassButton
            title="Cancel"
            onPress={() => setShowEditModal(false)}
            variant="outline"
            size="medium"
            style={styles.editModalButton}
          />
          <GlassButton
            title="Save Changes"
            onPress={handleSaveProfile}
            variant="primary"
            size="medium"
            style={styles.editModalButton}
          />
        </View>
      </View>
    </GlassModal>
  );

  const renderLogoutModal = () => (
    <GlassModal
      visible={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
      animationType="scale"
      intensity={30}
      tint="dark"
    >
      <View style={styles.logoutModalContent}>
        <Text style={styles.logoutIcon}>👋</Text>
        <Text style={styles.logoutTitle}>Sign Out</Text>
        <Text style={styles.logoutText}>
          Are you sure you want to sign out? You'll need to sign back in to access your account.
        </Text>
        
        <View style={styles.logoutActions}>
          <GlassButton
            title="Cancel"
            onPress={() => setShowLogoutModal(false)}
            variant="outline"
            size="medium"
            style={styles.logoutButton}
          />
          <GlassButton
            title="Sign Out"
            onPress={confirmLogout}
            variant="primary"
            size="medium"
            style={styles.logoutButton}
          />
        </View>
      </View>
    </GlassModal>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Background Effects */}
        <ParticleSystem 
          particleCount={8} 
          colors={['rgba(255,107,53,0.2)', 'rgba(72,187,120,0.2)']}
        />

        {/* Navigation */}
        <GlassNavBar
          title="Profile"
          rightComponent={
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.navIcon}>⚙️</Text>
            </TouchableOpacity>
          }
          intensity={25}
          tint="dark"
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderProfileHeader()}
          {renderStatistics()}
          {renderOrderHistory()}
          {renderSettings()}

          {/* Logout Button */}
          <FadeInView style={styles.logoutSection} delay={1000}>
            <GlassButton
              title="Sign Out"
              onPress={handleLogout}
              variant="outline"
              size="large"
              fullWidth
              style={styles.logoutButtonMain}
            />
          </FadeInView>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Edit Profile Modal */}
        {renderEditProfileModal()}

        {/* Logout Modal */}
        {renderLogoutModal()}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    paddingTop: 100,
  },
  navIcon: {
    fontSize: 20,
    color: glassTheme.colors.text.light,
  },

  // Profile Header Styles
  profileHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: glassTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  editButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: glassTheme.colors.text.light,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: glassTheme.colors.text.secondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 16,
    color: glassTheme.colors.text.secondary,
    marginBottom: 12,
  },
  userPreferences: {
    marginTop: 8,
  },
  preferencesTitle: {
    fontSize: 14,
    color: glassTheme.colors.text.secondary,
    marginBottom: 8,
  },
  preferencesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  preferenceTag: {
    backgroundColor: 'rgba(255,107,53,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },
  preferenceTagText: {
    fontSize: 12,
    color: glassTheme.colors.text.light,
  },

  // Statistics Styles
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: glassTheme.colors.text.light,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: glassTheme.colors.text.light,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: glassTheme.colors.text.secondary,
    textAlign: 'center',
  },

  // Order History Styles
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: glassTheme.colors.primary,
    fontWeight: '600',
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  timelineConnector: {
    width: 2,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },
  timelineCardContainer: {
    flex: 1,
  },
  orderCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderRestaurant: {
    fontSize: 16,
    fontWeight: '600',
    color: glassTheme.colors.text.light,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: glassTheme.colors.text.secondary,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  orderStatusText: {
    fontSize: 12,
    color: glassTheme.colors.text.secondary,
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    fontSize: 14,
    color: glassTheme.colors.text.secondary,
  },
  orderAction: {
    fontSize: 14,
    color: glassTheme.colors.primary,
    fontWeight: '500',
  },

  // Settings Styles
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  settingsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: glassTheme.colors.text.light,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: glassTheme.colors.text.secondary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: glassTheme.colors.text.light,
    fontWeight: '500',
  },

  // Edit Profile Modal Styles
  editModalContent: {
    padding: 24,
    maxHeight: '80%',
  },
  editModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: 8,
  },
  editModalSubtitle: {
    fontSize: 16,
    color: glassTheme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  editForm: {
    maxHeight: 300,
  },
  formField: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: glassTheme.colors.text.light,
    marginBottom: 8,
  },
  inputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: glassTheme.colors.text.light,
    minHeight: 50,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
    marginLeft: 4,
  },
  editModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  editModalButton: {
    flex: 1,
  },

  // Logout Modal Styles
  logoutModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  logoutIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  logoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: glassTheme.colors.text.light,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 16,
    color: glassTheme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  logoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  logoutButton: {
    flex: 1,
  },

  // General Styles
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButtonMain: {
    marginTop: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});