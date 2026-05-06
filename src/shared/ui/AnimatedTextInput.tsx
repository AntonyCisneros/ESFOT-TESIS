import { useFormFieldBorderAnimation } from "@shared/hooks/useAnimations";
import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";

interface AnimatedTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  editable?: boolean;
}

export const AnimatedTextInput = React.forwardRef<
  TextInput,
  AnimatedTextInputProps
>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      multiline = false,
      numberOfLines = 1,
      keyboardType = "default",
      editable = true,
    },
    ref,
  ) => {
    const { animatedBorderStyle, handleFocus, handleBlur } =
      useFormFieldBorderAnimation();

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#AAA"
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            editable={editable}
          />
        </Animated.View>
      </View>
    );
  },
);

AnimatedTextInput.displayName = "AnimatedTextInput";

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E6DA4",
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 8,
    overflow: "hidden",
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1F2A36",
    textAlignVertical: "top",
  },
});
