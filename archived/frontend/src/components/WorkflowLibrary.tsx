import React, { useState, useEffect } from 'react';
import persistentWorkflowService, { SavedWorkflow, WorkflowTemplate } from '../services/persistentWorkflowService';
import userService from '../services/userService';
import './WorkflowLibrary.css';

const WorkflowLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [workflows, setWorkflows] = useState<SavedWorkflow[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user workflows
        if (userService.getCurrentUser()) {
          const workflowResponse = await persistentWorkflowService.getUserWorkflows();
          if (workflowResponse.status === 'success' && workflowResponse.result) {
            setWorkflows(workflowResponse.result);
          }
        }

        // Load templates
        const templateResponse = await persistentWorkflowService.getTemplates();
        if (templateResponse.status === 'success' && templateResponse.result) {
          setTemplates(templateResponse.result);
        }
      } catch (error) {
        console.error('Failed to load workflows and templates:', error);
      }
    };

    loadData();
  }, []);

  const categories = [
    { id: 'all', name: 'All Templates', count: 24 },
    { id: 'quantum', name: 'Quantum Computing', count: 8 },
    { id: 'ai', name: 'AI & ML', count: 6 },
    { id: 'automation', name: 'Workflow Automation', count: 5 },
    { id: 'security', name: 'Security', count: 3 },
    { id: 'data', name: 'Data Processing', count: 2 }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === 'all' || workflow.category === selectedCategory;
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLoadTemplate = async (templateId: string) => {
    try {
      const response = await persistentWorkflowService.createFromTemplate(templateId);
      if (response.status === 'success' && response.result) {
        setWorkflows(prev => [...prev, response.result!]);
        alert(`Template loaded successfully! ID: ${response.result.id}`);
      } else {
        alert('Failed to load template');
      }
    } catch (error) {
      console.error('Error loading template:', error);
      alert('Error loading template: ' + (error as Error).message);
    }
  };

  const getComplexityColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#00ff00';
      case 'intermediate': return '#ffa500';
      case 'advanced': return '#ff4444';
      default: return '#666666';
    }
  };

  return (
    <div className="workflow-library">
      <div className="library-header">
        <h1>Workflow Library</h1>
        <p>Pre-built quantum and AI workflow templates</p>
      </div>

      <div className="library-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
              <span className="category-count">({category.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <div className="template-icon">{template.thumbnail || '📄'}</div>
              <div className="template-meta">
                <span
                  className="complexity-badge"
                  style={{ backgroundColor: getComplexityColor(template.difficulty) }}
                >
                  {template.difficulty}
                </span>
              </div>
            </div>

            <div className="template-content">
              <h3>{template.name}</h3>
              <p>{template.description}</p>

              <div className="template-tags">
                {template.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <div className="template-footer">
                <div className="template-stats">
                  <span>⏱️ {template.estimatedTime} min</span>
                  <span>📥 {template.downloads} downloads</span>
                </div>
                <button
                  className="use-template-btn"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredWorkflows.length > 0 && (
          <>
            <div className="section-divider">
              <h2>My Workflows ({filteredWorkflows.length})</h2>
            </div>
            {filteredWorkflows.map(workflow => (
              <div key={workflow.id} className="template-card user-workflow">
                <div className="template-header">
                  <div className="template-icon">📋</div>
                </div>
                <div className="template-content">
                  <h3>{workflow.name}</h3>
                  <p>{workflow.description}</p>
                  <div className="template-tags">
                    {workflow.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="template-footer">
                    <div className="template-stats">
                      <span>🔗 {workflow.nodes.length} nodes</span>
                      <span>📅 {new Date(workflow.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      className="use-template-btn"
                      onClick={() => alert(`Loading workflow: ${workflow.name}`)}
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {filteredTemplates.length === 0 && filteredWorkflows.length === 0 && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>No templates found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowLibrary;