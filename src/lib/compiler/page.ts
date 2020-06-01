export default interface Page<TDom> {
    readonly resId: string;
    readonly dom: TDom;
}