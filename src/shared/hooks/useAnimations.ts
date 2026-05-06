import { useEffect } from "react";
import {
    Easing,
    FadeInDown,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

/**
 * Hook para animación de entrada suave en tarjetas
 * Efecto: fade + slide down con delay
 */
export const useCardEnterAnimation = (delay: number = 0) => {
  return FadeInDown.delay(delay).duration(600).springify();
};

/**
 * Hook para animación de border en campos de formulario
 * Efecto: transición de color suave del borde
 */
export const useFormFieldBorderAnimation = () => {
  const isFocused = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      isFocused.value,
      [0, 1],
      ["#E0E0E0", "#2E6DA4"], // grey → primary blue
    );

    const borderWidth = interpolate(isFocused.value, [0, 1], [1, 2]);

    return {
      borderColor,
      borderWidth,
    };
  });

  const handleFocus = () => {
    isFocused.value = withSpring(1, {
      damping: 8,
      mass: 1,
      overshootClamping: false,
    });
  };

  const handleBlur = () => {
    isFocused.value = withSpring(0, {
      damping: 8,
      mass: 1,
      overshootClamping: false,
    });
  };

  return {
    animatedBorderStyle,
    handleFocus,
    handleBlur,
  };
};

/**
 * Hook para efecto parallax en scroll
 * Efecto: Las tarjetas se mueven a diferentes velocidades
 */
export const useParallaxAnimation = (
  scrollOffset: SharedValue<number>,
  intensity: number = 0.5,
) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-100, 0, 100],
            [50 * intensity, 0, -50 * intensity],
          ),
        },
      ],
    };
  });

  return animatedStyle;
};

/**
 * Hook para efecto flip card (girar tarjeta en 3D)
 * Efecto: Giro de 180 grados con perspectiva
 */
export const useFlipCardAnimation = () => {
  const isFlipped = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(isFlipped.value, [0, 1], [0, 180]);
    const scale = interpolate(isFlipped.value, [0, 1], [1, 0.8]);

    return {
      transform: [{ rotateZ: `${rotation}deg` }, { scale: scale }],
    };
  });

  const toggleFlip = () => {
    isFlipped.value = withSpring(isFlipped.value === 0 ? 1 : 0, {
      damping: 10,
      mass: 1,
    });
  };

  return {
    animatedStyle,
    toggleFlip,
    isFlipped,
  };
};

/**
 * Hook para pulso de escala
 * Efecto: Animación de "pulse" que atrae atención
 */
export const usePulseAnimation = (enabled: boolean = true) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!enabled) {
      scale.value = 1;
      return;
    }

    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 300 }),
        withTiming(1, { duration: 300 }),
      ),
      -1, // infinito
      true, // alternar
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
};

/**
 * Hook para animación de typing/escritura
 * Efecto: Efecto de máquina de escribir
 * Retorna un SharedValue<string> con el texto parcial
 */
export const useTypewriterAnimation = (
  text: string,
  duration: number = 2000,
) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration,
      easing: Easing.linear,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration]);

  const displayedText = useDerivedValue(() => {
    const charCount = Math.floor(progress.value * text.length);
    return text.substring(0, charCount);
  }, [text]);

  return displayedText;
};
