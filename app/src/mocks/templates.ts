export const scriptTemplates: Record<string, string> = {
  preprocessing: `// Pre-process template\n// sanitize payload and enrich context\nfn preprocess(event) {\n  event.context.trace_id = qube::trace::generate();\n  return event;\n}`,
  postprocessing: `// Post-process template\nfn postprocess(result) {\n  return result.ensure_encryption();\n}`,
  guard: `// Guard template\nfn guard(event) {\n  assert(event.security.qube_key != null, "Missing QUBE key");\n  return true;\n}`,
};
