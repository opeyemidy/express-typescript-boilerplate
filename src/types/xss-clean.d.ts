declare module "xss-clean" {
    const value: () => (req: unknown, res: unknown, next: unknown) => void

    export default value
}
