const tips = [
  // Core Object Management
  'Create an object and assign multiple types - a person can be both a developer and entrepreneur',
  'Use tags to quickly categorize and filter objects across different types',
  'Add rich text facts to objects with @mentions to create connections',
  'Track object progress through custom funnels with defined steps and actions',
  'Use sub-status within funnel steps for more granular progress tracking',

  // Advanced Search & Filter
  'Use the global search (Ctrl+K) to quickly find objects, facts, tasks, or team members',
  'Save your frequent search filters as personal views for quick access',
  'Filter objects by multiple tags, types, and funnel stages simultaneously',
  'Search through rich text facts and type values with full-text search',
  'Sort objects by fact count, creation date, or custom type fields',

  // Task Management
  'Create tasks and assign them to team members with deadlines',
  'Link tasks to multiple related objects for better context',
  'Track task progress with todo, doing, paused, and completed statuses',
  'Set task reminders to stay on top of deadlines',
  'View all tasks related to a specific object in its detail page',

  // Collaboration
  'Share your saved views with team members',
  'Mention team members in facts and tasks with @username',
  "Check your feed for recent updates on objects you're following",
  'Track unseen updates with the notification counter',
  'Collaborate on objects across different organizational roles',

  // Data Organization
  'Create custom object types with specific fields for your needs',
  'Import data in bulk using CSV files with ID strings',
  'Export filtered object lists for reporting',
  'Use location tracking in facts for geographical context',
  'Create multiple funnels for different business processes',

  // Advanced Features
  'Use the advanced filter to combine multiple search criteria',
  'Create dashboards by saving complex filter combinations',
  'Track object history through the activity feed',
  'Use templated lists to standardize object views',
  'Customize sub-statuses in funnel steps for detailed progress tracking',
];

export const getRandomTip = () => {
  return tips[Math.floor(Math.random() * tips.length)];
};

export const getAllTips = () => {
  return tips;
};
