import type { Product, ProductVariant } from "../api/types";
import placeholderImage from "../assets/KEYWERK_Preview.png";
import AccessoriesPng from "../assets/Accessories.png";
import Akko5075BPlusPng from "../assets/Akko_5075B_Plus.png";
import AkkoCSRadiantRedPng from "../assets/Akko_CS_Radiant_Red.png";
import AkkoUSBCcoiledPng from "../assets/Akko_USB_C_Coiled_Cable.png";
import AkkoWorldTourTokyoPng from "../assets/Akko_World_Tour_Tokyo.png";
import DropMTSusuwatariPng from "../assets/Drop_MT_-Susuwatari.png";
import DurockV2StabPng from "../assets/Durock_V2_Screw_in_Stabilizer.png";
import GateronYellowProPng from "../assets/Gateron_Yellow_Pro.png";
import GMKOliviaPng from "../assets/GMK_Olivia_Full_Set.png";
import GMMKProHEPng from "../assets/GMMK_Pro_HE.png";
import KeychronQ1HEPng from "../assets/Keychron_Q1_HE.png";
import KeychronV1MaxPng from "../assets/Keychron_V1_Max.png";
import KEYWERKAurora75Png from "../assets/KEYWERK_Aurora_75.png";
import KEYWERKDeskmatXLPng from "../assets/KEYWERK_Deskmat_XL.png";
import KEYWERKEcho60Png from "../assets/KEYWERK_Echo_60.png";
import KEYWERKNovaFullPng from "../assets/KEYWERK_Nova_FullSize.png";
import KEYWERKOrigin65Png from "../assets/KEYWERK_Origin_65.png";
import KEYWERKSakuraEscPng from "../assets/KEYWERK_Sakura_Esc_Cap.png";
import KEYWERKSwitchLubePng from "../assets/KEYWERK_Switch_Lube_Kit.png";
import KEYWERKTerraTkLPng from "../assets/KEYWERK_Terra_TKL.png";
import KEYWERKVertex96Png from "../assets/KEYWERK_Vertex_96.png";
import NuPhyAir75V2Png from "../assets/NuPhy_Air75_V2_HE.png";
import RazerBlackWidowV4XPng from "../assets/Razer_BlackWidow_V4_X.png";
import SteelSeriesApexProPng from "../assets/SteelSeries_Apex_Pro_TKL_Gen_3.png";
import SwitchKeycapPullerPng from "../assets/Switch_&_Keycap_Puller.png";
import Wooting60HEPng from "../assets/Wooting_60HE.png";

const SEAFILE_BASE_URL = import.meta.env.VITE_IMAGES_BASE_URL ?? "http://localhost:8888";

const ASSET_ALIASES: Record<string, string> = {
  "akko 5075b plus": Akko5075BPlusPng,
  "akko 5075b": Akko5075BPlusPng,
  "akko cs radiant red": AkkoCSRadiantRedPng,
  "akko usb-c coiled cable": AkkoUSBCcoiledPng,
  "akko coiled cable": AkkoUSBCcoiledPng,
  "akko world tour tokyo": AkkoWorldTourTokyoPng,
  "drop mt suspend susuwatari": DropMTSusuwatariPng,
  "drop susuwatari": DropMTSusuwatariPng,
  "durock v2 screw-in stabilizer": DurockV2StabPng,
  "durock stabilizer": DurockV2StabPng,
  "gateron yellow pro": GateronYellowProPng,
  "gateron yellow": GateronYellowProPng,
  "gmk olivia": GMKOliviaPng,
  "gmmk pro he": GMMKProHEPng,
  "keychron q1 he": KeychronQ1HEPng,
  "keychron v1 max": KeychronV1MaxPng,
  "keywerk aurora 75": KEYWERKAurora75Png,
  "keywerk deskmat xl": KEYWERKDeskmatXLPng,
  "keywerk deskmat": KEYWERKDeskmatXLPng,
  "keywerk echo 60": KEYWERKEcho60Png,
  "keywerk nova fullsize": KEYWERKNovaFullPng,
  "keywerk nova": KEYWERKNovaFullPng,
  "keywerk origin 65": KEYWERKOrigin65Png,
  "keywerk sakura esc cap": KEYWERKSakuraEscPng,
  "keywerk sakura esc": KEYWERKSakuraEscPng,
  "keywerk switch lube kit": KEYWERKSwitchLubePng,
  "keywerk lube kit": KEYWERKSwitchLubePng,
  "keywerk terra tkl": KEYWERKTerraTkLPng,
  "keywerk vertex 96": KEYWERKVertex96Png,
  "nuphy air75 v2 he": NuPhyAir75V2Png,
  "nuphy air75": NuPhyAir75V2Png,
  "razer blackwidow v4 x": RazerBlackWidowV4XPng,
  "razer blackwidow": RazerBlackWidowV4XPng,
  "steelseries apex pro tkl gen 3": SteelSeriesApexProPng,
  "steelseries apex pro tkl": SteelSeriesApexProPng,
  "steelseries apex pro": SteelSeriesApexProPng,
  "switch & keycap puller": SwitchKeycapPullerPng,
  "switch keycap puller": SwitchKeycapPullerPng,
  "keycap puller": SwitchKeycapPullerPng,
  "wooting 60he": Wooting60HEPng,
  accessories: AccessoriesPng,
};

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveAssetForName(name: string): string | undefined {
  const key = normalize(name);
  if (!key) return undefined;
  for (const [alias, src] of Object.entries(ASSET_ALIASES)) {
    if (key.includes(normalize(alias))) return src;
  }
  return undefined;
}

export function resolveImageUrl(imageUrl?: string): string | undefined {
  if (!imageUrl) return undefined;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  // SeaweedFS filer URL: /buckets/{bucket}/{file}
  // DB stores /products/uuid.ext, need to prepend /buckets
  const normalized = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${SEAFILE_BASE_URL}/buckets${normalized}`;
}

export function resolveProductImage(
  product: Product,
  variants: ProductVariant[],
): string {
  const variantWithUrl = variants.find((v) => v.image_url);
  if (variantWithUrl) {
    const url = resolveImageUrl(variantWithUrl.image_url);
    if (url) return url;
  }

  const asset = resolveAssetForName(product.product_name);
  return asset ?? placeholderImage;
}
