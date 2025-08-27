import VKIcon from "../../../../public/icons/VKIcon";
import TGIcon from "../../../../public/icons/TGIcon";
import YandexIcon from "../../../../public/icons/YandexIcon";
import GoogleIcon from "../../../../public/icons/GoogleIcon";
import { AuthApi } from "@/shared/api/auth.api";

export const socials = [
  {
    icon: <VKIcon />,
    href: AuthApi.getVkAuthUrl(),
  },
  {
    icon: <TGIcon />,
    href: "#", // Telegram auth обрабатывается отдельно через виджет
  },
  {
    icon: <YandexIcon />,
    href: AuthApi.getYandexAuthUrl(),
  },
  {
    icon: <GoogleIcon />,
    href: AuthApi.getGoogleAuthUrl(),
  },
];
