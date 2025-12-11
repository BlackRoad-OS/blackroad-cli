/**
 * BlackRoad OS - Asana Integration
 * Full API integration for project management
 */

const ASANA_API_BASE = 'https://app.asana.com/api/1.0';

class AsanaIntegration {
  constructor(token = process.env.ASANA_TOKEN) {
    this.token = token;
    this.workspaceId = process.env.ASANA_WORKSPACE_ID;
    this.projectId = process.env.ASANA_PROJECT_ID;
  }

  /**
   * Make authenticated request to Asana API
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${ASANA_API_BASE}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (body) {
      options.body = JSON.stringify({ data: body });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Asana API Error: ${error.errors?.[0]?.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get current user info
   */
  async getMe() {
    const { data } = await this.request('/users/me');
    return data;
  }

  /**
   * List all projects in workspace
   */
  async listProjects() {
    const { data } = await this.request(`/workspaces/${this.workspaceId}/projects`);
    return data;
  }

  /**
   * Create a new task
   */
  async createTask({ name, notes, dueDate, assignee, tags = [], projectId = null }) {
    const taskData = {
      name,
      notes,
      projects: [projectId || this.projectId],
      workspace: this.workspaceId
    };

    if (dueDate) taskData.due_on = dueDate;
    if (assignee) taskData.assignee = assignee;
    if (tags.length) taskData.tags = tags;

    const { data } = await this.request('/tasks', 'POST', taskData);
    return data;
  }

  /**
   * Update a task
   */
  async updateTask(taskId, updates) {
    const { data } = await this.request(`/tasks/${taskId}`, 'PUT', updates);
    return data;
  }

  /**
   * Complete a task
   */
  async completeTask(taskId) {
    return this.updateTask(taskId, { completed: true });
  }

  /**
   * Add comment to task
   */
  async addComment(taskId, text) {
    const { data } = await this.request(`/tasks/${taskId}/stories`, 'POST', { text });
    return data;
  }

  /**
   * Get tasks by project
   */
  async getProjectTasks(projectId = null) {
    const pid = projectId || this.projectId;
    const { data } = await this.request(`/projects/${pid}/tasks?opt_fields=name,completed,due_on,assignee`);
    return data;
  }

  /**
   * Create deployment task with standardized format
   */
  async createDeploymentTask({ platform, version, status, commitSha }) {
    const name = `[Deploy] ${platform} - v${version}`;
    const notes = `
## Deployment Details

- **Platform:** ${platform}
- **Version:** ${version}
- **Status:** ${status}
- **Commit:** ${commitSha}
- **Timestamp:** ${new Date().toISOString()}

## Checklist
- [ ] Pre-deployment checks passed
- [ ] Deployment completed
- [ ] Post-deployment verification
- [ ] Documentation updated
    `.trim();

    return this.createTask({
      name,
      notes,
      tags: ['deployment', platform.toLowerCase()]
    });
  }

  /**
   * Log build failure
   */
  async createBuildFailureTask({ service, error, buildUrl }) {
    const name = `[Build Failed] ${service}`;
    const notes = `
## Build Failure

- **Service:** ${service}
- **Error:** ${error}
- **Build URL:** ${buildUrl}
- **Timestamp:** ${new Date().toISOString()}

## Action Required
Investigate and fix the build failure.
    `.trim();

    return this.createTask({
      name,
      notes,
      tags: ['bug', 'build-failure', 'urgent']
    });
  }

  /**
   * Create security alert task
   */
  async createSecurityAlertTask({ severity, title, description, cve = null }) {
    const name = `[Security ${severity.toUpperCase()}] ${title}`;
    const notes = `
## Security Alert

- **Severity:** ${severity}
- **Title:** ${title}
- **CVE:** ${cve || 'N/A'}
- **Detected:** ${new Date().toISOString()}

## Description
${description}

## Action Required
Investigate and remediate immediately.
    `.trim();

    return this.createTask({
      name,
      notes,
      tags: ['security', `severity-${severity.toLowerCase()}`]
    });
  }

  /**
   * Setup webhook for real-time updates
   */
  async createWebhook(resourceId, targetUrl) {
    const { data } = await this.request('/webhooks', 'POST', {
      resource: resourceId,
      target: targetUrl
    });
    return data;
  }
}

// Export singleton instance
export const asana = new AsanaIntegration();
export default AsanaIntegration;
