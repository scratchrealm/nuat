import { FunctionComponent, PropsWithChildren, ReactElement } from "react";

type Props = {
    width: number
    height: number
    title: string
}

const titleHeight = 18

const TitledView: FunctionComponent<PropsWithChildren<Props>> = ({width, height, title, children}) => {
    let child: ReactElement | null | undefined
    if (!Array.isArray(children)) {
        child = children as any as ReactElement
    }
    else {
        const ch = children.filter(c => (c !== undefined))
        child = ch[0] as any as ReactElement || null
    }
    if (!child) {
        return <div>No child</div>
    }
    return (
        <div style={{position: 'absolute', width, height}}>
            <div style={{position: 'absolute', top: 0, left: 0, width, height: titleHeight, backgroundColor: '#aaa', color: '#fff', fontSize: 13, paddingLeft: 5}}>{title}</div>
            <div style={{position: 'absolute', top: titleHeight, left: 0, width, height: height - titleHeight}}>
                <child.type {...child.props} width={width} height={height - titleHeight} />
            </div>
        </div>
    )
}

export default TitledView