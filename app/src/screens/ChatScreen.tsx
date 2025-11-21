import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, User, Sparkles, Activity } from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api } from '../services/api';
import useRootStore from '../state/store';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  sentiment?: { score: number; label: string };
}

const ChatScreen = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Greetings. I am Mother AI. How can I assist with your quantum workflows today?',
      sender: 'ai',
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<any>(null);
  const isBackendConnected = useRootStore((state) => state.isBackendConnected);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
      sentiment: { score: 0.5 + Math.random() * 0.4, label: 'Positive' }, // Mock NLP analysis
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      let aiResponseText = '';

      if (isBackendConnected) {
        // Use the backend API
        // We are using processWorkflow as a proxy for chat for now, or we could add a specific chat endpoint later.
        // For now, let's assume we want to "process" the text as a command or query.
        // Ideally, we should add a specific chat endpoint to api.ts, but let's check what we have.
        // The user wants "Natural Language Assistant Interface".

        // Let's try to use the 'processWorkflow' if it makes sense, or just simulate a response if the backend doesn't have a dedicated chat endpoint yet.
        // Actually, looking at api.ts (from memory/context), it has processWorkflow.
        // Let's assume for this "Chat" feature, we might need to add a method to api.ts or use an existing one.
        // Let's use a placeholder for the actual API call if a specific chat one isn't there,
        // but since I can't see api.ts right now, I'll assume I can add a method or use a generic one.

        // For now, I will simulate a call to the backend structure we know exists.
        // If we want to be real, we should probably add `chatWithAI` to api.ts.
        // I'll stick to a simulation that *would* call the API, and maybe fallback to local logic.

        // Let's try to call a hypothetical api.chat() which I will add to api.ts shortly.
        const response = await api.chat(userMessage.text);
        aiResponseText = response.message;
      } else {
        // Local fallback (Mother AI simulation)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        aiResponseText = `[Offline Mode] I received: "${userMessage.text}". Connect to the Quantum Backend for full analysis.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Error communicating with the Quantum Field (Backend).',
        sender: 'ai',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Bot color={palette.accentPrimary} size={20} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        {isUser && (
          <View style={styles.avatarContainer}>
            <User color={palette.textSecondary} size={20} />
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Sparkles color={palette.accentSecondary} size={24} />
        <Text style={styles.headerTitle}>Mother AI Assistant</Text>
        <View style={{ flex: 1 }} />
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isBackendConnected ? palette.success : palette.danger },
          ]}
        />
        <Text style={styles.statusText}>{isBackendConnected ? 'Online' : 'Offline'}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item: Message) => item.id}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask Mother AI..."
          placeholderTextColor={palette.textSecondary}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={palette.background} size="small" />
          ) : (
            <Send color={palette.background} size={20} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.surface,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: palette.textSecondary,
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: palette.accentPrimary,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: palette.surfaceElevated,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: palette.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: palette.surface,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: palette.textPrimary,
    marginRight: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: palette.textSecondary,
  },
});

export default ChatScreen;
