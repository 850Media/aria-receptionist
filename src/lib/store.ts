// In-memory store for agent sessions (good enough for demo/hackathon)
// In production this would be a database

interface AgentSession {
  businessName: string
  endpoint: string
  apiKey: string
  kbUuid: string
  createdAt: number
}

const store = new Map<string, AgentSession>()

export function saveSession(id: string, session: AgentSession) {
  store.set(id, session)
}

export function getSession(id: string): AgentSession | undefined {
  return store.get(id)
}
