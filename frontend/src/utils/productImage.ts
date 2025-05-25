import { Product, ProductMediaItem } from "@/types/product";

export const getProductImage = (product?: Product): string | undefined => {
  if (!product) return undefined;
  let img: string | undefined;
  if (product.product_media && product.product_media.length > 0) {
    const media = product.product_media
      .filter((m: ProductMediaItem) =>
        m.media_type === "IMG" && (m.is_preview || m.is_thumbnail) && m.file_url
      )
      .sort((a: ProductMediaItem, b: ProductMediaItem) => (a.order || 0) - (b.order || 0))[0];
    img = media?.file_url;
  }
  return (
    img ||
    product.cover_image_url ||
    product.imgs?.previews?.[0] ||
    product.imgs?.thumbnails?.[0]
  );
};
