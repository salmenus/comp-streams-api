export interface XmlElement {
    name: string;
    properties?: XmlAttributes;
    children?: XmlElement[];
    textNode?: string | null;
}

export interface ExcelOOXMLTemplate {
    getTemplate(config?: any, idx?: number, currentSheet?: number): XmlElement;
    convertType?(type: string): string;
}

export interface HeaderElement {
    [key: string]: string | undefined;
    version?: string;
    standalone?: string;
    encoding?: string;
}

export interface XmlAttributes {
    prefixedAttributes?: PrefixedXmlAttributes[];
    rawMap?: any;
}

export interface PrefixedXmlAttributes {
    prefix: string;
    map: any;
}

export interface NumberFormat {
    formatCode: string;
    numFmtId: number;
}

export interface ImageColor {
    color: string;
    tint?: number;
    saturation?: number;
}

export interface ImageAnchor {
    row: number;
    col: number;
    offsetX: number;
    offsetY: number;
}

export interface ImageBoxSize {
    from: ImageAnchor;
    to: ImageAnchor;
    height: number;
    width: number;
}

export interface Border {
    style?: string;
    color?: string;
}

export interface BorderSet {
    left?: Border;
    right?: Border;
    top?: Border;
    bottom?: Border;
    diagonal?: Border;
}

export interface StylesMap {
    [key: string]: number;
}

export interface ColorMap {
    [key: string]: string;
}

export interface Fill {
    patternType: string;
    fgTheme?: string;
    fgTint?: string;
    fgRgb?: string;
    bgIndexed?: string;
    bgRgb?: string;
}

export interface ExcelProtection {
    protected: boolean;
    hideFormula: boolean;
}

export interface ExcelAlignment {
    horizontal?: 'Automatic' | 'Left' | 'Center' | 'Right' | 'Fill' | 'Justify' | 'CenterAcrossSelection' | 'Distributed' | 'JustifyDistributed';
    indent?: number;
    readingOrder?: 'RightToLeft' | 'LeftToRight' | 'Context';
    rotate?: number;
    shrinkToFit?: boolean;
    vertical?: 'Automatic' | 'Top' | 'Bottom' | 'Center' | 'Justify' | 'Distributed' | 'JustifyDistributed';
    wrapText?: boolean;
    verticalText?: boolean;
}

export interface ExcelFont {
    bold?: boolean;
    color?: string;
    family?: string;
    fontName?: string;
    italic?: boolean;
    outline?: boolean;
    shadow?: boolean;
    size?: number;
    strikeThrough?: boolean;
    underline?: 'Single' | 'Double';
    verticalAlign?: 'Superscript' | 'Subscript';
    charSet?: number;
}

export interface ExcelThemeFont extends ExcelFont {
    colorTheme?: string;
    scheme?: string;
}
