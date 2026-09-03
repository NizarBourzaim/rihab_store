import ProductsClient from "./ProductsClient";
import axios from "axios";
import API_URL from "../../utils/api";

// This makes the page static and fetches data at build time
export const dynamic = "force-static";

async function getProducts() {
  try {
    const { data } = await axios.get(`${API_URL}/api/products`, { timeout: 4000 });
    return data;
  } catch (error) {
    console.warn("Failed to fetch products for SSG:", error.message);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();
  
  return <ProductsClient initialProducts={products} />;
}