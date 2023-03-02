export interface Random {
    randomElementOf<T>(array: T[]): T

    random(): number
}

export class MathRandom implements Random {
    random(): number {
        return Math.random()
    }

    randomElementOf<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)]
    }
}