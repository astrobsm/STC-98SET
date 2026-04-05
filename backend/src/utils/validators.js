const { z } = require('zod');

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  state_of_residence: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const paymentSchema = z.object({
  amount_paid: z.number().positive('Amount must be greater than 0').max(10000, 'Amount cannot exceed annual dues'),
  year: z.number().int().min(2020).max(2050).optional(),
});

const eventSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  event_date: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format'),
  type: z.enum(['meeting', 'announcement']),
  location: z.string().optional(),
  meeting_link: z.string().url().optional().or(z.literal('')),
});

const constitutionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  state_of_residence: z.string().optional(),
  date_of_birth: z.string().optional(),
  wedding_anniversary: z.string().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'exco', 'member']),
});

module.exports = {
  registerSchema,
  loginSchema,
  paymentSchema,
  eventSchema,
  constitutionSchema,
  updateProfileSchema,
  updateRoleSchema,
};
