# Domain Model

## Entities

- `Project`
- `Task`
- `AIGeneratedTask`

## Attributes and Operations

### `Project`

- $Id: string
- User Id: string
- Name: string
- Color Name: string
- Color Hex: string
- Tasks: Task[] | null
- $Created At: datetime
- $Updated At: datetime
- `create(data)`
- `update(projectId, data)`
- `delete(projectId)`
- `search(searchQuery)`
- `findById(projectId)`
- `findRecent(limit)`

### `Task`

- $Id: string
- Content: string
- Completed: boolean
- Due Date: datetime
- User Id: string
- Project Id: Project | null
- $Created At: datetime
- $Updated At: datetime
- `createMany(projectId, tasks)`
- `create(data)`
- `update(taskId, data)`
- `delete(taskId)`
- `toggleComplete(taskId, completed)`
- `countInboxTasks()`
- `countTodayTasks()`
- `countTasks()`
- `findUpcomingTasks()`
- `findTodayTasks()`
- `findInboxTasks()`
- `findCompletedTasks()`

### `AIGeneratedTask`

- Content: string
- Completed: boolean
- Due Date: datetime
- `generateProjectTasks(prompt)`

## Class Diagram

![Class Diagram](/public/documentation/class-diagram.png)
