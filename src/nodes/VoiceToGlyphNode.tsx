import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseNodeComponent } from './BaseNode';
import { NodeProps } from './types';

export function VoiceToGlyphNode(props: NodeProps) {
  const { node, onUpdate } = props;
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      const mockTranscription = "quantum entanglement detected";
      const mockGlyphs = mockTranscription.split('').map(char =>
        char.charCodeAt(0).toString(16).padStart(2, '0')
      ).join(' ');
      onUpdate({
        config: {
          ...node.config,
          transcription: mockTranscription,
          glyphs: mockGlyphs,
          timestamp: new Date().toISOString()
        }
      });
      setIsRecording(false);
    }, 2000);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <BaseNodeComponent
      {...props}
      title="Voice-to-Glyph"
      color="#9b59b6"
      icon="mic"
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recording]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordText}>
            {isRecording ? 'Recording...' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {node.config.transcription && (
          <View style={styles.transcriptionDisplay}>
            <Text style={styles.transcriptionLabel}>Transcription:</Text>
            <Text style={styles.transcriptionText}>
              {node.config.transcription}
            </Text>
          </View>
        )}

        {node.config.glyphs && (
          <View style={styles.glyphDisplay}>
            <Text style={styles.glyphLabel}>Glyphs:</Text>
            <Text style={styles.glyphText} numberOfLines={3}>
              {node.config.glyphs}
            </Text>
            <Text style={styles.timestamp}>
              {node.config.timestamp ? new Date(node.config.timestamp).toLocaleTimeString() : ''}
            </Text>
          </View>
        )}

        <View style={styles.languageSelector}>
          <Text style={styles.languageLabel}>Language:</Text>
          <View style={styles.languageButtons}>
            {['EN', 'ES', 'FR', 'DE'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  node.config.language === lang && styles.selectedLanguage
                ]}
                onPress={() => onUpdate({
                  config: { ...node.config, language: lang }
                })}
              >
                <Text style={[
                  styles.languageText,
                  node.config.language === lang && styles.selectedLanguageText
                ]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </BaseNodeComponent>
  );
}

const styles = StyleSheet.create({
  content: {
    marginTop: 8,
  },
  recordButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  recording: {
    backgroundColor: '#e74c3c',
  },
  recordText: {
    color: '#0f1419',
    fontSize: 10,
    fontWeight: 'bold',
  },
  transcriptionDisplay: {
    backgroundColor: '#0f1419',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  transcriptionLabel: {
    color: '#9b59b6',
    fontSize: 8,
    fontWeight: 'bold',
  },
  transcriptionText: {
    color: '#45b7d1',
    fontSize: 10,
    marginTop: 2,
  },
  glyphDisplay: {
    backgroundColor: '#0f1419',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  glyphLabel: {
    color: '#9b59b6',
    fontSize: 8,
    fontWeight: 'bold',
  },
  glyphText: {
    color: '#45b7d1',
    fontSize: 8,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
  timestamp: {
    color: '#666',
    fontSize: 6,
  },
  languageSelector: {
    marginTop: 8,
  },
  languageLabel: {
    color: '#9b59b6',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageButton: {
    backgroundColor: '#0f1419',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 4,
    padding: 4,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedLanguage: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  languageText: {
    color: '#9b59b6',
    fontSize: 8,
  },
  selectedLanguageText: {
    color: '#0f1419',
    fontWeight: 'bold',
  },
});