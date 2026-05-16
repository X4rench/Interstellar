// Однократный конвертер: react-native-svg → JSX SVG (web).
//
// Используется для портирования src/icons/index.tsx из RN в mini-app.
// Запускается вручную:  node scripts/convert-icons.mjs
//
// Не часть build-pipeline'а — после однократного прогона результат коммитится
// как обычный TSX-файл, исходник в RN-проекте может меняться независимо.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC = path.resolve(__dirname, '../../src/icons/index.tsx')
const DST = path.resolve(__dirname, '../src/icons/index.tsx')

let s = fs.readFileSync(SRC, 'utf8')

// 1. Удаляем RN-импорты.
s = s.replace(/^import React from 'react';\n/m, '')
s = s.replace(/^import \{ Image, View \} from 'react-native';\n/m, '')
s = s.replace(/^import Svg, \{[\s\S]+?\} from 'react-native-svg';\n/m, '')

// 2. SVG-примитивы: PascalCase → lowercase. Список компонентов получен из
//    grep'а (Circle, Ellipse, Line, Path, Rect, Svg). При добавлении новых
//    в RN-файле — расширить здесь.
const TAGS = ['Svg', 'Path', 'Circle', 'Line', 'Rect', 'Ellipse']
for (const tag of TAGS) {
  const lower = tag.toLowerCase()
  s = s.replace(new RegExp(`<${tag}\\b`, 'g'), `<${lower}`)
  s = s.replace(new RegExp(`</${tag}>`, 'g'), `</${lower}>`)
}

// 3. LogoImage / LogoImageSmall — рукописная замена. RN-вариант использует
//    Image + View + require(); веб — обычный <img> + import.
// Якорь снизу — комментарий-разделитель перед первой иконкой. Так ловим
// весь блок LogoImage + LogoImageSmall, не парясь о `}` внутри типов.
const logoBlockRe = /const LOGO_SRC = require\([\s\S]+?\n\}\n(?=\n\/\/ ── Brain)/
const newLogoBlock = `import LOGO_SRC from './logo.png'

const LOGO_ASPECT = 313 / 158

export function LogoImage({ size = 72, bg = 'transparent' }: { size?: number; bg?: string }) {
  return (
    <div
      style={{
        height: size,
        width: size * LOGO_ASPECT,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={LOGO_SRC}
        alt="Interstellar"
        style={{ height: size, width: size * LOGO_ASPECT, objectFit: 'contain' }}
      />
    </div>
  )
}

export function LogoImageSmall({ size = 30 }: { size?: number }) {
  return <LogoImage size={size} />
}`

if (!logoBlockRe.test(s)) {
  console.error('!! Не нашёл LogoImage-блок для замены — проверь regex.')
  process.exit(1)
}
s = s.replace(logoBlockRe, newLogoBlock)

// 4. Финальная санитарная проверка: не осталось ли RN-маркеров.
const checks = ['react-native', 'react-native-svg', '<Svg', '<Path', '<Circle', '<Line', '<Rect', '<Ellipse', 'require(']
const found = checks.filter((c) => s.includes(c))
if (found.length > 0) {
  console.error('!! В выходе остались RN-маркеры:', found)
  process.exit(1)
}

fs.mkdirSync(path.dirname(DST), { recursive: true })
fs.writeFileSync(DST, s)
console.log(`✓ ${SRC} → ${DST}`)
console.log(`  ${s.split('\n').length} строк, ${s.length} байт`)
