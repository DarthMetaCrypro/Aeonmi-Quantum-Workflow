import { Edge, Node, Workflow } from '../types';

export type ValidationIssue = {
  code: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

const isTriggerNode = (node: Node) => node.type.startsWith('TRIGGER_');
const isActionNode = (node: Node) => node.type.startsWith('ACTION_');
const isQuantumNode = (node: Node) => node.type.startsWith('QUBE_');

const buildAdjacency = (nodes: Node[], edges: Edge[]) => {
  const outgoing = new Map<string, Edge[]>();
  const incomingCount = new Map<string, number>();
  nodes.forEach((node) => {
    outgoing.set(node.id, []);
    incomingCount.set(node.id, 0);
  });
  edges.forEach((edge) => {
    outgoing.get(edge.from.nodeId)?.push(edge);
    incomingCount.set(edge.to.nodeId, (incomingCount.get(edge.to.nodeId) ?? 0) + 1);
  });
  return { outgoing, incomingCount };
};

const detectCycle = (nodes: Node[], edges: Edge[]): boolean => {
  const { outgoing } = buildAdjacency(nodes, edges);
  const visited = new Set<string>();
  const stack = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    if (stack.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }
    visited.add(nodeId);
    stack.add(nodeId);
    const nextEdges = outgoing.get(nodeId) ?? [];
    for (const edge of nextEdges) {
      if (dfs(edge.to.nodeId)) {
        return true;
      }
    }
    stack.delete(nodeId);
    return false;
  };

  for (const node of nodes) {
    if (dfs(node.id)) {
      return true;
    }
  }
  return false;
};

const validatePorts = (nodes: Node[], edges: Edge[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of edges) {
    const fromNode = nodeMap.get(edge.from.nodeId);
    const toNode = nodeMap.get(edge.to.nodeId);
    if (!fromNode || !toNode) {
      issues.push({
        code: 'missing-node',
        message: 'Edge references missing node',
        edgeId: edge.id,
      });
      continue;
    }
    const fromPort = fromNode.ports.find((port) => port.id === edge.from.portId);
    const toPort = toNode.ports.find((port) => port.id === edge.to.portId);
    if (!fromPort || !toPort) {
      issues.push({
        code: 'missing-port',
        message: 'Edge references missing port',
        edgeId: edge.id,
      });
      continue;
    }
    if (fromPort.direction !== 'out') {
      issues.push({
        code: 'invalid-port-direction',
        message: `Port ${fromPort.id} on ${fromNode.title} must be an output`,
        edgeId: edge.id,
        nodeId: fromNode.id,
      });
    }
    if (toPort.direction !== 'in') {
      issues.push({
        code: 'invalid-port-direction',
        message: `Port ${toPort.id} on ${toNode.title} must be an input`,
        edgeId: edge.id,
        nodeId: toNode.id,
      });
    }
  }
  return issues;
};

const validateInputs = (nodes: Node[], edges: Edge[]): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  const incoming = new Map<string, number>();
  edges.forEach((edge) => {
    incoming.set(edge.to.nodeId, (incoming.get(edge.to.nodeId) ?? 0) + 1);
  });
  nodes
    .filter((node) => !isTriggerNode(node))
    .forEach((node) => {
      const requiredInputs = node.ports.filter((port) => port.direction === 'in');
      if (!requiredInputs.length) {
        return;
      }
      const received = incoming.get(node.id) ?? 0;
      if (received < requiredInputs.length) {
        issues.push({
          code: 'unconnected-input',
          message: `${node.title} is missing required inputs`,
          nodeId: node.id,
        });
      }
    });
  return issues;
};

const validateQuantumConstraint = (workflow: Workflow): ValidationIssue[] => {
  const policy = workflow.evolutionPolicy;
  if (!policy?.constraints.mustUseQubeSecurity) {
    return [];
  }
  const quantumNodes = new Set(
    workflow.nodes.filter(isQuantumNode).map((node) => node.id),
  );
  if (!quantumNodes.size) {
    return [
      {
        code: 'missing-quantum',
        message: 'QUBE security required but no quantum nodes found',
      },
    ];
  }

  const adjacency = new Map<string, string[]>();
  workflow.edges.forEach((edge) => {
    const neighbors = adjacency.get(edge.from.nodeId) ?? [];
    neighbors.push(edge.to.nodeId);
    adjacency.set(edge.from.nodeId, neighbors);
  });

  const triggers = workflow.nodes.filter(isTriggerNode);
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; quantumSeen: boolean }> = triggers.map(
    (trigger) => ({
      nodeId: trigger.id,
      quantumSeen: quantumNodes.has(trigger.id),
    }),
  );
  const insecureTargets = new Set<string>();

  while (queue.length) {
    const { nodeId, quantumSeen } = queue.shift()!;
    if (visited.has(nodeId)) {
      continue;
    }
    visited.add(nodeId);
    const node = workflow.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) {
      continue;
    }
    const nextQuantumSeen = quantumSeen || quantumNodes.has(nodeId);
    if (isActionNode(node) && !nextQuantumSeen) {
      insecureTargets.add(nodeId);
    }
    const neighbors = adjacency.get(nodeId) ?? [];
    neighbors.forEach((neighborId) => {
      queue.push({ nodeId: neighborId, quantumSeen: nextQuantumSeen });
    });
  }

  if (!insecureTargets.size) {
    return [];
  }

  return Array.from(insecureTargets).map((nodeId) => ({
    code: 'quantum-policy',
    message: 'Action path requires QUBE security before publication/download.',
    nodeId,
  }));
};

export const validateWorkflow = (workflow: Workflow): ValidationResult => {
  const issues: ValidationIssue[] = [];
  if (detectCycle(workflow.nodes, workflow.edges)) {
    issues.push({ code: 'cycle-detected', message: 'Graph contains a cycle' });
  }
  issues.push(...validatePorts(workflow.nodes, workflow.edges));
  issues.push(...validateInputs(workflow.nodes, workflow.edges));
  issues.push(...validateQuantumConstraint(workflow));
  return { valid: issues.length === 0, issues };
};
