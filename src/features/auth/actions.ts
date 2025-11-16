"use server";

import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function signUpAction(values: z.infer<typeof signUpSchema>) {
  try {
    const validatedFields = signUpSchema.parse(values);

    const existingUser = await db.user.findUnique({
      where: { email: validatedFields.email },
    });

    if (existingUser) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(validatedFields.password, 10);

    await db.user.create({
      data: {
        name: validatedFields.name,
        email: validatedFields.email,
        password: hashedPassword,
      },
    });

    try {
      await signIn("credentials", {
        email: validatedFields.email,
        password: validatedFields.password,
        redirect: false,
      });
    } catch (signInError) {
      console.error("Auto sign-in after signup failed:", signInError);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Sign up error:", error);
    return { error: "Something went wrong during sign up" };
  }
}

export async function signInAction(values: z.infer<typeof signInSchema>) {
  try {
    const validatedFields = signInSchema.parse(values);

    try {
      await signIn("credentials", {
        email: validatedFields.email,
        password: validatedFields.password,
        redirect: false,
      });
      return { success: true };
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case "CredentialsSignin":
            return { error: "Invalid email or password" };
          case "AccessDenied":
            return { error: "Access denied" };
          default:
            return { error: "Authentication failed. Please try again." };
        }
      }
      return { error: "Authentication failed. Please try again." };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }
    console.error("Sign in error:", error);
    return { error: "Something went wrong" };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
