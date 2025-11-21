// src/services/AeonmiCompilerService.ts

import { Workflow, NodeType } from '../types';

/** Converts workflow graphs to Aeonmi.ai program strings. */
export class AeonmiCompilerService {
  /** Maps node types to Aeonmi actions. */
  private static nodeTypeToAeonmi(nodeType: NodeType): string {
    switch (nodeType) {
      case 'TRIGGER_HTTP': return 'http_trigger';
      case 'TRIGGER_SCHEDULE': return 'schedule_trigger';
      case 'ACTION_HTTP': return 'http_action';
      case 'ACTION_DB': return 'db_action';
      case 'ACTION_EMAIL': return 'email_action';
      case 'LOGIC_CONDITION': return 'condition';
      case 'LOGIC_SWITCH': return 'switch';
      case 'AI_AGENT': return 'ai_agent';
      case 'QUBE_KEY': return 'qube_key';
      case 'QUBE_COMPUTE': return 'qube_compute';
      case 'TITAN_OPTIMIZER': return 'titan_optimizer';
      case 'META_EVOLVER': return 'meta_evolver';
      case 'UTIL_TRANSFORM': return 'transform';
      default: return 'unknown';
    }
  }

  /** Compiles a workflow to Aeonmi source code. */
  static workflowToAeonmi(workflow: Workflow): string {
    const lines: string[] = [];
    lines.push(`// Aeonmi.ai workflow: ${workflow.name}`);
    lines.push(`workflow ${workflow.id} {`);

    // Process nodes in topological order (simplified).
    for (const node of workflow.nodes) {
      const action = this.nodeTypeToAeonmi(node.type);
      lines.push(`  ${action} ${node.id} {`);
      if (node.config) {
        for (const [key, value] of Object.entries(node.config)) {
          lines.push(`    ${key}: ${JSON.stringify(value)};`);
        }
      }
      lines.push(`  }`);
    }

    // Process edges as connections.
    for (const edge of workflow.edges) {
      lines.push(`  connect ${edge.source} -> ${edge.target};`);
    }

    lines.push(`}`);
    return lines.join('\n');
  }

  /** Validates Aeonmi syntax (placeholder). */
  static validateAeonmi(source: string): boolean {
    // TODO: Integrate with Aeonmi compiler.
    return source.includes('workflow');
  }
}