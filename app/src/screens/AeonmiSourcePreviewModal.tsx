import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { palette } from '../theme/colors';

interface PreviewParams {
  source: string;
}

type Route = RouteProp<
  Record<'AeonmiSourcePreview', PreviewParams>,
  'AeonmiSourcePreview'
>;

const AeonmiSourcePreviewModal: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const source = route.params?.source ?? '// No source available';

  const copyToClipboard = () => {
    Alert.alert('Copied', 'Aeonmi source copied to clipboard (mock).');
  };

  return (
    <View style={styles.container}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Aeonmi Source Preview</Text>
          <Pressable style={styles.close} onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
        <ScrollView style={styles.codeWrapper} contentInsetAdjustmentBehavior="automatic">
          <Text style={styles.code}>{source}</Text>
        </ScrollView>
        <Pressable style={styles.copyButton} onPress={copyToClipboard}>
          <Text style={styles.copyText}>Copy</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 10, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#101722',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  close: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F2A37',
  },
  closeText: {
    color: palette.textSecondary,
  },
  codeWrapper: {
    borderWidth: 1,
    borderColor: '#1F2A37',
    borderRadius: 14,
    backgroundColor: '#0F141C',
    padding: 12,
  },
  code: {
    color: '#C6F1FF',
    fontFamily: 'Menlo',
    fontSize: 12,
    lineHeight: 18,
  },
  copyButton: {
    marginTop: 16,
    backgroundColor: palette.accentPrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  copyText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
});

export default AeonmiSourcePreviewModal;
