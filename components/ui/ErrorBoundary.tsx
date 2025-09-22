import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GlassContainer } from '../glass/GlassContainer';
import { GlassButton } from '../glass/GlassButton';
import { glassTheme } from '../../constants/theme';
import { standardGlassStyles, glassConfigs } from '../../constants/glassStyles';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <GlassContainer
          {...glassConfigs.normal}
          style={standardGlassStyles.card}
        >
          <View style={standardGlassStyles.errorContainer}>
            <Text style={styles.errorTitle}>
              Oops! Something went wrong
            </Text>
            <Text style={standardGlassStyles.errorText}>
              We encountered an unexpected error. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.message}
              </Text>
            )}
            <GlassButton
              title="Try Again"
              onPress={this.handleRetry}
              variant="primary"
              size="medium"
            />
          </View>
        </GlassContainer>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorTitle: {
    fontSize: glassTheme.typography.sizes.lg,
    fontWeight: glassTheme.typography.weights.bold,
    color: glassTheme.colors.text.primary,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.sm,
  },
  errorDetails: {
    fontSize: glassTheme.typography.sizes.sm,
    color: glassTheme.colors.text.muted,
    textAlign: 'center',
    marginBottom: glassTheme.spacing.md,
    fontFamily: 'monospace',
  },
});