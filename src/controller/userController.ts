import mongoose from "mongoose";
import { User } from "../models/model";

interface ReternType {
  message?: string;
  result?: any[];
  error?: any;
}

interface UserCreationData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  admin?: boolean;
}

export class UserController {
  async createUser(userData: UserCreationData): Promise<ReternType> {
    console.log("Creating user with data:", JSON.stringify(userData, null, 2));

    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return { error: "Email already in use" };
      }

      const hashPassword = await Bun.password.hash(userData.password);
      const newUser = new User({
        username: userData.username,
        email: userData.email,
        password: hashPassword,
      });

      await newUser.save();
      return { result: [newUser] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating user:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async createAdmin(userData: UserCreationData): Promise<ReternType> {
    console.log("Creating admin with data:", JSON.stringify(userData, null, 2));

    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return { error: "Email already in use" };
      }

      const hashPassword = await Bun.password.hash(userData.password);
      const newAdmin = new User({
        username: userData.username,
        email: userData.email,
        password: hashPassword,
        admin: true,
      });

      await newAdmin.save();
      return { result: [newAdmin] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating admin:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async findEmail(email: string): Promise<ReternType> {
    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return { error: "User not found" };
      }

      return {
        result: [user],
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error reading users:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async readUsers(): Promise<ReternType> {
    try {
      const users = await User.find({});
      return { result: users };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error reading users:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async readUserById(userId: string): Promise<ReternType> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { error: "User not found" };
      }
      return { result: [user] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error reading user:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async readUserByUserName(username: string): Promise<ReternType> {
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return { error: "User not found" };
      }
      if (!user.password) {
        return { error: "Password not found for this user" };
      }
      return { result: [user] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error reading user:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async updateUser(
    userId: string,
    updatedUserData: {
      username?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<ReternType> {
    try {
      const updatedUserDataWithoutEmptyStrings = Object.fromEntries(
        Object.entries(updatedUserData).filter(([_, value]) => value !== "")
      );

      if (Object.keys(updatedUserDataWithoutEmptyStrings).length === 0) {
        return { error: "No data to update" };
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updatedUserDataWithoutEmptyStrings,
        {
          new: true,
        }
      );

      if (!user) {
        return { error: "User not found" };
      }

      return { result: [user] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating user:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async deleteUserById(userId: string): Promise<ReternType> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { error: "Invalid user ID format" };
      }

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return { error: "User not found" };
      }

      return { result: [user] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting user:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }

  async resetPassword(email: string, password: string) {
    try {
      const hashPassword = await Bun.password.hash(password);
      const user = await User.findOneAndUpdate(
        { email: email },
        { password: hashPassword },
        { new: true }
      );

      if (!user) {
        return { error: "User not found" };
      }

      return { result: [user] };
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error resetting password:", error.message);
        return { error: error.message };
      }
      return { error: "Unknown error" };
    }
  }
}
