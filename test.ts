export const readProducts = async () => {
  try {
    const products = await Product.find().populate("category", "name");
    return products;
  } catch (error) {
    if (error instanceof Error) {
      return {
        message: error.message,
      };
    } else {
      return {
        message: "An unknown error occurred while retrieving the products.",
      };
    }
  }
};
