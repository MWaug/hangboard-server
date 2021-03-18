export function computeWeight(offset: number): number {
    return offset;
}

export function sanitizeEnvVar(s: string | undefined) {
    if(s === undefined) {
        console.log()
        throw new Error(`Environment variable undefined`)
    }
    return s as string;
}