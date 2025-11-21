import { Workflow } from '../types';

const sanitize = (value: string) => value.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

export const workflowToAeonmi = (workflow: Workflow): string => {
  const header = `flow ${sanitize(workflow.name)} {`;
  const nodes = workflow.nodes
    .map((node) => {
      const configEntries = Object.entries(node.config ?? {}).map(
        ([key, val]) => `    ${key}: ${JSON.stringify(val)}`,
      );
      const portsIn = node.ports
        .filter((port) => port.direction === 'in')
        .map((port) => `    in ${port.id}`);
      const portsOut = node.ports
        .filter((port) => port.direction === 'out')
        .map((port) => `    out ${port.id}`);

      const microAI = node.microAIConfig
        ? [
            '    micro_ai {',
            `      model: "${node.microAIConfig.model}"`,
            `      temperature: ${node.microAIConfig.temperature}`,
            node.microAIConfig.systemPrompt
              ? `      system_prompt: ${JSON.stringify(node.microAIConfig.systemPrompt)}`
              : undefined,
            node.microAIConfig.costLimitUsd
              ? `      cost_limit_usd: ${node.microAIConfig.costLimitUsd}`
              : undefined,
            '    }',
          ]
            .filter(Boolean)
            .join('\n')
        : undefined;

      return [
        `  node ${sanitize(node.id)} {`,
        `    kind: ${node.type}`,
        `    title: "${node.title}"`,
        ...portsIn,
        ...portsOut,
        ...configEntries,
        microAI,
        '  }',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  const edges = workflow.edges
    .map(
      (edge) =>
        `  link ${sanitize(edge.id)} { from: ${sanitize(edge.from.nodeId)}.${edge.from.portId}; to: ${sanitize(edge.to.nodeId)}.${edge.to.portId}; }`,
    )
    .join('\n');
  const policy = workflow.evolutionPolicy
    ? [
        '  evolve {',
        `    enabled: ${workflow.evolutionPolicy.enabled}`,
        `    max_variants: ${workflow.evolutionPolicy.maxVariants}`,
        `    optimize: ${workflow.evolutionPolicy.kpiPrimary}`,
        `    must_use_qube_security: ${workflow.evolutionPolicy.constraints.mustUseQubeSecurity}`,
        workflow.evolutionPolicy.constraints.maxLatencyMs
          ? `    max_latency_ms: ${workflow.evolutionPolicy.constraints.maxLatencyMs}`
          : undefined,
        workflow.evolutionPolicy.constraints.forbiddenIntegrations?.length
          ? `    forbid: [${workflow.evolutionPolicy.constraints.forbiddenIntegrations
              .map((item) => `"${item}"`)
              .join(', ')}]`
          : undefined,
        '  }',
      ]
        .filter(Boolean)
        .join('\n')
    : '';
  const footer = '}';

  return [header, nodes, edges, policy, footer]
    .filter((segment) => segment.length)
    .join('\n');
};

export default workflowToAeonmi;
