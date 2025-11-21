import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Zap, Cpu } from 'lucide-react-native';
import { palette } from '../theme/colors';
import { api } from '../services/api';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConstructorAIProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const ConstructorAI: React.FC<ConstructorAIProps> = ({
  isMinimized = false,
  onToggleMinimize,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content:
        "Hello! I'm Constructor, your quantum AI assistant. I can help you with workflow automation, quantum algorithms, optimization, and complex problem-solving. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const health = await api.checkHealth();
      setIsOnline(health.status === 'healthy');
    } catch (error) {
      setIsOnline(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Simulate AI response with quantum workflow intelligence
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const aiResponse = generateConstructorResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I encountered an issue processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateConstructorResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    // Workflow creation
    if (lowerQuery.includes('workflow') || lowerQuery.includes('create')) {
      return "I can help you build a quantum workflow! I'll guide you through selecting nodes, connecting them, and optimizing execution. What type of workflow are you building? (e.g., data processing, AI automation, quantum computing, business automation)";
    }

    // Quantum algorithms
    if (lowerQuery.includes('quantum') || lowerQuery.includes('algorithm')) {
      return "I specialize in quantum algorithms! I can help with:\n\n• Grover's Search - database search with quadratic speedup\n• Shor's Algorithm - integer factorization\n• VQE - variational quantum eigensolver for chemistry\n• QAOA - quantum approximate optimization\n\nWhich quantum algorithm interests you?";
    }

    // Optimization
    if (lowerQuery.includes('optim')) {
      return 'I use quantum annealing and AI to optimize workflows. I can analyze your workflow structure, identify bottlenecks, suggest parallel execution paths, and recommend error mitigation strategies. Would you like me to analyze a specific workflow?';
    }

    // Security/BB84
    if (lowerQuery.includes('security') || lowerQuery.includes('bb84')) {
      return 'QuantumForge uses BB84 quantum key distribution for unbreakable encryption. This protocol leverages quantum mechanics principles:\n\n• Quantum superposition for key generation\n• Heisenberg uncertainty for eavesdropping detection\n• Quantum-resistant cryptography\n\nWould you like to generate a quantum key pair?';
    }

    // Help/capabilities
    if (
      lowerQuery.includes('help') ||
      lowerQuery.includes('can you') ||
      lowerQuery.includes('what')
    ) {
      return "I'm Constructor, your quantum AI assistant. My capabilities include:\n\n✨ Workflow Construction - build complex automation workflows\n🔬 Quantum Computing - algorithm design and optimization\n⚡ Performance Optimization - quantum annealing and AI analysis\n🔐 Security Analysis - BB84 quantum encryption\n🤖 AI Integration - machine learning and quantum ML\n\nWhat would you like to explore?";
    }

    // Default response
    return (
      "I understand you're asking about: " +
      query +
      "\n\nI can provide guidance on quantum workflows, optimization strategies, and advanced automation. Could you provide more specific details about what you'd like to accomplish?"
    );
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity style={styles.minimizedContainer} onPress={toggleExpand}>
        <View style={styles.minimizedContent}>
          <Cpu color={palette.accentPrimary} size={24} />
          <View style={styles.minimizedBadge}>
            <Text style={styles.minimizedBadgeText}>AI</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.expandedContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Cpu color={palette.accentPrimary} size={20} />
          <Text style={styles.headerTitle}>Constructor AI</Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? palette.success : palette.error },
            ]}
          />
        </View>
        <TouchableOpacity onPress={toggleExpand}>
          <Zap color={palette.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.type === 'user' ? styles.userBubble : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.type === 'user' ? styles.userText : styles.assistantText,
              ]}
            >
              {message.content}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.typingIndicator}>Constructor is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="Ask Constructor anything..."
          placeholderTextColor={palette.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputValue.trim()}
        >
          <Zap
            color={inputValue.trim() ? palette.background : palette.textSecondary}
            size={20}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  minimizedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: palette.accentPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  minimizedContent: {
    position: 'relative',
  },
  minimizedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: palette.accentSecondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  minimizedBadgeText: {
    color: palette.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandedContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 350,
    height: 500,
    backgroundColor: palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
    backgroundColor: palette.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  messagesContainer: {
    flex: 1,
    padding: 12,
  },
  messageBubble: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: palette.accentPrimary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: palette.background,
  },
  assistantText: {
    color: palette.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: palette.textSecondary,
    marginTop: 4,
  },
  typingIndicator: {
    color: palette.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: palette.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: palette.textPrimary,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: palette.background,
  },
});

export default ConstructorAI;
