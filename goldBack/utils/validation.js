import { ApiError } from "./apiError.js";
export function text(value, label, required = true) {
  if (typeof value !== "string" || !value.trim()) {
    if (!required && (value == null || value === "")) return null;
    throw new ApiError(`${label} is required`, 400);
  }
  return value.trim();
}
export function number(value, label, { min = 0, integer = false } = {}) {
  if (value == null || value === "" || typeof value === "boolean")
    throw new ApiError(`${label} is required`, 400);
  const parsed = Number(value);
  if (
    !Number.isFinite(parsed) ||
    parsed < min ||
    (integer && !Number.isInteger(parsed))
  )
    throw new ApiError(
      `${label} must be ${integer ? "an integer" : "a number"} of at least ${min}`,
      400,
    );
  return parsed;
}
export function date(value, label) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime()))
    throw new ApiError(`${label} must be a valid date`, 400);
  return parsed;
}
export function stringList(value, label, { required = false } = {}) {
  if (
    !Array.isArray(value) ||
    value.some((x) => typeof x !== "string" || !x.trim()) ||
    (required && value.length === 0)
  )
    throw new ApiError(`${label} must contain valid text`, 400);
  return value.map((x) => x.trim());
}
export function userScope(actor) {
  const relation = actor.role === "MANAGER" ? "managerId" : "supervisorId";
  return actor.role === "MEDICAL_REP"
    ? { id: actor.id }
    : { OR: [{ id: actor.id }, { [relation]: actor.id }] };
}
export function canManageUser(actor, user) {
  return (
    user &&
    (user.id === actor.id ||
      (actor.role === "MANAGER" && user.managerId === actor.id) ||
      (actor.role === "SUPERVISOR" && user.supervisorId === actor.id))
  );
}
