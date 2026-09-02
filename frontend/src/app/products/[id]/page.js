import ProductDetailsClient from "./ProductDetailsClient";
import axios from "axios";
import API_URL from "../../../utils/api";

export const dynamic = "force-static";

export async function generateStaticParams() {
  try {
    const { data } = await axios.get(`${API_URL}/api/products`);
    if (!data || data.length === 0) return [{ id: "placeholder" }];
    
    return data.map((product) => ({
      id: product._id.toString(),
    }));
  } catch (error) {
    console.error("Backend unreachable during build:", error.message);
    return [{ id: "placeholder" }];
  }
}

async function getProduct(id) {
  try {
    const { data } = await axios.get(`${API_URL}/api/products/${id}`);
    return data;
  } catch {
    return null;
  }
}

export default async function Page({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  
  return <ProductDetailsClient initialProduct={product} />;
}