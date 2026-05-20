import { getProduct, type Product } from "@/lib/products";
import { cacheLife } from "next/cache";

async function getCached(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheLife("hours");
  return await getProduct(slug);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await getCached(slug);
  if (!product) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(product);
}
