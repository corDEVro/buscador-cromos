import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient, StickerCategory } from "../src/generated/prisma/client"
import { WC2026_SPECIALS, WC2026_TEAMS } from "./seed-data"

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

const OPENING_SPECIALS_COUNT = 9

async function main() {
  const album = await prisma.album.upsert({
    where: { slug: "mundial-2026" },
    update: { name: "Mundial FIFA 2026" },
    create: {
      slug: "mundial-2026",
      name: "Mundial FIFA 2026",
      description: "Álbum Panini del Mundial de Fútbol 2026 (980 cromos)",
    },
  })

  await prisma.sticker.deleteMany({ where: { albumId: album.id } })
  await prisma.team.deleteMany({ where: { albumId: album.id } })

  let albumOrder = 0

  const openingSpecials = WC2026_SPECIALS.slice(0, OPENING_SPECIALS_COUNT)
  const historySpecials = WC2026_SPECIALS.slice(OPENING_SPECIALS_COUNT)

  const createSpecial = (code: string, name: string) =>
    prisma.sticker.create({
      data: {
        albumId: album.id,
        code,
        name,
        number: 0,
        category: StickerCategory.SPECIAL,
        albumOrder: albumOrder++,
      },
    })

  for (const special of openingSpecials) {
    await createSpecial(special.code, special.name)
  }

  for (const [teamIndex, team] of WC2026_TEAMS.entries()) {
    const createdTeam = await prisma.team.create({
      data: {
        albumId: album.id,
        name: team.name,
        code: team.code,
        groupCode: team.groupCode,
        order: teamIndex,
      },
    })

    for (const [i, name] of team.stickers.entries()) {
      const number = i + 1
      const isLogo = number === 1
      const isPhoto = number === 13
      const category = isLogo
        ? StickerCategory.LOGO
        : isPhoto
          ? StickerCategory.PHOTO
          : StickerCategory.PLAYER

      await prisma.sticker.create({
        data: {
          albumId: album.id,
          teamId: createdTeam.id,
          code: `${team.code}${number}`,
          name: isLogo ? `Escudo ${team.name}` : isPhoto ? `Equipo ${team.name}` : name,
          number,
          category,
          albumOrder: albumOrder++,
        },
      })
    }
  }

  for (const special of historySpecials) {
    await createSpecial(special.code, special.name)
  }

  const total = await prisma.sticker.count({ where: { albumId: album.id } })
  console.log(`Álbum "${album.name}" listo. ${total} cromos creados.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
