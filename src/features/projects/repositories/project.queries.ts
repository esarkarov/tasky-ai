import { Query } from 'appwrite';

export const projectQueries = {
  selectListFields: () => Query.select(['$id', 'name', 'color_name', 'color_hex', '$createdAt']),
  byUserId: (userId: string) => Query.equal('userId', userId),
  searchByName: (searchTerm: string) => Query.contains('name', searchTerm),
  orderByCreatedDesc: () => Query.orderDesc('$createdAt'),
  limit: (count: number) => Query.limit(count),

  forUserProjectsList: (userId: string, options?: { search?: string; limit?: number }) => {
    const queries = [
      projectQueries.selectListFields(),
      projectQueries.byUserId(userId),
      projectQueries.orderByCreatedDesc(),
    ];

    if (options?.search) {
      queries.push(projectQueries.searchByName(options.search));
    }
    if (options?.limit) {
      queries.push(projectQueries.limit(options.limit));
    }

    return queries;
  },
};
