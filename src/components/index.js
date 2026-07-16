import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export const Button = ({ title, onPress, loading, disabled, variant = 'primary', style }) => {
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : colors.surface;
  const textColor = variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.text;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export const TextInput_ = ({ label, placeholder, value, onChangeText, secureTextEntry, error, style, ...props }) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={colors.textLighter}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export const Card = ({ children, style, onPress }) => {
  const content = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  return onPress ? (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
};

export const Badge = ({ label, variant = 'primary', style }) => {
  const backgroundColor = variant === 'primary' ? colors.primary : variant === 'warning' ? colors.warning : colors.error;

  return (
    <View style={[styles.badge, { backgroundColor }, style]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    ...typography.caption,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    ...typography.caption,
    fontWeight: '600',
  },
});
