import { z } from 'zod';
import { CATEGORIES, RECORD_TYPES, ROLES } from './category.js';

export const recordSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'Enter an amount' })
    .positive('Amount must be greater than zero')
    .refine((v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-6, 'Use at most two decimal places'),
  type: z.enum(RECORD_TYPES, { errorMap: () => ({ message: 'Choose income or expense' }) }),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choose a category' }) }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  description: z.string(),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z
  .object({
    full_name: z.string().trim().max(100, 'Keep the name under 100 characters'),
    username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50, 'Username must be 50 characters or fewer'),
    email: z.string().trim().max(100, 'Email must be 100 characters or fewer').email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirm_password, { path: ['confirm_password'], message: 'Passwords do not match' });

export const userEditSchema = z.object({
  full_name: z.string().trim().max(100, 'Keep the name under 100 characters'),
  role: z.enum(ROLES),
  is_active: z.boolean(),
});
