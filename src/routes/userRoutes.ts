import { UserController } from "../controller/userController";
import { Elysia, t } from "elysia";
import { randomBytes } from "crypto";
// instace user service
const userService = new UserController();

interface UpdateContext {
  params: { id: string };
  body: {
    username?: string;
    phone?: string;
    address?: string;
  };
  store: {
    user: {
      email: string;
      userId: string;
    };
  };
}

export const users = new Elysia({ prefix: "users" })
  // Endpoint สำหรับการสร้างผู้ใช้
  .post(
    "/",
    async ({ body }) => {
      try {
        return await userService.createUser(body);
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )

  // Endpoint สำหรับการอัปเดตผู้ใช้
  .put(
    "/profile/:id",
    async ({ params: { id }, body }: UpdateContext) => {
      try {
        const updateUser = await userService.updateUser(id, body);
        if (updateUser.error) {
          throw updateUser.error;
        }

        if (!updateUser.result || updateUser.result.length === 0) {
          throw new Error("User not found");
        }

        const userData = {
          email: updateUser.result[0].email,
          userId: updateUser.result[0]._id,
          username: updateUser.result[0].username,
          phone: updateUser.result[0].phone,
          address: updateUser.result[0].address,
        };

        return userData; // เรียกใช้งาน updateUser จาก UserService
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    {
      body: t.Object({
        username: t.MaybeEmpty(t.String()),
        phone: t.MaybeEmpty(t.String()),
        address: t.MaybeEmpty(t.String()),
      }),
    }
  )

  .get("/profile/:id", async ({ params: { id }, set }) => {
    try {
      const user = await userService.readUserById(id);
      if (user.error) {
        set.status = 404;
        return {
          success: false,
          error: user.error,
        };
      }
      if (!user.result || user.result.length === 0) {
        throw new Error("User not found");
      }

      const userData = {
        email: user.result[0].email,
        userId: user.result[0]._id,
        username: user.result[0].username,
        phone: user.result[0].phone,
        address: user.result[0].address,
        admin: user.result[0].admin,
      };
      return userData;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  })

  .delete("/:id", async ({ params: { id }, set }) => {
    try {
      const delUser = await userService.deleteUserById(id); // เรียกใช้งาน deleteUserById จาก UserService

      if (delUser.error) {
        set.status = 404;
        return {
          success: false,
          error: delUser.error,
        };
      }

      if (!delUser.result || delUser.result.length === 0) {
        set.status = 404;
        return {
          success: false,
          error: "User not found",
        };
      }

      set.status = 200;
      return {
        message: "User deleted successfully",
        userId: delUser.result[0]?._id,
        email: delUser.result[0]?.email,
      };
    } catch (error) {
      console.error("Error deleting user:", error);
      set.status = 500;
      return {
        success: false,
        error: "Internal server error",
      };
    }
  })

  // Endpoint สำหรับการดึงข้อมูลผู้ใช้ทั้งหมด
  .get("/", async ({ set }) => {
    try {
      const user = await userService.readUsers();
      if (user.error) {
        set.status = 404;
        return {
          success: false,
          error: user.error,
        };
      }

      return user.result;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  })

  .post(
    "/createAdmin",
    async ({ body }) => {
      try {
        return await userService.createAdmin(body);
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/findEmail",
    async ({ body, set }) => {
      const findUser = await userService.findEmail(body.email);

      if (findUser.error || !findUser.result) {
        set.status = 403;
        set.headers = { "Content-Type": "application/json" }; // Set content type for error response
        return {
          ok: false,
          error: findUser.error,
        };
      }

      // If no results are found, return a 404 with a message
      return {
        ok: true,
      };
    },
    {
      body: t.Object({
        email: t.String(),
      }),
    }
  )
  .post(
    "/resetPassword",
    async ({ body }) => {
      const user = await userService.findEmail(body.email);

      if (!user.result) {
        throw new Error("User not found");
      }

      const result = await userService.resetPassword(body.email, body.password);

      // Send email with reset link

      return {
        success: true,
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  );
