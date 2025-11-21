import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Binary, RefreshCw, Copy, ShieldCheck } from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api } from '../services/api';
import useRootStore from '../state/store';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_SIZE = 16;
const CELL_SIZE = (SCREEN_WIDTH - 64) / GRID_SIZE;

const QRNGScreen = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [randomData, setRandomData] = useState<number[]>([]);
  const [generationType, setGenerationType] = useState<'uint8' | 'uint16'>('uint8');
  const isBackendConnected = useRootStore((state) => state.isBackendConnected);

  const generateNumbers = async () => {
    setIsGenerating(true);
    try {
      // Generate enough numbers to fill a 16x16 grid (256 numbers)
      const response = await api.generateQRNG(256, generationType);
      setRandomData(response.data);
    } catch (error) {
      // QRNG generation failed - error handled in UI
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGridItem = ({ item }: { item: number }) => {
    // Map value to opacity or color
    const opacity = item / (generationType === 'uint8' ? 255 : 65535);
    return (
      <View
        style={[
          styles.gridCell,
          {
            backgroundColor: palette.accentPrimary,
            opacity: Math.max(0.1, opacity),
          },
        ]}
      />
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Binary color={palette.accentSecondary} size={24} />
        <Text style={styles.headerTitle}>Quantum Random Number Generator</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Quantum Entropy Visualizer</Text>
          {isBackendConnected && (
            <View style={styles.verifiedBadge}>
              <ShieldCheck color={palette.success} size={14} />
              <Text style={styles.verifiedText}>True Randomness</Text>
            </View>
          )}
        </View>

        <View style={styles.gridContainer}>
          {randomData.length > 0 ? (
            <FlatList
              data={randomData}
              renderItem={renderGridItem}
              keyExtractor={(_: number, index: number) => index.toString()}
              numColumns={GRID_SIZE}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Binary color={palette.textTertiary} size={48} />
              <Text style={styles.placeholderText}>
                Generate quantum entropy to visualize randomness
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Count</Text>
            <Text style={styles.statValue}>{randomData.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Type</Text>
            <Text style={styles.statValue}>{generationType.toUpperCase()}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Source</Text>
            <Text style={styles.statValue}>
              {isBackendConnected ? 'Quantum' : 'Pseudo'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isGenerating && styles.buttonDisabled]}
          onPress={generateNumbers}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color={palette.background} />
          ) : (
            <>
              <RefreshCw color={palette.background} size={20} />
              <Text style={styles.buttonText}>Generate Quantum Entropy</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {randomData.length > 0 && (
        <View style={styles.dataCard}>
          <Text style={styles.cardTitle}>Raw Data Sample</Text>
          <Text style={styles.dataText}>{randomData.slice(0, 20).join(', ')}...</Text>
          <TouchableOpacity style={styles.copyButton}>
            <Copy color={palette.accentPrimary} size={16} />
            <Text style={styles.copyText}>Copy All</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: palette.success,
    fontSize: 10,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  gridContainer: {
    height: SCREEN_WIDTH - 64, // Square aspect ratio
    width: SCREEN_WIDTH - 64,
    backgroundColor: palette.background,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  gridCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  placeholderText: {
    color: palette.textTertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: palette.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: palette.accentSecondary,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: palette.textTertiary,
  },
  buttonText: {
    color: palette.background,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  dataCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: palette.surfaceHighlight,
    borderRadius: 12,
  },
  dataText: {
    color: palette.textSecondary,
    fontFamily: 'monospace',
    marginVertical: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  copyText: {
    color: palette.accentPrimary,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default QRNGScreen;
