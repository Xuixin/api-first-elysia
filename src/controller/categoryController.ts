import { Category } from "../models/model";

export const createCategory = async (categoryData: { name: string }) => {
  try {
    const newCategory = new Category(categoryData);
    await newCategory.save();
    return newCategory;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while creating the category.",
      };
    }
  }
};

export const readCategories = async () => {
  try {
    const categories = await Category.find().select("name");
    return categories;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while retrieving the categories.",
      };
    }
  }
};

export const readCategoryById = async (id: string) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      return {
        message: "Category not found.",
      };
    }
    return category;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while retrieving the category.",
      };
    }
  }
};

export const updateCategory = async (
  id: string,
  categoryData: { name: string }
) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, {
      new: true,
    });
    if (!updatedCategory) {
      return {
        message: "Category not found.",
      };
    }
    return updatedCategory;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while updating the category.",
      };
    }
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return {
        message: "Category not found.",
      };
    }
    return { result: "Category deleted successfully." };
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while deleting the category.",
      };
    }
  }
};
