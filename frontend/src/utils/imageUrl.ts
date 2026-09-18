const DEFAULT_IMAGES_BASE_URL = "http://localhost:8888";

export function resolveSeaweedImageUrl(
  imageUrl?: string,
  imagesBaseUrl = DEFAULT_IMAGES_BASE_URL,
): string | undefined {
  if (!imageUrl) return undefined;

  if (/^https?:\/\//i.test(imageUrl)) {
    const parsed = new URL(imageUrl);
    // Older uploads returned the private S3 endpoint. The filer endpoint is public.
    if (parsed.port === "8333") return `${imagesBaseUrl}/buckets${parsed.pathname}`;
    return imageUrl;
  }

  const normalized = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${imagesBaseUrl}/buckets${normalized}`;
}

export function collectVariantImageUrls(
  imageUrls: Array<string | undefined>,
  resolve: (value: string) => string | undefined,
): string[] {
  const unique = new Set<string>();
  for (const imageUrl of imageUrls) {
    if (!imageUrl) continue;
    const resolved = resolve(imageUrl);
    if (resolved) unique.add(resolved);
  }
  return [...unique];
}
