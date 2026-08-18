export interface Agent {
  id: string;
  app_name: string;
  app_description: string;
  app_logo: string;
  provider: Provider;
}

export interface WorkflowAgent {
  id: string;
  agentId: string;
  position: number;
  app_name: string;
  app_description: string;
}

export interface Provider {
  organization: string;
}
