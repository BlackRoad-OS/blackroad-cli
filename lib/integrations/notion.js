/**
 * BlackRoad OS - Notion Integration
 * Full API integration for documentation and knowledge base
 */

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

class NotionIntegration {
  constructor(token = process.env.NOTION_TOKEN) {
    this.token = token;
    this.deploymentsDb = process.env.NOTION_DEPLOYMENTS_DB;
    this.incidentsDb = process.env.NOTION_INCIDENTS_DB;
    this.agentsDb = process.env.NOTION_AGENTS_DB;
  }

  /**
   * Make authenticated request to Notion API
   */
  async request(endpoint, method = 'GET', body = null) {
    const url = `${NOTION_API_BASE}${endpoint}`;

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Notion API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a page in a database
   */
  async createDatabasePage(databaseId, properties, children = []) {
    return this.request('/pages', 'POST', {
      parent: { database_id: databaseId },
      properties,
      children
    });
  }

  /**
   * Query a database
   */
  async queryDatabase(databaseId, filter = null, sorts = null) {
    const body = {};
    if (filter) body.filter = filter;
    if (sorts) body.sorts = sorts;

    return this.request(`/databases/${databaseId}/query`, 'POST', body);
  }

  /**
   * Get a page
   */
  async getPage(pageId) {
    return this.request(`/pages/${pageId}`);
  }

  /**
   * Update page properties
   */
  async updatePage(pageId, properties) {
    return this.request(`/pages/${pageId}`, 'PATCH', { properties });
  }

  /**
   * Log deployment to Notion database
   */
  async logDeployment({ platform, version, status, commitSha, duration, services = [] }) {
    const properties = {
      'Name': {
        title: [{ text: { content: `${platform} Deploy - v${version}` } }]
      },
      'Platform': {
        select: { name: platform }
      },
      'Version': {
        rich_text: [{ text: { content: version } }]
      },
      'Status': {
        select: { name: status }
      },
      'Commit': {
        rich_text: [{ text: { content: commitSha } }]
      },
      'Duration': {
        number: duration
      },
      'Date': {
        date: { start: new Date().toISOString() }
      },
      'Services': {
        multi_select: services.map(s => ({ name: s }))
      }
    };

    const children = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'Deployment Details' } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Platform: ${platform}` } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Version: ${version}` } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Commit: ${commitSha}` } }]
        }
      },
      {
        object: 'block',
        type: 'bulleted_list_item',
        bulleted_list_item: {
          rich_text: [{ text: { content: `Duration: ${duration}s` } }]
        }
      }
    ];

    return this.createDatabasePage(this.deploymentsDb, properties, children);
  }

  /**
   * Log incident to Notion database
   */
  async logIncident({ title, severity, description, affectedServices = [], rootCause = null }) {
    const properties = {
      'Name': {
        title: [{ text: { content: title } }]
      },
      'Severity': {
        select: { name: severity }
      },
      'Status': {
        select: { name: 'Open' }
      },
      'Affected Services': {
        multi_select: affectedServices.map(s => ({ name: s }))
      },
      'Created': {
        date: { start: new Date().toISOString() }
      }
    };

    const children = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'Incident Report' } }]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: description } }]
        }
      }
    ];

    if (rootCause) {
      children.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [{ text: { content: 'Root Cause' } }]
        }
      });
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: rootCause } }]
        }
      });
    }

    return this.createDatabasePage(this.incidentsDb, properties, children);
  }

  /**
   * Log agent activity to Notion
   */
  async logAgentActivity({ agentName, taskId, action, result, duration }) {
    const properties = {
      'Name': {
        title: [{ text: { content: `${agentName} - ${action}` } }]
      },
      'Agent': {
        select: { name: agentName }
      },
      'Task ID': {
        rich_text: [{ text: { content: taskId } }]
      },
      'Action': {
        select: { name: action }
      },
      'Result': {
        select: { name: result }
      },
      'Duration': {
        number: duration
      },
      'Timestamp': {
        date: { start: new Date().toISOString() }
      }
    };

    return this.createDatabasePage(this.agentsDb, properties);
  }

  /**
   * Get recent deployments
   */
  async getRecentDeployments(limit = 10) {
    return this.queryDatabase(this.deploymentsDb, null, [
      { property: 'Date', direction: 'descending' }
    ]);
  }

  /**
   * Get open incidents
   */
  async getOpenIncidents() {
    return this.queryDatabase(this.incidentsDb, {
      property: 'Status',
      select: { equals: 'Open' }
    });
  }

  /**
   * Search Notion workspace
   */
  async search(query, filter = null) {
    const body = { query };
    if (filter) body.filter = filter;
    return this.request('/search', 'POST', body);
  }
}

// Export singleton instance
export const notion = new NotionIntegration();
export default NotionIntegration;
