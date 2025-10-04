import { ZodSchema } from 'zod';

export const parse = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    const error = new Error(message);
    throw error;
  }
  return result.data;
};
