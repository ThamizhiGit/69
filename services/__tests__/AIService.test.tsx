import { AIService } from '../aiService';
import { mockRestaurants, mockMenuItems } from '../../constants/mockData';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Chat Functionality', () => {
    it('should send chat message and receive response', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'I recommend trying the Margherita Pizza from Tony\'s Italian Kitchen!'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const response = await AIService.sendChatMessage('What pizza do you recommend?');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('openrouter.ai'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer'),
          }),
          body: expect.stringContaining('What pizza do you recommend?'),
        })
      );

      expect(response).toBe('I recommend trying the Margherita Pizza from Tony\'s Italian Kitchen!');
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('I apologize');
      expect(response).toContain('having trouble');
    });

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('I apologize');
      expect(response).toContain('having trouble');
    });

    it('should include conversation context in requests', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Based on your previous question about pizza, I also recommend pasta!'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const conversationHistory = [
        { role: 'user', content: 'What pizza do you recommend?' },
        { role: 'assistant', content: 'I recommend Margherita Pizza!' },
      ];

      const response = await AIService.sendChatMessage(
        'What about pasta?', 
        conversationHistory
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('What pizza do you recommend?'),
        })
      );

      expect(response).toContain('pasta');
    });
  });

  describe('Food Recommendations', () => {
    it('should generate food recommendations based on preferences', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              {
                restaurantId: mockRestaurants[0].id,
                menuItemId: mockMenuItems[0].id,
                reason: 'Perfect for vegetarian preferences',
                confidence: 0.9
              }
            ])
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const userPreferences = {
        dietary: ['vegetarian'],
        cuisines: ['italian'],
        spiceLevel: 'mild' as const,
      };

      const recommendations = await AIService.getFoodRecommendations(
        userPreferences,
        mockRestaurants
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('restaurantId');
      expect(recommendations[0]).toHaveProperty('menuItemId');
      expect(recommendations[0]).toHaveProperty('reason');
      expect(recommendations[0]).toHaveProperty('confidence');
    });

    it('should handle invalid recommendation response format', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Invalid JSON response'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const userPreferences = {
        dietary: ['vegetarian'],
        cuisines: ['italian'],
        spiceLevel: 'mild' as const,
      };

      const recommendations = await AIService.getFoodRecommendations(
        userPreferences,
        mockRestaurants
      );

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBe(0);
    });

    it('should filter recommendations by available restaurants', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify([
              {
                restaurantId: 'non-existent-restaurant',
                menuItemId: 'non-existent-item',
                reason: 'This should be filtered out',
                confidence: 0.8
              },
              {
                restaurantId: mockRestaurants[0].id,
                menuItemId: mockMenuItems[0].id,
                reason: 'This should be included',
                confidence: 0.9
              }
            ])
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const userPreferences = {
        dietary: ['vegetarian'],
        cuisines: ['italian'],
        spiceLevel: 'mild' as const,
      };

      const recommendations = await AIService.getFoodRecommendations(
        userPreferences,
        mockRestaurants
      );

      expect(recommendations.length).toBe(1);
      expect(recommendations[0].restaurantId).toBe(mockRestaurants[0].id);
    });
  });

  describe('Conversation Context Management', () => {
    it('should maintain conversation context', () => {
      const message1 = 'What do you recommend?';
      const response1 = 'I recommend pizza!';
      
      AIService.addToConversationHistory('user', message1);
      AIService.addToConversationHistory('assistant', response1);
      
      const history = AIService.getConversationHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0]).toEqual({ role: 'user', content: message1 });
      expect(history[1]).toEqual({ role: 'assistant', content: response1 });
    });

    it('should limit conversation history length', () => {
      // Clear existing history
      AIService.clearConversationHistory();
      
      // Add more messages than the limit
      for (let i = 0; i < 25; i++) {
        AIService.addToConversationHistory('user', `Message ${i}`);
        AIService.addToConversationHistory('assistant', `Response ${i}`);
      }
      
      const history = AIService.getConversationHistory();
      
      // Should be limited to last 20 messages (10 exchanges)
      expect(history.length).toBeLessThanOrEqual(20);
    });

    it('should clear conversation history', () => {
      AIService.addToConversationHistory('user', 'Test message');
      AIService.clearConversationHistory();
      
      const history = AIService.getConversationHistory();
      
      expect(history).toHaveLength(0);
    });
  });

  describe('Fallback Responses', () => {
    it('should provide appropriate fallback for food questions', () => {
      const foodQuestions = [
        'What should I eat?',
        'Recommend me some pizza',
        'I want something spicy',
        'What\'s good for dinner?'
      ];

      foodQuestions.forEach(question => {
        const fallback = AIService.getFallbackResponse(question);
        
        expect(typeof fallback).toBe('string');
        expect(fallback.length).toBeGreaterThan(0);
        expect(fallback).toMatch(/food|restaurant|menu|recommend/i);
      });
    });

    it('should provide appropriate fallback for restaurant questions', () => {
      const restaurantQuestions = [
        'Tell me about this restaurant',
        'Is this place good?',
        'What are the hours?',
        'How long is delivery?'
      ];

      restaurantQuestions.forEach(question => {
        const fallback = AIService.getFallbackResponse(question);
        
        expect(typeof fallback).toBe('string');
        expect(fallback.length).toBeGreaterThan(0);
      });
    });

    it('should provide general fallback for other questions', () => {
      const generalQuestions = [
        'Hello',
        'How are you?',
        'What can you do?',
        'Random question'
      ];

      generalQuestions.forEach(question => {
        const fallback = AIService.getFallbackResponse(question);
        
        expect(typeof fallback).toBe('string');
        expect(fallback.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Message Processing', () => {
    it('should process user preferences from messages', () => {
      const messages = [
        'I\'m vegetarian',
        'I love spicy food',
        'I prefer Italian cuisine',
        'I\'m allergic to nuts'
      ];

      messages.forEach(message => {
        const preferences = AIService.extractPreferencesFromMessage(message);
        
        expect(typeof preferences).toBe('object');
        expect(preferences).toHaveProperty('dietary');
        expect(preferences).toHaveProperty('cuisines');
        expect(preferences).toHaveProperty('spiceLevel');
      });
    });

    it('should detect food-related keywords', () => {
      const foodMessages = [
        'I want pizza',
        'Recommend some sushi',
        'What about burgers?',
        'I\'m craving pasta'
      ];

      const nonFoodMessages = [
        'Hello there',
        'How are you?',
        'What\'s the weather?',
        'Tell me a joke'
      ];

      foodMessages.forEach(message => {
        const isFoodRelated = AIService.isFoodRelatedMessage(message);
        expect(isFoodRelated).toBe(true);
      });

      nonFoodMessages.forEach(message => {
        const isFoodRelated = AIService.isFoodRelatedMessage(message);
        expect(isFoodRelated).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle timeout errors', async () => {
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('I apologize');
    });

    it('should handle malformed API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
      } as Response);

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('I apologize');
    });

    it('should handle empty API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('I apologize');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      } as Response);

      const response = await AIService.sendChatMessage('Test message');

      expect(response).toContain('busy');
    });
  });

  describe('Configuration', () => {
    it('should use correct API endpoint', () => {
      expect(AIService.getApiEndpoint()).toContain('openrouter.ai');
    });

    it('should use correct model', () => {
      expect(AIService.getModel()).toBe('x-ai/grok-2-1212');
    });

    it('should have appropriate request timeout', () => {
      expect(AIService.getTimeout()).toBeGreaterThan(0);
      expect(AIService.getTimeout()).toBeLessThanOrEqual(30000); // 30 seconds max
    });
  });
});