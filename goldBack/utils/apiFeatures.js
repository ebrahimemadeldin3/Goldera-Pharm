import { Prisma } from "@prisma/client";
import * as PrismaClient from "@prisma/client";
import { ApiError } from "./apiError.js";

// Query fields come from the actual model, not untrusted query parameter names.
export class ApiFeatures {
  constructor(queryStringObj = {}, modelName) {
    this.queryStringObj = { ...queryStringObj };
    this.model = Prisma.dmmf.datamodel.models.find(
      (model) => model.name === modelName,
    );
    if (!this.model) throw new Error(`Missing query model: ${modelName}`);
    this.fields = new Map(
      this.model.fields
        .filter((f) => f.kind !== "object" && !f.isList)
        .map((f) => [f.name, f]),
    );
    this.queryObj = { where: {} };
  }
  filter() {
    const controls = new Set([
      "page",
      "limit",
      "sort",
      "fields",
      "keyword",
      "paginate",
    ]);
    // These aliases are consumed and scoped by the respective controllers.
    if (!this.fields.has("createdById")) controls.add("createdById");
    if (!this.fields.has("date")) controls.add("date");
    for (const [key, value] of Object.entries(this.queryStringObj)) {
      if (controls.has(key) || value === undefined || value === "") continue;
      const field = this.fields.get(key);
      if (!field || key === "password")
        throw new ApiError(`Unsupported filter: ${key}`, 400);
      if (typeof value !== "string")
        throw new ApiError(`Invalid filter: ${key}`, 400);
      let parsed = value;
      if (field.type === "Boolean") {
        if (!["true", "false"].includes(value))
          throw new ApiError(`Invalid ${key}`, 400);
        parsed = value === "true";
      } else if (["Int", "Float", "Decimal"].includes(field.type)) {
        parsed = Number(value);
        if (
          !Number.isFinite(parsed) ||
          (field.type === "Int" && !Number.isInteger(parsed))
        )
          throw new ApiError(`Invalid ${key}`, 400);
      } else if (field.type === "DateTime") {
        parsed = new Date(value);
        if (Number.isNaN(parsed.getTime()))
          throw new ApiError(`Invalid ${key} date`, 400);
      } else if (field.kind === "enum") {
        const values = Object.values(PrismaClient[field.type] || {});
        if (!values.includes(value)) throw new ApiError(`Invalid ${key}`, 400);
      }
      this.queryObj.where[key] = parsed;
    }
    return this;
  }
  search(keyword) {
    if (!keyword) return this;
    if (typeof keyword !== "string" || keyword.length > 200)
      throw new ApiError("Invalid search keyword", 400);
    const names = [
      "name",
      "nameAR",
      "nameEN",
      "email",
      "internalRef",
      "city",
      "title",
      "description",
      "subject",
      "customer",
      "notes",
      "visitPurpose",
      "visitLocation",
    ];
    const fields = names.filter(
      (name) => this.fields.get(name)?.type === "String",
    );
    if (fields.length)
      this.queryObj.where.OR = fields.map((name) => ({
        [name]: { contains: keyword.trim(), mode: "insensitive" },
      }));
    return this;
  }
  sort(sortQuery) {
    if (!sortQuery) {
      this.queryObj.orderBy = { createdAt: "desc" };
      return this;
    }
    if (typeof sortQuery !== "string") throw new ApiError("Invalid sort", 400);
    this.queryObj.orderBy = sortQuery.split(",").map((part) => {
      const descending = part.startsWith("-");
      const name = descending ? part.slice(1) : part;
      if (!this.fields.has(name) || name === "password")
        throw new ApiError(`Unsupported sort: ${name}`, 400);
      return { [name]: descending ? "desc" : "asc" };
    });
    return this;
  }
  paginate(page = 1, limit = 10) {
    page = Number(page);
    limit = Number(limit);
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 1000
    )
      throw new ApiError(
        "Page must be positive; limit must be between 1 and 1000",
        400,
      );
    const skip = (page - 1) * limit;
    if (!Number.isSafeInteger(skip))
      throw new ApiError("Page is too large", 400);
    this.queryObj.take = limit;
    this.queryObj.skip = skip;
    return { currentPage: page, limit, skip };
  }
  applyFeatures(reqQuery = {}) {
    this.filter().search(reqQuery.keyword).sort(reqQuery.sort);
    const pagination = this.paginate(reqQuery.page ?? 1, reqQuery.limit ?? 10);
    return { queryObj: this.queryObj, pagination };
  }
}
export const paginationResults = (pagination, numOfDocuments = 0) => {
  const totalPages = Math.ceil(numOfDocuments / pagination.limit);
  return {
    ...pagination,
    totalPages,
    next: pagination.currentPage < totalPages ? pagination.currentPage + 1 : 0,
    prev: pagination.currentPage > 1 ? pagination.currentPage - 1 : 0,
  };
};
