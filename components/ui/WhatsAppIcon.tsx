import type { SVGProps } from "react";
import { siWhatsapp } from "simple-icons";

/**
 * Logo WhatsApp resmi. Path diambil dari paket `simple-icons` (lisensi CC0),
 * jadi ikut ter-update saat paketnya diperbarui — bukan salinan statis.
 *
 * Warnanya mewarisi `currentColor`, bukan hijau brand #25D366. Alasannya:
 * ikon ini dipakai di dalam tombol berlatar hitam maupun putih; hijau di atas
 * hitam kontrasnya rendah. Dengan currentColor ia mengikuti warna teks tombol
 * (putih di tombol hitam, hitam di tombol berbingkai) sehingga selalu terbaca.
 */
export function WhatsAppIcon({
  size = 20,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d={siWhatsapp.path} />
    </svg>
  );
}
