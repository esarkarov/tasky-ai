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

## Mermaid Live URL

https://mermaid.live/edit#pako:eNqlVclu2zAQ_RWCyMFtHVuL5UWHBqlTtD4k6JJcWvdAi6OlkUiBogKrqf-9Q0l2FNsJElSAQXLezPAN32B8TwPJgfo0SFlRXCQsUixbiqUg-AmpgYRSkS9K_oZAkyW9KUCRBScKQlAgAiCs1DEInQRMAyfzFNQtKdFrSfeSXLPi9tUZmhw1uR2L-8ZovtNCq0RE5GTBD43tTYfAFcvg0DqXKbJ8DvsM6w5k6vn56-9VmaZ1bUUH41iKTjIgJ3MFdVnn-ih8k5s976LvgjqkhwB70zGXtWsvb15hwftk34NDCl2PLlYAU0Hca5avJaiqi4aJ4B-qBT8ea9BvEKBGvTTJEt1im8fy1Pr-tzZzKTRedOyxLkr84aGDraRMgQmMynJTezdh2y6NQNveeXTla1UiL5GpMV8yUXWl0qZBjqhp7M9I2cBdQMsoSmFb7y4-2D7Avm7XkrOqbs_ePrQQK7k-Dt3kmBDlOI7uXvsQDmQp9BOJa-wJPg3WNe911_niEwhQrL31WKO9oHXOyHPNc9YhFLW3tY3TUENBs_yg_R-mo72k5PT0Pe6sweAtHmqqPqojNEtEOyH2SzERD453oHRBtKR9GqmEU1-rEvo0A5Uxc6R15UuKMxMnFfVxyyFkZarNvNxgWM7EDymzbaSSZRRTP2Rpgaem79pBv7PiIOag5kYE6s-8Ogf17-ma-pPpwPW8iTUejd2p5Y36tKL-yBpYnu16k6lj2dZs5mz69E99pzWYOu4EMdfCZTyxMQB4oqW6bP9ozNKnOPTl90oEW5YNr4-1545WKhnSMkR0lZvgKCk0BuMzhUlk7KVK0RxrnRf-cGjgQZTouFwNsIGHRcJjpnR8NxsPx854yhwXxhOXea7Lg5U9m4bOyA75xLIdRjebzT9x5Spc

## Class Diagram

![Class Diagram](/public/documentation/class-diagram.png)
