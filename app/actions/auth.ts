"use server";

/**
 * app/actions/auth.ts
 * Server Actions for user authentication.
 */

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SignupSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signup(data: z.infer<typeof SignupSchema>) {
  const parsed = SignupSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) throw new Error("Email sudah terdaftar.");

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash,
    },
    select: { id: true, name: true, email: true, phone: true },
  });

  return user;
}

export async function login(data: z.infer<typeof LoginSchema>) {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) throw new Error(parsed.error.message);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) throw new Error("Email atau password salah.");

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) throw new Error("Email atau password salah.");

  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

export async function updateProfile(
  userId: string,
  data: { name?: string; phone?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, phone: true },
  });
}
