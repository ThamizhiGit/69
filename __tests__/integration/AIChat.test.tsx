import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ChatScreen from '../../app/(main)/chat';
import { AppContextProvider } from '../../contexts/AppContext';
import { UserContextProvider } from '../../contexts/UserContext';
import { AIService } from '../../services/aiService';
import { mockRestaurants, mockMenuItems } from '../../constants/mockData';

// Mock AIService
jest.mock('../../services/aiService');
const mockAIService = AIService as jest.Mocked<typeof AIService>;

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock expo modules
jest.mock('expo-blur', () => ({
  BlurView: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View testID="blur-view" {...props}>{children}</View>;
  },
}));

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>
    <AppContextProvider>
      <UserContextProvider>
        {children}
      </UserContextProvider>
    </AppContextProvider>
  </NavigationContainer>
);

describe('AI Chat Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAIService.sendChatMessage.mockClear();
    mockAIService.getFoodRecommendations.mockClear();
  });

  it('should handle basic chat conversation', async () => {
    mockAIService.sendChatMessage.mockResolvedValue(
      'Hello! I\'m here to help you find delicious food. What are you in the mood for today?'
    );

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    // Check initial state
    expect(getByText('Food Assistant')).toBeTruthy();
    expect(getByText('Ask me anything about food!')).toBeTruthy();

    // Send a message
    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Hello');
    fireEvent.press(sendButton);

    // Check user message appears
    await waitFor(() => {
      expect(getByText('Hello')).toBeTruthy();
    });

    // Check AI response appears
    await waitFor(() => {
      expect(getByText('Hello! I\'m here to help you find delicious food. What are you in the mood for today?')).toBeTruthy();
    });

    expect(mockAIService.sendChatMessage).toHaveBeenCalledWith('Hello', []);
  });

  it('should handle food recommendation requests', async () => {
    const mockRecommendations = [
      {
        restaurantId: mockRestaurants[0].id,
        menuItemId: mockMenuItems[0].id,
        reason: 'Perfect for your taste preferences',
        confidence: 0.9,
      },
    ];

    mockAIService.sendChatMessage.mockResolvedValue(
      'I found some great recommendations for you! Let me show you some options.'
    );
    mockAIService.getFoodRecommendations.mockResolvedValue(mockRecommendations);

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'What do you recommend for dinner?');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('What do you recommend for dinner?')).toBeTruthy();
    });

    await waitFor(() => {
      expect(getByText('I found some great recommendations for you! Let me show you some options.')).toBeTruthy();
    });

    // Should show recommendation cards
    await waitFor(() => {
      expect(getByTestId('recommendation-card')).toBeTruthy();
      expect(getByText(mockMenuItems[0].name)).toBeTruthy();
      expect(getByText(mockRestaurants[0].name)).toBeTruthy();
    });

    expect(mockAIService.getFoodRecommendations).toHaveBeenCalled();
  });

  it('should handle suggested questions', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    // Should show suggested questions initially
    expect(getByText('What\'s popular today?')).toBeTruthy();
    expect(getByText('I want something spicy')).toBeTruthy();
    expect(getByText('Vegetarian options?')).toBeTruthy();

    // Tap on a suggested question
    const suggestedQuestion = getByText('What\'s popular today?');
    fireEvent.press(suggestedQuestion);

    await waitFor(() => {
      expect(getByText('What\'s popular today?')).toBeTruthy();
    });

    expect(mockAIService.sendChatMessage).toHaveBeenCalledWith('What\'s popular today?', []);
  });

  it('should handle typing indicators', async () => {
    mockAIService.sendChatMessage.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('Response'), 1000))
    );

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(sendButton);

    // Should show typing indicator
    await waitFor(() => {
      expect(getByTestId('typing-indicator')).toBeTruthy();
    });

    // Typing indicator should disappear when response arrives
    await waitFor(() => {
      expect(getByText('Response')).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('should handle error states gracefully', async () => {
    mockAIService.sendChatMessage.mockRejectedValue(new Error('Network error'));

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('I apologize, but I\'m having trouble connecting right now. Please try again.')).toBeTruthy();
    });
  });

  it('should handle conversation context', async () => {
    mockAIService.sendChatMessage
      .mockResolvedValueOnce('I recommend pizza!')
      .mockResolvedValueOnce('For pizza, I suggest Tony\'s Italian Kitchen. They have amazing Margherita pizza!');

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    // First message
    fireEvent.changeText(messageInput, 'What should I eat?');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('I recommend pizza!')).toBeTruthy();
    });

    // Second message with context
    fireEvent.changeText(messageInput, 'Where can I get good pizza?');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText('For pizza, I suggest Tony\'s Italian Kitchen. They have amazing Margherita pizza!')).toBeTruthy();
    });

    // Should have been called with conversation history
    expect(mockAIService.sendChatMessage).toHaveBeenCalledWith(
      'Where can I get good pizza?',
      expect.arrayContaining([
        expect.objectContaining({ role: 'user', content: 'What should I eat?' }),
        expect.objectContaining({ role: 'assistant', content: 'I recommend pizza!' }),
      ])
    );
  });

  it('should handle recommendation card interactions', async () => {
    const mockRecommendations = [
      {
        restaurantId: mockRestaurants[0].id,
        menuItemId: mockMenuItems[0].id,
        reason: 'Perfect for your taste preferences',
        confidence: 0.9,
      },
    ];

    mockAIService.getFoodRecommendations.mockResolvedValue(mockRecommendations);
    mockAIService.sendChatMessage.mockResolvedValue('Here are some recommendations!');

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Recommend something');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByTestId('recommendation-card')).toBeTruthy();
    });

    // Tap on recommendation card
    const recommendationCard = getByTestId('recommendation-card');
    fireEvent.press(recommendationCard);

    // Should navigate to restaurant or menu item
    // This would be tested based on the actual navigation implementation
  });

  it('should handle message input validation', async () => {
    const { getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    // Send button should be disabled for empty message
    expect(sendButton.props.disabled).toBe(true);

    // Type message
    fireEvent.changeText(messageInput, 'Test message');
    expect(sendButton.props.disabled).toBe(false);

    // Clear message
    fireEvent.changeText(messageInput, '');
    expect(sendButton.props.disabled).toBe(true);
  });

  it('should handle long messages correctly', async () => {
    const longMessage = 'A'.repeat(1000);
    mockAIService.sendChatMessage.mockResolvedValue('I understand your detailed request!');

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, longMessage);
    fireEvent.press(sendButton);

    await waitFor(() => {
      // Message should be truncated or handled appropriately
      expect(getByText('I understand your detailed request!')).toBeTruthy();
    });
  });

  it('should handle rapid message sending', async () => {
    mockAIService.sendChatMessage.mockResolvedValue('Quick response');

    const { getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    // Send multiple messages quickly
    fireEvent.changeText(messageInput, 'Message 1');
    fireEvent.press(sendButton);
    
    fireEvent.changeText(messageInput, 'Message 2');
    fireEvent.press(sendButton);
    
    fireEvent.changeText(messageInput, 'Message 3');
    fireEvent.press(sendButton);

    // Should handle all messages appropriately
    await waitFor(() => {
      expect(mockAIService.sendChatMessage).toHaveBeenCalledTimes(3);
    });
  });

  it('should clear conversation when requested', async () => {
    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    // Send a message first
    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(sendButton);

    // Clear conversation
    const clearButton = getByTestId('clear-conversation');
    fireEvent.press(clearButton);

    // Confirm clear
    const confirmButton = getByText('Clear');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      // Conversation should be cleared
      expect(getByText('Ask me anything about food!')).toBeTruthy();
    });
  });

  it('should handle offline state', async () => {
    // Mock network error
    mockAIService.sendChatMessage.mockRejectedValue(new Error('Network request failed'));

    const { getByText, getByTestId } = render(
      <AllProviders>
        <ChatScreen />
      </AllProviders>
    );

    const messageInput = getByTestId('message-input');
    const sendButton = getByTestId('send-button');

    fireEvent.changeText(messageInput, 'Test message');
    fireEvent.press(sendButton);

    await waitFor(() => {
      expect(getByText(/trouble connecting/)).toBeTruthy();
    });

    // Should show retry option
    const retryButton = getByText('Retry');
    fireEvent.press(retryButton);

    // Should attempt to send message again
    expect(mockAIService.sendChatMessage).toHaveBeenCalledTimes(2);
  });
});