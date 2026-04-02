import type { TFunction } from 'i18next'

export type GreetingPeriod = 'morning' | 'afternoon' | 'evening'

export function periodFromHour(hour: number): GreetingPeriod {
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function randomGreetingParts(
  t: TFunction,
  period: GreetingPeriod
): { salutation: string; body: string } {
  const salutation = t(`briefing.greeting_${period}_salutation`)
  const lines = t(`briefing.greeting_${period}_lines`, { returnObjects: true }) as unknown
  const arr = Array.isArray(lines) ? (lines as string[]) : []
  const body =
    arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)]! : ''
  return { salutation: String(salutation), body }
}
