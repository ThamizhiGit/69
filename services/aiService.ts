import { ChatMessage, FoodRecommendation, User } from '../types';
import { mockDataService } from './mockData';

// AI service for chatbot and food recommendations
export class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://openrouter.ai/api/v1';

  // Initialize with API key (would be set from environment variables)
  initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Get chat response from AI service
  async getChatResponse(message: string, user?: User): Promise<string> {
    try {
      // For demo purposes, use fallback responses
      // In production, this would call the actual OpenRouter API
      return this.getFallbackResponse(message, user);
    } catch (error) {
      console.error('AI service error:', error);
      return this.getFallbackResponse(message, user);
    }
  }

  // Fallback responses for demo purposes
  private getFallbackResponse(message: string, user?: User): string {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello${user ? ` ${user.name}` : ''}! I'm here to help you discover amazing food. What are you craving today?`;
    }
    
    // Food recommendation requests
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      if (user?.preferences.cuisines.length) {
        return `Based on your love for ${user.preferences.cuisines.join(' and ')}, I'd recommend checking out our Italian and Japanese restaurants! Would you like me to show you some specific dishes?`;
      }
      return "I'd love to help you find something delicious! Are you in the mood for Italian, Japanese, or American cuisine today?";
    }
    
    // Dietary restrictions
    if (lowerMessage.includes('vegetarian') || lowerMessage.includes('vegan')) {
      return "Great choice! We have many vegetarian and vegan options. I can recommend some amazing plant-based dishes from our partner restaurants. Would you like to see them?";
    }
    
    // Pizza requests
    if (lowerMessage.includes('pizza')) {
      return "Pizza sounds perfect! Bella Italia has some incredible options. Their Margherita pizza is a classic favorite with fresh mozzarella and basil. Would you like to see their full menu?";
    }
    
    // Sushi requests
    if (lowerMessage.includes('sushi')) {
      return "Excellent choice! Sushi Zen offers the freshest sushi in town. Their salmon nigiri is particularly popular. Should I show you their sushi selection?";
    }
    
    // Burger requests
    if (lowerMessage.includes('burger')) {
      return "Burger Palace has some amazing gourmet burgers! Their classic cheeseburger is a crowd favorite. Want to check out their menu?";
    }
    
    // Order help
    if (lowerMessage.includes('order') || lowerMessage.includes('help')) {
      return "I'm here to help with your order! You can browse restaurants, add items to your cart, and I'll guide you through checkout. What would you like to do first?";
    }
    
    // Default response
    return "I'm here to help you find delicious food! You can ask me about restaurants, specific dishes, dietary options, or I can make personalized recommendations based on your preferences. What sounds good to you?";
  }

  // Generate food recommendations based on user preferences
  async getFoodRecommendations(user?: User): Promise<FoodRecommendation[]> {
    const restaurants = mockDataService.getRestaurants();
    const recommendations: FoodRecommendation[] = [];
    
    // Mock recommendations based on user preferences
    if (user?.preferences.cuisines.includes('Italian')) {
      recommendations.push({
        id: '1',
        name: 'Margherita Pizza',
        description: 'Fresh mozzarella, tomato sauce, and basil',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
        price: 18.99,
        restaurantId: '1',
        restaurantName: 'Bella Italia'
      });
    }
    
    if (user?.preferences.cuisines.includes('Japanese')) {
      recommendations.push({
        id: '2',
        name: 'Salmon Nigiri',
        description: 'Fresh Atlantic salmon over seasoned rice',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        price: 12.99,
        restaurantId: '2',
        restaurantName: 'Sushi Zen'
      });
    }
    
    // Add some general popular items
    recommendations.push({
      id: '3',
      name: 'Classic Cheeseburger',
      description: 'Beef patty with cheese, lettuce, tomato, and special sauce',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      price: 14.99,
      restaurantId: '3',
      restaurantName: 'Burger Palace'
    });
    
    return recommendations;
  }

  // Get suggested questions for the chat interface
  getSuggestedQuestions(): string[] {
    return [
      "What's popular today?",
      "Show me vegetarian options",
      "I want something spicy",
      "Quick delivery options",
      "Recommend something new",
      "What's good for dinner?"
    ];
  }

  // Simulate typing delay for realistic chat experience
  async simulateTyping(duration: number = 1500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}

// Export singleton instance
export const aiService = new AIService();