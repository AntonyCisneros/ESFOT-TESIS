import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface FlipCardProps {
  title: string;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

export const FlipCard = ({
  title,
  frontContent,
  backContent,
}: FlipCardProps) => {
  const isFlipped = useSharedValue(0);

  const frontStyle = useAnimatedStyle(() => ({
    opacity: isFlipped.value < 0.5 ? 1 : 0,
    transform: [
      { perspective: 1000 },
      { rotateY: isFlipped.value < 0.5 ? "0deg" : "180deg" },
    ],
  }));

  const backStyle = useAnimatedStyle(() => ({
    opacity: isFlipped.value >= 0.5 ? 1 : 0,
    transform: [
      { perspective: 1000 },
      { rotateY: isFlipped.value >= 0.5 ? "0deg" : "-180deg" },
    ],
  }));

  const handleFlip = () => {
    isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, {
      damping: 12,
      mass: 0.8,
      stiffness: 100,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        onPress={handleFlip}
        activeOpacity={0.9}
        style={styles.cardTouchable}
      >
        <View style={styles.cardContainer}>
          <Animated.View style={[styles.cardInner, styles.cardFront, frontStyle]}>
            {frontContent}
          </Animated.View>
          <Animated.View style={[styles.cardInner, styles.cardBack, backStyle]}>
            {backContent}
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Text style={styles.hint}>Toca para girar la tarjeta</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A3A5C",
    marginBottom: 12,
  },
  cardTouchable: {
    width: "100%",
    height: 200,
  },
  cardContainer: {
    flex: 1,
    position: "relative",
  },
  cardInner: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backfaceVisibility: "hidden",
  },
  cardFront: {
    backgroundColor: "#EBF5FB",
    borderWidth: 2,
    borderColor: "#2E6DA4",
  },
  cardBack: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    fontStyle: "italic",
  },
});
