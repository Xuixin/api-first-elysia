import { profile } from "bun:jsc";
import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { users } from "./routes/userRoutes";
import { jwt } from "@elysiajs/jwt";
import mongoose from "mongoose";
import { UserController } from "./controller/userController";
import { JWTInstance, LoginRequest, JWTPayload } from "./types";
import { category } from "./routes/categoryRoute";
import { products } from "./routes/productRoute";
import { cors } from "@elysiajs/cors";

export interface LoginContext {
  body: LoginRequest;
  jwt: JWTInstance;
  set: {
    status: number;
    headers: Record<string, string>;
  };
}

// 1. แยก MongoDB connection string เป็น environment variable
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://root:pppp@localhost:27017/store?authSource=admin";
const JWT_SECRET = process.env.JWT_SECRET || "4589";

//instance usersService
const usersService = new UserController();

// 2. เพิ่ม error handling สำหรับ MongoDB connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = new Elysia()
  .use(
    swagger({
      path: "/v2/swagger",
    })
  )
  .use(cors())
  .get("/", () => "Hello Elysia")

  //public
  //login
  .post(
    "/login",
    async ({ body, jwt, set }: LoginContext) => {
      try {
        const findByUserName = await usersService.readUserByUserName(
          body.username
        );

        if (findByUserName.error) {
          set.status = 404;
          return {
            success: false,
            error: "User not found",
          };
        }

        if (!body.password) {
          set.status = 400;
          return {
            success: false,
            error: "Password is required",
          };
        }

        console.log("Password: " + findByUserName);

        if (!findByUserName.result || findByUserName.result.length === 0) {
          set.status = 404;
          return {
            success: false,
            error: "User not found",
          };
        }

        const verifyPassword = await Bun.password.verify(
          body.password,
          findByUserName.result[0].password
        );

        if (!verifyPassword) {
          throw new Error("Invalid email or password");
        }

        const token = await jwt.sign({
          email: findByUserName.result[0].email,
          userId: findByUserName.result[0]._id,
        });

        const userData = {
          email: findByUserName.result[0].email,
          userId: findByUserName.result[0]._id,
          username: findByUserName.result[0].username,
          phone: findByUserName.result[0].phone,
          address: findByUserName.result[0].address,
          admin: findByUserName.result[0].admin,
        };

        return {
          success: true,
          result: userData,
          token,
        };
      } catch (error: unknown) {
        if (error instanceof Error) {
          set.status = 400;
          return {
            success: false,
            error: error.message,
          };
        }
        return {
          success: false,
          error: "Internal server error",
          status: 500,
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )
  //register
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const result = await usersService.createAdmin(body);
        if (result?.error) {
          set.status = 400;
          return {
            success: false,
            error: result.error,
          };
        }

        if (!result.result || result.result.length === 0) {
          set.status = 404;
          return {
            success: false,
            error: "User not found",
          };
        }

        const userData = {
          email: result.result[0].email,
          userId: result.result[0]._id,
          username: result.result[0].username,
          phone: result.result[0].phone,
          address: result.result[0].address,
          admin: result.result[0].admin,
        };
        return {
          success: true,
          result: userData,
        };
      } catch (error: unknown) {
        if (error instanceof Error) {
          return {
            success: false,
            error: error.message,
          };
        }
        return {
          success: false,
          error: "Internal server error",
          status: 500,
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        email: t.String(),
        password: t.String(),
      }),
    }
  );

//middleware
app
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
    })
  )
  .state("user", {})
  .derive(async ({ headers, jwt }) => {
    // const auth = headers["authorization"];

    // if (!auth) {
    //   throw new Error("Authorization header is required");
    // }

    // const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    // if (!token) {
    //   throw new Error("Invalid token format");
    // }

    // const profile = await jwt.verify(token);

    // if (!profile) {
    //   throw new Error("Invalid or expired token");
    // }

    const profile = "test";

    return { profile };
  })
  .guard(
    {
      beforeHandle: ({ set, profile, store }) => {
        // if (!profile) {
        //   set.status = 401;
        //   return {
        //     success: false,
        //     error: "Unauthorized access",
        //     status: 401,
        //   };
        // }
        // store.user = profile;
      },
    },
    // private route
    (app) => app
    .use(users)
    .use(category)
    .use(products)
  );

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
