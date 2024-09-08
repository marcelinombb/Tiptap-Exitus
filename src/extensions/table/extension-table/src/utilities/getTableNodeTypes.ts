import { type NodeType, type Schema } from '@tiptap/pm/model'

export function getTableNodeTypes(schema: Schema): Record<string, NodeType> {
  if (schema.cached.tableNodeTypes) {
    return schema.cached.tableNodeTypes
  }

  const roles: Record<string, NodeType> = {}

  Object.keys(schema.nodes).forEach(type => {
    const nodeType = schema.nodes[type]

    if (nodeType.spec.tableRole) {
      roles[nodeType.spec.tableRole] = nodeType
    }
  })

  schema.cached.tableNodeTypes = roles

  return roles
}
