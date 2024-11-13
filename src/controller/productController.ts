import { Product } from "../models/model";

interface ReternType {
  message?: string;
  result?: any[];
  error?: any;
}

export class ProductController {
  public async createProduct(productData: {
    name: string;
    description?: any;
    price: number;
    category: string;
    stock?: any;
    image_url: Array<string>;
    is_active: boolean;
  }): Promise<ReternType> {
    try {
      const product = new Product(productData);
      await product.save();
      return {
        result: [product],
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error creating product:", error);
        return { error: error.message };
      }
      return {
        error: "An unknown error occurred while creating the product.",
      };
    }
  }

  public async readProducts(): Promise<ReternType> {
    try {
      const products = await Product.find(
        {},
        "_id name description price stock image_url is_active"
      ).populate("category", "_id name");
      return { result: products };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error reading products:", error);
        return { error: error.message };
      }
      return {
        error: "An unknown error occurred while retrieving the products.",
      };
    }
  }

  public async readActiveProducts(): Promise<ReternType> {
    try {
      const products = await Product.find(
        { is_active: true },
        "_id name description price stock image_url is_active"
      ).populate("category", "_id name");
      return { result: products };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error reading active products:", error);
        return { error: error.message };
      }
      return {
        error:
          "An unknown error occurred while retrieving the active products.",
      };
    }
  }

  public async updateProduct(
    id: string,
    productData: {
      name?: string;
      description?: any;
      price?: number;
      category?: string;
      stock?: any;
      image_url?: string;
      is_active?: boolean;
    }
  ): Promise<ReternType> {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        { _id: id },
        productData,
        { new: true }
      );
      if (!updatedProduct) {
        return { error: "Product not found." };
      }
      return { result: [updatedProduct] };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error updating product:", error);
        return { error: error.message };
      }
      return {
        error: "An unknown error occurred while updating the product.",
      };
    }
  }

  public async deleteProduct(id: string): Promise<ReternType> {
    try {
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        return { error: "Product not found." };
      }
      return { message: "Product deleted successfully." };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error deleting product:", error);
        return { error: error.message };
      }
      return {
        error: "An unknown error occurred while deleting the product.",
      };
    }
  }

  public async searcProduct(search: string): Promise<ReternType> {
    try {
      const searchProduct = await Product.find({
        name: { $regex: search, $options: "i" },
      }).populate("category", "_id name");
      return { result: searchProduct };
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error searching products:", error);
        return { error: error.message };
      }
      return {
        error: "An unknown error occurred while searching the products.",
      };
    }
  }
}
