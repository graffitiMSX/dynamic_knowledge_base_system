import { Topic } from '../models/Topic';

interface TopicNode {
  topic: Topic;
  children: TopicNode[];
}

export class TopicHierarchyService {
  constructor(private topics: Map<string, Topic>) {}

  buildHierarchy(rootTopicId?: string): TopicNode[] {
    const topicArray = Array.from(this.topics.values());
    const rootTopics = rootTopicId 
      ? [this.topics.get(rootTopicId)].filter(Boolean)
      : topicArray.filter(topic => !topic.parentTopicId);

    return rootTopics.map(topic => this.buildTopicTree(topic!));
  }

  findShortestPath(startTopicId: string, endTopicId: string): Topic[] {
    const visited = new Set<string>();
    const queue: { topicId: string; path: Topic[] }[] = [];
    const startTopic = this.topics.get(startTopicId);

    if (!startTopic) return [];
    queue.push({ topicId: startTopicId, path: [startTopic] });
    visited.add(startTopicId);

    while (queue.length > 0) {
      const { topicId, path } = queue.shift()!;
      if (topicId === endTopicId) return path;

      const neighbors = this.getNeighborTopics(topicId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push({
            topicId: neighbor.id,
            path: [...path, neighbor]
          });
        }
      }
    }

    return [];
  }

  private buildTopicTree(topic: Topic): TopicNode {
    const children = Array.from(this.topics.values())
      .filter(t => t.parentTopicId === topic.id)
      .map(childTopic => this.buildTopicTree(childTopic));

    return {
      topic,
      children
    };
  }
  private getNeighborTopics(topicId: string): Topic[] {
    const topic = this.topics.get(topicId);
    if (!topic) return [];
  
    const neighbors: Topic[] = [];
    
    // First add parent if exists
    if (topic.parentTopicId) {
      const parent = this.topics.get(topic.parentTopicId);
      if (parent) {
        neighbors.push(parent);
      }
    }
  
    // Then add children
    const children = Array.from(this.topics.values())
      .filter(t => t.parentTopicId === topicId);
    neighbors.push(...children);
  
    // Don't add siblings directly - they will be reached through parent
  
    return neighbors;
  }
}