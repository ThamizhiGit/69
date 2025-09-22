import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { GlassContainer, GlassCard, GlassButton, GlassNavBar } from '../../components/glass';
import { 
  FadeInView, 
  ScaleButton, 
  ParticleSystem 
} from '../../components/animations';
import { glassTheme } from '../../constants/theme';
import { aiChatSuggestions } from '../../constants/mockData';
import { aiService } from '../../services/aiService';
import { useUser } from '../../contexts';
import { ChatMessage, FoodRecommendation } from '../../types';

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hi! I'm your AI food assistant. I can help you discover amazing restaurants and dishes based on your preferences. What are you craving today?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(aiChatSuggestions);
  
  const { user } = useUser();
  const scrollViewRef = useRef<ScrollView>(null);

  // Animation values
  const typingAnimation = useSharedValue(0);
  const inputFocused = useSharedValue(0);

  useEffect(() => {
    // Typing indicator animation
    if (isTyping) {
      typingAnimation.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      typingAnimation.value = 0;
    }
  }, [isTyping]);

  const typingIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(typingAnimation.value, [0, 1], [0.3, 1]),
    transform: [{ scale: interpolate(typingAnimation.value, [0, 1], [0.8, 1]) }],
  }));

  const inputContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(inputFocused.value, [0, 1], [1, 1.02]) }],
  }));

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Simulate AI thinking time
      await aiService.simulateTyping(1500);
      
      const response = await aiService.getChatResponse(text, user);
      const recommendations = await aiService.getFoodRecommendations(user);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        recommendations: recommendations.slice(0, 3), // Show max 3 recommendations
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Update suggestions based on conversation
      setSuggestions(aiService.getSuggestedQuestions());

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const renderMessage = (message: ChatMessage, index: number) => {
    return (
      <FadeInView key={message.id} delay={index * 100} style={styles.messageContainer}>
        <View style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble
        ]}>
          <GlassContainer
            intensity={message.isUser ? 20 : 25}
            tint={message.isUser ? 'primary' : 'dark'}
            style={styles.messageGlass}
          >
            <Text style={[
              styles.messageText,
              message.isUser ? styles.userMessageText : styles.aiMessageText
            ]}>
              {message.text}
            </Text>
            
            <Text style={[
              styles.messageTime,
              message.isUser ? styles.userMessageTime : styles.aiMessageTime
            ]}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </GlassContainer>
        </View>

        {/* Food Recommendations */}
        {message.recommendations && message.recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={styles.recommendationsTitle}>Recommended for you:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recommendationsList}>
                {message.recommendations.map((rec, recIndex) => (
                  <FadeInView key={rec.id} delay={200 + recIndex * 100}>
                    <ScaleButton
                      onPress={() => console.log(`Selected ${rec.name}`)}
                      scaleValue={0.95}
                    >
                      <GlassCard intensity={18} tint="dark" style={styles.recommendationCard}>
                        <View style={styles.recImagePlaceholder}>
                          <Text style={styles.recImageIcon}>🍽️</Text>
                        </View>
                        <Text style={styles.recName}>{rec.name}</Text>
                        <Text style={styles.recRestaurant}>{rec.restaurantName}</Text>
                        <Text style={styles.recPrice}>${rec.price.toFixed(2)}</Text>
                      </GlassCard>
                    </ScaleButton>
                  </FadeInView>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </FadeInView>
    );
  };

  const renderTypingIndicator = () => (
    <Animated.View style={[styles.typingContainer, typingIndicatorStyle]}>
      <GlassContainer intensity={25} tint="dark" style={styles.typingBubble}>
        <View style={styles.typingDots}>
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
          <View style={styles.typingDot} />
        </View>
      </GlassContainer>
    </Animated.View>
  );

  const renderSuggestions = () => (
    <FadeInView style={styles.suggestionsContainer} delay={300}>
      <Text style={styles.suggestionsTitle}>Try asking:</Text>
      <View style={styles.suggestionsList}>
        {suggestions.slice(0, 6).map((suggestion, index) => (
          <FadeInView key={suggestion} delay={400 + index * 50}>
            <ScaleButton
              onPress={() => handleSuggestionPress(suggestion)}
              scaleValue={0.95}
            >
              <GlassCard intensity={15} tint="dark" style={styles.suggestionCard}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </GlassCard>
            </ScaleButton>
          </FadeInView>
        ))}
      </View>
    </FadeInView>
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
          particleCount={6} 
          colors={['rgba(255,107,53,0.2)', 'rgba(72,187,120,0.2)']}
        />

        {/* Navigation */}
        <GlassNavBar
          title="AI Food Assistant"
          leftComponent={<Text style={styles.navIcon}>←</Text>}
          onLeftPress={() => router.back()}
          rightComponent={
            <TouchableOpacity>
              <Text style={styles.navIcon}>🤖</Text>
            </TouchableOpacity>
          }
          intensity={25}
          tint="dark"
        />

        <KeyboardAvoidingView 
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 1 && renderSuggestions()}
            
            {messages.map((message, index) => renderMessage(message, index))}
            
            {isTyping && renderTypingIndicator()}
            
            <View style={styles.messagesBottomSpacing} />
          </ScrollView>

          {/* Input Area */}
          <FadeInView style={styles.inputArea} delay={200}>
            <Animated.View style={inputContainerStyle}>
              <GlassContainer intensity={25} tint="dark" style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask me about food, restaurants, or recommendations..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={inputText}
                  onChangeText={setInputText}
                  onFocus={() => inputFocused.value = withSpring(1)}
                  onBlur={() => inputFocused.value = withSpring(0)}
                  multiline
                  maxLength={500}
                />
                
                <ScaleButton
                  onPress={() => handleSendMessage(inputText)}
                  scaleValue={0.9}
                >
                  <GlassContainer
                    intensity={20}
                    tint="primary"
                    style={[
                      styles.sendButton,
                      !inputText.trim() && styles.sendButtonDisabled
                    ]}
                  >
                    <Text style={styles.sendButtonText}>✈️</Text>
                  </GlassContainer>
                </ScaleButton>
              </GlassContainer>
            </Animated.View>
          </FadeInView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  navIcon: {
    fontSize: 20,
  },
  keyboardAvoid: {
    flex: 1,
    paddingTop: 100,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
  messageContainer: {
    marginBottom: glassTheme.spacing.md,
  },
  messageBubble: {
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  messageGlass: {
    padding: glassTheme.spacing.md,
  },
  messageText: {
    fontSize: glassTheme.typography.sizes.md,
    lineHeight: glassTheme.typography.lineHeights.relaxed * glassTheme.typography.sizes.md,
    marginBottom: glassTheme.spacing.xs,
  },
  userMessageText: {
    color: glassTheme.colors.text.light,
  },
  aiMessageText: {
    color: glassTheme.colors.text.light,
  },
  messageTime: {
    fontSize: glassTheme.typography.sizes.xs,
    opacity: 0.7,
  },
  userMessageTime: {
    color: glassTheme.colors.text.light,
    textAlign: 'right',
  },
  aiMessageTime: {
    color: glassTheme.colors.text.light,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginBottom: glassTheme.spacing.md,
  },
  typingBubble: {
    padding: glassTheme.spacing.md,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: glassTheme.spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: glassTheme.colors.text.light,
    opacity: 0.6,
  },
  recommendationsContainer: {
    marginTop: glassTheme.spacing.md,
    marginLeft: glassTheme.spacing.md,
  },
  recommendationsTitle: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.sm,
    opacity: 0.8,
  },
  recommendationsList: {
    flexDirection: 'row',
    gap: glassTheme.spacing.sm,
  },
  recommendationCard: {
    width: 140,
    padding: glassTheme.spacing.sm,
    alignItems: 'center',
  },
  recImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: glassTheme.borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  recImageIcon: {
    fontSize: 24,
  },
  recName: {
    fontSize: glassTheme.typography.sizes.sm,
    fontWeight: glassTheme.typography.weights.medium,
    color: glassTheme.colors.text.light,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.xs,
  },
  recRestaurant: {
    fontSize: glassTheme.typography.sizes.xs,
    color: glassTheme.colors.text.light,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.xs,
  },
  recPrice: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.primary,
    fontWeight: glassTheme.typography.weights.bold,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginBottom: glassTheme.spacing.xl,
  },
  suggestionsTitle: {
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
    marginBottom: glassTheme.spacing.md,
    textAlign: 'center',
    opacity: 0.8,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: glassTheme.spacing.sm,
    justifyContent: 'center',
  },
  suggestionCard: {
    paddingHorizontal: glassTheme.spacing.md,
    paddingVertical: glassTheme.spacing.sm,
  },
  suggestionText: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.light,
    fontWeight: glassTheme.typography.weights.medium,
  },
  inputArea: {
    padding: glassTheme.spacing.lg,
    paddingBottom: glassTheme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: glassTheme.spacing.md,
    gap: glassTheme.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: glassTheme.typography.sizes.md,
    color: glassTheme.colors.text.light,
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
  },
  messagesBottomSpacing: {
    height: 20,
  },
});