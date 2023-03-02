export function crossProduct<T1, T2>(xs: T1[], ys: T2[]): [T1, T2][] {
    return xs.flatMap(x =>
        ys.map(y => [x, y] as [T1, T2])
    )
}
