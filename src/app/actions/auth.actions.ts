"use server";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function logInWithGoogleAction() {
  await signIn("google", { redirectTo: "/" });
}

export async function registerAction(
  name: string,
  email: string,
  password: string
) {
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) return { error: "User already exists" };

    await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });

    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error && typeof error === "object" && "type" in error) {
      return { error: "Error creating user" };
    }
    throw error;
  }
}

export async function loginAction(email: string, password: string) {
  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error && typeof error === "object" && "type" in error) {
      return { error: "Incorrect email or password" };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
