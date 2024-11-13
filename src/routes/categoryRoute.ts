import { Elysia, t } from "elysia";
import {
  createCategory,
  deleteCategory,
  readCategories,
  readCategoryById,
  updateCategory,
} from "../controller/categoryController";
import mongoose, { set } from "mongoose";

export const category = new Elysia({ prefix: "category" })
  .get("/", () => readCategories())
  .get("/:id", async ({ params: { id }, set }) => {
    if (!mongoose.isValidObjectId(id)) {
      set.status = 400;
      return {
        message: "Invalid ID provided",
      };
    }

    const category = await readCategoryById(id);
    return category;
  })
  .post(
    "/",
    async ({ body }) => {
      const newCategory = await createCategory(body);
      return newCategory;
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .put(
    "/:id",
    async ({ params: { id }, body, set }) => {
      if (!mongoose.isValidObjectId(id)) {
        set.status = 400;
        return {
          message: "Invalid ID provided",
        };
      }

      const updatedCategory = await updateCategory(id, body);
      return updatedCategory;
    },
    {
      body: t.Object({
        name: t.String(),
      }),
    }
  )
  .delete("/:id", async ({ params: { id }, set }) => {
    if (!mongoose.isValidObjectId(id)) {
      set.status = 400;
      return {
        message: "Invalid ID provided",
      };
    }

    const deletedCategory = await deleteCategory(id);

    if (deletedCategory?.message) {
      set.status = 404;
      return {
        message: deletedCategory.message,
      };
    }

    return deletedCategory;
  });
