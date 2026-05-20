import { getAllProducts, type Product } from "@/lib/products";
import { cacheLife } from "next/cache";

async function getCached(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  return await getAllProducts();
}

export async function GET() {
  const data = await getCached();
  return Response.json(data);
}
