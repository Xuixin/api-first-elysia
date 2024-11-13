import { Elysia, t } from "elysia";
import { ProductController } from "../controller/productController";
import fs from "fs/promises";
import { join } from "path";
import { createHash } from "crypto";
import { existsSync, mkdirSync } from "fs";

const pd = new ProductController();
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const generateUniqueFileName = (originalName: string) => {
  const timestamp = Date.now();
  const hash = createHash("md5")
    .update(`${originalName}${timestamp}`)
    .digest("hex");
  const extension = originalName.split(".").pop();
  return `${hash}.${extension}`;
};

const isValidFileType = (mimetype: string) => {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
  return validTypes.includes(mimetype);
};

export const products = new Elysia({ prefix: "products" })
  .get("/", async ({ set }) => {
    const product = await pd.readProducts();
    if (product.error) {
      set.status = 400;
      return { message: product.error };
    }
    set.status = 200;
    return product.result;
  })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const files = body.image;

        if (!files || files.length === 0) {
          set.status = 400;
          return { message: "No image provided" };
        }

        const uploadDir = join(process.cwd(), "uploads");
        try {
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
        } catch (error) {
          set.status = 500;
          return { message: "Failed to create upload directory" };
        }

        const uploadsFile = [];

        for (const file of files) {
          const fileSize = file.size;
          if (fileSize > MAX_FILE_SIZE) {
            set.status = 400;
            return {
              message: `File ${file.name} is too large. Maximum size is 5MB`,
            };
          }

          if (!isValidFileType(file.type)) {
            set.status = 400;
            return {
              message: `Invalid file type for ${file.name}. Allowed types: JPG, PNG, GIF`,
            };
          }

          const uniqueFileName = generateUniqueFileName(file.name);
          const savePath = join(uploadDir, uniqueFileName);

          try {
            // เปลี่ยนวิธีการเขียนไฟล์
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            await fs.writeFile(savePath, uint8Array);
            uploadsFile.push(uniqueFileName);
          } catch (error) {
            set.status = 500;
            return {
              message: `Failed to save file ${file.name}`,
            };
          }
        }

        const { image, price, stock, ...restBody } = body;
        const bodyData = {
          image_url: uploadsFile.map((filename) => `/uploads/${filename}`),
          price: parseFloat(price),
          stock: stock ? parseInt(stock) : 0,
          is_active: true,
          ...restBody,
        };

        const products = await pd.createProduct(bodyData);

        if (products.error) {
          // ลบไฟล์ถ้าการสร้าง product ไม่สำเร็จ
          for (const filename of uploadsFile) {
            const filePath = join(uploadDir, filename);
            if (existsSync(filePath)) {
              await fs.unlink(filePath);
            }
          }

          set.status = 400;
          return { message: products.error };
        }

        set.status = 201;
        return {
          message: "Product created successfully",
          result: products.result,
        };
      } catch (error) {
        set.status = 500;
        return {
          message: "Internal server error during file upload",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        price: t.String(),
        category: t.String(),
        stock: t.Optional(t.String()),
        image: t.Files({
          type: ["image/jpeg", "image/png", "image/gif", "image/jpg"],
          maxSize: "5m",
        }),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    const result = await pd.deleteProduct(id);
    if (result.error) {
      set.status = 401;
      return { message: result.error };
    }

    set.status = 200;
    return { message: result.message };
  })
  .get(
    "/query",
    async ({ query }) => {
      const products = await pd.searcProduct(query.search);
      if (products.error) {
        return { message: products.error };
      }
      return products.result;
    },
    {
      query: t.Object({
        search: t.String(),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      // Convert price and stock to correct type
      const updatedBody = {
        name: body.name ? body.name : undefined,
        price: body.price ? parseFloat(body.price as string) : 0,
        stock: body.stock ? parseInt(body.stock as string) : 0,
      };

      const result = await pd.updateProduct(id, updatedBody);
      if (result.error) {
        set.status = 403;
        return { message: result.error };
      }

      set.status = 200;
      return { message: "Product updated successfully", result: result.result };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        description: t.Optional(t.String()),
        price: t.Optional(t.String()), // Expect price as string
        category: t.Optional(t.String()),
        stock: t.Optional(t.String()), // Expect stock as string
        image_url: t.Optional(t.Array(t.String())),
        is_active: t.Optional(t.Boolean()),
      }),
    }
  );
