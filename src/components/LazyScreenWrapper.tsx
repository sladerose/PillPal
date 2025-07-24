import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getTheme } from '../lib/colors';

interface LazyScreenWrapperProps {
  getComponent: () => Promise<{ default: React.ComponentType<any> }>;
}

const LazyScreenWrapper: React.FC<LazyScreenWrapperProps> = ({ getComponent }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const { colors } = getTheme();

  useEffect(() => {
    let isMounted = true;
    getComponent().then(module => {
      if (isMounted) {
        setComponent(() => module.default);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [getComponent]);

  if (!Component) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.PRIMARY} />
      </View>
    );
  }

  return <Component />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LazyScreenWrapper;
