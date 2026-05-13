import { Image } from "expo-image";
import { memo } from "react";

const PLACEHOLDER_BLURHASH = "IsL}BEof~q";

type Props = {
  img: string;
  content?: "cover" | "contain" | "fill" | "none" | "scale-down";
  recyclingKey?: string;
  priority?: "low" | "normal" | "high";
};

const CustomImage = ({
  img,
  content = "contain",
  recyclingKey,
  priority = "normal",
}: Props) => {
  return (
    <Image
      source={{ uri: img }}
      contentFit={content}
      transition={150}
      cachePolicy="memory-disk"
      allowDownscaling={true}
      //placeholder={{ blurhash: PLACEHOLDER_BLURHASH }}
      placeholder={require("@/assets/images/image-outline.png")}
      placeholderContentFit="cover"
      recyclingKey={recyclingKey}
      priority={priority}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default memo(CustomImage);
