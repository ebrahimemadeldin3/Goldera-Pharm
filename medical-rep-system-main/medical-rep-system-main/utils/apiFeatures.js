export class ApiFeatures {
  queryStringObj;
  queryObj;

  constructor(queryStringObj) {
    this.queryStringObj = { ...queryStringObj }; // Copy of query object
    this.queryObj = { where: {} }; // Initialize base query object
  }

  // 1) Filteration: Exclude unwanted query parameters
  filter() {
    const excludes = ["page", "limit", "sort", "fields", "keyword"];
    excludes.forEach((exclude) => delete this.queryStringObj[exclude]);
    this.queryObj.where = { ...this.queryStringObj };
    return this; // Returning `this` allows method chaining
  }

  // 2) Searching: Add search functionality for event-related fields
  search(keyword) {
    if (keyword) {
      this.queryObj.where.OR = [
        { title: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        // Add other fields you want to search by
      ];
    }
    return this; // Allow method chaining
  }

  // 3) Sorting
  sort(sortQuery) {
    if (sortQuery) {
      const sortBy = sortQuery.split(",").join(" ");
      this.queryObj.orderBy = { [sortBy]: "asc" }; // Correct Prisma orderBy format
    } else {
      // Default sorting by creation date if no sort option is provided
      this.queryObj.orderBy = { createdAt: "desc" };
    }
    return this; // Allow method chaining
  }

  // 4) Pagination
  paginate(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    this.queryObj.take = limit;
    this.queryObj.skip = skip;

    // Set pagination details
    return {
      currentPage: page,
      limit: limit,
      skip,
    };
  }

  // Method to apply all features in sequence
  applyFeatures(reqQuery) {
    const { keyword, sort, page, limit } = reqQuery;

    this.filter().search(keyword).sort(sort);

    const pagination = this.paginate(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      queryObj: this.queryObj,
      pagination,
    };
  }
}

export const paginationResults = (pagination, numOfDocuments = 0) => {
  const paginationResults = {
    ...pagination,
    totalPages: 0,
    next: 0,
    prev: 0,
  };

  paginationResults.totalPages = Math.ceil(
    numOfDocuments / paginationResults.limit,
  );
  if (paginationResults.currentPage < paginationResults.totalPages) {
    paginationResults.next = paginationResults.currentPage + 1;
  }
  if (paginationResults.currentPage > 1) {
    paginationResults.prev = paginationResults.currentPage - 1;
  }

  return paginationResults;
};
