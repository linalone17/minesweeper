declare module '*.scss' {
    const styles: {[className: string]: string};
    export default styles;
}

declare module "*.svg" {
    import React = require("react");
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}