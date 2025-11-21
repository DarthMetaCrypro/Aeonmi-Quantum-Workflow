// Constructor AI Assistant - Floating AI Helper Component
// Always available throughout the QuantumForge app for guidance and assistance

import React, { useState, useEffect, useRef } from 'react';
import './Constructor.css';
import aiAssistantService from '../services/aiAssistantService';
import persistentWorkflowService from '../services/persistentWorkflowService';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quantumSimilarity?: number;
}

interface ConstructorProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const Constructor: React.FC<ConstructorProps> = ({
  isMinimized = false,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m Constructor, your quantum AI assistant. I can help you with workflow automation, quantum computing, optimization problems, and much more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Start minimized
  const [isOnline, setIsOnline] = useState(false);
  const [forceOnline, setForceOnline] = useState(true); // Start in demo mode for development
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check AI Assistant health on mount
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    // Listen for help requests from other components
    const handleHelpRequest = (event: CustomEvent) => {
      const { context, action } = event.detail;
      let helpMessage = '';

      switch (action) {
        case 'help-create-workflow':
          helpMessage = "I can help you create a quantum workflow! What type of workflow are you building? For example: data processing, AI automation, quantum computing, business optimization, or social media management?";
          break;
        default:
          helpMessage = `I see you need help with ${context}. How can I assist you today?`;
      }

      // Add the help message to the conversation
      const helpMessageObj: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: helpMessage,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, helpMessageObj]);
      setIsExpanded(true); // Expand the constructor when help is requested
    };

    window.addEventListener('constructor-help', handleHelpRequest as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('constructor-help', handleHelpRequest as EventListener);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkHealth = async () => {
    try {
      const health = await aiAssistantService.healthCheck();
      setIsOnline(health.status === 'success');
    } catch (error) {
      setIsOnline(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || (!isOnline && !forceOnline)) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    try {
      // Check if user is requesting workflow creation
      const workflowKeywords = ['create', 'build', 'make', 'construct', 'design', 'generate', 'workflow', 'automation'];
      const isWorkflowRequest = workflowKeywords.some(keyword =>
        messageContent.toLowerCase().includes(keyword)
      );

      if (isWorkflowRequest && messageContent.length > 10) {
        // Use workflow construction capabilities
        setIsTyping(true);
        try {
          // Analyze the description to determine workflow type and components
          const workflowType = analyzeWorkflowType(messageContent);
          const nodes = generateWorkflowNodes(workflowType, messageContent);
          const connections = generateConnections(nodes);

          // Create the workflow
          const workflowData = {
            name: generateWorkflowName(messageContent),
            description: messageContent,
            category: workflowType.category,
            tags: workflowType.tags,
            nodes: nodes,
            connections: connections,
            config: { autoExecute: false, quantumEnabled: true },
            isPublic: false
          };

          console.log('Creating workflow:', workflowData);
          const response = await persistentWorkflowService.saveWorkflow(workflowData);
          console.log('Workflow creation response:', response);

          const resultMessage = response.status === 'success'
            ? `✅ Successfully created a ${workflowType.category} workflow called "${response.result?.name}" with ${nodes.length} nodes. You can find it in your workflow library.`
            : `❌ Failed to create workflow: ${response.message || 'Unknown error'}. Please try again.`;

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: resultMessage,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
          console.error('Workflow construction error:', error);
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: `❌ I encountered an error while creating the workflow: ${error instanceof Error ? error.message : 'Unknown error'}. Please try rephrasing your request or contact support.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      } else {
        // Use Constructor AI for general assistance
        let assistantMessage: Message;

        if (forceOnline && !isOnline) {
          // Demo mode - provide helpful responses without backend
          const demoResponses = [
            "I understand you're looking for assistance with quantum workflows. While I'm in demo mode, I can still help you understand concepts and plan your automation strategies.",
            "That's an interesting request! In demo mode, I can guide you through quantum workflow concepts and best practices.",
            "Great question! Even in demo mode, I can provide insights about quantum computing, AI optimization, and workflow automation.",
            "I see what you're asking about. Let me help you understand this quantum workflow concept...",
            "That's a smart approach! In demo mode, I can walk you through the theoretical aspects of this workflow type."
          ];

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: demoResponses[Math.floor(Math.random() * demoResponses.length)],
            timestamp: new Date()
          };
        } else {
          const response = await aiAssistantService.constructorQuery(messageContent, {
            app_context: 'quantumforge_workflow_automation',
            user_level: 'intermediate',
            available_features: [
              'workflow_creation',
              'quantum_computing',
              'machine_learning',
              'optimization',
              'security_analysis'
            ]
          });

          assistantMessage = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: response.status === 'success'
              ? (response.result?.response || 'I understand. Let me help you with that.')
              : `I encountered an issue: ${response.message || 'Unknown error'}`,
            timestamp: new Date(),
            quantumSimilarity: response.quantum_similarity
          };
        }

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    onToggleMinimize?.();
  };

  const clearConversation = () => {
    setMessages([{
      id: 'welcome',
      type: 'assistant',
      content: 'Conversation cleared. How can I help you with your quantum workflows today?',
      timestamp: new Date()
    }]);
  };

  // Workflow Construction Helper Functions
  const analyzeWorkflowType = (description: string) => {
    const desc = description.toLowerCase();

    if (desc.includes('data') && desc.includes('process')) {
      return { category: 'Data Processing', tags: ['data', 'processing', 'automation'] };
    } else if (desc.includes('ai') || desc.includes('machine learning') || desc.includes('ml')) {
      return { category: 'AI/ML', tags: ['ai', 'ml', 'intelligence'] };
    } else if (desc.includes('quantum') || desc.includes('qkd') || desc.includes('encryption')) {
      return { category: 'Quantum Security', tags: ['quantum', 'security', 'encryption'] };
    } else if (desc.includes('social') || desc.includes('twitter') || desc.includes('linkedin')) {
      return { category: 'Social Media', tags: ['social', 'marketing', 'content'] };
    } else if (desc.includes('business') || desc.includes('workflow') || desc.includes('process')) {
      return { category: 'Business Process', tags: ['business', 'process', 'automation'] };
    } else if (desc.includes('api') || desc.includes('integration') || desc.includes('webhook')) {
      return { category: 'API Integration', tags: ['api', 'integration', 'webhook'] };
    } else {
      return { category: 'General Automation', tags: ['automation', 'workflow'] };
    }
  };

  const generateWorkflowNodes = (workflowType: any, description: string) => {
    const nodes = [];
    let nodeId = 1;

    // Always start with an input node
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'input',
      position: { x: 100, y: 100 },
      data: {
        label: 'Input',
        config: { inputType: 'text', required: true }
      }
    });

    // Add processing nodes based on workflow type
    switch (workflowType.category) {
      case 'Data Processing':
        nodes.push({
          id: `node-${nodeId++}`,
          type: 'process',
          position: { x: 300, y: 100 },
          data: {
            label: 'Process Data',
            config: { operation: 'transform', quantumEnabled: true }
          }
        });
        break;
      case 'AI/ML':
        nodes.push({
          id: `node-${nodeId++}`,
          type: 'ai',
          position: { x: 300, y: 100 },
          data: {
            label: 'AI Processing',
            config: { model: 'quantum-enhanced', task: 'analysis' }
          }
        });
        break;
      case 'Quantum Security':
        nodes.push({
          id: `node-${nodeId++}`,
          type: 'quantum',
          position: { x: 300, y: 100 },
          data: {
            label: 'Quantum Encryption',
            config: { protocol: 'bb84', keyLength: 256 }
          }
        });
        break;
      case 'Social Media':
        nodes.push({
          id: `node-${nodeId++}`,
          type: 'social',
          position: { x: 300, y: 100 },
          data: {
            label: 'Social Post',
            config: { platform: 'twitter', content: 'Generated content' }
          }
        });
        break;
      default:
        nodes.push({
          id: `node-${nodeId++}`,
          type: 'process',
          position: { x: 300, y: 100 },
          data: {
            label: 'Process',
            config: { operation: 'custom' }
          }
        });
    }

    // Add output node
    nodes.push({
      id: `node-${nodeId++}`,
      type: 'output',
      position: { x: 500, y: 100 },
      data: {
        label: 'Output',
        config: { outputType: 'result', saveResults: true }
      }
    });

    return nodes;
  };

  const generateConnections = (nodes: any[]) => {
    const connections = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      connections.push({
        id: `connection-${i + 1}`,
        source: nodes[i].id,
        target: nodes[i + 1].id,
        sourceHandle: 'output',
        targetHandle: 'input'
      });
    }
    return connections;
  };

  const generateWorkflowName = (description: string) => {
    // Extract key terms from description for workflow name
    const words = description.split(' ').slice(0, 4);
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Workflow';
  };

  return (
    <div
      className={`constructor-ai ${isExpanded ? 'expanded' : 'minimized'}`}
      style={{
        width: isExpanded ? '360px' : '40px',
        height: isExpanded ? '560px' : '40px'
      }}
    >
      {/* Header */}
      <div className="constructor-header" onClick={toggleExpanded}>
        <div className="constructor-title">
          <div className="constructor-icon">
            <div className="quantum-brain">🧠</div>
            <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}></div>
          </div>
          <div className="constructor-info">
            <h3>Constructor AI</h3>
            <span className="status-text">
              {isOnline ? 'Online - Ready to assist' : forceOnline ? 'Demo Mode - Ready to assist' : 'Offline - Connecting...'}
            </span>
          </div>
        </div>
        <div className="constructor-controls">
          {isExpanded && (
            <>
              <button
                className="control-btn clear-btn"
                onClick={(e) => { e.stopPropagation(); clearConversation(); }}
                title="Clear conversation"
              >
                🗑️
              </button>
              <button
                className="control-btn force-online-btn"
                onClick={(e) => { e.stopPropagation(); setForceOnline(!forceOnline); }}
                title={forceOnline ? "Disable demo mode" : "Enable demo mode"}
              >
                {forceOnline ? '🔴' : '🟢'}
              </button>
            </>
          )}
          <button
            className="control-btn toggle-btn"
            onClick={(e) => { e.stopPropagation(); toggleExpanded(); }}
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Chat Interface */}
      {isExpanded && (
        <div className="constructor-chat">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-avatar">
                  {message.type === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  {message.quantumSimilarity && (
                    <div className="quantum-similarity">
                      Quantum Similarity: {(message.quantumSimilarity * 100).toFixed(1)}%
                    </div>
                  )}
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message assistant-message typing">
                <div className="message-avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={(isOnline || forceOnline) ? "Ask Constructor anything..." : "Constructor is offline..."}
                disabled={(!isOnline && !forceOnline) || isTyping}
                className="message-input"
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || (!isOnline && !forceOnline) || isTyping}
                title="Send message"
              >
                {isTyping ? '⏳' : '📤'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => setInputValue("Help me create a quantum workflow")}
                disabled={!isOnline}
              >
                ⚡ Workflow
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setInputValue("Optimize this process")}
                disabled={!isOnline}
              >
                🎯 Optimize
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setInputValue("Explain quantum computing")}
                disabled={!isOnline}
              >
                🧠 Learn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capabilities Indicator */}
      {isExpanded && (
        <div className="constructor-capabilities">
          <div className="capability-tags">
            <span className="capability-tag">🤖 AI Reasoning</span>
            <span className="capability-tag">⚛️ Quantum Computing</span>
            <span className="capability-tag">🎯 Optimization</span>
            <span className="capability-tag">🔒 Security Analysis</span>
            <span className="capability-tag">📊 ML Training</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Constructor;