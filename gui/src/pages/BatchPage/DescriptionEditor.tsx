import { serviceQuery, useSignedIn } from "@figurl/interface";
import { FunctionComponent, useCallback } from "react";
import TextEditor from "../TextEditor";
import { useBatch, useBatchTextFile } from "./BatchContext";

type Props = {
    width: number
    height: number
}

const DescriptionEditor: FunctionComponent<Props> = ({ width, height }) => {
    const {batchId, batchConfig} = useBatch()
    const {text, refresh} = useBatchTextFile(batchId, 'description.md')
    const {userId} = useSignedIn()
    const editable = userId && (userId.toString() === (batchConfig?.owner_id || ''))
    const handleSetText = useCallback((text: string) => {
        (async () => {
            const {result} = await serviceQuery('nuat', {
                type: 'set_batch_description',
                batch_id: batchId,
                description: text
            }, {
                includeUserId: true
            })
            if (result.success) {
                refresh()
            }
            else {
                window.alert(`Unable to set description: ${result.error}`)
            }
        })()
    }, [batchId, refresh])
    return (
        <TextEditor
            width={width}
            height={height}
            text={text}
            onSetText={handleSetText}
            language="markdown"
            readOnly={!editable}
            wordWrap={true}
            onReload={refresh}
            label="description.md"
        />
    )
}

export default DescriptionEditor