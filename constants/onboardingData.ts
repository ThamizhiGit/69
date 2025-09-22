export interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover Amazing Food',
    subtitle: 'Thousands of restaurants',
    description: 'Explore a world of flavors from your favorite local restaurants and discover new cuisines delivered right to your door.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
    backgroundColor: '#FF6B35',
    textColor: '#FFFFFF'
  },
  {
    id: '2',
    title: 'Fast & Reliable Delivery',
    subtitle: 'Quick delivery guaranteed',
    description: 'Get your favorite meals delivered hot and fresh in 30 minutes or less with real-time tracking.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&h=600&fit=crop',
    backgroundColor: '#48BB78',
    textColor: '#FFFFFF'
  },
  {
    id: '3',
    title: 'AI-Powered Recommendations',
    subtitle: 'Personalized just for you',
    description: 'Our smart AI learns your preferences and suggests the perfect meals based on your taste and dietary needs.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    backgroundColor: '#9F7AEA',
    textColor: '#FFFFFF'
  },
  {
    id: '4',
    title: 'Start Your Food Journey',
    subtitle: 'Ready to order?',
    description: 'Join thousands of food lovers and start exploring amazing restaurants in your area today.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
    backgroundColor: '#F6AD55',
    textColor: '#FFFFFF'
  }
];