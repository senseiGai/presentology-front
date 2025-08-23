import BigPlusIcon from "../../../../public/icons/BigPlusIcon";
import PresentationIcon from "../../../../public/icons/PresentationIcon";
import CompasIcon from "../../../../public/icons/CompasIcon";
import WhiteVKIcon from "../../../../public/icons/WhiteVKIcon";
import WhiteTGIcon from "../../../../public/icons/WhiteTGIcon";

export const menuItems = [
  { key: "create", label: "Создать презентацию", icon: <BigPlusIcon /> },
  { key: "my", label: "Мои презентации", icon: <PresentationIcon /> },
  { key: "about", label: "О сервисе", icon: <CompasIcon /> },
  {
    key: "vk",
    label: "Мы во ВКонтакте",
    icon: <WhiteVKIcon />,
    isSocial: true,
    href: "https://vk.com/your_page",
  },
  {
    key: "tg",
    label: "Мы в Телеграме",
    icon: <WhiteTGIcon />,
    isSocial: true,
    href: "https://t.me/your_channel",
  },
];
