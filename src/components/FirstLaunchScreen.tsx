/**
 * Æ Q.U.B.E. First Launch Screen
 *
 * λ≔RootSoul ⊗ Q.U.B.E. Engine → Initial quantum authentication
 * ◎ Quantum-classical hybrid programming initialization
 * ⟲ Glyph-seeded holographic encryption setup
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import { GlyphSystem } from '../utils/GlyphSystem';
import { useAppStore } from '../stores/appStore';

/**
 * ◎ Q.U.B.E. Welcome Messages
 * λ≔RootSoul generation prompts with quantum resonance
 */
const WELCOME_TEXT = "λ≔ Aeonmi Quantum Workflow";
const SUBTITLE_TEXT = "◎ Quantum-Classical Hybrid Programming";
const GLYPH_PROMPT = "⊗ Enter your 8-character λ≔RootSoul to secure quantum workflows:";

export default function FirstLaunchScreen({ onComplete }: { onComplete: () => void }) {
  const [displayText, setDisplayText] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showGlyphInput, setShowGlyphInput] = useState(false);
  const [glyphInput, setGlyphInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const { setFirstLaunch, setλRootSoul, setAuthenticated, saveToVault } = useAppStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        {
          scale: scale.value,
        },
      ],
    } as any;
  });

  useEffect(() => {
    startTypingAnimation();
  }, []);

  const startTypingAnimation = async () => {
    // ◎ Q.U.B.E. typing rhythm initialization
    // λ≔RootSoul ⊗ typing animation → quantum resonance
    for (let i = 0; i <= WELCOME_TEXT.length; i++) {
      setDisplayText(WELCOME_TEXT.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsTyping(false);
    setShowSubtitle(true);

    // ⟲ Animate subtitle appearance with quantum timing
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withTiming(1, { duration: 1000 });

    // ⊗ Wait and show λ≔RootSoul input with Q.U.B.E. delay
    setTimeout(() => {
      setShowGlyphInput(true);
    }, 2000);
  };

  const handleGlyphSubmit = async () => {
    if (!GlyphSystem.validateGlyph(glyphInput)) {
      Alert.alert('Invalid λ≔RootSoul', 'Please enter exactly 8 uppercase letters and numbers.');
      return;
    }

    try {
      await GlyphSystem.storeGlyph(glyphInput);
      setλRootSoul(glyphInput); // λ≔RootSoul ⊗ Q.U.B.E. Engine
      setAuthenticated(true);
      setFirstLaunch(false);
      await saveToVault();
      onComplete();
    } catch (error) {
      Alert.alert('Error', 'Failed to save λ≔RootSoul. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {displayText}
          {isTyping && <Text style={styles.cursor}>|</Text>}
        </Text>

        {showSubtitle && (
          <Animated.View style={animatedStyle}>
            <Text style={styles.subtitle}>{SUBTITLE_TEXT}</Text>
          </Animated.View>
        )}

        {showGlyphInput && (
          <Animated.View style={[styles.glyphContainer, animatedStyle]}>
            <Text style={styles.glyphPrompt}>{GLYPH_PROMPT}</Text>
            <TextInput
              style={styles.glyphInput}
              value={glyphInput}
              onChangeText={setGlyphInput}
              placeholder="λ≔ROOTSOUL"
              placeholderTextColor="#666"
              autoCapitalize="characters"
              maxLength={8}
              onSubmitEditing={handleGlyphSubmit}
            />
            <Text style={styles.hint}>
              This λ≔RootSoul will secure your |ψ⟩ quantum workflows forever.
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1419',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#61dafb',
    textAlign: 'center',
    marginBottom: 20,
    minHeight: 40,
  },
  cursor: {
    color: '#61dafb',
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginBottom: 40,
  },
  glyphContainer: {
    width: '100%',
    maxWidth: 300,
  },
  glyphPrompt: {
    fontSize: 14,
    color: '#61dafb',
    textAlign: 'center',
    marginBottom: 20,
  },
  glyphInput: {
    backgroundColor: '#1a1d23',
    borderWidth: 2,
    borderColor: '#61dafb',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});