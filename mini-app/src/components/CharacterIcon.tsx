import { useEffect, useState } from 'react'
import * as Icons from '../icons'

interface IconComponentProps {
  size?: number
  color?: string
}

type IconComponent = React.ComponentType<IconComponentProps>

/**
 * Реестр всех иконок персонажей. Структура повторяет RN-версию
 * 1-в-1 — добавлять новые только парой (ключ → компонент из ../icons).
 */
const ICON_MAP: Record<string, IconComponent> = {
  // ── Встроенные базовые ───────────────────────────────────────────
  brain: Icons.BrainIcon,
  spiral: Icons.SpiralIcon,
  sword: Icons.SwordIcon,
  atom: Icons.AtomIcon,
  headphones: Icons.HeadphonesIcon,
  lightning: Icons.LightningIcon,
  crown: Icons.CrownIcon,
  vinci: Icons.VinciIcon,
  chisel: Icons.ChiselIcon,
  quill: Icons.QuillIcon,
  dna: Icons.DnaIcon,
  apple: Icons.AppleIcon,
  coil: Icons.CoilIcon,
  victory: Icons.VictoryIcon,
  tophat: Icons.TopHatIcon,
  dialogue: Icons.DialogueIcon,
  scroll: Icons.ScrollIcon,
  cave: Icons.CaveIcon,
  yinyang: Icons.YinYangIcon,
  wheel: Icons.WheelIcon,
  treble: Icons.TrebleIcon,
  piano: Icons.PianoIcon,
  snowflake: Icons.SnowflakeIcon,
  raven: Icons.RavenIcon,
  mask: Icons.MaskIcon,
  hammerphil: Icons.HammerPhilIcon,
  fist: Icons.FistIcon,
  cosmos: Icons.CosmosIcon,
  rocket: Icons.RocketIcon,
  chip: Icons.ChipIcon,
  wingrid: Icons.WinGridIcon,
  stockchart: Icons.StockChartIcon,
  kite: Icons.KiteIcon,
  bear: Icons.BearIcon,
  star5: Icons.Star5Icon,
  charkha: Icons.CharkhaIcon,
  chains: Icons.ChainsIcon,
  dove: Icons.DoveIcon,
  laurel: Icons.LaurelIcon,
  lantern: Icons.LanternIcon,
  anchor: Icons.AnchorIcon,
  sceptre: Icons.SceptreIcon,
  axe: Icons.AxeIcon,
  shieldcross: Icons.ShieldCrossIcon,
  sabers: Icons.SabersIcon,
  telescope: Icons.TelescopeIcon,
  romanov: Icons.RomanovIcon,
  helmet: Icons.HelmetIcon,
  lyre: Icons.LyreIcon,
  candle: Icons.CandleIcon,
  wheat: Icons.WheatIcon,
  guitar: Icons.GuitarIcon,
  eyemystic: Icons.EyeMysticIcon,
  tablechem: Icons.TableChemIcon,
  flask: Icons.FlaskIcon,
  goblet: Icons.GobletIcon,
  jokercard: Icons.JokerCardIcon,
  wolf: Icons.WolfIcon,
  blades: Icons.BladesIcon,
  notebook: Icons.NoteBookIcon,
  cake: Icons.CakeIcon,
  wings: Icons.WingsIcon,
  titan: Icons.TitanIcon,
  saiyan: Icons.SaiyanIcon,
  strawhat: Icons.StrawHatIcon,
  boxingglove: Icons.BoxingGloveIcon,
  soccerball: Icons.SoccerBallIcon,
  cigar: Icons.CigarIcon,
  rose: Icons.RoseIcon,
  fedora: Icons.FedoraIcon,
  pencil: Icons.PencilIcon,
  wand: Icons.WandIcon,
  lightsaber: Icons.LightsaberIcon,
  staff: Icons.StaffIcon,
  sharingan: Icons.SharinganIcon,
  flame: Icons.FlameIcon,
  threeswords: Icons.ThreeSwordsIcon,
  leafband: Icons.LeafBandIcon,
  automail: Icons.AutomailIcon,
  cowboyhat: Icons.CowboyHatIcon,
  barcode: Icons.BarcodeIcon,
  hiddenblade: Icons.HiddenBladeIcon,
  visor: Icons.VisorIcon,
  banner: Icons.BannerIcon,
  horde: Icons.HordeIcon,
  syringe: Icons.SyringeIcon,
  cane: Icons.CaneIcon,
  chidori: Icons.ChidoriIcon,
  gauntlet: Icons.GauntletIcon,
  muscle: Icons.MuscleIcon,
  morningstar: Icons.MorningStarIcon,
  plug: Icons.PlugIcon,
  soap: Icons.SoapIcon,
  feather: Icons.FeatherIcon,
  bowlerhat: Icons.BowlerHatIcon,
  coinflip: Icons.CoinFlipIcon,
  chess: Icons.ChessIcon,
  warmap: Icons.WarMapIcon,
  mandala: Icons.MandalaIcon,
  ankh: Icons.AnkhIcon,
  dualgun: Icons.DualGunIcon,
  ring: Icons.RingIcon,
  mushroom: Icons.MushroomIcon,
  elderblood: Icons.ElderBloodIcon,
  sunflower: Icons.SunflowerIcon,
  carnation: Icons.CarnationIcon,
  fang: Icons.FangIcon,
  kunai: Icons.KunaiIcon,
  atfield: Icons.AtFieldIcon,
  thunderbolt: Icons.ThunderboltIcon,
  moonsceptre: Icons.MoonSceptreIcon,
  buster: Icons.BusterIcon,
  triforce: Icons.TriforceIcon,
  bandana: Icons.BandanaIcon,
  microphone: Icons.MicrophoneIcon,
  shades: Icons.ShadesIcon,
  web: Icons.WebIcon,
  batsymbol: Icons.BatSymbolIcon,
  champagne: Icons.ChampagneIcon,
  headdress: Icons.HeaddressIcon,
  lotus: Icons.LotusIcon,
  pipesmoke: Icons.PipeSmokeIcon,
  inkwell: Icons.InkwellIcon,
  baton: Icons.BatonIcon,
  pasta: Icons.PastaIcon,
  jumpman: Icons.JumpmanIcon,
  mouthguard: Icons.MouthguardIcon,
  scarf: Icons.ScarfIcon,
  powerup: Icons.PowerupIcon,
  dragonslayer: Icons.DragonslayerIcon,
  eyepatch: Icons.EyePatchIcon,
  rebellion: Icons.RebellionIcon,
  compass2: Icons.Compass2Icon,
  spear: Icons.SpearIcon,
  glove: Icons.GloveIcon,
  rasta: Icons.RastaIcon,
  lips: Icons.LipsIcon,
  nunchaku: Icons.NunchakuIcon,
  zigzag: Icons.ZigzagIcon,
  cartouche: Icons.CartoucheIcon,
  spartan: Icons.SpartanIcon,
  cap: Icons.CapIcon,
  prism: Icons.PrismIcon,
  beaker: Icons.BeakerIcon,
  queencrown: Icons.QueenCrownIcon,
  racket: Icons.RacketIcon,
  worldcup: Icons.WorldCupIcon,
  manuscript: Icons.ManuscriptIcon,
  birch: Icons.BirchIcon,
  megaphone: Icons.MegaphoneIcon,
  grandpiano: Icons.GrandPianoIcon,
  peaceatom: Icons.PeaceAtomIcon,
  barbedwire: Icons.BarbedWireIcon,
  featherpen: Icons.FeatherPenIcon,
  troika: Icons.TroikaIcon,
  autumnleaf: Icons.AutumnLeafIcon,

  // ── Тематические иконки для встроенных персонажей ────────────────
  coil_lightnings: Icons.CoilLightningsIcon,
  treble_notes: Icons.TrebleNotesIcon,
  cake_napoleon: Icons.CakeNapoleonIcon,
  great_sword: Icons.GreatSwordIcon,
  david_statue: Icons.DavidStatueIcon,
  cigar_smoke: Icons.CigarSmokeIcon,
  quill_skull: Icons.QuillSkullIcon,
  tophat_beard: Icons.TopHatBeardIcon,
  dollar_bill: Icons.DollarBillIcon,
  axe_blood: Icons.AxeBloodIcon,
  meditation_lotus: Icons.MeditationLotusIcon,
  spartan_shield: Icons.SpartanShieldIcon,
  tram: Icons.TramIcon,
  gogol_nose: Icons.GogolNoseIcon,
  mongol_bow: Icons.MongolBowIcon,
  hammer_sickle: Icons.HammerSickleIcon,
  tolstovka: Icons.TolstovkaIcon,
  cognac_bottle: Icons.CognacBottleIcon,
  grandpiano_v2: Icons.GrandPianoV2Icon,
  barbedwire_v2: Icons.BarbedWireV2Icon,
  hunting_dog: Icons.HuntingDogIcon,
  kremlin_wall: Icons.KremlinWallIcon,
  faberge_egg: Icons.FabergeEggIcon,
  mgu_tower: Icons.MGUTowerIcon,

  // ── Иконки для кастомных персонажей ──────────────────────────────
  robot: Icons.RobotIcon,
  alien: Icons.AlienIcon,
  maskface: Icons.MaskFaceIcon,
  lock: Icons.LockIcon,
  heartfull: Icons.HeartFullIcon,
  star8: Icons.Star8Icon,
  moonstar: Icons.MoonStarIcon,
  electricguitar: Icons.ElectricGuitarIcon,
  wolfhowl: Icons.WolfHowlIcon,
  dragon: Icons.DragonIcon,
  eyerunes: Icons.EyeRunesIcon,
  phoenix: Icons.PhoenixIcon,
  kitsune: Icons.KitsuneIcon,
  skullcrossbones: Icons.SkullCrossbonesIcon,
  octopus: Icons.OctopusIcon,
  crystal: Icons.CrystalIcon,
  bookspell: Icons.BookSpellIcon,
  rosedark: Icons.RoseDarkIcon,
  wingedheart: Icons.WingedHeartIcon,
  compassmagic: Icons.CompassMagicIcon,
}

interface CharacterIconProps {
  iconType: string
  size?: number
  color?: string
  /**
   * Опциональный URL кастомной картинки-аватара (для пользовательских
   * персонажей). На вебе это `blob:`-URL из IndexedDB или `data:`-URL.
   * Родитель должен иметь `position: relative` и `overflow: hidden`,
   * чтобы img обрезался по его borderRadius.
   */
  avatarUri?: string
  /**
   * HTTP(S) URL фото из бэкенда (для персонажей из админки).
   * Приоритет выше чем у avatarUri.
   */
  photoUrl?: string
}

export function CharacterIcon({ iconType, size = 20, color, avatarUri, photoUrl }: CharacterIconProps) {
  const [imageError, setImageError] = useState(false)
  const effectiveUri = photoUrl || avatarUri

  // При смене avatarUri/photoUrl (юзер выбрал новое фото) сбрасываем флаг ошибки.
  useEffect(() => {
    setImageError(false)
  }, [effectiveUri])

  if (effectiveUri && !imageError) {
    return (
      <img
        src={effectiveUri}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        onError={() => setImageError(true)}
      />
    )
  }

  const Component = ICON_MAP[iconType] ?? Icons.BrainIcon
  return <Component size={size} color={color} />
}

export { ICON_MAP }
