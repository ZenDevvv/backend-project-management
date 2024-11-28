export interface DbParams {
  query?: any;
  select?: string | string[];
  populateArray?: any[];
  lean?: boolean;
  sort?: Record<string, any>;
  limit?: number;
  multi?: boolean;
  page?: number; 
  pageSize?: number; 
}
