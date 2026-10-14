import { Instagram, Facebook, Music2, Youtube } from "lucide-react";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.erickdocarmo.com.br";

export const whatsappUrl =
  "https://api.whatsapp.com/message/DO2RHGYHLCLVH1?autoload=1&app_absent=0";

export const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/erickdocarmo.adv/",
    icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@dr.erickdocarmo",
    icon: Music2,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCbd3w-FoIM_pmtCuuvw5sGA",
    icon: Youtube,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/adv.erickdocarmo",
    icon: Facebook,
  },
];
