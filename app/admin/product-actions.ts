"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProductActionState } from "@/lib/product-action-state";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function errorState(message: string): ProductActionState {
  return { status: "error", message };
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return supabase;
}

function requiredText(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

function nonNegativeInteger(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= 2_147_483_647
    ? parsed
    : null;
}

function normalizeUnit(value: string, unit: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.toLowerCase().endsWith(unit.toLowerCase())
    ? trimmed
    : `${trimmed} ${unit}`;
}

function averageFromText(value: string): number | null {
  const values = value
    .match(/\d+(?:[.,]\d+)?/g)
    ?.map((part) => Number(part.replace(",", ".")))
    .filter(Number.isFinite);
  if (!values?.length) return null;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function parseKeptImages(formData: FormData): string[] | null {
  try {
    const parsed: unknown = JSON.parse(
      String(formData.get("existingImages") ?? "[]"),
    );
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function getNewImageFiles(formData: FormData): File[] {
  return formData
    .getAll("images")
    .filter((item): item is File => item instanceof File && item.size > 0);
}

function storagePathFromPublicUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
    const index = pathname.indexOf(marker);
    return index === -1
      ? null
      : decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

async function removeStoredImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  urls: string[],
) {
  const paths = urls
    .map(storagePathFromPublicUrl)
    .filter((path): path is string => Boolean(path));
  if (!paths.length) return null;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove(paths);
  return error;
}

async function uploadImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  files: File[],
): Promise<{ urls: string[]; error: string | null }> {
  const uploadedPaths: string[] = [];
  const urls: string[] = [];

  for (const file of files) {
    const extension = ALLOWED_IMAGE_TYPES.get(file.type);
    if (!extension) {
      await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
      return { urls: [], error: "Format gambar harus JPG, PNG, atau WebP." };
    }
    if (file.size > MAX_IMAGE_SIZE) {
      await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
      return { urls: [], error: "Ukuran setiap gambar maksimal 5 MB." };
    }

    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      await supabase.storage.from(IMAGE_BUCKET).remove(uploadedPaths);
      console.error("[uploadImages] gagal:", error.message);
      return { urls: [], error: "Gambar gagal diunggah. Coba lagi." };
    }

    uploadedPaths.push(path);
    urls.push(
      supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl,
    );
  }

  return { urls, error: null };
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
): Promise<string> {
  const base = slugify(name) || `produk-${Date.now()}`;
  for (let suffix = 1; suffix <= 20; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function revalidateProductPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/produk/[slug]", "page");
}

export async function saveProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return errorState("Sesi admin berakhir. Silakan masuk kembali.");

  const productId = requiredText(formData, "productId");
  const isEditing = Boolean(productId);
  const name = requiredText(formData, "name");
  const sku = requiredText(formData, "sku");
  const brand = requiredText(formData, "brand");
  const material = requiredText(formData, "material");
  const description = requiredText(formData, "description");
  const surface = requiredText(formData, "surface");
  const core = requiredText(formData, "core");
  const weight = normalizeUnit(requiredText(formData, "weight"), "oz");
  const thickness = normalizeUnit(
    requiredText(formData, "thickness"),
    "mm",
  );
  const price = nonNegativeInteger(requiredText(formData, "price"));
  const stock = nonNegativeInteger(requiredText(formData, "stock"));
  const weightAvg = averageFromText(weight);

  if (!name || !sku || !brand || !material || !description) {
    return errorState("Lengkapi semua informasi utama produk.");
  }
  if (
    name.length > 120 ||
    sku.length > 60 ||
    brand.length > 60 ||
    material.length > 60 ||
    description.length > 2000 ||
    surface.length > 120 ||
    core.length > 120 ||
    weight.length > 60 ||
    thickness.length > 60
  ) {
    return errorState("Salah satu isian produk terlalu panjang.");
  }
  if (!weight || !thickness || !surface || !core || weightAvg === null) {
    return errorState("Lengkapi spesifikasi produk dengan format yang benar.");
  }
  if (price === null || stock === null) {
    return errorState("Harga dan stok harus berupa angka bulat positif.");
  }

  let trustedImages: string[] = [];
  let oldSlug = "";
  if (isEditing) {
    const { data, error } = await supabase
      .from("products")
      .select("slug, images")
      .eq("id", productId)
      .maybeSingle();
    if (error || !data) return errorState("Produk tidak ditemukan.");
    trustedImages = Array.isArray(data.images) ? data.images : [];
    oldSlug = data.slug;
  }

  const requestedImages = parseKeptImages(formData);
  if (!requestedImages) return errorState("Daftar gambar produk tidak valid.");
  const keptImages = requestedImages.filter((url) => trustedImages.includes(url));
  const newFiles = getNewImageFiles(formData);

  if (keptImages.length + newFiles.length > MAX_IMAGES) {
    return errorState(`Maksimal ${MAX_IMAGES} gambar per produk.`);
  }
  if (keptImages.length + newFiles.length === 0) {
    return errorState("Tambahkan minimal satu gambar produk.");
  }

  const id = productId || crypto.randomUUID();
  const uploaded = await uploadImages(supabase, id, newFiles);
  if (uploaded.error) return errorState(uploaded.error);
  const images = [...keptImages, ...uploaded.urls];
  const slug = isEditing ? oldSlug : await uniqueSlug(supabase, name);
  const payload = {
    id,
    slug,
    sku,
    name,
    brand,
    material,
    price,
    stock,
    description,
    images,
    specs: { weight, weightAvg, thickness, surface, core },
  };

  const mutation = isEditing
    ? await supabase.from("products").update(payload).eq("id", id)
    : await supabase.from("products").insert(payload);

  if (mutation.error) {
    await removeStoredImages(supabase, uploaded.urls);
    console.error("[saveProduct] gagal:", mutation.error.message);
    return errorState(
      mutation.error.code === "23505"
        ? "SKU atau slug produk sudah digunakan."
        : "Produk gagal disimpan. Coba lagi.",
    );
  }

  const removedImages = trustedImages.filter((url) => !keptImages.includes(url));
  const cleanupError = await removeStoredImages(supabase, removedImages);
  if (cleanupError) {
    console.error("[saveProduct] cleanup gambar gagal:", cleanupError.message);
  }

  revalidateProductPages();
  return {
    status: "success",
    message: isEditing ? "Perubahan produk tersimpan." : "Produk baru ditambahkan.",
  };
}

export async function updateProductStock(
  productId: string,
  value: number,
): Promise<ProductActionState> {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return errorState("Sesi admin berakhir. Silakan masuk kembali.");
  if (!productId || !Number.isSafeInteger(value) || value < 0) {
    return errorState("Stok harus berupa angka bulat positif.");
  }

  const { error } = await supabase
    .from("products")
    .update({ stock: value })
    .eq("id", productId);
  if (error) {
    console.error("[updateProductStock] gagal:", error.message);
    return errorState("Stok gagal disimpan.");
  }

  revalidateProductPages();
  return { status: "success", message: "Stok diperbarui." };
}

export async function deleteProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return errorState("Sesi admin berakhir. Silakan masuk kembali.");
  const productId = requiredText(formData, "productId");
  if (!productId) return errorState("Produk tidak valid.");

  const { data, error: readError } = await supabase
    .from("products")
    .select("images")
    .eq("id", productId)
    .maybeSingle();
  if (readError || !data) return errorState("Produk tidak ditemukan.");

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[deleteProduct] gagal:", error.message);
    return errorState("Produk gagal dihapus.");
  }

  const cleanupError = await removeStoredImages(
    supabase,
    Array.isArray(data.images) ? data.images : [],
  );
  if (cleanupError) {
    console.error("[deleteProduct] cleanup gambar gagal:", cleanupError.message);
  }

  revalidateProductPages();
  return {
    status: "success",
    message: cleanupError
      ? "Produk dihapus, tetapi sebagian file gambar perlu dibersihkan manual."
      : "Produk dihapus.",
  };
}
