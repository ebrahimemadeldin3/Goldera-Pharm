export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  canArchive?: boolean;
  dependencies?: string[];
}
